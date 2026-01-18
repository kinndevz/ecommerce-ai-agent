import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional, List
from sqlalchemy.orm import Session
from enum import Enum


class StreamEvent(str, Enum):
    """Stream event types"""
    STATUS = "status"
    CONTENT = "content"
    ARTIFACT = "artifact"
    DONE = "done"
    ERROR = "error"


class StreamConfig:
    """Streaming configuration"""
    DEFAULT_CHUNK_SIZE = 50
    DEFAULT_CHUNK_DELAY = 0.02
    MAX_CHUNK_SIZE = 200
    MIN_CHUNK_DELAY = 0.01

    STATUS_THINKING = "thinking"
    STATUS_GENERATING = "generating"
    STATUS_COMPLETE = "complete"

    BOUNDARY_CHARS = {' ', '\n', '\r', '\t', '>', '<', '.', ',', '!', '?'}


class StreamingService:
    """
    Handles streaming of agent responses to client
    Configuration-based, no hardcoded values
    """

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_delay: Optional[float] = None
    ):
        self.chunk_size = chunk_size or StreamConfig.DEFAULT_CHUNK_SIZE
        self.chunk_delay = chunk_delay or StreamConfig.DEFAULT_CHUNK_DELAY

        self.chunk_size = min(self.chunk_size, StreamConfig.MAX_CHUNK_SIZE)
        self.chunk_delay = max(self.chunk_delay, StreamConfig.MIN_CHUNK_DELAY)

    async def stream_response(
        self,
        db: Session,
        user_id: str,
        conversation_id: str,
        message_content: str,
        chat_service: Any,
        auth_token: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream agent response as Server-Sent Events with artifacts support
        """
        try:
            # Initial status
            yield self._create_event(
                StreamEvent.STATUS,
                {
                    "message": StreamConfig.STATUS_THINKING,
                    "stage": "processing"
                }
            )

            # Process message
            response = await chat_service.send_message(
                db=db,
                user_id=user_id,
                conversation_id=conversation_id,
                message_content=message_content,
                auth_token=auth_token
            )

            # Extract artifacts and content
            artifacts = self._extract_artifacts(response)
            content = self._extract_content(response)

            if artifacts:
                for artifact in artifacts:
                    yield self._create_event(
                        StreamEvent.ARTIFACT,
                        {
                            "tool_name": artifact.get("tool_name", "unknown"),
                            "tool_call_id": artifact.get("tool_call_id", ""),
                            "data": artifact.get("data", {}),
                            "success": artifact.get("success", True)
                        }
                    )
                    await asyncio.sleep(0.1)  # Small delay between artifacts

            # STEP 2: Stream text content (if exists)
            if content:
                # Generating status
                yield self._create_event(
                    StreamEvent.STATUS,
                    {
                        "message": StreamConfig.STATUS_GENERATING,
                        "stage": "streaming"
                    }
                )

                # Stream content chunks
                async for chunk in self._chunk_content(content):
                    yield self._create_event(
                        StreamEvent.CONTENT,
                        {"chunk": chunk}
                    )

            # STEP 3: Done event
            yield self._create_event(
                StreamEvent.DONE,
                {
                    "message": StreamConfig.STATUS_COMPLETE,
                    "message_id": self._extract_message_id(response),
                    "conversation_id": self._extract_conversation_id(response),
                    "thread_id": self._extract_thread_id(response),
                    "total_length": len(content) if content else 0,
                    "total_artifacts": len(artifacts)
                }
            )

        except Exception as e:
            print(f"[StreamingService Error] {e}")
            import traceback
            traceback.print_exc()

            yield self._create_event(
                StreamEvent.ERROR,
                {"message": str(e)}
            )

    async def _chunk_content(self, content: str) -> AsyncGenerator[str, None]:
        """Split content into chunks with smart word boundaries"""
        position = 0
        length = len(content)

        while position < length:
            end = min(position + self.chunk_size, length)

            if end < length:
                end = self._find_boundary(content, end, length)

            chunk = content[position:end]
            if chunk:
                yield chunk
                position = end
                await asyncio.sleep(self.chunk_delay)
            else:
                position = end + 1

    def _find_boundary(self, content: str, start: int, max_length: int) -> int:
        """Find next word boundary for clean chunking"""
        search_end = min(start + 20, max_length)

        for i in range(start, search_end):
            if content[i] in StreamConfig.BOUNDARY_CHARS:
                return i + 1

        return start

    def _extract_artifacts(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract artifacts from response

        Artifacts contain structured data from tool executions
        that frontend can render as interactive components
        """
        try:
            message = response.get("data", {}).get("message", {})
            artifacts = message.get("artifacts", [])

            # Also check message_metadata for backward compatibility
            if not artifacts:
                metadata = message.get("message_metadata", {})
                artifacts = metadata.get("artifacts", [])

            return artifacts if isinstance(artifacts, list) else []
        except (AttributeError, TypeError):
            return []

    def _extract_content(self, response: Dict[str, Any]) -> str:
        """Extract content from response"""
        try:
            return response.get("data", {}).get("message", {}).get("content", "")
        except (AttributeError, TypeError):
            return ""

    def _extract_message_id(self, response: Dict[str, Any]) -> Optional[str]:
        """Extract message ID from response"""
        try:
            return response.get("data", {}).get("message", {}).get("id")
        except (AttributeError, TypeError):
            return None

    def _extract_conversation_id(self, response: Dict[str, Any]) -> Optional[str]:
        """Extract conversation ID from response"""
        try:
            return response.get("data", {}).get("conversation_id")
        except (AttributeError, TypeError):
            return None

    def _extract_thread_id(self, response: Dict[str, Any]) -> Optional[str]:
        """Extract thread ID from response"""
        try:
            return response.get("data", {}).get("thread_id")
        except (AttributeError, TypeError):
            return None

    def _create_event(self, event_type: StreamEvent, data: Dict[str, Any]) -> str:
        """Create SSE formatted event"""
        event_data = {
            "type": event_type.value,
            **data
        }
        # Use ensure_ascii=False to properly handle Vietnamese characters
        return f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"


# Singleton
_streaming_instance: Optional[StreamingService] = None


def get_streaming_service(
    chunk_size: Optional[int] = None,
    chunk_delay: Optional[float] = None
) -> StreamingService:
    """Get global StreamingService instance"""
    global _streaming_instance
    if _streaming_instance is None or chunk_size or chunk_delay:
        _streaming_instance = StreamingService(chunk_size, chunk_delay)
    return _streaming_instance

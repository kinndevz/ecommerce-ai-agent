import re
import json
import traceback
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, ValidationError

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_core.tools import BaseTool
from app.core.config import settings
from app.agents.interceptors import inject_auth_token


class ToolMetadata(BaseModel):
    agent: str = "unknown"
    category: str = "general"
    requires_auth: bool = False


class MCPManager:
    """
    Manages MCP connection, partitions tools via Regex metadata, and provides caching.
    """

    _META_PATTERN = re.compile(r"^(\{.*?\})\s*\|\s*(.*)$", re.DOTALL)

    def __init__(self):
        self.server_config = self._build_server_config()
        self.client: Optional[MultiServerMCPClient] = None
        self._tools_map: Dict[str, List[BaseTool]] = {}

    def _build_server_config(self) -> Dict:
        if settings.MCP_SERVER_URL:
            return {
                "main_server": {
                    "transport": "sse",
                    "url": f"{settings.MCP_SERVER_URL}/sse",
                }
            }
        print("⚠️  MCP_SERVER_URL not configured!")
        return {}

    async def get_client(self) -> MultiServerMCPClient:
        if self.client is None:
            if not self.server_config:
                raise ValueError("No MCP server configured.")
            self.client = MultiServerMCPClient(
                self.server_config, tool_interceptors=[inject_auth_token])
            print(f"🔗 MCP Client connected")
        return self.client

    async def get_all_tools(self, force_reload: bool = False) -> List[BaseTool]:
        """
        Get ALL tools from MCP server (Flattened list).
        Supports force_reload to refresh cache from source.
        """
        if not self._tools_map or force_reload:
            await self._refresh_tools()

        # Flatten dictionary values thành 1 list duy nhất
        all_tools = []
        for tools_list in self._tools_map.values():
            all_tools.extend(tools_list)

        return all_tools

    async def get_tools_for_agent(self, agent_name: str) -> List[BaseTool]:
        """
        Get tools specifically assigned to an agent.
        """
        # Nếu chưa có cache, tự động load
        if not self._tools_map:
            await self._refresh_tools()

        tools = self._tools_map.get(agent_name, [])
        print(
            f"   🚀 Agent '{agent_name}' requested -> returning {len(tools)} tool(s)")
        return tools

    async def _refresh_tools(self):
        """
        Internal: Fetch from MCP, Parse Metadata, Update Cache
        """
        client = await self.get_client()
        print("\n🔍 Refreshing tools from MCP server...")

        try:
            raw_tools = await client.get_tools()
            self._tools_map = {}

            for tool in raw_tools:
                # 1. Parse & Clean
                metadata, clean_desc = self._extract_metadata(tool.description)

                # 2. Update Tool (Clean description cho LLM)
                tool.description = clean_desc
                tool.metadata = metadata.model_dump()  # Lưu metadata để dùng nếu cần

                # 3. Grouping
                agent_key = metadata.agent
                if agent_key not in self._tools_map:
                    self._tools_map[agent_key] = []

                self._tools_map[agent_key].append(tool)

            # Debug info
            print(
                f"✅ Tools refreshed & grouped: {list(self._tools_map.keys())}")

        except Exception as e:
            print(f"❌ Failed to refresh tools: {e}")
            traceback.print_exc()

    def _extract_metadata(self, raw_description: str | None) -> tuple[ToolMetadata, str]:
        """
        Regex extraction: Returns (MetadataObject, CleanDescriptionString)
        """
        if not raw_description:
            return ToolMetadata(), ""

        match = self._META_PATTERN.match(raw_description.strip())

        if match:
            json_str, real_desc = match.groups()
            try:
                data = json.loads(json_str)
                return ToolMetadata(**data), real_desc.strip()
            except (json.JSONDecodeError, ValidationError):
                pass  # JSON lỗi -> coi như plain text

        return ToolMetadata(agent="unknown"), raw_description

    async def close(self):
        if self.client:
            await self.client.close()
            self.client = None
            self._tools_map = {}
            print("🔌 MCP connection closed")


mcp_manager = MCPManager()

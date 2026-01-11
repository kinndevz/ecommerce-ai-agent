from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []

        self.active_connections[user_id].append(websocket)
        logger.info(
            f"User {user_id} connected. Total: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                logger.info(
                    f"User {user_id} disconnected. Remaining: {len(self.active_connections[user_id])}")

            if len(self.active_connections[user_id]) == 0:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            disconnected = []

            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send to {user_id}: {e}")
                    disconnected.append(connection)

            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast(self, message: dict, exclude_user: str = None):
        for user_id, connections in self.active_connections.items():
            if exclude_user and user_id == exclude_user:
                continue

            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Broadcast failed for {user_id}: {e}")

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    def get_user_connection_count(self, user_id: str) -> int:
        return len(self.active_connections.get(user_id, []))

    def get_online_users(self) -> List[str]:
        return list(self.active_connections.keys())

    def get_total_connections(self) -> int:
        return sum(len(connections) for connections in self.active_connections.values())


notification_manager = ConnectionManager()

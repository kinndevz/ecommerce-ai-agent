from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base
from app.core.enums import NotificationType


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(String, nullable=True)
    action_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now(
        timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.type} - User: {self.user_id}>"

import pytest
import uuid
from unittest.mock import MagicMock
from sqlalchemy.orm import Session


def make_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def mock_db() -> MagicMock:
    """Mock SQLAlchemy Session, dùng chung cho mọi service test."""
    return MagicMock(spec=Session)


@pytest.fixture
def admin_id() -> str:
    return make_id()


@pytest.fixture
def user_id() -> str:
    return make_id()


@pytest.fixture
def role_id() -> str:
    return make_id()

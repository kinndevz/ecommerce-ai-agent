from typing import Any, Dict, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy.inspection import inspect


def model_to_dict(obj: Any, exclude: List[str] = None) -> Dict:
    """
    Convert SQLAlchemy model to dictionary

    Args:
        obj: SQLAlchemy model instance
        exclude: List of fields to exclude

    Returns:
        Dictionary representation of model
    """
    if exclude is None:
        exclude = []

    result = {}

    # Get columns from SQLAlchemy model
    mapper = inspect(obj.__class__)

    for column in mapper.columns:
        if column.key in exclude:
            continue

        value = getattr(obj, column.key)

        # Convert special types
        if isinstance(value, Decimal):
            result[column.key] = float(value)
        else:
            result[column.key] = value

    return result

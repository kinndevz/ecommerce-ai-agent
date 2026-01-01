from typing import Any, Dict, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy.inspection import inspect


def model_to_dict(obj: Any, exclude: List[str] = None) -> Dict:
    if exclude is None:
        exclude = []

    result = {}

    mapper = inspect(obj.__class__)

    for column in mapper.columns:
        if column.key in exclude:
            continue

        value = getattr(obj, column.key)

        if isinstance(value, Decimal):
            result[column.key] = float(value)
        elif isinstance(value, datetime):
            result[column.key] = value.isoformat()
        elif value is None:
            result[column.key] = None
        else:
            result[column.key] = value

    return result

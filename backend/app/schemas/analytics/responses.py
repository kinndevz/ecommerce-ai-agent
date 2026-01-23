from pydantic import BaseModel
from typing import List


class BaseConfig:
    from_attributes = True


class SalesSummary(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float

    class Config(BaseConfig):
        pass


class SalesTrendPoint(BaseModel):
    date: str
    total_revenue: float
    total_orders: int

    class Config(BaseConfig):
        pass


class TopProductItem(BaseModel):
    product_id: str
    product_name: str
    total_revenue: float
    total_units: int

    class Config(BaseConfig):
        pass


class SalesTrendResponse(BaseModel):
    points: List[SalesTrendPoint]

    class Config(BaseConfig):
        pass


class TopProductsResponse(BaseModel):
    items: List[TopProductItem]

    class Config(BaseConfig):
        pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from contextlib import asynccontextmanager
from app.elastic.controller import init_elasticsearch
from app.core.config import settings
from app.routes import auth, account, users, brands, categories, products, tags, carts, orders
from app.utils.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    integrity_error_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_elasticsearch()

    yield

    print("Server Shutting down...")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
    description="RESTful API for Cosmetic E-commerce Platform",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include routers
app.include_router(auth.router)
app.include_router(account.router)
app.include_router(users.router)
app.include_router(brands.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(tags.router)
app.include_router(carts.router)
app.include_router(orders.router)


@app.get("/")
def root():
    """API Root - Welcome message"""
    return {
        "success": True,
        "message": "Welcome to Cosmetic E-commerce API",
        "data": {
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "API is healthy",
        "data": {
            "status": "ok"
        }
    }

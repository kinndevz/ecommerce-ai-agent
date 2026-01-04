from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import time
from contextlib import asynccontextmanager
from app.elastic.controller import init_elasticsearch
from app.core.config import settings, close_checkpointer
from app.routes import auth, account, users, role, brands, categories, products, tags, carts, orders, chat, media, chat_streaming
from app.utils.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    integrity_error_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)
from app.agents.mcp_manager import mcp_manager
from app.agents.graph import get_agent_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_elasticsearch()
    await mcp_manager.get_all_tools()
    await get_agent_graph()
    yield

    print("Server Shutting down...")
    await mcp_manager.close()
    await close_checkpointer()

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
    # In production, specify exact origins
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    print(f"\n{'='*80}")
    print(f"📥 REQUEST: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time.time() - start_time
    print(f"📤 RESPONSE: {response.status_code} ({process_time:.2f}s)")
    print(f"{'='*80}\n")

    return response

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
app.include_router(role.router)
app.include_router(brands.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(tags.router)
app.include_router(carts.router)
app.include_router(orders.router)
app.include_router(chat.router)
app.include_router(chat_streaming.router)
app.include_router(media.router)


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

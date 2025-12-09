import sys
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from mcp.server.fastmcp import FastMCP

from app.core.config import settings
from app.services.faq import faq_service
from app.services.sync import sync_data_job

sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(server):
    trigger = CronTrigger(hour=0, minute=0)
    scheduler.add_job(sync_data_job, trigger)
    scheduler.start()

    await sync_data_job()
    yield

    scheduler.shutdown()

mcp = FastMCP(settings.PROJECT_NAME, lifespan=lifespan)


@mcp.tool()
async def search_faq(user_query: str) -> str:
    return await faq_service.search(user_query)


@mcp.tool()
async def force_sync_data() -> str:
    """(Admin) Bắt buộc cập nhật dữ liệu ngay lập tức."""
    await sync_data_job()
    return "Đã gửi lệnh cập nhật. Kiểm tra log stderr."

if __name__ == "__main__":
    mcp.run(transport='stdio')

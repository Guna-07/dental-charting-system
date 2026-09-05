from pymongo import AsyncMongoClient
from app.core.config import settings

client: AsyncMongoClient | None = None
db = None


async def connect_to_mongo():
    global client, db
    client = AsyncMongoClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]


async def close_mongo_connection():
    global client
    if client is not None:
        await client.close()


def get_database():
    return db
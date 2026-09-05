from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title="Dental Charting System", lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Dental Charting System API is running"}


@app.get("/health")
async def health_check():
    db = get_database()
    await db.command("ping")
    return {"status": "connected to MongoDB"}
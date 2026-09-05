from fastapi import FastAPI

app = FastAPI(title="Dental Charting System")


@app.get("/")
def root():
    return {"message": "Dental Charting System API is running"}
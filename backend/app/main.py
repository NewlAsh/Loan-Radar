#app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, predict

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loan Default Predictor")

app.include_router(auth.router)
app.include_router(predict.router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"status": "running"}
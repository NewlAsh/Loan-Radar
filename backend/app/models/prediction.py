# app/models/prediction.py
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    revolving_utilization = Column(Float, nullable=False)
    age = Column(Integer, nullable=False)
    past_due_30_59 = Column(Integer, nullable=False)
    debt_ratio = Column(Float, nullable=False)
    monthly_income = Column(Float, nullable=True)          # has nulls in source data
    open_credit_lines = Column(Integer, nullable=False)
    times_90_days_late = Column(Integer, nullable=False)
    real_estate_loans = Column(Integer, nullable=False)
    past_due_60_89 = Column(Integer, nullable=False)
    dependents = Column(Float, nullable=True)               # has nulls in source data

    prediction = Column(Integer, nullable=False)   # 0 or 1
    probability = Column(Float, nullable=False)    # model's confidence
    created_at = Column(DateTime(timezone=True), server_default=func.now())
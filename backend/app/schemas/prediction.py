# app/schemas/prediction.py
from pydantic import BaseModel, Field
from datetime import datetime



class LoanApplicant(BaseModel):
    RevolvingUtilizationOfUnsecuredLines: float = Field(ge=0, le=1, description="Ratio, 0 to 1")
    age: int = Field(ge=18, le=100)
    NumberOfTime30_59DaysPastDueNotWorse: int = Field(ge=0)
    DebtRatio: float = Field(ge=0)
    MonthlyIncome: float | None = Field(default=None, ge=0)
    NumberOfOpenCreditLinesAndLoans: int = Field(ge=0)
    NumberOfTimes90DaysLate: int = Field(ge=0)
    NumberRealEstateLoansOrLines: int = Field(ge=0)
    NumberOfTime60_89DaysPastDueNotWorse: int = Field(ge=0)
    NumberOfDependents: float | None = Field(default=None, ge=0)


class PredictionOut(BaseModel):
    prediction: int
    probability: float

    class Config:
        from_attributes = True


class PredictionHistoryOut(BaseModel):
    id: int
    revolving_utilization: float
    age: int
    past_due_30_59: int
    debt_ratio: float
    monthly_income: float | None
    open_credit_lines: int
    times_90_days_late: int
    real_estate_loans: int
    past_due_60_89: int
    dependents: float | None
    prediction: int
    probability: float
    created_at: datetime

    class Config:
        from_attributes = True
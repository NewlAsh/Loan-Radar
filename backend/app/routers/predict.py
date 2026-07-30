# app/routers/predict.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import LoanApplicant, PredictionOut
from app.ml.model import predict
from app.schemas.prediction import LoanApplicant, PredictionOut, PredictionHistoryOut


router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", response_model=PredictionOut)
def predict_loan(
    applicant: LoanApplicant,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # translate Pydantic (underscore) field names -> model's hyphenated feature names
    model_input = {
        "RevolvingUtilizationOfUnsecuredLines": applicant.RevolvingUtilizationOfUnsecuredLines,
        "age": applicant.age,
        "NumberOfTime30-59DaysPastDueNotWorse": applicant.NumberOfTime30_59DaysPastDueNotWorse,
        "DebtRatio": applicant.DebtRatio,
        "MonthlyIncome": applicant.MonthlyIncome,
        "NumberOfOpenCreditLinesAndLoans": applicant.NumberOfOpenCreditLinesAndLoans,
        "NumberOfTimes90DaysLate": applicant.NumberOfTimes90DaysLate,
        "NumberRealEstateLoansOrLines": applicant.NumberRealEstateLoansOrLines,
        "NumberOfTime60-89DaysPastDueNotWorse": applicant.NumberOfTime60_89DaysPastDueNotWorse,
        "NumberOfDependents": applicant.NumberOfDependents,
    }

    pred, proba = predict(model_input)

    record = Prediction(
        user_id=current_user.id,
        revolving_utilization=applicant.RevolvingUtilizationOfUnsecuredLines,
        age=applicant.age,
        past_due_30_59=applicant.NumberOfTime30_59DaysPastDueNotWorse,
        debt_ratio=applicant.DebtRatio,
        monthly_income=applicant.MonthlyIncome,
        open_credit_lines=applicant.NumberOfOpenCreditLinesAndLoans,
        times_90_days_late=applicant.NumberOfTimes90DaysLate,
        real_estate_loans=applicant.NumberRealEstateLoansOrLines,
        past_due_60_89=applicant.NumberOfTime60_89DaysPastDueNotWorse,
        dependents=applicant.NumberOfDependents,
        prediction=pred,
        probability=proba,
    )
    db.add(record)
    db.commit()

    return {"prediction": pred, "probability": proba}


@router.get("/history", response_model=list[PredictionHistoryOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return records
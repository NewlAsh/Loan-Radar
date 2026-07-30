# app/ml/model.py
import joblib
import pandas as pd

MODEL_PATH = "loan_default_model.joblib"
model = joblib.load(MODEL_PATH)

FEATURE_ORDER = list(model.feature_names_in_)


def predict(applicant: dict) -> tuple[int, float]:
    row = pd.DataFrame([applicant], columns=FEATURE_ORDER)
    row = row.apply(pd.to_numeric, errors="coerce")  # force numeric dtype
    row = row.fillna(row.median(numeric_only=True))   # or fillna(0) if you prefer
    pred = int(model.predict(row)[0])
    proba = float(model.predict_proba(row)[0][1])
    return pred, proba
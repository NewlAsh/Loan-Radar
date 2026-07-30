# Loan Radar

A FastAPI backend that predicts the probability of loan default from an applicant's credit profile, backed by a trained machine learning classifier. Built as a learning project to practice production-shaped backend patterns: JWT auth, request validation, and serving a serialized ML model behind a REST API.

## Overview

Users register and authenticate, submit an applicant's credit details, and receive a model-scored default probability along with a binary risk flag. Every prediction is persisted against the requesting user, so past predictions can be retrieved as a history.

## Model

The prediction engine is a machine learning classifier trained to estimate the probability that a loan applicant will experience serious financial delinquency — defined as 90 or more days past due on a credit obligation — within a two-year horizon.

### Dataset

The model is trained on the ["Give Me Some Credit"](https://www.kaggle.com/c/GiveMeSomeCredit) dataset, comprising 150,000 anonymized borrower records. Each record captures a snapshot of an individual's credit utilization, payment history, income, and existing debt obligations at a point in time, paired with a ground-truth label indicating whether that individual went on to default.

### Input features

The model consumes ten features spanning three broad categories of credit risk signal.

**Credit utilization & debt**

| Feature | Description |
|---|---|
| `RevolvingUtilizationOfUnsecuredLines` | Ratio of total credit card/line balances to credit limits |
| `DebtRatio` | Monthly debt payments as a proportion of monthly gross income |

**Payment history**

| Feature | Description |
|---|---|
| `NumberOfTime30-59DaysPastDueNotWorse` | Count of 30–59 day delinquencies |
| `NumberOfTime60-89DaysPastDueNotWorse` | Count of 60–89 day delinquencies |
| `NumberOfTimes90DaysLate` | Count of 90+ day delinquencies |

**Financial profile**

| Feature | Description |
|---|---|
| `age` | Applicant's age |
| `MonthlyIncome` | Monthly income |
| `NumberOfOpenCreditLinesAndLoans` | Number of active credit lines and loans |
| `NumberRealEstateLoansOrLines` | Number of mortgage or real estate loans |
| `NumberOfDependents` | Number of financial dependents |

Together, these features capture both an applicant's current debt burden and their historical repayment behavior — the two strongest conventional predictors of future default risk.

### Output

For each applicant, the model returns:

- **A binary classification** — `0` (low risk) or `1` (high risk of default)
- **A probability score** (0 to 1) — the model's underlying confidence, allowing consumers of the API to apply their own risk thresholds rather than relying solely on the binary cutoff

### Serving

The trained model is serialized using `joblib` and loaded once into memory at application startup, rather than per-request — minimizing inference latency and avoiding repeated disk I/O. Feature ordering is read dynamically from the model's own metadata (`feature_names_in_`), ensuring the serving pipeline stays consistent with the exact schema the model was trained on, even across future model updates.

## Tech stack

- **FastAPI** — API framework
- **SQLAlchemy** — ORM / database layer
- **Pydantic** — request/response validation
- **python-jose** — JWT issuing and verification
- **passlib (bcrypt)** — password hashing
- **scikit-learn + joblib** — model training and serialization

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create an account, returns an access token |
| `POST` | `/auth/login` | — | Log in, returns an access token |
| `POST` | `/predict` | Bearer token | Score an applicant, returns prediction + probability |
| `GET` | `/predict/history` | Bearer token | List the current user's past predictions |

## Setup

```bash
git clone https://github.com/NewlAsh/Loan-Radar.git
cd Loan-Radar

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
DATABASE_URL=sqlite:///./loan_radar.db  (for local device runtime)
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run the server:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

## Disclaimer

This project is for educational purposes. Predictions are statistical estimates from a model trained on historical data — not financial advice, and not a substitute for an actual lending decision.

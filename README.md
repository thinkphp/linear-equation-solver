# Linear Equation Solver

A full-stack application for solving the equation `a * x + b = 0`. The interface is built with React and Vite, and the API uses FastAPI.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`; interactive documentation is available at `http://localhost:8000/docs`.

## Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the address shown by Vite (by default, `http://localhost:5173`). To use a different API URL, set `VITE_API_URL` in `frontend/.env`.

## Backend tests

```bash
cd backend
python3 -m unittest discover -s tests -v
```

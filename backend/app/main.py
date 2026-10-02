import math
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, field_validator


class EquationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    a: float
    b: float

    @field_validator("a", "b")
    @classmethod
    def coefficients_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("Coefficients must be finite numbers.")
        return value


class EquationResult(BaseModel):
    kind: Literal["unique", "infinite", "none"]
    x: float | None = None


def solve_linear(a: float, b: float) -> EquationResult:
    """Solve the equation a * x + b = 0."""
    if a != 0.0:
        x = -b / a
        if not math.isfinite(x):
            raise ValueError("The solution cannot be represented as a finite number.")
        return EquationResult(kind="unique", x=0.0 if x == 0.0 else x)
    if b == 0.0:
        return EquationResult(kind="infinite")
    return EquationResult(kind="none")


app = FastAPI(
    title="Linear Equation Solver",
    description="Solve the linear equation a * x + b = 0.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, error: RequestValidationError
) -> JSONResponse:
    details = [
        {"loc": issue["loc"], "msg": issue["msg"], "type": issue["type"]}
        for issue in error.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": details})


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/solve", response_model=EquationResult)
def solve_equation(equation: EquationInput) -> EquationResult:
    try:
        return solve_linear(equation.a, equation.b)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

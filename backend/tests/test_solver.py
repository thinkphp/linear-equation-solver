import unittest

from fastapi.testclient import TestClient

from app.main import app, solve_linear


class SolveLinearTests(unittest.TestCase):
    def test_unique_solution(self) -> None:
        result = solve_linear(2.0, -6.0)
        self.assertEqual(result.kind, "unique")
        self.assertEqual(result.x, 3.0)

    def test_negative_solution(self) -> None:
        result = solve_linear(2.0, 6.0)
        self.assertEqual(result.kind, "unique")
        self.assertEqual(result.x, -3.0)

    def test_zero_coefficient_and_zero_constant_have_infinite_solutions(self) -> None:
        self.assertEqual(solve_linear(0.0, 0.0).kind, "infinite")
        self.assertEqual(solve_linear(-0.0, -0.0).kind, "infinite")

    def test_zero_coefficient_and_nonzero_constant_have_no_solution(self) -> None:
        self.assertEqual(solve_linear(0.0, 5.0).kind, "none")

    def test_small_nonzero_coefficient_is_not_treated_as_zero(self) -> None:
        result = solve_linear(1e-300, -1e-300)
        self.assertEqual(result.kind, "unique")
        self.assertEqual(result.x, 1.0)


class SolveEndpointTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_returns_unique_solution(self) -> None:
        response = self.client.post("/solve", json={"a": 2, "b": -6})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"kind": "unique", "x": 3.0})

    def test_returns_infinite_solutions(self) -> None:
        response = self.client.post("/solve", json={"a": 0, "b": 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"kind": "infinite", "x": None})

    def test_rejects_non_finite_coefficients(self) -> None:
        response = self.client.post("/solve", content='{"a": NaN, "b": 1}')
        self.assertEqual(response.status_code, 422)

    def test_rejects_solution_outside_finite_range(self) -> None:
        response = self.client.post("/solve", json={"a": 1e-308, "b": 1e308})
        self.assertEqual(response.status_code, 422)

    def test_rejects_unexpected_fields(self) -> None:
        response = self.client.post("/solve", json={"a": 1, "b": 2, "c": 3})
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

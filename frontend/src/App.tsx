import { FormEvent, useState } from "react";

type EquationResult =
  | { kind: "unique"; x: number }
  | { kind: "infinite"; x: null }
  | { kind: "none"; x: null };

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
}

function App() {
  const [a, setA] = useState("2");
  const [b, setB] = useState("-6");
  const [result, setResult] = useState<EquationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const coefficientA = Number(a);
    const coefficientB = Number(b);
    if (a.trim() === "" || b.trim() === "") {
      setError("Enter both coefficients to continue.");
      return;
    }
    if (!Number.isFinite(coefficientA) || !Number.isFinite(coefficientB)) {
      setError("Enter finite numeric values for a and b.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: coefficientA, b: coefficientB }),
      });
      if (!response.ok) {
        throw new Error(
          response.status === 422
            ? "The entered coefficients are invalid."
            : "The server could not solve the equation.",
        );
      }
      setResult((await response.json()) as EquationResult);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not connect to the server. Check that the FastAPI backend is running."
          : requestError instanceof Error
            ? requestError.message
            : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Home">
          <span className="brand-mark">∑</span>
          <span>Math<span className="brand-light">space</span></span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> Solver online</span>
      </header>

      <section className="workspace" aria-labelledby="page-title">
        <div className="intro">
          <span className="eyebrow">ALGEBRA · FUNDAMENTALS</span>
          <h1 id="page-title">Solve a linear<br /><span>equation.</span></h1>
          <p>Enter the coefficients to find the solution instantly.</p>
        </div>

        <div className="solver-card">
          <div className="card-heading">
            <div>
              <span className="section-label">YOUR EQUATION</span>
              <p className="equation" aria-label="a times x plus b equals zero">
                a <span>·</span> x <span>+</span> b <span>=</span> 0
              </p>
            </div>
            <span className="formula-icon" aria-hidden="true">ƒx</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="fields">
              <label className="field">
                <span className="field-name">Coefficient a</span>
                <span className="input-wrap">
                  <span className="input-symbol">a</span>
                  <input
                    aria-label="Coefficient a"
                    type="number"
                    step="any"
                    value={a}
                    onChange={(event) => setA(event.target.value)}
                    placeholder="e.g. 2"
                  />
                </span>
              </label>
              <label className="field">
                <span className="field-name">Coefficient b</span>
                <span className="input-wrap">
                  <span className="input-symbol">b</span>
                  <input
                    aria-label="Coefficient b"
                    type="number"
                    step="any"
                    value={b}
                    onChange={(event) => setB(event.target.value)}
                    placeholder="e.g. -6"
                  />
                </span>
              </label>
            </div>

            <p className="helper-text">Use a dot for decimals, for example 2.5.</p>
            <button className="solve-button" type="submit" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Solve equation"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          {error && (
            <div className="message error-message" role="alert">
              <span aria-hidden="true">!</span>{error}
            </div>
          )}

          {result && (
            <div className={`result-panel result-${result.kind}`} aria-live="polite">
              <div className="result-icon" aria-hidden="true">
                {result.kind === "unique" ? "✓" : result.kind === "infinite" ? "∞" : "—"}
              </div>
              <div>
                <span className="section-label">RESULT</span>
                {result.kind === "unique" ? (
                  <p className="result-value">x = {formatNumber(result.x)}</p>
                ) : (
                  <p className="result-value">
                    {result.kind === "infinite"
                      ? "Infinitely many solutions"
                      : "No solutions"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tip">
          <span className="tip-icon" aria-hidden="true">i</span>
          <p><strong>Tip:</strong> If a = 0, the equation may have infinitely many or no solutions.</p>
        </div>
      </section>

      <footer className="footer">
        <span>A small step toward clarity.</span>
        <span>Made for learning <span aria-hidden="true">✳</span></span>
      </footer>
    </main>
  );
}

export default App;

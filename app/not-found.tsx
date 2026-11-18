import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="docs-layout"
      style={{
        minHeight: "80vh",
        display: "grid",
        alignContent: "center",
        textAlign: "center",
      }}
    >
      <div className="eyebrow">NEXUS ENGINE · 404</div>
      <h1>Page not found.</h1>
      <p className="subtitle" style={{ margin: "0 auto" }}>
        This route does not exist in the current Alpha build.
      </p>
      <div style={{ marginTop: 24 }}>
        <Link className="btn primary" href="/">Return to projects</Link>{" "}
        <Link className="btn" href="/doc">Open docs</Link>
      </div>
    </main>
  );
}

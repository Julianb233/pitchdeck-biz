import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        background: "#09090b",
        color: "#fafafa",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem", fontWeight: 800 }}>
          404
        </h1>
        <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            padding: "0.625rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            color: "white",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            background:
              "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
            boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

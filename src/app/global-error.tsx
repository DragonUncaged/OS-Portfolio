"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#06070a",
          color: "#fff",
          font: "16px/1.5 system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <title>Something went wrong</title>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ margin: "12px 0 0", color: "rgb(255 255 255 / 0.6)" }}>The portfolio could not start.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 28,
              height: 40,
              padding: "0 20px",
              border: "1px solid rgb(255 255 255 / 0.2)",
              borderRadius: 999,
              background: "none",
              color: "inherit",
              font: "inherit",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

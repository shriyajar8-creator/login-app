import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ margin: 0, color: "#4dd5ff", fontWeight: 700 }}>HR Leave Manager</p>
            <h1 style={{ margin: "12px 0", fontSize: "3rem", lineHeight: 1.05 }}>
              Manage employee leave with confidence and clarity.
            </h1>
            <p style={{ maxWidth: 650, margin: "20px 0", color: "#475569", fontSize: "1.1rem", lineHeight: 1.8 }}>
              Build a professional leave management workflow for your team. Track employees, approve requests, and review HR metrics from a single dashboard.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/signup")}
                style={{ padding: "14px 26px", borderRadius: "12px", border: "none", backgroundColor: "#4dd5ff", color: "white", cursor: "pointer", fontWeight: 700 }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "14px 26px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "white", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}
              >
                Login
              </button>
            </div>
          </div>

          <div style={{ minWidth: 340, backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 25px 65px rgba(15,23,42,0.08)" }}>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Key benefits</h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 20, display: "grid", gap: 16 }}>
              <li style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 16 }}>
                <strong>Central employee registry</strong>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>Save employee profiles, department, and role details.</p>
              </li>
              <li style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 16 }}>
                <strong>Leave approvals made easy</strong>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>Approve or reject leave requests with a clean interface.</p>
              </li>
              <li style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 16 }}>
                <strong>Real-time HR metrics</strong>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>Track pending, approved, and on-leave metrics instantly.</p>
              </li>
            </ul>
          </div>
        </header>

        <section style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { title: "Employee tracking", description: "Organize your workforce dataset with department and role details." },
            { title: "Leave workflows", description: "Streamline requests from submission to approval." },
            { title: "Permission roles", description: "Admin-only workflows keep HR controls secure." },
          ].map((card) => (
            <div key={card.title} style={{ backgroundColor: "white", borderRadius: 20, padding: 24, boxShadow: "0 20px 60px rgba(15, 23, 42, 0.06)" }}>
              <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>{card.title}</h3>
              <p style={{ margin: 0, color: "#475569" }}>{card.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Landing;

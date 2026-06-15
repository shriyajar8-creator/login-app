import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Team";
  const userRole = localStorage.getItem("userRole") || "employee";
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (data.success) setNotifications(data.notifications);
      } catch (e) {
        // ignore
      }
    };
    fetchNotifications();
  }, []);

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #ececec",
        padding: "15px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        flexWrap: "wrap",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            backgroundColor: "#4dd5ff",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: "900",
          }}
        >
          HR
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>HR Leave Manager</div>
          <div style={{ color: "#606f7b", fontSize: "0.85rem" }}>Professional employee leave management</div>
        </div>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
        <Link to="/dashboard" style={{ color: "#1f2937", textDecoration: "none", fontWeight: 600 }}>
          Dashboard
        </Link>
        {userRole === "admin" && (
          <Link to="/employees" style={{ color: "#1f2937", textDecoration: "none", fontWeight: 600 }}>
            Employees
          </Link>
        )}
        <Link to="/leaves" style={{ color: "#1f2937", textDecoration: "none", fontWeight: 600 }}>
          Leave Requests
        </Link>
        <Link to="/notifications" style={{ color: "#1f2937", textDecoration: "none", fontWeight: 600, position: "relative" }}>
          Notifications
          {notifications.filter((n) => !n.read).length > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                background: "#ef4444",
                color: "white",
                borderRadius: 999,
                padding: "2px 6px",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </Link>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#334155", fontWeight: 600 }}>Hello, {userName}</div>
          <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{userRole === "admin" ? "Admin" : "Employee"}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            backgroundColor: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;

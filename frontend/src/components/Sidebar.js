import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole") || "employee";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "employee", "manager", "hr"] },
    { path: "/admin", label: "Admin", icon: "🛡️", roles: ["admin"] },
    { path: "/employees", label: "Employees", icon: "👥", roles: ["admin", "manager", "hr"] },
    { path: "/leaves", label: "Leave Requests", icon: "📋", roles: ["admin", "employee", "manager", "hr"] },
    { path: "/assets", label: "Assets", icon: "🏷️", roles: ["admin", "manager"] },
    { path: "/reports", label: "Reports", icon: "📈", roles: ["admin", "manager"] },
    { path: "/notifications", label: "Notifications", icon: "🔔", roles: ["admin", "employee", "manager", "hr"] },
    { path: "/profile", label: "My Profile", icon: "👤", roles: ["admin", "employee", "manager", "hr"] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      style={{
        width: isCollapsed ? "80px" : "280px",
        backgroundColor: "#1e293b",
        minHeight: "100vh",
        padding: "20px 0",
        transition: "width 0.3s ease",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto",
        borderRight: "1px solid #334155",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: isCollapsed ? "15px 10px" : "15px 20px",
          borderBottom: "1px solid #334155",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            backgroundColor: "#06b6d4",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: "900",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          HR
        </div>
        {!isCollapsed && (
          <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>HRMS</div>
        )}
      </div>

      {/* Menu Items */}
      <nav>
        {filteredMenu.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              width: "100%",
              padding: isCollapsed ? "15px 10px" : "15px 20px",
              border: "none",
              backgroundColor: isActive(item.path) ? "#0f766e" : "transparent",
              color: isActive(item.path) ? "#06b6d4" : "#cbd5e1",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: isActive(item.path) ? "600" : "500",
              transition: "all 0.2s ease",
              borderLeft: isActive(item.path) ? "4px solid #06b6d4" : "4px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingLeft: isActive(item.path) ? (isCollapsed ? "6px" : "16px") : isCollapsed ? "10px" : "20px",
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = "#334155";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Button */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: isCollapsed ? "8px" : "20px",
          width: isCollapsed ? "64px" : "240px",
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: "100%",
            padding: "12px 15px",
            border: "1px solid #334155",
            backgroundColor: "#0f172a",
            color: "#06b6d4",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            transition: "all 0.2s ease",
          }}
        >
          {isCollapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

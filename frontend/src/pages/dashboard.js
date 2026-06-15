import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTime, setRefreshTime] = useState(new Date());
  const userName = localStorage.getItem("userName") || "Team";
  const userRole = localStorage.getItem("userRole") || "employee";

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(() => {
      loadMetrics();
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const [employeeResponse, leaveResponse, assetResponse] = await Promise.all([
        api.get("/api/employees"),
        api.get("/api/leaves"),
        api.get("/api/assets"),
      ]);

      if (employeeResponse.data.success) {
        setEmployees(employeeResponse.data.employees);
      }
      if (leaveResponse.data.success) {
        setLeaves(leaveResponse.data.leaves);
      }
      if (assetResponse.data.success) {
        setAssets(assetResponse.data.assets);
      }
    } catch (error) {
      console.error("Dashboard load error", error);
    } finally {
      setIsLoading(false);
    }
  };


  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  const approvedLeaves = leaves.filter(l => l.status === "approved").length;
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === "available").length;

  const today = new Date();
  const onLeaveToday = leaves.filter(leave => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    return leave.status === "approved" && start <= today && end >= today;
  }).length;

  const recentEmployees = employees.slice(0, 8);
  const recentLeaves = leaves.slice(0, 5);

  const departmentCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || "Other";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const departmentEntries = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDeptCount = Math.max(...departmentEntries.map(([, count]) => count), 1);

  const leaveStatusCounts = {
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  const assetStatusCounts = {
    available: assets.filter(a => a.status === "available").length,
    assigned: assets.filter(a => a.status === "assigned").length,
  };

  const StatCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${color}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase" }}>
            {title}
          </p>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "32px", fontWeight: "700" }}>{value}</h3>
          {subtitle && (
            <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{subtitle}</p>
          )}
        </div>
        <span style={{ fontSize: "32px" }}>{icon}</span>
      </div>
    </div>
  );

  const totalRequests = leaves.length;
  const pending = leaves.filter((leave) => leave.status === "pending").length;
  const approved = leaves.filter((leave) => leave.status === "approved").length;
  const rejected = leaves.filter((leave) => leave.status === "rejected").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ marginBottom: "5px", color: "#0f172a", fontSize: "28px" }}>👋 Welcome, {userName.split(" ")[0]}</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Last updated: {refreshTime.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={loadMetrics}
            style={{
              padding: "10px 20px",
              backgroundColor: "#06b6d4",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            🔄 Refresh Now
          </button>
        </div>

        {isLoading && employees.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <p style={{ fontSize: "16px" }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <StatCard
                title="Total Employees"
                value={totalEmployees}
                subtitle={`${activeEmployees} active`}
                icon="👥"
                color="#06b6d4"
                onClick={() => navigate("/employees")}
              />
              <StatCard
                title="Leave Requests"
                value={totalLeaves}
                subtitle={`${pendingLeaves} pending • ${approvedLeaves} approved`}
                icon="📋"
                color="#f59e0b"
                onClick={() => navigate("/leaves")}
              />
              <StatCard
                title="Company Assets"
                value={totalAssets}
                subtitle={`${availableAssets} available`}
                icon="🏷️"
                color="#8b5cf6"
                onClick={() => navigate("/assets")}
              />
              <StatCard
                title="On Leave Today"
                value={onLeaveToday}
                subtitle="employees"
                icon="✈️"
                color="#ec4899"
              />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Real-time Employee Data */}
              <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: "700" }}>
                    👥 Employee Directory
                  </h2>
                  <span style={{ fontSize: "12px", color: "#64748b", backgroundColor: "#f1f5f9", padding: "4px 12px", borderRadius: "6px" }}>
                    Real-time
                  </span>
                </div>
                <div style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0 }}>
                        <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Name</th>
                        <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Email</th>
                        <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Department</th>
                        <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEmployees.map((emp, idx) => (
                        <tr key={emp.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "white" : "#f8fafc" }}>
                          <td style={{ padding: "15px", color: "#0f172a", fontWeight: "500" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  backgroundColor: "#06b6d4",
                                  display: "grid",
                                  placeItems: "center",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                }}
                              >
                                {emp.name.charAt(0)}
                              </div>
                              {emp.name}
                            </div>
                          </td>
                          <td style={{ padding: "15px", color: "#64748b", fontSize: "13px" }}>{emp.email}</td>
                          <td style={{ padding: "15px", color: "#64748b", fontSize: "13px" }}>{emp.department || "—"}</td>
                          <td style={{ padding: "15px" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                backgroundColor: emp.status === "active" ? "#dcfce7" : "#fee2e2",
                                color: emp.status === "active" ? "#166534" : "#991b1b",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentEmployees.length === 0 && (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                      No employees found
                    </div>
                  )}
                </div>
                {employees.length > 8 && (
                  <div style={{ padding: "15px", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
                    <button
                      onClick={() => navigate("/employees")}
                      style={{
                        color: "#06b6d4",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      View all {employees.length} employees →
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Leaves */}
              <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: "700" }}>
                    📋 Recent Leaves
                  </h2>
                </div>
                <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px" }}>
                  {recentLeaves.length > 0 ? (
                    <div style={{ padding: "15px", display: "grid", gap: "12px" }}>
                      {recentLeaves.map(leave => (
                        <div
                          key={leave.id}
                          style={{
                            padding: "12px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            borderLeft: `3px solid ${
                              leave.status === "pending"
                                ? "#f59e0b"
                                : leave.status === "approved"
                                ? "#10b981"
                                : "#ef4444"
                            }`,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
                            <p style={{ margin: 0, color: "#0f172a", fontWeight: "600", fontSize: "13px" }}>
                              {leave.employee?.name || "Employee"}
                            </p>
                            <span
                              style={{
                                padding: "2px 8px",
                                backgroundColor:
                                  leave.status === "pending"
                                    ? "#fef3c7"
                                    : leave.status === "approved"
                                    ? "#dcfce7"
                                    : "#fee2e2",
                                color:
                                  leave.status === "pending"
                                    ? "#92400e"
                                    : leave.status === "approved"
                                    ? "#166534"
                                    : "#991b1b",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              {leave.status}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>
                            {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                      No leave requests
                    </div>
                  )}
                </div>
                <div style={{ padding: "15px", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
                  <button
                    onClick={() => navigate("/leaves")}
                    style={{
                      color: "#06b6d4",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    View all →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Quick Actions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                <button
                  onClick={() => navigate("/profile")}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#0f172a",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9";
                  }}
                >
                  👤 View Profile
                </button>
                {(userRole === "admin" || userRole === "manager") && (
                  <>
                    <button
                      onClick={() => navigate("/employees")}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#0f172a",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e2e8f0";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f1f5f9";
                      }}
                    >
                      👥 Manage Employees
                    </button>
                    <button
                      onClick={() => navigate("/reports")}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#0f172a",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e2e8f0";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f1f5f9";
                      }}
                    >
                      📈 View Reports
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate("/leaves")}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#0f172a",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9";
                  }}
                >
                  📋 Leave Requests
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

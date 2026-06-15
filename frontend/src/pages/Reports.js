import { useEffect, useState } from "react";
import api from "../utils/api";

function Reports() {
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState("employees");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, employeesRes] = await Promise.all([
        api.get("/api/reports/summary"),
        api.get("/api/employees"),
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
      }
      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.employees);
      }
    } catch (error) {
      console.error("Failed to load reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/reports/export/${exportType}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${exportType}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export report");
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderTop: `4px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px", marginBottom: "8px" }}>{title}</p>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "32px", fontWeight: "700" }}>{value}</h3>
        </div>
        <span style={{ fontSize: "32px" }}>{icon}</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "30px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ marginBottom: "5px", color: "#0f172a" }}>Reports & Analytics</h1>
        <p style={{ color: "#64748b" }}>View comprehensive HR metrics and export data</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading reports...</div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <StatCard title="Total Employees" value={summary.employeeCount} icon="👥" color="#06b6d4" />
              <StatCard title="Total Leave Requests" value={summary.leaveCount} icon="📋" color="#f59e0b" />
              <StatCard title="Approved Leaves" value={summary.approvedLeaves} icon="✅" color="#10b981" />
              <StatCard title="Company Assets" value={summary.assetCount} icon="🏷️" color="#8b5cf6" />
              <StatCard title="Assets Assigned" value={summary.assignedAssets} icon="✔️" color="#ec4899" />
            </div>
          )}

          {/* Export Section */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#0f172a" }}>Export Data</h3>
            <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                style={{
                  padding: "10px 15px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <option value="employees">Employees Report</option>
                <option value="leaves">Leave Requests Report</option>
                <option value="assets">Assets Report</option>
              </select>
              <button
                onClick={handleExport}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#06b6d4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                📥 Download CSV
              </button>
            </div>
          </div>

          {/* Employee List */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Employee Directory</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Name
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Email
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Department
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={emp.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "white" : "#f8fafc" }}>
                      <td style={{ padding: "15px", color: "#0f172a", fontWeight: "500" }}>{emp.name}</td>
                      <td style={{ padding: "15px", color: "#64748b" }}>{emp.email}</td>
                      <td style={{ padding: "15px", color: "#64748b" }}>{emp.department || "N/A"}</td>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, leaves: 0, assets: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0 });
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadAdminData();
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const { data } = await api.get("/api/auth/profile");
      if (data.success) setProfile(data.profile);
    } catch (e) {
      // ignore
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [empRes, leaveRes, assetRes] = await Promise.all([
        api.get("/api/employees"),
        api.get("/api/leaves"),
        api.get("/api/assets"),
      ]);

      const empList = empRes.data.employees || [];
      const leaveList = leaveRes.data.leaves || [];
      const assetList = assetRes.data.assets || [];

      setEmployees(empList.slice(0, 5));
      setLeaves(leaveList);
      setStats({
        employees: empList.length,
        leaves: leaveList.length,
        assets: assetList.length,
        pendingLeaves: leaveList.filter((l) => l.status === "pending").length,
        approvedLeaves: leaveList.filter((l) => l.status === "approved").length,
        rejectedLeaves: leaveList.filter((l) => l.status === "rejected").length,
      });
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/api/leaves/${id}/status`, { status });
      if (data.success) {
        setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update leave status");
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: 24 }}>Admin Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>System overview and management center</p>
        </div>
        <button onClick={loadAdminData} style={{ padding: "10px 18px", borderRadius: 8, background: "#06b6d4", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>Refresh</button>
      </div>

      {profile && (
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Admin Profile</h3>
          <p style={{ margin: 0, color: "#334155" }}><strong>Name:</strong> {profile.name}</p>
          <p style={{ margin: "4px 0 0", color: "#334155" }}><strong>Email:</strong> {profile.email}</p>
          <p style={{ margin: "4px 0 0", color: "#334155" }}><strong>Role:</strong> {profile.role}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate("/employees")}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px", marginRight: "8px" }}>👥</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>View All Employees</span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Browse, search, and manage employee records
          </p>
        </button>

        <button
          onClick={() => navigate("/employees")}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px", marginRight: "8px" }}>➕</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>Add New Employee</span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Create a new employee record
          </p>
        </button>

        <button
          onClick={() => navigate("/leaves")}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px", marginRight: "8px" }}>📋</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>Manage Leave Requests</span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            View, approve, or cancel leave requests
          </p>
        </button>

        <button
          onClick={() => navigate("/assets")}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px", marginRight: "8px" }}>🏷️</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>Manage Assets</span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Track and assign company assets
          </p>
        </button>

        <button
          onClick={() => navigate("/reports")}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px", marginRight: "8px" }}>📈</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>View Reports</span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Generate and export system reports
          </p>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <Stat title="Employees" value={stats.employees} icon="👥" />
        <Stat title="Leaves" value={stats.leaves} icon="📋" />
        <Stat title="Assets" value={stats.assets} icon="🏷️" />
        <Stat title="Pending" value={stats.pendingLeaves} icon="⏳" />
        <Stat title="Approved" value={stats.approvedLeaves} icon="✅" />
        <Stat title="Rejected" value={stats.rejectedLeaves} icon="❌" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card title="Latest Employees">
          {employees.length === 0 ? <Empty /> : employees.map((emp) => (
            <Row key={emp.id}>
              <div>
                <Name>{emp.name}</Name>
                <Sub>{emp.department || "—"} • {emp.designation || "—"}</Sub>
              </div>
              <Badge>{emp.status || "active"}</Badge>
            </Row>
          ))}
        </Card>

        <Card title="Recent Leave Requests">
          {leaves.length === 0 ? <Empty /> : leaves.map((leave) => (
            <Row key={leave.id}>
              <div>
                <Name>{leave.employee?.name || "Employee"}</Name>
                <Sub>{leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()}</Sub>
              </div>
              <StatusBadge status={leave.status} />
            </Row>
          ))}
        </Card>
      </div>

      <Card title="Pending Approvals">
        {leaves.filter((l) => l.status === "pending").length === 0 ? <Empty /> : leaves.filter((l) => l.status === "pending").map((leave) => (
          <Row key={leave.id} style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <Name>{leave.employee?.name || "Employee"}</Name>
              <Sub>{leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</Sub>
              {leave.reason && <Sub style={{ fontStyle: "italic" }}>{leave.reason}</Sub>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => updateStatus(leave.id, "approved")} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #dcfce7", background: "#ecfdf5", color: "#166534", cursor: "pointer", fontWeight: 600 }}>Approve</button>
              <button onClick={() => updateStatus(leave.id, "rejected")} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fef2f2", color: "#991b1b", cursor: "pointer", fontWeight: 600 }}>Reject</button>
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}

const Stat = ({ title, value, icon }) => (
  <div style={{ background: "white", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid #06b6d4` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{title}</p>
        <p style={{ margin: "4px 0 0", color: "#0f172a", fontSize: 24, fontWeight: 700 }}>{value}</p>
      </div>
      <span style={{ fontSize: 24 }}>{icon}</span>
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>{title}</h3>
    <div style={{ display: "grid", gap: 10 }}>{children}</div>
  </div>
);

const Row = ({ children, ...props }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9", ...props }}>{children}</div>
);

const Name = ({ children }) => <p style={{ margin: 0, color: "#0f172a", fontWeight: 600, fontSize: 14 }}>{children}</p>;
const Sub = ({ children, ...props }) => <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 12, ...props }}>{children}</p>;
const Empty = () => <p style={{ color: "#94a3b8" }}>No records</p>;
const StatusBadge = ({ status }) => {
  const cfg = {
    approved: { bg: "#dcfce7", color: "#166534" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#fef3c7", color: "#92400e" },
  }[status] || { bg: "#f1f5f9", color: "#334155" };
  return <span style={{ padding: "4px 8px", borderRadius: 6, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}>{status}</span>;
};

const Badge = ({ children }) => <span style={{ padding: "4px 8px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 600 }}>{children}</span>;

export default Admin;

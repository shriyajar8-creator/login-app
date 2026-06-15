import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";

function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loggedInEmployee, setLoggedInEmployee] = useState(null);
  const [form, setForm] = useState({ employeeId: "", leaveType: "", startDate: "", endDate: "", reason: "" });
  const userRole = localStorage.getItem("userRole") || "employee";
  const userEmail = localStorage.getItem("userEmail");

  const fetchLeaves = useCallback(async () => {
    try {
      const params = {};
      if (userRole !== "admin") {
        // Only fetch leaves for the logged-in employee
        if (loggedInEmployee) {
          params.employee = loggedInEmployee.id;
        }
      }
      const { data } = await api.get("/api/leaves", { params });
      if (data.success) {
        setLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, [loggedInEmployee, userRole]);

  const fetchEmployees = useCallback(async () => {
    try {
      if (userRole === "admin") {
        const { data } = await api.get("/api/employees");
        if (data.success) {
          setEmployees(data.employees || []);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [userRole]);

  const fetchLoggedInEmployee = useCallback(async () => {
    try {
      if (userEmail) {
        const { data } = await api.get(`/api/employees?email=${userEmail}`);
        if (data.success && data.employees && data.employees.length > 0) {
          setLoggedInEmployee(data.employees[0]);
          // Pre-fill the form with the employee ID
          setForm(prev => ({ ...prev, employeeId: data.employees[0].id }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchEmployees();
    fetchLoggedInEmployee();
    fetchLeaves();
  }, [fetchEmployees, fetchLoggedInEmployee, fetchLeaves]);

  const handleSubmit = async () => {
    const { employeeId, leaveType, startDate, endDate } = form;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await api.post("/api/leaves", {
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: form.reason,
      });
      if (response.data.success) {
        alert(response.data.message);
        setForm({ employeeId: "", leaveType: "", startDate: "", endDate: "", reason: "" });
        fetchLeaves();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/api/leaves/${id}/status`, { status });
      if (response.data.success) {
        fetchLeaves();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "approved":
        return { background: "#dcfce7", color: "#166534", label: "Approved" };
      case "rejected":
        return { background: "#fee2e2", color: "#b91c1c", label: "Rejected" };
      default:
        return { background: "#fef3c7", color: "#92400e", label: "Pending" };
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Leave Requests</h2>

      <div style={{ marginBottom: 20, maxWidth: 520, padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginTop: 0 }}>New Request</h3>
        {userRole === "admin" ? (
          <>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.department || "N/A"}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <p style={{ marginBottom: 10, fontWeight: 600, color: "#0f172a" }}>
              {loggedInEmployee ? loggedInEmployee.name : "Loading..."}
            </p>
            <input type="hidden" value={form.employeeId} />
          </>
        )}
        <input
          placeholder="Leave Type"
          value={form.leaveType}
          onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
          style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>
        <textarea
          placeholder="Reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          style={{ width: "100%", marginBottom: 10, padding: 10, minHeight: 80, borderRadius: 8, border: "1px solid #d1d5db" }}
        />
        <button onClick={handleSubmit} style={{ padding: 10, backgroundColor: "#0f766e", color: "white", border: "none", borderRadius: 8, width: "100%" }}>
          Submit Request
        </button>
      </div>

      <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginTop: 0 }}>Requests</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Employee</th>
                <th style={{ padding: 12, textAlign: "left" }}>Leave Type</th>
                <th style={{ padding: 12, textAlign: "left" }}>Dates</th>
                <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                <th style={{ padding: 12, textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const status = getStatusStyles(leave.status);
                return (
                  <tr key={leave.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 12 }}>{leave.employee?.name || "Employee"}</td>
                    <td style={{ padding: 12 }}>{leave.leaveType}</td>
                    <td style={{ padding: 12 }}>{new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "4px 8px", borderRadius: 999, background: status.background, color: status.color, fontSize: 12, fontWeight: 600 }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {userRole === "admin" && leave.status === "pending" ? (
                        <>
                          <button onClick={() => updateStatus(leave.id, "approved")} style={{ marginRight: 8, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#ecfdf5", color: "#166534", cursor: "pointer" }}>
                            Approve
                          </button>
                          <button onClick={() => updateStatus(leave.id, "rejected")} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "#64748b" }}>Admin review only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>No leave requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaveRequests;

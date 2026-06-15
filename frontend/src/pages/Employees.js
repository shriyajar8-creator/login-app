import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, createEmployee } from "../store/employeesSlice";

export default function Employees() {
  const dispatch = useDispatch();
  const { list: employees, loading, meta } = useSelector((state) => state.employees);
  const [form, setForm] = useState({ name: "", email: "", department: "", designation: "", skills: "", qualifications: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const userRole = localStorage.getItem("userRole") || "employee";

  useEffect(() => {
    dispatch(fetchEmployees({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { alert("Name and email required"); return; }
    try {
      const qualifications = {};
      if (form.qualifications) {
        try {
          qualifications.qualifications = JSON.parse(form.qualifications);
        } catch {
          qualifications.qualifications = form.qualifications;
        }
      }
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
        ...qualifications,
      };
      await dispatch(createEmployee(payload)).unwrap();
      setForm({ name: "", email: "", department: "", designation: "", skills: "", qualifications: "" });
    } catch (e) {
      alert(e?.message || "Failed to create employee");
    }
  };

  const filtered = employees.filter((emp) => {
    const term = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="employees-page" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Employees</h2>
        <input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", width: 260 }}
        />
      </div>

      {userRole === "admin" && (
        <form className="add-employee-form" onSubmit={handleCreate} style={{ marginBottom: 20, maxWidth: 520, padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ marginTop: 0 }}>Add Employee</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", gridColumn: "1 / -1" }} />
            <input name="qualifications" placeholder='Qualifications JSON (e.g. {"degree":"B.Tech","year":2021})' value={form.qualifications} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", gridColumn: "1 / -1" }} />
            <div>
              <button type="submit" disabled={loading} style={{ marginTop: 12, padding: 10, backgroundColor: "#0f766e", color: "white", border: "none", borderRadius: 8 }}>
                {loading ? "Saving..." : "Add Employee"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="employee-list" style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginTop: 0 }}>Employee Roster</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                <th style={{ padding: 12, textAlign: "left" }}>Department</th>
                <th style={{ padding: 12, textAlign: "left" }}>Designation</th>
                <th style={{ padding: 12, textAlign: "left" }}>Skills</th>
                <th style={{ padding: 12, textAlign: "left" }}>Qualifications</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>{emp.name}</td>
                  <td style={{ padding: 12 }}>{emp.email}</td>
                  <td style={{ padding: 12 }}>{emp.department || "-"}</td>
                  <td style={{ padding: 12 }}>{emp.designation || "-"}</td>
                  <td style={{ padding: 12 }}>{(emp.skills || []).join(", ")}</td>
                  <td style={{ padding: 12 }}>{emp.qualifications ? JSON.stringify(emp.qualifications) : "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>No employees found</td>
              </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>Page {meta.page} of {Math.ceil((meta.total || 0) / (meta.limit || 10))}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}>Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={filtered.length < (meta.limit || 10)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
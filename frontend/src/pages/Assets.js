import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", type: "", serialNumber: "" });
  const [assignForm, setAssignForm] = useState({ assetId: "", employeeId: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [returningId, setReturningId] = useState(null);
  const userRole = localStorage.getItem("userRole") || "employee";

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employees");
      if (res.data.success) setEmployees(res.data.employees);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssets = useCallback(async () => {
    try {
      const res = await api.get("/api/assets", { params: { status: statusFilter || undefined } });
      if (res.data.success) setAssets(res.data.assets);
    } catch (e) {
      console.error(e);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []); // fetch employees once on mount

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]); // refetch assets when statusFilter changes

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.serialNumber) {
      alert("Name, type, and serial number are required.");
      return;
    }
    try {
      await api.post("/api/assets", form);
      setForm({ name: "", type: "", serialNumber: "" });
      fetchAssets();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to create asset");
    }
  };

  const assignAsset = async (e) => {
    e.preventDefault();
    if (!assignForm.assetId || !assignForm.employeeId) {
      alert("Asset and employee are required.");
      return;
    }
    try {
      await api.patch(`/api/assets/${assignForm.assetId}/assign`, { employee_id: assignForm.employeeId });
      setAssignForm({ assetId: "", employeeId: "" });
      fetchAssets();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to assign asset");
    }
  };

  const returnAsset = async (id) => {
    setReturningId(id);
  };

  const confirmReturn = async (id) => {
    try {
      await api.patch(`/api/assets/${id}/return`);
      fetchAssets();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to return asset");
    } finally {
      setReturningId(null);
    }
  };

  const filtered = assets.filter((a) => {
    const term = search.toLowerCase();
    return a.name?.toLowerCase().includes(term) || a.type?.toLowerCase().includes(term) || a.serialNumber?.toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Asset Management</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>
      </div>

      {userRole === "admin" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <form onSubmit={handleCreate} style={{ padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0 }}>Create Asset</h3>
            <input name="name" placeholder="Asset Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="type" placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input name="serialNumber" placeholder="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <button type="submit" style={{ width: "100%", padding: 10, background: "#0f766e", color: "white", border: "none", borderRadius: 8 }}>Create Asset</button>
          </form>

          <form onSubmit={assignAsset} style={{ padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0 }}>Assign Asset</h3>
            <select value={assignForm.assetId} onChange={(e) => setAssignForm({ ...assignForm, assetId: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <option value="">Select asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>
              ))}
            </select>
            <select value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <button type="submit" style={{ width: "100%", padding: 10, background: "#0f766e", color: "white", border: "none", borderRadius: 8 }}>Assign</button>
          </form>
        </div>
      )}

      <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginTop: 0 }}>Asset Inventory</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Name</th>
              <th style={{ padding: 12, textAlign: "left" }}>Type</th>
              <th style={{ padding: 12, textAlign: "left" }}>Serial</th>
              <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left" }}>Assigned To</th>
              <th style={{ padding: 12, textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <tr key={asset.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12 }}>{asset.name}</td>
                <td style={{ padding: 12 }}>{asset.type}</td>
                <td style={{ padding: 12 }}>{asset.serialNumber}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ padding: "4px 8px", borderRadius: 999, background: asset.status === "available" ? "#dcfce7" : "#fef3c7", color: asset.status === "available" ? "#166534" : "#92400e", fontSize: 12, fontWeight: 600 }}>
                    {asset.status}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{asset.assignedTo?.name || "-"}</td>
                <td style={{ padding: 12 }}>
                  {userRole === "admin" && asset.status === "assigned" && (
                    returningId === asset.id ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => confirmReturn(asset.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #dcfce7", background: "#ecfdf5", color: "#166534", cursor: "pointer" }}>Confirm</button>
                        <button onClick={() => setReturningId(null)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fef2f2", color: "#991b1b", cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => returnAsset(asset.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer" }}>Return</button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>No assets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Assets;
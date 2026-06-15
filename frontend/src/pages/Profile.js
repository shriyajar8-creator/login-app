import { useEffect, useState } from "react";
import api from "../utils/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [myLeaves, setMyLeaves] = useState([]);
  const [newLeave, setNewLeave] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) fetchMyLeaves();
  }, [profile?.id]);

   const loadProfile = async () => {
     try {
       const response = await api.get("/api/auth/profile");
       if (response.data.success) {
         setProfile(response.data.profile);
         setFormData({
           name: response.data.profile.name,
           email: response.data.profile.email,
           phone: response.data.profile.phone || "",
           department: response.data.profile.department || "",
         });
       }
     } catch (error) {
       console.error("Failed to load profile", error);
     } finally {
       setLoading(false);
     }
   };

  const fetchMyLeaves = async () => {
    try {
      const { data } = await api.get("/api/leaves");
      if (data.success) setMyLeaves(data.leaves || []);
    } catch (e) {
      // ignore
    }
  };

   const handleUpdateProfile = async (e) => {
     e.preventDefault();
     try {
       const response = await api.patch("/api/auth/profile", formData);
       if (response.data.success) {
         setProfile(response.data.profile);
         setEditing(false);
       }
     } catch (error) {
       console.error("Failed to update profile", error);
     }
   };

   const handleChangePassword = async (e) => {
     e.preventDefault();
     if (passwordData.newPassword !== passwordData.confirmPassword) {
       alert("Passwords do not match");
       return;
     }
     try {
       const response = await api.patch("/api/auth/profile", { password: passwordData.newPassword });
       if (response.data.success) {
         setPasswordData({ newPassword: "", confirmPassword: "" });
         setShowPasswordForm(false);
       }
     } catch (error) {
       console.error("Failed to change password", error);
     }
   };

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      setLeavesLoading(true);
      const { data } = await api.post("/api/leaves", {
        employee_id: profile?.id,
        leave_type: newLeave.leaveType,
        start_date: newLeave.startDate,
        end_date: newLeave.endDate,
        reason: newLeave.reason,
      });
      if (data.success) {
        setNewLeave({ leaveType: "", startDate: "", endDate: "", reason: "" });
        await fetchMyLeaves();
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to submit leave");
    } finally {
      setLeavesLoading(false);
    }
  };

  const cancelLeave = async (id) => {
    setCancelId(id);
  };

  const confirmCancelLeave = async (id) => {
    try {
      await api.patch(`/api/leaves/${id}/status`, { status: "cancelled" });
      setCancelId(null);
      await fetchMyLeaves();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to cancel leave");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px 30px", color: "#64748b" }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: "30px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ marginBottom: "5px", color: "#0f172a" }}>My Profile</h1>
        <p style={{ color: "#64748b" }}>Manage your account information and leave requests</p>
      </div>

      {profile && (
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>Account Information</h2>
              <button onClick={() => setEditing(!editing)} style={{ padding: "10px 20px", backgroundColor: editing ? "#ef4444" : "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: "grid", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>Department</label>
                    <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <button type="submit" style={{ padding: "12px 24px", backgroundColor: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Save Changes</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "grid", gap: 15 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>FULL NAME</p>
                  <p style={{ margin: 0, fontSize: 16, color: "#0f172a", fontWeight: 500 }}>{profile.name}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>EMAIL ADDRESS</p>
                  <p style={{ margin: 0, fontSize: 16, color: "#0f172a", fontWeight: 500 }}>{profile.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>ROLE</p>
                  <p style={{ margin: 0, fontSize: 16, color: "white", fontWeight: 600, display: "inline-block", padding: "6px 12px", background: "#0891b2", borderRadius: 6, textTransform: "capitalize" }}>{profile.role}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>MEMBER SINCE</p>
                  <p style={{ margin: 0, fontSize: 16, color: "#0f172a", fontWeight: 500 }}>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>Security</h2>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ padding: "10px 20px", backgroundColor: showPasswordForm ? "#ef4444" : "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm ? (
              <form onSubmit={handleChangePassword}>
                <div style={{ display: "grid", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>New Password</label>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>Confirm Password</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <button type="submit" style={{ padding: "12px 24px", backgroundColor: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Update Password</button>
                </div>
              </form>
            ) : (
              <p style={{ color: "#64748b", lineHeight: 1.6 }}>Keep your account secure by regularly updating your password.</p>
            )}
          </div>

          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: "#0f172a" }}>My Leaves</h2>

            <form onSubmit={submitLeave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <select value={newLeave.leaveType} onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })} style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <option value="">Leave Type</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Earned">Earned</option>
              </select>
              <input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <textarea value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Reason" style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", minHeight: 80, gridColumn: "1 / -1" }} />
              <button type="submit" disabled={leavesLoading} style={{ gridColumn: "1 / -1", padding: 12, backgroundColor: "#0f766e", color: "white", border: "none", borderRadius: 8, fontWeight: 600 }}>
                {leavesLoading ? "Submitting..." : "Apply Leave"}
              </button>
            </form>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Type</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Dates</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Reason</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 12 }}>{leave.leaveType}</td>
                      <td style={{ padding: 12 }}>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                      <td style={{ padding: 12 }}>{leave.reason || "-"}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: "4px 8px", borderRadius: 6, background: leave.status === "approved" ? "#dcfce7" : leave.status === "rejected" ? "#fee2e2" : "#fef3c7", color: leave.status === "approved" ? "#166534" : leave.status === "rejected" ? "#991b1b" : "#92400e", fontSize: 12, fontWeight: 600 }}>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {leave.status === "pending" && (
                          cancelId === leave.id ? (
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              <button onClick={() => confirmCancelLeave(leave.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #dcfce7", background: "#ecfdf5", color: "#166534", cursor: "pointer" }}>Confirm</button>
                              <button onClick={() => setCancelId(null)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => cancelLeave(leave.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer" }}>Cancel</button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                  {myLeaves.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>No leave requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

import { useEffect, useState } from "react";
import api from "../utils/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/notifications");
      if (data.success) setNotifications(data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Notifications</h2>
      <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {notifications.length === 0 && <p style={{ color: "#94a3b8" }}>No notifications</p>}
        {notifications.map((n) => (
          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{n.message}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            {!n.read && (
              <button onClick={() => markAsRead(n.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer" }}>
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
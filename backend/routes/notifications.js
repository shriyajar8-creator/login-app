const express = require("express");
const router = express.Router();

const notifications = [
  { id: 1, title: "Welcome aboard", message: "You have been added to the HRMS system.", type: "info", read: false, createdAt: new Date().toISOString() },
  { id: 2, title: "Leave approved", message: "Your leave request has been approved.", type: "success", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: "Asset assigned", message: "MacBook Pro has been assigned to you.", type: "info", read: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

router.get("/notifications", (_req, res) => {
  res.json({ success: true, notifications, unread: notifications.filter((n) => !n.read).length });
});

router.patch("/notifications/:id/read", (req, res) => {
  const item = notifications.find((n) => n.id === Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: "Notification not found" });
  item.read = true;
  res.json({ success: true, notification: item });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "leave-management-secret";
const VALID_ROLES = ["employee", "admin", "manager", "hr"];

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email, and password are required." });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "User already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: "employee" } });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, message: "Signup successful.", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, message: "Login successful.", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, profile: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load profile." });
  }
});

router.patch("/profile", authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({ where: { id: Number(req.user.id) }, data: updates });
    res.json({ success: true, message: "Profile updated.", profile: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to update profile." });
  }
});

router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
    res.json({ success: true, users });
  } catch (error) {
    console.error("USERS LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load users." });
  }
});

router.patch("/users/:id/role", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ success: false, message: "Invalid role." });

  try {
    const user = await prisma.user.update({ where: { id: Number(id) }, data: { role } });
    res.json({ success: true, message: "Role updated.", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("ROLE UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to update role." });
  }
});

router.get("/roles", authMiddleware, requireRole("admin"), (req, res) => {
  res.json({ success: true, roles: VALID_ROLES });
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const prisma = require("../prismaClient");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

async function createAuditLog({ model, recordId, action, before, after, changedBy }) {
  await prisma.auditLog.create({
    data: { model, recordId, action, before, after, changedBy },
  });
}

router.get("/employees", authMiddleware, async (req, res) => {
  const { search, department, role, email, page = 1, limit = 20 } = req.query;
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { department: { contains: search, mode: "insensitive" } },
    ];
  }

  if (department) where.department = department;
  if (role) where.role = role;
  if (email) where.email = email;

  try {
    const employees = await prisma.employee.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        _count: { select: { leaves: true, assets: true } },
      },
    });
    const total = await prisma.employee.count({ where });
    res.json({ success: true, employees, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error("EMPLOYEES LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.get("/employees/:id", authMiddleware, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(req.params.id) },
      include: { leaves: true, assets: true },
    });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
    res.json({ success: true, employee });
  } catch (error) {
    console.error("EMPLOYEE DETAIL ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.post("/employees", authMiddleware, requireRole("admin"), async (req, res) => {
  const { name, email, department, role, skills, qualifications, designation, phone, address, dateOfBirth } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: "Name and email are required." });

  try {
    // Generate employeeId if not provided
    let employeeId = req.body.employeeId;
    if (!employeeId) {
      // Find the highest employeeId number
      const employees = await prisma.employee.findMany({
        select: { employeeId: true },
        orderBy: { employeeId: 'desc' },
        take: 1,
      });
      let nextNum = 1;
      if (employees.length > 0 && employees[0].employeeId) {
        const match = employees[0].employeeId.match(/EMP(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      employeeId = `EMP${nextNum.toString().padStart(3, '0')}`;
    }

    let qualificationsValue = null;
    if (qualifications !== undefined && qualifications !== null) {
      try {
        qualificationsValue = JSON.parse(qualifications);
      } catch (e) {
        qualificationsValue = qualifications; // keep as string
      }
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email,
        department: department || null,
        designation: designation || null,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        skills: Array.isArray(skills) ? skills : [],
        qualifications: qualificationsValue,
      },
    });

    await createAuditLog({ model: "Employee", recordId: employee.id, action: "create", before: null, after: employee, changedBy: req.user.email });
    res.json({ success: true, message: "Employee added.", employee });
  } catch (error) {
    console.error("EMPLOYEE CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.patch("/employees/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const { name, email, department, role, skills, status } = req.body;
  try {
    const existing = await prisma.employee.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: "Employee not found." });

    const updated = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name ?? existing.name,
        email: email ?? existing.email,
        department: department ?? existing.department,
        role: role ?? existing.role,
        status: status ?? existing.status,
        skills: skills ? JSON.parse(skills) : existing.skills,
      },
    });

    await createAuditLog({ model: "Employee", recordId: updated.id, action: "update", before: existing, after: updated, changedBy: req.user.email });
    res.json({ success: true, message: "Employee updated.", employee: updated });
  } catch (error) {
    console.error("EMPLOYEE UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.post("/employees/:id/profile-image", authMiddleware, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const employee = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: { profileUrl: req.file ? `/uploads/${req.file.filename}` : null },
    });
    res.json({ success: true, message: "Profile image uploaded.", employee });
  } catch (error) {
    console.error("PROFILE IMAGE UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: "Upload failed." });
  }
});

module.exports = router;

const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();

async function createAuditLog({ model, recordId, action, before, after, changedBy }) {
  await prisma.auditLog.create({ data: { model, recordId, action, before, after, changedBy } });
}

router.get("/assets", authMiddleware, async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  try {
    const assets = await prisma.asset.findMany({
      where,
      include: { assignedTo: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.asset.count({ where });
    res.json({ success: true, assets, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error("ASSETS LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.post("/assets", authMiddleware, requireRole("admin"), async (req, res) => {
  const { name, type, serialNumber } = req.body;
  if (!name || !type || !serialNumber) {
    return res.status(400).json({ success: false, message: "Name, type, and serial number are required." });
  }

  try {
    const asset = await prisma.asset.create({ data: { name, type, serialNumber, status: "available" } });
    await createAuditLog({ model: "Asset", recordId: asset.id, action: "create", before: null, after: asset, changedBy: req.user.email });
    res.json({ success: true, message: "Asset created.", asset });
  } catch (error) {
    console.error("ASSET CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.patch("/assets/:id/assign", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { employee_id, issuedAt } = req.body;
  if (!employee_id) {
    return res.status(400).json({ success: false, message: "Employee id is required." });
  }

  try {
    const before = await prisma.asset.findUnique({ where: { id: Number(id) } });
    if (!before) return res.status(404).json({ success: false, message: "Asset not found." });

    const asset = await prisma.asset.update({
      where: { id: Number(id) },
      data: {
        assignedToId: Number(employee_id),
        status: "assigned",
        issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      },
    });
    await createAuditLog({ model: "Asset", recordId: asset.id, action: "assign", before, after: asset, changedBy: req.user.email });
    res.json({ success: true, message: "Asset assigned.", asset });
  } catch (error) {
    console.error("ASSET ASSIGN ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.patch("/assets/:id/return", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;

  try {
    const before = await prisma.asset.findUnique({ where: { id: Number(id) } });
    if (!before) return res.status(404).json({ success: false, message: "Asset not found." });

    const asset = await prisma.asset.update({
      where: { id: Number(id) },
      data: { assignedToId: null, status: "available", returnedAt: new Date() },
    });
    await createAuditLog({ model: "Asset", recordId: asset.id, action: "return", before, after: asset, changedBy: req.user.email });
    res.json({ success: true, message: "Asset returned.", asset });
  } catch (error) {
    console.error("ASSET RETURN ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

module.exports = router;

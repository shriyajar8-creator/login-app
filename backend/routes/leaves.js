const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();

async function createAuditLog({ model, recordId, action, before, after, changedBy }) {
  await prisma.auditLog.create({ data: { model, recordId, action, before, after, changedBy } });
}

router.get("/leaves", authMiddleware, async (req, res) => {
  const { status, employee, page = 1, limit = 20 } = req.query;
  const where = {};

  if (status) where.status = status;
  if (employee) {
    where.employee = { name: { contains: employee, mode: "insensitive" } };
  }

  try {
    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { employee: true },
    });
    const total = await prisma.leave.count({ where });
    res.json({ success: true, leaves, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error("LEAVES LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.post("/leaves", authMiddleware, async (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  if (!employee_id || !leave_type || !start_date || !end_date) {
    return res.status(400).json({ success: false, message: "Missing leave request details." });
  }

  try {
    const leave = await prisma.leave.create({
      data: {
        employeeId: Number(employee_id),
        leaveType: leave_type,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        reason: reason || null,
      },
    });

    await createAuditLog({ model: "Leave", recordId: leave.id, action: "create", before: null, after: leave, changedBy: req.user.email });
    res.json({ success: true, message: "Leave request submitted.", leave });
  } catch (error) {
    console.error("LEAVE CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

router.patch("/leaves/:id/status", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required." });
  }

  try {
    const before = await prisma.leave.findUnique({ where: { id: Number(id) } });
    if (!before) return res.status(404).json({ success: false, message: "Leave request not found." });

    const updated = await prisma.leave.update({ where: { id: Number(id) }, data: { status } });
    await createAuditLog({ model: "Leave", recordId: updated.id, action: "status_update", before, after: updated, changedBy: req.user.email });
    res.json({ success: true, message: "Leave status updated.", leave: updated });
  } catch (error) {
    console.error("LEAVE STATUS UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Database Error." });
  }
});

module.exports = router;

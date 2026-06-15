const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/reports/summary", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const employeeCount = await prisma.employee.count();
    const leaveCount = await prisma.leave.count();
    const approvedLeaves = await prisma.leave.count({ where: { status: "approved" } });
    const assetCount = await prisma.asset.count();
    const assignedAssets = await prisma.asset.count({ where: { status: "assigned" } });

    res.json({
      success: true,
      summary: { employeeCount, leaveCount, approvedLeaves, assetCount, assignedAssets },
    });
  } catch (error) {
    console.error("REPORT SUMMARY ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to generate report." });
  }
});

router.get("/reports/export/:type", authMiddleware, requireRole("admin"), async (req, res) => {
  const { type } = req.params;

  try {
    if (type === "employees") {
      const employees = await prisma.employee.findMany({});
      const csv = ["id,name,email,department,role,status,skills"].concat(
        employees.map((row) =>
          [row.id, row.name, row.email, row.department || "", row.role || "", row.status, JSON.stringify(row.skills) || ""].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
      ).join("\n");
      res.header("Content-Type", "text/csv");
      res.attachment("employees-report.csv");
      return res.send(csv);
    }

    if (type === "leaves") {
      const leaves = await prisma.leave.findMany({ include: { employee: true } });
      const csv = ["id,employee,leaveType,startDate,endDate,status,reason"].concat(
        leaves.map((row) =>
          [row.id, row.employee.name, row.leaveType, row.startDate.toISOString(), row.endDate.toISOString(), row.status, row.reason || ""].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
      ).join("\n");
      res.header("Content-Type", "text/csv");
      res.attachment("leaves-report.csv");
      return res.send(csv);
    }

    if (type === "assets") {
      const assets = await prisma.asset.findMany({ include: { assignedTo: true } });
      const csv = ["id,name,type,serialNumber,status,assignedTo,issuedAt,returnedAt"].concat(
        assets.map((row) =>
          [row.id, row.name, row.type, row.serialNumber, row.status, row.assignedTo?.name || "", row.issuedAt?.toISOString() || "", row.returnedAt?.toISOString() || ""].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
      ).join("\n");
      res.header("Content-Type", "text/csv");
      res.attachment("assets-report.csv");
      return res.send(csv);
    }

    res.status(400).json({ success: false, message: "Unknown report type." });
  } catch (error) {
    console.error("REPORT EXPORT ERROR:", error);
    res.status(500).json({ success: false, message: "Export failed." });
  }
});

module.exports = router;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");
const assetRoutes = require("./routes/assets");
const reportRoutes = require("./routes/reports");
const notificationRoutes = require("./routes/notifications");
const db = require("./db");
const prisma = require("./prismaClient");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", employeeRoutes);
app.use("/api", leaveRoutes);
app.use("/api", assetRoutes);
app.use("/api", reportRoutes);
app.use("/api", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "Administrator";

  try {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({ data: { name: adminName, email: adminEmail, password: hashed, role: "admin" } });
      console.log(`Admin user created with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error("ensureAdminUser error:", error);
    // don't exit; migrations may not have run yet
  }
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected to database.");
    await ensureAdminUser();
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();

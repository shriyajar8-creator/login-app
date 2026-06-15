const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashed,
        role: 'admin',
        phone: '9990001111',
        department: 'Administration',
      },
    });
    console.log('Created admin user');
  }

  const employees = [
    { employeeId: "EMP001", name: "Aarav Sharma", email: "aarav@company.com", department: "Engineering", designation: "Software Engineer", phone: "9876543210", skills: ["React", "Node.js", "PostgreSQL"], qualifications: { degree: "B.Tech", year: 2021, institute: "IIT Delhi" } },
    { employeeId: "EMP002", name: "Priya Patel", email: "priya@company.com", department: "HR", designation: "HR Manager", phone: "9876543211", skills: ["Recruiting", "Employee Relations"], qualifications: { degree: "MBA - HR", year: 2020, institute: "IIM Bangalore" } },
    { employeeId: "EMP003", name: "Rahul Verma", email: "rahul@company.com", department: "Engineering", designation: "Backend Developer", phone: "9876543212", skills: ["Node.js", "Prisma", "PostgreSQL"], qualifications: { degree: "MCA", year: 2019, institute: "NIT Trichy" } },
    { employeeId: "EMP004", name: "Sneha Gupta", email: "sneha@company.com", department: "Design", designation: "Product Designer", phone: "9876543213", skills: ["Figma", "UI/UX"], qualifications: { degree: "B.Des", year: 2022, institute: "NIFT" } },
    { employeeId: "EMP005", name: "Vikram Singh", email: "vikram@company.com", department: "Engineering", designation: "DevOps Engineer", phone: "9876543214", skills: ["Docker", "Kubernetes", "AWS"], qualifications: { degree: "B.Tech", year: 2018, institute: "PES University" } },
    { employeeId: "EMP006", name: "Ananya Reddy", email: "ananya@company.com", department: "QA", designation: "QA Engineer", phone: "9876543215", skills: ["Cypress", "Jest", "Postman"], qualifications: { degree: "B.Tech", year: 2020, institute: "JNTU Hyderabad" } },
    { employeeId: "EMP007", name: "Karthik Menon", email: "karthik@company.com", department: "Engineering", designation: "Tech Lead", phone: "9876543216", skills: ["Architecture", "System Design"], qualifications: { degree: "MS Software Systems", year: 2017, institute: "PSG Tech" } },
    { employeeId: "EMP008", name: "Meera Nair", email: "meera@company.com", department: "HR", designation: "HR Executive", phone: "9876543217", skills: ["Payroll", "Onboarding"], qualifications: { degree: "MA HRM", year: 2021, institute: "TISS" } },
  ];

  for (const emp of employees) {
    const exists = await prisma.employee.findUnique({ where: { employeeId: emp.employeeId } });
    if (!exists) {
      await prisma.employee.create({ data: emp });
    }
  }

  const allEmployees = await prisma.employee.findMany({ select: { id: true, name: true } });
  console.log('Employees seeded:', allEmployees.length);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// Simplified database config - let Prisma handle connection pooling
const config = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "eventhub360",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
};

module.exports = { getConfig: () => config };

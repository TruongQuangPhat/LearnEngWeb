import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local, then fallback to .env
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma Migrate uses this URL. We use DIRECT_URL for migrations, 
    // and pass DATABASE_URL dynamically at runtime to the PrismaClient.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});

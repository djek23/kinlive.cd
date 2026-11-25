import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, AccountRole, AccountStatus } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataDirectory = path.join(process.cwd(), "data");
  const accountsFile = path.join(dataDirectory, "accounts.json");
  if (fs.existsSync(accountsFile)) {
    const accounts = JSON.parse(fs.readFileSync(accountsFile, "utf8"));
    for (const account of accounts) {
      await prisma.account.upsert({
        where: { email: account.email.toLowerCase() },
        update: {},
        create: {
          id: account.id,
          name: account.name,
          email: account.email.toLowerCase(),
          phone: account.phone ?? "",
          passwordHash: account.passwordHash,
          role: account.role === "superadmin" ? AccountRole.SUPERADMIN : AccountRole.PRODUCER,
          status: account.status === "active" ? AccountStatus.ACTIVE : account.status === "suspended" ? AccountStatus.SUSPENDED : AccountStatus.PENDING,
          mustChangePassword: account.mustChangePassword ?? false,
          emailVerified: account.emailVerified ?? false,
          twoFactorEnabled: account.twoFactorEnabled ?? false,
          twoFactorSecret: account.twoFactorSecret ?? null,
          failedAttempts: account.failedAttempts ?? 0,
        },
      });
    }
  }

  await prisma.account.upsert({
    where: { email: "admin@kinlive.cd" },
    update: {},
    create: {
      id: "superadmin-default",
      name: "Super Administrateur",
      email: "admin@kinlive.cd",
      phone: "",
      passwordHash: await bcrypt.hash("AdminKinlive2026!", 12),
      role: AccountRole.SUPERADMIN,
      status: AccountStatus.ACTIVE,
      mustChangePassword: true,
      emailVerified: true,
    },
  });

  console.log("Migration JSON vers PostgreSQL terminée.");
}

main().finally(() => prisma.$disconnect());

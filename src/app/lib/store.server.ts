import fs from "node:fs";
import path from "node:path";
import type { SecureAccount } from "./security.server";

const dataDirectory = path.join(process.cwd(), "data");
const accountFile = path.join(dataDirectory, "accounts.json");
const auditFile = path.join(dataDirectory, "audit.json");

export type AuditEntry = {
  id: string;
  at: string;
  accountId?: string;
  action: string;
  detail: string;
  ip: string;
};

function ensure() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(accountFile)) fs.writeFileSync(accountFile, "[]", "utf8");
  if (!fs.existsSync(auditFile)) fs.writeFileSync(auditFile, "[]", "utf8");
}

export function getAccounts(): SecureAccount[] {
  ensure();
  return JSON.parse(fs.readFileSync(accountFile, "utf8"));
}

export function saveAccounts(accounts: SecureAccount[]) {
  ensure();
  fs.writeFileSync(accountFile, JSON.stringify(accounts, null, 2), "utf8");
}

export function getAccountByEmail(email: string) {
  return getAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getAccountById(id: string) {
  return getAccounts().find((account) => account.id === id) ?? null;
}

export function addAudit(action: string, detail: string, ip = "unknown", accountId?: string) {
  ensure();
  const entries = JSON.parse(fs.readFileSync(auditFile, "utf8")) as AuditEntry[];
  entries.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), action, detail, ip, accountId });
  fs.writeFileSync(auditFile, JSON.stringify(entries.slice(0, 5000), null, 2), "utf8");
}

export function getAudit() {
  ensure();
  return JSON.parse(fs.readFileSync(auditFile, "utf8")) as AuditEntry[];
}

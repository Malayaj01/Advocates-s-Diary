/**
 * Demo data for trying the app locally. Wipes the database first!
 *   npm run seed:demo
 * Logins: advocate / demo123 (Advocate), junior / demo123 (Junior)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, today } from "../src/lib/dates";

const db = new PrismaClient();

const clients = [
  { name: "राम कुमार", phone: "9876543210" },
  { name: "सीता देवी", phone: "9812345678" },
  { name: "Mohan Lal Sharma", phone: "9898989898" },
  { name: "गुप्ता ट्रेडर्स", phone: "9123456780" },
  { name: "Anita Verma", phone: "9001122334" },
];

const cases = [
  { title: "राम कुमार बनाम राज्य", client: 0, court: "ADJ कोर्ट 3", caseNumber: "SC 112/2024", caseType: "CRIMINAL", fee: 50000, paid: [20000, 10000], next: 0, purpose: "बहस" },
  { title: "सीता देवी बनाम मोहन", client: 1, court: "फैमिली कोर्ट", caseNumber: "HMA 45/2023", caseType: "FAMILY", fee: 30000, paid: [30000], next: 0, purpose: "गवाही" },
  { title: "Sharma vs Municipal Corp.", client: 2, court: "Civil Judge SD", caseNumber: "CS 245/2024", caseType: "CIVIL", fee: 75000, paid: [25000], next: 1, purpose: "Reply" },
  { title: "गुप्ता ट्रेडर्स बनाम बैंक", client: 3, court: "उपभोक्ता फोरम", caseNumber: "CC 78/2025", caseType: "CONSUMER", fee: 40000, paid: [15000, 5000], next: 1, purpose: "जवाब" },
  { title: "Anita Verma vs State", client: 4, court: "CJM Court", caseNumber: "BA 301/2025", caseType: "CRIMINAL", fee: 20000, paid: [], next: 9, purpose: "Bail" },
  { title: "राम कुमार बनाम श्याम", client: 0, court: "तहसील", caseNumber: "RA 12/2025", caseType: "REVENUE", fee: 15000, paid: [5000], next: -5, purpose: "आदेश" },
];

async function main() {
  await db.activity.deleteMany();
  await db.payment.deleteMany();
  await db.hearing.deleteMany();
  await db.case.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  const hash = await bcrypt.hash("demo123", 10);
  const admin = await db.user.create({ data: { name: "Adv. R. K. Singh", username: "advocate", passwordHash: hash, role: "ADMIN" } });
  await db.user.create({ data: { name: "Amit (Junior)", username: "junior", passwordHash: hash, role: "JUNIOR" } });

  const createdClients = [];
  for (const c of clients) createdClients.push(await db.client.create({ data: c }));

  const day = today();
  for (const c of cases) {
    const created = await db.case.create({
      data: {
        title: c.title,
        court: c.court,
        caseNumber: c.caseNumber,
        caseType: c.caseType,
        feeAgreed: c.fee,
        clientId: createdClients[c.client].id,
      },
    });
    // A past, completed hearing and the next one.
    await db.hearing.create({
      data: { caseId: created.id, date: addDays(day, c.next - 30), purpose: c.purpose, outcome: "तारीख बढ़ी", done: true, createdById: admin.id },
    });
    await db.hearing.create({ data: { caseId: created.id, date: addDays(day, c.next), purpose: c.purpose, createdById: admin.id } });
    for (const [i, amount] of c.paid.entries()) {
      await db.payment.create({
        data: { caseId: created.id, amount, mode: i % 2 ? "UPI" : "CASH", paidOn: addDays(day, -40 + i * 25), receivedById: admin.id },
      });
    }
  }
  console.log("Demo data ready. Login: advocate / demo123");
}

main().finally(() => db.$disconnect());

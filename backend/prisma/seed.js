import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createUser({ email, password, firstName, lastName, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    }
  });
}

async function main() {
  await createUser({
    email: "admin@medibook.com",
    password: "password123",
    firstName: "Admin",
    lastName: "MediBook",
    role: "ADMIN"
  });

  await createUser({
    email: "patient@test.com",
    password: "password123",
    firstName: "Ali",
    lastName: "Benali",
    role: "PATIENT"
  });

  const doctor1 = await createUser({
    email: "doctor1@medibook.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Martin",
    role: "DOCTOR"
  });

  const doctor2 = await createUser({
    email: "doctor2@medibook.com",
    password: "password123",
    firstName: "Karim",
    lastName: "Haddad",
    role: "DOCTOR"
  });

  await prisma.doctorProfile.upsert({
    where: { userId: doctor1.id },
    update: {},
    create: {
      userId: doctor1.id,
      specialty: "Cardiologie",
      city: "Paris",
      description: "Médecin cardiologue spécialisé dans le suivi cardiovasculaire.",
      price: 70
    }
  });

  await prisma.doctorProfile.upsert({
    where: { userId: doctor2.id },
    update: {},
    create: {
      userId: doctor2.id,
      specialty: "Médecine générale",
      city: "Lyon",
      description: "Médecin généraliste disponible pour consultations classiques.",
      price: 45
    }
  });

  console.log("Données de test créées avec succès");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

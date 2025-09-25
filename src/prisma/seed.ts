import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Super Admin
  const aashika = await prisma.user.create({
    data: {
      name: "Aashika Nethaji",
      email: "aashika@aaruchudar.com",
      role: Role.SuperAdmin,
    }
  });

  // Admins
  const venkat = await prisma.user.create({
    data: {
      name: "Venkat B",
      email: "venkat@aaruchudar.com",
      role: Role.Admin,
      managerId: aashika.id
    }
  });

  const karthik = await prisma.user.create({
    data: {
      name: "Karthik M",
      email: "karthik@aaruchudar.com",
      role: Role.Admin,
      managerId: aashika.id
    }
  });

  // Managers
  const shyam = await prisma.user.create({
    data: {
      name: "Shiyam Sundar G",
      email: "shiyam@aaruchudar.com",
      role: Role.Manager,
      managerId: venkat.id
    }
  });

  const jagadeesan = await prisma.user.create({
    data: {
      name: "Jagadeesan S",
      email: "jagadeesan@aaruchudar.com",
      role: Role.Manager,
      managerId: karthik.id
    }
  });

  // Leads
  const lingesh = await prisma.user.create({
    data: {
      name: "Lingesh S",
      email: "lingesh@aaruchudar.com",
      role: Role.TechLead,
      managerId: shyam.id
    }
  });

  const gokulnath = await prisma.user.create({
    data: {
      name: "Gokulnath S",
      email: "gokulnath@aaruchudar.com",
      role: Role.TechLead,
      managerId: shyam.id
    }
  });

  const sanjith = await prisma.user.create({
    data: {
      name: "Sanjith Kumar R",
      email: "sanjith@aaruchudar.com",
      role: Role.TechLead,
      managerId: shyam.id
    }
  });

  const archana = await prisma.user.create({
    data: {
      name: "Archana T P",
      email: "archana@aaruchudar.com",
      role: Role.TechLead,
      managerId: shyam.id
    }
  });

  const atchaya = await prisma.user.create({
    data: {
      name: "Atchaya S",
      email: "atchaya@aaruchudar.com",
      role: Role.TechLead,
      managerId: shyam.id
    }
  });

  const lalitha = await prisma.user.create({
    data: {
      name: "Lalitha Kishore",
      email: "kishore@aaruchudar.com",
      role: Role.TechLead,
      managerId: jagadeesan.id
    }
  });

  const aditya = await prisma.user.create({
    data: {
      name: "Aditya Yadav",
      email: "aditya@aaruchudar.com",
      role: Role.Manager,
      managerId: jagadeesan.id
    }
  });

  // Employees under Lingesh
  await prisma.user.createMany({
    data: [
      { name: "Kirthiga J.S", email: "kirthiga@aaruchudar.com", role: Role.Employee, managerId: lingesh.id },
      { name: "Sudharsana R", email: "sudharsana@aaruchudar.com", role: Role.Employee, managerId: lingesh.id },
      { name: "Mohamed Ijas", email: "ijas@aaruchudar.com", role: Role.Employee, managerId: lingesh.id },
    ]
  });

  // Employees under Gokulnath
  await prisma.user.createMany({
    data: [
      { name: "Thirukumaran A", email: "thirukumaran@aaruchudar.com", role: Role.Employee, managerId: gokulnath.id },
      { name: "Amuthan S", email: "amuthan@aaruchudar.com", role: Role.Employee, managerId: gokulnath.id },
      { name: "Sanjay S", email: "sanjay@aaruchudar.com", role: Role.Employee, managerId: gokulnath.id },
    ]
  });

  // Employees under Sanjith
  await prisma.user.createMany({
    data: [
      { name: "Jaggupalli Pujith Vinay", email: "pujith@aaruchudar.com", role: Role.Employee, managerId: sanjith.id },
      { name: "Shelsia Sharon", email: "shelsia@aaruchudar.com", role: Role.Employee, managerId: sanjith.id },
      { name: "Sujith Balaji", email: "sujith@aaruchudar.com", role: Role.Employee, managerId: sanjith.id },
    ]
  });

  // Employees under Archana
  await prisma.user.createMany({
    data: [
      { name: "Niroshini A", email: "niroshini@aaruchudar.com", role: Role.Employee, managerId: archana.id },
      { name: "Donadri Naga Venkata Manibabu", email: "venkatamanibabu@aaruchudar.com", role: Role.Employee, managerId: archana.id },
      { name: "Nirvika Gour", email: "nirvika@aaruchudar.com", role: Role.Employee, managerId: archana.id },
    ]
  });

  // Employees under Atchaya
  await prisma.user.createMany({
    data: [
      { name: "Arun Kumar", email: "arun@aaruchudar.com", role: Role.Employee, managerId: atchaya.id },
      { name: "Rishabh Mishra", email: "rishabh@aaruchudar.com", role: Role.Employee, managerId: atchaya.id },
    ]
  });

  // Employees under Lalitha
  await prisma.user.createMany({
    data: [
      { name: "Sujith Balaji", email: "sujith@aaruchudar.com", role: Role.Employee, managerId: lalitha.id },
      { name: "Sanjay S", email: "sanjay@aaruchudar.com", role: Role.Employee, managerId: lalitha.id },
    ]
  });

  // Employees under Aditya
  await prisma.user.createMany({
    data: [
      { name: "Rishabh Mishra", email: "rishabh@aaruchudar.com", role: Role.Employee, managerId: aditya.id },
      { name: "Sanjay S", email: "sanjay@aaruchudar.com", role: Role.Employee, managerId: lalitha.id },
       { name: "Arun Kumar", email: "arun@aaruchudar.com", role: Role.Employee, managerId: atchaya.id }
    ]
  });
}

main()
  .then(() => console.log("✅ Seeding done"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

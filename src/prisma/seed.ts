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
            name: "Shiyam Sundar",
            email: "shiyam@aaruchudar.com",
            role: Role.Manager,
            managerId: venkat.id
        }
    });

    const jagadeesan = await prisma.user.create({
        data: {
            name: "Jagadeesan",
            email: "jagadeesan@aaruchudar.com",
            role: Role.Manager,
            managerId: karthik.id
        }
    });

    // Lead
    const Lingesh = await prisma.user.create({
        data: {
            name: "Lingesh",
            email: "lingesh@aaruchudar.com",
            role: Role.TechLead,
            managerId: shyam.id
        }
    });
    const Gokulnath = await prisma.user.create({
        data: {
            name: "Gokulnath",
            email: "gokulnath@aaruchudar.com",
            role: Role.TechLead,
            managerId: shyam.id
        }
    });
    const Sanjith = await prisma.user.create({
        data: {
            name: "Sanjith",
            email: "sanjith@aaruchudar.com",
            role: Role.TechLead,
            managerId: shyam.id
        }
    });
    const Archanda = await prisma.user.create({
        data: {
            name: "Archana",
            email: "archana@aaruchudar.com",
            role: Role.TechLead,
            managerId: shyam.id
        }
    });
    const Atchaya = await prisma.user.create({
        data: {
            name: "Atchaya",
            email: "atchaya@aaruchudar.com",
            role: Role.TechLead,
            managerId: shyam.id
        }
    });
    const Lalitha = await prisma.user.create({
        data: {
            name: "Lalitha",
            email: "lalitha@aaruchudar.com",
            role: Role.TechLead,
            managerId: jagadeesan.id
        }
    });
    const Aditya = await prisma.user.create({
        data: {
            name: "Aditya",
            email: "aditya@aaruchudar.com",
            role: Role.TechLead,
            managerId: jagadeesan.id
        }
    });
    // Employees under Lingesh
await prisma.user.createMany({
  data: [
    { name: "Kirthiga", email: "kirthiga@aaruchudar.com", role: Role.Employee, managerId: Lingesh.id },
    { name: "Sudharsana", email: "sudharsana@aaruchudar.com", role: Role.Employee, managerId: Lingesh.id },
    { name: "Ijas", email: "ijas1@aaruchudar.com", role: Role.Employee, managerId: Lingesh.id },
  ]
});

// Employees under Gokulnath
await prisma.user.createMany({
  data: [
    { name: "Thiru", email: "thiru@aaruchudar.com", role: Role.Employee, managerId: Gokulnath.id },
    { name: "Ijas", email: "ijas2@aaruchudar.com", role: Role.Employee, managerId: Gokulnath.id },
    { name: "Amuthan", email: "amuthan@aaruchudar.com", role: Role.Employee, managerId: Gokulnath.id },
  ]
});

// Employees under Sanjith
await prisma.user.createMany({
  data: [
    { name: "Vinay", email: "vinay@aaruchudar.com", role: Role.Employee, managerId: Sanjith.id },
    { name: "Amuthan", email: "amuthan2@aaruchudar.com", role: Role.Employee, managerId: Sanjith.id },
    { name: "Shelsia", email: "shelsia@aaruchudar.com", role: Role.Employee, managerId: Sanjith.id },
    { name: "Sudharsana", email: "sudharsana2@aaruchudar.com", role: Role.Employee, managerId: Sanjith.id },
    { name: "Sujith", email: "sujith1@aaruchudar.com", role: Role.Employee, managerId: Sanjith.id },
  ]
});

// Employees under Archana
await prisma.user.createMany({
  data: [
    { name: "Niroshini", email: "niroshini@aaruchudar.com", role: Role.Employee, managerId: Archanda.id },
    { name: "Shelsia", email: "shelsia2@aaruchudar.com", role: Role.Employee, managerId: Archanda.id },
    { name: "Yuvanesh", email: "yuvanesh@aaruchudar.com", role: Role.Employee, managerId: Archanda.id },
  ]
});

// Employees under Atchaya
await prisma.user.create({
  data: { name: "Ijas", email: "ijas3@aaruchudar.com", role: Role.Employee, managerId: Atchaya.id }
});

// Employees under Lalitha
await prisma.user.createMany({
  data: [
    { name: "Manibabu", email: "manibabu@aaruchudar.com", role: Role.Employee, managerId: Lalitha.id },
    { name: "Sanjay", email: "sanjay1@aaruchudar.com", role: Role.Employee, managerId: Lalitha.id },
    { name: "Arun", email: "arun1@aaruchudar.com", role: Role.Employee, managerId: Lalitha.id },
    { name: "Nivrika Gour", email: "nivrika@aaruchudar.com", role: Role.Employee, managerId: Lalitha.id },
    { name: "Sujith", email: "sujith2@aaruchudar.com", role: Role.Employee, managerId: Lalitha.id },
  ]
});

// Employees under Aditya
await prisma.user.createMany({
  data: [
    { name: "Rishabh", email: "rishabh@aaruchudar.com", role: Role.Employee, managerId: Aditya.id },
    { name: "Sanjay", email: "sanjay2@aaruchudar.com", role: Role.Employee, managerId: Aditya.id },
    { name: "Arun", email: "arun2@aaruchudar.com", role: Role.Employee, managerId: Aditya.id },
  ]
});

}


main()
    .then(() => console.log("✅ Seeding done"))
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

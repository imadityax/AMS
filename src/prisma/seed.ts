import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order
  await prisma.userManager.deleteMany();
  await prisma.user.deleteMany();

  // Create all users first (each only once)
  const users = await prisma.user.createMany({
    data: [
      // Super Admin
      { name: "Aashika Nethaji", email: "aashika@aaruchudar.com", role: Role.SuperAdmin },
      
      // Admins
      { name: "Venkat B", email: "venkat@aaruchudar.com", role: Role.Admin },
      { name: "Karthik M", email: "karthik@aaruchudar.com", role: Role.Admin },
      
      // Managers
      { name: "Shiyam Sundar G", email: "shiyam@aaruchudar.com", role: Role.Manager },
      { name: "Jagadeesan S", email: "jagadeesan@aaruchudar.com", role: Role.Manager },
      
      // Tech Leads
      { name: "Lingesh S", email: "lingesh@aaruchudar.com", role: Role.TechLead },
      { name: "Gokulnath S", email: "gokulnath@aaruchudar.com", role: Role.TechLead },
      { name: "Sanjith Kumar R", email: "sanjith@aaruchudar.com", role: Role.TechLead },
      { name: "Archana T P", email: "archana@aaruchudar.com", role: Role.TechLead },
      { name: "Atchaya S", email: "atchaya@aaruchudar.com", role: Role.TechLead },
      { name: "Lalitha Kishore", email: "kishore@aaruchudar.com", role: Role.TechLead },
      { name: "Aditya Yadav", email: "aditya@aaruchudar.com", role: Role.TechLead },
      { name: "Aditya Yadav", email: "adityayadav6661@gmail.com", role: Role.TechLead },
      
      
      // Employees
      { name: "Kirthiga J.S", email: "kirthiga@aaruchudar.com", role: Role.Employee },
      { name: "Sudharsana R", email: "sudharsana@aaruchudar.com", role: Role.Employee },
      { name: "Mohamed Ijas", email: "ijas@aaruchudar.com", role: Role.Employee },
      { name: "Thirukumaran A", email: "thirukumaran@aaruchudar.com", role: Role.Employee },
      { name: "Amuthan S", email: "amuthan@aaruchudar.com", role: Role.Employee },
      { name: "Sanjay S", email: "sanjay@aaruchudar.com", role: Role.Employee },
      { name: "Jaggupalli Pujith Vinay", email: "pujith@aaruchudar.com", role: Role.Employee },
      { name: "Shelsia Sharon", email: "shelsia@aaruchudar.com", role: Role.Employee },
      { name: "Sujith Balaji", email: "sujith@aaruchudar.com", role: Role.Employee },
      { name: "Niroshini A", email: "niroshini@aaruchudar.com", role: Role.Employee },
      { name: "Donadri Naga Venkata Manibabu", email: "venkatamanibabu@aaruchudar.com", role: Role.Employee },
      { name: "Nirvika Gour", email: "nirvika@aaruchudar.com", role: Role.Employee },
      { name: "Arun Kumar", email: "arun@aaruchudar.com", role: Role.Employee },
      { name: "Rishabh Mishra", email: "rishabh@aaruchudar.com", role: Role.Employee },
    ]
  });

  console.log(`Created ${users.count} users`);

  // Get all users with their emails for reference
  const allUsers = await prisma.user.findMany();
  const userMap = new Map(allUsers.map(user => [user.email, user]));

  // Define reporting relationships
  const reportingRelationships = [
    // Admin reporting to Super Admin
    { userEmail: "venkat@aaruchudar.com", managerEmail: "aashika@aaruchudar.com" },
    { userEmail: "karthik@aaruchudar.com", managerEmail: "aashika@aaruchudar.com" },
    
    // Managers reporting to Admins
    { userEmail: "shiyam@aaruchudar.com", managerEmail: "venkat@aaruchudar.com" },
    { userEmail: "jagadeesan@aaruchudar.com", managerEmail: "karthik@aaruchudar.com" },
    
    // Tech Leads reporting to Managers
    { userEmail: "lingesh@aaruchudar.com", managerEmail: "shiyam@aaruchudar.com" },
    { userEmail: "gokulnath@aaruchudar.com", managerEmail: "shiyam@aaruchudar.com" },
    { userEmail: "sanjith@aaruchudar.com", managerEmail: "shiyam@aaruchudar.com" },
    { userEmail: "archana@aaruchudar.com", managerEmail: "shiyam@aaruchudar.com" },
    { userEmail: "atchaya@aaruchudar.com", managerEmail: "shiyam@aaruchudar.com" },
    { userEmail: "kishore@aaruchudar.com", managerEmail: "jagadeesan@aaruchudar.com" },
    { userEmail: "aditya@aaruchudar.com", managerEmail: "jagadeesan@aaruchudar.com" },
    
    // Employees under Lingesh
    { userEmail: "kirthiga@aaruchudar.com", managerEmail: "lingesh@aaruchudar.com" },
    { userEmail: "sudharsana@aaruchudar.com", managerEmail: "lingesh@aaruchudar.com" },
    { userEmail: "ijas@aaruchudar.com", managerEmail: "lingesh@aaruchudar.com" },
    
    // Employees under Gokulnath
    { userEmail: "thirukumaran@aaruchudar.com", managerEmail: "gokulnath@aaruchudar.com" },
    { userEmail: "amuthan@aaruchudar.com", managerEmail: "gokulnath@aaruchudar.com" },
    { userEmail: "sanjay@aaruchudar.com", managerEmail: "gokulnath@aaruchudar.com" },
    
    // Employees under Sanjith
    { userEmail: "pujith@aaruchudar.com", managerEmail: "sanjith@aaruchudar.com" },
    { userEmail: "shelsia@aaruchudar.com", managerEmail: "sanjith@aaruchudar.com" },
    { userEmail: "sujith@aaruchudar.com", managerEmail: "sanjith@aaruchudar.com" },
    
    // Employees under Archana
    { userEmail: "niroshini@aaruchudar.com", managerEmail: "archana@aaruchudar.com" },
    { userEmail: "venkatamanibabu@aaruchudar.com", managerEmail: "archana@aaruchudar.com" },
    { userEmail: "nirvika@aaruchudar.com", managerEmail: "archana@aaruchudar.com" },
    
    // Employees under Atchaya
    { userEmail: "arun@aaruchudar.com", managerEmail: "atchaya@aaruchudar.com" },
    { userEmail: "rishabh@aaruchudar.com", managerEmail: "atchaya@aaruchudar.com" },
    
    // Employees under Lalitha
    { userEmail: "sujith@aaruchudar.com", managerEmail: "kishore@aaruchudar.com" },
    { userEmail: "sanjay@aaruchudar.com", managerEmail: "kishore@aaruchudar.com" },
    
    // Employees under Aditya
    { userEmail: "rishabh@aaruchudar.com", managerEmail: "aditya@aaruchudar.com" },
    { userEmail: "sanjay@aaruchudar.com", managerEmail: "aditya@aaruchudar.com" },
    { userEmail: "arun@aaruchudar.com", managerEmail: "aditya@aaruchudar.com" },
    {userEmail : "adityayadav6661@gmail.com", managerEmail : "aditya@aaruchudar.com"}
  ];

  // Create manager relationships using transaction for better performance
  const relationshipPromises = reportingRelationships.map(async (relationship) => {
    const user = userMap.get(relationship.userEmail);
    const manager = userMap.get(relationship.managerEmail);
    
    if (user && manager) {
      return prisma.userManager.create({
        data: {
          userId: user.id,
          managerId: manager.id
        }
      });
    }
  });

  await Promise.all(relationshipPromises);
  console.log(`Created ${reportingRelationships.length} manager relationships`);
}

main()
  .then(() => console.log("✅ Seeding completed successfully!"))
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
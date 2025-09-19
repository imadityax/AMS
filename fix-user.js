// fix-user.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUser() {
    try {
        console.log('Fixing user data...');

        // Find the user with the Google email
        const user = await prisma.user.findUnique({
            where: { email: 'prateekbh111@gmail.com' },
            include: { accounts: true }
        });

        if (user) {
            console.log('Found user:', user.name, user.email);

            // Delete all accounts for this user
            await prisma.account.deleteMany({
                where: { userId: user.id }
            });

            console.log('Deleted existing accounts');

            // Update user to have proper role (make them SuperAdmin for testing)
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: 'SuperAdmin',
                    name: user.name || 'Prateek Bhardwaj',
                    image: user.image || 'https://lh3.googleusercontent.com/a/ACg8ocIyMrTi3GKLtmq2jEnb5dkcKaMLmoqX4M_ySPWshQVqhSpUZAt3=s96-c'
                }
            });

            console.log('Updated user role to SuperAdmin');
        } else {
            console.log('User not found');
        }

    } catch (error) {
        console.error('Error fixing user:', error);
        throw error;
    }
}

async function main() {
    try {
        await fixUser();
        console.log('User fixed successfully!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

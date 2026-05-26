// createAdmin.js – run with `node createAdmin.js` to insert an admin user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin'; // change if you want a different username
  const adminPassword = 'admin123'; // you may hash it later
  const existing = await prisma.users.findUnique({ where: { username: adminUsername } });
  if (existing) {
    console.log('Admin user already exists.');
    return;
  }
  const admin = await prisma.users.create({
    data: {
      username: adminUsername,
      password: adminPassword, // store plain for now; consider bcrypt in production
      tipe_pengguna: 'admin',
    },
  });
  console.log('Admin user created:', admin);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

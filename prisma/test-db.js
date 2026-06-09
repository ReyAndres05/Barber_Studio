const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  console.log('Services in DB:', services);
  const barbers = await prisma.barber.findMany();
  console.log('Barbers in DB:', barbers);
  const users = await prisma.users.findMany();
  console.log('Users in DB:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

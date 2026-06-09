const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({})

async function main() {
  // Check if admin exists, if so update/recreate it with needsPasswordChange: true and Admin123*
  const adminEmail = 'admin@barberstudio.com'
  const hashedPassword = await bcrypt.hash('Admin123*', 10)
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'admin',
      phone: '1234567890',
      needsPasswordChange: true,
    },
    create: {
      name: 'Administrador Principal',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '1234567890',
      needsPasswordChange: true,
    }
  })
  console.log('Admin user seeded: admin@barberstudio.com / Admin123*')

  // Re-seed Services with COP prices (first clean them to ensure updated prices)
  await prisma.service.deleteMany()
  await prisma.service.createMany({
    data: [
      {
        name: "Corte de Pelo Imperial",
        description: "Asesoramiento de estilo, lavado con champú premium, corte personalizado a tijera/máquina, toalla caliente y peinado final con pomada orgánica.",
        price: 35000,
        duration: 45,
        category: "corte",
      },
      {
        name: "Esculpido de Barba & Ritual",
        description: "Diseño de barba con máquina y tijera, afeitado de contornos a navaja con toallas calientes aromatizadas, bálsamos de hidratación profunda y masaje relajante.",
        price: 25000,
        duration: 30,
        category: "barba",
      },
      {
        name: "Afeitado Clásico a Navaja",
        description: "Ritual tradicional para cara completa. Doble toalla caliente, espuma caliente batida a brocha de pelo de tejón, afeitado clásico, toalla fría y loción calmante.",
        price: 30000,
        duration: 40,
        category: "barba",
      },
      {
        name: "Tratamiento Facial Exfoliante",
        description: "Limpieza facial profunda con vapor de ozono, exfoliación con micropartículas de carbón activo, mascarilla purificante y masaje hidratante de rostro.",
        price: 40000,
        duration: 30,
        category: "facial",
      },
      {
        name: "Experiencia Studio Full (Combo)",
        description: "El servicio definitivo: Corte de Pelo Imperial + Esculpido de Barba & Ritual + Mascarilla Facial Exfoliante de Carbón Activo. Bebida de cortesía incluida.",
        price: 80000,
        duration: 90,
        category: "combo",
      },
    ]
  })
  console.log('Services seeded in COP')


  // Create Barbers
  const barbersCount = await prisma.barber.count()
  if (barbersCount === 0) {
    await prisma.barber.createMany({
      data: [
        {
          name: "Alexander Pierce",
          role: "Master Barber & Fundador",
          rating: 4.9,
          reviewsCount: 142,
          bio: "Con más de 12 años perfeccionando el arte de la barbería tradicional en Londres y Nueva York.",
          image: "alexander-pierce",
          status: "active",
          availableDays: "1,2,3,4,5,6", // Monday to Saturday
        },
        {
          name: "Mateo Silva",
          role: "Especialista en Estilo Urbano",
          rating: 4.8,
          reviewsCount: 98,
          bio: "Un artista en el degradado (fade) y las texturas modernas. Mateo siempre está al día con las últimas tendencias de street style urbano y cortes creativos estructurados.",
          image: "mateo-silva",
          status: "active",
          availableDays: "1,2,3,4,5", // Monday to Friday
        },
        {
          name: "Marcus Vance",
          role: "Grooming & Beard Expert",
          rating: 4.9,
          reviewsCount: 115,
          bio: "Marcus trata la barba como una escultura. Su precisión matemática en el delineado y sus amplios conocimientos en cuidado de la piel masculina garantizan una barba perfecta y saludable.",
          image: "marcus-vance",
          status: "active",
          availableDays: "2,3,4,5,6", // Tuesday to Saturday
        },
      ]
    })
    console.log('Barbers seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

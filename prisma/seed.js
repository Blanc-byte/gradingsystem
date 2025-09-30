/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('../app/generated/prisma')
const prisma = new PrismaClient()

async function main() {
  const subjectNames = [
    'Mathematics',
    'English',
    'Science',
    'Filipino',
    'Araling Panlipunan',
    'MAPEH',
    'EPP/TLE',
    'Values Education',
    'Computer',
    'Research',
  ]

  for (const name of subjectNames) {
    await prisma.subjects.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeded 10 subjects')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



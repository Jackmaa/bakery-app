import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@boulangerie.com' },
    update: {},
    create: {
      email: 'admin@boulangerie.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Create test customer
  const customerPassword = await hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Jean Dupont',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  })
  console.log(`Created customer user: ${customer.email}`)

  // Create categories
  const pains = await prisma.category.upsert({
    where: { id: 'cat-pains' },
    update: {},
    create: {
      id: 'cat-pains',
      name: 'Pains',
      description: 'Nos pains artisanaux',
      icon: 'breakfast_dining',
    },
  })

  const viennoiseries = await prisma.category.upsert({
    where: { id: 'cat-viennoiseries' },
    update: {},
    create: {
      id: 'cat-viennoiseries',
      name: 'Viennoiseries',
      description: 'Nos viennoiseries fraîches',
      icon: 'bakery_dining',
    },
  })

  const patisseries = await prisma.category.upsert({
    where: { id: 'cat-patisseries' },
    update: {},
    create: {
      id: 'cat-patisseries',
      name: 'Pâtisseries',
      description: 'Nos pâtisseries gourmandes',
      icon: 'cake',
    },
  })

  console.log('Categories created')

  // Create products
  const products = [
    {
      id: 'prod-baguette',
      name: 'Baguette Tradition',
      description: 'Notre baguette artisanale, croustillante à l\'extérieur et moelleuse à l\'intérieur.',
      price: 1.0,
      stock: 50,
      categoryId: pains.id,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATQQZndyo4RfQtA2SPPnhD9MqEo9GslG90GvqAPPBBUzaF7DGB4ybblSYu84gb2cSWPQZeNGv5Kdmkh3WUNni1-rziKWwjwm9Vn8GnRuVtGz22pDJ4YCNAYsYXcAG73i2CiznpwIrGG4q-6xn82sDS8lARv1stVNNQbEz9mVBtiDh7gM9qFMKXjMn1cHp1crpdeXuroQKXTpcCe_uGXGG7ZAzXxr-hZYn2G40mhTcKZ-i0h-DkTARyyLXR9ArCOEyypv2AkljRlKg',
    },
    {
      id: 'prod-croissant',
      name: 'Croissant au Beurre AOP',
      description: 'Un classique incontournable, pur beurre, feuilleté à la perfection.',
      price: 1.2,
      stock: 30,
      categoryId: viennoiseries.id,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvDCmaxiJdG65pNwDQOYnr2ewLvjCInoH3-yIHTGkL_UBuEfCSbTwkFB8CRvXQOfNn0yErbS1y2N2UMm_IwtlKDiBTA42DyYonAO7LPgLtkHIMuvqNmrgcY4g8KutTajgGene6TT9IvTwZgtQAPXlA-JXfD3BXOvVwDoJ1SHCowIGOny_u5a0-dXwKD_XgTUT0ydkP9v7O5R1dDweoKWmvZRaP_Le1XmEmy-IhZyghGTbJhpdldSSvrDjKLvatIsp53-cU4FH0m1Q',
    },
    {
      id: 'prod-pain-choc',
      name: 'Pain au Chocolat',
      description: 'Un délice chocolaté, croustillant et fondant.',
      price: 1.5,
      stock: 25,
      categoryId: viennoiseries.id,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqFrpopAJpWzY7OhT89T0G2xQOvva_cBkIyUEWiSE4JmPY3iarMxy3VKHaPPywK6HQe41H1UWrdBXXQECY6fr4-IiftNjBxkEnwxWmvn-ADPfbAcBJzNEnmRvl4r9v-WU34u_R-2aRf8HN_SAfYGDoGPrPtMJ8VGxOMhTaCDjEvF-Gfy2gYGH_M5Pbq9EGuBplpc5NM_4xz4PSlZhatw3wmGdaGrONuS-doDIzaRYgGijBbW_Viv7y4GKN7yQiIMWgeoDT408_yJc',
    },
    {
      id: 'prod-tarte-fraises',
      name: 'Tarte aux Fraises',
      description: 'Une tarte de saison, garnie de fraises fraîches sur une crème pâtissière onctueuse.',
      price: 3.5,
      stock: 10,
      categoryId: patisseries.id,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxysTjwOfe7mOy7nEl97NyQwrvUg4Cc5kV7vavqoJ3m8fnqcqi9ZDcvQ4VkZhNUb9sXPV1gu9IsCBJDDR5Jjgfgjwli6ewwWRs6HV3JCYBBf5W2XEyjQeGolbUhuq38XdX9TU9SK0U9W2h15eHOI-kwFeCqBLOWzgNFfuU8VFP0TyNv4R2wtaMzE02NHfv4vTBcFnZ30NIlzrtumw8ijVoSJe5X-FMDLdqFfSx6VZZJzAIbvs3QXKcGH14EhT5i0-4mb0-55n8Hv4',
    },
    {
      id: 'prod-eclair',
      name: 'Éclair au Chocolat',
      description: 'Filled with rich cream and topped with a chocolate glaze.',
      price: 2.5,
      stock: 15,
      categoryId: patisseries.id,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCHfgSHm8Kf_T55Gck06xMCyHpBeQqEMXXm2g4D4_CfoD5wUqF1mal3V_DuAQ6xfmY1A_WL8jAaNBMCF8Bf_1hSjf_yXAdJRYvBPYUSRhYQyu8vZwOTYLLcNh2M4nStz1PNQRGl8_Lx55WSlGxFYRsidupJzgtPCibqJpXZI1geIerALwnx2SLlYuyatxLemWLOM6RCzCiv9Mio11dpH-3GQrtLLnACZ1h_Wx9rpqTqSMAMr7akn63f0yyTGp1ywo4zv_JiPMQcfc',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    })
  }

  console.log('Products created')
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

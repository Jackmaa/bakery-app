import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@boulangerie.com" },
    update: {},
    create: {
      email: "admin@boulangerie.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create test customer
  const customerPassword = await hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Jean Dupont",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });
  console.log(`Created customer user: ${customer.email}`);

  // Créer les catégories
  const categories = [
    {
      name: "Pain",
      description: "Pains traditionnels et spéciaux",
      icon: "🥖",
    },
    {
      name: "Viennoiserie",
      description: "Croissants, pains au chocolat et viennoiseries",
      icon: "🥐",
    },
    {
      name: "Pâtisserie",
      description: "Gâteaux, tartes et pâtisseries",
      icon: "🍰",
    },
    {
      name: "Sandwich",
      description: "Sandwichs et formules",
      icon: "🥪",
    },
    {
      name: "Boisson",
      description: "Boissons chaudes et froides",
      icon: "☕",
    },
  ];

  console.log("📁 Création des catégories...");
  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });

    if (!existing) {
      const created = await prisma.category.create({
        data: category,
      });
      console.log(`✅ Catégorie créée: ${created.name}`);
    } else {
      console.log(`⚠️ Catégorie existe déjà: ${category.name}`);
    }
  }

  // Récupérer les IDs des catégories pour les produits
  const painCategory = await prisma.category.findFirst({
    where: { name: "Pain" },
  });
  const viennoiserieCategory = await prisma.category.findFirst({
    where: { name: "Viennoiserie" },
  });
  const patisserieCategory = await prisma.category.findFirst({
    where: { name: "Pâtisserie" },
  });

  // Créer quelques produits d'exemple
  if (painCategory && viennoiserieCategory && patisserieCategory) {
    console.log("🍞 Création de produits d'exemple...");

    const products = [
      {
        name: "Baguette Tradition",
        description:
          "Notre fameuse baguette tradition, croustillante à souhait",
        price: 1.2,
        categoryId: painCategory.id,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB4P5EOx_5nZi97CV5JEcifnd9ryA6dd6zx_CJ9V_DTLEq24zIqS3fQmNvnLcJhlqjytoDt47RQk_jrSZXBPfDvxdl_ICMZJbn7lhg5pcmEI02bHLUGljertGmhqLPFAwTR8Hq1DOp3E0_kBnnxwXQYVArf_HpQj6gauPMB3CZ3w62eOsTJQACQ1gRdA3PAc_SlD70qGRetQ03qMF8i0OITUdsw-mdRDZ_vre8Bt4KnWKy_fUc5P0yx2HhVz02mBa1I5pVBqWhzV6E",
        stock: 100,
        isAvailable: true,
      },
      {
        name: "Pain de campagne",
        description: "Pain rustique à la mie dense et savoureuse",
        price: 3.5,
        categoryId: painCategory.id,
        image: null,
        stock: 20,
        isAvailable: true,
      },
      {
        name: "Croissant au beurre",
        description: "Croissant pur beurre, croustillant et fondant",
        price: 1.5,
        categoryId: viennoiserieCategory.id,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCeSkd3PY8bOAAGLKI5o1r3TvrtuuJ-upXNxVP6R7JKl0BkjmHS75cQh4Rc9BNyiM8miSV-fzsNCpDj72SwBOwHH5-MU8lmUcE-8iFmFLyCGvPlA3l4noDaxXVPgNCflNlR0jnWk4vXTxPdEcY6SvBP6M6a7dNplsAIZaJqWeqO3zXd4TBeFW69J4jQxZhrSbMfnaecHNELtK0COtrTAPTxsYy1wGNQ99jjrVfM99uDAJXdX_ZfEpG1C4HX6YZ_uzgJuAhwwRZ98RM",
        stock: 50,
        isAvailable: true,
      },
      {
        name: "Pain au chocolat",
        description:
          "Deux barres de chocolat noir dans une pâte feuilletée dorée",
        price: 1.6,
        categoryId: viennoiserieCategory.id,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDFNMuh1jXhb27e_RMC9db7zuScUJZzj57alBJuJVjq-Qm9d45NuYlnEAwAkdtFh33fd-Cf19NZNdgfA9wDeYf2fkilsrqVxGSTxLzhoeIHuHiOcNmDbYQP0ZzlNBA-qrkzomJGlBlmJh_I9cV8T5vyUntLp1zLF75qPm7A8BzlekthD30QHua9mFGv8ZmTJg8fKf9gbEt1SaQrE_UBTtiZ_-CX1UzNmkMBAyfUdSz3cR-6WI7dzxyW_4VYSiCHXLT1egq9k-HsnFk",
        stock: 45,
        isAvailable: true,
      },
      {
        name: "Éclair au chocolat",
        description: "Pâte à choux garnie de crème pâtissière au chocolat",
        price: 3.2,
        categoryId: patisserieCategory.id,
        image: null,
        stock: 15,
        isAvailable: true,
      },
      {
        name: "Tarte aux pommes",
        description: "Tarte aux pommes maison sur pâte sablée",
        price: 18.0,
        categoryId: patisserieCategory.id,
        image: null,
        stock: 5,
        isAvailable: true,
      },
    ];

    for (const product of products) {
      const created = await prisma.product.create({
        data: product,
      });
      console.log(`✅ Produit créé: ${created.name}`);
    }
  }

  console.log("✨ Seeding terminé avec succès!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

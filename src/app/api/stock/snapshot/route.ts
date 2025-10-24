import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/stock/snapshot - Créer un snapshot de tous les stocks
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body; // "OPENING" ou "CLOSING"

    // Validation
    if (!type || !["OPENING", "CLOSING"].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez "OPENING" ou "CLOSING"' },
        { status: 400 }
      );
    }

    // Date du jour normalisée à 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer tous les produits avec leur stock actuel
    const products = await prisma.product.findMany({
      select: {
        id: true,
        stock: true,
      },
    });

    // Créer les snapshots en une seule transaction
    const snapshots = await prisma.$transaction(
      products.map((product) =>
        prisma.stockSnapshot.upsert({
          where: {
            productId_date_type: {
              productId: product.id,
              date: today,
              type: type,
            },
          },
          update: {
            stock: product.stock,
          },
          create: {
            productId: product.id,
            stock: product.stock,
            type: type,
            date: today,
          },
        })
      )
    );

    return NextResponse.json({
      message: `Snapshot ${
        type === "OPENING" ? "de début" : "de fin"
      } de journée créé avec succès`,
      count: snapshots.length,
      snapshots: snapshots,
    });
  } catch (error) {
    console.error("Erreur lors de la création du snapshot:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du snapshot" },
      { status: 500 }
    );
  }
}

// GET /api/stock/snapshot - Récupérer les snapshots
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");
    const days = searchParams.get("days"); // Nombre de jours à récupérer

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type && ["OPENING", "CLOSING"].includes(type)) {
      where.type = type;
    }

    // Filtrer par date si spécifié
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      daysAgo.setHours(0, 0, 0, 0);

      where.date = {
        gte: daysAgo,
      };
    }

    const snapshots = await prisma.stockSnapshot.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { type: "desc" }, // OPENING avant CLOSING dans l'ordre alphabétique inverse
      ],
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("Erreur lors de la récupération des snapshots:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des snapshots" },
      { status: 500 }
    );
  }
}

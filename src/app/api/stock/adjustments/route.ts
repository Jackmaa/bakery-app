import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stock/adjustments - Récupérer l'historique des ajustements
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
    const limit = searchParams.get("limit");

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}

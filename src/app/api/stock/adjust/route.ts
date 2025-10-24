import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/stock/adjust - Ajuster le stock d'un produit
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
    const { productId, quantity, type, reason } = body;

    // Validation
    if (!productId || quantity === undefined || !type) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    if (!["ADD", "REMOVE", "SET"].includes(type)) {
      return NextResponse.json(
        { error: "Type d'ajustement invalide" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: "La quantité doit être positive" },
        { status: 400 }
      );
    }

    // Récupérer le produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    const previousStock = product.stock;
    let newStock: number;

    // Calculer le nouveau stock selon le type
    switch (type) {
      case "ADD":
        newStock = previousStock + quantity;
        break;
      case "REMOVE":
        newStock = Math.max(0, previousStock - quantity);
        break;
      case "SET":
        newStock = quantity;
        break;
      default:
        return NextResponse.json(
          { error: "Type d'ajustement invalide" },
          { status: 400 }
        );
    }

    // Créer une transaction pour mettre à jour le stock et enregistrer l'ajustement
    const [updatedProduct, adjustment] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      prisma.stockAdjustment.create({
        data: {
          productId,
          quantity,
          type,
          reason: reason || "Ajustement manuel",
          previousStock,
          newStock,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      product: updatedProduct,
      adjustment,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajustement du stock:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajustement du stock" },
      { status: 500 }
    );
  }
}

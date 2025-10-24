import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/orders/[id] - Récupérer une commande spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a le droit de voir cette commande
    if (
      (session.user as any).role !== "ADMIN" &&
      order.userId !== (session.user as any).id
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la commande" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Mettre à jour le statut d'une commande
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, qrCodeScanned } = body;

    const updateData: any = {};

    // Validation du statut
    if (status) {
      const validStatuses = [
        "PENDING",
        "PREPARING",
        "READY",
        "COMPLETED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      updateData.status = status;
    }

    // Mettre à jour le scan du QR code
    if (qrCodeScanned !== undefined) {
      updateData.qrCodeScanned = qrCodeScanned;
      if (qrCodeScanned) {
        updateData.qrCodeScannedAt = new Date();
      }
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Supprimer une commande
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 401 }
      );
    }

    // Récupérer la commande avant suppression
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Si la commande est annulée ou complétée, on peut la supprimer
    // Sinon, on l'annule simplement
    if (order.status !== "CANCELLED" && order.status !== "COMPLETED") {
      // Restaurer le stock si la commande est annulée
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Marquer comme annulée au lieu de supprimer
      const cancelledOrder = await prisma.order.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        message: "La commande a été annulée et le stock restauré",
        order: cancelledOrder,
      });
    }

    // Suppression complète si déjà annulée ou complétée
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    );
  }
}

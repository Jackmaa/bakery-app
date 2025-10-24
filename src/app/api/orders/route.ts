import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/orders - Liste toutes les commandes
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: any = {};

    // Si l'utilisateur n'est pas admin, il ne voit que ses commandes
    if ((session.user as any).role !== "ADMIN") {
      where.userId = (session.user as any).id;
    } else {
      // L'admin peut filtrer par userId si spécifié
      if (userId) {
        where.userId = userId;
      }
    }

    // Filtre par status
    if (status && status !== "all") {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { items, pickupTime } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "La commande doit contenir au moins un article" },
        { status: 400 }
      );
    }

    // Récupérer les produits pour calculer les prix
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Vérifier la disponibilité et calculer les totaux
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 400 }
        );
      }

      if (!product.isAvailable) {
        return NextResponse.json(
          { error: `Le produit ${product.name} n'est plus disponible` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculer la TVA (10%)
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session.user as any).id,
        status: "PENDING",
        subtotal,
        tax,
        totalAmount,
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        items: {
          create: orderItems,
        },
      },
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

    // Décrémenter le stock des produits
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

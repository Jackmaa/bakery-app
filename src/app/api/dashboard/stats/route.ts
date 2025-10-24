import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/stats - Récupérer les statistiques du dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 401 }
      );
    }

    // Dates pour aujourd'hui et hier
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Commandes aujourd'hui
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Commandes hier
    const yesterdayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Chiffre d'affaires aujourd'hui
    const todayOrdersData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        totalAmount: true,
      },
    });
    const todayRevenue = todayOrdersData.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Chiffre d'affaires hier
    const yesterdayOrdersData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        totalAmount: true,
      },
    });
    const yesterdayRevenue = yesterdayOrdersData.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Produit le plus vendu
    const topProductData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 1,
    });

    let topProduct = "N/A";
    if (topProductData.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: topProductData[0].productId },
        select: { name: true },
      });
      if (product) {
        topProduct = product.name;
      }
    }

    // Produits avec stock faible (< 10)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10,
        },
      },
    });

    // Statistiques supplémentaires
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: weekStart,
        },
      },
    });

    const activeProducts = await prisma.product.count({
      where: {
        isAvailable: true,
      },
    });

    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({
      todayOrders,
      yesterdayOrders,
      todayRevenue,
      yesterdayRevenue,
      topProduct,
      lowStockProducts,
      weekOrders,
      activeProducts,
      totalCustomers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

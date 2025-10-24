import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stock/analytics - Données pour les graphiques
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
    const days = parseInt(searchParams.get("days") || "30");

    // Date de début
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    if (productId) {
      // Données pour un produit spécifique
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, image: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Produit non trouvé" },
          { status: 404 }
        );
      }

      const snapshots = await prisma.stockSnapshot.findMany({
        where: {
          productId: productId,
          date: { gte: startDate },
        },
        orderBy: [{ date: "asc" }, { type: "asc" }],
      });

      // Formater les données pour le graphique
      const chartData = snapshots.map((snapshot) => ({
        date: snapshot.date.toISOString().split("T")[0],
        type: snapshot.type,
        stock: snapshot.stock,
        label: snapshot.type === "OPENING" ? "Début" : "Fin",
      }));

      // Calculer les statistiques
      const openingStocks = snapshots
        .filter((s) => s.type === "OPENING")
        .map((s) => s.stock);
      const closingStocks = snapshots
        .filter((s) => s.type === "CLOSING")
        .map((s) => s.stock);

      const stats = {
        avgOpening:
          openingStocks.length > 0
            ? Math.round(
                openingStocks.reduce((a, b) => a + b, 0) / openingStocks.length
              )
            : 0,
        avgClosing:
          closingStocks.length > 0
            ? Math.round(
                closingStocks.reduce((a, b) => a + b, 0) / closingStocks.length
              )
            : 0,
        maxStock: Math.max(...snapshots.map((s) => s.stock), 0),
        minStock: Math.min(...snapshots.map((s) => s.stock), 0),
        avgDailyConsumption: 0,
      };

      // Calculer la consommation moyenne quotidienne
      const dailyConsumptions: number[] = [];
      for (let i = 0; i < snapshots.length - 1; i++) {
        if (
          snapshots[i].type === "OPENING" &&
          snapshots[i + 1].type === "CLOSING"
        ) {
          const consumption = snapshots[i].stock - snapshots[i + 1].stock;
          dailyConsumptions.push(consumption);
        }
      }
      if (dailyConsumptions.length > 0) {
        stats.avgDailyConsumption = Math.round(
          dailyConsumptions.reduce((a, b) => a + b, 0) /
            dailyConsumptions.length
        );
      }

      return NextResponse.json({
        product,
        chartData,
        stats,
        period: {
          start: startDate.toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
          days: days,
        },
      });
    } else {
      // Vue d'ensemble de tous les produits
      const snapshots = await prisma.stockSnapshot.findMany({
        where: {
          date: { gte: startDate },
          type: "CLOSING", // Seulement les stocks de fin de journée
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });

      // Grouper par produit
      const productMap = new Map<string, any>();

      snapshots.forEach((snapshot) => {
        if (!productMap.has(snapshot.productId)) {
          productMap.set(snapshot.productId, {
            product: snapshot.product,
            data: [],
          });
        }
        productMap.get(snapshot.productId)!.data.push({
          date: snapshot.date.toISOString().split("T")[0],
          stock: snapshot.stock,
        });
      });

      const productsData = Array.from(productMap.values()).map((item) => {
        const stocks = item.data.map((d: any) => d.stock);
        return {
          product: item.product,
          data: item.data,
          stats: {
            avgStock: Math.round(
              stocks.reduce((a: number, b: number) => a + b, 0) / stocks.length
            ),
            maxStock: Math.max(...stocks),
            minStock: Math.min(...stocks),
            trend:
              stocks.length >= 2 ? stocks[stocks.length - 1] - stocks[0] : 0,
          },
        };
      });

      return NextResponse.json({
        productsData,
        period: {
          start: startDate.toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
          days: days,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analytics" },
      { status: 500 }
    );
  }
}

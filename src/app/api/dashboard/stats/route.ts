import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Commandes du jour
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    // Commandes d'hier
    const yesterdayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Chiffre d'affaires du jour
    const todayRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    })

    // Chiffre d'affaires d'hier
    const yesterdayRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    })

    // Produit le plus vendu aujourd'hui
    const topProductToday = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: today,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 1,
    })

    let topProduct = 'N/A'
    if (topProductToday.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: topProductToday[0].productId },
      })
      if (product) {
        topProduct = product.name
      }
    }

    // Calculer les pourcentages de changement
    const ordersChange = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
      : todayOrders > 0 ? 100 : 0

    const revenueChange = (yesterdayRevenue._sum.totalAmount || 0) > 0
      ? ((((todayRevenue._sum.totalAmount || 0) - (yesterdayRevenue._sum.totalAmount || 0)) / (yesterdayRevenue._sum.totalAmount || 0)) * 100)
      : (todayRevenue._sum.totalAmount || 0) > 0 ? 100 : 0

    return NextResponse.json({
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      topProduct,
      ordersChange: Math.round(ordersChange),
      revenueChange: Math.round(revenueChange),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

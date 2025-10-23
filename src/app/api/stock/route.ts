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

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 15,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    })

    return NextResponse.json(lowStockProducts)
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du stock' },
      { status: 500 }
    )
  }
}

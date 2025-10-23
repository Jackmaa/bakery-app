import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur a le droit de voir cette commande
    const isAdmin = (session.user as any).role === 'ADMIN'
    const isOwner = order.userId === (session.user as any).id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'COMPLETED' && { qrCodeScannedAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { qrCode } = body

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code manquant' },
        { status: 400 }
      )
    }

    // Parser le QR code
    let qrData
    try {
      qrData = JSON.parse(qrCode)
    } catch {
      return NextResponse.json(
        { error: 'QR code invalide' },
        { status: 400 }
      )
    }

    // Trouver la commande
    const order = await prisma.order.findUnique({
      where: { orderNumber: qrData.orderNumber },
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

    if (order.qrCodeScanned) {
      return NextResponse.json(
        { error: 'Cette commande a déjà été scannée' },
        { status: 400 }
      )
    }

    // Mettre à jour le stock pour chaque produit
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Marquer la commande comme scannée et terminée
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        qrCodeScanned: true,
        qrCodeScannedAt: new Date(),
        status: 'COMPLETED',
      },
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

    return NextResponse.json({
      message: 'Commande validée avec succès',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json(
      { error: 'Erreur lors du scan du QR code' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber, calculateTax } from '@/lib/utils'
import { sendOrderConfirmationEmail } from '@/lib/email'
import QRCode from 'qrcode'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = (session.user as any).id
    const isAdmin = (session.user as any).role === 'ADMIN'

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      )
    }

    // Vérifier le stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculer les totaux
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )
    const tax = calculateTax(subtotal)
    const totalAmount = subtotal + tax

    // Générer le QR code
    const orderNumber = generateOrderNumber()
    const qrCodeData = JSON.stringify({
      orderNumber,
      timestamp: Date.now(),
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session.user as any).id,
        status: 'PENDING',
        subtotal,
        tax,
        totalAmount,
        qrCode: qrCodeData,
        pickupTime: new Date(Date.now() + 25 * 60 * 1000), // +25 minutes
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Envoyer l'email de confirmation
    try {
      await sendOrderConfirmationEmail(session.user.email!, {
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.totalAmount,
        pickupTime: order.pickupTime || undefined,
        qrCode: qrCode,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Continue même si l'email échoue
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

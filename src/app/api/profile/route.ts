import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

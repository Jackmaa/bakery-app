# Boulangerie App

Application e-commerce moderne pour boulangerie avec **Next.js 16 + TypeScript + Prisma + NextAuth**.  
Elle inclut un **système de commandes en ligne**, une **gestion de stock**, un **système de QR codes** pour la validation des commandes, et un **dashboard administrateur** complet.

---

## ✨ Features

- 🛒 **E-commerce complet** : catalogue produits, panier, commandes
- 🔐 **Authentification** : NextAuth avec Google OAuth + credentials
- 📱 **QR Code System** : génération et scan pour validation des commandes
- 📊 **Dashboard Admin** : statistiques, gestion stock, commandes
- 🎨 **UI moderne** : TailwindCSS avec design responsive
- 📧 **Notifications email** : confirmations de commande avec QR code
- 🗄️ **Base de données** : Prisma + SQLite avec modèles optimisés

---

## 🛠 Stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) (ORM + migrations)
- [NextAuth.js](https://next-auth.js.org/) (authentification)
- [Tailwind CSS](https://tailwindcss.com/) (styling)
- [React Query](https://tanstack.com/query) (state management)
- [Zustand](https://zustand-demo.pmnd.rs/) (panier persistant)
- [React Hot Toast](https://react-hot-toast.com/) (notifications)

---

## 🚀 Démarrage

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
git clone https://github.com/votre-username/bakery-app.git
cd bakery-app
npm install
```

### Configuration

1. **Variables d'environnement** - Créer `.env.local` :

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optionnel)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

2. **Base de données** :

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Seeder avec données de test
npm run seed
```

3. **Démarrer le serveur** :

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

---

## 👥 Comptes de test

Après le seeding, vous pouvez vous connecter avec :

- **Admin** : `admin@boulangerie.com` / `admin123`
- **Client** : `client@example.com` / `customer123`

---

## 🎯 Fonctionnalités principales

### Pour les clients

- **Catalogue produits** : navigation par catégories (Pains, Viennoiseries, Pâtisseries)
- **Panier intelligent** : persistance locale, calcul automatique des totaux
- **Commandes** : historique, statuts en temps réel
- **Profil utilisateur** : gestion des informations personnelles

### Pour les administrateurs

- **Dashboard** : statistiques ventes, commandes du jour
- **Gestion produits** : CRUD complet avec images
- **Gestion stock** : alertes stock faible, mise à jour automatique
- **Scanner QR** : validation des commandes via QR code
- **Gestion commandes** : suivi statuts, détails clients

---

## 📱 QR Code System

Le système de QR codes permet la validation des commandes :

1. **Génération** : QR code créé automatiquement à la commande
2. **Email** : QR code envoyé par email au client
3. **Scan** : Interface admin pour scanner et valider
4. **Stock** : Mise à jour automatique du stock après validation

---

## 🗄️ Modèles de données

```prisma
User (id, email, name, role, password)
Category (id, name, description, icon)
Product (id, name, price, stock, categoryId, isAvailable)
Order (id, orderNumber, userId, status, totalAmount, qrCode)
OrderItem (id, orderId, productId, quantity, price)
```

---

## 🎨 Design System

- **Couleurs** : Palette chaleureuse (beiges, oranges)
- **Typographie** : Epilogue (Google Fonts)
- **Icons** : Material Symbols Outlined
- **Responsive** : Mobile-first design
- **Thème** : Support clair/sombre

---

## 📦 API Routes

| Route                     | Méthode   | Description            |
| ------------------------- | --------- | ---------------------- |
| `/api/auth/[...nextauth]` | GET/POST  | Authentification       |
| `/api/products`           | GET       | Liste des produits     |
| `/api/orders`             | GET/POST  | Gestion commandes      |
| `/api/orders/[id]`        | GET/PATCH | Détail/update commande |
| `/api/scan`               | POST      | Scan QR code           |
| `/api/dashboard/stats`    | GET       | Statistiques admin     |
| `/api/stock`              | GET       | État du stock          |

---

## 🧩 Architecture

```
src/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Routes d'authentification
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard admin
│   ├── menu/              # Catalogue produits
│   ├── cart/              # Panier
│   └── orders/            # Commandes
├── components/            # Composants réutilisables
├── context/               # React Context (Cart)
├── lib/                   # Utilitaires (auth, prisma, email)
└── types/                 # Types TypeScript
```

---

## 🚀 Déploiement

### Vercel (recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Autres plateformes

- **Railway** : Support Prisma + SQLite
- **Netlify** : Avec adaptateur Next.js
- **Docker** : Dockerfile inclus

---

## 📈 Roadmap

- [ ] **Paiements** : Intégration Stripe/PayPal
- [ ] **Notifications push** : WebSocket pour mises à jour temps réel
- [ ] **Mobile app** : React Native version
- [ ] **Analytics** : Tableaux de bord avancés
- [ ] **Multi-langues** : Support i18n
- [ ] **Tests** : Suite de tests complète

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📜 Licence

MIT © 2024 Boulangerie App

---

## 👨‍💻 Auteur

Développé avec ❤️ pour moderniser l'expérience boulangerie

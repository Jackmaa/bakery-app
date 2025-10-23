import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";

const epilogue = Epilogue({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boulangerie - Commandez en ligne",
  description: "Commandez vos produits de boulangerie en ligne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className={epilogue.className}>
        <Providers>
          <CartProvider>
            {children}
            <Toaster position="bottom-right" />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

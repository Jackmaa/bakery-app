// types/testimonial.ts
// Définition du type pour un témoignage
export interface Testimonial {
  id?: string;
  name: string;
  image: string;
  rating: number;
  comment: string;
  date?: string;
  location?: string;
}

// Exemple d'utilisation avec des données typées
export const exampleTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marie D.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ7pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cM",
    rating: 5,
    comment:
      "Les meilleurs croissants que j'ai jamais mangés ! On sent la qualité des produits et le savoir-faire. Je recommande vivement.",
    date: "2024-03-15",
    location: "Bourg-en-Bresse",
  },
  {
    id: "2",
    name: "Julien L.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ8pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cN",
    rating: 5,
    comment:
      "La baguette tradition est incroyable. Croustillante à l'extérieur, moelleuse à l'intérieur. Parfait pour le petit déjeuner.",
    date: "2024-03-12",
    location: "Lyon",
  },
  {
    id: "3",
    name: "Sophie T.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cO",
    rating: 5,
    comment:
      "Un accueil toujours chaleureux et des pâtisseries à tomber. La tarte au citron meringuée est un délice !",
    date: "2024-03-10",
    location: "Bourg-en-Bresse",
  },
];

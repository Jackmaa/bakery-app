import TestimonialCard from './TestimonialCard'

interface TestimonialsSectionProps {
  title?: string
  backgroundColor?: string
  testimonials?: Array<{
    name: string
    image: string
    rating: number
    comment: string
  }>
  columns?: 2 | 3 | 4
}

const defaultTestimonials = [
  {
    name: 'Marie D.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ7pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cM',
    rating: 5,
    comment: 'Les meilleurs croissants que j\'ai jamais mangés ! On sent la qualité des produits et le savoir-faire. Je recommande vivement.'
  },
  {
    name: 'Julien L.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ8pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cN',
    rating: 5,
    comment: 'La baguette tradition est incroyable. Croustillante à l\'extérieur, moelleuse à l\'intérieur. Parfait pour le petit déjeuner.'
  },
  {
    name: 'Sophie T.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8pZ_yQs8eN3Tz2gJ_C8zVQYLKjPxN4wR6hMfD8sT9vL2qE3rA1bK5cO',
    rating: 5,
    comment: 'Un accueil toujours chaleureux et des pâtisseries à tomber. La tarte au citron meringuée est un délice !'
  }
]

export default function TestimonialsSectionAdvanced({
  title = 'Ce que nos clients disent',
  backgroundColor = 'bg-[#f8f6f4]',
  testimonials = defaultTestimonials,
  columns = 3
}: TestimonialsSectionProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }[columns]

  return (
    <div className={`px-10 py-16 ${backgroundColor}`}>
      <h2 className="text-3xl font-bold text-center mb-12 text-[#181411]">
        {title}
      </h2>
      <div className={`grid grid-cols-1 ${gridColsClass} gap-8 max-w-6xl mx-auto`}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            image={testimonial.image}
            rating={testimonial.rating}
            comment={testimonial.comment}
          />
        ))}
      </div>
    </div>
  )
}

// Exemple d'utilisation :
// <TestimonialsSectionAdvanced 
//   title="Avis de nos clients"
//   backgroundColor="bg-white"
//   columns={2}
//   testimonials={mesTestimonials}
// />

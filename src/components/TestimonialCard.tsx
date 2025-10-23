interface TestimonialCardProps {
  name: string;
  image: string;
  rating: number;
  comment: string;
}

export default function TestimonialCard({
  name,
  image,
  rating,
  comment,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        />
        <div className="flex flex-col">
          <p className="text-base font-bold text-[#181411]">{name}</p>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-base ${
                  i < rating ? "text-yellow-500" : "text-gray-300"
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-[#897561] leading-relaxed">"{comment}"</p>
    </div>
  );
}

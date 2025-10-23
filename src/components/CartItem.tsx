import Image from 'next/image'

interface CartItemProps {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  onUpdateQuantity: (id: string, newQuantity: number) => void
  onRemove: (id: string) => void
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
  onUpdateQuantity,
  onRemove
}: CartItemProps) {
  const total = price * quantity

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-[#e6e0db] hover:shadow-sm transition-shadow">
      {/* Image du produit */}
      <div
        className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url("${image}")` }}
      />

      {/* Informations du produit */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#181411]">{name}</h3>
          <p className="text-sm text-[#897561]">{price.toFixed(2)} €</p>
        </div>

        {/* Contrôles de quantité */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[#e6e0db] rounded-lg">
            <button
              onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-[#181411] hover:bg-gray-50 rounded-l-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span className="w-8 text-center font-semibold text-[#181411]">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-[#181411] hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          <button
            onClick={() => onRemove(id)}
            className="text-red-600 hover:text-red-700 transition-colors"
            title="Retirer du panier"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>

      {/* Prix total */}
      <div className="flex items-center">
        <p className="text-lg font-bold text-[#181411]">{total.toFixed(2)} €</p>
      </div>
    </div>
  )
}

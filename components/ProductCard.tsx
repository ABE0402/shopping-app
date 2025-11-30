import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  return (
    <div 
      className="group flex flex-col bg-white rounded-lg overflow-hidden cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-sm">
            NEW
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-black hover:text-white text-black p-2.5 rounded-full shadow-lg transition-all active:scale-95 z-10"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
      
      <div className="mt-3 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1 text-xs text-gray-500">
           <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
           <span className="font-semibold text-gray-700">{product.rating}</span>
           <span>({product.reviews})</span>
        </div>

        <div className="font-bold text-gray-900">
          {product.price.toLocaleString()}원
        </div>
      </div>
    </div>
  );
};
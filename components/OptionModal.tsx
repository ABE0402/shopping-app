import React, { useState } from 'react';
import { Product } from '../types';

interface OptionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (color: string, size: string, quantity: number) => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({ product, isOpen, onClose, onConfirm }) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  // 임시 옵션 데이터 (실제로는 상품 데이터에 포함되어야 함)
  const colors = ['Black', 'White', 'Navy', 'Beige'];
  const sizes = ['S', 'M', 'L', 'XL'];

  const handleConfirm = () => {
    if (!selectedColor || !selectedSize) {
      alert("색상과 사이즈를 모두 선택해주세요.");
      return;
    }
    onConfirm(selectedColor, selectedSize, quantity);
    // 초기화
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">옵션 선택</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="font-bold text-lg mt-1">{product.price.toLocaleString()}원</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* 색상 선택 */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">색상</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    selectedColor === color 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* 사이즈 선택 */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">사이즈</label>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 rounded-lg text-sm border flex items-center justify-center transition-all ${
                    selectedSize === size 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 수량 선택 */}
          <div className="flex justify-between items-center pt-2">
            <label className="text-sm font-bold text-gray-600">수량</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform"
        >
          {(product.price * quantity).toLocaleString()}원 주문하기
        </button>
      </div>
    </div>
  );
};
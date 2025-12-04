import React from 'react';
import { CartItem } from '../types';

interface CartViewProps {
  cartItems: CartItem[];
  onRemoveFromCart: (id: number) => void;
  onGoToHome: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onRemoveFromCart,
  onGoToHome,
}) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="pb-24 px-4 pt-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">장바구니</h2>
      {cartItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-cart-shopping text-4xl mb-4 opacity-30"></i>
          <p>장바구니가 비어있습니다.</p>
          <button 
            onClick={onGoToHome}
            className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-medium"
          >
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`cart-${item.id}-${index}`} className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="ml-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">{item.price.toLocaleString()}원</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">수량: {item.quantity}</span>
                      <button onClick={() => onRemoveFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="fixed bottom-[64px] left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto flex justify-between items-center mb-4">
              <span className="text-gray-600">총 결제금액</span>
              <span className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</span>
            </div>
            <button className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-lg active:scale-[0.99] transition-transform mx-auto max-w-md block">
              구매하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};


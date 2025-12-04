import React from 'react';
import { Order } from '../types';

interface OrderHistoryViewProps {
  orders: Order[];
  onBack: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ orders, onBack }) => {
  return (
    <div className="pb-24 pt-14 bg-gray-50 min-h-screen">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-10 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-bold text-lg">주문 내역</div>
        <div className="w-10"></div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-solid fa-file-invoice text-4xl mb-3 opacity-30"></i>
            <p>아직 주문한 내역이 없습니다.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                <div>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-2">
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={`${order.id}-${idx}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.selectedColor} / {item.selectedSize} · {item.quantity}개
                      </p>
                      <p className="font-bold text-sm mt-1">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">총 결제금액</span>
                <span className="font-bold text-lg text-purple-600">{order.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
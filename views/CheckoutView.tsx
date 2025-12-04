import React, { useState } from 'react';
import { OrderItem } from '../types';

interface CheckoutViewProps {
  orderItem: OrderItem;
  onBack: () => void;
  onPaymentComplete: (address: string, request: string, paymentMethod: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ orderItem, onBack, onPaymentComplete }) => {
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  
  // ▼▼▼ 배송 요청사항 상태 ▼▼▼
  const [requestType, setRequestType] = useState('문 앞에 놔주세요');
  const [customRequest, setCustomRequest] = useState('');
  
  // ▼▼▼ 결제 수단 상태 ▼▼▼
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, BANK, KAKAO

  const totalPrice = orderItem.price * orderItem.quantity + 3000;

  const handlePayment = () => {
    if (!address) {
      alert("배송지를 입력해주세요.");
      return;
    }
    
    // 직접 입력일 경우 customRequest 사용
    const finalRequest = requestType === 'DIRECT' ? customRequest : requestType;
    const fullAddress = `${address} ${detailAddress}`;
    
    if (window.confirm(`${totalPrice.toLocaleString()}원을 결제하시겠습니까?`)) {
        onPaymentComplete(fullAddress, finalRequest, paymentMethod);
    }
  };

  return (
    <div className="pb-24 pt-14 bg-gray-50 min-h-screen">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-10 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-bold text-lg">주문/결제</div>
        <div className="w-10"></div>
      </header>

      <main className="px-4 py-6 space-y-6">
        
        {/* 1. 주문 상품 정보 */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">주문 상품</h3>
          <div className="flex gap-4">
            <img src={orderItem.image} alt={orderItem.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{orderItem.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                옵션: {orderItem.selectedColor} / {orderItem.selectedSize}
              </p>
              <div className="flex justify-between items-end mt-2">
                <span className="text-sm text-gray-500">{orderItem.quantity}개</span>
                <span className="font-bold text-gray-900">{(orderItem.price * orderItem.quantity).toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 배송지 정보 */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-lg">배송지 정보</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="주소 입력" 
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="상세 주소" 
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </div>
          
          {/* ▼▼▼ 배송 요청사항 (사라졌던 부분 복구) ▼▼▼ */}
          <div className="mt-2">
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">배송 요청사항</label>
            <select 
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black appearance-none"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              <option value="문 앞에 놔주세요">문 앞에 놔주세요</option>
              <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
              <option value="택배함에 맡겨주세요">택배함에 맡겨주세요</option>
              <option value="배송 전에 연락주세요">배송 전에 연락주세요</option>
              <option value="DIRECT">직접 입력</option>
            </select>
            {/* 직접 입력 선택 시 인풋창 표시 */}
            {requestType === 'DIRECT' && (
              <input 
                type="text" 
                placeholder="요청사항을 입력해주세요" 
                className="w-full p-3 mt-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
              />
            )}
          </div>
        </section>

        {/* 3. 결제 수단 */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">결제 수단</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CARD', label: '신용카드', icon: 'fa-credit-card' },
              { id: 'BANK', label: '무통장', icon: 'fa-money-bill-wave' },
              { id: 'KAKAO', label: '카카오페이', icon: 'fa-comment' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  paymentMethod === method.id 
                    ? 'border-black bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${method.icon} text-xl mb-1`}></i>
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. 최종 결제 금액 */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">상품 금액</span>
            <span className="text-gray-900">{(orderItem.price * orderItem.quantity).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 text-sm">배송비</span>
            <span className="text-gray-900">3,000원</span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-bold text-lg">총 결제금액</span>
            <span className="font-bold text-xl text-purple-600">{totalPrice.toLocaleString()}원</span>
          </div>
        </section>

      </main>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 max-w-md mx-auto">
        <button 
          onClick={handlePayment}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <span>{totalPrice.toLocaleString()}원 결제하기</span>
        </button>
      </div>
    </div>
  );
};
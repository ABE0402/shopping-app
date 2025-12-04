import React, { useState, useEffect } from 'react';
import { Product, Order } from '../types';
import { ProductForm } from './ProductForm';
import { adminOrderService, orderService } from '../services/dbService';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onLogout: () => void;
  onGoToHome: () => void;
}

// 탭 메뉴 타입 정의
type AdminTab = 'PRODUCTS' | 'ORDERS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProducts,
  onLogout,
  onGoToHome,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('PRODUCTS');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // 전체 주문 내역 상태
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Firebase에서 전체 주문 내역 불러오기
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const orders = await adminOrderService.getAllOrders();
        setAllOrders(orders);
      } catch (error) {
        console.error('주문 내역 로드 실패:', error);
        setAllOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
    
    // 주문 관리 탭이 활성화되어 있을 때 주기적으로 새로고침 (선택사항)
    if (activeTab === 'ORDERS') {
      const interval = setInterval(loadOrders, 5000); // 5초마다 새로고침
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      const updated = products.map(p => p.id === product.id ? product : p);
      onUpdateProducts(updated);
    } else {
      const newProduct = { ...product, id: Date.now() };
      onUpdateProducts([newProduct, ...products]);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // 배송 상태 변경 핸들러
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // 1. 관리자 주문 내역 업데이트
      await adminOrderService.updateAdminOrderStatus(orderId, newStatus);
      
      // 2. 사용자 주문 내역도 함께 업데이트
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // 3. 로컬 상태 업데이트
      const updatedOrders = allOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setAllOrders(updatedOrders);
      
      alert('주문 상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error);
      alert('주문 상태 업데이트에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* 관리자 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-purple-600"></i>
                관리자 대시보드
              </h1>
              {/* 탭 메뉴 */}
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => setActiveTab('PRODUCTS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'PRODUCTS' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  상품 관리
                </button>
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'ORDERS' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  주문 관리
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onGoToHome} className="text-sm text-gray-500 hover:text-black">
                홈으로
              </button>
              <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-bold">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* === 1. 상품 관리 탭 === */}
        {activeTab === 'PRODUCTS' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-700">등록된 상품 ({products.length})</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> 상품 등록
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={() => handleEditProduct(product)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-blue-600 shadow-sm">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-red-600 shadow-sm">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="font-bold text-lg">{product.price.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* === 2. 주문 관리 탭 === */}
        {activeTab === 'ORDERS' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-700">전체 주문 내역 ({allOrders.length})</h2>
              <button
                onClick={() => {
                  const loadOrders = async () => {
                    setIsLoadingOrders(true);
                    try {
                      const orders = await adminOrderService.getAllOrders();
                      setAllOrders(orders);
                    } catch (error) {
                      console.error('주문 내역 로드 실패:', error);
                    } finally {
                      setIsLoadingOrders(false);
                    }
                  };
                  loadOrders();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                disabled={isLoadingOrders}
              >
                <i className={`fa-solid fa-rotate-right ${isLoadingOrders ? 'fa-spin' : ''}`}></i>
                새로고침
              </button>
            </div>
            
            {isLoadingOrders ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400 mb-3"></i>
                <p className="text-gray-400">주문 내역을 불러오는 중...</p>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400">아직 접수된 주문이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문정보</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문자/배송지</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제금액</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태 관리</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">{order.id}</div>
                            <div className="text-xs text-gray-500 mb-2">{new Date(order.date).toLocaleString()}</div>
                            <div className="flex flex-col gap-1">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                  <img src={item.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                  <span>{item.name} ({item.selectedColor}/{item.selectedSize}) x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">유저 ID: {order.userId || 'Guest'}</div>
                            <div className="text-sm text-gray-500 mt-1">{order.address}</div>
                            <div className="text-xs text-blue-500 mt-1">"{order.request}"</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString()}원</div>
                            <div className="text-xs text-gray-500">{order.paymentMethod === 'CARD' ? '신용카드' : '기타'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select 
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md bg-gray-50"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="결제완료">결제완료</option>
                              <option value="배송준비중">배송준비중</option>
                              <option value="배송중">배송중</option>
                              <option value="배송완료">배송완료</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 상품 등록/수정 모달 */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};
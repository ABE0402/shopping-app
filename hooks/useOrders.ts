import { useState, useEffect, useCallback } from 'react';
import { Order, OrderItem } from '../types';
import { orderService, adminOrderService } from '../services/dbService';

export const useOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 주문 내역 불러오기 함수
  const loadOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('📋 useOrders: 주문 내역 로드 시작, userId:', userId);
      const userOrders = await orderService.getUserOrders(userId);
      console.log('📋 useOrders: 주문 내역 로드 완료, 개수:', userOrders.length);
      console.log('📋 useOrders: 주문 내역 데이터:', userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error('❌ useOrders: 주문 내역 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Firebase에서 주문 내역 가져오기
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addOrder = async (
    items: OrderItem[], 
    totalAmount: number, 
    address: string, 
    request: string,
    paymentMethod: string
  ) => {
    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      items,
      totalAmount,
      date: new Date().toISOString(),
      address,
      request,
      paymentMethod,
      status: '결제완료',
    };

    try {
      console.log('📦 주문 추가 시작:', newOrder.id);
      
      // 1. 사용자 주문 내역에 저장 (orders 컬렉션)
      await orderService.addOrder(newOrder);
      console.log('✅ 사용자 주문 내역 저장 완료');
      
      // 2. 관리자 주문 내역에도 저장 (adminOrders 컬렉션)
      await adminOrderService.addAdminOrder(newOrder);
      console.log('✅ 관리자 주문 내역 저장 완료');
      
      // 3. Firebase에서 최신 주문 내역 다시 불러오기
      await loadOrders();
      console.log('✅ 주문 내역 새로고침 완료');
    } catch (error) {
      console.error('❌ 주문 추가 실패:', error);
      throw error;
    }
  };

  return { orders, addOrder, isLoading, refreshOrders: loadOrders };
};
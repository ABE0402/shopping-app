import { useState, useEffect } from 'react';
import { Order, OrderItem } from '../types';

export const useOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);

 useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }
    const savedOrders = localStorage.getItem(`orders_${userId}`);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("주문 내역 로드 실패", e);
      }
    }
  }, [userId]);

  const addOrder = (
    items: OrderItem[], 
    totalAmount: number, 
    address: string, 
    request: string,
    paymentMethod: string
  ) => {
    if (!userId) return;

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items,
      totalAmount,
      date: new Date().toISOString(),
      address,
      request,
      paymentMethod,
      status: '결제완료',
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${userId}`, JSON.stringify(updatedOrders));
  };

  return { orders, addOrder };
};
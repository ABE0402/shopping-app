import { useState, useEffect } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { productService } from '../services/dbService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProductsFromFirebase = async () => {
      try {
        const firebaseProducts = await productService.getAllProducts();
        
        if (firebaseProducts.length === 0) {
          for (const product of INITIAL_PRODUCTS) {
            await productService.saveProduct(product);
          }
          setProducts(INITIAL_PRODUCTS);
        } else {
          setProducts(firebaseProducts);
        }
      } catch (error) {
        console.error('상품 로드 실패:', error);
        const saved = localStorage.getItem('products');
        if (saved) {
          try {
            setProducts(JSON.parse(saved));
          } catch {
            setProducts(INITIAL_PRODUCTS);
          }
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      }
    };

    loadProductsFromFirebase();
  }, []);

  const updateProducts = async (updatedProducts: Product[]) => {
    const currentProducts = products;
    const deletedProducts = currentProducts.filter(
      oldProduct => !updatedProducts.find(newProduct => newProduct.id === oldProduct.id)
    );
    
    for (const deletedProduct of deletedProducts) {
      try {
        await productService.deleteProduct(deletedProduct.id);
      } catch (error) {
        console.error(`❌ 상품 삭제 실패 (Firebase): ${deletedProduct.name}`, error);
      }
    }
    
    const addedOrUpdatedProducts = updatedProducts.filter(newProduct => {
      const oldProduct = currentProducts.find(p => p.id === newProduct.id);
      return !oldProduct || JSON.stringify(oldProduct) !== JSON.stringify(newProduct);
    });
    
    for (const product of addedOrUpdatedProducts) {
      try {
        await productService.saveProduct(product);
      } catch (error) {
        console.error(`❌ 상품 저장 실패 (Firebase): ${product.name}`, error);
      }
    }
    
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  return { products, updateProducts };
};


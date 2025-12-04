import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';
import { ProductForm } from './ProductForm';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProducts,
  onLogout,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '상의',
    image: '',
    rating: 0,
    reviews: 0,
    description: '',
    isNew: false,
  });

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name: formData.name || '',
      price: formData.price || 0,
      category: (formData.category as Category) || '상의',
      image: formData.image || 'https://picsum.photos/400/500?random=' + Date.now(),
      rating: formData.rating || 0,
      reviews: formData.reviews || 0,
      description: formData.description || '',
      isNew: formData.isNew || false,
    };

    onUpdateProducts([...products, newProduct]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      description: product.description,
      isNew: product.isNew,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id
        ? {
            ...selectedProduct,
            ...formData,
            category: (formData.category as Category) || selectedProduct.category,
          }
        : p
    );

    onUpdateProducts(updatedProducts);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('정말 이 상품을 삭제하시겠습니까?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: '상의',
      image: '',
      rating: 0,
      reviews: 0,
      description: '',
      isNew: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-shield-halved text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">전체 상품</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-box text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">신상품</p>
                <p className="text-3xl font-bold text-gray-900">
                  {products.filter(p => p.isNew).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-star text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">카테고리</p>
                <p className="text-3xl font-bold text-gray-900">{CATEGORIES.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-tags text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">상품 관리</h2>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            상품 등록
          </button>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이미지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.isNew && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {product.price.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductForm
          product={null}
          onSubmit={(product) => {
            // 기존 products 배열에서 최대 ID를 찾아서 +1 하거나, 타임스탬프 기반 ID 사용
            // 중복 방지를 위해 기존 ID와 비교
            const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
            let newId = product.id || maxId + 1;
            
            // ID가 이미 존재하는지 확인하고, 존재하면 새로운 고유 ID 생성
            while (products.some(p => p.id === newId)) {
              newId = Date.now() + Math.floor(Math.random() * 1000);
            }
            
            const newProduct = {
              ...product,
              id: newId
            };
            onUpdateProducts([...products, newProduct]);
            setIsAddModalOpen(false);
            resetForm();
          }}
          onCancel={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          isEdit={false}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onSubmit={(updatedProduct) => {
            const updatedProducts = products.map(p =>
              p.id === selectedProduct.id ? updatedProduct : p
            );
            onUpdateProducts(updatedProducts);
            setIsEditModalOpen(false);
            setSelectedProduct(null);
            resetForm();
          }}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
            resetForm();
          }}
          isEdit={true}
        />
      )}
    </div>
  );
};


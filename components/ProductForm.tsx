import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

interface ExtendedProductFormData {
  // 기본 정보
  name: string;
  engName: string;
  adminName: string;
  supplierName: string;
  modelName: string;
  productCode: string;
  customProductCode: string;
  productStatus: 'N' | 'U' | 'B' | 'R' | 'E' | 'F' | 'S';
  summaryDesc: string;
  simpleDesc: string;
  description: string;
  mobileDescription: string;
  
  // 판매 정보
  category: Category;
  price: number;
  taxType: 'A' | 'C' | 'B';
  taxRate: number;
  marginRate: number;
  addPrice: number;
  priceType: boolean;
  priceContent: string;
  buyLimitType: 'A' | 'M' | 'F';
  buyLimitGroups: string[];
  isSideProduct: 'F' | 'T' | 'O';
  buyUnitType: 'P' | 'O';
  buyUnit: number;
  minOrder: number;
  maxOrderType: 'F' | 'T';
  maxOrder: number;
  mileageType: 'T' | 'F';
  mileageValue: number;
  mileageUnit: 'P' | 'W';
  
  // 이미지
  image: string;
  images: string[];
  
  // 기타
  rating: number;
  reviews: number;
  isNew: boolean;
  displayGroups: string[];
  exposureLimit: 'A' | 'M';
  
  // 옵션
  useOption: boolean;
  options: Array<{
    name: string;
    values: string[];
    required: boolean;
  }>;
  addOptions: Array<{
    name: string;
    necessary: boolean;
    limit: number;
  }>;
  useFileOption: boolean;
  fileOptionName: string;
  fileOptionRequired: boolean;
  fileOptionSizeLimit: number;
  
  // 재고
  useStock: boolean;
  stockNumber: number;
  stockWarn: number;
  stockType: 'A' | 'B';
  soldOutType: 'A' | 'B';
  useSoldOut: boolean;
  
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'sales' | 'option' | 'stock' | 'image'>('basic');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
  const descriptionEditorRef = React.useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ExtendedProductFormData>({
    name: product?.name || '',
    engName: '',
    adminName: '',
    supplierName: '',
    modelName: '',
    productCode: '',
    customProductCode: '',
    productStatus: 'N',
    summaryDesc: '',
    simpleDesc: '',
    description: product?.description || '',
    mobileDescription: '',
    category: product?.category || '상의',
    price: product?.price || 0,
    taxType: 'A',
    taxRate: 10,
    marginRate: 10,
    addPrice: 0,
    priceType: false,
    priceContent: '',
    buyLimitType: 'A',
    buyLimitGroups: [],
    isSideProduct: 'F',
    buyUnitType: 'O',
    buyUnit: 1,
    minOrder: 1,
    maxOrderType: 'F',
    maxOrder: 0,
    mileageType: 'T',
    mileageValue: 0,
    mileageUnit: 'P',
    image: product?.image || '',
    images: [],
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    isNew: product?.isNew || false,
    displayGroups: [],
    exposureLimit: 'A',
    useOption: false,
    options: [],
    useStock: false,
    stockNumber: 0,
    stockWarn: 0,
    stockType: 'A',
    soldOutType: 'B',
    useSoldOut: false,
    addOptions: [],
    useFileOption: false,
    fileOptionName: '',
    fileOptionRequired: true,
    fileOptionSizeLimit: 2,
  });

  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');
  const isInternalUpdateRef = useRef(false);

  // contentEditable 초기값 설정 및 외부 변경 시 동기화
  useEffect(() => {
    if (descriptionEditorRef.current && !isInternalUpdateRef.current) {
      descriptionEditorRef.current.innerHTML = formData.description || '';
    }
    isInternalUpdateRef.current = false;
  }, [formData.description]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }
    if (formData.price <= 0) {
      alert('판매가를 입력해주세요.');
      return;
    }
    if (!formData.image.trim()) {
      alert('대표 이미지를 입력해주세요.');
      return;
    }
    
    // ID 생성: 수정 모드면 기존 ID 사용, 새 상품이면 고유 ID 생성
    // 타임스탬프 + 랜덤 숫자를 조합하여 중복 방지
    const newProduct: Product = {
      id: product?.id || Date.now() + Math.floor(Math.random() * 1000), // 타임스탬프 + 랜덤으로 고유 ID 보장
      name: formData.name,
      price: formData.price,
      category: formData.category,
      image: formData.image || 'https://picsum.photos/400/500?random=' + Date.now(),
      rating: formData.rating,
      reviews: formData.reviews,
      description: formData.description || formData.simpleDesc || formData.summaryDesc,
      isNew: formData.isNew,
    };
    onSubmit(newProduct);
  };

  const addOption = () => {
    if (!newOptionName || !newOptionValues) return;
    const values = newOptionValues.split(',').map(v => v.trim()).filter(v => v);
    setFormData({
      ...formData,
      options: [...formData.options, {
        name: newOptionName,
        values,
        required: false,
      }],
    });
    setNewOptionName('');
    setNewOptionValues('');
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: 'basic', label: '기본 정보', icon: 'fa-file-lines' },
    { id: 'sales', label: '판매 정보', icon: 'fa-tag' },
    { id: 'image', label: '상품 이미지', icon: 'fa-image' },
    { id: 'option', label: '옵션 관리', icon: 'fa-list' },
    { id: 'stock', label: '재고 관리', icon: 'fa-boxes' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setFormData({ ...formData, image: result });
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleAdditionalImagePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const newFiles = [...additionalImageFiles, file];
          setAdditionalImageFiles(newFiles);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const newPreviews = [...additionalImagePreviews, result];
            setAdditionalImagePreviews(newPreviews);
            setFormData({
              ...formData,
              images: [...formData.images, result],
            });
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newFiles = [...additionalImageFiles, ...files];
      setAdditionalImageFiles(newFiles);
      
      const newPreviews: string[] = [];
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            newPreviews.push(reader.result);
          }
          if (newPreviews.length === files.length) {
            setAdditionalImagePreviews([...additionalImagePreviews, ...newPreviews]);
            setFormData({
              ...formData,
              images: [...formData.images, ...newPreviews],
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newFiles = additionalImageFiles.filter((_, i) => i !== index);
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setAdditionalImageFiles(newFiles);
    setAdditionalImagePreviews(newPreviews);
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleDescriptionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const newImages = [...descriptionImages, imageUrl];
        setDescriptionImages(newImages);
        // 상세설명에 이미지 추가
        const imgTag = `<img src="${imageUrl}" alt="상품 이미지" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        const newDescription = formData.description + (formData.description ? '\n' : '') + imgTag;
        setFormData({
          ...formData,
          description: newDescription,
        });
        // contentEditable에도 이미지 추가
        if (descriptionEditorRef.current) {
          const selection = window.getSelection();
          const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = '상품 이미지';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '10px 0';
          if (range) {
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          } else {
            descriptionEditorRef.current.appendChild(document.createElement('br'));
            descriptionEditorRef.current.appendChild(img);
            descriptionEditorRef.current.appendChild(document.createElement('br'));
          }
          // contentEditable 내용을 formData에 동기화
          syncDescriptionToFormData();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const syncDescriptionToFormData = () => {
    if (descriptionEditorRef.current) {
      const htmlContent = descriptionEditorRef.current.innerHTML;
      isInternalUpdateRef.current = true;
      setFormData(prev => ({
        ...prev,
        description: htmlContent,
      }));
    }
  };

  const handleDescriptionChange = () => {
    syncDescriptionToFormData();
  };

  const handlePasteImage = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageUrl = reader.result as string;
            const newImages = [...descriptionImages, imageUrl];
            setDescriptionImages(newImages);
            
            // contentEditable에 이미지 삽입
            if (descriptionEditorRef.current) {
              const selection = window.getSelection();
              const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
              const img = document.createElement('img');
              img.src = imageUrl;
              img.alt = '상품 이미지';
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.margin = '10px 0';
              
              if (range) {
                range.insertNode(img);
                range.setStartAfter(img);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
              } else {
                descriptionEditorRef.current.appendChild(document.createElement('br'));
                descriptionEditorRef.current.appendChild(img);
                descriptionEditorRef.current.appendChild(document.createElement('br'));
              }
              
              // contentEditable 내용을 formData에 동기화
              syncDescriptionToFormData();
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-none">
          <h3 className="text-2xl font-bold text-gray-900">
            {isEdit ? '상품 수정' : '상품 등록'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-none">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 기본 정보 */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">기본 정보</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="예시) 플라워 미니 원피스"
                      maxLength={250}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      [{formData.name.length} / 250]
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      영문 상품명
                    </label>
                    <input
                      type="text"
                      value={formData.engName}
                      onChange={(e) => setFormData({ ...formData, engName: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      maxLength={250}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      [{formData.engName.length} / 250]
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품명(관리용)
                    </label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      [{formData.adminName.length} / 50]
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        공급사 상품명
                      </label>
                      <input
                        type="text"
                        value={formData.supplierName}
                        onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                        maxLength={250}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        모델명
                      </label>
                      <input
                        type="text"
                        value={formData.modelName}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        자체 상품코드
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.customProductCode}
                          onChange={(e) => setFormData({ ...formData, customProductCode: e.target.value })}
                          className="flex-1 h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                          maxLength={40}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          중복확인
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        상품상태
                      </label>
                      <select
                        value={formData.productStatus}
                        onChange={(e) => setFormData({ ...formData, productStatus: e.target.value as any })}
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="N">신상품</option>
                        <option value="U">중고상품</option>
                        <option value="B">반품상품</option>
                        <option value="R">재고상품</option>
                        <option value="E">전시상품</option>
                        <option value="F">리퍼상품</option>
                        <option value="S">스크래치상품</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 요약설명
                    </label>
                    <input
                      type="text"
                      value={formData.summaryDesc}
                      onChange={(e) => setFormData({ ...formData, summaryDesc: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      maxLength={255}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      [{formData.summaryDesc.length} / 255]
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 간략설명
                    </label>
                    <textarea
                      value={formData.simpleDesc}
                      onChange={(e) => setFormData({ ...formData, simpleDesc: e.target.value })}
                      className="w-full h-20 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      placeholder="상품의 간단한 추가 정보를 입력할 수 있습니다."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 상세설명 <span className="text-red-500">*</span>
                    </label>
                    <div className="mb-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium">
                        <i className="fa-solid fa-image"></i>
                        이미지 업로드
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDescriptionImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div
                      ref={descriptionEditorRef}
                      contentEditable
                      onInput={handleDescriptionChange}
                      onPaste={handlePasteImage}
                      className="w-full min-h-40 max-h-96 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent resize-none overflow-y-auto bg-white"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      data-placeholder="상품에 대한 상세 설명을 입력하세요. 이미지를 복사(Ctrl+V 또는 Cmd+V)하여 붙여넣거나 업로드 버튼을 사용하세요."
                      suppressContentEditableWarning
                    />
                    <style>{`
                      [contenteditable][data-placeholder]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                      }
                      [contenteditable] img {
                        max-width: 100%;
                        height: auto;
                        margin: 10px 0;
                        display: block;
                      }
                    `}</style>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모바일 상품 상세설명
                    </label>
                    <div className="mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mobileDesc"
                          value="A"
                          checked={formData.mobileDescription === ''}
                          onChange={() => setFormData({ ...formData, mobileDescription: '' })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">상품 상세설명 동일</span>
                      </label>
                      <label className="flex items-center gap-2 ml-4">
                        <input
                          type="radio"
                          name="mobileDesc"
                          value="M"
                          checked={formData.mobileDescription !== ''}
                          onChange={() => setFormData({ ...formData, mobileDescription: formData.mobileDescription || formData.description })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">직접 등록</span>
                      </label>
                    </div>
                    {formData.mobileDescription !== '' && (
                      <textarea
                        value={formData.mobileDescription}
                        onChange={(e) => setFormData({ ...formData, mobileDescription: e.target.value })}
                        className="w-full h-40 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 판매 정보 */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* 상품 분류 및 진열 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">상품 분류 및 진열</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 분류 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      {CATEGORIES.filter(c => c !== '전체').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      쇼핑몰에 상품을 진열하려면 분류를 지정해주세요.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      메인 진열
                    </label>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        {['OUTER', 'TOP', 'BOTTOM', 'DRESS', 'NEW ARRIVALS', 'SET ITEM', 'ACC/Bag/shoes'].map((group) => (
                          <label key={group} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.displayGroups.includes(group)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    displayGroups: [...formData.displayGroups, group],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    displayGroups: formData.displayGroups.filter(g => g !== group),
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{group}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      표시제한
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="exposureLimit"
                          value="A"
                          checked={formData.exposureLimit === 'A'}
                          onChange={(e) => setFormData({ ...formData, exposureLimit: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">모두에게 표시</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="exposureLimit"
                          value="M"
                          checked={formData.exposureLimit === 'M'}
                          onChange={(e) => setFormData({ ...formData, exposureLimit: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">회원에게만 표시</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 판매 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">판매 정보</h4>
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      과세 설정
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="taxType"
                          value="A"
                          checked={formData.taxType === 'A'}
                          onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">과세상품</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="taxType"
                          value="C"
                          checked={formData.taxType === 'C'}
                          onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">영세상품</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="taxType"
                          value="B"
                          checked={formData.taxType === 'B'}
                          onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">면세상품</span>
                      </label>
                    </div>
                    {formData.taxType === 'A' && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">과세율: </span>
                        <input
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                          className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right"
                        />
                        <span className="text-sm text-gray-600 ml-2">%</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">판매가 계산</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">마진율</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.marginRate}
                            onChange={(e) => setFormData({ ...formData, marginRate: Number(e.target.value) })}
                            className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">추가금액</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.addPrice}
                            onChange={(e) => setFormData({ ...formData, addPrice: Number(e.target.value) })}
                            className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right"
                          />
                          <span className="text-sm">KRW</span>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          판매가적용
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      판매가 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-40 h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent text-right"
                        required
                      />
                      <span className="text-sm text-gray-600">KRW</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      판매가 대체문구
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.priceType}
                          onChange={(e) => setFormData({ ...formData, priceType: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">사용</span>
                      </label>
                      {formData.priceType && (
                        <input
                          type="text"
                          value={formData.priceContent}
                          onChange={(e) => setFormData({ ...formData, priceContent: e.target.value })}
                          className="flex-1 h-10 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="예: 문의"
                          maxLength={20}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      구매제한
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="buyLimit"
                          value="A"
                          checked={formData.buyLimitType === 'A'}
                          onChange={(e) => setFormData({ ...formData, buyLimitType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">모두 구매 가능</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="buyLimit"
                          value="M"
                          checked={formData.buyLimitType === 'M'}
                          onChange={(e) => setFormData({ ...formData, buyLimitType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">회원에게만 표시</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      단독구매 설정
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sideProduct"
                          value="F"
                          checked={formData.isSideProduct === 'F'}
                          onChange={(e) => setFormData({ ...formData, isSideProduct: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">제한안함</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sideProduct"
                          value="T"
                          checked={formData.isSideProduct === 'T'}
                          onChange={(e) => setFormData({ ...formData, isSideProduct: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">단독구매 불가</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sideProduct"
                          value="O"
                          checked={formData.isSideProduct === 'O'}
                          onChange={(e) => setFormData({ ...formData, isSideProduct: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">단독구매 전용</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        구매 주문단위
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.buyUnitType}
                          onChange={(e) => setFormData({ ...formData, buyUnitType: e.target.value as any })}
                          className="h-10 px-3 rounded-lg border border-gray-200"
                        >
                          <option value="P">상품 기준</option>
                          <option value="O">품목 기준</option>
                        </select>
                        <input
                          type="number"
                          value={formData.buyUnit}
                          onChange={(e) => setFormData({ ...formData, buyUnit: Number(e.target.value) })}
                          className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right"
                          min="1"
                        />
                        <span className="text-sm text-gray-600">개 단위</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최소 주문수량
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={formData.minOrder}
                          onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                          className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right"
                          min="1"
                        />
                        <span className="text-sm text-gray-600">개 이상</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최대 주문수량
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maxOrder"
                          value="F"
                          checked={formData.maxOrderType === 'F'}
                          onChange={(e) => setFormData({ ...formData, maxOrderType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">제한없음</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maxOrder"
                          value="T"
                          checked={formData.maxOrderType === 'T'}
                          onChange={(e) => setFormData({ ...formData, maxOrderType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">개 이하로 제한함</span>
                        {formData.maxOrderType === 'T' && (
                          <input
                            type="number"
                            value={formData.maxOrder}
                            onChange={(e) => setFormData({ ...formData, maxOrder: Number(e.target.value) })}
                            className="w-20 h-10 px-3 rounded-lg border border-gray-200 text-right ml-2"
                            min="1"
                          />
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      적립금
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mileage"
                          value="T"
                          checked={formData.mileageType === 'T'}
                          onChange={(e) => setFormData({ ...formData, mileageType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">기본설정 사용</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mileage"
                          value="F"
                          checked={formData.mileageType === 'F'}
                          onChange={(e) => setFormData({ ...formData, mileageType: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">개별설정</span>
                      </label>
                      {formData.mileageType === 'F' && (
                        <div className="flex items-center gap-2 ml-6">
                          <input
                            type="number"
                            value={formData.mileageValue}
                            onChange={(e) => setFormData({ ...formData, mileageValue: Number(e.target.value) })}
                            className="w-24 h-10 px-3 rounded-lg border border-gray-200 text-right"
                            step="0.01"
                          />
                          <select
                            value={formData.mileageUnit}
                            onChange={(e) => setFormData({ ...formData, mileageUnit: e.target.value as any })}
                            className="h-10 px-3 rounded-lg border border-gray-200"
                          >
                            <option value="P">%</option>
                            <option value="W">원</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      할인혜택 설정
                    </label>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">할인혜택 내역</span>
                        <button
                          type="button"
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                        >
                          <i className="fa-solid fa-plus mr-2"></i>
                          할인혜택 추가
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        할인혜택을 추가하려면 '할인혜택 추가' 버튼을 클릭하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="isNew" className="text-sm text-gray-700">
                      신상품으로 표시
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 상품 이미지 */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">상품 이미지</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대표 이미지 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-black/20"
                        onPaste={handleImagePaste}
                        onClick={(e) => {
                          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'DIV') {
                            e.currentTarget.focus();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="대표 이미지 업로드 영역 (이미지를 복사하여 붙여넣을 수 있습니다)"
                      >
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 font-medium">
                          <i className="fa-solid fa-upload"></i>
                          이미지 업로드
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            required
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-3">
                          또는 이미지를 복사(Ctrl+V 또는 Cmd+V)하여 붙여넣으세요
                        </p>
                      </div>
                      {(imagePreview || formData.image) && (
                        <div className="mt-3">
                          <img
                            src={imagePreview || formData.image}
                            alt="Preview"
                            className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {imageFile && (
                            <p className="text-xs text-gray-500 mt-2">
                              파일명: {imageFile.name}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추가 이미지
                    </label>
                    <div className="space-y-3">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-black/20"
                        onPaste={handleAdditionalImagePaste}
                        onClick={(e) => {
                          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'DIV') {
                            e.currentTarget.focus();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="추가 이미지 업로드 영역 (이미지를 복사하여 붙여넣을 수 있습니다)"
                      >
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-medium">
                          <i className="fa-solid fa-upload"></i>
                          이미지 업로드 (여러 개 선택 가능)
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-3">
                          또는 이미지를 복사(Ctrl+V 또는 Cmd+V)하여 붙여넣으세요
                        </p>
                      </div>
                      {additionalImagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-3">
                          {additionalImagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={preview}
                                alt={`추가 이미지 ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 옵션 관리 */}
          {activeTab === 'option' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">옵션 관리</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="useOption"
                      checked={formData.useOption}
                      onChange={(e) => setFormData({ ...formData, useOption: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="useOption" className="text-sm font-medium text-gray-700">
                      옵션 사용
                    </label>
                  </div>

                  {formData.useOption && (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">옵션 추가</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">옵션명</label>
                            <input
                              type="text"
                              value={newOptionName}
                              onChange={(e) => setNewOptionName(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-gray-200"
                              placeholder="예: 색상, 사이즈"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">옵션값 (쉼표로 구분)</label>
                            <input
                              type="text"
                              value={newOptionValues}
                              onChange={(e) => setNewOptionValues(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-gray-200"
                              placeholder="예: 빨강, 파랑, 노랑"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addOption}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                          >
                            옵션 추가
                          </button>
                        </div>
                      </div>

                      {formData.options.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">옵션명</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">옵션값</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">필수여부</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">작업</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {formData.options.map((option, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 text-sm">{option.name}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex flex-wrap gap-1">
                                      {option.values.map((val, vIdx) => (
                                        <span
                                          key={vIdx}
                                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                                        >
                                          {val}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={option.required}
                                        onChange={(e) => {
                                          const newOptions = [...formData.options];
                                          newOptions[idx].required = e.target.checked;
                                          setFormData({ ...formData, options: newOptions });
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-xs">필수</span>
                                    </label>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => removeOption(idx)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {/* 추가입력 옵션 */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
                    <h5 className="font-medium text-gray-900 mb-3">추가입력 옵션</h5>
                    <div className="space-y-3">
                      {formData.addOptions.map((addOpt, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            value={addOpt.name}
                            onChange={(e) => {
                              const newAddOptions = [...formData.addOptions];
                              newAddOptions[idx].name = e.target.value;
                              setFormData({ ...formData, addOptions: newAddOptions });
                            }}
                            className="flex-1 h-10 px-3 rounded-lg border border-gray-200"
                            placeholder="추가옵션명"
                            maxLength={250}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`addOpt${idx}`}
                              checked={addOpt.necessary}
                              onChange={() => {
                                const newAddOptions = [...formData.addOptions];
                                newAddOptions[idx].necessary = true;
                                setFormData({ ...formData, addOptions: newAddOptions });
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs">필수</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`addOpt${idx}`}
                              checked={!addOpt.necessary}
                              onChange={() => {
                                const newAddOptions = [...formData.addOptions];
                                newAddOptions[idx].necessary = false;
                                setFormData({ ...formData, addOptions: newAddOptions });
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs">선택</span>
                          </label>
                          <select
                            value={addOpt.limit}
                            onChange={(e) => {
                              const newAddOptions = [...formData.addOptions];
                              newAddOptions[idx].limit = Number(e.target.value);
                              setFormData({ ...formData, addOptions: newAddOptions });
                            }}
                            className="h-10 px-3 rounded-lg border border-gray-200"
                          >
                            {[1, 2, 3, 4, 5, 10, 20, 30, 50, 100, 200].map((n) => (
                              <option key={n} value={n}>
                                {n}자
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                addOptions: formData.addOptions.filter((_, i) => i !== idx),
                              });
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            addOptions: [...formData.addOptions, { name: '', necessary: true, limit: 10 }],
                          });
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        <i className="fa-solid fa-plus mr-2"></i>
                        추가입력 옵션 추가
                      </button>
                    </div>
                  </div>

                  {/* 파일첨부 옵션 */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
                    <h5 className="font-medium text-gray-900 mb-3">파일첨부 옵션</h5>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.useFileOption}
                          onChange={(e) => setFormData({ ...formData, useFileOption: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">사용</span>
                      </label>
                      {formData.useFileOption && (
                        <div className="space-y-3 ml-6">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">파일첨부 옵션명</label>
                            <input
                              type="text"
                              value={formData.fileOptionName}
                              onChange={(e) => setFormData({ ...formData, fileOptionName: e.target.value })}
                              className="w-full h-10 px-3 rounded-lg border border-gray-200"
                              placeholder="예: 디자인 파일"
                              maxLength={250}
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="fileOptionRequired"
                                checked={formData.fileOptionRequired}
                                onChange={() => setFormData({ ...formData, fileOptionRequired: true })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">필수항목</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="fileOptionRequired"
                                checked={!formData.fileOptionRequired}
                                onChange={() => setFormData({ ...formData, fileOptionRequired: false })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">선택항목</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">파일 크기 제한</label>
                            <select
                              value={formData.fileOptionSizeLimit}
                              onChange={(e) => setFormData({ ...formData, fileOptionSizeLimit: Number(e.target.value) })}
                              className="h-10 px-3 rounded-lg border border-gray-200"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n}M
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              파일첨부용량: 최대 10M(개별) / 5개까지 업로드 가능
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 재고 관리 */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">재고 관리</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="useStock"
                        value="T"
                        checked={formData.useStock}
                        onChange={(e) => setFormData({ ...formData, useStock: true })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">사용함</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="useStock"
                        value="F"
                        checked={!formData.useStock}
                        onChange={(e) => setFormData({ ...formData, useStock: false })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">사용안함</span>
                    </label>
                  </div>

                  {formData.useStock && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            재고수량
                          </label>
                          <input
                            type="number"
                            value={formData.stockNumber}
                            onChange={(e) => setFormData({ ...formData, stockNumber: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-right"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            안전재고
                          </label>
                          <input
                            type="number"
                            value={formData.stockWarn}
                            onChange={(e) => setFormData({ ...formData, stockWarn: Number(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-right"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            재고 수량체크 기준
                          </label>
                          <select
                            value={formData.soldOutType}
                            onChange={(e) => setFormData({ ...formData, soldOutType: e.target.value as any })}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200"
                          >
                            <option value="A">주문기준</option>
                            <option value="B">결제기준</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            재고관리 등급
                          </label>
                          <select
                            value={formData.stockType}
                            onChange={(e) => setFormData({ ...formData, stockType: e.target.value as any })}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200"
                          >
                            <option value="A">일반재고</option>
                            <option value="B">중요재고</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useSoldOut"
                          checked={formData.useSoldOut}
                          onChange={(e) => setFormData({ ...formData, useSoldOut: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="useSoldOut" className="text-sm text-gray-700">
                          품절표시 사용
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-none bg-white">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800"
          >
            {isEdit ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};


import { Category, Product } from './types';

export const CATEGORIES: Category[] = ['전체', '상의', '하의', '아우터', '신발', '모자', '액세서리'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "오버핏 베이직 맨투맨",
    price: 39000,
    category: "상의",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    reviews: 120,
    isNew: true,
    description: "편안한 착용감과 심플한 디자인이 돋보이는 오버핏 맨투맨입니다. 데일리룩으로 활용하기 좋으며, 부드러운 안감 처리가 되어 있어 보온성이 뛰어납니다."
  },
  {
    id: 2,
    name: "와이드 데님 팬츠",
    price: 52000,
    category: "하의",
    image: "https://picsum.photos/400/500?random=2",
    rating: 4.5,
    reviews: 85,
    description: "트렌디한 와이드 핏의 데님 팬츠입니다. 롱한 기장감으로 다리가 길어 보이며, 다양한 상의와 매치하기 좋습니다."
  },
  {
    id: 3,
    name: "캐시미어 블렌드 코트",
    price: 189000,
    category: "아우터",
    image: "https://picsum.photos/400/500?random=3",
    rating: 4.9,
    reviews: 42,
    description: "고급스러운 캐시미어 혼방 소재로 제작된 코트입니다. 클래식한 디자인으로 격식 있는 자리나 데이트 룩에 완벽하게 어울립니다."
  },
  {
    id: 4,
    name: "레더 첼시 부츠",
    price: 89000,
    category: "신발",
    image: "https://picsum.photos/400/500?random=4",
    rating: 4.6,
    reviews: 30,
    description: "천연 소가죽으로 제작된 첼시 부츠입니다. 발이 편안한 쿠셔닝 인솔이 적용되었으며, 어떤 바지에도 잘 어울리는 기본 아이템입니다."
  },
  {
    id: 5,
    name: "빈티지 볼캡",
    price: 25000,
    category: "모자",
    image: "https://picsum.photos/400/500?random=5",
    rating: 4.2,
    reviews: 15,
    description: "자연스러운 워싱 처리가 돋보이는 빈티지 볼캡입니다. 사이즈 조절이 가능하며 포인트 아이템으로 활용하기 좋습니다."
  },
  {
    id: 6,
    name: "실버 체인 목걸이",
    price: 18000,
    category: "액세서리",
    image: "https://picsum.photos/400/500?random=6",
    rating: 4.4,
    reviews: 22,
    description: "심플하면서도 존재감 있는 실버 체인 목걸이입니다. 알러지 방지 처리가 되어 있어 안심하고 착용할 수 있습니다."
  },
  {
    id: 7,
    name: "옥스포드 셔츠",
    price: 45000,
    category: "상의",
    image: "https://picsum.photos/400/500?random=7",
    rating: 4.7,
    reviews: 60,
    description: "탄탄한 옥스포드 원단으로 제작된 기본 셔츠입니다. 사계절 내내 입기 좋으며, 단독으로 입거나 레이어드해서 입기 좋습니다."
  },
  {
    id: 8,
    name: "카고 조거 팬츠",
    price: 48000,
    category: "하의",
    image: "https://picsum.photos/400/500?random=8",
    rating: 4.3,
    reviews: 55,
    description: "실용적인 포켓 디테일이 살아있는 카고 조거 팬츠입니다. 스포티한 룩이나 스트릿 패션을 연출할 때 추천합니다."
  },
  {
    id: 9,
    name: "덕다운 숏패딩",
    price: 129000,
    category: "아우터",
    image: "https://picsum.photos/400/500?random=9",
    rating: 4.8,
    reviews: 200,
    isNew: true,
    description: "가볍지만 따뜻한 덕다운 충전재를 사용한 숏패딩입니다. 생활 방수 기능이 있어 눈이나 비가 오는 날에도 걱정 없습니다."
  },
  {
    id: 10,
    name: "러닝화",
    price: 69000,
    category: "신발",
    image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=800&auto=format&fit=crop",
    rating: 4.5,
    reviews: 34,
    description: "가벼운 무게와 뛰어난 통기성을 자랑하는 러닝화입니다. 운동할 때는 물론 일상 생활에서도 편안하게 신을 수 있습니다."
  }
];
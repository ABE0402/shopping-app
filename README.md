🛍️ StyleHub (스타일허브)
StyleHub는 Google의 최신 Gemini 2.5 AI 모델을 활용한 차세대 패션 쇼핑 웹 애플리케이션입니다. 단순한 쇼핑몰을 넘어, 사용자의 자연어 검색 의도를 파악하고, 가상 피팅(Virtual Try-On) 및 AI 이미지 생성을 통해 혁신적인 쇼핑 경험을 제공합니다.

✨ 주요 기능
1. 🧠 AI 기반 스마트 검색 (Smart Fashion Search)
Gemini 2.5 Flash 모델을 활용하여 사용자의 검색 의도를 분석합니다.

단순 키워드 매칭이 아닌, 상황(TPO), 스타일, 날씨 등을 고려하여 최적의 상품을 추천합니다.

예: "데이트할 때 입기 좋은 옷", "편안한 주말 룩 추천해줘"

2. 🎨 AI 패션 스튜디오 (AI Fashion Studio)
사용자의 사진과 상품 이미지를 결합하거나 새로운 스타일을 창조하는 생성형 AI 기능입니다. (Gemini 2.5 Flash Image 모델 사용)

가상 피팅 (Virtual Try-On): 내 사진과 장바구니에 담은 옷을 합성하여 실제로 입은 듯한 모습을 시뮬레이션합니다.

이미지 편집: 내 사진의 배경을 바꾸거나 분위기를 변환합니다.

예: "배경을 벚꽃이 핀 거리로 바꿔줘"

스타일 생성: 텍스트 프롬프트만으로 새로운 패션 이미지를 생성합니다.

3. 📱 모바일 퍼스트 커머스 기능
상품 탐색: 카테고리별 필터링 및 직관적인 상품 리스트.

상세 페이지: 상품 정보, 리뷰, 평점 확인.

장바구니: 상품 담기, 수량 조절 및 예상 결제 금액 확인.

내 사진 관리: 카메라 촬영 또는 갤러리 이미지를 업로드하여 AI 기능에 활용.

🛠️ 기술 스택
Frontend
Framework: React 19

Language: TypeScript

Build Tool: Vite

Styling: Tailwind CSS (클래스명 기반 추론)

Icons: FontAwesome

AI & Backend Integration
Model: Google Gemini 2.5 Flash & Gemini 2.5 Flash Image (Nano Banana)

SDK: @google/genai

🚀 설치 및 실행 방법
이 프로젝트를 로컬 환경에서 실행하려면 다음 단계가 필요합니다.

1. 프로젝트 클론 및 의존성 설치
Bash

# 저장소 클론 (생략 가능)
git clone <repository-url>
cd shopping-app

# 의존성 패키지 설치
npm install
2. 환경 변수 설정 (API Key)
Google Gemini API를 사용하기 위해 API 키가 필요합니다. 프로젝트 루트 디렉토리에 .env 파일을 생성하거나 환경 변수를 설정해야 합니다.

참고: services/geminiService.ts 파일은 process.env.API_KEY를 참조하고 있습니다. Vite 환경에 맞게 설정이 필요할 수 있습니다 (VITE_API_KEY 사용 등).

3. 개발 서버 실행
Bash

npm run dev
터미널에 표시되는 로컬 주소(예: http://localhost:5173)로 접속하여 애플리케이션을 확인합니다.

📂 프로젝트 구조
shopping-app/
├── components/       # 재사용 가능한 UI 컴포넌트 (Navbar, ProductCard 등)
├── services/         # 외부 API 통신 로직 (geminiService.ts - AI 로직 핵심)
├── App.tsx           # 메인 애플리케이션 로직 및 라우팅/상태 관리
├── types.ts          # TypeScript 타입 정의 (Product, CartItem 등)
├── constants.ts      # 초기 데이터 및 상수 (카테고리, 상품 목록)
├── index.html        # 앱 진입점
├── package.json      # 프로젝트 의존성 및 스크립트
└── README.md         # 프로젝트 문서
⚠️ 주의사항
CORS 이슈: 외부 이미지 URL을 Canvas나 AI 모델로 전송하기 위해 Base64로 변환하는 과정(urlToBase64)이 포함되어 있습니다. 이미지 서버의 CORS 설정에 따라 동작이 제한될 수 있습니다.

API 사용량: Google GenAI API 호출 시 사용량에 따른 비용이 발생할 수 있습니다.

Powered by Google Gemini 2.5

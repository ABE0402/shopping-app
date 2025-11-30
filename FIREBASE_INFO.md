# Firebase 프로젝트 정보

## 프로젝트 정보
- **프로젝트 이름**: 쇼핑 앱
- **프로젝트 ID**: 쇼핑-앱-ebaa6
- **프로젝트 번호**: 563498191716

## 다음 단계

### 1. Firebase Console에서 웹 앱 등록
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "쇼핑 앱" 프로젝트 선택
3. 설정(톱니바퀴) 아이콘 → "프로젝트 설정"
4. "내 앱" 섹션에서 웹 아이콘(</>) 클릭
5. 앱 닉네임 입력 (예: "shopping-app-web")
6. "앱 등록" 클릭

### 2. Firebase SDK 설정 정보 복사
웹 앱을 등록하면 다음과 같은 설정 정보가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "쇼핑-앱-ebaa6.firebaseapp.com",
  projectId: "쇼핑-앱-ebaa6",
  storageBucket: "쇼핑-앱-ebaa6.appspot.com",
  messagingSenderId: "563498191716",
  appId: "1:563498191716:web:..."
};
```

### 3. .env 파일 업데이트
위에서 복사한 정보를 `.env` 파일에 입력하세요:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (실제 API 키)
VITE_FIREBASE_AUTH_DOMAIN=쇼핑-앱-ebaa6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=쇼핑-앱-ebaa6
VITE_FIREBASE_STORAGE_BUCKET=쇼핑-앱-ebaa6.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=563498191716
VITE_FIREBASE_APP_ID=1:563498191716:web:... (실제 App ID)
```

### 4. Firestore 데이터베이스 활성화
1. Firebase Console에서 "Firestore Database" 메뉴 선택
2. "데이터베이스 만들기" 클릭
3. "테스트 모드로 시작" 선택
4. 위치 선택: **asia-northeast3** (서울) 권장

### 5. 서버 재시작
```bash
npm run dev
```


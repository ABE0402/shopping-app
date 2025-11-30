# Firebase 설정 가이드

## 1. Firebase Console에서 설정 정보 가져오기

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 설정(톱니바퀴) 아이콘 클릭 → "프로젝트 설정"
4. "내 앱" 섹션에서 웹 아이콘(</>) 클릭
5. 앱 닉네임 입력 후 등록
6. Firebase SDK 설정 정보 복사

## 2. .env 파일에 설정 정보 입력

`.env` 파일을 열고 다음 형식으로 입력하세요:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy... (여기에 실제 API 키 입력)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 3. Firestore 데이터베이스 활성화

1. Firebase Console에서 "Firestore Database" 메뉴 선택
2. "데이터베이스 만들기" 클릭
3. "테스트 모드로 시작" 선택 (나중에 보안 규칙 설정 가능)
4. 위치 선택 (asia-northeast3 권장 - 서울)

## 4. 서버 재시작

`.env` 파일을 수정한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 5. 확인

브라우저 콘솔에서 다음 메시지를 확인하세요:
- "Firebase에 상품이 없어 초기 상품을 저장합니다..." (첫 실행 시)
- Firebase Console → Firestore Database에서 상품 데이터 확인

## 문제 해결

### Firebase 연결 오류
- `.env` 파일의 설정 정보가 올바른지 확인
- Firestore 데이터베이스가 활성화되었는지 확인
- 서버를 재시작했는지 확인

### 데이터가 보이지 않음
- Firebase Console → Firestore Database에서 데이터 확인
- 브라우저 콘솔에서 에러 메시지 확인


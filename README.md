# 할리데이비슨 한남 인스타 자동 DM 봇

무료, 개수 제한 없는 내 계정 전용 자동 DM이에요. (페이스북 로그인 방식)

## 작동 방식
1. 릴스·게시물에 **'프로모션' / '견적' / '혜택'** 댓글 → 자동 DM "팔로우 후 '받기'라고 답장 주세요" + 댓글에 "DM 보내드렸어요!"
2. DM으로 **'받기'** → 팔로우 확인
   - 팔로우 O: 안내 → **PDF** → "관심 모델 알려주세요 + 카톡 링크"
   - 팔로우 X: "팔로우 후 다시 '받기' 보내주세요"

문구·키워드는 `lib/config.js` 에서 바꿔요.

---

## 설치

### 1단계. 인스타 앱 설정 (폰)
≡ 메뉴 → 메시지 및 스토리 답장 → 메시지 제어 → 연결된 도구 → **"메시지 액세스 허용" 켜기**

### 2단계. 페이스북 페이지 + 인스타 연결
1. 페이스북 → 메뉴 → 페이지 → **새 페이지 만들기** (예: "류화록 | 할리데이비슨 한남 상담")
2. 인스타 앱 → 프로필 편집 → **페이지** → 만든 페이지 연결

### 3단계. 메타 앱에서 권한과 토큰 (앱: harley-hannam-autodm)
1. 이용 사례 → 맞춤 설정 → **권한 및 기능** 에서 아래를 **추가**
   `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`,
   `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `business_management`
2. 상단 메뉴 **도구 → 그래프 API 탐색기**
   - 오른쪽 "Meta 앱": harley-hannam-autodm
   - "사용자 또는 페이지": **페이지 액세스 토큰 받기** → 2단계 페이지 선택 → 권한 허용
   - 생성된 토큰을 **액세스 토큰 디버거**(도구 → 액세스 토큰 디버거)에 넣고 **"액세스 토큰 연장"** → 만료 없는 페이지 토큰으로 바꿔요 → `PAGE_ACCESS_TOKEN`
3. 앱 설정 → 기본 설정 → **앱 시크릿** "표시" → `APP_SECRET`

### 4단계. GitHub에 올리기
새 저장소(Private) → 이 폴더 파일 전부 업로드 → PDF는 **`public/promo.pdf`** 로

### 5단계. Vercel 배포
Add New → Project → 저장소 Import → Framework: **Other** → 환경변수:

| 이름 | 값 |
| --- | --- |
| `PAGE_ACCESS_TOKEN` | 3단계 페이지 토큰 |
| `APP_SECRET` | 3단계 앱 시크릿 |
| `VERIFY_TOKEN` | 아무 영어 단어 (예: `harley1903`) |
| `IG_USERNAME` | `harley.seoul` |
| `PDF_URL` | `https://<주소>.vercel.app/promo.pdf` |
| `PAGE_ID` | 6단계에서 확인 후 입력 |
| `IG_USER_ID` | 6단계에서 확인 후 입력 |

Deploy

### 6단계. 연결 확인 도우미
브라우저에서 `https://<주소>/api/setup?key=<VERIFY_TOKEN>` 열기
- 페이지 이름과 연결된 인스타 계정이 나오고, **PAGE_ID / IG_USER_ID** 값을 알려줘요 → Vercel 환경변수에 넣고 **Redeploy**
- 다시 열면 `subscribe` 에 `"success": true` 가 나오면 페이지 구독 완료

### 7단계. 웹훅 연결 (메타 앱 → 이용 사례 → Webhooks)
1. 왼쪽 제품 목록에서 **Instagram** 선택
2. 콜백 URL `https://<주소>/api/webhook`, 인증 토큰 = `VERIFY_TOKEN` → **확인 및 저장**
3. 필드 **`comments`**, **`messages`** 구독 켜기

### 8단계. 앱 라이브 + 테스트
1. 앱 설정 → 기본 설정 → 개인정보처리방침 URL `https://<주소>/privacy.html` → 저장
2. 앱 모드 **개발 → 라이브**
3. 다른 계정으로 릴스에 `프로모션` 댓글 → DM 오면 `받기` → 팔로우 후 다시 `받기` → PDF 도착

---

## 안 될 때
| 증상 | 확인 |
| --- | --- |
| 웹훅 "확인 및 저장" 실패 | VERIFY_TOKEN 일치, 주소 끝 `/api/webhook` |
| 부계정엔 되는데 모르는 사람엔 안 됨 | 메타 **앱 검수(고급 액세스)** 필요. 그때 다시 알려주세요 |
| 반응 없음 | Vercel → Logs 에서 오류 확인, `/api/setup` 다시 열어 확인 |
| 메시지 액세스 오류 | 1단계 설정 |

## 매달
- PDF 교체: GitHub `public/promo.pdf` 바꿔 올리기 → 자동 재배포
- 페이지 토큰은 "연장"한 토큰이면 만료되지 않아요 (비밀번호 바꾸면 다시 발급)

## 인스타 규칙
- 댓글 1개당 자동 DM 1번, 댓글 후 7일 이내
- DM 답장은 손님이 보낸 뒤 24시간 이내
- 반응 안 한 사람에게 먼저 보내기 불가

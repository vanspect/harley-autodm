// ===== 모델명 DM → 모델 카드(제원·컬러) 자동 발송 =====
// DM에 아래 이름(별명)이 들어 있으면 그 모델 카드 이미지를 보내요.
// 띄어쓰기·대소문자는 무시하고, 여러 개가 걸리면 가장 긴 이름을 우선해요.
// (예: '로드글라이드3' 은 '로드글라이드' 보다 우선)
// 이미지는 public/models/ 폴더에 있어요. 파일 이름 = slug + _1_spec.jpg 등

export const MODEL_FOLLOW_REQUIRED = true; // 팔로우한 사람에게만 (false면 누구에게나)

export const MODELS = [
  { slug: 'nightster', name: '나잇스터', files: 2,
    alias: ['나잇스터', '나이트스터', '나잇', 'nightster', 'rh975'] },
  { slug: 'nightster-special', name: '나잇스터 스페셜', files: 2,
    alias: ['나잇스터스페셜', '나이트스터스페셜', '나잇스페셜', 'nightsterspecial', 'rh975s'] },
  { slug: 'sportster-s', name: '스포스터 S', files: 2,
    alias: ['스포스터s', '스포스터에스', '스포츠스터s', '스포츠스터', '스포스터', 'sportsters', 'sportster', 'rh1250s'] },
  { slug: 'pan-america-st', name: '팬 아메리카 1250 ST', files: 2,
    alias: ['팬아메리카', '팬암', '판아메리카', 'panamerica', 'ra1250st'] },
  { slug: 'street-bob', name: '스트리트 밥', files: 3,
    alias: ['스트리트밥', '스트릿밥', '스트리트봅', '스밥', 'streetbob', 'fxbb'] },
  { slug: 'low-rider-s', name: '로우라이더 S', files: 3,
    alias: ['로우라이더s', '로우라이더에스', '로라s', '로라에스', 'lowriders', 'fxlrs'] },
  { slug: 'low-rider-st', name: '로우라이더 ST', files: 3,
    alias: ['로우라이더st', '로우라이더에스티', '로라st', '로라에스티', 'lowriderst', 'fxlrst'] },
  { slug: 'fat-boy', name: '팻보이', files: 2,
    alias: ['팻보이', '펫보이', '패트보이', 'fatboy', 'flfb'] },
  { slug: 'heritage-classic', name: '헤리티지 클래식', files: 2,
    alias: ['헤리티지', '해리티지', '헤리티지클래식', 'heritage', 'flhc'] },
  { slug: 'breakout', name: '브레이크아웃', files: 2,
    alias: ['브레이크아웃', '브레익아웃', '브렉아웃', 'breakout', 'fxbr'] },
  { slug: 'street-glide', name: '스트리트 글라이드', files: 3,
    alias: ['스트리트글라이드', '스트릿글라이드', '스글', 'streetglide', 'flhx'] },
  { slug: 'road-glide', name: '로드 글라이드', files: 3,
    alias: ['로드글라이드', '로글', 'roadglide', 'fltrx'] },
  { slug: 'street-glide-limited', name: '스트리트 글라이드 리미티드', files: 3,
    alias: ['스트리트글라이드리미티드', '스트릿글라이드리미티드', '스글리미티드', '스글리', 'streetglidelimited', 'flhxl'] },
  { slug: 'road-glide-limited', name: '로드 글라이드 리미티드', files: 3,
    alias: ['로드글라이드리미티드', '로글리미티드', '로글리', 'roadglidelimited', 'fltrxl'] },
  { slug: 'road-glide-3', name: '로드 글라이드 3', files: 3,
    alias: ['로드글라이드3', '로드글라이드트라이크', '로글3', 'roadglide3', 'fltrt'] },
  { slug: 'street-glide-3-limited', name: '스트리트 글라이드 3 리미티드', files: 3,
    alias: ['스트리트글라이드3', '스트릿글라이드3', '스글3', 'streetglide3', 'flhlt'] },
  { slug: 'cvo-street-glide', name: 'CVO 스트리트 글라이드', files: 2,
    alias: ['cvo스트리트글라이드', 'cvo스글', 'cvostreetglide', 'flhxse'] },
  { slug: 'cvo-street-glide-limited', name: 'CVO 스트리트 글라이드 리미티드', files: 2,
    alias: ['cvo스트리트글라이드리미티드', 'cvo스글리미티드', 'cvo스글리', 'cvostreetglidelimited', 'flhxlse'] },
  { slug: 'cvo-street-glide-st', name: 'CVO 스트리트 글라이드 ST', files: 2,
    alias: ['cvo스트리트글라이드st', 'cvo스글st', 'cvostreetglidest', 'flhxstse'] },
  { slug: 'cvo-road-glide-st', name: 'CVO 로드 글라이드 ST', files: 2,
    alias: ['cvo로드글라이드st', 'cvo로글st', 'cvoroadglidest', 'fltrxstse'] },
  { slug: 'cvo-street-glide-3-limited', name: 'CVO 스트리트 글라이드 3 리미티드', files: 2,
    alias: ['cvo스트리트글라이드3', 'cvo스글3', 'cvostreetglide3', 'flhltse', 'cvo트라이크'] },
];

// 파일 이름 (1 = 제원, 2~ = 컬러)
export const modelFiles = (m) =>
  Array.from({ length: m.files }, (_, i) => `${m.slug}_${i + 1}_${i === 0 ? 'spec' : 'colors'}.jpg`);

const norm = (s = '') => s.replace(/[\s·・\-_.,!?~]/g, '').toLowerCase();
const TABLE = MODELS.flatMap((m) => m.alias.map((a) => ({ key: norm(a), m })))
  .sort((a, b) => b.key.length - a.key.length);

// DM 글에서 모델 찾기 (가장 긴 이름 우선, 없으면 null)
export function findModel(text) {
  const t = norm(text);
  if (!t) return null;
  const hit = TABLE.find(({ key }) => t.includes(key));
  return hit ? hit.m : null;
}

// 문구
export const MODEL_BEFORE_TEXT = (m) => `${m.name} 2026년식 제원·컬러 자료 보내드려요 👇`;
export const MODEL_AFTER_TEXT =
  '궁금한 점이나 마음에 드는 컬러를 이 DM으로 남겨주시면 바로 답장 드릴게요 🙂\n' +
  "'견적'이라고 보내시면 월 납입금도 바로 확인할 수 있어요.";
export const MODEL_NOT_FOLLOWING_TEXT = (m) =>
  `${m.name} 자료는 팔로워분들께 보내드리고 있어요 🙂\n` +
  `@harley.seoul 팔로우하신 뒤 다시 '${m.name}'이라고 보내주시면 바로 보내드릴게요!`;

// '제원' / '모델' 만 보냈을 때 모델 목록 안내
export const LIST_KEYWORDS = ['제원', '모델목록', '차종'];
export const LIST_TEXT =
  '보고 싶은 모델 이름을 보내주시면 제원·컬러 자료를 바로 보내드려요 👇\n\n' +
  '스포츠: 나잇스터 · 나잇스터 스페셜 · 스포스터 S\n' +
  '어드벤처: 팬 아메리카\n' +
  '크루저: 스트리트 밥 · 로우라이더 S · 로우라이더 ST · 팻보이 · 헤리티지 · 브레이크아웃\n' +
  '투어링: 스트리트 글라이드 · 로드 글라이드 · 스트리트 글라이드 리미티드 · 로드 글라이드 리미티드\n' +
  '트라이크: 로드 글라이드 3 · 스트리트 글라이드 3 리미티드\n' +
  'CVO: CVO 스트리트 글라이드 · CVO 스트리트 글라이드 리미티드 · CVO 스트리트 글라이드 ST · CVO 로드 글라이드 ST · CVO 스트리트 글라이드 3 리미티드\n\n' +
  '예) 브레이크아웃';

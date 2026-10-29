// ===== 여기만 고치면 문구와 키워드가 바뀌어요 =====

// 댓글에 이 단어가 들어 있으면 자동 DM을 보내요 (띄어쓰기·대소문자 무시)
export const COMMENT_KEYWORDS = ['프로모션', '혜택'];

// DM에 이 단어가 들어 있으면 프로모션 자료를 보내요
export const DM_KEYWORDS = ['받기', '프로모션', '혜택'];

// 1) 댓글 단 사람에게 가는 첫 DM (비공개 답장, 텍스트만 가능)
export const PRIVATE_REPLY_TEXT =
  '안녕하세요, 할리데이비슨 한남 류화록입니다 🙂\n' +
  '댓글 남겨주셔서 감사해요!\n\n' +
  "프로모션 자료는 팔로우 후 이 메시지에 '받기'라고 답장 주시면 바로 보내드려요.";

// 2) 댓글 아래에 다는 공개 답글 (빈 문자열이면 안 달아요)
export const PUBLIC_COMMENT_REPLY = 'DM 보내드렸어요! 확인해 주세요 🙂';

// 3) 자료 보내기 직전 안내 문구 (한국 시간 기준 이번 달)
const nowMonth = () => new Date(Date.now() + 9 * 3600e3).getUTCMonth() + 1;
export const BEFORE_FILE_TEXT = () => `${nowMonth()}월 프로모션 자료 보내드려요 👇`;

// 4) 자료 보낸 뒤 질문 (링크 주소를 넣으면 큰 미리보기 사진이 붙어서 주소 없이)
export const AFTER_FILE_TEXT =
  '관심 있는 모델을 이 DM으로 알려주시면, 내 조건으로 정확한 견적 바로 계산해 드릴게요 🙂\n' +
  '전화 상담은 프로필의 연락처 버튼을 눌러주세요.';

// 팔로우한 사람에게만 보내기 (false로 바꾸면 누구에게나 보내요)
export const FOLLOW_REQUIRED = true;

// 팔로우 안 한 사람이 '받기'를 보냈을 때
export const NOT_FOLLOWING_TEXT =
  '자료는 팔로워분들께 보내드리고 있어요 🙂\n' +
  "@harley.seoul 팔로우하신 뒤 다시 '받기'라고 보내주시면 바로 보내드릴게요!";

// 같은 사람에게 몇 분 안에 중복 발송하지 않기
export const DEDUPE_MINUTES = 10;

// ===== 견적 링크 =====
export const QUOTE_KEYWORDS = ['견적'];
export const QUOTE_URL = 'https://hannam-harley.vercel.app';
export const QUOTE_FOLLOW_REQUIRED = true;

// 댓글에 '견적'을 단 사람에게 가는 첫 DM
export const QUOTE_PRIVATE_REPLY_TEXT =
  '안녕하세요, 할리데이비슨 한남 류화록입니다 🙂\n' +
  '댓글 남겨주셔서 감사해요!\n\n' +
  "간단 견적 링크는 팔로우 후 이 메시지에 '견적'이라고 답장 주시면 바로 보내드려요.";

// 팔로우한 사람에게 보내는 견적 안내
export const QUOTE_BEFORE_TEXT =
  '원하는 모델로 월 납입금까지 바로 확인해 보세요 👇';
export const QUOTE_AFTER_TEXT =
  '정확한 조건은 이 DM으로 모델명 남겨주시면 바로 계산해 드릴게요 🙂';

// 팔로우 안 한 사람이 '견적'을 보냈을 때
export const QUOTE_NOT_FOLLOWING_TEXT =
  '견적 링크는 팔로워분들께 보내드리고 있어요 🙂\n' +
  "@harley.seoul 팔로우하신 뒤 다시 '견적'이라고 보내주시면 바로 보내드릴게요!";

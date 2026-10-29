// 인스타그램 API 호출 모음
// - PAGE_ACCESS_TOKEN 이 있으면: 페이스북 로그인 방식 (graph.facebook.com, 페이지 토큰)
// - IG_ACCESS_TOKEN 만 있으면: 인스타그램 로그인 방식 (graph.instagram.com)
const VERSION = process.env.GRAPH_VERSION || 'v26.0';
export const FB_MODE = () => !!process.env.PAGE_ACCESS_TOKEN;
const base = () => `https://graph.${FB_MODE() ? 'facebook' : 'instagram'}.com/${VERSION}`;
const BASE_PROXY = { toString: base };
const BASE = BASE_PROXY; // 템플릿 문자열에서 매번 현재 모드로 계산

function token() {
  const t = process.env.PAGE_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
  if (!t) throw new Error('PAGE_ACCESS_TOKEN(또는 IG_ACCESS_TOKEN) 환경변수가 없어요');
  return t;
}

// 페이스북 방식: 페이지를 앱 웹훅에 구독시키기 (설치 때 한 번, /api/setup 에서 호출)
export async function subscribePage() {
  const pageId = process.env.PAGE_ID;
  if (!pageId) throw new Error('PAGE_ID 환경변수가 없어요');
  const fields = 'feed';
  const res = await fetch(`${base()}/${pageId}/subscribed_apps?subscribed_fields=${fields}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function call(path, body, method = 'POST') {
  if (process.env.DRY_RUN === '1') {
    console.log('[DRY_RUN]', method, path, JSON.stringify(body));
    return { dry_run: true };
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Instagram API 오류', res.status, path, JSON.stringify(data));
    throw new Error(`API ${res.status}`);
  }
  return data;
}

// DM 보낸 사람이 내 계정을 팔로우하는지 (DM을 보낸 사람만 조회 가능)
export async function isFollower(userId) {
  if (process.env.DRY_RUN === '1') return process.env.DRY_FOLLOWS !== '0';
  const res = await fetch(`${BASE}/${userId}?fields=username,is_user_follow_business`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('팔로우 확인 실패', res.status, JSON.stringify(data));
    return false;
  }
  return data.is_user_follow_business === true;
}

// 댓글 단 사람에게 비공개 DM (댓글 1개당 1번, 7일 이내)
export const privateReply = (commentId, text) =>
  call('/me/messages', { recipient: { comment_id: commentId }, message: { text } });

// 댓글 아래 공개 답글
export const replyToComment = (commentId, message) =>
  call(`/${commentId}/replies`, { message });

// DM 텍스트 (상대가 먼저 DM 보낸 뒤 24시간 이내)
export const sendText = (userId, text) =>
  call('/me/messages', { recipient: { id: userId }, message: { text } });

// DM 파일 (PDF, 25MB 이하, 공개 URL)
export const sendFile = (userId, url) =>
  call('/me/messages', {
    recipient: { id: userId },
    message: { attachment: { type: 'file', payload: { url } } },
  });

// DM 이미지 (최대 10장, png/jpg 8MB 이하)
export async function sendImages(userId, urls) {
  const list = urls.slice(0, 10);
  if (FB_MODE()) {
    // 페이스북 방식은 한 장씩 보내는 게 안전해요
    for (const url of list) {
      await call('/me/messages', { recipient: { id: userId }, message: { attachment: { type: 'image', payload: { url } } } });
    }
    return;
  }
  return call('/me/messages', {
    recipient: { id: userId },
    message: { attachments: list.map((url) => ({ type: 'image', payload: { url } })) },
  });
}

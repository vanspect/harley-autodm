// 인스타그램 웹훅 주소: https://<내-프로젝트>.vercel.app/api/webhook
import crypto from 'node:crypto';
import * as cfg from '../lib/config.js';
import * as ig from '../lib/instagram.js';

const recent = new Map(); // 중복 발송 방지 (서버 인스턴스가 살아있는 동안)

const norm = (s = '') => s.replace(/\s+/g, '').toLowerCase();
const hasKeyword = (text, list) => list.some((k) => norm(text).includes(norm(k)));

function seenRecently(key) {
  const now = Date.now();
  for (const [k, t] of recent) if (now - t > cfg.DEDUPE_MINUTES * 60000) recent.delete(k);
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}

function validSignature(raw, header) {
  const secret = process.env.APP_SECRET;
  if (!secret) return process.env.DRY_RUN === '1'; // 시험 모드에서만 서명 생략 허용
  if (!header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

function fileUrls() {
  const pdf = process.env.PDF_URL || '';
  const images = (process.env.IMAGE_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return { pdf, images };
}

// 1) 댓글 → 비공개 DM + 공개 답글
async function handleComment(v, myId) {
  if (!v?.id || !v.text) return;
  if (v.from?.id && v.from.id === myId) return; // 내 댓글은 무시
  const myName = (process.env.IG_USERNAME || '').replace('@', '').toLowerCase();
  if (myName && v.from?.username?.toLowerCase() === myName) return;
  const isQuote = hasKeyword(v.text, cfg.QUOTE_KEYWORDS || []);
  if (!isQuote && !hasKeyword(v.text, cfg.COMMENT_KEYWORDS)) return;
  if (seenRecently(`c:${v.id}`)) return;
  console.log('키워드 댓글', isQuote ? '[견적]' : '[프로모션]', v.from?.username, v.text);
  await ig.privateReply(v.id, isQuote ? cfg.QUOTE_PRIVATE_REPLY_TEXT : cfg.PRIVATE_REPLY_TEXT);
  if (cfg.PUBLIC_COMMENT_REPLY) {
    await ig.replyToComment(v.id, cfg.PUBLIC_COMMENT_REPLY).catch(() => {});
  }
}

// 2) DM → PDF/이미지 발송
async function handleMessage(m, myId) {
  const msg = m.message;
  if (!msg || msg.is_echo || msg.is_deleted) return; // 내가 보낸 메시지는 무시
  const userId = m.sender?.id;
  if (!userId || userId === myId) return;
  if (hasKeyword(msg.text || '', cfg.QUOTE_KEYWORDS || [])) return handleQuote(userId, msg.text);
  if (!hasKeyword(msg.text || '', cfg.DM_KEYWORDS)) return;
  console.log('키워드 DM', userId, msg.text);
  if (cfg.FOLLOW_REQUIRED && !(await ig.isFollower(userId))) {
    await ig.sendText(userId, cfg.NOT_FOLLOWING_TEXT); // 팔로우 후 다시 보내면 통과
    return;
  }
  if (seenRecently(`m:${userId}`)) return;
  const { pdf, images } = fileUrls();
  await ig.sendText(userId, typeof cfg.BEFORE_FILE_TEXT === 'function' ? cfg.BEFORE_FILE_TEXT() : cfg.BEFORE_FILE_TEXT);
  if (images.length) await ig.sendImages(userId, images);
  if (pdf) await ig.sendFile(userId, pdf);
  await ig.sendText(userId, cfg.AFTER_FILE_TEXT);
}

// 3) DM '견적' → 웹 견적 페이지 링크
async function handleQuote(userId, text) {
  console.log('견적 DM', userId, text);
  if (cfg.QUOTE_FOLLOW_REQUIRED && !(await ig.isFollower(userId))) {
    await ig.sendText(userId, cfg.QUOTE_NOT_FOLLOWING_TEXT);
    return;
  }
  if (seenRecently(`q:${userId}`)) return;
  await ig.sendText(userId, cfg.QUOTE_BEFORE_TEXT);
  await ig.sendText(userId, cfg.QUOTE_URL);
  await ig.sendText(userId, cfg.QUOTE_AFTER_TEXT);
}

// 메타가 주소 확인할 때 (웹훅 등록 시 한 번)
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  if (p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === process.env.VERIFY_TOKEN) {
    return new Response(p.get('hub.challenge'), { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// 댓글·DM 알림이 올 때마다
export async function POST(request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Bad signature', { status: 401 });
  }
  let body;
  try { body = JSON.parse(raw); } catch { return new Response('Bad JSON', { status: 400 }); }

  const myId = process.env.IG_USER_ID || '';
  const jobs = [];
  for (const entry of body.entry || []) {
    for (const ch of entry.changes || []) {
      if (ch.field === 'comments' || ch.field === 'live_comments') jobs.push(handleComment(ch.value, myId));
    }
    for (const m of entry.messaging || []) jobs.push(handleMessage(m, myId));
  }
  const results = await Promise.allSettled(jobs);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('처리 실패', r.reason?.message));
  return new Response('EVENT_RECEIVED', { status: 200 });
}

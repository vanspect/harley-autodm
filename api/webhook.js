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
  if (!secret) return process.env.DRY_RUN === '1';
  if (!header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

function fileUrls() {
  const pdf = process.env.PDF_URL || '';
  const images = (process.env.IMAGE_URLS ||

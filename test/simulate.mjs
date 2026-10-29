// 실제 인스타 호출 없이 동작을 확인하는 시험 (DRY_RUN)
process.env.DRY_RUN = '1';
process.env.IG_USER_ID = '1000';
process.env.PDF_URL = 'https://example.vercel.app/promo.pdf';
process.env.VERIFY_TOKEN = 'test-verify';
const { GET, POST } = await import('../api/webhook.js');

const post = (body) => POST(new Request('https://x/api/webhook', { method: 'POST', body: JSON.stringify(body) }));
const title = (t) => console.log(`\n=== ${t}`);

title('1. 웹훅 주소 확인 (메타가 등록할 때)');
let r = await GET(new Request('https://x/api/webhook?hub.mode=subscribe&hub.verify_token=test-verify&hub.challenge=12345'));
console.log(r.status, await r.text());
r = await GET(new Request('https://x/api/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1'));
console.log('틀린 토큰 →', r.status);

title('2. 키워드 댓글 "프로모션 궁금해요"');
await post({ entry: [{ id: '1000', changes: [{ field: 'comments', value: { id: 'c1', text: '프로모션 궁금해요', from: { id: '2001', username: 'rider_kim' }, media: { id: 'm1' } } }] }] });

title('3. 키워드 없는 댓글 "멋지네요" → 아무것도 안 함');
await post({ entry: [{ id: '1000', changes: [{ field: 'comments', value: { id: 'c2', text: '멋지네요', from: { id: '2002' } } }] }] });

title('4. 내 댓글 → 무시');
await post({ entry: [{ id: '1000', changes: [{ field: 'comments', value: { id: 'c3', text: '프로모션', from: { id: '1000' } } }] }] });

title('5. 팔로우 안 한 사람이 DM "받기"');
process.env.DRY_FOLLOWS = '0';
await post({ entry: [{ id: '1000', messaging: [{ sender: { id: '2001' }, recipient: { id: '1000' }, message: { mid: 'x', text: '받기' } }] }] });

title('6. 팔로우한 뒤 다시 DM "받 기" (띄어쓰기 있어도 인식)');
process.env.DRY_FOLLOWS = '1';
await post({ entry: [{ id: '1000', messaging: [{ sender: { id: '2001' }, recipient: { id: '1000' }, message: { mid: 'y', text: '받 기' } }] }] });

title('7. 같은 사람이 바로 또 "받기" → 중복 발송 안 함');
await post({ entry: [{ id: '1000', messaging: [{ sender: { id: '2001' }, recipient: { id: '1000' }, message: { mid: 'z', text: '받기' } }] }] });

title('8. 내가 보낸 메시지(echo) → 무시');
await post({ entry: [{ id: '1000', messaging: [{ sender: { id: '1000' }, recipient: { id: '2001' }, message: { mid: 'e', text: '받기', is_echo: true } }] }] });

title('9. 서명 검사: APP_SECRET 설정 후 서명 없는 요청 → 거부');
delete process.env.DRY_RUN; process.env.APP_SECRET = 'secret';
r = await post({ entry: [] });
console.log('서명 없음 →', r.status);
const crypto = await import('node:crypto');
const raw = JSON.stringify({ entry: [] });
const sig = 'sha256=' + crypto.createHmac('sha256', 'secret').update(raw).digest('hex');
r = await POST(new Request('https://x/api/webhook', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': sig } }));
console.log('올바른 서명 →', r.status);

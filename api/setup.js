// 설치 도우미: https://<주소>/api/setup?key=<VERIFY_TOKEN>
// 1) 토큰이 어떤 페이지 것인지, 연결된 인스타 계정 ID 확인
// 2) 페이지를 앱 웹훅에 구독 (페이스북 로그인 방식일 때)
import { FB_MODE, subscribePage } from '../lib/instagram.js';

const json = (o, s = 200) => new Response(JSON.stringify(o, null, 2), { status: s, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function GET(request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!key || key !== process.env.VERIFY_TOKEN) return json({ error: '주소 끝에 ?key=VERIFY_TOKEN값 을 붙여주세요' }, 403);

  const v = process.env.GRAPH_VERSION || 'v26.0';
  const out = { mode: FB_MODE() ? '페이스북 로그인 방식' : '인스타그램 로그인 방식' };
  try {
    if (FB_MODE()) {
      const t = process.env.PAGE_ACCESS_TOKEN;
      const me = await (await fetch(`https://graph.facebook.com/${v}/me?fields=id,name,instagram_business_account{id,username}`, { headers: { Authorization: `Bearer ${t}` } })).json();
      out.page = me;
      out.hint = me.instagram_business_account
        ? `PAGE_ID=${me.id}, IG_USER_ID=${me.instagram_business_account.id} 를 Vercel 환경변수에 넣으세요`
        : '이 페이지에 인스타 계정이 연결되어 있지 않아요. 인스타 앱 → 프로필 편집 → 페이지에서 연결하세요';
      if (process.env.PAGE_ID) out.subscribe = await subscribePage();
      else out.subscribe = 'PAGE_ID 를 넣고 다시 열면 웹훅 구독까지 해드려요';
    } else {
      const t = process.env.IG_ACCESS_TOKEN;
      out.account = await (await fetch(`https://graph.instagram.com/${v}/me?fields=user_id,username`, { headers: { Authorization: `Bearer ${t}` } })).json();
    }
    out.env = {
      APP_SECRET: !!process.env.APP_SECRET,
      VERIFY_TOKEN: true,
      PAGE_ID: process.env.PAGE_ID || null,
      IG_USER_ID: process.env.IG_USER_ID || null,
      PDF_URL: process.env.PDF_URL || null,
    };
  } catch (e) {
    out.error = e.message;
  }
  return json(out);
}

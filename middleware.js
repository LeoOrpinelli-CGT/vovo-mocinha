/* Acesso por PIN (Vercel Routing Middleware).
   Todo pedido passa por aqui antes de qualquer arquivo ser entregue: sem o cookie de acesso,
   o visitante só recebe a tela de PIN. O PIN fica na variável de ambiente ACCESS_PIN do projeto
   no Vercel, fora do código. Sem a variável, o site fica fechado. */
export const config = { matcher: '/:path*' };

const COOKIE = 'cgt_access';
const DIAS = 30;

async function sha256(texto) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function cookie(req, nome) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + nome + '=([^;]+)'));
  return m ? m[1] : '';
}

const T = {
  pt: { titulo: 'Acesso restrito', sub: 'Digite o PIN de 4 dígitos para abrir este material.', botao: 'Entrar', erro: 'PIN incorreto. Tente de novo.', rodape: 'Material comercial Cogtive' },
  en: { titulo: 'Restricted access', sub: 'Enter the 4-digit PIN to open this material.', botao: 'Enter', erro: 'Wrong PIN. Please try again.', rodape: 'Cogtive sales material' }
};

/* idioma da tela: ACCESS_LANG no projeto (pt ou en); sem ela, inglês no domínio e nas páginas em inglês da apresentação */
function idioma(url) {
  const fixo = (process.env.ACCESS_LANG || '').toLowerCase();
  if (fixo === 'en' || fixo === 'pt') return fixo;
  return /sales-presentation/.test(url.hostname) || /^\/en(\/|\.html|$)/.test(url.pathname) ? 'en' : 'pt';
}

function tela(url) {
  const lang = idioma(url), t = T[lang], volta = url.pathname + url.search;
  return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Cogtive · ${t.titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
<style>
:root{--bg:#030A14;--line:rgba(130,195,255,.16);--sky:#82C3FF;--cyan:#38D9FF;--blue:#0381F8;--txt:#F7F7F7;--txt2:#9AA8BA;--err:#FF6B78}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{display:grid;place-items:center;padding:24px 16px;font-family:Geist,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--txt);-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 55% at 85% 0%,rgba(3,129,248,.18),transparent 62%),var(--bg)}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(56,217,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(56,217,255,.05) 1px,transparent 1px);background-size:120px 120px;
  -webkit-mask-image:radial-gradient(90% 80% at 50% 40%,#000 30%,transparent 100%);mask-image:radial-gradient(90% 80% at 50% 40%,#000 30%,transparent 100%)}
.card{position:relative;width:100%;max-width:400px;padding:36px 32px 30px;border:1px solid var(--line);border-radius:18px;background:rgba(6,22,41,.86);box-shadow:0 30px 80px -30px rgba(0,0,0,.8)}
.logo{display:block;height:20px;width:auto}
.k{margin:30px 0 0;font:500 11px "Geist Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--cyan)}
h1{margin:10px 0 0;font-weight:600;font-size:28px;letter-spacing:-.025em}
p.s{margin:10px 0 0;font-size:15px;line-height:1.5;color:var(--txt2)}
form{margin-top:26px}
input{width:100%;height:64px;border:1px solid rgba(130,195,255,.3);border-radius:12px;background:#02070F;color:var(--txt);text-align:center;font:500 30px "Geist Mono",monospace;letter-spacing:.6em;padding-left:.6em;outline:none}
input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(56,217,255,.18)}
button{width:100%;height:50px;margin-top:12px;border:0;border-radius:999px;background:var(--blue);color:#fff;font:600 16px Geist,system-ui,sans-serif;cursor:pointer}
button:disabled{opacity:.6;cursor:wait}
.e{min-height:20px;margin:12px 0 0;font-size:14px;color:var(--err);text-align:center}
.f{margin:22px 0 0;padding-top:18px;border-top:1px solid var(--line);font:500 11px "Geist Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#5D6B7E;text-align:center}
.shake{animation:sh .35s}@keyframes sh{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
</style></head><body>
<main class="card">
  <img class="logo" src="https://cogtive.com/wp-content/uploads/2025/03/Cogtive-2025-Logo-02-copiar.webp" alt="Cogtive">
  <p class="k">PIN</p>
  <h1>${t.titulo}</h1>
  <p class="s">${t.sub}</p>
  <form id="f" method="post" action="/__pin">
    <input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" required autofocus aria-label="PIN">
    <input type="hidden" name="next" value="${volta.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}">
    <button id="b" type="submit">${t.botao}</button>
    <p class="e" id="e" role="alert">${url.searchParams.has('__pin_erro') ? t.erro : ''}</p>
  </form>
  <p class="f">${t.rodape}</p>
</main>
<script>
const f = document.getElementById('f'), pin = document.getElementById('pin'), b = document.getElementById('b'), e = document.getElementById('e');
pin.addEventListener('input', () => { pin.value = pin.value.replace(/\\D/g, '').slice(0, 4); e.textContent = ''; if (pin.value.length === 4) f.requestSubmit(); });
f.addEventListener('submit', async ev => {
  ev.preventDefault();
  if (pin.value.length !== 4) return;
  b.disabled = true;
  const r = await fetch('/__pin', { method: 'POST', body: new FormData(f), headers: { 'x-pin-fetch': '1' } }).catch(() => null);
  if (r && r.status === 204) { location.reload(); return; }   /* recarrega o mesmo endereço, inclusive o que vem depois do # */
  b.disabled = false; pin.value = ''; pin.focus(); e.textContent = ${JSON.stringify(t.erro)};
  f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
});
</script>
</body></html>`;
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const pin = process.env.ACCESS_PIN;
  const semCache = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!pin) return new Response('Acesso indisponível.', { status: 503, headers: semCache });
  const chave = await sha256('cogtive-access:' + pin);

  if (url.pathname === '/__pin') {
    if (req.method !== 'POST') return Response.redirect(new URL('/', url), 303);
    const form = await req.formData().catch(() => null);
    const tentativa = String((form && form.get('pin')) || '').trim();
    const volta = String((form && form.get('next')) || '/');
    const destino = new URL(volta.startsWith('/') && !volta.startsWith('//') ? volta : '/', url);
    if (tentativa === pin) {
      const h = new Headers(semCache);
      h.append('Set-Cookie', `${COOKIE}=${chave}; Path=/; Max-Age=${DIAS * 86400}; HttpOnly; Secure; SameSite=Lax`);
      if (req.headers.get('x-pin-fetch')) return new Response(null, { status: 204, headers: h });
      h.set('Location', destino.toString());
      return new Response(null, { status: 303, headers: h });
    }
    await new Promise(r => setTimeout(r, 1500));   /* atrasa quem tenta adivinhar */
    if (req.headers.get('x-pin-fetch')) return new Response(null, { status: 401, headers: semCache });
    destino.searchParams.set('__pin_erro', '1');
    return Response.redirect(destino, 303);
  }

  if (cookie(req, COOKIE) === chave) return;   /* PIN já validado: segue para o conteúdo */
  return new Response(tela(url), { status: 401, headers: { ...semCache, 'Content-Type': 'text/html; charset=utf-8' } });
}

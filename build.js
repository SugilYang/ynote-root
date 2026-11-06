// ynote.co.kr 첫 화면을 만든다: 현장노트(field.ynote.co.kr)의 최신 글과 도구를 정적 HTML로 심는다.
// 배포 때마다 실행되고, 하루 한 번(새벽 글 발행 뒤) 자동으로 다시 실행된다.
const fs = require('fs');
const F = 'https://field.ynote.co.kr/';
const SECTIONS = { license: ['자격증', '📜'], safety: ['산업안전', '🦺'], case: ['사고사례 분석', '🚨'], tools: ['장비·공구', '🔧'], trend: ['산업 트렌드', '🔋'], life: ['현장 생활', '💼'], guide: ['산업안전지도사', '📋'] };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  const posts = (await (await fetch(F + 'posts.json')).json()).sort((a, b) => b.date.localeCompare(a.date));
  const count = Object.fromEntries(Object.keys(SECTIONS).map(s => [s, posts.filter(p => p.section === s).length]));
  const card = (p, big) => {
    const [name, icon] = SECTIONS[p.section] || ['', ''];
    return `<a class="card c-${p.section}${big ? ' big' : ''}" href="${F}posts/${esc(p.file)}"><div class="hero-box">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : icon}</div>
    <div class="t"><small>${name} · ${p.date}</small><b>${esc(p.title)}</b><p>${esc(p.summary)}</p></div></a>`;
  };
  let html = fs.readFileSync('template.html', 'utf8');
  html = html.replace('<!--posts-->', posts.slice(0, 12).map((p, i) => card(p, i === 0)).join('\n'))
    .replace('<!--cats-->', Object.entries(SECTIONS).map(([id, [name, icon]]) => `<li><a href="${F}${id}.html">${icon} ${name}</a><span>${count[id]}</span></li>`).join(''))
    .replace(/\{\{total\}\}/g, posts.length).replace(/\{\{date\}\}/g, posts[0].date);
  fs.writeFileSync('index.html', html);
  console.log(`ynote.co.kr 첫 화면 생성: 글 ${posts.length}편, 최신 ${posts[0].date}`);
})().catch(e => { console.error(e); process.exit(1); });

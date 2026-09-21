/* 이음청년목장 사역팀 소개서 — 편집기 + 인쇄 렌더러 */
(function(){
'use strict';

/* 사진 압축 기준: A4 가로 180mm 에 1600px ≈ 225dpi 로, 인쇄에 충분합니다. */
var MAX_PX = 1600;
var TARGET_KB = 280;

/* 탭 순서는 팀 이름 ㄱㄴㄷ 순입니다 (아래 목록도 같은 순서로 적어 둡니다) */
var PRESETS = [
  {id:'prayer',  name:'기도팀',       light:'#5B5486', dark:'#ADA5D8', seal:'기도'},
  {id:'media',   name:'미디어선교팀', light:'#3C5A80', dark:'#96B6DC', seal:'미디어'},
  {id:'newfam',  name:'새가족팀',     light:'#2F6E75', dark:'#87C5CB', seal:'새가족'},
  {id:'mission', name:'선교팀',       light:'#3A6B54', dark:'#7FC0A1', seal:'선교'},
  {id:'nurture', name:'양육팀',       light:'#8A6A34', dark:'#D7B472', seal:'양육'},
  {id:'worship', name:'예배팀',       light:'#7A4E63', dark:'#D39DB4', seal:'예배'}
];
var SAMPLE_ID = 'mission';   // 작성 예시를 담아 둘 팀
var EXTRA_COLORS = [
  {light:'#4A6B3A', dark:'#A5C98E'},
  {light:'#80503C', dark:'#DBA68D'},
  {light:'#43607A', dark:'#A0BCD4'}
];

/* ================= 모델 ================= */
function blank(id, name, colors, seal){
  return {
    id:id, name:name,
    light:colors.light, dark:colors.dark, seal:seal || name.slice(0,3),
    leader:'', members:'', meeting:'', slogan:'', vision:'',
    values:['','',''],
    works:[{n:'',c:'',d:''},{n:'',c:'',d:''},{n:'',c:'',d:''}],
    photos:[{src:'',cap:''},{src:'',cap:''}],
    docs:[{src:'',cap:''}],
    sample:false
  };
}

function sampleTeam(){
  var p = PRESETS.filter(function(x){ return x.id === SAMPLE_ID; })[0];
  var t = blank(p.id, p.name, p, p.seal);
  t.sample = true;
  t.leader  = '김하늘 간사 / 부팀장 이도현';
  t.members = '총 7명 (팀장 1명, 부팀장 1명, 팀원 5명)';
  t.meeting = '매주 주일 오후 2시 · 본당 3층 소모임실';
  t.slogan  = '땅 끝까지 이르러 내 증인이 되리라 (사도행전 1:8)';
  t.vision  = '선교팀은 이음청년목장이 “보내는 공동체”로 서도록 돕는 팀입니다.\n먼 곳의 선교지를 위해 기도하는 일과, 지금 우리가 발 딛고 있는 동네를 섬기는 일이 하나라고 믿습니다.\n청년 한 사람 한 사람이 자기 자리에서 복음을 살아내는 선교사로 세워지는 것이 저희에게 주신 마음입니다.';
  t.values = [
    '모든 사역은 기도에서 시작합니다. 파송 선교사님과 지역을 이름으로 부르며 함께 기도합니다.',
    '말보다 먼저 태도와 관계로 전합니다. 한 번의 큰 행사보다 꾸준한 만남을 택합니다.',
    '혼자 잘하는 사람보다 함께 오래 가는 팀을 세웁니다. 새로 온 팀원도 첫 달부터 역할을 맡습니다.'
  ];
  t.works = [
    {n:'해외 단기선교', c:'전 청년 대상 · 연 1회 (7월 말)',
     d:'파송 선교사님과 함께 현지 어린이 사역과 가정 방문을 섬깁니다. 출발 12주 전부터 매주 준비모임을 갖고 찬양·율동·간증을 함께 준비합니다. 작년에는 14명이 다녀왔고, 그중 5명이 올해 팀원으로 합류했습니다.'},
    {n:'지역 섬김 나눔', c:'팀원 및 지원자 · 월 1회 (둘째 주 토요일)',
     d:'교회 인근 독거 어르신 가정에 반찬을 나누고 안부를 여쭙니다. 두 사람이 짝을 지어 같은 가정을 계속 찾아가기 때문에, 시간이 지날수록 대화가 깊어집니다.'},
    {n:'선교 중보 편지', c:'전 성도 대상 · 매월 첫 주일',
     d:'선교사님의 소식을 한 장으로 정리해 주보와 함께 나눕니다. 기도제목을 세 가지로 추려 담아, 목장 모임에서 함께 기도할 수 있도록 안내합니다.'}
  ];
  t.photos = [
    {src:'', cap:'2025년 여름 단기선교 — 현지 어린이 사역을 마치고'},
    {src:'', cap:'월례 지역 섬김 — 반찬 나눔을 준비하는 모습'}
  ];
  t.docs = [{src:'', cap:'매월 발행하는 선교 중보 편지'}];
  return t;
}

function seedTeams(){
  return PRESETS.map(function(p){
    return p.id === SAMPLE_ID ? sampleTeam() : blank(p.id, p.name, p, p.seal);
  });
}

/* 팀을 이름 ㄱㄴㄷ 순으로 늘어놓습니다. 보고 계시던 팀은 그대로 따라갑니다.
   순서가 실제로 바뀌었을 때만 true 를 돌려줍니다. */
function sortTeams(){
  var keep = state.teams[state.active];
  var before = state.teams.map(function(t){ return t.id; }).join();
  state.teams.sort(function(a, b){
    return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
  });
  if(keep) state.active = Math.max(0, state.teams.indexOf(keep));
  return state.teams.map(function(t){ return t.id; }).join() !== before;
}

function normalize(t){
  // 핵심가치는 문장 하나씩입니다. (예전에 «이름 + 설명» 두 칸으로 저장된 것은 합쳐 줍니다)
  t.values = (Array.isArray(t.values) && t.values.length ? t.values : ['']).map(function(v){
    if(typeof v === 'string') return v;
    if(v && typeof v === 'object') return [v.t, v.d].filter(has).join(' — ');
    return '';
  });
  t.works  = Array.isArray(t.works)  && t.works.length  ? t.works  : [{n:'',c:'',d:''}];
  t.photos = Array.isArray(t.photos) && t.photos.length ? t.photos : [{src:'',cap:''}];
  t.docs   = Array.isArray(t.docs) ? t.docs : [];
  ['name','leader','members','meeting','slogan','vision','light','dark','seal'].forEach(function(k){
    if(typeof t[k] !== 'string') t[k] = '';
  });
  if(!t.light) t.light = '#3A6B54';
  if(!t.dark)  t.dark  = '#7FC0A1';
  if(!t.seal)  t.seal  = (t.name || '팀').slice(0,3);
  return t;
}

var state = {teams:[], active:0};

/* ================= 유틸 ================= */
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function has(v){ return !!(v && String(v).trim()); }
/* 내용 비교용 표준형. Postgres 의 jsonb 는 키 순서를 제멋대로 바꿔서
   돌려주므로, 키를 정렬해 놓고 비교해야 «같은 내용»인지 알 수 있습니다. */
function canon(v){
  if(Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if(v && typeof v === 'object'){
    return '{' + Object.keys(v).sort().map(function(k){
      return JSON.stringify(k) + ':' + canon(v[k]);
    }).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}
function isDark(){
  var t = document.documentElement.getAttribute('data-theme');
  if(t === 'dark') return true;
  if(t === 'light') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function teamColor(t){ return isDark() ? (t.dark || t.light) : t.light; }
function progress(t){
  var checks = [
    has(t.leader), has(t.members), has(t.meeting), has(t.slogan), has(t.vision),
    t.values.some(has),
    t.works.some(function(w){ return has(w.n); }),
    t.photos.some(function(p){ return has(p.src); })
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
function grow(el){
  if(!el || el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight + 2) + 'px';
}
function growAll(root){ (root || document).querySelectorAll('textarea').forEach(grow); }

var statusTimer = null;
function setStatus(text, cls){
  var el = document.getElementById('status');
  el.textContent = text;
  el.className = 'status ' + (cls || '');
  clearTimeout(statusTimer);
  if(text) statusTimer = setTimeout(function(){ el.textContent=''; el.className='status'; }, 2600);
}
var toastTimer = null;
function toast(msg){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 4200);
}

/* ================= 저장 ================= */
var saveTimer = null;
function save(){
  clearTimeout(saveTimer);
  setStatus('저장 중…');
  saveTimer = setTimeout(function(){
    var t = state.teams[state.active];
    Store.saveTeam(t, state.active, state.teams)
      .then(function(){ setStatus('저장됨', 'saved'); })
      .catch(function(e){
        setStatus('저장 실패', 'err');
        toast('저장하지 못했습니다: ' + e.message);
      });
  }, 450);
}
function saveOrder(){
  Store.saveOrder(state.teams)
    .then(function(){ setStatus('저장됨', 'saved'); })
    .catch(function(e){ setStatus('저장 실패', 'err'); toast('저장하지 못했습니다: ' + e.message); });
}

function renderConn(){
  var el = document.getElementById('conn');
  if(Store.mode === 'cloud'){
    el.dataset.mode = 'cloud';
    el.innerHTML = '<span class="led"></span><span class="lbl">함께 쓰는 중</span>';
    el.title = '입력한 내용이 Supabase에 저장되어 모든 팀장님께 함께 보입니다.';
  }else if(Store.configured){
    el.dataset.mode = 'error';
    el.innerHTML = '<span class="led"></span><span class="lbl">이 기기에만 저장</span>';
    el.title = 'Supabase에 연결하지 못해 이 브라우저에만 저장됩니다.' + (Store.error ? '\n(' + Store.error + ')' : '');
  }else{
    el.dataset.mode = 'local';
    el.innerHTML = '<span class="led"></span><span class="lbl">이 기기에만 저장</span>';
    el.title = '입력한 내용은 이 브라우저에만 저장됩니다.';
  }
}

/* ================= 레일 ================= */
function renderRail(){
  var html = '<div class="rail-label">사역팀</div>';
  state.teams.forEach(function(t, i){
    var p = progress(t);
    html += '<button class="tab" role="tab" data-go="' + i + '" aria-selected="' + (i === state.active) + '"' +
            ' style="--team:' + esc(teamColor(t)) + '">' +
            '<span class="dot"></span>' +
            '<span class="tname">' + esc(t.name || '이름 없는 팀') + '</span>' +
            '<span class="pct' + (p === 100 ? ' full' : '') + '">' + p + '%</span></button>';
  });
  html += '<button class="add-team" data-addteam="1">+ 사역팀 추가</button>';
  document.getElementById('rail').innerHTML = html;
}

/* ================= 시트 ================= */
function fieldRow(label, key, val, ph){
  return '<div class="k">' + esc(label) + '</div><div class="v"><input data-f="' + key +
         '" value="' + esc(val) + '" placeholder="' + esc(ph) + '" aria-label="' + esc(label) + '"></div>';
}
function photoCards(list, kind){
  var out = '';
  list.forEach(function(p, i){
    var what = kind === 'docs' ? '자료' : '사진';
    out += '<div class="photo">';
    out += '<div class="drop" data-drop="' + kind + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + what + ' ' + (i+1) + ' 넣기">';
    out += p.src
      ? '<img src="' + esc(p.src) + '" alt="">' + (p.kb ? '<span class="sizetag">' + p.kb + ' KB</span>' : '')
      : '<div class="ph"><b>+</b>클릭하거나 사진을 끌어다 놓으세요</div>';
    out += '</div><div class="photo-foot">';
    out += '<input data-l="' + kind + '" data-i="' + i + '" data-k="cap" value="' + esc(p.cap) +
           '" placeholder="' + what + ' 설명 (어떤 장면인가요?)" aria-label="' + what + ' ' + (i+1) + ' 설명">';
    out += '<button class="icon-btn danger" data-del="' + kind + '" data-i="' + i + '" title="칸 삭제" aria-label="' + what + ' ' + (i+1) + ' 삭제">✕</button>';
    out += '</div></div>';
  });
  return out;
}

function renderSheet(){
  var t = state.teams[state.active];
  if(!t) return;
  var h = [];
  h.push('<section class="sheet" style="--team:' + esc(teamColor(t)) + '">');

  h.push('<div class="sheet-top"><div class="seal">' + esc(t.seal || t.name.slice(0,3)) + '</div>');
  h.push('<div class="st-main"><span class="eyebrow">이음청년목장 사역팀 소개</span>');
  h.push('<input class="team-name" data-f="name" value="' + esc(t.name) + '" placeholder="사역팀 이름" aria-label="사역팀 이름">');
  h.push('</div></div>');

  if(t.sample){
    h.push('<div class="sample-note"><span>✎ 어떻게 채우면 좋을지 보여드리려고 <b>예시</b>로 적어 둔 내용입니다. 고쳐 쓰시거나 한 번에 비우세요.</span>' +
           '<button class="btn tiny" data-clearsample="1">전부 비우기</button></div>');
  }

  h.push('<div class="block"><div class="block-head"><span class="block-num">01</span><h2>사역팀 기본 정보</h2></div><div class="fields">');
  h.push(fieldRow('팀장 · 섬김이', 'leader',  t.leader,  '예: 김하늘 간사 / 부팀장 이도현'));
  h.push(fieldRow('팀원 현황',     'members', t.members, '예: 총 7명 (팀장 1명, 팀원 6명)'));
  h.push(fieldRow('모임 시간 · 장소','meeting',t.meeting, '예: 매주 주일 오후 2시 · 본당 3층 소모임실'));
  h.push('<div class="k">한 줄 슬로건</div><div class="v slogan-row"><input data-f="slogan" value="' + esc(t.slogan) +
         '" placeholder="팀을 대표하는 문구 또는 성경 구절" aria-label="한 줄 슬로건"></div>');
  h.push('</div></div>');

  h.push('<div class="block"><div class="block-head"><span class="block-num">02</span><h2>사역팀 소개 및 비전</h2></div>');
  h.push('<label class="eyebrow" for="vision">팀의 목적 및 방향성</label>');
  h.push('<textarea class="t-area" id="vision" data-f="vision" rows="4" placeholder="이 팀이 왜 존재하는지, 무엇을 향해 가는지, 하나님께서 주신 마음은 무엇인지 편하게 적어 주세요.">' + esc(t.vision) + '</textarea>');
  h.push('<div class="block-head" style="margin-top:22px"><span class="block-num">핵심가치</span><h2 style="font-size:14px">팀이 붙드는 것들</h2><span class="hint">3가지 정도가 읽기 좋습니다</span></div>');
  h.push('<div class="rows">');
  t.values.forEach(function(v, i){
    h.push('<div class="row row-value"><div class="idx">' + (i+1) + '</div>');
    h.push('<textarea class="t-area" data-l="values" data-i="' + i + '" rows="1" placeholder="한두 문장으로 적어 주세요" aria-label="핵심가치 ' + (i+1) + '">' + esc(v) + '</textarea>');
    h.push('<div class="row-tools"><button class="icon-btn danger" data-del="values" data-i="' + i + '" title="삭제" aria-label="핵심가치 ' + (i+1) + ' 삭제">✕</button></div></div>');
  });
  h.push('</div><button class="add-row" data-add="values"><span class="plus">+</span> 핵심가치 추가</button></div>');

  h.push('<div class="block"><div class="block-head"><span class="block-num">03</span><h2>주요 사역 및 활동</h2><span class="hint">필요한 만큼 추가하세요</span></div>');
  h.push('<div class="rows">');
  t.works.forEach(function(w, i){
    h.push('<div class="row row-work"><div class="idx">' + (i+1) + '</div><div><div class="work-top">');
    h.push('<input class="t-input" data-l="works" data-i="' + i + '" data-k="n" value="' + esc(w.n) + '" placeholder="사역 · 활동명" aria-label="사역 ' + (i+1) + ' 이름">');
    h.push('<input class="t-input" data-l="works" data-i="' + i + '" data-k="c" value="' + esc(w.c) + '" placeholder="대상 및 주기 (예: 매주 주일 예배 전)" aria-label="사역 ' + (i+1) + ' 대상 및 주기">');
    h.push('</div><div class="work-body"><textarea class="t-area" data-l="works" data-i="' + i + '" data-k="d" rows="2" placeholder="구체적으로 무엇을 하는지, 기억에 남는 일화가 있다면 함께 적어 주세요." aria-label="사역 ' + (i+1) + ' 내용">' + esc(w.d) + '</textarea></div></div>');
    h.push('<div class="row-tools">' +
           '<button class="icon-btn" data-move="works" data-i="' + i + '" data-dir="-1" title="위로" aria-label="사역 ' + (i+1) + ' 위로">↑</button>' +
           '<button class="icon-btn" data-move="works" data-i="' + i + '" data-dir="1" title="아래로" aria-label="사역 ' + (i+1) + ' 아래로">↓</button>' +
           '<button class="icon-btn danger" data-del="works" data-i="' + i + '" title="삭제" aria-label="사역 ' + (i+1) + ' 삭제">✕</button></div></div>');
  });
  h.push('</div><button class="add-row" data-add="works"><span class="plus">+</span> 사역 추가</button></div>');

  h.push('<div class="block"><div class="block-head"><span class="block-num">04</span><h2>사역 현장 사진</h2><span class="hint">가로로 찍은 사진이 잘 나옵니다</span></div>');
  h.push('<div class="photos">' + photoCards(t.photos, 'photos') + '</div>');
  h.push('<button class="add-row" data-add="photos" style="margin-top:12px"><span class="plus">+</span> 사진 추가</button></div>');

  h.push('<div class="block"><div class="block-head"><span class="block-num">05</span><h2>사역 관련 자료 <span class="opt">(선택)</span></h2></div>');
  h.push('<p class="doc-note">포스터, 주보, 안내지, 사역 수첩처럼 팀을 보여 주는 제작물이 있으면 넣어 주세요.</p>');
  h.push('<div class="photos">' + photoCards(t.docs, 'docs') + '</div>');
  h.push('<button class="add-row" data-add="docs" style="margin-top:12px"><span class="plus">+</span> 자료 추가</button></div>');

  h.push('<div class="sheet-foot"><span class="meter">작성률 ' + progress(t) + '%</span></div></section>');

  var box = document.getElementById('sheets');
  box.innerHTML = h.join('');
  growAll(box);
}

function renderAll(){ renderRail(); renderSheet(); }

function updateMeter(){
  var p = progress(state.teams[state.active]);
  var m = document.querySelector('.meter');
  if(m) m.textContent = '작성률 ' + p + '%';
  var tab = document.querySelector('.tab[data-go="' + state.active + '"] .pct');
  if(tab){ tab.textContent = p + '%'; tab.className = 'pct' + (p === 100 ? ' full' : ''); }
}

/* ================= 이벤트 ================= */
var app = document.getElementById('app');

app.addEventListener('input', function(e){
  var el = e.target, t = state.teams[state.active];
  if(!t) return;
  var touched = false;
  if(el.dataset.f){
    t[el.dataset.f] = el.value;
    touched = true;
    if(el.dataset.f === 'name'){
      t.seal = (el.value || '팀').trim().slice(0,3);
      renderRail();
    }
  }else if(el.dataset.l === 'values'){
    t.values[+el.dataset.i] = el.value;
    touched = true;
  }else if(el.dataset.l){
    var item = (t[el.dataset.l] || [])[+el.dataset.i];
    if(item){ item[el.dataset.k] = el.value; touched = true; }
  }
  if(!touched) return;
  if(t.sample) t.sample = false;
  grow(el);
  updateMeter();
  save();
});

/* 팀 이름을 다 고치고 나면 ㄱㄴㄷ 자리로 옮깁니다.
   (타이핑 중에 탭이 움직이면 어지러우므로 입력을 마친 시점에 합니다) */
app.addEventListener('change', function(e){
  if(e.target.dataset.f !== 'name') return;
  if(sortTeams()){ renderAll(); saveOrder(); }
});

app.addEventListener('click', function(e){
  var b = e.target.closest('button, [data-drop]');
  if(!b) return;
  var t = state.teams[state.active];
  if(b.dataset.go !== undefined){
    state.active = +b.dataset.go;
    renderAll();
    return;
  }
  if(b.dataset.addteam){ addTeam(); return; }
  if(b.dataset.clearsample){ clearSample(); return; }
  if(b.dataset.add){ addItem(t, b.dataset.add); return; }
  if(b.dataset.del){ delItem(t, b.dataset.del, +b.dataset.i); return; }
  if(b.dataset.move){ moveItem(t, b.dataset.move, +b.dataset.i, +b.dataset.dir); return; }
  if(b.dataset.drop !== undefined){ pickPhoto(b.dataset.drop, +b.dataset.i); return; }
});

app.addEventListener('keydown', function(e){
  var d = e.target.dataset;
  if((e.key === 'Enter' || e.key === ' ') && d && d.drop !== undefined){
    e.preventDefault();
    pickPhoto(d.drop, +d.i);
  }
});
app.addEventListener('dragover', function(e){
  var d = e.target.closest('[data-drop]');
  if(!d) return;
  e.preventDefault();
  d.classList.add('over');
});
app.addEventListener('dragleave', function(e){
  var d = e.target.closest('[data-drop]');
  if(d) d.classList.remove('over');
});
app.addEventListener('drop', function(e){
  var d = e.target.closest('[data-drop]');
  if(!d) return;
  e.preventDefault();
  d.classList.remove('over');
  var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if(f) handleImage(f, d.dataset.drop, +d.dataset.i, d);
});

function addItem(t, kind){
  if(kind === 'values') t.values.push('');
  else if(kind === 'works') t.works.push({n:'',c:'',d:''});
  else t[kind].push({src:'',cap:''});
  if(t.sample) t.sample = false;
  save(); renderSheet();
  var last = t[kind].length - 1;
  var sel = (kind === 'values' || kind === 'works')
    ? '[data-l="' + kind + '"][data-i="' + last + '"]'
    : '[data-drop="' + kind + '"][data-i="' + last + '"]';
  var el = document.querySelector(sel);
  if(el) el.focus();
}
function delItem(t, kind, i){
  var list = t[kind];
  if(!list || !list[i]) return;
  var it = list[i];
  var filled = kind === 'values' ? has(it)
             : kind === 'works'  ? (has(it.n) || has(it.d))
             : (has(it.src) || has(it.cap));
  if(filled && !confirm('내용이 들어 있습니다. 정말 삭제할까요?')) return;
  if(it && it.src) Store.dropImage(it.src);
  list.splice(i, 1);
  if(!list.length && kind !== 'docs'){
    if(kind === 'values') list.push('');
    else if(kind === 'works') list.push({n:'',c:'',d:''});
    else list.push({src:'',cap:''});
  }
  save(); renderAll();
}
function moveItem(t, kind, i, dir){
  var list = t[kind], j = i + dir;
  if(j < 0 || j >= list.length) return;
  var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
  save(); renderSheet();
}
function addTeam(){
  var name = prompt('새 사역팀 이름을 적어 주세요', '');
  if(name === null) return;
  name = name.trim() || '새 사역팀';
  var c = EXTRA_COLORS[state.teams.length % EXTRA_COLORS.length];
  var t = blank('team-' + Date.now().toString(36), name, c, name.slice(0,3));
  state.teams.push(t);
  state.active = state.teams.length - 1;
  sortTeams();            // 이름 순 제자리에 끼워 넣습니다
  renderAll();
  saveOrder();
}
function clearSample(){
  var t = state.teams[state.active];
  state.teams[state.active] = blank(t.id, t.name, {light:t.light, dark:t.dark}, t.seal);
  save(); renderAll();
  toast('예시를 비웠습니다. 이제 팀 이야기를 적어 주세요.');
}

/* ================= 사진 압축 · 업로드 ================= */
var canWebp = (function(){
  try{
    var c = document.createElement('canvas');
    c.width = c.height = 1;
    return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }catch(e){ return false; }
})();

function loadImage(file){
  return new Promise(function(resolve, reject){
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload  = function(){ URL.revokeObjectURL(url); resolve(img); };
    img.onerror = function(){ URL.revokeObjectURL(url); reject(new Error('이미지를 열지 못했습니다.')); };
    img.src = url;
  });
}
function toBlob(canvas, type, q){
  return new Promise(function(resolve){ canvas.toBlob(resolve, type, q); });
}

/* 최대 변 1600px + WebP 화질 단계 낮춤으로 280KB 아래를 노립니다. */
async function compressImage(file){
  var img = await loadImage(file);
  var type = canWebp ? 'image/webp' : 'image/jpeg';
  var ext  = canWebp ? 'webp' : 'jpg';
  var target = TARGET_KB * 1024;
  var maxPx = MAX_PX;
  var best = null;

  for(var pass = 0; pass < 2; pass++){
    var scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.max(1, Math.round(img.naturalWidth * scale));
    var h = Math.max(1, Math.round(img.naturalHeight * scale));
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    var qualities = [0.85, 0.75, 0.65, 0.55];
    for(var i = 0; i < qualities.length; i++){
      var blob = await toBlob(cv, type, qualities[i]);
      if(!blob) continue;
      best = blob;
      if(blob.size <= target) return {blob:blob, ext:ext, w:w, h:h};
    }
    maxPx = Math.round(maxPx * 0.75);   // 아직 크면 해상도를 한 단계 낮춰 다시
  }
  if(!best) throw new Error('이미지를 변환하지 못했습니다.');
  return {blob:best, ext:ext, w:0, h:0};
}

var pendingPhoto = null;
var filePhoto = document.getElementById('filePhoto');
function pickPhoto(kind, i){
  pendingPhoto = {kind:kind, i:i};
  filePhoto.value = '';
  filePhoto.click();
}
filePhoto.addEventListener('change', function(){
  var f = filePhoto.files && filePhoto.files[0];
  if(f && pendingPhoto){
    var sel = '[data-drop="' + pendingPhoto.kind + '"][data-i="' + pendingPhoto.i + '"]';
    handleImage(f, pendingPhoto.kind, pendingPhoto.i, document.querySelector(sel));
  }
  pendingPhoto = null;
});

async function handleImage(file, kind, i, dropEl){
  if(!/^image\//.test(file.type)){ toast('이미지 파일만 넣을 수 있습니다.'); return; }
  if(dropEl) dropEl.classList.add('busy');
  setStatus('사진 줄이는 중…');
  try{
    var out = await compressImage(file);
    var t = state.teams[state.active];
    if(!t[kind][i]) t[kind][i] = {src:'', cap:''};
    var old = t[kind][i].src;

    setStatus(Store.mode === 'cloud' ? '올리는 중…' : '저장 중…');
    var url = await Store.putImage(out.blob, t.id, kind, i, out.ext);

    t[kind][i].src = url;
    t[kind][i].kb = Math.round(out.blob.size / 1024);
    if(t.sample) t.sample = false;
    if(old && old !== url) Store.dropImage(old);

    renderAll();
    save();
    setStatus('사진 추가됨 · ' + t[kind][i].kb + 'KB', 'saved');
  }catch(e){
    setStatus('실패', 'err');
    toast('사진을 넣지 못했습니다: ' + (e.message || e));
  }finally{
    if(dropEl) dropEl.classList.remove('busy');
  }
}

/* ================= 인쇄 ================= */
function pblock(title, inner){
  return '<div class="pblock"><h2>' + esc(title) + '</h2>' + inner + '</div>';
}
function metaRow(k, v){
  return has(v) ? '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>' : '';
}
function teamPrintHtml(t, idx, total){
  var h = ['<article class="psheet" style="--team:' + esc(t.light) + '">'];

  h.push('<header class="phead"><div class="pseal">' + esc(t.seal || t.name.slice(0,3)) + '</div><div class="ph-main">');
  h.push('<div class="peyebrow">이음청년목장 사역팀 소개</div>');
  h.push('<h1>' + esc(t.name || '사역팀') + '</h1>');
  if(has(t.slogan)) h.push('<p class="pslogan">“' + esc(t.slogan) + '”</p>');
  h.push('</div></header>');

  var meta = metaRow('팀장 · 섬김이', t.leader) + metaRow('팀원 현황', t.members) + metaRow('모임 시간 · 장소', t.meeting);
  if(meta) h.push(pblock('기본 정보', '<dl class="pmeta">' + meta + '</dl>'));

  var vals = t.values.filter(has);
  if(has(t.vision) || vals.length){
    var inner = '';
    if(has(t.vision)) inner += '<h3>이 팀이 바라보는 것</h3><p class="pvision">' + esc(t.vision) + '</p>';
    if(vals.length){
      inner += '<ul class="pvalues">';
      vals.forEach(function(v, i){
        inner += '<li><span class="vn">' + (i+1) + '</span><span class="vd">' + esc(v) + '</span></li>';
      });
      inner += '</ul>';
    }
    h.push(pblock('소개 및 비전', inner));
  }

  var works = t.works.filter(function(w){ return has(w.n) || has(w.d); });
  if(works.length){
    var tbl = '<table class="pwork"><thead><tr><th>사역 · 활동</th><th>대상 및 주기</th><th>하는 일</th></tr></thead><tbody>';
    works.forEach(function(w){
      tbl += '<tr><td class="wn">' + esc(w.n) + '</td><td class="wc">' + esc(w.c) + '</td><td>' + esc(w.d) + '</td></tr>';
    });
    h.push(pblock('주요 사역 및 활동', tbl + '</tbody></table>'));
  }

  [['photos','사역 현장'], ['docs','사역 자료']].forEach(function(pair){
    var pics = (t[pair[0]] || []).filter(function(p){ return has(p.src); });
    if(!pics.length) return;
    var g = '<div class="pphotos' + (pics.length === 1 ? ' one' : '') + '">';
    pics.forEach(function(p){
      g += '<figure class="pphoto"><span class="fr"><img src="' + esc(p.src) + '" alt=""></span>' +
           (has(p.cap) ? '<figcaption>' + esc(p.cap) + '</figcaption>' : '') + '</figure>';
    });
    h.push(pblock(pair[1], g + '</div>'));
  });

  h.push('<footer class="pfoot"><span>이음청년목장 · ' + esc(t.name || '사역팀') + '</span><span>' +
         (total > 1 ? '사역팀 ' + idx + ' / ' + total : new Date().getFullYear()) + '</span></footer></article>');
  return h.join('');
}
function coverHtml(teams){
  var d = new Date();
  var h = '<article class="psheet pcover"><div class="cv-eyebrow">Eum Young People</div>';
  h += '<h1>이음청년목장<br>사역팀 소개</h1><div class="cv-rule"></div>';
  h += '<p class="cv-sub">함께 지어져 가는 이음 공동체, 각 사역팀이 어떤 마음으로 달리고 있는지 소개합니다.</p><ol>';
  teams.forEach(function(t, i){
    h += '<li><span class="n">' + (i < 9 ? '0' + (i+1) : i+1) + '</span><span class="nm">' + esc(t.name || '사역팀') + '</span>' +
         (has(t.slogan) ? '<span class="sl">' + esc(t.slogan) + '</span>' : '') + '</li>';
  });
  return h + '</ol><div class="cv-date">' + d.getFullYear() + '. ' + (d.getMonth()+1) + '.</div></article>';
}
function waitImages(root, ms){
  var imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
  if(!imgs.length) return Promise.resolve();
  var done = Promise.all(imgs.map(function(im){
    if(im.complete && im.naturalWidth) return Promise.resolve();
    return new Promise(function(res){ im.onload = im.onerror = res; });
  }));
  return Promise.race([done, new Promise(function(res){ setTimeout(res, ms || 4000); })]);
}
async function doPrint(teams, withCover){
  if(!teams.length) return;
  setStatus('인쇄 준비 중…');
  var box = document.getElementById('print');
  var html = (withCover && teams.length > 1) ? coverHtml(teams) : '';
  teams.forEach(function(t, i){ html += teamPrintHtml(t, i+1, teams.length); });
  box.innerHTML = html;
  await waitImages(box, 5000);
  setStatus('');
  try{ window.print(); }
  catch(e){ toast('인쇄창을 열지 못했습니다. Ctrl+P (맥은 ⌘P)를 눌러 주세요.'); }
}
document.getElementById('btnPrint').addEventListener('click', function(){
  doPrint([state.teams[state.active]], false);
});
document.getElementById('btnPrintAll').addEventListener('click', function(){
  doPrint(state.teams, true);
});
window.addEventListener('keydown', function(e){
  if((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'p'){
    e.preventDefault();
    doPrint([state.teams[state.active]], false);
  }
});

/* 테마가 바뀌면 팀 색을 다시 칠합니다 */
if(window.matchMedia){
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if(mq.addEventListener) mq.addEventListener('change', renderAll);
}

/* ================= 시작 ================= */
(async function boot(){
  await Store.init();
  renderConn();
  var teams;
  try{
    teams = await Store.loadAll(seedTeams());
  }catch(e){
    teams = seedTeams();
    toast('내용을 불러오지 못해 기본 화면으로 시작합니다: ' + (e.message || e));
  }
  state.teams = teams.map(normalize);
  var reordered = sortTeams();
  renderConn();   // 불러오는 중에 클라우드 연결이 끊겼을 수도 있어 다시 표시합니다
  renderAll();
  if(reordered) saveOrder();   // 예전 순서로 저장돼 있던 것을 ㄱㄴㄷ 순으로 맞춰 둡니다

  // 주소 끝에 ?print=all (또는 ?print=1) 을 붙이면 인쇄본이 미리 만들어진 상태로 열립니다.
  // 바로 Ctrl+P 하시면 되고, PDF 자동 저장에도 이 주소를 씁니다.
  var pq = new URLSearchParams(location.search).get('print');
  if(pq){
    var list = (pq === 'all') ? state.teams : [state.teams[state.active]];
    var html = (pq === 'all' && list.length > 1) ? coverHtml(list) : '';
    list.forEach(function(t, i){ html += teamPrintHtml(t, i + 1, list.length); });
    document.getElementById('print').innerHTML = html;
  }

  if(Store.mode === 'cloud'){
    Store.subscribe(function(payload){
      var row = payload.new || payload.old;
      if(!row) return;
      var at = state.teams.findIndex(function(t){ return t.id === row.id; });
      if(payload.eventType === 'DELETE'){
        if(at >= 0 && at !== state.active){ state.teams.splice(at, 1); renderAll(); }
        return;
      }
      // 내가 마지막으로 보낸 것보다 오래된 소식이면 무시합니다.
      // (방금 친 글자가 직전 저장분 메아리에 되돌려지는 것을 막습니다)
      var when = row.updated_at || '';
      if(when && Store.lastWrite[row.id] && when <= Store.lastWrite[row.id]) return;
      // 내용이 지금과 같으면 (= 내 저장이 그대로 돌아온 것이면) 볼 것이 없습니다.
      if(at >= 0 && canon(row.data) === canon(state.teams[at])) return;
      if(at < 0){
        state.teams.push(normalize(Object.assign({}, row.data, {id:row.id})));
        renderRail();
        return;
      }
      var fresh = normalize(Object.assign({}, row.data, {id:row.id}));
      if(at !== state.active){
        state.teams[at] = fresh;
        renderRail();
        return;
      }
      // 보고 계신 팀입니다. 칸에 커서가 있으면 적고 계신 중이므로 건드리지 않습니다.
      // 그 외에는 알림 없이 조용히 최신 내용으로 바꿔 둡니다.
      var sheets = document.getElementById('sheets');
      if(document.activeElement && sheets.contains(document.activeElement)) return;
      state.teams[at] = fresh;
      renderAll();
    });
  }
})();
})();

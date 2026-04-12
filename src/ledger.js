// ── Theme ──────────────────────────────────────────────────────────────────
function initTheme() {
  if (localStorage.getItem('ledger-theme') === 'dark') document.body.classList.add('dark');
}
function toggleTheme() {
  const d = document.body.classList.toggle('dark');
  localStorage.setItem('ledger-theme', d ? 'dark' : 'light');
}

// ── Logout ──────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('ledger-authed');
  localStorage.removeItem('ledger-role');
  window.location.href = 'index.html';
}

// ── Relative time ───────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)} weeks ago`;
  if (days < 365) return `${Math.floor(days/30)} months ago`;
  return `${Math.floor(days/365)}yr ago`;
}

function initRelativeTimes() {
  document.querySelectorAll('[data-date]').forEach(el => {
    el.textContent = relativeTime(el.dataset.date);
    el.title = el.dataset.date;
  });
}

// ── Calm signal: pitstop with pulse confirmation + quiet saved tick ──────────
let psSaveTimer = null;

function initPitstop() {
  document.querySelectorAll('.doc-pso').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const row = this.closest('.doc-ps-row');
      row.querySelectorAll('.doc-pso').forEach(o => { o.classList.remove('sel'); o.style.animation = ''; });
      this.classList.add('sel');
      this.style.animation = 'none';
      void this.offsetWidth;
      this.style.animation = 'ps-confirm 0.3s ease';
      const saved = row.querySelector('.ps-saved');
      if (saved) {
        saved.classList.add('show');
        clearTimeout(psSaveTimer);
        psSaveTimer = setTimeout(() => saved.classList.remove('show'), 2200);
      }
      const val = this.dataset.ps;
      if (val) localStorage.setItem('ledger-ps-' + window.location.pathname, val);
    });
  });
}

// ── Calm signal: auto-save summary after 1.4s pause ─────────────────────────
let sumSaveTimer = null;

function initSummaryAutoSave() {
  const ta = document.getElementById('sumTA');
  if (!ta) return;
  ta.addEventListener('input', () => {
    clearTimeout(sumSaveTimer);
    sumSaveTimer = setTimeout(() => {
      const view = document.getElementById('sumView');
      if (view) view.textContent = ta.value;
      showSumSaved();
    }, 1400);
  });
}

function showSumSaved() {
  const el = document.getElementById('sumSaved');
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function editSummary() {
  const view = document.getElementById('sumView');
  const ta = document.getElementById('sumTA');
  const actions = document.getElementById('sumActions');
  if (!view || !ta) return;
  view.style.display = 'none';
  ta.style.display = 'block';
  if (actions) actions.style.display = 'flex';
  ta.focus();
  ta.selectionStart = ta.value.length;
}

function saveSummary() {
  const view = document.getElementById('sumView');
  const ta = document.getElementById('sumTA');
  const actions = document.getElementById('sumActions');
  if (!view || !ta) return;
  view.textContent = ta.value;
  view.style.display = '';
  ta.style.display = 'none';
  if (actions) actions.style.display = 'none';
  showSumSaved();
}

function cancelSummary() {
  const view = document.getElementById('sumView');
  const ta = document.getElementById('sumTA');
  const actions = document.getElementById('sumActions');
  if (view) view.style.display = '';
  if (ta) ta.style.display = 'none';
  if (actions) actions.style.display = 'none';
}

// ── Calm signal: rail badge for escalations ──────────────────────────────────
function updateRailBadge() {
  const count = parseInt(localStorage.getItem('ledger-escalated-count') || '3');
  document.querySelectorAll('.rail-badge').forEach(b => {
    b.style.display = count > 0 ? '' : 'none';
  });
}

// ── Gulf reduction: dot-click filtering ─────────────────────────────────────
let activeFilter = null;

function filterByDot(cat) {
  if (activeFilter === cat) {
    activeFilter = null;
    document.querySelectorAll('.doc-entry, .doc-editor').forEach(e => {
      e.style.opacity = '1';
      e.style.pointerEvents = '';
    });
  } else {
    activeFilter = cat;
    document.querySelectorAll('.doc-entry[data-cat], .doc-editor[data-cat]').forEach(e => {
      const match = e.dataset.cat === cat;
      e.style.opacity = match ? '1' : '0.2';
      e.style.pointerEvents = match ? '' : 'none';
    });
  }
}

function initDotFilters() {
  document.querySelectorAll('.entry-dot-filter').forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      filterByDot(this.dataset.cat);
    });
    dot.style.cursor = 'pointer';
    dot.title = 'Click to filter';
  });
}

// ── Gulf reduction: inline edit ─────────────────────────────────────────────
let currentEdit = null;

function openEdit(id) {
  if (currentEdit) closeEdit(currentEdit);
  closeComposer();
  const entry = document.getElementById(id);
  const editor = document.getElementById('editor-' + id);
  if (!entry || !editor) return;
  entry.style.display = 'none';
  editor.style.display = 'block';
  const t = editor.querySelector('.doc-ed-title');
  if (t) { t.focus(); t.select(); }
  currentEdit = id;
}

function closeEdit(id) {
  const entry = document.getElementById(id);
  const editor = document.getElementById('editor-' + id);
  if (entry) entry.style.display = '';
  if (editor) editor.style.display = 'none';
  if (currentEdit === id) currentEdit = null;
}

function deleteEntry(id) {
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  document.getElementById(id)?.remove();
  document.getElementById('editor-' + id)?.remove();
  if (currentEdit === id) currentEdit = null;
}

// ── Gulf reduction: inline composer with pill cats ───────────────────────────
function openComposer() {
  if (currentEdit) closeEdit(currentEdit);
  const trigger = document.getElementById('composerTrigger');
  const composer = document.getElementById('composer');
  if (!trigger || !composer) return;
  trigger.style.display = 'none';
  composer.style.display = 'block';
  composer.querySelector('.doc-comp-title')?.focus();
}

function closeComposer() {
  const trigger = document.getElementById('composerTrigger');
  const composer = document.getElementById('composer');
  if (trigger) trigger.style.display = '';
  if (composer) composer.style.display = 'none';
}

function selectCompCat(btn) {
  const cats = {perf:'sel-perf', conduct:'sel-conduct', dev:'sel-dev'};
  btn.closest('.comp-pill-cats').querySelectorAll('.comp-pill-cat').forEach(b => {
    b.className = 'comp-pill-cat';
  });
  const cat = btn.dataset.cat;
  btn.classList.add(cats[cat] || '');
}

function selectCompType(btn) {
  btn.closest('.comp-pill-types').querySelectorAll('.comp-pill-type').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

function initComposerPills() {
  document.querySelectorAll('.comp-pill-cat').forEach(btn => {
    btn.addEventListener('click', () => selectCompCat(btn));
  });
  document.querySelectorAll('.comp-pill-type').forEach(btn => {
    btn.addEventListener('click', () => selectCompType(btn));
  });
}

// ── Gulf reduction: pre-drafted escalation reason ────────────────────────────
// Map of entry IDs to pre-drafted reasons, built from entry content
const preDraftedReasons = {};

function buildPreDraftedReasons() {
  document.querySelectorAll('.doc-entry[data-cat], .doc-editor').forEach(el => {
    const id = el.id?.replace('editor-', '');
    if (!id) return;
    const entry = document.getElementById(id);
    if (!entry) return;
    const title = entry.querySelector('.doc-entry-title')?.textContent || '';
    const body = entry.querySelector('.doc-entry-body')?.textContent?.trim() || '';
    const meta = entry.querySelector('.doc-entry-meta')?.textContent?.replace(/click to edit/g,'').trim() || '';
    if (title) {
      preDraftedReasons[id] = `Entry dated ${meta.split('·')[0]?.trim() || 'recently'}: "${title}". ${body.slice(0, 120)}${body.length > 120 ? '…' : ''} Flagging for HR awareness.`;
    }
  });
}

function openEscalateModal(context, entryId) {
  const modal = document.getElementById('escalateModal');
  const ctx = document.getElementById('escalateContext');
  const reason = document.getElementById('escalateReason');
  if (!modal) return;
  if (ctx && context) ctx.textContent = context;
  if (reason) {
    const draft = entryId ? preDraftedReasons[entryId] : null;
    reason.value = draft || '';
    if (draft) {
      const badge = document.getElementById('preDraftBadge');
      if (badge) badge.style.display = 'inline';
    }
  }
  modal.classList.add('open');
  if (reason) setTimeout(() => { reason.focus(); reason.selectionStart = reason.value.length; }, 50);
}

function closeEscalateModal() {
  const modal = document.getElementById('escalateModal');
  if (modal) modal.classList.remove('open');
}

function confirmEscalate() {
  const reason = document.getElementById('escalateReason');
  if (reason && !reason.value.trim()) {
    reason.style.borderColor = '#F09595';
    reason.focus();
    return;
  }
  closeEscalateModal();
  const flash = document.getElementById('escalateFlash');
  if (flash) { flash.style.display = 'flex'; setTimeout(() => flash.style.display = 'none', 4000); }
  const flag = document.getElementById('escalateFlag');
  const trigger = document.getElementById('escalateTrigger');
  if (flag) flag.style.display = 'inline-flex';
  if (trigger) trigger.style.display = 'none';
}

// ── Page filters (entries/escalated pages) ───────────────────────────────────
function initPageFilters() {
  document.querySelectorAll('.page-filter[data-filter]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.closest('.page-filters').querySelectorAll('.page-filter').forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      const val = this.dataset.filter;
      document.querySelectorAll('.page-entry[data-cat]').forEach(el => {
        el.style.display = (val === 'all' || el.dataset.cat === val) ? '' : 'none';
      });
    });
  });
}

// ── Smart category combobox ──────────────────────────────────────────────────
const LEDGER_CATS = ['Performance', 'Conduct', 'Development'];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length:m+1}, (_,i) => Array.from({length:n+1}, (_,j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);
  return dp[m][n];
}
function catScore(q, c) {
  const ql=q.toLowerCase(), cl=c.toLowerCase();
  if (cl===ql) return {score:0,label:'Exact match'};
  if (cl.startsWith(ql)||cl.includes(ql)) return {score:1,label:'Match'};
  const dist=levenshtein(ql,cl), thresh=Math.max(2,Math.floor(cl.length*0.4));
  if (dist<=thresh) return {score:dist,label:dist===1?'Did you mean?':'Close match'};
  return null;
}
function initCategoryCombobox(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const wrap = input.closest('.cat-combobox');
  const dropdown = wrap.querySelector('.cat-dropdown');
  const hint = wrap.querySelector('.cat-hint');
  let focusedIdx=-1;
  let cats=[...LEDGER_CATS];
  try { const s=JSON.parse(localStorage.getItem('ledger-categories')||'[]'); s.forEach(c=>{if(!cats.includes(c))cats.push(c);}); } catch(e) {}
  function getOpts(q){
    if(!q) return cats.map(c=>({label:c,match:'',isNew:false}));
    const scored=cats.map(c=>{const s=catScore(q,c);return s?{label:c,match:s.label,score:s.score,isNew:false}:null;}).filter(Boolean).sort((a,b)=>a.score-b.score);
    if(!scored.some(s=>s.score===0||(s.score===1&&cats.map(c=>c.toLowerCase()).includes(q.toLowerCase())))){if(!cats.some(c=>c.toLowerCase()===q.toLowerCase()))scored.push({label:q,match:'',isNew:true});}
    return scored;
  }
  function render(q){
    const opts=getOpts(q); focusedIdx=-1;
    if(!opts.length){dropdown.classList.remove('open');return;}
    dropdown.innerHTML=opts.map((o,i)=>o.isNew
      ?`<div class="cat-option-new" data-idx="${i}" data-label="${o.label}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Add "<strong>${o.label}</strong>"<span class="cat-new-badge">New</span></div>`
      :`<div class="cat-option" data-idx="${i}" data-label="${o.label}"><span>${o.label}</span>${o.match?`<span class="cat-option-match">${o.match}</span>`:''}</div>`
    ).join('');
    dropdown.classList.add('open');
    dropdown.querySelectorAll('[data-idx]').forEach(el=>{el.addEventListener('mousedown',e=>{e.preventDefault();select(el.dataset.label,opts[+el.dataset.idx].isNew);});});
  }
  function select(label,isNew){
    const n=label.charAt(0).toUpperCase()+label.slice(1).toLowerCase();
    const existing=cats.find(c=>c.toLowerCase()===n.toLowerCase());
    const final=existing||n;
    if(isNew&&!existing){cats.push(final);try{const s=JSON.parse(localStorage.getItem('ledger-categories')||'[]');if(!s.includes(final))s.push(final);localStorage.setItem('ledger-categories',JSON.stringify(s));}catch(e){}if(hint)hint.textContent=`"${final}" added.`;}else{if(hint)hint.textContent='';}
    input.value=final; dropdown.classList.remove('open');
  }
  function updateFocus(items){items.forEach((el,i)=>el.classList.toggle('focused',i===focusedIdx));if(focusedIdx>=0)items[focusedIdx].scrollIntoView({block:'nearest'});}
  input.addEventListener('input',()=>render(input.value.trim()));
  input.addEventListener('focus',()=>render(input.value.trim()));
  input.addEventListener('blur',()=>setTimeout(()=>dropdown.classList.remove('open'),150));
  input.addEventListener('keydown',e=>{
    const items=dropdown.querySelectorAll('[data-idx]');if(!items.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();focusedIdx=Math.min(focusedIdx+1,items.length-1);updateFocus(items);}
    else if(e.key==='ArrowUp'){e.preventDefault();focusedIdx=Math.max(focusedIdx-1,0);updateFocus(items);}
    else if(e.key==='Enter'&&focusedIdx>=0){e.preventDefault();const el=items[focusedIdx];select(el.dataset.label,getOpts(input.value.trim())[focusedIdx]?.isNew);}
    else if(e.key==='Escape')dropdown.classList.remove('open');
  });
}

// ── Kanban dashboard ─────────────────────────────────────────────────────────
const ALL_EMP = [
  {name:'Jordan Ellis',role:'Senior engineer',team:'Platform',av:'JE',avBg:'rgba(239,159,39,0.14)',avCol:'#EF9F27',ps:'y',last:'2025-09-12',entries:7},
  {name:'Sara Chen',role:'Engineer II',team:'Platform',av:'SC',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-10-02',entries:4},
  {name:"Marcus O'Brien",role:'Engineer I',team:'Platform',av:'MO',avBg:'rgba(240,149,149,0.14)',avCol:'#F09595',ps:'r',last:'2025-10-18',entries:11},
  {name:'Priya Lal',role:'Senior engineer',team:'Data',av:'PL',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-11-05',entries:3},
  {name:'Tom Walsh',role:'Engineer II',team:'Data',av:'TW',avBg:'rgba(239,159,39,0.14)',avCol:'#EF9F27',ps:'y',last:'2025-10-29',entries:5},
  {name:'Riya Nair',role:'Engineer II',team:'Security',av:'RN',avBg:'rgba(133,183,235,0.14)',avCol:'#85B7EB',ps:'g',last:'2025-11-14',entries:2},
  {name:'David Kim',role:'Engineer I',team:'Security',av:'DK',avBg:'rgba(240,149,149,0.14)',avCol:'#F09595',ps:'r',last:'2025-12-01',entries:8},
  {name:'Aisha Mensah',role:'Senior engineer',team:'Mobile',av:'AM',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-11-20',entries:3},
  {name:'Leon Park',role:'Engineer II',team:'Mobile',av:'LP',avBg:'rgba(133,183,235,0.14)',avCol:'#85B7EB',ps:'y',last:'2025-11-08',entries:6},
  {name:'Fatima Hassan',role:'Engineer I',team:'Platform',av:'FH',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-12-03',entries:2},
  {name:'Chris Nguyen',role:'Senior engineer',team:'Data',av:'CN',avBg:'rgba(239,159,39,0.14)',avCol:'#EF9F27',ps:'y',last:'2025-11-15',entries:5},
  {name:'Sophie Okafor',role:'Engineer II',team:'Security',av:'SO',avBg:'rgba(240,149,149,0.14)',avCol:'#F09595',ps:'r',last:'2025-10-22',entries:9},
  {name:'James Ruiz',role:'Engineer I',team:'Mobile',av:'JR',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-11-01',entries:1},
  {name:'Nina Petrov',role:'Senior engineer',team:'Platform',av:'NP',avBg:'rgba(133,183,235,0.14)',avCol:'#85B7EB',ps:'g',last:'2025-12-06',entries:4},
  {name:'Omar Shaikh',role:'Engineer II',team:'Data',av:'OS',avBg:'rgba(239,159,39,0.14)',avCol:'#EF9F27',ps:'y',last:'2025-10-11',entries:7},
  {name:'Lily Tanaka',role:'Engineer I',team:'Security',av:'LT',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-11-19',entries:3},
  {name:'Ben Adeyemi',role:'Engineer II',team:'Mobile',av:'BA',avBg:'rgba(240,149,149,0.14)',avCol:'#F09595',ps:'r',last:'2025-11-28',entries:6},
  {name:'Clara Ivanova',role:'Senior engineer',team:'Platform',av:'CI',avBg:'rgba(133,183,235,0.14)',avCol:'#85B7EB',ps:'g',last:'2025-12-04',entries:5},
  {name:'Ray Okonkwo',role:'Engineer I',team:'Data',av:'RO',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-10-30',entries:2},
  {name:'Hana Kobayashi',role:'Engineer II',team:'Security',av:'HK',avBg:'rgba(239,159,39,0.14)',avCol:'#EF9F27',ps:'y',last:'2025-11-07',entries:4},
  {name:'Idris Osei',role:'Senior engineer',team:'Mobile',av:'IO',avBg:'rgba(133,183,235,0.14)',avCol:'#85B7EB',ps:'g',last:'2025-11-25',entries:3},
  {name:'Vera Lindqvist',role:'Engineer II',team:'Platform',av:'VL',avBg:'rgba(240,149,149,0.14)',avCol:'#F09595',ps:'r',last:'2025-12-10',entries:8},
  {name:'Sam Achebe',role:'Engineer I',team:'Data',av:'SA',avBg:'rgba(93,202,165,0.14)',avCol:'#5DCAA5',ps:'g',last:'2025-12-02',entries:1},
];

function renderKanban(q='') {
  const filtered = q ? ALL_EMP.filter(e => e.name.toLowerCase().includes(q.toLowerCase())) : ALL_EMP;
  ['g','y','r'].forEach(ps => {
    const col = document.getElementById('col-'+ps);
    const count = document.getElementById('count-'+ps);
    if (!col) return;
    const people = filtered.filter(e => e.ps === ps);
    if (count) count.textContent = people.length;
    col.innerHTML = people.length === 0
      ? `<div style="font-size:13px;color:var(--tm);padding:20px 0;text-align:center">None</div>`
      : people.map(e => `
        <a href="profile.html" class="kb-card">
          <div class="kb-card-top">
            <div class="kb-av" style="background:${e.avBg};color:${e.avCol}">${e.av}</div>
            <div><div class="kb-name">${e.name}</div><div class="kb-role">${e.role} · ${e.team}</div></div>
          </div>
          <div class="kb-rule"></div>
          <div class="kb-foot">
            <span class="kb-meta" data-date="${e.last}"></span>
            <span class="kb-entries">${e.entries} entries</span>
          </div>
        </a>`).join('');
    // Apply relative times to newly rendered cards
    col.querySelectorAll('[data-date]').forEach(el => {
      el.textContent = relativeTime(el.dataset.date);
    });
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPitstop();
  initRelativeTimes();
  initDotFilters();
  initPageFilters();
  initSummaryAutoSave();
  initComposerPills();
  updateRailBadge();
  buildPreDraftedReasons();
  const search = document.getElementById('kanbanSearch');
  if (search) {
    renderKanban();
    search.addEventListener('input', () => renderKanban(search.value));
  }
});

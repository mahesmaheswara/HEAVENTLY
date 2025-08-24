// =======================================================
// HeaVenTly — Booked Vendors JS (Phase 1 + 2)
// Cart hybrid + Request + Negotiation + Contract + Payment + Connect
// =======================================================

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const BOOKED_KEY = 'booked_vendors';
const EVENTS_KEY = 'events_seed';
const CONTRACT_KEY = 'contracts';
const PAY_KEY = 'payments';
const ACT_KEY = 'activities'; // notifications / activity log

// ---------- Storage helpers ----------
function load(key, fallback){
  try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch(e){ return fallback; }
}
function save(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Seed minimal demo data ----------
(function seed(){
  const cur = load(BOOKED_KEY, []);
  if(cur.length===0){
    const demo = [
      { id:'v-decor', name:'Vendor Dekor Ardi', category:'decor', location:'Jakarta', img:'https://picsum.photos/seed/ardi/600/400', rating:4, desc:'Dekor indoor/outdoor', status:'booked' },
      { id:'v-cat', name:'Catering Bumi Rasa', category:'catering', location:'Bandung', img:'https://picsum.photos/seed/cat/600/400', rating:5, desc:'Menu tradisional & internasional', status:'negotiation' },
      { id:'v-photo', name:'Lensa Abadi Studio', category:'photo', location:'Jakarta', img:'https://picsum.photos/seed/photo/600/400', rating:4, desc:'Wedding & corporate photo/video', status:'pending' }
    ];
    save(BOOKED_KEY, demo);
  }
  const ev = load(EVENTS_KEY, []);
  if(ev.length===0){
    const events = [
      { id:'e-101', name:'Wedding F&R', date:'2025-09-20', location:'Jakarta' },
      { id:'e-102', name:'Corporate Summit', date:'2025-11-05', location:'Bandung' },
      { id:'e-103', name:'Music Night', date:'2025-12-12', location:'Yogyakarta' }
    ];
    save(EVENTS_KEY, events);
  }
  if(load(CONTRACT_KEY, null)===null) save(CONTRACT_KEY, {});
  if(load(PAY_KEY, null)===null) save(PAY_KEY, {});
  if(load(ACT_KEY, null)===null) save(ACT_KEY, []);
})();

// ---------- Icons ----------
window.addEventListener('load', ()=>{ try{ lucide.createIcons(); }catch(e){} });

// ---------- Sidebar mobile toggle ----------
$('#menuToggle')?.addEventListener('click', ()=>{
  const sb = $('.sidebar');
  const ov = $('#sideNavOverlay');
  if(sb.classList.contains('open')){
    sb.classList.remove('open'); ov?.classList.remove('active'); ov?.setAttribute('hidden','');
  }else{
    sb.classList.add('open'); ov?.classList.add('active'); ov?.removeAttribute('hidden');
  }
});
$('#sideNavOverlay')?.addEventListener('click', ()=>{
  $('.sidebar')?.classList.remove('open');
  $('#sideNavOverlay')?.classList.remove('active');
  $('#sideNavOverlay')?.setAttribute('hidden','');
});

// ---------- Toast ----------
function toast(msg, type='info'){
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(()=> t.hidden = true, 2400);
}

// ---------- Activity / Notification ----------
function addActivity(text){
  const act = load(ACT_KEY, []);
  act.unshift({ text, time: new Date().toISOString() });
  save(ACT_KEY, act);
  renderActivities();
}
function renderActivities(){
  const act = load(ACT_KEY, []);
  const wrap = $('#notifList');
  wrap.innerHTML = '';
  act.slice(0,80).forEach(a=>{
    const div = document.createElement('div');
    div.className = 'notif-item';
    const date = new Date(a.time);
    div.innerHTML = `
      <div>${escapeHtml(a.text)}</div>
      <div class="time">${date.toLocaleString()}</div>
    `;
    wrap.appendChild(div);
  });
}

// ---------- Utils ----------
function escapeHtml(s){
  return (s||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function getVendors(){ return load(BOOKED_KEY, []); }
function setVendors(list){ save(BOOKED_KEY, list); render(); }
function findVendor(id){ return getVendors().find(v=>v.id===id); }

// ---------- Render grid ----------
function render(){
  const list = getVendors();
  const grid = $('#bookedGrid');
  grid.innerHTML = '';
  $('#countInfo').textContent = `${list.length} vendors`;
  if(list.length===0){ $('#empty').hidden=false; return; } else $('#empty').hidden=true;

  const q = ($('#q')?.value || '').toLowerCase().trim();
  const fCat = $('#fCategory')?.value || '';
  const fStatus = $('#fStatus')?.value || '';
  const fLoc = ($('#fLocation')?.value || '').toLowerCase().trim();

  const shown = list.filter(v=>{
    if(q && !((v.name||'').toLowerCase().includes(q) || (v.category||'').toLowerCase().includes(q) || (v.location||'').toLowerCase().includes(q))) return false;
    if(fCat && (v.category||'')!==fCat) return false;
    if(fStatus && (v.status||'')!==fStatus) return false;
    if(fLoc && !((v.location||'').toLowerCase().includes(fLoc))) return false;
    return true;
  });

  if(shown.length===0){
    grid.innerHTML = `<div class="empty-state"><h3>Tidak ada hasil</h3><div class="muted">Coba ubah filter atau keyword.</div></div>`;
    return;
  }

  const selectMode = $('#toggleSelectMode')?.checked;
  shown.forEach(v=>{
    const card = document.createElement('article');
    card.className = 'vendor-card';
    card.setAttribute('role','listitem');
    const status = v.status || 'pending';

    card.innerHTML = `
      <header class="card-head" style="display:flex;justify-content:space-between;align-items:center">
        <div class="muted small">${escapeHtml(v.category||'')}</div>
        ${selectMode ? `<label class="toggle small"><input type="checkbox" class="sel-vendor" data-id="${v.id}"><span>Select</span></label>`:''}
      </header>
      <div class="vendor-thumb">
        ${v.img ? `<img src="${v.img}" alt="${escapeHtml(v.name)}" style="width:100%;height:100%;object-fit:cover">` : 'No image'}
      </div>
      <div class="vendor-name">${escapeHtml(v.name)}</div>
      <div class="rating">${'★'.repeat(v.rating||4)}${'☆'.repeat(5-(v.rating||4))}</div>
      <div class="vendor-desc">${escapeHtml(v.desc||'')}</div>
      <div class="status ${status}">${escapeHtml(status)}</div>
      <footer class="card-actions">
        <button class="btn" data-act="request" data-id="${v.id}" title="Send Request">Request</button>
        <button class="btn" data-act="nego" data-id="${v.id}" title="Negotiate">Negotiate</button>
        <button class="btn" data-act="contract" data-id="${v.id}" title="Contract">Contract</button>
        <button class="btn" data-act="pay" data-id="${v.id}" title="Payment">Pay</button>
        <button class="btn btn-primary" data-act="connect" data-id="${v.id}" title="Connect to Event">Connect</button>
        <button class="btn" data-act="remove" data-id="${v.id}" title="Remove">🗑</button>
      </footer>
    `;
    grid.appendChild(card);
  });

  // Bind card actions
  grid.querySelectorAll('[data-act]').forEach(btn=>{
    btn.addEventListener('click', onCardAction);
  });

  // Update bulk selected count
  updateSelectedCount();
  try{ lucide.createIcons(); }catch(e){}
}

// ---------- Card actions ----------
function onCardAction(e){
  const act = e.currentTarget.dataset.act;
  const id = e.currentTarget.dataset.id;
  if(!id) return;

  if(act==='remove'){
    if(!confirm('Hapus vendor dari cart?')) return;
    const arr = getVendors().filter(v=>v.id!==id);
    setVendors(arr);
    addActivity(`Removed vendor ${id} from cart`);
    toast('Vendor removed');
    return;
  }

  if(act==='request') return openRequest(id);
  if(act==='nego') return openNegotiation(id);
  if(act==='contract') return openContract(id);
  if(act==='pay') return openPayment(id);
  if(act==='connect') return openConnect(id);
}

// ---------- Filters ----------
$('#btnApplyFilters')?.addEventListener('click', render);
$('#btnClearFilters')?.addEventListener('click', ()=>{
  $('#fCategory').value = '';
  $('#fStatus').value = '';
  $('#fLocation').value = '';
  render();
});
$('#btnSearch')?.addEventListener('click', render);
$('#q')?.addEventListener('keyup', e=>{ if(e.key==='Enter') render(); });

// ---------- Bulk tools ----------
$('#toggleSelectMode')?.addEventListener('change', ()=>{
  render();
});
function getSelectedIds(){
  return $$('.sel-vendor:checked').map(x=> x.dataset.id);
}
function updateSelectedCount(){
  const ids = getSelectedIds();
  $('#selectedCount').textContent = `${ids.length} dipilih`;

  const enable = ids.length>0;
  $('#bulkRequest').disabled = !enable;
  $('#bulkNegotiate').disabled = !enable;
  $('#bulkConnect').disabled = !enable;
  $('#bulkRemove').disabled = !enable;

  $$('.sel-vendor').forEach(chk=>{
    chk.addEventListener('change', updateSelectedCount);
  });
}
$('#bulkRemove')?.addEventListener('click', ()=>{
  const ids = getSelectedIds();
  if(ids.length===0) return;
  if(!confirm(`Hapus ${ids.length} vendor?`)) return;
  const arr = getVendors().filter(v=> !ids.includes(v.id));
  setVendors(arr);
  addActivity(`Removed ${ids.length} vendors (bulk)`);
  toast('Bulk removed');
});
$('#bulkRequest')?.addEventListener('click', ()=>{
  const ids = getSelectedIds();
  if(ids.length===0) return;
  openRequest(ids); // pass array
});
$('#bulkNegotiate')?.addEventListener('click', ()=>{
  const ids = getSelectedIds();
  if(ids.length===0) return;
  openNegotiation(ids);
});
$('#bulkConnect')?.addEventListener('click', ()=>{
  const ids = getSelectedIds();
  if(ids.length===0) return;
  openConnect(ids);
});

// ---------- REQUEST ----------
function openRequest(idOrIds){
  openModal('#requestModal');
  $('#requestForm').dataset.vendorIds = JSON.stringify(Array.isArray(idOrIds)? idOrIds : [idOrIds]);
  $('#reqMsg').value = '';
}
$('#requestForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const ids = JSON.parse(e.currentTarget.dataset.vendorIds || '[]');
  const msg = $('#reqMsg').value.trim();
  if(ids.length===0) return;
  const arr = getVendors().map(v=>{
    if(ids.includes(v.id)) return {...v, status:'pending'};
    return v;
  });
  setVendors(arr);
  closeModal('#requestModal');
  addActivity(`Request sent to ${ids.length} vendor(s): "${msg||'-'}"`);
  toast('Request sent');
});

// ---------- NEGOTIATION ----------
let NEGO_TARGET_IDS = [];
function openNegotiation(idOrIds){
  NEGO_TARGET_IDS = Array.isArray(idOrIds)? idOrIds : [idOrIds];
  openModal('#negotiationModal');
  $('#negoRequested').value = '';
  $('#negoProposed').value = '';
  $('#negoNotes').value = '';
  $('#negoPrice').value = '';
  $('#chatThread').innerHTML = '';
}
$('#negoSend')?.addEventListener('click', ()=>{
  const msg = $('#negoMsg').value.trim();
  if(!msg) return;
  const thread = $('#chatThread');
  const div = document.createElement('div');
  div.className = 'chat-msg from-client';
  div.textContent = msg;
  thread.appendChild(div);
  $('#negoMsg').value = '';
  thread.scrollTop = thread.scrollHeight;
});
$('#negoProposeBtn')?.addEventListener('click', ()=>{
  const req = $('#negoRequested').value;
  const prop = $('#negoProposed').value;
  const notes = $('#negoNotes').value;
  const price = $('#negoPrice').value;

  if(!prop && !price){
    toast('Isi proposal (proposed capacity/price)'); return;
  }
  // Mark vendors as negotiation
  const arr = getVendors().map(v=>{
    if(NEGO_TARGET_IDS.includes(v.id)) return {...v, status:'negotiation'};
    return v;
  });
  setVendors(arr);
  addActivity(`Negotiation proposal sent to ${NEGO_TARGET_IDS.length} vendor(s) — requested:${req||'-'}, proposed:${prop||'-'}, price:${price||'-'}`);
  toast('Proposal sent');
  closeModal('#negotiationModal');
});

// ---------- CONTRACT ----------
let CONTRACT_VENDOR_ID = null;
function openContract(id){
  CONTRACT_VENDOR_ID = id;
  openModal('#contractModal');
  $('#ctrPlan').value = 'full';
  $('#ctrDP').value = '';
  $('#ctrTotal').value = '';
  $('#ctrDue').value = '';
  $('#ctrTerms').value = '';
  $('#dpField').hidden = true;
  $('#ctrStatus').textContent = 'Status: draft';
}
$('#ctrPlan')?.addEventListener('change', ()=>{
  const isDP = $('#ctrPlan').value === 'dp';
  $('#dpField').hidden = !isDP;
});
$('#ctrPreview')?.addEventListener('click', ()=>{
  const plan = $('#ctrPlan').value;
  const total = +($('#ctrTotal').value||0);
  const dp = +($('#ctrDP').value||0);
  const due = $('#ctrDue').value;
  let summary = `Plan: ${plan.toUpperCase()} • Total: Rp ${total.toLocaleString()} • Due: ${due||'-'}`;
  if(plan==='dp') summary += ` • DP: ${dp}% → Rp ${(total*dp/100).toLocaleString()}`;
  $('#ctrStatus').textContent = summary;
});
$('#contractForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const id = CONTRACT_VENDOR_ID; if(!id) return;
  const plan = $('#ctrPlan').value;
  const total = +($('#ctrTotal').value||0);
  const dp = +($('#ctrDP').value||0);
  const due = $('#ctrDue').value;
  const terms = $('#ctrTerms').value.trim();

  if(total<=0){ toast('Total harus valid'); return; }
  if(plan==='dp' && (dp<1 || dp>90)){ toast('DP% 1..90'); return; }

  const contracts = load(CONTRACT_KEY, {});
  contracts[id] = { plan, total, dp, due, terms, status:'awaiting_client_sign', clientSigned:false, vendorSigned:false };
  save(CONTRACT_KEY, contracts);

  // vendor status -> contract
  const arr = getVendors().map(v=> v.id===id ? {...v, status:'contract'} : v);
  setVendors(arr);

  addActivity(`Contract drafted for ${id} — plan:${plan}, total:Rp ${total.toLocaleString()}`);
  toast('Contract sent to vendor');
  closeModal('#contractModal');

  // simulate instant vendor accept signature (optional next step)
  setTimeout(()=>{
    const c = load(CONTRACT_KEY, {});
    if(!c[id]) return;
    c[id].vendorSigned = true;
    c[id].status = c[id].clientSigned ? 'signed' : 'awaiting_client_sign';
    save(CONTRACT_KEY, c);
    addActivity(`Vendor pre-signed contract for ${id} (waiting client sign)`);
    render();
  }, 1200);
});

// ---------- PAYMENT ----------
let PAYMENT_VENDOR_ID = null;
function openPayment(id){
  PAYMENT_VENDOR_ID = id;
  openModal('#paymentModal');
  const contracts = load(CONTRACT_KEY, {});
  const c = contracts[id];
  const payStore = load(PAY_KEY, {});
  const p = payStore[id] || { paid:0, items:[] };

  let html = '';
  if(!c){
    html = `<div class="muted">Belum ada kontrak. Buat kontrak terlebih dahulu.</div>`;
  }else{
    // compute outstanding depending plan
    let initialDue = 0;
    if(c.plan==='full') initialDue = c.total;
    else initialDue = Math.round(c.total * (c.dp/100));

    const outstanding = Math.max(0, initialDue - p.paid);
    html = `
      <div><b>Plan:</b> ${c.plan.toUpperCase()}</div>
      <div><b>Total Contract:</b> Rp ${c.total.toLocaleString()}</div>
      ${c.plan==='dp' ? `<div><b>DP:</b> ${c.dp}% → Rp ${ (c.total*c.dp/100).toLocaleString() }</div>`:''}
      <div><b>Initial Due:</b> Rp ${initialDue.toLocaleString()} (Due: ${c.due || '-'})</div>
      <div><b>Paid:</b> Rp ${p.paid.toLocaleString()}</div>
      <div><b>Outstanding for activation:</b> Rp ${outstanding.toLocaleString()}</div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0">
      <div class="small muted">* Setelah pembayaran awal terpenuhi (Full / DP), kamu bisa Connect to Event.</div>
    `;
  }
  $('#paySummary').innerHTML = html;
  $('#payAmount').value = '';
  $('#payRef').value = '';
}
$('#payMark')?.addEventListener('click', ()=>{
  const id = PAYMENT_VENDOR_ID; if(!id) return;
  const amt = +($('#payAmount').value||0);
  const ref = $('#payRef').value.trim();
  if(amt<=0){ toast('Amount invalid'); return; }

  const payStore = load(PAY_KEY, {});
  const p = payStore[id] || { paid:0, items:[] };
  p.paid += amt; p.items.push({ amt, ref, time:Date.now() });
  payStore[id] = p;
  save(PAY_KEY, payStore);

  addActivity(`Payment marked for ${id}: Rp ${amt.toLocaleString()} (${ref||'-'})`);
  toast('Payment saved');

  // optional: auto-close
  openPayment(id);
});

// ---------- CONNECT TO EVENT ----------
let CONNECT_TARGET_IDS = [];
function openConnect(idOrIds){
  CONNECT_TARGET_IDS = Array.isArray(idOrIds)? idOrIds : [idOrIds];
  openModal('#connectModal');

  const list = $('#eventList');
  list.innerHTML = '';
  const events = load(EVENTS_KEY, []);
  if(events.length===0){
    list.innerHTML = `<div class="muted">Belum ada event. Buat event dulu.</div>`;
    return;
  }
  events.forEach(ev=>{
    const row = document.createElement('div');
    row.className = 'ev-item';
    row.innerHTML = `
      <label style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" class="ev-check" value="${ev.id}"/>
        <div>
          <div style="font-weight:800">${escapeHtml(ev.name)}</div>
          <div class="small muted">${ev.date||'-'} • ${ev.location||'-'}</div>
        </div>
      </label>
    `;
    list.appendChild(row);
  });
}
$('#connectBtnConfirm')?.addEventListener('click', ()=>{
  const checked = $$('.ev-check:checked').map(x=>x.value);
  if(checked.length===0){ toast('Pilih minimal 1 event'); return; }

  // Before connecting: validate contract + initial payment fulfilled
  const contracts = load(CONTRACT_KEY, {});
  const payStore = load(PAY_KEY, {});
  const notReady = [];

  CONNECT_TARGET_IDS.forEach(id=>{
    const c = contracts[id];
    if(!c || !(c.clientSigned || false) || !(c.vendorSigned || false)){
      notReady.push({ id, reason:'Contract not fully signed' }); return;
    }
    let need = (c.plan==='full') ? c.total : Math.round(c.total * (c.dp/100));
    let paid = (payStore[id]?.paid) || 0;
    if(paid < need){
      notReady.push({ id, reason:'Initial payment not met' });
    }
  });

  if(notReady.length>0){
    toast('Ada vendor belum siap connect');
    addActivity(`Connect blocked: ${notReady.map(n=>`${n.id}(${n.reason})`).join(', ')}`);
    return;
  }

  // All good -> "send invite"
  addActivity(`Connect invite sent to ${CONNECT_TARGET_IDS.length} vendor(s) for events [${checked.join(', ')}]`);
  toast('Invite sent — awaiting vendor accept');

  // simulate vendor accept in 1.2s
  setTimeout(()=>{
    const arr = getVendors().map(v=>{
      if(CONNECT_TARGET_IDS.includes(v.id)) return {...v, status:'accepted'};
      return v;
    });
    setVendors(arr);
    addActivity(`Vendor(s) accepted and joined forum (simulated)`);
    toast('Vendors joined forum');
    closeModal('#connectModal');
  }, 1200);
});

// ---------- Contract signing (client action) ----------
document.addEventListener('keydown', (e)=>{
  // Shortcut: Ctrl+Shift+S => sign client (for demo)
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='s'){
    // sign current vendor (last opened contract) if any
    if(!CONTRACT_VENDOR_ID){ toast('Open Contract modal first'); return; }
    const id = CONTRACT_VENDOR_ID;
    const contracts = load(CONTRACT_KEY, {});
    if(!contracts[id]){ toast('No contract'); return; }
    contracts[id].clientSigned = true;
    contracts[id].status = contracts[id].vendorSigned ? 'signed' : 'awaiting_vendor_sign';
    save(CONTRACT_KEY, contracts);
    addActivity(`Client signed contract (${id})`);
    toast('Client signed');
  }
});

// ---------- Modal helpers ----------
function openModal(sel){
  const m = $(sel); if(!m) return;
  m.setAttribute('aria-hidden','false');
  // bind close buttons inside this modal
  m.querySelectorAll('.btn-close').forEach(b=>{
    b.onclick = ()=> closeModal(sel);
  });
}
function closeModal(sel){
  const m = $(sel); if(!m) return;
  m.setAttribute('aria-hidden','true');
}

// ---------- Page init ----------
window.addEventListener('load', ()=>{
  render();
  renderActivities();
});

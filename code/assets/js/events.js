/* ===========================================================================
   assets/js/events.js
   HeaVenTly — Full events page script (All-in-one, feature-complete)
   Version: 1.0.0
   Author: ChatGPT (generated)
   Notes:
     - Single-file, modular structure for readability.
     - Depends only on browser standard APIs (no external libs).
     - Works with events.html (IDs/classes expected per HTML provided).
     - Persist data in localStorage at key 'heavently_events_v1'.
   =========================================================================== */

(function () {
  'use strict';

  /* =========================
     Utility / small helpers
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));
  const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

  function noop() {}
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function isDateISO(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

  function fmtDateISO(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toISOString().slice(0, 10);
  }
  function fmtDatePretty(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function escapeHtml(s) {
    return (s === null || s === undefined) ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function tryParseJSON(s, fallback = null) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  /* =========================
     Storage & initial data
     ========================= */
  const STORAGE_KEY = 'heavently_events_v1';
  const SETTINGS_KEY = 'heavently_settings_v1';

  const seedEvents = [
    {
      id: uid('ev'),
      name: 'Ardi & Rani Wedding',
      date: '2025-09-14',
      location: 'Jakarta',
      category: 'wedding',
      status: 'ongoing',
      notes: 'Outdoor garden, pastel theme. Contact vendor: +62 812-xxxx',
      toolbox: {
        rundown: ['07:00 - Setup', '10:00 - Akad', '12:00 - Resepsi'],
        checklist: [{text: 'Book MUA', checked: true}, {text: 'Confirm venue', checked: false}],
        notes: 'VIP 20 pax',
        attachments: [],
        vendorLink: 'https://wa.me/62812xxxx'
      }
    },
    {
      id: uid('ev'),
      name: 'Q4 Townhall',
      date: '2025-09-22',
      location: 'Bandung',
      category: 'corporate',
      status: 'completed',
      notes: 'All-hands 250 pax. Stage & AV confirmed.',
      toolbox: {
        rundown: ['08:00 - Registration', '09:00 - Opening', '11:30 - Lunch'],
        checklist: [{text: 'Stage LED', checked: true}, {text: 'Mic wireless', checked: true}],
        notes: '',
        attachments: [],
        vendorLink: 'https://vendor.example/townhall'
      }
    },
    {
      id: uid('ev'),
      name: 'Birthday Intimate',
      date: '2025-09-05',
      location: 'Depok',
      category: 'party',
      status: 'ongoing',
      notes: '30 pax, photo corner',
      toolbox: { rundown: ['16:00 - Decor', '18:00 - Guests arrive', '20:00 - Cake'], checklist: [], notes: '', attachments: [], vendorLink: '' }
    }
  ];

  function saveStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.warn('Storage save failed', e); }
  }
  function loadStorage(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage load failed', e);
      return fallback;
    }
  }

  /* =========================
     App state & refs
     ========================= */
  const STATE = {
    events: [],
    currentDate: new Date(),
    viewMode: 'month', // or 'list'
    selectedEventId: null,
    settings: {
      theme: 'dark',
      largeText: false,
      highContrast: false
    }
  };

  const REFS = {};
  function cacheRefs() {
    REFS.app = document.querySelector('.app');
    REFS.sideNav = $('#sideNav');
    REFS.sideNavOverlay = $('#sideNavOverlay');
    REFS.menuToggle = $('#menuToggle');
    REFS.q = $('#q');
    REFS.btnSearch = $('#btnSearch');
    REFS.btnNew = $('#btnNew');
    REFS.btnExport = $('#btnExport');
    REFS.calGrid = $('#calGrid');
    REFS.monthTitle = $('#monthTitle');
    REFS.listView = $('#listView');
    REFS.prevMonth = $('#prevMonth');
    REFS.nextMonth = $('#nextMonth');
    REFS.viewMode = $('#viewMode');
    REFS.eventList = $('#eventList');
    REFS.eventsCount = $('#eventsCount');
    REFS.filterStatus = $('#filterStatus');
    REFS.filterCategory = $('#filterCategory');
    REFS.clearFilters = $('#clearFilters');
    REFS.miniChatList = $('#miniChatList');
    REFS.miniChatInput = $('#miniChatInput');
    REFS.miniSend = $('#miniSend');
    REFS.tabs = $$('.tab');
    REFS.toolboxContents = $$('.toolbox-content');
    REFS.rundownList = $('#rundownList');
    REFS.globalRundownInput = $('#globalRundownInput');
    REFS.globalRundownAdd = $('#globalRundownAdd');
    REFS.checklistList = $('#checklistList');
    REFS.globalCheckInput = $('#globalCheckInput');
    REFS.globalCheckAdd = $('#globalCheckAdd');
    REFS.notesArea = $('#notesArea');
    REFS.btnDownload = $('#btnDownload');
    REFS.btnImport = $('#btnImport');
    REFS.fileInput = $('#fileInput');
    REFS.eventModal = $('#eventModal');
    REFS.eTitle = $('#eTitle');
    REFS.eMeta = $('#eMeta');
    REFS.eDesc = $('#eDesc');
    REFS.eStatus = $('#eStatus');
    REFS.modalRundown = $('#modalRundown');
    REFS.newRundownText = $('#newRundownText');
    REFS.addRundownBtn = $('#addRundownBtn');
    REFS.attachInput = $('#attachInput');
    REFS.attachList = $('#attachList');
    REFS.vendorLink = $('#vendorLink');
    REFS.saveToolbox = $('#saveToolbox');
    REFS.toggleStatus = $('#toggleStatus');
    REFS.btnContact = $('#btnContact');
    REFS.btnDelete = $('#btnDelete');
    REFS.closeModal = $('#closeModal');
    REFS.chatSheet = $('#chatSheet');
    REFS.chatSheetList = $('#chatSheetList');
    REFS.chatSheetInput = $('#chatSheetInput');
    REFS.chatSheetSend = $('#chatSheetSend');
    REFS.closeChatSheet = $('#closeChatSheet');
    REFS.logoutModal = $('#logoutModal');
    REFS.logoutConfirm = $('[data-action="confirm-logout"]', REFS.logoutModal);
    REFS.logoutCancel = $('[data-action="cancel-logout"]', REFS.logoutModal);
    REFS.toast = $('#toast');
    REFS.budgetPie = $('#budgetPie');
    REFS.est_catering = $('#est_catering');
    REFS.est_decor = $('#est_decor');
    REFS.eventCardTemplate = $('#eventCardTemplate');
    REFS.starField = $('#starField');
  }

  /* =========================
     Initialize state from storage
     ========================= */
  function initState() {
    const stored = loadStorage(STORAGE_KEY, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      STATE.events = seedEvents.slice();
      saveStorage(STORAGE_KEY, STATE.events);
    } else {
      STATE.events = stored;
    }
    const s = loadStorage(SETTINGS_KEY, null);
    if (s) STATE.settings = Object.assign(STATE.settings, s);
  }

  /* =========================
     Theme and accessibility helpers
     ========================= */
  function applyThemeSettings() {
    if (STATE.settings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    document.documentElement.classList.toggle('large-text', !!STATE.settings.largeText);
    document.documentElement.classList.toggle('high-contrast', !!STATE.settings.highContrast);
  }

  function toggleTheme() {
    STATE.settings.theme = STATE.settings.theme === 'dark' ? 'light' : 'dark';
    saveStorage(SETTINGS_KEY, STATE.settings);
    applyThemeSettings();
    showToast(`Theme: ${STATE.settings.theme}`);
  }

  /* =========================
     Toast helper
     ========================= */
  let TOAST_TIMER = null;
  function showToast(msg, timeout = 2200) {
    if (!REFS.toast) return;
    REFS.toast.textContent = msg;
    REFS.toast.style.display = 'block';
    REFS.toast.style.opacity = '1';
    if (TOAST_TIMER) clearTimeout(TOAST_TIMER);
    TOAST_TIMER = setTimeout(() => {
      REFS.toast.style.opacity = '0';
      setTimeout(() => { REFS.toast.style.display = 'none'; }, 220);
    }, timeout);
  }

  /* =========================
     Stars decorative background
     ========================= */
  function createStars(count = 80) {
    const container = REFS.starField;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2 + 1;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}vw`;
      s.style.top = `${Math.random() * 100}vh`;
      s.style.opacity = `${Math.random() * 0.6 + 0.2}`;
      s.style.animationDuration = `${Math.random() * 3 + 2}s`;
      container.appendChild(s);
    }
  }

  /* =========================
     Events CRUD & helpers
     ========================= */
  function persistEvents() {
    saveStorage(STORAGE_KEY, STATE.events);
    // notify other tabs
    window.dispatchEvent(new Event('storage'));
  }

  function addEvent(eventObj) {
    const e = Object.assign({
      id: uid('ev'),
      name: 'Untitled event',
      date: fmtDateISO(new Date()),
      location: '',
      category: 'other',
      status: 'ongoing',
      notes: '',
      toolbox: { rundown: [], checklist: [], notes: '', attachments: [], vendorLink: '' }
    }, eventObj || {});
    STATE.events.push(e);
    persistEvents();
    renderEvents();
    renderCalendar();
    renderSummary();
    showToast('Event added');
    return e;
  }

  function updateEvent(id, patch) {
    const idx = STATE.events.findIndex(x => x.id === id);
    if (idx === -1) return null;
    STATE.events[idx] = Object.assign({}, STATE.events[idx], patch);
    persistEvents();
    renderEvents();
    renderCalendar();
    renderSummary();
    showToast('Event updated');
    return STATE.events[idx];
  }

  function removeEvent(id) {
    const idx = STATE.events.findIndex(x => x.id === id);
    if (idx === -1) return false;
    STATE.events.splice(idx, 1);
    persistEvents();
    renderEvents();
    renderCalendar();
    renderSummary();
    showToast('Event removed');
    return true;
  }

  function findEvent(id) {
    return STATE.events.find(x => x.id === id) || null;
  }

  /* =========================
     Summary & counts
     ========================= */
  function renderSummary() {
    if (!REFS.eventsCount) return;
    const total = STATE.events.length;
    const ongoing = STATE.events.filter(e => e.status === 'ongoing').length;
    REFS.eventsCount.textContent = `${total} events • ${ongoing} ongoing`;
  }

  /* =========================
     Render Events List
     ========================= */
  function createEventCard(ev) {
    // prefer template if available
    if (REFS.eventCardTemplate && REFS.eventCardTemplate.content) {
      const frag = REFS.eventCardTemplate.content.cloneNode(true);
      const art = frag.querySelector('article');
      art.dataset.id = ev.id;
      art.querySelector('.event-name').textContent = ev.name || 'Untitled';
      art.querySelector('.date').textContent = fmtDatePretty(ev.date);
      art.querySelector('.category').textContent = ev.category || '';
      art.querySelector('.location').textContent = ev.location || '';
      const notesEl = art.querySelector('.notes');
      if (notesEl) notesEl.innerHTML = escapeHtml(ev.notes || '');
      const statusEl = art.querySelector('.status');
      if (statusEl) statusEl.textContent = ev.status || 'ongoing';
      const openBtn = art.querySelector('[data-action="open"]');
      const editBtn = art.querySelector('[data-action="edit"]');
      const deleteBtn = art.querySelector('[data-action="delete"]');
      openBtn && openBtn.addEventListener('click', (evnt) => { evnt.preventDefault(); openEventModalById(ev.id); });
      editBtn && editBtn.addEventListener('click', (evnt) => { evnt.stopPropagation(); openEditModal(ev.id); });
      deleteBtn && deleteBtn.addEventListener('click', (evnt) => { evnt.stopPropagation(); if (confirm('Delete this event?')) removeEvent(ev.id); });
      art.addEventListener('click', () => openEventModalById(ev.id));
      if (window.lucide?.createIcons) lucide.createIcons(art);
      return art;
    }

    // fallback
    const div = document.createElement('div');
    div.className = 'event-item';
    div.innerHTML = `
      <div class="event-item-head" style="display:flex;gap:12px;align-items:center">
        <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#08d9ff,#8a2be2);display:flex;align-items:center;justify-content:center;font-weight:800;color:#04121a">
          ${(ev.name||'E').split(' ').map(w=>w[0]).slice(0,2).join('')}
        </div>
        <div style="flex:1">
          <div style="font-weight:800">${escapeHtml(ev.name)}</div>
          <div class="small muted">${fmtDatePretty(ev.date)} • ${escapeHtml(ev.location)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div class="event-status status-${ev.status}">${ev.status}</div>
          <button class="btn small">Open</button>
        </div>
      </div>
    `;
    div.querySelector('button')?.addEventListener('click', (e) => { e.stopPropagation(); openEventModalById(ev.id); });
    return div;
  }

  function renderEvents(filterText = '') {
    if (!REFS.eventList) return;
    REFS.eventList.innerHTML = '';
    let items = STATE.events.slice();

    // Apply quick text search
    const q = (filterText || REFS.q?.value || '').trim().toLowerCase();
    if (q) {
      items = items.filter(ev => (ev.name || '').toLowerCase().includes(q) || (ev.location || '').toLowerCase().includes(q) || (ev.category || '').toLowerCase().includes(q));
    }

    // Filters
    const st = REFS.filterStatus?.value || '';
    const cat = REFS.filterCategory?.value || '';
    if (st) items = items.filter(ev => ev.status === st);
    if (cat) items = items.filter(ev => ev.category === cat);

    // Sort by date asc
    items.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'small muted';
      empty.textContent = 'Belum ada event';
      REFS.eventList.appendChild(empty);
      return;
    }

    items.forEach(ev => {
      const el = createEventCard(ev);
      REFS.eventList.appendChild(el);
    });

    // re-run icons
    if (window.lucide?.createIcons) lucide.createIcons();
  }

  /* =========================
     Calendar generation & interactions
     ========================= */
  function renderCalendar() {
    if (!REFS.calGrid || !REFS.monthTitle) return;
    const base = new Date(STATE.currentDate.getFullYear(), STATE.currentDate.getMonth(), 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    REFS.monthTitle.textContent = base.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    REFS.calGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // leading empty cells (for consistent grid)
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-empty';
      REFS.calGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      dayEl.dataset.date = iso;
      dayEl.innerHTML = `<div class="date-num">${d}</div>`;

      const dayEvents = STATE.events.filter(ev => ev.date === iso);
      if (dayEvents.length > 0) {
        dayEl.classList.add('has-events');
        const dot = document.createElement('div');
        dot.className = 'event-dot';
        dot.title = `${dayEvents.length} event(s)`;
        dayEl.appendChild(dot);
      }

      // highlight today
      if (iso === (new Date()).toISOString().slice(0,10)) dayEl.classList.add('today');

      dayEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dayEvents.length) showEventsForDate(iso);
        else {
          // quick create prompt for empty date (simple UX)
          if (confirm(`Buat event baru pada ${iso}?`)) {
            const name = prompt('Nama event');
            if (name) addEvent({ name: name.trim(), date: iso });
          }
        }
      });

      dayEl.addEventListener('mouseenter', () => dayEl.classList.add('highlight'));
      dayEl.addEventListener('mouseleave', () => dayEl.classList.remove('highlight'));

      REFS.calGrid.appendChild(dayEl);
    }

    renderListView();
  }

  function showEventsForDate(isoDate) {
    if (!REFS.eventList) return;
    REFS.eventList.innerHTML = '';
    const list = STATE.events.filter(ev => ev.date === isoDate);
    if (!list.length) {
      REFS.eventList.innerHTML = '<div class="small muted">No events</div>';
      return;
    }
    list.forEach(ev => REFS.eventList.appendChild(createEventCard(ev)));
  }

  function renderListView() {
    if (!REFS.listView) return;
    if (STATE.viewMode === 'list') {
      REFS.listView.style.display = 'block';
      const sorted = STATE.events.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
      let html = '<div style="font-weight:800;margin-bottom:8px">Upcoming events</div>';
      if (!sorted.length) html += '<div class="small muted">No events</div>';
      else sorted.forEach(ev => {
        html += `<div style="padding:8px;border-radius:10px;margin-bottom:8px;background:rgba(255,255,255,0.03);">
                   <div style="font-weight:700">${escapeHtml(ev.name)} <span class="small muted">• ${fmtDatePretty(ev.date)}</span></div>
                   <div class="small muted">${escapeHtml(ev.location)}</div>
                 </div>`;
      });
      REFS.listView.innerHTML = html;
    } else {
      REFS.listView.style.display = 'none';
    }
  }

  /* =========================
     Event modal (detailed) — open/close + populate
     ========================= */
  let modalOpenId = null;

  function openEventModalById(id) {
    const ev = findEvent(id);
    if (!ev || !REFS.eventModal) return;
    modalOpenId = id;
    REFS.eTitle.textContent = ev.name || 'Untitled';
    REFS.eMeta.textContent = `${fmtDatePretty(ev.date)} • ${ev.location || ''}`;
    REFS.eDesc.innerHTML = `<div style="color:var(--text-muted)">${escapeHtml(ev.notes || 'No description')}</div>`;
    REFS.eStatus.textContent = ev.status || 'ongoing';
    REFS.eStatus.className = 'event-status ' + (ev.status ? `status-${ev.status}` : 'status-ongoing');

    // populate modal rundown
    REFS.modalRundown.innerHTML = '';
    (ev.toolbox?.rundown || []).forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.draggable = true;
      li.textContent = item;
      REFS.modalRundown.appendChild(li);
    });
    enableDrag('#modalRundown');

    // attachments
    REFS.attachList.innerHTML = '';
    (ev.toolbox?.attachments || []).forEach(att => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.textContent = att.name;
      REFS.attachList.appendChild(pill);
    });

    REFS.vendorLink.value = ev.toolbox?.vendorLink || '';

    REFS.eventModal.style.display = 'flex';
    REFS.eventModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lucide?.createIcons) lucide.createIcons(REFS.eventModal);
  }

  function closeModal() {
    if (!REFS.eventModal) return;
    REFS.eventModal.style.display = 'none';
    REFS.eventModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalOpenId = null;
  }

  /* =========================
     Rundown management (modal & per-event mini)
     ========================= */
  function addRundownItemToModal() {
    if (!modalOpenId) return;
    const txt = (REFS.newRundownText?.value || '').trim();
    if (!txt) return;
    const ev = findEvent(modalOpenId);
    if (!ev) return;
    ev.toolbox = ev.toolbox || {};
    ev.toolbox.rundown = ev.toolbox.rundown || [];
    ev.toolbox.rundown.push(txt);
    persistEvents();
    openEventModalById(modalOpenId);
    REFS.newRundownText.value = '';
  }

  function saveRundownFromModal() {
    if (!modalOpenId) return;
    const items = Array.from(REFS.modalRundown.querySelectorAll('.list-item')).map(n => n.textContent);
    const ev = findEvent(modalOpenId);
    if (!ev) return;
    ev.toolbox = ev.toolbox || {};
    ev.toolbox.rundown = items;
    persistEvents();
    showToast('Rundown saved');
    renderEvents();
  }

  /* =========================
     Attachments inside modal
     ========================= */
  function handleModalAttachFiles(files) {
    if (!modalOpenId || !files || !files.length) return;
    const ev = findEvent(modalOpenId);
    if (!ev) return;
    ev.toolbox = ev.toolbox || {};
    ev.toolbox.attachments = ev.toolbox.attachments || [];
    Array.from(files).forEach(file => {
      const fr = new FileReader();
      fr.onload = (e) => {
        const data = e.target.result;
        // store dataUrl only if small (preview friendly), otherwise store blank or metadata
        const store = (data && data.length < 300 * 1024) ? data : '';
        ev.toolbox.attachments.push({ name: file.name, dataUrl: store });
        persistEvents();
        openEventModalById(modalOpenId);
      };
      fr.readAsDataURL(file);
    });
  }

  /* =========================
     Drag & Drop logic for lists
     ========================= */
  function enableDrag(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    // make items draggable
    container.querySelectorAll('.list-item, .rundown-item').forEach(i => i.setAttribute('draggable', 'true'));
    let dragging = null;

    container.addEventListener('dragstart', (e) => {
      const li = e.target.closest('.list-item, .rundown-item');
      if (!li) return;
      dragging = li;
      li.style.opacity = '0.5';
      try { e.dataTransfer.setData('text/plain', 'drag'); } catch (err) {}
      e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragend', () => {
      if (dragging) dragging.style.opacity = '';
      dragging = null;
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragging) return;
      const tgt = e.target.closest('.list-item, .rundown-item');
      if (!tgt || tgt === dragging) return;
      const rect = tgt.getBoundingClientRect();
      const after = (e.clientY - rect.top) > rect.height / 2;
      if (after) tgt.parentNode.insertBefore(dragging, tgt.nextSibling);
      else tgt.parentNode.insertBefore(dragging, tgt);
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      // if this is modalRundown, persist ordering
      if (container.id === 'modalRundown' && modalOpenId) {
        const items = Array.from(container.querySelectorAll('.list-item')).map(n => n.textContent);
        const ev = findEvent(modalOpenId);
        if (ev) {
          ev.toolbox = ev.toolbox || {};
          ev.toolbox.rundown = items;
          persistEvents();
        }
      }
    });
  }

  /* =========================
     Budget svg pie (simple)
     ========================= */
  function drawBudgetPie() {
    const svg = REFS.budgetPie;
    if (!svg) return;
    const catering = Number(REFS.est_catering?.value || 0);
    const decor = Number(REFS.est_decor?.value || 0);
    const data = [
      { name: 'Catering', v: catering || 0, color: '#08d9ff' },
      { name: 'Decor', v: decor || 0, color: '#8a2be2' }
    ];
    const total = data.reduce((s, x) => s + x.v, 0) || 1;
    svg.innerHTML = '';
    let angle = -Math.PI / 2;
    data.forEach(d => {
      const a = (d.v / total) * Math.PI * 2;
      const end = angle + a;
      const large = a > Math.PI ? 1 : 0;
      const x1 = 100 + 90 * Math.cos(angle), y1 = 100 + 90 * Math.sin(angle);
      const x2 = 100 + 90 * Math.cos(end), y2 = 100 + 90 * Math.sin(end);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M 100 100 L ${x1} ${y1} A 90 90 0 ${large} 1 ${x2} ${y2} Z`);
      path.setAttribute('fill', d.color);
      svg.appendChild(path);
      angle = end;
    });
  }

  /* =========================
     Import / Export
     ========================= */
  function exportEventsToFile() {
    const blob = new Blob([JSON.stringify(STATE.events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heavently-events-${(new Date()).toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported events');
  }

  function importEventsFromFile(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = (e) => {
      try {
        const arr = JSON.parse(e.target.result);
        if (!Array.isArray(arr)) throw new Error('Invalid JSON: expected array');
        // merge intelligently (avoid duplicate ids)
        const existing = STATE.events.slice();
        arr.forEach(item => {
          if (!item.id) item.id = uid('ev');
          if (!existing.find(x => x.id === item.id)) existing.push(item);
        });
        STATE.events = existing;
        persistEvents();
        renderEvents();
        renderCalendar();
        renderSummary();
        showToast('Import selesai');
      } catch (err) {
        console.warn('Import error', err);
        showToast('Import gagal: invalid file');
      }
    };
    fr.readAsText(file);
  }

  /* =========================
     Mini Chat (local)
     ========================= */
  function addMiniChatMessage(msg) {
    if (!REFS.miniChatList) return;
    const el = document.createElement('div');
    el.className = 'chat-item';
    el.innerHTML = `<div class="avatar"></div><div style="flex:1"><div style="font-weight:700">${escapeHtml(msg.from)}</div><div class="small muted">${escapeHtml(msg.text)}</div></div>`;
    REFS.miniChatList.appendChild(el);
    REFS.miniChatList.scrollTop = REFS.miniChatList.scrollHeight;
    // add to chat sheet as well if present
    if (REFS.chatSheetList) {
      const e = document.createElement('div');
      e.style.marginBottom = '6px';
      e.innerHTML = `<b>${escapeHtml(msg.from)}:</b> ${escapeHtml(msg.text)}`;
      REFS.chatSheetList.appendChild(e);
      REFS.chatSheetList.scrollTop = REFS.chatSheetList.scrollHeight;
    }
  }

  /* =========================
     Notifications badge
     ========================= */
  function updateNotifBadge() {
    const el = $('#unreadCount');
    if (el) el.textContent = String(STATE.events.length || 0);
  }

  /* =========================
     Simple Edit Modal (create/edit event form)
     ========================= */
  // We'll create an inline modal element if not present — this is a full form modal used for create/edit
  let FORM_MODAL = null;
  function ensureFormModal() {
    if (FORM_MODAL) return FORM_MODAL;
    FORM_MODAL = document.createElement('div');
    FORM_MODAL.className = 'modal form-modal';
    FORM_MODAL.style.display = 'none';
    FORM_MODAL.innerHTML = `
      <div class="modal-content">
        <h3 id="formTitle">Create Event</h3>
        <form id="eventForm" class="event-form" novalidate>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label><span>Nama</span><input name="name" class="input" required></label>
            <label><span>Tanggal</span><input name="date" type="date" class="input" required></label>
            <label><span>Lokasi</span><input name="location" class="input"></label>
            <label><span>Kategori</span>
              <select name="category" class="select">
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <label style="display:block;margin-top:8px"><span>Notes</span><textarea name="notes" class="input" rows="3"></textarea></label>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
            <button type="button" class="btn" data-action="cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" data-action="save">Save</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(FORM_MODAL);

    const form = FORM_MODAL.querySelector('#eventForm');
    const title = FORM_MODAL.querySelector('#formTitle');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get('name')||'').trim(),
        date: String(data.get('date')||'').trim(),
        location: String(data.get('location')||'').trim(),
        category: String(data.get('category')||'other'),
        notes: String(data.get('notes')||'').trim()
      };
      if (!payload.name || !isDateISO(payload.date)) {
        alert('Nama & tanggal wajib (format YYYY-MM-DD).');
        return;
      }
      const mode = FORM_MODAL.dataset.mode;
      if (mode === 'edit' && FORM_MODAL.dataset.id) {
        updateEvent(FORM_MODAL.dataset.id, payload);
      } else {
        addEvent(payload);
      }
      hideFormModal();
    });
    FORM_MODAL.querySelector('[data-action="cancel"]').addEventListener('click', hideFormModal);
    return FORM_MODAL;
  }

  function showFormModal(mode = 'create', eventId = null) {
    const modal = ensureFormModal();
    const form = modal.querySelector('#eventForm');
    const title = modal.querySelector('#formTitle');
    modal.style.display = 'flex';
    modal.dataset.mode = mode;
    if (mode === 'edit' && eventId) {
      const ev = findEvent(eventId);
      if (!ev) return;
      title.textContent = 'Edit Event';
      form.name.value = ev.name;
      form.date.value = ev.date;
      form.location.value = ev.location;
      form.category.value = ev.category;
      form.notes.value = ev.notes || '';
      modal.dataset.id = eventId;
    } else {
      title.textContent = 'Create Event';
      form.reset();
      // prefill date to selected day if any
      if (STATE.selectedDateForNew) form.date.value = STATE.selectedDateForNew;
      modal.dataset.id = '';
    }
    document.body.style.overflow = 'hidden';
  }
  function hideFormModal() {
    if (!FORM_MODAL) return;
    FORM_MODAL.style.display = 'none';
    FORM_MODAL.dataset.mode = '';
    FORM_MODAL.dataset.id = '';
    document.body.style.overflow = '';
    // reset selected date
    STATE.selectedDateForNew = null;
  }

  /* =========================
     Edit quick modal wrapper
     ========================= */
  function openEditModal(id) { showFormModal('edit', id); }

  /* =========================
     Keyboard shortcuts
     ========================= */
  function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        showFormModal('create');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        REFS.q && REFS.q.focus();
      }
      if (e.key === 'Escape') {
        closeModal();
        if (FORM_MODAL && FORM_MODAL.style.display === 'flex') hideFormModal();
        if (REFS.chatSheet && REFS.chatSheet.style.display === 'block') REFS.chatSheet.style.display = 'none';
      }
    });
  }

  /* =========================
     Sidebar toggle (mobile)
     ========================= */
  function setupSidebarToggle() {
    REFS.menuToggle?.addEventListener('click', () => {
      REFS.sideNav?.classList.toggle('open');
      if (REFS.sideNavOverlay) {
        const show = REFS.sideNav && REFS.sideNav.classList.contains('open');
        REFS.sideNavOverlay.hidden = !show;
        REFS.sideNavOverlay.classList.toggle('active', show);
      }
    });
    REFS.sideNavOverlay?.addEventListener('click', () => {
      REFS.sideNav?.classList.remove('open');
      REFS.sideNavOverlay.hidden = true;
    });
  }

  /* =========================
     Event bindings: attach handlers to DOM controls
     ========================= */
  function attachHandlers() {
    // search
    REFS.btnSearch?.addEventListener('click', () => renderEvents(REFS.q?.value || ''));
    REFS.q?.addEventListener('keyup', (e) => { if (e.key === 'Enter') renderEvents(REFS.q.value); });

    // new & export
    REFS.btnNew?.addEventListener('click', () => showFormModal('create'));
    REFS.btnExport?.addEventListener('click', exportEventsToFile);

    // month nav
    REFS.prevMonth?.addEventListener('click', () => { STATE.currentDate.setMonth(STATE.currentDate.getMonth() - 1); renderCalendar(); });
    REFS.nextMonth?.addEventListener('click', () => { STATE.currentDate.setMonth(STATE.currentDate.getMonth() + 1); renderCalendar(); });
    REFS.viewMode?.addEventListener('change', (e) => { STATE.viewMode = e.target.value; renderListView(); });

    // filters
    REFS.filterStatus?.addEventListener('change', () => renderEvents());
    REFS.filterCategory?.addEventListener('change', () => renderEvents());
    REFS.clearFilters?.addEventListener('click', () => { REFS.filterCategory.value = ''; REFS.filterStatus.value = ''; renderEvents(); });

    // mini chat
    REFS.miniSend?.addEventListener('click', () => {
      const v = (REFS.miniChatInput && REFS.miniChatInput.value || '').trim();
      if (!v) return;
      addMiniChatMessage({ from: 'You', text: v });
      REFS.miniChatInput.value = '';
      // canned reply
      setTimeout(() => addMiniChatMessage({ from: 'Vendor', text: 'Terima kasih, kami follow up.' }), 700);
    });

    // global toolbox
    REFS.globalRundownAdd?.addEventListener('click', () => {
      const v = (REFS.globalRundownInput && REFS.globalRundownInput.value || '').trim();
      if (!v) return;
      const li = document.createElement('li'); li.className = 'list-item'; li.draggable = true; li.textContent = v;
      REFS.rundownList && REFS.rundownList.appendChild(li);
      REFS.globalRundownInput.value = '';
      enableDrag('#rundownList');
    });
    REFS.globalCheckAdd?.addEventListener('click', () => {
      const v = (REFS.globalCheckInput && REFS.globalCheckInput.value || '').trim();
      if (!v) return;
      const li = document.createElement('li'); li.className = 'list-item'; li.draggable = true;
      li.innerHTML = `<label><input type="checkbox"> ${escapeHtml(v)}</label>`;
      REFS.checklistList && REFS.checklistList.appendChild(li);
      REFS.globalCheckInput.value = '';
      enableDrag('#checklistList');
    });

    // notes
    if (REFS.notesArea) {
      const saved = loadStorage('heavently_notes', '');
      if (saved) REFS.notesArea.textContent = saved;
      REFS.notesArea.addEventListener('input', () => saveStorage('heavently_notes', REFS.notesArea.textContent || ''));
    }

    // import/export
    REFS.btnDownload?.addEventListener('click', exportEventsToFile);
    REFS.btnImport?.addEventListener('click', () => REFS.fileInput && REFS.fileInput.click());
    REFS.fileInput?.addEventListener('change', (e) => {
      if (!e.target.files?.length) return;
      importEventsFromFile(e.target.files[0]);
      e.target.value = '';
    });

    // modal actions
    REFS.closeModal?.addEventListener('click', closeModal);
    REFS.eventModal?.addEventListener('click', (e) => { if (e.target === REFS.eventModal) closeModal(); });
    REFS.addRundownBtn?.addEventListener('click', addRundownItemToModal);
    REFS.attachInput?.addEventListener('change', (e) => { if (!e.target.files?.length) return; handleModalAttachFiles(e.target.files); e.target.value = ''; });
    REFS.saveToolbox?.addEventListener('click', () => {
      if (!modalOpenId) return;
      const ev = findEvent(modalOpenId);
      if (!ev) return;
      ev.toolbox = ev.toolbox || {};
      ev.toolbox.vendorLink = REFS.vendorLink.value.trim();
      persistEvents();
      showToast('Toolbox saved');
      renderEvents();
    });
    REFS.toggleStatus?.addEventListener('click', () => {
      if (!modalOpenId) return;
      const ev = findEvent(modalOpenId);
      if (!ev) return;
      ev.status = ev.status === 'ongoing' ? 'completed' : (ev.status === 'completed' ? 'cancel' : 'ongoing');
      persistEvents();
      openEventModalById(modalOpenId);
      renderEvents();
    });
    REFS.btnContact?.addEventListener('click', () => {
      if (!modalOpenId) return;
      const ev = findEvent(modalOpenId);
      if (!ev) return;
      addMiniChatMessage({ from: 'You', text: `Hi re: ${ev.name}` });
      if (window.innerWidth < 1000 && REFS.chatSheet) REFS.chatSheet.style.display = 'block';
    });
    REFS.btnDelete?.addEventListener('click', () => {
      if (!modalOpenId) return;
      if (!confirm('Delete event?')) return;
      removeEvent(modalOpenId);
      closeModal();
    });

    // chat sheet
    REFS.chatSheetSend?.addEventListener('click', () => {
      const v = (REFS.chatSheetInput && REFS.chatSheetInput.value || '').trim();
      if (!v) return;
      addMiniChatMessage({ from: 'You', text: v });
      REFS.chatSheetInput.value = '';
    });
    REFS.closeChatSheet?.addEventListener('click', () => { if (REFS.chatSheet) REFS.chatSheet.style.display = 'none'; });

    // logout modal actions
    REFS.logoutConfirm?.addEventListener('click', () => {
      showToast('Logged out');
      setTimeout(() => { window.location.href = 'signin.html'; }, 800);
    });
    REFS.logoutCancel?.addEventListener('click', () => { if (REFS.logoutModal) REFS.logoutModal.style.display = 'none'; });
    REFS.logoutModal?.addEventListener('click', (e) => { if (e.target === REFS.logoutModal) REFS.logoutModal.style.display = 'none'; });

    // tabs (toolbox)
    REFS.tabs.forEach(tab => tab.addEventListener('click', () => {
      REFS.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.dataset.tab;
      REFS.toolboxContents.forEach(c => c.classList.remove('active'));
      document.getElementById(id)?.classList.add('active');
    }));

    // budget inputs
    REFS.est_catering?.addEventListener('input', drawBudgetPie);
    REFS.est_decor?.addEventListener('input', drawBudgetPie);

    // keyboard shortcuts
    setupShortcuts();

    // enable drag for global lists
    enableDrag('#rundownList');
    enableDrag('#checklistList');

    // initial draw
    drawBudgetPie();
    updateNotifBadge();
  }

  /* =========================
     Helpers: quick find
     ========================= */
  function findEvent(id) { return STATE.events.find(x => x.id === id) || null; }

  /* =========================
     Boot & initialization
     ========================= */
  function boot() {
    cacheRefs();
    initState();
    applyThemeSettings();
    attachHandlers();
    setupSidebarToggle();
    renderCalendar();
    renderEvents();
    renderSummary();
    createStars(80);
    // lucide icons (if present)
    if (window.lucide?.createIcons) lucide.createIcons();
    // small startup class for CSS transitions
    setTimeout(() => document.documentElement.classList.add('app-ready'), 400);
    console.info('HeaVenTly events.js booted — events:', STATE.events.length);
  }

  // Auto boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* =========================
     Expose debug helpers
     ========================= */
  window._heavently = {
    STATE,
    addEvent,
    updateEvent,
    removeEvent,
    renderEvents,
    renderCalendar,
    exportEventsToFile,
    importEventsFromFile
  };

  /* =========================
     End of file
     ========================= */

})();

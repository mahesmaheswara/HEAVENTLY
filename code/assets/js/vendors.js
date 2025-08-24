/* =========================================================================
   assets/js/vendors.js
   HeaVenTly — Vendors page interaction
   - Full feature: search, autosuggest, filters, pagination, infinite scroll
   - Quick view, vendor detail modal, compare, wishlist (localStorage)
   - Sidebar toggle, toasts, skeletons, map toggle placeholder
   ========================================================================= */

(() => {
  'use strict';

  /* -------------------------
     Helpers
  ------------------------- */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const tpl = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // small debounce
  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // create element from HTML string
  function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  // download helper
  function download(filename, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // toast
  function showToast(message, opts = {}) {
    const toastEl = $('#toast');
    if (!toastEl) return alert(message);
    toastEl.innerHTML = `<div class="message">${message}</div><button class="close" aria-label="Close toast">×</button>`;
    toastEl.hidden = false;
    toastEl.classList.add('show');
    const close = () => {
      toastEl.hidden = true;
      toastEl.classList.remove('show');
    };
    const btn = toastEl.querySelector('.close');
    btn && btn.addEventListener('click', close);
    if (opts.duration !== 0) {
      setTimeout(close, opts.duration || 3500);
    }
  }

  // focus trap for modal
  function trapFocus(el) {
    const focusable = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const first = el.querySelectorAll(focusable)[0];
    const focusables = el.querySelectorAll(focusable);
    const last = focusables[focusables.length - 1];
    function handle(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    el.__trapHandler = handle;
    el.addEventListener('keydown', handle);
    if (first) first.focus();
  }
  function releaseTrap(el) {
    if (!el || !el.__trapHandler) return;
    el.removeEventListener('keydown', el.__trapHandler);
    delete el.__trapHandler;
  }

  /* -------------------------
     Storage keys
  ------------------------- */
  const STORAGE_KEYS = {
    WISHLIST: 'hv_vendors_wishlist_v1',
    COMPARE: 'hv_vendors_compare_v1',
    BOOKED: 'hv_vendors_booked_v1'
  };

  /* -------------------------
     Sample dataset (you can replace with API)
     - includes categories, location, ratings, priceMin, priceMax, badges, gallery, packages, reviews, availability
  ------------------------- */
  const SAMPLE_VENDORS = [
    {
      id: 1,
      name: "Vendor A — Elegant Decor",
      category: "decor",
      location: "Jakarta",
      rating: 4.8,
      priceFrom: 4500000,
      badges: ["Top Vendor", "Verified"],
      img: "https://picsum.photos/seed/v1/800/600",
      gallery: [
        "https://picsum.photos/seed/v1a/800/600",
        "https://picsum.photos/seed/v1b/800/600",
        "https://picsum.photos/seed/v1c/800/600"
      ],
      short: "Dekorasi elegan & modern untuk pernikahan dan event premium.",
      packages: [
        { name: "Basic", features: ["Setup", "Flowers"], price: 4500000 },
        { name: "Premium", features: ["Setup", "Flowers", "Lighting"], price: 8500000 }
      ],
      reviews: [
        { name: "Sinta", date: "2025-06-20", rating: 5, text: "Sangat profesional!" },
        { name: "Budi", date: "2025-04-03", rating: 4.5, text: "Hasil sangat bagus." }
      ],
      avail: ["2025-09-10", "2025-09-26", "2025-10-01"]
    },
    {
      id: 2,
      name: "Vendor B — Premium Catering",
      category: "catering",
      location: "Bandung",
      rating: 4.9,
      priceFrom: 6500000,
      badges: ["Verified"],
      img: "https://picsum.photos/seed/v2/800/600",
      gallery: [
        "https://picsum.photos/seed/v2a/800/600",
        "https://picsum.photos/seed/v2b/800/600"
      ],
      short: "Catering lengkap, menu internasional & lokal, sample tasting tersedia.",
      packages: [
        { name: "Silver", features: ["Buffet", "Service"], price: 6500000 },
        { name: "Gold", features: ["Buffet", "Service", "Dessert"], price: 12000000 }
      ],
      reviews: [
        { name: "Rani", date: "2025-05-21", rating: 5, text: "Tamu memuji makanannya!" },
        { name: "Anton", date: "2024-12-10", rating: 4, text: "Pelayanan baik." }
      ],
      avail: ["2025-08-25","2025-09-05","2025-11-12"]
    },
    {
      id: 3,
      name: "Vendor C — Photo & Video",
      category: "photo",
      location: "Yogyakarta",
      rating: 4.3,
      priceFrom: 3500000,
      badges: [],
      img: "https://picsum.photos/seed/v3/800/600",
      gallery: ["https://picsum.photos/seed/v3a/800/600"],
      short: "Fotografer profesional, album + raw file.",
      packages: [
        { name: "Documentary", features: ["8 hours", "Album"], price: 3500000 }
      ],
      reviews: [{ name: "Dita", date:"2025-07-01", rating: 4.5, text:"Cepat & ramah." }],
      avail: ["2025-08-30","2025-09-20"]
    },
    {
      id: 4,
      name: "Vendor D — Sound & Lighting",
      category: "sound",
      location: "Jakarta",
      rating: 4.2,
      priceFrom: 2200000,
      badges: ["Promo"],
      img: "https://picsum.photos/seed/v4/800/600",
      gallery: ["https://picsum.photos/seed/v4a/800/600"],
      short: "Sound system + lighting modern, teknisi tersedia.",
      packages: [
        { name: "Event Basic", features:["Sound", "Technician"], price: 2200000 }
      ],
      reviews: [{ name: "Gilang", date:"2025-02-17", rating: 4, text:"OK untuk event kecil." }],
      avail: ["2025-09-08", "2025-10-03"]
    },
    {
      id: 5,
      name: "Vendor E — Transport & Logistics",
      category: "transport",
      location: "Bali",
      rating: 3.8,
      priceFrom: 1200000,
      badges: [],
      img: "https://picsum.photos/seed/v5/800/600",
      gallery: [],
      short: "Transportasi tamu & logistik, armada lengkap.",
      packages: [{ name: "Shuttle", features:["Bus", "Driver"], price: 1200000 }],
      reviews: [],
      avail: ["2025-09-01"]
    },
    {
      id: 6,
      name: "Vendor F — MC & Entertainment",
      category: "entertainment",
      location: "Surabaya",
      rating: 5.0,
      priceFrom: 1500000,
      badges: ["Top Vendor"],
      img: "https://picsum.photos/seed/v6/800/600",
      gallery: ["https://picsum.photos/seed/v6a/800/600", "https://picsum.photos/seed/v6b/800/600"],
      short: "MC berpengalaman & lineup entertainer.",
      packages: [{ name: "MC + Band", features:["MC", "Band"], price: 3500000 }],
      reviews: [{ name:"Nina", date:"2025-01-12", rating:5, text:"Bawa suasana!" }],
      avail: ["2025-09-02", "2025-12-05"]
    }
  ];

  /* -------------------------
     State
  ------------------------- */
  const state = {
    vendors: [],   // loaded data
    filtered: [],
    page: 1,
    perPage: 24,
    sortBy: 'relevance',
    filters: {
      category: '',
      rating: '',
      priceMin: null,
      priceMax: null,
      location: '',
      date: ''
    },
    suggestions: [],
    wishlist: new Set(),
    compare: new Set(),
    booked: new Set(),
    infinite: false,
    mapVisible: false,
    isLoading: false
  };

  /* -------------------------
     Storage helpers
  ------------------------- */
  function loadStorage() {
    try {
      const w = JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
      const c = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPARE) || '[]');
      const b = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKED) || '[]');
      state.wishlist = new Set(w);
      state.compare = new Set(c);
      state.booked = new Set(b);
    } catch (e) {
      state.wishlist = new Set();
      state.compare = new Set();
      state.booked = new Set();
    }
  }
  function saveStorage() {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(Array.from(state.wishlist)));
    localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(Array.from(state.compare)));
    localStorage.setItem(STORAGE_KEYS.BOOKED, JSON.stringify(Array.from(state.booked)));
  }

  /* -------------------------
     Init (load data)
  ------------------------- */
  function initData() {
    // Simulate API fetch with slight delay (and we show skeleton)
    state.isLoading = true;
    renderSkeletons();
    return new Promise(resolve => {
      setTimeout(() => {
        state.vendors = SAMPLE_VENDORS.slice(); // copy
        state.filtered = state.vendors.slice();
        state.page = 1;
        state.isLoading = false;
        resolve();
      }, 600); // short simulated latency
    });
  }

  /* -------------------------
     Rendering: skeletons -> vendor cards
  ------------------------- */

  function renderSkeletons(count = 6) {
    const grid = $('#vendorGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const skTpl = tpl('skeletonCardTemplate');
    for (let i = 0; i < count; i++) {
      grid.appendChild(skTpl.content.cloneNode(true));
    }
  }

  function formatCurrency(num) {
    if (num == null || isNaN(num)) return '—';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function renderVendors() {
    const grid = $('#vendorGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const start = (state.page - 1) * state.perPage;
    let list = state.filtered.slice();

    // Sorting
    switch (state.sortBy) {
      case 'rating_desc':
        list.sort((a,b) => b.rating - a.rating);
        break;
      case 'price_asc':
        list.sort((a,b) => (a.priceFrom||0) - (b.priceFrom||0));
        break;
      case 'price_desc':
        list.sort((a,b) => (b.priceFrom||0) - (a.priceFrom||0));
        break;
      case 'name':
        list.sort((a,b) => a.name.localeCompare(b.name));
        break;
      case 'new':
        list.sort((a,b) => b.id - a.id);
        break;
      default: /* relevance/default */ break;
    }

    // Pagination / infinite
    let pageItems;
    if (state.infinite) {
      // show first (page * perPage)
      pageItems = list.slice(0, state.page * state.perPage);
    } else {
      pageItems = list.slice(start, start + state.perPage);
    }

    if (pageItems.length === 0) {
      $('#emptyState') && ($('#emptyState').hidden = false);
      $('#pagination') && ($('#pagination').hidden = true);
      return;
    } else {
      $('#emptyState') && ($('#emptyState').hidden = true);
      $('#pagination') && ($('#pagination').hidden = false);
    }

    const tplCard = tpl('vendorCardTemplate');
    for (const v of pageItems) {
      const node = tplCard.content.cloneNode(true);
      const article = node.querySelector('.vendor-card');
      article.dataset.id = v.id;

      // head badges
      const badgesEl = article.querySelector('.badges');
      badgesEl.innerHTML = '';
      (v.badges || []).forEach(b => {
        const bEl = document.createElement('span');
        bEl.className = 'badge';
        bEl.textContent = b;
        badgesEl.appendChild(bEl);
      });

      // wishlist
      const wishBtn = article.querySelector('.wishlist');
      wishBtn.setAttribute('aria-pressed', state.wishlist.has(String(v.id)) ? 'true' : 'false');
      wishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleWishlist(v.id, wishBtn);
      });

      // compare checkbox
      const cmpInput = article.querySelector('input[data-action="compare"]');
      if (state.compare.has(String(v.id))) cmpInput.checked = true;
      cmpInput.addEventListener('change', () => toggleCompare(v.id, article));

      // thumbnail
      const img = article.querySelector('.thumb img');
      img.src = v.img;
      img.alt = v.name;

      // vendor name / rating / meta / desc / price
      article.querySelector('.vendor-name').textContent = v.name;
      article.querySelector('.rating').textContent = `★ ${v.rating.toFixed(1)}`;
      article.querySelector('.category').textContent = (v.category || '').replace(/^\w/, c => c.toUpperCase());
      article.querySelector('.location').textContent = v.location || '—';
      article.querySelector('.desc').textContent = v.short || '';
      article.querySelector('.price .value').textContent = formatCurrency(v.priceFrom);

      // Footer buttons
      const quickBtn = article.querySelector('button[data-action="quick-view"]');
      quickBtn.addEventListener('click', (ev) => { ev.preventDefault(); openQuickView(v.id); });

      const chatBtn = article.querySelector('button[data-action="chat"]');
      chatBtn.addEventListener('click', (ev) => { ev.preventDefault(); openChatSheet(v.id); });

      const addBtn = article.querySelector('button[data-action="add"]');
      addBtn.addEventListener('click', (ev) => { ev.preventDefault(); addToBooked(v.id); });

      // clicking the thumb or name opens vendor detail
      const openDetailEls = article.querySelectorAll('[data-action="open-detail"]');
      openDetailEls.forEach(el => el.addEventListener('click', (ev) => { ev.preventDefault(); openVendorDetail(v.id); }));

      grid.appendChild(node);
    }

    // update result count
    $('#resultCount') && ($('#resultCount').textContent = `${state.filtered.length} hasil`);

    // render pagination controls
    renderPagination();
    // update compare bar if any
    syncCompareBar();
  }

  /* -------------------------
     Filters logic
  ------------------------- */

  function matchesFilter(v) {
    const f = state.filters;
    if (f.category && v.category !== f.category) return false;
    if (f.rating) {
      const min = parseFloat(f.rating);
      if (isNaN(min) === false && v.rating < min) return false;
    }
    if (f.priceMin && Number(v.priceFrom) < Number(f.priceMin)) return false;
    if (f.priceMax && Number(v.priceFrom) > Number(f.priceMax)) return false;
    if (f.location && !(v.location || '').toLowerCase().includes(String(f.location).toLowerCase())) return false;
    if (f.date) {
      // check availability contains date (simple)
      const dateStr = f.date;
      if (!Array.isArray(v.avail) || !v.avail.includes(dateStr)) return false;
    }
    return true;
  }

  function applyFiltersAndSort() {
    const arr = state.vendors.filter(v => matchesFilter(v));
    state.filtered = arr;
    state.page = 1;
    renderVendors();
  }

  /* -------------------------
     Pagination & Infinite
  ------------------------- */
  function renderPagination() {
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const pageList = $('#pageList');
    if (!pageList) return;
    pageList.innerHTML = '';

    // build buttons (cap to sensible length)
    const MAX_BTN = 7;
    let start = Math.max(1, state.page - Math.floor(MAX_BTN/2));
    let end = Math.min(pages, start + MAX_BTN - 1);
    if (end - start < MAX_BTN - 1) start = Math.max(1, end - MAX_BTN + 1);

    for (let p = start; p <= end; p++) {
      const li = tpl('pageBtnTemplate').content.cloneNode(true);
      const btn = li.querySelector('.page-btn');
      btn.dataset.page = p;
      btn.textContent = p;
      if (p === state.page) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', () => {
        state.page = p;
        renderVendors();
        // scroll to top of grid
        const grid = $('#vendorGrid');
        grid && grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pageList.appendChild(li);
    }

    // prev/next
    $('#pagePrev').disabled = state.page <= 1;
    $('#pageNext').disabled = state.page >= pages;

    // hide pagination if infinite
    if (state.infinite) {
      $('#pagination').style.display = 'none';
    } else {
      $('#pagination').style.display = '';
    }
  }

  /* -------------------------
     Compare (select vendors to compare)
  ------------------------- */
  function toggleCompare(id, article) {
    id = String(id);
    if (state.compare.has(id)) state.compare.delete(id);
    else {
      // limit to 3
      if (state.compare.size >= 3) {
        showToast('Max 3 vendor untuk compare');
        // uncheck checkbox in UI (if any)
        const node = $(`[data-id="${id}"]`);
        if (node) {
          const ch = node.querySelector('input[data-action="compare"]');
          if (ch) ch.checked = false;
        }
        return;
      }
      state.compare.add(id);
    }
    saveStorage();
    syncCompareBar();
  }

  function syncCompareBar() {
    const wrap = $('#compareBar');
    if (!wrap) return;
    const thumbs = $('#compareThumbs');
    const countEl = $('#compareCount');
    thumbs.innerHTML = '';
    const arr = Array.from(state.compare);
    if (arr.length === 0) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    countEl.textContent = `${arr.length} dipilih`;
    for (const id of arr) {
      const v = state.vendors.find(x => String(x.id) === String(id));
      if (!v) continue;
      const t = tpl('compareThumbTemplate').content.cloneNode(true);
      const btn = t.querySelector('.thumb');
      btn.dataset.id = v.id;
      const img = btn.querySelector('img');
      img.src = v.img;
      img.alt = v.name;
      btn.addEventListener('click', () => {
        // remove from compare
        state.compare.delete(String(v.id));
        saveStorage();
        syncCompareBar();
        // uncheck on card if visible
        const card = $(`[data-id="${v.id}"]`);
        if (card) {
          const ch = card.querySelector('input[data-action="compare"]');
          if (ch) ch.checked = false;
        }
      });
      thumbs.appendChild(t);
    }

    // enable/disable compare button
    $('#btnCompare').disabled = arr.length < 2;
  }

  // compare open -> show compareModal filled
  function openCompareModal() {
    const ids = Array.from(state.compare);
    if (ids.length < 2) { showToast('Pilih minimal 2 vendor untuk compare'); return; }
    // fill compare modal columns
    ids.forEach((id, i) => {
      const v = state.vendors.find(x => String(x.id) === String(id));
      if (!v) return;
      $(`#cmpCol${i+1}`).textContent = v.name;
      $(`#cmpRating${i+1}`).textContent = `${v.rating}★`;
      $(`#cmpPrice${i+1}`).textContent = formatCurrency(v.priceFrom);
      $(`#cmpPkg${i+1}`).textContent = (v.packages && v.packages[0] && v.packages[0].name) || '—';
      $(`#cmpLoc${i+1}`).textContent = v.location || '—';
      $(`#cmpAvail${i+1}`).textContent = (v.avail && v.avail.slice(0,3).join(', ')) || '—';
      $(`#cmpNotes${i+1}`).textContent = v.short || '';
    });
    // show modal
    openModal($('#compareModal'));
  }

  /* -------------------------
     Wishlist (favorites)
  ------------------------- */
  function toggleWishlist(id, btnEl) {
    id = String(id);
    const pressed = state.wishlist.has(id);
    if (pressed) state.wishlist.delete(id);
    else state.wishlist.add(id);
    saveStorage();
    if (btnEl) btnEl.setAttribute('aria-pressed', state.wishlist.has(id) ? 'true' : 'false');
    showToast(state.wishlist.has(id) ? 'Ditambahkan ke wishlist' : 'Dihapus dari wishlist');
  }

  /* -------------------------
     Booked (cart) operations
  ------------------------- */
  function addToBooked(id) {
    id = String(id);
    if (state.booked.has(id)) {
      showToast('Vendor sudah ada di keranjang');
      return;
    }
    state.booked.add(id);
    saveStorage();
    showToast('Vendor ditambahkan ke keranjang (Booked)');
    // update booked related UI if any
  }

  /* -------------------------
     Quick view modal
  ------------------------- */
  function openQuickView(id) {
    const v = state.vendors.find(x => String(x.id) === String(id));
    if (!v) return;
    // fill modal
    $('#qvTitle').textContent = v.name;
    $('#qvRating').textContent = `★ ${v.rating.toFixed(1)}`;
    $('#qvBadges').innerHTML = '';
    (v.badges || []).forEach(b => {
      const el = document.createElement('span');
      el.className = 'badge';
      el.textContent = b;
      $('#qvBadges').appendChild(el);
    });
    $('#qvDesc').textContent = v.short || '';
    $('#qvPrice').textContent = formatCurrency(v.priceFrom);

    // gallery
    const cover = $('#qvCover');
    cover.src = v.gallery && v.gallery.length ? v.gallery[0] : v.img;
    const thumbs = $('#qvThumbs');
    thumbs.innerHTML = '';
    (v.gallery || []).forEach((g, i) => {
      const im = document.createElement('img');
      im.src = g;
      im.alt = `${v.name} #${i+1}`;
      im.addEventListener('click', () => cover.src = g);
      thumbs.appendChild(im);
    });

    // packages
    const pList = $('#qvPackageList');
    pList.innerHTML = '';
    (v.packages || []).forEach(pkg => {
      const li = tpl('packageRowTemplate').content.cloneNode(true);
      li.querySelector('.pkg-name').textContent = pkg.name;
      li.querySelector('.pkg-feats').textContent = (pkg.features || []).join(', ');
      li.querySelector('.pkg-price').textContent = formatCurrency(pkg.price);
      const btn = li.querySelector('button[data-action="select-package"]') || li.querySelector('button');
      btn && btn.addEventListener('click', () => {
        showToast(`Paket "${pkg.name}" dipilih — Est: ${formatCurrency(pkg.price)}`);
      });
      pList.appendChild(li);
    });

    // reviews
    const rList = $('#qvReviewList');
    rList.innerHTML = '';
    (v.reviews || []).forEach(r => {
      const rv = tpl('reviewItemTemplate').content.cloneNode(true);
      rv.querySelector('.name').textContent = r.name;
      rv.querySelector('.muted').textContent = `${(new Date(r.date)).toLocaleDateString()} • ${r.rating}★`;
      rv.querySelector('.review-text').textContent = r.text;
      rList.appendChild(rv);
    });

    // actions
    $('#qvBtnWishlist').setAttribute('aria-pressed', state.wishlist.has(String(v.id)) ? 'true' : 'false');
    $('#qvBtnWishlist').onclick = () => {
      toggleWishlist(v.id, $('#qvBtnWishlist'));
    };

    $('#qvBtnChat').onclick = () => openChatSheet(v.id);
    $('#qvBtnAdd').onclick = () => addToBooked(v.id);
    $('#qvBtnDownloadProposal').onclick = () => {
      showToast('Download proposal (simulasi)');
      // generate a small txt
      download(`${v.name.replace(/\s+/g,'_')}_proposal.txt`, `Proposal - ${v.name}\nEstimate: ${formatCurrency(v.priceFrom)}\n\nDetails:\n${v.short}`);
    };

    // tabs
    const tabs = $$('.qv-tabs .tab, .qv-tabs .tab');
    // generic tab handling for qv
    $$('.qv-tabs .tab').forEach(tab => {
      tab.onclick = () => {
        const parent = tab.closest('.qv-tabs');
        const all = parent.querySelectorAll('.tab');
        all.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const panels = tab.closest('.qv-info').querySelectorAll('.qv-panel');
        panels.forEach(p => p.hidden = true);
        const target = tab.dataset.tab;
        if (target) {
          $(`#${target}`) && ($(`#${target}`).hidden = false);
        }
      };
    });

    openModal($('#quickViewModal'));
  }

  /* -------------------------
     Vendor Detail modal (full)
  ------------------------- */
  function openVendorDetail(id) {
    const v = state.vendors.find(x => String(x.id) === String(id));
    if (!v) return;
    $('#vdTitle').textContent = v.name;
    $('#vdMeta').textContent = `${(v.category || '').toUpperCase()} • ${v.location} • ${v.rating}★`;
    $('#vdDesc').textContent = v.short || '';
    // packages table
    const tbody = $('#vdPackageTable');
    tbody.innerHTML = '';
    (v.packages || []).forEach(pkg => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${pkg.name}</td><td>${(pkg.features||[]).join(', ')}</td><td>${formatCurrency(pkg.price)}</td><td><button class="btn small" data-pkg="${pkg.name}">Pilih</button></td>`;
      tr.querySelector('button').addEventListener('click', () => {
        showToast(`Memilih paket ${pkg.name} dari ${v.name}`);
      });
      tbody.appendChild(tr);
    });

    // reviews
    const rvWrap = $('#vdReviews');
    rvWrap.innerHTML = '';
    (v.reviews || []).forEach(r => {
      const li = tpl('reviewItemTemplate').content.cloneNode(true);
      li.querySelector('.name').textContent = r.name;
      li.querySelector('.muted').textContent = `${(new Date(r.date)).toLocaleDateString()} • ${r.rating}★`;
      li.querySelector('.review-text').textContent = r.text;
      rvWrap.appendChild(li);
    });

    // contact links
    $('#vdWA').href = `https://wa.me/?text=${encodeURIComponent('Halo, saya tertarik dengan layanan '+v.name)}`;
    $('#vdTel').href = `tel:+628000000000`;
    $('#vdSite').href = '#';

    // carousel
    const carousel = $('#vdCarousel');
    carousel.innerHTML = '';
    (v.gallery && v.gallery.length ? v.gallery : [v.img]).forEach((g, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const img = document.createElement('img');
      img.src = g;
      img.alt = `${v.name} #${i+1}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      slide.appendChild(img);
      carousel.appendChild(slide);
    });

    // simple prev/next
    let cur = 0;
    const slides = carousel.querySelectorAll('.slide');
    function showSlide(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.style.display = (i === cur ? 'flex' : 'none'));
    }
    showSlide(0);
    $('#vdCarouselNav').querySelector('[data-action="prev"]').onclick = () => showSlide(cur - 1);
    $('#vdCarouselNav').querySelector('[data-action="next"]').onclick = () => showSlide(cur + 1);

    // big calendar placeholder - fill some booked dates
    const calendar = $('#vdBigCalendar');
    calendar.innerHTML = `<div class="small muted">Availability: ${(v.avail || []).slice(0,6).join(', ') || 'Tidak tersedia'}</div>`;

    openModal($('#vendorDetailModal'));
  }

  /* -------------------------
     Modals generic open/close with focus trap
  ------------------------- */
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.hidden = false;
    modalEl.classList.add('show');
    modalEl.setAttribute('aria-hidden', 'false');
    trapFocus(modalEl);
    // close by click on data-close
    modalEl.querySelectorAll('[data-close]').forEach(btn => {
      btn.onclick = () => closeModal(modalEl);
    });
    // click outside content to close
    modalEl.__outsideHandler = (e) => {
      if (e.target === modalEl) closeModal(modalEl);
    };
    modalEl.addEventListener('click', modalEl.__outsideHandler);
  }
  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.hidden = true;
    modalEl.classList.remove('show');
    modalEl.setAttribute('aria-hidden', 'true');
    releaseTrap(modalEl);
    if (modalEl.__outsideHandler) {
      modalEl.removeEventListener('click', modalEl.__outsideHandler);
      delete modalEl.__outsideHandler;
    }
  }

  /* -------------------------
     Autosuggest search
  ------------------------- */
  const SUGGEST_DATA = (() => {
    // collect categories & locations & names
    const cats = new Set(state.vendors.map(v => v.category).filter(Boolean));
    const locs = new Set(state.vendors.map(v => v.location).filter(Boolean));
    const names = new Set(state.vendors.map(v => v.name).filter(Boolean));
    return { categories: Array.from(cats), locations: Array.from(locs), names: Array.from(names) };
  })();

  function updateSuggestData() {
    // recalc from state.vendors
    const cats = new Set(state.vendors.map(v => v.category).filter(Boolean));
    const locs = new Set(state.vendors.map(v => v.location).filter(Boolean));
    const names = new Set(state.vendors.map(v => v.name).filter(Boolean));
    SUGGEST_DATA.categories = Array.from(cats);
    SUGGEST_DATA.locations = Array.from(locs);
    SUGGEST_DATA.names = Array.from(names);
  }

  function showSuggestions(q) {
    const sbox = $('#searchSuggest');
    if (!sbox) return;
    if (!q || q.length < 1) {
      sbox.hidden = true;
      sbox.innerHTML = '';
      return;
    }
    const low = q.toLowerCase();
    const items = [];

    // name matches
    for (const n of SUGGEST_DATA.names) {
      if (n.toLowerCase().includes(low)) items.push({ type: 'name', text: n });
    }
    // categories
    for (const c of SUGGEST_DATA.categories) {
      if (c.toLowerCase().includes(low)) items.push({ type: 'category', text: c });
    }
    // locations
    for (const l of SUGGEST_DATA.locations) {
      if (l.toLowerCase().includes(low)) items.push({ type: 'location', text: l });
    }

    sbox.innerHTML = '';
    if (items.length === 0) {
      sbox.hidden = true; return;
    }
    items.slice(0, 8).forEach(it => {
      const node = tpl('autosuggestTemplate').content.cloneNode(true);
      node.querySelector('.leading').textContent = it.type === 'name' ? '🔎' : it.type === 'category' ? '🏷️' : '📍';
      node.querySelector('.text').textContent = it.text;
      node.querySelector('.meta').textContent = it.type;
      const div = node.querySelector('.suggest-item');
      div.onclick = () => {
        $('#searchInput').value = it.text;
        sbox.hidden = true;
        doSearch();
      };
      sbox.appendChild(node);
    });
    sbox.hidden = false;
  }

  /* -------------------------
     Search & Filter bindings
  ------------------------- */
  function initControls() {
    // search
    const searchInput = $('#searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        showSuggestions(e.target.value);
      }, 220));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
        if (e.key === 'Escape') $('#searchSuggest') && ($('#searchSuggest').hidden = true);
      });
      $('#btnSearch') && $('#btnSearch').addEventListener('click', doSearch);
    }

    // plan new
    $('#btnPlanNew') && $('#btnPlanNew').addEventListener('click', () => showToast('Plan new — (placeholder)'));

    // booked
    $('#btnGoBooked') && $('#btnGoBooked').addEventListener('click', () => {
      // open a quick list of booked vendors
      const booked = Array.from(state.booked).map(id => state.vendors.find(v => String(v.id) === String(id))).filter(Boolean);
      const names = booked.map(b => b.name).join('\n') || 'Keranjang kosong';
      showToast(`Booked:\n${names}`, { duration: 3500 });
    });

    // filters apply/clear
    $('#btnApplyFilters') && $('#btnApplyFilters').addEventListener('click', () => {
      // read filters
      state.filters.category = $('#categorySelect').value || '';
      state.filters.rating = $('#ratingSelect').value || '';
      state.filters.priceMin = $('#priceMin').value || null;
      state.filters.priceMax = $('#priceMax').value || null;
      state.filters.location = $('#locationInput').value || '';
      state.filters.date = $('#availableDate').value || '';
      state.sortBy = $('#sortSelect').value || 'relevance';
      state.perPage = Number($('#perPage').value) || state.perPage;
      applyFiltersAndSort();
    });
    $('#btnClearFilters') && $('#btnClearFilters').addEventListener('click', () => {
      $('#categorySelect').value = '';
      $('#ratingSelect').value = '';
      $('#priceMin').value = '';
      $('#priceMax').value = '';
      $('#locationInput').value = '';
      $('#availableDate').value = '';
      $('#sortSelect').value = 'relevance';
      state.filters = { category:'', rating:'', priceMin:null, priceMax:null, location:'', date:'' };
      state.sortBy = 'relevance';
      state.page = 1;
      state.filtered = state.vendors.slice();
      renderVendors();
    });

    // pagination prev/next
    $('#pagePrev') && $('#pagePrev').addEventListener('click', () => {
      if (state.page > 1) { state.page--; renderVendors(); }
    });
    $('#pageNext') && $('#pageNext').addEventListener('click', () => {
      const pages = Math.ceil(state.filtered.length / state.perPage);
      if (state.page < pages) { state.page++; renderVendors(); }
    });

    // toggle map
    $('#toggleMap') && $('#toggleMap').addEventListener('change', (e) => {
      state.mapVisible = e.target.checked;
      $('#mapSection').hidden = !state.mapVisible;
      if (state.mapVisible) showToast('Peta diaktifkan (placeholder). Integrasi map lewat Leaflet/Mapbox diperlukan).');
    });

    // infinite scroll toggle
    $('#toggleInfinite') && $('#toggleInfinite').addEventListener('change', (e) => {
      state.infinite = !!e.target.checked;
      state.page = 1;
      renderVendors();
      if (state.infinite) {
        // set up intersection observer to load more when bottom reached
        setupInfiniteObserver();
      } else {
        teardownInfiniteObserver();
      }
    });

    // perPage changes
    $('#perPage') && $('#perPage').addEventListener('change', (e) => {
      state.perPage = Number(e.target.value);
      state.page = 1;
      renderVendors();
    });

    // compare actions
    $('#btnCompare') && $('#btnCompare').addEventListener('click', openCompareModal);
    $('#btnCompareClear') && $('#btnCompareClear').addEventListener('click', () => {
      state.compare.clear();
      saveStorage();
      syncCompareBar();
      renderVendors();
    });

    // export compare
    $('#cmpExport') && $('#cmpExport').addEventListener('click', () => {
      // create CSV or simple text
      const ids = Array.from(state.compare);
      if (ids.length === 0) return showToast('Tidak ada vendor untuk diexport');
      let csv = 'Name,Category,Location,Rating,PriceFrom\n';
      ids.forEach(id => {
        const v = state.vendors.find(x => String(x.id) === String(id));
        if (!v) return;
        csv += `"${v.name}","${v.category}","${v.location}",${v.rating},${v.priceFrom || ''}\n`;
      });
      download('compare_vendors.csv', csv);
      showToast('Export compare selesai');
    });

    // compare modal close
    $('#cmpClose') && $('#cmpClose').addEventListener('click', () => closeModal($('#compareModal')));

    // quick view close handled by data-close attr
    // generic confirm actions
    document.addEventListener('click', (e) => {
      const action = e.target && e.target.dataset && e.target.dataset.action;
      if (action === 'cancel-logout') closeModal($('#logoutModal'));
      if (action === 'confirm-logout') {
        // navigate to signin or simulate
        window.location.href = 'signin.html';
      }
    });

    // empty-state buttons
    $('#emptyClear') && $('#emptyClear').addEventListener('click', () => {
      $('#btnClearFilters') && $('#btnClearFilters').click();
    });
    $('#emptySeePopular') && $('#emptySeePopular').addEventListener('click', () => {
      // sort by rating desc
      state.sortBy = 'rating_desc';
      renderVendors();
    });

    // close quickview/vendor detail modals on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal.show').forEach(m => closeModal(m));
        // close autosuggest
        $('#searchSuggest') && ($('#searchSuggest').hidden = true);
      }
    });

    // close overlay sidebar if clicked
    const overlay = $('#sideNavOverlay');
    if (overlay) overlay.addEventListener('click', () => {
      document.getElementById('sideNav').classList.remove('open');
      overlay.hidden = true;
    });

    // menu toggle (mobile)
    $('#menuToggle') && $('#menuToggle').addEventListener('click', () => {
      const side = document.getElementById('sideNav');
      side.classList.toggle('open');
      const ov = $('#sideNavOverlay');
      if (side.classList.contains('open')) { ov.hidden = false; ov.classList.add('active'); }
      else { ov.hidden = true; ov.classList.remove('active'); }
    });

    // Attach close data-close handlers (buttons inside modals)
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.dataset.close;
        const modal = document.getElementById(target) || btn.closest('.modal');
        modal && closeModal(modal);
      });
    });

    // compareBar visibility toggle when page loads
    syncCompareBar();

    // bind autosuggest hide when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) {
        $('#searchSuggest') && ($('#searchSuggest').hidden = true);
      }
    });
  }

  /* -------------------------
     Search routine
  ------------------------- */
  function doSearch() {
    const q = ($('#searchInput') && $('#searchInput').value || '').trim().toLowerCase();
    if (!q) {
      // reset to filtered by applied filters if any
      applyFiltersAndSort();
      return;
    }
    // simple search across name, category, location
    state.filtered = state.vendors.filter(v => {
      const hay = `${v.name} ${v.category} ${v.location} ${(v.short||'')}`.toLowerCase();
      return hay.includes(q);
    });
    state.page = 1;
    renderVendors();
  }

  /* -------------------------
     Infinite observer
  ------------------------- */
  let _infObserver = null;
  function setupInfiniteObserver() {
    teardownInfiniteObserver();
    const sentinel = document.createElement('div');
    sentinel.id = 'inf-sentinel';
    $('#vendorGrid') && $('#vendorGrid').appendChild(sentinel);
    _infObserver = new IntersectionObserver(entries => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          // load next page
          const maxPages = Math.ceil(state.filtered.length / state.perPage) || 1;
          if (state.page < maxPages) {
            state.page++;
            renderVendors();
          }
        }
      }
    }, { root: null, rootMargin: '200px', threshold: 0.1 });
    _infObserver.observe(sentinel);
  }
  function teardownInfiniteObserver() {
    if (_infObserver) {
      _infObserver.disconnect();
      _infObserver = null;
    }
    const s = $('#inf-sentinel');
    s && s.remove();
  }

  /* -------------------------
     Chat sheet (mobile) placeholder
  ------------------------- */
  function openChatSheet(id) {
    // open chat sheet with vendor name
    const v = state.vendors.find(x => String(x.id) === String(id));
    if (!v) return;
    const sheet = $('#chatSheet');
    if (!sheet) {
      // fallback: toast
      showToast(`Chat: ${v.name}`);
      return;
    }
    $('#chatSheetList').innerHTML = `<div style="padding:8px" class="muted">Chat with ${v.name} (simulated)</div>`;
    sheet.style.display = 'block';
    sheet.setAttribute('aria-hidden', 'false');
    $('#chatSheetInput').focus();
    // close handler
    $('#closeChatSheet').onclick = () => {
      sheet.style.display = 'none';
      sheet.setAttribute('aria-hidden', 'true');
    };
    $('#chatSheetSend').onclick = () => {
      const txt = $('#chatSheetInput').value.trim();
      if (!txt) return;
      const wrapper = $('#chatSheetList');
      const stub = document.createElement('div');
      stub.textContent = `You: ${txt}`;
      wrapper.appendChild(stub);
      $('#chatSheetInput').value = '';
      wrapper.scrollTop = wrapper.scrollHeight;
      showToast('Message sent (simulated)');
    };
  }

  /* -------------------------
     Utility: show main skeleton then load data
  ------------------------- */
  async function boot() {
    loadStorage();
    // initial render: skeletons
    renderSkeletons(6);
    await initData();
    // recalc suggestion dataset
    updateSuggestData();
    // wire controls
    initControls();
    // initial result
    state.filtered = state.vendors.slice();
    renderVendors();
  }

  /* -------------------------
     UI small glue: attach listeners for template-driven close
  ------------------------- */
  document.addEventListener('click', (e) => {
    // any [data-action="open"] links etc can be wired here if needed
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const action = a.dataset.action;
    if (action === 'open') {
      const id = a.closest('.vendor-card') && a.closest('.vendor-card').dataset.id;
      id && openVendorDetail(id);
    }
  });

  /* -------------------------
     DOMContentLoaded boot
  ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // connect autosuggest input id may be 'searchInput' or 'q' (some HTML variants)
    // If HTML uses #q (events), we try to mirror: copy input value to #searchInput
    if (!$('#searchInput') && $('#q')) {
      const qEl = $('#q');
      qEl.id = 'searchInput';
    }

    // Hook autosuggest input for both ids
    const si = $('#searchInput');
    if (si) {
      si.addEventListener('input', (ev) => {
        debounce(() => showSuggestions(ev.target.value), 120)();
      });
    }

    // Link autosuggest item select handled in showSuggestions

    // Boot app
    boot().catch(err => {
      console.error('Failed to boot vendors UI', err);
      showToast('Gagal memuat data (simulated). Lihat console.');
    });
  });

  /* -------------------------
     Expose some helpers for dev console (optional)
  ------------------------- */
  window.HV = {
    state,
    SAMPLE_VENDORS,
    openQuickView,
    openVendorDetail,
    addToBooked,
    toggleWishlist,
    toggleCompare,
    applyFiltersAndSort,
    renderVendors
  };

})();

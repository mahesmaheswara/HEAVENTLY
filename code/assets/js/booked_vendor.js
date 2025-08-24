/* =====================================================
   HeaVenTly — Booked Vendors JS (Verbose Full)
   File: assets/js/booked_vendors.js
   ===================================================== */

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn) => el?.addEventListener(ev, fn);

function openModal(id){
  const modal=document.getElementById(id);
  if(!modal) return;
  modal.classList.add("show");
  document.body.style.overflow="hidden";
}
function closeModal(id){
  const modal=document.getElementById(id);
  if(!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow="";
}
function openDrawer(id){ $("#"+id)?.classList.add("open"); }
function closeDrawer(id){ $("#"+id)?.classList.remove("open"); }

function showToast(msg, timeout=3000){
  const toast=$("#toast");
  if(!toast) return;
  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),timeout);
}

// ---------------- Sidebar Toggle ----------------
const sidebar=$(".sidebar"), overlay=$(".side-nav-overlay"), menuBtn=$(".menu-btn");
on(menuBtn,"click",()=>{
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
});
on(overlay,"click",()=>{
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});

// ---------------- Modal & Drawer ----------------
$$(".btn-open-modal").forEach(btn=>{
  on(btn,"click",()=>{ openModal(btn.dataset.modal); });
});
$$(".modal .btn-close, .modal [data-close]").forEach(btn=>{
  on(btn,"click",()=>{ btn.closest(".modal").classList.remove("show"); document.body.style.overflow=""; });
});
on(document,"keydown",(e)=>{
  if(e.key==="Escape"){
    $$(".modal.show").forEach(m=>m.classList.remove("show"));
    $$(".drawer.open").forEach(d=>d.classList.remove("open"));
    document.body.style.overflow="";
  }
});
$$(".btn-open-drawer").forEach(btn=>{
  on(btn,"click",()=>openDrawer(btn.dataset.drawer));
});
$$(".drawer .btn-close").forEach(btn=>{
  on(btn,"click",()=>closeDrawer(btn.closest(".drawer").id));
});

// ---------------- Dummy Vendor Data ----------------
let vendors=[
  {id:"v-ardi",name:"Dekor Ardi",img:"https://picsum.photos/seed/ardi/600/400",rating:4,desc:"Dekorasi & florist wedding",category:"Decor",status:"Booked"},
  {id:"v-bumi",name:"Catering Bumi Rasa",img:"https://picsum.photos/seed/cat/600/400",rating:5,desc:"Menu tradisional & internasional",category:"Catering",status:"Pending"},
  {id:"v-music",name:"Band Harmoni",img:"https://picsum.photos/seed/band/600/400",rating:4,desc:"Live band & MC",category:"Entertainment",status:"Accepted"},
  {id:"v-somay",name:"Somay Legend",img:"https://picsum.photos/seed/somay/600/400",rating:3,desc:"Street food premium",category:"Food",status:"Negotiation"}
];

// ---------------- Render Vendors ----------------
function renderVendors(list=vendors){
  const grid=$("#vendorGrid");
  grid.innerHTML="";
  if(list.length===0){
    grid.innerHTML=`<div class="empty-state"><p>No vendors in cart.</p></div>`;
    return;
  }
  list.forEach(v=>{
    const card=document.createElement("div");
    card.className="vendor-card";
    card.innerHTML=`
      <div class="vendor-thumb"><img src="${v.img}" alt="${v.name}"></div>
      <div class="vendor-info">
        <div class="vendor-name">${v.name}</div>
        <div class="vendor-cat">${v.category}</div>
        <div class="vendor-desc">${v.desc}</div>
        <div class="rating">${"★".repeat(v.rating)}${"☆".repeat(5-v.rating)}</div>
        <div class="status-badge ${v.status.toLowerCase()}">${v.status}</div>
      </div>
      <div class="card-actions">
        <button class="btn wishlist" data-id="${v.id}" aria-pressed="false"><i class="icon-heart"></i></button>
        <button class="btn btn-open-modal" data-modal="vendorDetailModal" data-id="${v.id}"><i class="icon-eye"></i></button>
        <button class="btn btn-open-modal" data-modal="connectModal" data-id="${v.id}"><i class="icon-link"></i></button>
        <button class="btn btn-open-modal" data-modal="negotiationModal" data-id="${v.id}"><i class="icon-message"></i></button>
        <button class="btn btn-open-modal" data-modal="contractModal" data-id="${v.id}"><i class="icon-file"></i></button>
        <label class="checkbox-compare"><input type="checkbox" data-id="${v.id}"><span>Compare</span></label>
      </div>
    `;
    grid.appendChild(card);
  });
  attachCardEvents();
}

// ---------------- Attach Events on Cards ----------------
function attachCardEvents(){
  $$(".vendor-card .wishlist").forEach(btn=>{
    on(btn,"click",()=>{
      const pressed=btn.getAttribute("aria-pressed")==="true";
      btn.setAttribute("aria-pressed",!pressed);
      showToast(!pressed?"Added to wishlist":"Removed from wishlist");
    });
  });

  $$(".vendor-card .btn-open-modal").forEach(btn=>{
    on(btn,"click",()=>{
      const id=btn.dataset.modal;
      const vid=btn.dataset.id;
      if(id==="connectModal"){ updateVendorStatus(vid,"Pending"); }
      openModal(id);
    });
  });

  // Checkbox compare → update bulk bar
  $$(".vendor-card .checkbox-compare input").forEach(c=>{
    on(c,"change",updateBulkBar);
  });
}

// ---------------- Bulk Action ----------------
const bulkBar=$("#bulkBar");
function updateBulkBar(){
  const checked=$$(".vendor-card .checkbox-compare input:checked").length;
  bulkBar.style.display=checked>0?"flex":"none";
}
on($("#bulkConnect"),"click",()=>openModal("connectModal"));
on($("#bulkNegotiate"),"click",()=>openModal("negotiationModal"));
on($("#bulkContract"),"click",()=>openModal("contractModal"));

// ---------------- Update Vendor Status ----------------
function updateVendorStatus(id,status){
  const v=vendors.find(x=>x.id===id);
  if(v){ v.status=status; renderVendors(); showToast(`Vendor ${v.name} status → ${status}`); }
}

// ---------------- Notif Tray ----------------
const notifBtn=$("#btnNotif"), notifTray=$("#notifTray");
on(notifBtn,"click",()=>notifTray.classList.toggle("show"));
on(document,"click",(e)=>{
  if(!notifTray.contains(e.target)&&e.target!==notifBtn){
    notifTray.classList.remove("show");
  }
});

// ---------------- Filters ----------------
const filterForm=$("#filterBar"), chipBox=$(".chip-box");
if(filterForm){
  on(filterForm,"submit",(e)=>{
    e.preventDefault();
    const q=$("#searchInput").value.trim();
    if(q){
      const chip=document.createElement("div");
      chip.className="chip";
      chip.innerHTML=`${q}<button class="remove">&times;</button>`;
      chipBox.appendChild(chip);
      $("#searchInput").value="";
    }
  });
}
on(chipBox,"click",(e)=>{ if(e.target.classList.contains("remove")) e.target.parentElement.remove(); });

// ---------------- Skeleton Loader ----------------
function showSkeleton(){
  const grid=$("#vendorGrid"); grid.innerHTML="";
  for(let i=0;i<4;i++){
    const c=document.createElement("div");
    c.className="vendor-card skeleton";
    c.innerHTML=`<div class="sk-head"></div><div class="sk-img"></div><div class="sk-line lg"></div><div class="sk-line"></div><div class="sk-line sm"></div><div class="sk-actions"></div>`;
    grid.appendChild(c);
  }
  setTimeout(()=>renderVendors(vendors),1500);
}

// ---------------- Start ----------------
document.addEventListener("DOMContentLoaded",()=>{
  showSkeleton();
  updateBulkBar();
});

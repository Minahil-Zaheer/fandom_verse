let DATA={categories:[],content:[],events:[]}, saved=JSON.parse(localStorage.getItem("fvSaved")||"[]");

const $=s=>document.querySelector(s);
async function init(){
  const res=await fetch("data/content.json"); DATA=await res.json();
  renderCategories(); renderFeatured(); renderFilters(); renderAll(); renderEvents(); updateSaved();
}
function renderCategories(){
  $("#categoryGrid").innerHTML=DATA.categories.map(c=>`
    <div class="category-card" onclick="filterCategory('${c.id}')">
      <i class="bi ${c.icon} category-icon"></i><div><strong>${c.name}</strong><small class="d-block">${c.description}</small></div>
    </div>`).join("");
}
function card(item){
 return `<div class="col-12 col-sm-6 col-lg-3"><article class="content-card" onclick="openDetail(${item.id})">
   <div class="poster">${item.image?`<img src="${item.image}" alt="${item.title}" loading="lazy">`:`<div class="poster-placeholder"><i class="bi bi-stars"></i></div>`}
   <span class="type-pill">${item.type}</span>
   <button class="save-btn" onclick="event.stopPropagation();toggleSave(${item.id})"><i class="bi ${saved.includes(item.id)?"bi-bookmark-fill":"bi-bookmark"}"></i></button></div>
   <div class="card-body"><h3>${item.title}</h3><p>${item.description}</p><div class="meta"><span>${item.year} · ★ ${item.rating}</span><span class="tag">${item.tags[0]}</span></div></div>
 </article></div>`;
}
function renderFeatured(){ $("#featuredGrid").innerHTML=DATA.content.filter(x=>x.featured).slice(0,4).map(card).join("");}
function renderAll(){
 let cat=$("#categoryFilter").value||"all", type=$("#typeFilter").value||"all";
 let list=DATA.content.filter(x=>(cat==="all"||x.category===cat)&&(type==="all"||x.type===type));
 $("#catalogTitle").textContent=cat==="all"?"Explore everything":DATA.categories.find(x=>x.id===cat)?.name+" universe";
 $("#catalogGrid").innerHTML=list.length?list.map(card).join(""):`<div class="col-12"><p class="text-muted">No content matches those filters.</p></div>`;
}
function renderFilters(){
 $("#categoryFilter").innerHTML='<option value="all">All categories</option>'+DATA.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
 $("#categoryFilter").onchange=renderAll; $("#typeFilter").onchange=renderAll;
}
function filterCategory(id){$("#categoryFilter").value=id;renderAll();document.querySelector("#catalog").scrollIntoView({behavior:"smooth"});}
function openDetail(id){
 const x=DATA.content.find(i=>i.id===id); if(!x)return;
 $("#detailContent").innerHTML=`<div class="detail-layout"><div class="detail-image"><img src="${x.image}" alt="${x.title}"></div><div class="detail-copy"><span class="tag">${x.type}</span><h2>${x.title}</h2><div class="facts"><span>${x.year}</span><span>★ ${x.rating}</span>${x.tags.map(t=>`<span>${t}</span>`).join("")}</div><p>${x.description}</p><p><strong>Fandom guide:</strong> Browse related content, save this title to your personal list, and use the category filters to discover more.</p><button class="btn btn-dark rounded-pill px-4" onclick="toggleSave(${x.id})"><i class="bi bi-bookmark"></i> Save to my list</button></div></div>`;
 new bootstrap.Modal("#detailModal").show();
}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem("fvSaved",JSON.stringify(saved));updateSaved();renderAll();renderFeatured();showToast(saved.includes(id)?"Saved to your list":"Removed from your list");}
function updateSaved(){$("#savedCount").textContent=saved.length;}
function renderEvents(){$("#eventsList").innerHTML=DATA.events.map(e=>`<div class="event-item"><div class="event-date"><span>${e.date.split(" ")[1]}</span>${e.date.split(" ")[0]}</div><div><strong>${e.title}</strong><p>${e.location} · ${e.description}</p></div><span class="event-cat">${e.category}</span></div>`).join("");}
function search(){
 const q=$("#globalSearch").value.trim().toLowerCase(); if(!q)return;
 const matches=DATA.content.filter(x=>(x.title+" "+x.description+" "+x.tags.join(" ")+" "+x.category).toLowerCase().includes(q));
 $("#catalogTitle").textContent=`Search results for “${$("#globalSearch").value}”`;
 $("#catalogGrid").innerHTML=matches.length?matches.map(card).join(""):`<div class="col-12"><p class="text-muted">No matches found. Try another fandom or character.</p></div>`;
 document.querySelector("#catalog").scrollIntoView({behavior:"smooth"});
}
function showToast(msg){$("#toastText").textContent=msg;new bootstrap.Toast("#liveToast",{delay:1600}).show();}
$("#searchBtn").onclick=search;$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter")search()});
document.querySelectorAll("[data-search]").forEach(b=>b.onclick=()=>{$("#globalSearch").value=b.dataset.search;search()});
$("#chatLauncher").onclick=()=>$("#chatBox").classList.toggle("open");$("#chatClose").onclick=()=>$("#chatBox").classList.remove("open");
function chat(q){let text=q.toLowerCase(),answer="Try searching for a title, artist, character or fandom. You can also use the category cards above.";
if(text.includes("anime"))answer="Anime fans can explore One Piece, Demon Slayer and more from the Anime universe.";
else if(text.includes("movie"))answer="The Movies universe includes film profiles, ratings, tags and descriptions.";
else if(text.includes("explore"))answer="You can explore Anime, Gaming, Movies, TV Shows, K-Pop, Comics and Manga.";
$("#chatMessages").insertAdjacentHTML("beforeend",`<div class="user-msg">${q}</div><div class="bot-msg">${answer}</div>`);$("#chatMessages").scrollTop=99999;}
$("#chatSend").onclick=()=>{let q=$("#chatInput").value.trim();if(q){chat(q);$("#chatInput").value=""}};
$("#chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#chatSend").click()});
document.querySelectorAll(".quick-replies button").forEach(b=>b.onclick=()=>chat(b.dataset.q));
init();

(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))u(a);new MutationObserver(a=>{for(const e of a)if(e.type==="childList")for(const n of e.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&u(n)}).observe(document,{childList:!0,subtree:!0});function i(a){const e={};return a.integrity&&(e.integrity=a.integrity),a.referrerPolicy&&(e.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?e.credentials="include":a.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function u(a){if(a.ep)return;a.ep=!0;const e=i(a);fetch(a.href,e)}})();const Z="/api",j="pdc_token",G="pdc_user";function Q(){try{return localStorage.getItem(j)}catch{return null}}function z(t){try{t?localStorage.setItem(j,t):localStorage.removeItem(j)}catch{}}function M(t){try{t?localStorage.setItem(G,JSON.stringify(t)):localStorage.removeItem(G)}catch{}}async function y(t,s={}){const i=`${Z}${t}`,u=Q(),a={"Content-Type":"application/json",...s.headers};u&&(a.Authorization=`Bearer ${u}`,a["x-auth-token"]=u);const e={credentials:"include",...s,headers:a};try{const n=await fetch(i,e);let o;try{o=await n.json()}catch{if(!n.ok)throw new Error(`HTTP Error: ${n.status}`);return null}if(!n.ok||o.success===!1){n.status===401&&t!=="/auth/login"&&(z(null),M(null));const r=o.error;let d="Request failed",p=null;r?typeof r=="string"?d=r:typeof r=="object"&&(d=r.message||r.error||r.code||JSON.stringify(r),p=r.code||null):o.message?d=typeof o.message=="string"?o.message:JSON.stringify(o.message):d=`Request failed (${n.status})`,typeof d=="object"&&(d=JSON.stringify(d));const l=new Error(String(d));throw l.code=p,l.statusCode=n.status,l}return o}catch(n){throw console.error(`API Error on ${t}:`,n.message||n),n}}const b={login:async(t,s)=>{const i=await y("/auth/login",{method:"POST",body:JSON.stringify({email:t.trim(),password:s})}),u=i.token||i.data&&i.data.token,a=i.user||i.data&&i.data.user||i.data;return u&&z(u),a&&M(a),i},logout:async()=>{try{await y("/auth/logout",{method:"POST"})}finally{z(null),M(null)}},getMe:async()=>{const t=await y("/auth/me"),s=t.user||t.data&&t.data.user||t.data;return s&&M(s),t},getDashboard:()=>y("/dashboard"),getDecisionCenter:()=>y("/decision-center"),getJobs:(t="")=>y(`/jobs${t}`),getJob:t=>y(`/jobs/${t}`),createJob:t=>y("/jobs",{method:"POST",body:JSON.stringify(t)}),updateJob:(t,s)=>y(`/jobs/${t}`,{method:"PUT",body:JSON.stringify(s)}),deleteJob:t=>y(`/jobs/${t}`,{method:"DELETE"}),getTasks:(t="")=>y(`/tasks${t}`),getTask:t=>y(`/tasks/${t}`),createTask:t=>y("/tasks",{method:"POST",body:JSON.stringify(t)}),updateTask:(t,s)=>y(`/tasks/${t}`,{method:"PUT",body:JSON.stringify(s)}),assignTask:(t,s)=>y(`/tasks/${t}/assign`,{method:"POST",body:JSON.stringify(s)}),getUsers:()=>y("/users"),getUser:t=>y(`/users/${t}`),createUser:t=>y("/users",{method:"POST",body:JSON.stringify(t)}),updateUser:(t,s)=>y(`/users/${t}`,{method:"PUT",body:JSON.stringify(s)}),activateUser:t=>y(`/users/${t}/activate`,{method:"POST"}),deactivateUser:t=>y(`/users/${t}/deactivate`,{method:"POST"}),changeRole:(t,s)=>y(`/users/${t}/role`,{method:"POST",body:JSON.stringify({role:s,newRole:s})}),resetPassword:(t,s)=>y(`/users/${t}/reset-password`,{method:"POST",body:JSON.stringify({password:s,newPassword:s})}),getPayments:(t="")=>y(`/payments${t}`),getPayment:t=>y(`/payments/${t}`),createPayment:t=>y("/payments",{method:"POST",body:JSON.stringify(t)}),updatePayment:(t,s)=>y(`/payments/${t}`,{method:"PUT",body:JSON.stringify(s)}),getPaymentSummary:()=>y("/payments/summary"),getMonthlyReport:(t,s)=>y(`/reports/monthly?year=${t}&month=${s}`),getEmployeePerformanceReport:(t,s)=>y(`/reports/employee-performance?startDate=${t}&endDate=${s}`),getWorkTypeReport:(t,s)=>y(`/reports/work-type?startDate=${t}&endDate=${s}`),getDepartmentReport:(t,s)=>y(`/reports/department?startDate=${t}&endDate=${s}`),getAuditLog:(t="")=>y(`/audit${t}`),getSettings:()=>y("/settings"),updateSettings:t=>y("/settings",{method:"PUT",body:JSON.stringify(t)}),testDbConnection:()=>y("/settings/db-test"),discoverSheets:()=>y("/settings/discover-sheets")};let N=null;const D={getUser:()=>N,setUser:t=>{t&&(t.email==="admin@gmail.com"||t.name&&t.name.toLowerCase().includes("admin"))&&(t.role="ADMIN",t.Role="ADMIN"),N=t},clearUser:()=>{N=null},isAuthenticated:()=>!!N,getRole:()=>(N==null?void 0:N.role)||"ADMIN",canAccess:t=>!0};let H={},U=null;const q={init(t){H=t,window.addEventListener("hashchange",()=>this.handleHashChange()),this.handleHashChange()},navigate(t){const s=t.startsWith("#")?t:"#"+t;window.location.hash===s?this.handleHashChange():window.location.hash=s},onRoute(t){U=t},handleHashChange(){let t=window.location.hash;t.startsWith("#")&&(t=t.slice(1));const s=(t||"/").split("?")[0];if(!D.isAuthenticated()&&s!=="/login"){this.navigate("/login");return}if(D.isAuthenticated()&&s==="/login"){this.navigate("/");return}let i=H[s]||H["*"];i&&(i.module&&D.canAccess(i.module),U&&U(i))}};function ee(t,s){if(document.getElementById("sidebar"))return;const u=[{name:"Dashboard",path:"#/",module:"dashboard",icon:"📊"},{name:"Decision Center",path:"#/decision-center",module:"decision-center",icon:"🎯"},{name:"Jobs",path:"#/jobs",module:"jobs",icon:"💼"},{name:"Tasks",path:"#/tasks",module:"tasks",icon:"📋"},{name:"Team",path:"#/team",module:"team",icon:"👥"},{name:"Payments",path:"#/payments",module:"payments",icon:"💰"},{name:"Reports",path:"#/reports",module:"reports",icon:"📈"},{name:"Users",path:"#/users",module:"users",icon:"👤"},{name:"Audit Log",path:"#/audit",module:"audit",icon:"📝"},{name:"Settings",path:"#/settings",module:"settings",icon:"⚙️"}].filter(l=>D.canAccess(l.module)),a=s&&(s.name||s.Name||s.email)||"Admin",e=s&&(s.role||s.Role)||"ADMIN",n=a.slice(0,2).toUpperCase();t.innerHTML=`
    <aside id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="sidebar-brand-text">
          <span class="brand-title">PDC CENTER</span>
          <span class="brand-sub">Production Intelligence</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">MAIN NAVIGATION</div>
        ${u.map(l=>`
          <a href="${l.path}" class="nav-link" data-path="${l.path}">
            <span class="nav-icon">${l.icon}</span>
            <span class="nav-label">${l.name}</span>
            <span class="nav-arrow">›</span>
          </a>
        `).join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-card">
          <div class="user-avatar">${n}</div>
          <div class="user-details">
            <span class="user-name">${a}</span>
            <span class="user-role-badge">${e}</span>
          </div>
          <button id="sidebar-logout-btn" class="logout-icon-btn" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div id="main-wrapper">
      <header id="header">
        <button id="menu-toggle" aria-label="Toggle Navigation">☰</button>
        <div class="header-breadcrumb" id="header-breadcrumb">Operations Dashboard</div>
        <div class="header-right">
          <span class="status-indicator-badge">🟢 Live DB</span>
          <span class="user-greeting">Hi, <strong>${a}</strong></span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Sign Out</button>
        </div>
      </header>
      <main id="page-content"></main>
    </div>
  `;const o=()=>{const l=window.location.hash||"#/";document.querySelectorAll(".nav-link").forEach(m=>{if(m.getAttribute("href")===l){m.classList.add("active");const c=m.querySelector(".nav-label");c&&document.getElementById("header-breadcrumb")&&(document.getElementById("header-breadcrumb").textContent=c.textContent)}else m.classList.remove("active")})};window.addEventListener("hashchange",o),o();const r=document.getElementById("sidebar");document.getElementById("menu-toggle").addEventListener("click",l=>{l.stopPropagation(),r.classList.toggle("open")}),document.getElementById("main-wrapper").addEventListener("click",l=>{window.innerWidth<=768&&l.target.id!=="menu-toggle"&&r.classList.remove("open")});const d=async()=>{try{await b.logout()}catch(l){console.error(l)}D.clearUser(),window.location.hash="#/login",window.location.reload()};document.getElementById("logout-btn").addEventListener("click",d);const p=document.getElementById("sidebar-logout-btn");p&&p.addEventListener("click",d)}function T(t,s="info"){const i=document.getElementById("toast-container");if(!i)return;const u=document.createElement("div");u.className=`toast toast-${s}`;let a="Notification";typeof t=="string"?a=t:typeof t=="object"&&t!==null&&(a=t.message||t.error||JSON.stringify(t)),u.textContent=a,i.appendChild(u),setTimeout(()=>{u.style.opacity="0",u.style.transition="opacity 0.3s ease",setTimeout(()=>u.remove(),300)},4e3)}const te={render(t){t.innerHTML=`
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-brand">
            <div class="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h1>PRODUCTION DECISION CENTER</h1>
            <p class="brand-subtitle">Operations & Decision Intelligence System</p>
          </div>

          <form id="login-form" class="login-form">
            <div id="login-error" class="login-error-alert" style="display:none;"></div>
            
            <div class="form-group">
              <label class="form-label" for="email">Work Email</label>
              <div class="input-with-icon">
                <span class="input-icon">✉️</span>
                <input type="email" id="email" class="form-control" placeholder="admin@gmail.com" required autocomplete="username">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">🔒</span>
                <input type="password" id="password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" id="toggle-pw" class="pw-toggle-btn" title="Toggle password visibility">👁️</button>
              </div>
            </div>

            <button type="submit" id="submit-btn" class="btn btn-primary btn-block btn-lg">
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <div class="login-footer">
            <span>Connected to Google Sheets Database</span>
          </div>
        </div>
      </div>
    `;const s=document.getElementById("login-form"),i=document.getElementById("toggle-pw"),u=document.getElementById("password"),a=document.getElementById("login-error"),e=document.getElementById("submit-btn");i.addEventListener("click",()=>{u.type==="password"?u.type="text":u.type="password"}),s.addEventListener("submit",async n=>{n.preventDefault();const o=document.getElementById("email").value.trim(),r=u.value;a.style.display="none",e.disabled=!0,e.innerHTML='<span class="loader-sm"></span> Signing In...';try{const d=await b.login(o,r),p=d.user||d.data&&d.data.user||d.data;if(p)D.setUser(p),q.navigate("/");else throw new Error("Invalid login response from server")}catch(d){let p="Authentication failed. Please check your credentials.";d&&(typeof d.message=="string"&&d.message.trim()&&d.message!=="[object Object]"?p=d.message:typeof d.error=="string"?p=d.error:typeof d=="string"&&(p=d)),a.textContent=p,a.style.display="block",e.disabled=!1,e.innerHTML="<span>Sign In to Dashboard</span>"}})}},F={async render(t){t.innerHTML=`
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Executive Dashboard</h2>
          <span class="badge badge-success">Live Google Sheets Database</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <label for="dashboard-month-filter" style="font-size:0.875rem; font-weight:600; color:var(--text-muted);">Period:</label>
          <select id="dashboard-month-filter" class="form-control" style="width:190px; padding:0.4rem 0.6rem; font-size:0.875rem;">
            <option value="ALL">All (Full 2026)</option>
            <option value="2026-01">January 2026</option>
            <option value="2026-02">February 2026</option>
            <option value="2026-03">March 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">December 2026</option>
          </select>
        </div>
      </div>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;const s=document.getElementById("dashboard-month-filter"),i=async()=>{const u=s.value,a=document.getElementById("dash-content");a.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{const[e,n,o,r]=await Promise.all([b.getDashboard().catch(()=>({})),b.getJobs().catch(()=>({jobs:[]})),b.getTasks().catch(()=>({tasks:[]})),b.getUsers().catch(()=>({users:[]}))]),d=n&&n.data&&n.data.jobs||n.jobs||(Array.isArray(n.data)?n.data:[]),p=o&&o.data&&o.data.tasks||o.tasks||(Array.isArray(o.data)?o.data:[]),l=r&&r.data&&r.data.users||r.users||(Array.isArray(r.data)?r.data:[]);let m=d,c=p;if(u!=="ALL"){m=d.filter(f=>{const R=f["In Date"]||f.inDate||"",K=f["Due Date"]||f.dueDate||"",X=((f.Notes||f.notes||"").match(/Sheet:\s*([A-Za-z0-9_\s]+)/i)||[])[1]||"";return({"2026-01":["2026-01","JAN","JAN 26","JAN_26"],"2026-02":["2026-02","FEB","FEB 26","FEB_26"],"2026-03":["2026-03","MAR"],"2026-04":["2026-04","APR"],"2026-05":["2026-05","MAY"],"2026-06":["2026-06","JUNE","JUN"],"2026-07":["2026-07","JULY","JUL"],"2026-08":["2026-08","AUG"],"2026-09":["2026-09","SEP"],"2026-10":["2026-10","OCT"],"2026-11":["2026-11","NOV"],"2026-12":["2026-12","DEC"]}[u]||[u]).some(J=>X.toUpperCase().includes(J)||R.includes(J)||K.includes(J))});const v=new Set(m.map(f=>f["Job ID"]||f.jobId));c=p.filter(f=>v.has(f["Job ID"]||f.jobId))}if(u!=="ALL"&&m.length===0){a.innerHTML=`
            <div class="card" style="padding: 3rem 1.5rem; text-align: center; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
              <h3>No historical production data.</h3>
              <p style="font-size:0.9rem; margin-top:0.3rem;">There are no recorded jobs or task assignments for the selected period in the historical workbook.</p>
            </div>
          `;return}const E=m.length,k=c.filter(v=>v.Status!=="COMPLETED").length,w=c.filter(v=>v.Status==="COMPLETED").length,L=new Date,C=c.filter(v=>v.Status!=="COMPLETED"&&v["Due Date"]&&new Date(v["Due Date"])<L).length,P=c.length,x=P>0?Math.round(w/P*100):E>0?100:0,g={};c.forEach(v=>{const f=v.Status||"COMPLETED";g[f]=(g[f]||0)+1});const h={};m.forEach(v=>{const f=v["Work Type"]||v.workType||"Video Editing";h[f]=(h[f]||0)+1});const $={};l.filter(v=>v.Role!=="ADMIN").forEach(v=>{$[v.Name]={id:v["User ID"]||v.id,name:v.Name,capacity:parseInt(v.Capacity)||40,open:0,completed:0}}),c.forEach(v=>{const f=v["Assigned Name"]||v["Assigned To"]||"";f&&$[f]&&(v.Status==="COMPLETED"?$[f].completed++:$[f].open++)});const O=Object.values($),A=l.filter(v=>v.Status==="ACTIVE").length,W=O.filter(v=>v.open/(v.capacity||40)>=1).length,Y=`
          <div class="dashboard-grid">
            <div class="card stat-card"><div class="stat-title">Total Jobs</div><div class="stat-value">${E}</div></div>
            <div class="card stat-card"><div class="stat-title">Open Tasks</div><div class="stat-value">${k}</div></div>
            <div class="card stat-card"><div class="stat-title">Completed Tasks</div><div class="stat-value" style="color:var(--success)">${w}</div></div>
            <div class="card stat-card"><div class="stat-title">Overdue Tasks</div><div class="stat-value" style="color:var(--danger)">${C}</div></div>
            <div class="card stat-card"><div class="stat-title">Completion Rate</div><div class="stat-value">${x}%</div></div>
            <div class="card stat-card"><div class="stat-title">Active Staff</div><div class="stat-value">${A}</div></div>
            <div class="card stat-card"><div class="stat-title">Overloaded Staff</div><div class="stat-value" style="color:${W>0?"var(--danger)":"inherit"}">${W}</div></div>
            <div class="card stat-card"><div class="stat-title">Total Tasks</div><div class="stat-value" style="color:var(--primary)">${P}</div></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="card">
              <h3>Task Status Distribution</h3>
              <div style="margin-top:1rem;">
                ${Object.keys(g).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No tasks recorded for this period.</p>':Object.entries(g).map(([v,f])=>`
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                    <span class="badge badge-${v}">${v}</span>
                    <strong>${f}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="card">
              <h3>Top Work Types</h3>
              <div style="margin-top:1rem; max-height:260px; overflow-y:auto;">
                ${Object.keys(h).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No jobs recorded for this period.</p>':Object.entries(h).slice(0,8).map(([v,f])=>`
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border); font-size:0.85rem;">
                    <span>${v}</span>
                    <strong>${f}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <h3>Employee Workload & Capacity</h3>
            <div style="margin-top:1rem;">
              ${O.length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No active production staff found.</p>':O.map(v=>{const f=v.capacity>0?Math.round(v.open/v.capacity*100):0,R=f>=100?"progress-red":f>=80?"progress-orange":"progress-green";return`
                    <div style="margin-bottom:1rem;">
                      <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.3rem;">
                        <span><strong>${v.name}</strong></span>
                        <span>${f}% (${v.open} open / ${v.completed} completed)</span>
                      </div>
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${R}" style="width: ${Math.min(f,100)}%;"></div>
                      </div>
                    </div>
                  `}).join("")}
            </div>
          </div>
        `;a.innerHTML=Y}catch(e){const n=typeof e=="object"?e.message||JSON.stringify(e):String(e);a.innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load dashboard: ${n}</div>`}};s.addEventListener("change",i),i()}};function I(t,{columns:s,data:i,loading:u,error:a,onRowClick:e,emptyMessage:n="No records found"}){if(u){t.innerHTML='<div class="loader-container"><div class="loader"></div></div>';return}if(a){let c="Error loading data";typeof a=="string"?c=a:typeof a=="object"&&a!==null&&(c=a.message||a.code||(a.error?a.error.message||a.error:JSON.stringify(a))),(c==="[object Object]"||!c)&&(c="Error loading data from database."),t.innerHTML=`<div style="color:var(--danger); padding: 1rem;">Error loading data: ${c}</div>`;return}let o=[];if(Array.isArray(i)?o=i:i&&typeof i=="object"&&(o=i.items||i.jobs||i.tasks||i.users||i.payments||i.logs||i.report||i.employeeStats||[]),!o||o.length===0){t.innerHTML=`<div style="padding: 2.5rem 1rem; color: var(--text-muted); text-align: center; font-size: 0.9rem;">${n}</div>`;return}const r=document.createElement("div");r.className="table-container table-responsive-mobile";const d=document.createElement("table"),p=document.createElement("thead"),l=document.createElement("tr");s.forEach(c=>{const E=document.createElement("th");E.textContent=c.label,l.appendChild(E)}),p.appendChild(l),d.appendChild(p);const m=document.createElement("tbody");o.forEach((c,E)=>{const k=document.createElement("tr");e&&(k.classList.add("clickable"),k.addEventListener("click",w=>{w.target.tagName.toLowerCase()==="button"||w.target.closest("button")||w.target.tagName.toLowerCase()==="a"||e(c)})),s.forEach(w=>{const L=document.createElement("td");if(L.setAttribute("data-label",w.label),w.render)L.innerHTML=w.render(c,E);else{const C=w.key&&c[w.key]!==void 0?c[w.key]:w.label&&c[w.label]!==void 0?c[w.label]:"";L.textContent=C??""}k.appendChild(L)}),m.appendChild(k)}),d.appendChild(m),r.appendChild(d),t.innerHTML="",t.appendChild(r)}const ae={async render(t){t.innerHTML=`
      <div class="page-header">
        <h2>Decision Center</h2>
        <span class="badge badge-primary">Operational Intelligence</span>
      </div>
      <div id="dc-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const s=await b.getDecisionCenter(),i=s&&s.data?s.data:s||{},u=i.insights||{},a=i.employeeStats||i.employeeWorkload||i.employees||[],e=i.alerts||[];let n="";e&&e.length>0&&(n+=`
          <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <h3 style="color:var(--danger)">⚠️ Action Required</h3>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
              ${e.map(c=>`<li>${c}</li>`).join("")}
            </ul>
          </div>
        `);const o=u.highestWorkloadEmployee,r=o&&typeof o=="object"&&o.name?`${o.name} (${o.utilizationPercent??o.utilization??0}%)`:typeof o=="string"?o:"None",d=u.highestOverdueEmployee,p=d&&typeof d=="object"&&d.name?`${d.name} (${d.overdueCount??d.overdueTasks??0} overdue)`:typeof d=="string"?d:"None",l=u.highestBacklogTaskType||"None",m=u.bottleneckDepartments&&u.bottleneckDepartments.length>0?u.bottleneckDepartments.join(", "):"None";n+=`
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="card">
            <div class="stat-title">Highest Workload</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--text);">${r}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Overdue</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--danger);">${p}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Backlog Type</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--primary);">${l}</div>
          </div>
          <div class="card">
            <div class="stat-title">Bottleneck Depts</div>
            <div class="stat-value" style="font-size:1.15rem; color:${m!=="None"?"var(--warning)":"inherit"};">${m}</div>
          </div>
        </div>
      `,n+=`
        <div class="card mb-4">
          <h3>Employee Workload & Capacity Signals</h3>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem;">
            🟢 <strong>AVAILABLE</strong> (&lt;80%) &nbsp;|&nbsp; 
            🟠 <strong>HIGH</strong> (80-99%) &nbsp;|&nbsp; 
            🔴 <strong>OVERLOADED</strong> (≥100%)
          </p>
          <div id="emp-table-container"></div>
        </div>
      `,document.getElementById("dc-content").innerHTML=n,I(document.getElementById("emp-table-container"),{columns:[{label:"Employee",render:c=>`<strong>${c.name||c.userName||"-"}</strong>`},{label:"Department",render:c=>c.department||c.Department||"-"},{label:"Open Tasks",render:c=>c.openCount??c.openTasks??0},{label:"Completed",render:c=>c.completedCount??c.completedTasks??0},{label:"Overdue",render:c=>{const E=c.overdueCount??c.overdueTasks??0;return E>0?`<span style="color:var(--danger);font-weight:bold;">${E}</span>`:"0"}},{label:"Capacity",render:c=>c.capacity??40},{label:"Utilization",render:c=>{const E=c.utilizationPercent!==void 0?c.utilizationPercent:c.utilization??0,k=E>=100?"progress-red":E>=80?"progress-orange":"progress-green";return`
              <div style="min-width:120px;">
                <div style="font-size:0.8rem; margin-bottom:2px;">${E}%</div>
                <div class="progress-bar-bg" style="height:6px;">
                  <div class="progress-bar-fill ${k}" style="width:${Math.min(E,100)}%;"></div>
                </div>
              </div>
            `}},{label:"Signal",render:c=>{const E=c.signal||(c.utilizationPercent>=100?"OVERLOADED":c.utilizationPercent>=80?"HIGH":"AVAILABLE");return`<span class="badge ${E==="OVERLOADED"?"badge-danger":E==="HIGH"?"badge-warning":"badge-success"}">${E}</span>`}}],data:a,emptyMessage:"No employee workload records found."})}catch(s){document.getElementById("dc-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load Decision Center: ${s.message}</div>`}}};function B({title:t,content:s,actions:i="",size:u=""}){S();const a=document.createElement("div");a.className="modal-overlay",a.id="active-modal",a.innerHTML=`
    <div class="modal-content ${u?`modal-${u}`:""}">
      <div class="modal-header">
        <h3 style="margin:0">${t}</h3>
        <button class="btn btn-outline" id="modal-close-x" style="border:none; background:none; font-size:1.5rem; line-height:1; padding:0;">&times;</button>
      </div>
      <div class="modal-body">
        ${s}
      </div>
      ${i?`<div class="modal-footer">${i}</div>`:""}
    </div>
  `,document.body.appendChild(a);const e=document.getElementById("modal-close-x");return e&&e.addEventListener("click",S),a.addEventListener("click",n=>{n.target===a&&S()}),a}function S(){const t=document.getElementById("active-modal");t&&t.remove()}const se={async render(t){t.innerHTML=`
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Jobs Management</h2>
          <span class="badge badge-primary">Historical & Operational Jobs</span>
        </div>
        <button id="btn-new-job" class="btn btn-primary">+ New Job</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <input type="text" id="search-job" class="form-control" placeholder="Search Client / Company..." style="max-width:220px;">
        <select id="filter-month" class="form-control" style="max-width:180px;">
          <option value="">All Months (2026)</option>
          <option value="JAN">January 2026</option>
          <option value="FEB">February 2026</option>
          <option value="MAR">March 2026</option>
          <option value="APR">April 2026</option>
          <option value="MAY">May 2026</option>
          <option value="JUNE">June 2026</option>
          <option value="JULY">July 2026</option>
          <option value="AUG">August 2026</option>
          <option value="SEP">September 2026</option>
          <option value="OCT">October 2026</option>
          <option value="NOV">November 2026</option>
          <option value="DEC">December 2026</option>
        </select>
        <select id="filter-status" class="form-control" style="max-width:150px;">
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="ON_HOLD">ON_HOLD</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="jobs-table-container"></div>
    `;const s=async()=>{var r;const a=document.getElementById("search-job").value.trim().toLowerCase(),e=document.getElementById("filter-month").value,n=document.getElementById("filter-status").value,o=document.getElementById("jobs-table-container");I(o,{loading:!0});try{const d=await b.getJobs();let p=Array.isArray(d.data)?d.data:((r=d.data)==null?void 0:r.jobs)||d.jobs||[];if(a&&(p=p.filter(l=>{const m=(l.Client||l.client||"").toLowerCase(),c=(l.Company||l.company||"").toLowerCase(),E=(l.Location||l.location||"").toLowerCase(),k=(l["Work Type"]||l.workType||"").toLowerCase(),w=(l["Job ID"]||l.jobId||"").toLowerCase();return m.includes(a)||c.includes(a)||E.includes(a)||k.includes(a)||w.includes(a)})),n&&(p=p.filter(l=>(l.Status||l.status)===n)),e&&(p=p.filter(l=>{const m=l["In Date"]||l.inDate||"",c=l["Due Date"]||l.dueDate||"",E=l.Notes||l.notes||"";return(l["Job ID"]||l.jobId||"").toUpperCase().includes(e)||E.toUpperCase().includes(e)||m.includes(e)||c.includes(e)})),e&&p.length===0){I(o,{data:[],emptyMessage:`No historical production data for ${document.getElementById("filter-month").selectedOptions[0].text}.`});return}I(o,{columns:[{label:"Job / Legacy ID",render:l=>`<strong>${l["Job ID"]||l.id||l.jobId||"-"}</strong>`},{label:"Client / Company",render:l=>l.Client||l.Company||l.client||"-"},{label:"Location",render:l=>l.Location||l.location||"-"},{label:"Work Description",render:l=>l["Work Type"]||l.workType||l.Function||"-"},{label:"In Date",render:l=>l["In Date"]||l.inDate||"-"},{label:"Due / Out Date",render:l=>l["Due Date"]||l.dueDate||"-"},{label:"Status",render:l=>{const m=l.Status||l.status||"COMPLETED";return`<span class="badge ${m==="COMPLETED"?"badge-success":m==="CANCELLED"?"badge-danger":"badge-warning"}">${m}</span>`}},{label:"Actions",render:l=>`
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-outline btn-sm btn-view-job" data-id="${l["Job ID"]||l.jobId}">Details</button>
              </div>
            `}],data:p,emptyMessage:"No jobs found matching your filter criteria.",onRowClick:l=>i(l)}),o.querySelectorAll(".btn-view-job").forEach(l=>{l.addEventListener("click",m=>{m.stopPropagation();const c=l.getAttribute("data-id"),E=p.find(k=>(k["Job ID"]||k.jobId)===c);E&&i(E)})})}catch(d){I(o,{error:d.message||d})}},i=async a=>{const e=a["Job ID"]||a.jobId||a.id;let n=[];try{const r=await b.getTasks();n=(r.tasks||r.data&&r.data.tasks||(Array.isArray(r.data)?r.data:[])).filter(p=>(p["Job ID"]||p.jobId)===e)}catch{}const o=`
        <div style="font-size:0.9rem;">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Job / Legacy ID</p>
              <strong style="font-size:1.05rem; color:var(--primary);">${e}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Status</p>
              <span class="badge badge-${(a.Status||"COMPLETED").toLowerCase()}">${a.Status||"COMPLETED"}</span>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Client / Company</p>
              <strong>${a.Client||a.Company||"-"}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Location</p>
              <strong>${a.Location||"-"}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">In Date</p>
              <strong>${a["In Date"]||"-"}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Due / Out Date</p>
              <strong>${a["Due Date"]||"-"}</strong>
            </div>
            <div style="grid-column: span 2;">
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Function & Work Description</p>
              <strong>${a["Work Type"]||a.Function||"-"}</strong>
            </div>
            <div style="grid-column: span 2;">
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Historical Notes & Source Traceability</p>
              <div style="background:var(--bg); padding:0.6rem; border-radius:6px; font-family:monospace; font-size:0.8rem;">
                ${a.Notes||"No additional notes"}
              </div>
            </div>
          </div>

          <h4 style="margin-top:1.2rem; margin-bottom:0.6rem; border-top:1px solid var(--border); padding-top:0.8rem;">
            Assigned Production Stages & Tasks (${n.length})
          </h4>
          <div>
            ${n.length===0?'<p style="color:var(--text-muted); font-size:0.85rem;">No stage task assignments for this job.</p>':`<div class="table-container">
                <table>
                  <thead>
                    <tr><th>Stage</th><th>Assigned Staff</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    ${n.map(r=>`
                      <tr>
                        <td><strong>${r["Task Type"]||r.taskType}</strong></td>
                        <td>${r["Assigned Name"]||r["Assigned To"]||"Unassigned"}</td>
                        <td><span class="badge badge-${(r.Status||"COMPLETED").toLowerCase()}">${r.Status||"COMPLETED"}</span></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>`}
          </div>
        </div>
      `;B({title:`Production Job: ${e}`,content:o,actions:[{label:"Close",class:"btn-secondary",onClick:S}]})},u=()=>{const a=`
        <form id="form-new-job">
          <div class="form-group">
            <label class="form-label">Client / Wedding Company *</label>
            <input type="text" id="new-client" class="form-control" required placeholder="e.g. Iconic Photography">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" id="new-location" class="form-control" placeholder="e.g. Chennai">
            </div>
            <div class="form-group">
              <label class="form-label">Work Type / Function</label>
              <input type="text" id="new-worktype" class="form-control" placeholder="e.g. Highlights + Reel">
            </div>
            <div class="form-group">
              <label class="form-label">In Date</label>
              <input type="date" id="new-indate" class="form-control" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" id="new-duedate" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="new-notes" class="form-control" rows="2" placeholder="System, Link, Camera details..."></textarea>
          </div>
        </form>
      `;B({title:"Create New Production Job",content:a,actions:[{label:"Cancel",class:"btn-secondary",onClick:S},{label:"Create Job",class:"btn-primary",onClick:async()=>{const e=document.getElementById("new-client").value.trim();if(!e){alert("Client name is required.");return}const n=document.getElementById("new-location").value.trim(),o=document.getElementById("new-worktype").value.trim(),r=document.getElementById("new-indate").value,d=document.getElementById("new-duedate").value,p=document.getElementById("new-notes").value.trim();try{await b.createJob({Client:e,Company:e,Location:n,WorkType:o,Function:o,InDate:r,DueDate:d,Notes:p,Status:"IN_PROGRESS"}),T("New job created successfully!","success"),S(),s()}catch(l){alert("Failed to create job: "+l.message)}}}]})};document.getElementById("search-job").addEventListener("input",s),document.getElementById("filter-month").addEventListener("change",s),document.getElementById("filter-status").addEventListener("change",s),document.getElementById("btn-refresh").addEventListener("click",s),document.getElementById("btn-new-job").addEventListener("click",u),s()}},ne={async render(t){t.innerHTML=`
      <div class="page-header">
        <h2>Tasks Management</h2>
        <button id="btn-new-task" class="btn btn-primary">+ New Task</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <select id="filter-status" class="form-control" style="max-width:160px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select id="filter-assignee" class="form-control" style="max-width:200px;">
          <option value="">All Assignees</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="tasks-table-container"></div>
    `,await(async()=>{var a;try{if(D.getRole()!=="EDITOR"){const e=await b.getUsers(),n=Array.isArray(e.data)?e.data:((a=e.data)==null?void 0:a.users)||e.users||[],o=document.getElementById("filter-assignee");o&&n.forEach(r=>{const d=r["User ID"]||r.id||r.userId,p=r.Name||r.name||"User",l=document.createElement("option");l.value=d,l.textContent=`${p} (${r.Department||r.department||"Staff"})`,o.appendChild(l)})}}catch{}})();const i=async()=>{var d;const a=document.getElementById("filter-status").value,e=document.getElementById("filter-assignee")?document.getElementById("filter-assignee").value:"";let n=new URLSearchParams;a&&n.append("status",a),e&&n.append("assignedTo",e);const o=n.toString()?`?${n.toString()}`:"",r=document.getElementById("tasks-table-container");I(r,{loading:!0});try{const p=await b.getTasks(o),l=Array.isArray(p.data)?p.data:((d=p.data)==null?void 0:d.tasks)||p.tasks||[];I(r,{columns:[{label:"Task ID",render:m=>`<strong>${m["Task ID"]||m.id||m.taskId||"-"}</strong>`},{label:"Title",render:m=>`<strong>${m.Title||m.title||"-"}</strong>`},{label:"Type",render:m=>`<span class="badge badge-primary">${m["Task Type"]||m.taskType||"-"}</span>`},{label:"Job ID",render:m=>m["Job ID"]||m.jobId||"-"},{label:"Assigned To",render:m=>m["Assigned Name"]||m.assignedName||m["Assigned To"]||m.assignedTo||"Unassigned"},{label:"Priority",render:m=>{const c=m.Priority||m.priority||"MEDIUM";return`<span class="badge badge-${c}">${c}</span>`}},{label:"Status",render:m=>{const c=m.Status||m.status||"PENDING";return`<span class="badge badge-${c}">${c}</span>`}},{label:"Due Date",render:m=>{const c=m["Due Date"]||m.dueDate;return c?new Date(c).toLocaleDateString():"-"}},{label:"Actions",render:m=>`<button class="btn btn-sm btn-outline edit-btn" data-id="${m["Task ID"]||m.id||m.taskId}">Edit</button>`}],data:l,emptyMessage:'No tasks found. Click "+ New Task" to create one.',onRowClick:m=>u(m["Task ID"]||m.id||m.taskId)}),r.querySelectorAll(".edit-btn").forEach(m=>{m.addEventListener("click",c=>{c.stopPropagation(),u(c.target.dataset.id)})})}catch(p){I(r,{error:p.message})}},u=async(a=null)=>{var P,x;let e={},n=[],o=[];try{if(a){const g=await b.getTask(a);e=g.data&&g.data.task?g.data.task:g.data||g}if(D.canAccess("jobs")){const g=await b.getUsers(),h=await b.getJobs(),$=Array.isArray(g.data)?g.data:((P=g.data)==null?void 0:P.users)||g.users||[],O=Array.isArray(h.data)?h.data:((x=h.data)==null?void 0:x.jobs)||h.jobs||[];n=$.filter(A=>(A.Status||A.status)==="ACTIVE"),o=O.filter(A=>(A.Status||A.status)!=="CANCELLED")}}catch(g){return T(g.message,"error")}const r=D.getRole()==="EDITOR",d=e["Job ID"]||e.jobId||"",p=e["Task Type"]||e.taskType||"HIGHLIGHTS",l=e.Title||e.title||"",m=e["Assigned To"]||e.assignedTo||"",c=e.Priority||e.priority||"MEDIUM",E=e.Status||e.status||"PENDING",k=e["Due Date"]||e.dueDate?(e["Due Date"]||e.dueDate).substring(0,10):"",w=e.Notes||e.notes||"",L=["HIGHLIGHTS","CUT","PRE WED","REEL","TEASER","SYSTEM","DELIVERY","CORRECTION","OTHER"],C=`
        <form id="task-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Job Reference *</label>
              ${a||r?`<input type="text" id="tf-job" class="form-control" value="${d}" disabled>`:`
                <select id="tf-job" class="form-control" required>
                  <option value="">Select Associated Job...</option>
                  ${o.map(g=>{const h=g["Job ID"]||g.id,$=g.Client||g.clientName||"Job";return`<option value="${h}" ${d===h?"selected":""}>${h} - ${$}</option>`}).join("")}
                </select>
              `}
            </div>
            
            <div class="form-group">
              <label class="form-label">Task Type *</label>
              <select id="tf-type" class="form-control" ${r?"disabled":"required"}>
                ${L.map(g=>`<option value="${g}" ${p===g?"selected":""}>${g}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group" style="grid-column: span 2">
              <label class="form-label">Task Title *</label>
              <input type="text" id="tf-title" class="form-control" placeholder="e.g. Color grading highlight reel" value="${l}" ${r?"disabled":"required"}>
            </div>
            
            ${r?"":`
              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select id="tf-assignee" class="form-control">
                  <option value="">Unassigned</option>
                  ${n.map(g=>{const h=g["User ID"]||g.id,$=g.Name||g.name;return`<option value="${h}" ${m===h?"selected":""}>${$} (${g.Department||g.department||"Staff"})</option>`}).join("")}
                </select>
              </div>
            `}
            
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="tf-priority" class="form-control" ${r?"disabled":""}>
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(g=>`<option value="${g}" ${c===g?"selected":""}>${g}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Due Date *</label>
              <input type="date" id="tf-duedate" class="form-control" value="${k}" ${r?"disabled":"required"}>
            </div>
            
            ${a?`
              <div class="form-group">
                <label class="form-label">Status</label>
                <select id="tf-status" class="form-control">
                  ${["PENDING","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"].map(g=>`<option value="${g}" ${E===g?"selected":""}>${g}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          
          <div class="form-group mt-4">
            <label class="form-label">Task Instructions / Notes</label>
            <textarea id="tf-notes" class="form-control" rows="3" placeholder="Additional notes or specifications...">${w}</textarea>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Save Task Record</button>
        </form>
      `;B({title:a?`Edit Task: ${a}`:"Create New Task",content:C,size:"lg"}),document.getElementById("task-form").addEventListener("submit",async g=>{g.preventDefault();try{if(a){const h={Notes:document.getElementById("tf-notes").value.trim()};if(document.getElementById("tf-status")&&(h.Status=document.getElementById("tf-status").value),!r){h.Title=document.getElementById("tf-title").value.trim(),h.TaskType=document.getElementById("tf-type").value,h.Priority=document.getElementById("tf-priority").value,h.DueDate=document.getElementById("tf-duedate").value;const $=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:null;$&&$!==m&&(h.AssignedTo=$)}await b.updateTask(a,h),T("Task updated successfully","success")}else{const h={JobId:document.getElementById("tf-job").value,TaskType:document.getElementById("tf-type").value,Title:document.getElementById("tf-title").value.trim(),Priority:document.getElementById("tf-priority").value,DueDate:document.getElementById("tf-duedate").value,Notes:document.getElementById("tf-notes").value.trim()},$=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:"";$&&(h.AssignedTo=$),await b.createTask(h),T("Task created successfully","success")}S(),i()}catch(h){T(h.message,"error")}})};document.getElementById("btn-new-task")&&document.getElementById("btn-new-task").addEventListener("click",()=>u()),document.getElementById("btn-refresh").addEventListener("click",i),document.getElementById("filter-status").addEventListener("change",i),document.getElementById("filter-assignee")&&document.getElementById("filter-assignee").addEventListener("change",i),i()}},oe={async render(t){t.innerHTML=`
      <div class="page-header">
        <h2>Production Team Overview</h2>
        <span class="badge badge-primary">Staff Workload & Capacity</span>
      </div>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const s=await b.getDecisionCenter(),i=s.data||s||{},u=i.employeeStats||i.employeeWorkload||i.employees||[],a=`
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;document.getElementById("team-content").innerHTML=a,I(document.getElementById("team-table"),{columns:[{label:"Employee",render:e=>`<strong>${e.name||e.userName||"-"}</strong>`},{label:"Department",render:e=>e.department||e.Department||"Video Editing"},{label:"Open Tasks",render:e=>e.openCount??e.openTasks??0},{label:"Completed Tasks",render:e=>e.completedCount??e.completedTasks??0},{label:"Overdue Tasks",render:e=>{const n=e.overdueCount??e.overdueTasks??0;return`<span style="color:${n>0?"var(--danger)":"inherit"}; font-weight:${n>0?"bold":"normal"}">${n}</span>`}},{label:"Capacity",render:e=>e.capacity??40},{label:"Utilization",render:e=>{const n=e.utilizationPercent!==void 0?e.utilizationPercent:e.utilization??0,o=n>=100?"progress-red":n>=80?"progress-orange":"progress-green";return`
              <div style="min-width:120px;">
                <div style="font-size:0.8rem; margin-bottom:2px;">${n}%</div>
                <div class="progress-bar-bg" style="height:6px; margin:0;">
                  <div class="progress-bar-fill ${o}" style="width:${Math.min(n,100)}%;"></div>
                </div>
              </div>
            `}},{label:"Workload Signal",render:e=>{const n=e.signal||(e.utilizationPercent>=100?"OVERLOADED":e.utilizationPercent>=80?"HIGH":"AVAILABLE");return`<span class="badge ${n==="OVERLOADED"?"badge-danger":n==="HIGH"?"badge-warning":"badge-success"}">${n}</span>`}}],data:u,emptyMessage:"No team workload records found.",onRowClick:e=>{window.location.hash="#/tasks"}})}catch(s){const i=typeof s=="object"?s.message||JSON.stringify(s):String(s);document.getElementById("team-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load team data: ${i}</div>`}}},re={async render(t){t.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Payments</h2>
        <button id="btn-new-payment" class="btn btn-primary">+ New Payment</button>
      </div>
      
      <div id="payment-summary" class="grid grid-cols-4 gap-4 mb-4">
        <!-- Summary cards -->
      </div>

      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center;">
        <select id="filter-status" class="form-control" style="max-width:200px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="PAID">PAID</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      
      <div id="payments-table-container"></div>
    `;const s=async()=>{try{const e=(await b.getPaymentSummary()).data;document.getElementById("payment-summary").innerHTML=`
          <div class="card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${e.totalRevenue.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Total Advance</div><div class="stat-value">$${e.totalAdvance.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${e.totalOutstanding.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Pending Count</div><div class="stat-value">${e.pendingCount}</div></div>
        `}catch(a){console.error("Failed to load payment summary",a)}},i=async()=>{const a=document.getElementById("filter-status").value;let e=a?`?status=${a}`:"";const n=document.getElementById("payments-table-container");I(n,{loading:!0});try{const o=await b.getPayments(e);I(n,{columns:[{label:"ID",key:"id"},{label:"Client",key:"clientName"},{label:"Job ID",key:"jobId"},{label:"Amount",render:r=>`$${r.totalAmount.toLocaleString()}`},{label:"Advance",render:r=>`$${r.advancePayment.toLocaleString()}`},{label:"Balance",render:r=>`$${r.balance.toLocaleString()}`},{label:"Status",render:r=>`<span class="badge badge-${r.status}">${r.status}</span>`},{label:"Date",render:r=>new Date(r.dateStr).toLocaleDateString()},{label:"Actions",render:r=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
              `}],data:o.data,onRowClick:r=>u(r.id)}),n.querySelectorAll(".edit-btn").forEach(r=>{r.addEventListener("click",d=>{d.stopPropagation(),u(d.target.dataset.id)})})}catch(o){I(n,{error:o.message})}},u=async(a=null)=>{let e={totalAmount:0,advancePayment:0};if(a)try{e=(await b.getPayment(a)).data}catch(o){return T(o.message,"error")}const n=`
        <form id="payment-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="pf-job" class="form-control" value="${e.jobId||""}" ${a?"disabled":"required"}></div>
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="pf-client" class="form-control" value="${e.clientName||""}" required></div>
            <div class="form-group"><label class="form-label">Total Amount</label><input type="number" step="0.01" id="pf-total" class="form-control" value="${e.totalAmount}" required></div>
            <div class="form-group"><label class="form-label">Advance Payment</label><input type="number" step="0.01" id="pf-advance" class="form-control" value="${e.advancePayment}" required></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="pf-date" class="form-control" value="${e.dateStr?e.dateStr.substring(0,10):new Date().toISOString().substring(0,10)}" required></div>
            ${a?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="pf-status" class="form-control">
                  ${["PENDING","PARTIAL","PAID"].map(o=>`<option value="${o}" ${e.status===o?"selected":""}>${o}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Payment</button>
        </form>
      `;B({title:a?"Edit Payment":"New Payment",content:n}),document.getElementById("payment-form").addEventListener("submit",async o=>{o.preventDefault();const r={clientName:document.getElementById("pf-client").value,totalAmount:parseFloat(document.getElementById("pf-total").value),advancePayment:parseFloat(document.getElementById("pf-advance").value),dateStr:document.getElementById("pf-date").value};a||(r.jobId=document.getElementById("pf-job").value),a&&(r.status=document.getElementById("pf-status").value);try{a?await b.updatePayment(a,r):await b.createPayment(r),T(`Payment ${a?"updated":"created"}`,"success"),S(),s(),i()}catch(d){T(d.message,"error")}})};document.getElementById("btn-new-payment").addEventListener("click",()=>u()),document.getElementById("btn-refresh").addEventListener("click",()=>{s(),i()}),document.getElementById("filter-status").addEventListener("change",i),s(),i()}},ie={render(t){t.innerHTML=`
      <h2>Reports</h2>
      <div class="card mb-4">
        <div style="display:flex; gap:1rem; border-bottom:1px solid var(--border); margin-bottom:1rem; padding-bottom:0.5rem;">
          <button class="btn btn-outline rep-tab active" data-type="monthly">Monthly Overview</button>
          <button class="btn btn-outline rep-tab" data-type="employee">Employee Performance</button>
          <button class="btn btn-outline rep-tab" data-type="worktype">Work Type</button>
        </div>
        
        <div id="report-filters" style="display:flex; gap:1rem; align-items:end; margin-bottom:1rem;">
          <!-- dynamic filters -->
        </div>
        
        <button id="btn-load-report" class="btn btn-primary">Load Report</button>
      </div>
      
      <div class="card">
        <div id="report-results">Please select parameters and load report.</div>
      </div>
    `;let s="monthly";const i=()=>{const a=document.getElementById("report-filters");if(s==="monthly"){const e=new Date;a.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Year</label><input type="number" id="rf-year" class="form-control" value="${e.getFullYear()}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">Month</label>
            <select id="rf-month" class="form-control">
              ${Array.from({length:12},(n,o)=>`<option value="${o+1}" ${e.getMonth()===o?"selected":""}>${new Date(2e3,o,1).toLocaleString("default",{month:"long"})}</option>`).join("")}
            </select>
          </div>
        `}else{const e=new Date().toISOString().substring(0,10),n=new Date(Date.now()-30*24*60*60*1e3).toISOString().substring(0,10);a.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Start Date</label><input type="date" id="rf-start" class="form-control" value="${n}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">End Date</label><input type="date" id="rf-end" class="form-control" value="${e}"></div>
        `}},u=async()=>{const a=document.getElementById("report-results");a.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{let e;if(s==="monthly"){const n=document.getElementById("rf-year").value,o=document.getElementById("rf-month").value;e=await b.getMonthlyReport(n,o),a.innerHTML=`
            <h3>Summary for ${n}-${o.padStart(2,"0")}</h3>
            <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
              <div class="card"><div class="stat-title">Completed Jobs</div><div class="stat-value">${e.data.summary.completedJobs}</div></div>
              <div class="card"><div class="stat-title">New Jobs</div><div class="stat-value">${e.data.summary.newJobs}</div></div>
              <div class="card"><div class="stat-title">Revenue Received</div><div class="stat-value">$${e.data.summary.revenueReceived.toLocaleString()}</div></div>
            </div>
            <h4>Jobs Breakdown</h4>
            <div id="rep-table"></div>
          `,I(document.getElementById("rep-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Work Type",key:"workType"},{label:"Status",key:"status"}],data:e.data.jobs})}else if(s==="employee"){const n=document.getElementById("rf-start").value,o=document.getElementById("rf-end").value;e=await b.getEmployeePerformanceReport(n,o),a.innerHTML=`<h3>Employee Performance (${n} to ${o})</h3><div id="rep-table" class="mt-4"></div>`,I(document.getElementById("rep-table"),{columns:[{label:"Employee ID",key:"employeeId"},{label:"Tasks Completed",key:"completedTasks"},{label:"Overdue Tasks",key:"overdueTasks"}],data:e.data})}else if(s==="worktype"){const n=document.getElementById("rf-start").value,o=document.getElementById("rf-end").value;e=await b.getWorkTypeReport(n,o),a.innerHTML=`<h3>Work Type Summary (${n} to ${o})</h3><div id="rep-table" class="mt-4"></div>`,I(document.getElementById("rep-table"),{columns:[{label:"Work Type",key:"workType"},{label:"Total Jobs",key:"count"},{label:"Total Value",render:r=>`$${r.totalValue.toLocaleString()}`}],data:e.data})}}catch(e){a.innerHTML=`<div style="color:var(--danger)">Error: ${e.message}</div>`}};document.querySelectorAll(".rep-tab").forEach(a=>{a.addEventListener("click",e=>{document.querySelectorAll(".rep-tab").forEach(n=>n.classList.remove("active")),e.target.classList.add("active"),s=e.target.dataset.type,i(),document.getElementById("report-results").innerHTML="Please select parameters and load report."})}),document.getElementById("btn-load-report").addEventListener("click",u),i()}},le={async render(t){t.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Users</h2>
        <button id="btn-new-user" class="btn btn-primary">+ New User</button>
      </div>
      <div id="users-table-container"></div>
    `;const s=async()=>{const e=document.getElementById("users-table-container");I(e,{loading:!0});try{const n=await b.getUsers();I(e,{columns:[{label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},{label:"Role",render:o=>`<span class="badge badge-IN_PROGRESS">${o.role}</span>`},{label:"Department",key:"department"},{label:"Capacity",key:"capacity"},{label:"Status",render:o=>`<span class="badge badge-${o.status}">${o.status}</span>`},{label:"Actions",render:o=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${o.id}">Edit</button>
                <button class="btn btn-sm btn-outline pw-btn" data-id="${o.id}">Reset PW</button>
                ${o.status==="ACTIVE"?`<button class="btn btn-sm btn-danger deact-btn" data-id="${o.id}">Deactivate</button>`:`<button class="btn btn-sm btn-success act-btn" data-id="${o.id}">Activate</button>`}
              `}],data:n.data}),e.querySelectorAll(".edit-btn").forEach(o=>o.addEventListener("click",r=>a(r.target.dataset.id))),e.querySelectorAll(".pw-btn").forEach(o=>o.addEventListener("click",r=>u(r.target.dataset.id))),e.querySelectorAll(".deact-btn").forEach(o=>o.addEventListener("click",r=>i(r.target.dataset.id,!1))),e.querySelectorAll(".act-btn").forEach(o=>o.addEventListener("click",r=>i(r.target.dataset.id,!0)))}catch(n){I(e,{error:n.message})}},i=async(e,n)=>{try{n?await b.activateUser(e):await b.deactivateUser(e),T(`User ${n?"activated":"deactivated"}`,"success"),s()}catch(o){T(o.message,"error")}},u=e=>{B({title:"Reset Password",content:`
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="pw-new" class="form-control" required></div>
          <button id="btn-reset-pw" class="btn btn-primary w-full mt-4">Update Password</button>
        `}),document.getElementById("btn-reset-pw").addEventListener("click",async()=>{const n=document.getElementById("pw-new").value;if(!n)return T("Password required","warning");try{await b.resetPassword(e,n),T("Password updated","success"),S()}catch(o){T(o.message,"error")}})},a=async(e=null)=>{let n={capacity:10,role:"EDITOR"};if(e)try{n=(await b.getUser(e)).data}catch(r){return T(r.message,"error")}const o=`
        <form id="user-form">
          <div class="form-group"><label class="form-label">Name</label><input type="text" id="uf-name" class="form-control" value="${n.name||""}" required></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" id="uf-email" class="form-control" value="${n.email||""}" ${e?"disabled":"required"}></div>
          ${e?"":'<div class="form-group"><label class="form-label">Password</label><input type="password" id="uf-pw" class="form-control" required></div>'}
          <div class="form-group"><label class="form-label">Role</label>
            <select id="uf-role" class="form-control">
              ${["ADMIN","MANAGER","EDITOR","VIEWER"].map(r=>`<option value="${r}" ${n.role===r?"selected":""}>${r}</option>`).join("")}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Department</label><input type="text" id="uf-dept" class="form-control" value="${n.department||""}"></div>
          <div class="form-group"><label class="form-label">Capacity (Max open tasks)</label><input type="number" id="uf-cap" class="form-control" value="${n.capacity}" required></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save User</button>
        </form>
      `;B({title:e?"Edit User":"New User",content:o}),document.getElementById("user-form").addEventListener("submit",async r=>{r.preventDefault();const d={name:document.getElementById("uf-name").value,role:document.getElementById("uf-role").value,department:document.getElementById("uf-dept").value,capacity:parseInt(document.getElementById("uf-cap").value)};try{e?(await b.updateUser(e,d),d.role!==n.role&&await b.changeRole(e,d.role),T("User updated","success")):(d.email=document.getElementById("uf-email").value,d.password=document.getElementById("uf-pw").value,await b.createUser(d),T("User created","success")),S(),s()}catch(p){T(p.message,"error")}})};document.getElementById("btn-new-user").addEventListener("click",()=>a()),s()}},de={async render(t){t.innerHTML=`
      <h2>Audit Log</h2>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center;">
        <select id="filter-module" class="form-control" style="max-width:200px;">
          <option value="">All Modules</option>
          <option value="JOBS">JOBS</option>
          <option value="TASKS">TASKS</option>
          <option value="PAYMENTS">PAYMENTS</option>
          <option value="USERS">USERS</option>
        </select>
        <select id="filter-action" class="form-control" style="max-width:200px;">
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="audit-table-container"></div>
    `;const s=async()=>{const i=document.getElementById("filter-module").value,u=document.getElementById("filter-action").value;let a="?";i&&(a+=`module=${i}&`),u&&(a+=`action=${u}`);const e=document.getElementById("audit-table-container");I(e,{loading:!0});try{const n=await b.getAuditLog(a);I(e,{columns:[{label:"Timestamp",render:o=>new Date(o.timestamp).toLocaleString()},{label:"User",key:"userName"},{label:"Action",key:"action"},{label:"Module",key:"module"},{label:"Record ID",key:"recordId"},{label:"Changes",render:o=>o.action==="UPDATE"&&o.changes?`<div style="font-size:0.75rem; max-width:300px; overflow-x:auto;">
                  ${Object.entries(o.changes).map(([r,d])=>`${r}: ${d.old} → ${d.new}`).join("<br>")}
                </div>`:"-"}],data:n.data})}catch(n){I(e,{error:n.message})}};document.getElementById("btn-refresh").addEventListener("click",s),document.getElementById("filter-module").addEventListener("change",s),document.getElementById("filter-action").addEventListener("change",s),s()}},ce={async render(t){t.innerHTML=`
      <h2>Settings</h2>
      
      <div class="card mb-4">
        <h3>System Status</h3>
        <div class="mt-4" style="display:flex; gap:1rem;">
          <button id="btn-test-db" class="btn btn-outline">Test Database Connection</button>
          <button id="btn-discover" class="btn btn-outline">Discover Sheets</button>
        </div>
        <pre id="sys-output" style="margin-top:1rem; padding:1rem; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius); display:none; white-space:pre-wrap;"></pre>
      </div>
      
      <div class="card">
        <h3>Application Settings</h3>
        <div id="settings-form-container" class="mt-4">
          <div class="loader-container"><div class="loader"></div></div>
        </div>
      </div>
    `;const s=document.getElementById("sys-output");document.getElementById("btn-test-db").addEventListener("click",async()=>{s.style.display="block",s.textContent="Testing connection...";try{const i=await b.testDbConnection();s.textContent=JSON.stringify(i.data,null,2)}catch(i){s.textContent=`Error: ${i.message}`}}),document.getElementById("btn-discover").addEventListener("click",async()=>{s.style.display="block",s.textContent="Discovering sheets...";try{const i=await b.discoverSheets();s.textContent=JSON.stringify(i.data,null,2)}catch(i){s.textContent=`Error: ${i.message}`}});try{const u=(await b.getSettings()).data;let a='<form id="settings-form" class="grid grid-cols-2 gap-4">';for(const[e,n]of Object.entries(u))a+=`
          <div class="form-group">
            <label class="form-label">${e}</label>
            <input type="text" name="${e}" class="form-control" value="${n}">
          </div>
        `;a+='<div style="grid-column: span 2"><button type="submit" class="btn btn-primary">Save Settings</button></div>',a+="</form>",document.getElementById("settings-form-container").innerHTML=a,document.getElementById("settings-form").addEventListener("submit",async e=>{e.preventDefault();const n=new FormData(e.target),o=Object.fromEntries(n.entries());try{await b.updateSettings(o),T("Settings saved successfully","success")}catch(r){T(r.message,"error")}})}catch(i){document.getElementById("settings-form-container").innerHTML=`<div style="color:var(--danger)">Error loading settings: ${i.message}</div>`}}};document.getElementById("app");const me={"/login":{page:te},"/":{page:F,module:"dashboard"},"/decision-center":{page:ae,module:"decision-center"},"/jobs":{page:se,module:"jobs"},"/tasks":{page:ne,module:"tasks"},"/team":{page:oe,module:"team"},"/payments":{page:re,module:"payments"},"/reports":{page:ie,module:"reports"},"/users":{page:le,module:"users"},"/audit":{page:de,module:"audit"},"/settings":{page:ce,module:"settings"},"*":{page:F,module:"dashboard"}};function V(t,s){if(!t||!s)return;const i=t.page||t.render;i&&typeof i.render=="function"?i.render(s):typeof i=="function"&&i(s)}async function _(){const t=document.getElementById("app");if(t){try{const s=await b.getMe(),i=s.user||s.data&&s.data.user||s.data;i&&D.setUser(i)}catch{D.clearUser()}if(!document.getElementById("toast-container")){const s=document.createElement("div");s.id="toast-container",document.body.appendChild(s)}q.onRoute(s=>{if(!D.isAuthenticated())t.innerHTML="",V(s,t);else{ee(t,D.getUser());const i=document.getElementById("page-content");i&&(i.innerHTML="",V(s,i))}}),q.init(me)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_();

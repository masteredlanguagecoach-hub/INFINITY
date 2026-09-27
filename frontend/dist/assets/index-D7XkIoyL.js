(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))d(l);new MutationObserver(l=>{for(const e of l)if(e.type==="childList")for(const t of e.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&d(t)}).observe(document,{childList:!0,subtree:!0});function o(l){const e={};return l.integrity&&(e.integrity=l.integrity),l.referrerPolicy&&(e.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?e.credentials="include":l.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function d(l){if(l.ep)return;l.ep=!0;const e=o(l);fetch(l.href,e)}})();const G="/api",x="pdc_token",H="pdc_user";function z(){try{return localStorage.getItem(x)}catch{return null}}function M(a){try{a?localStorage.setItem(x,a):localStorage.removeItem(x)}catch{}}function P(a){try{a?localStorage.setItem(H,JSON.stringify(a)):localStorage.removeItem(H)}catch{}}async function b(a,n={}){const o=`${G}${a}`,d=z(),l={"Content-Type":"application/json",...n.headers};d&&(l.Authorization=`Bearer ${d}`,l["x-auth-token"]=d);const e={credentials:"include",...n,headers:l};try{const t=await fetch(o,e);let s;try{s=await t.json()}catch{if(!t.ok)throw new Error(`HTTP Error: ${t.status}`);return null}if(!t.ok||s.success===!1){t.status===401&&a!=="/auth/login"&&(M(null),P(null));const r=s.error;let i="Request failed",p=null;r?typeof r=="string"?i=r:typeof r=="object"&&(i=r.message||r.error||r.code||JSON.stringify(r),p=r.code||null):s.message?i=typeof s.message=="string"?s.message:JSON.stringify(s.message):i=`Request failed (${t.status})`,typeof i=="object"&&(i=JSON.stringify(i));const E=new Error(String(i));throw E.code=p,E.statusCode=t.status,E}return s}catch(t){throw console.error(`API Error on ${a}:`,t.message||t),t}}const g={login:async(a,n)=>{const o=await b("/auth/login",{method:"POST",body:JSON.stringify({email:a.trim(),password:n})}),d=o.token||o.data&&o.data.token,l=o.user||o.data&&o.data.user||o.data;return d&&M(d),l&&P(l),o},logout:async()=>{try{await b("/auth/logout",{method:"POST"})}finally{M(null),P(null)}},getMe:async()=>{const a=await b("/auth/me"),n=a.user||a.data&&a.data.user||a.data;return n&&P(n),a},getDashboard:()=>b("/dashboard"),getDecisionCenter:()=>b("/decision-center"),getJobs:(a="")=>b(`/jobs${a}`),getJob:a=>b(`/jobs/${a}`),createJob:a=>b("/jobs",{method:"POST",body:JSON.stringify(a)}),updateJob:(a,n)=>b(`/jobs/${a}`,{method:"PUT",body:JSON.stringify(n)}),deleteJob:a=>b(`/jobs/${a}`,{method:"DELETE"}),getTasks:(a="")=>b(`/tasks${a}`),getTask:a=>b(`/tasks/${a}`),createTask:a=>b("/tasks",{method:"POST",body:JSON.stringify(a)}),updateTask:(a,n)=>b(`/tasks/${a}`,{method:"PUT",body:JSON.stringify(n)}),assignTask:(a,n)=>b(`/tasks/${a}/assign`,{method:"POST",body:JSON.stringify(n)}),getUsers:()=>b("/users"),getUser:a=>b(`/users/${a}`),createUser:a=>b("/users",{method:"POST",body:JSON.stringify(a)}),updateUser:(a,n)=>b(`/users/${a}`,{method:"PUT",body:JSON.stringify(n)}),activateUser:a=>b(`/users/${a}/activate`,{method:"POST"}),deactivateUser:a=>b(`/users/${a}/deactivate`,{method:"POST"}),changeRole:(a,n)=>b(`/users/${a}/role`,{method:"POST",body:JSON.stringify({role:n,newRole:n})}),resetPassword:(a,n)=>b(`/users/${a}/reset-password`,{method:"POST",body:JSON.stringify({password:n,newPassword:n})}),getPayments:(a="")=>b(`/payments${a}`),getPayment:a=>b(`/payments/${a}`),createPayment:a=>b("/payments",{method:"POST",body:JSON.stringify(a)}),updatePayment:(a,n)=>b(`/payments/${a}`,{method:"PUT",body:JSON.stringify(n)}),getPaymentSummary:()=>b("/payments/summary"),getMonthlyReport:(a,n)=>b(`/reports/monthly?year=${a}&month=${n}`),getEmployeePerformanceReport:(a,n)=>b(`/reports/employee-performance?startDate=${a}&endDate=${n}`),getWorkTypeReport:(a,n)=>b(`/reports/work-type?startDate=${a}&endDate=${n}`),getDepartmentReport:(a,n)=>b(`/reports/department?startDate=${a}&endDate=${n}`),getAuditLog:(a="")=>b(`/audit${a}`),getSettings:()=>b("/settings"),updateSettings:a=>b("/settings",{method:"PUT",body:JSON.stringify(a)}),testDbConnection:()=>b("/settings/db-test"),discoverSheets:()=>b("/settings/discover-sheets")};let w=null;const V={ADMIN:["dashboard","decision-center","jobs","tasks","team","payments","reports","users","audit","settings"],MANAGER:["dashboard","decision-center","jobs","tasks","team","payments","reports","audit"],TEAM_LEADER:["dashboard","decision-center","jobs","tasks","team"],EDITOR:["dashboard","tasks","jobs","team"],DATA_ENTRY:["jobs","tasks"],VIEWER:["dashboard","decision-center","reports"]},T={getUser:()=>w,setUser:a=>{w=a},clearUser:()=>{w=null},isAuthenticated:()=>!!w,getRole:()=>(w==null?void 0:w.role)||null,canAccess:a=>!w||!w.role?!1:w.role==="ADMIN"?!0:(V[w.role]||[]).includes(a)};let j={},R=null;const O={init(a){j=a,window.addEventListener("hashchange",()=>this.handleHashChange()),this.handleHashChange()},navigate(a){const n=a.startsWith("#")?a:"#"+a;window.location.hash===n?this.handleHashChange():window.location.hash=n},onRoute(a){R=a},handleHashChange(){let a=window.location.hash;a.startsWith("#")&&(a=a.slice(1));const n=(a||"/").split("?")[0];if(!T.isAuthenticated()&&n!=="/login"){this.navigate("/login");return}if(T.isAuthenticated()&&n==="/login"){this.navigate("/");return}let o=j[n]||j["*"];if(o){if(o.module&&!T.canAccess(o.module)){console.warn(`Access denied to module ${o.module}`),this.navigate("/");return}R&&R(o)}}};function _(a,n){if(document.getElementById("sidebar"))return;const d=[{name:"Dashboard",path:"#/",module:"dashboard",icon:"📊"},{name:"Decision Center",path:"#/decision-center",module:"decision-center",icon:"🎯"},{name:"Jobs",path:"#/jobs",module:"jobs",icon:"💼"},{name:"Tasks",path:"#/tasks",module:"tasks",icon:"📋"},{name:"Team",path:"#/team",module:"team",icon:"👥"},{name:"Payments",path:"#/payments",module:"payments",icon:"💰"},{name:"Reports",path:"#/reports",module:"reports",icon:"📈"},{name:"Users",path:"#/users",module:"users",icon:"⚙️"},{name:"Audit Log",path:"#/audit",module:"audit",icon:"📝"},{name:"Settings",path:"#/settings",module:"settings",icon:"🔧"}].filter(t=>T.canAccess(t.module));a.innerHTML=`
    <div id="sidebar">
      <div class="sidebar-header">PDC Center</div>
      <nav class="sidebar-nav">
        ${d.map(t=>`
          <a href="${t.path}" class="nav-link" data-path="${t.path}">
            ${t.icon} ${t.name}
          </a>
        `).join("")}
      </nav>
    </div>
    <div id="main-wrapper">
      <header id="header">
        <button id="menu-toggle">☰</button>
        <div class="header-right" style="display:flex; gap:1rem; align-items:center;">
          <span class="user-info">${n?n.name||n.Name||n.email||"User":""} (${n?n.role||n.Role||"ADMIN":""})</span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
        </div>

      </header>
      <main id="page-content"></main>
    </div>
  `;const l=()=>{const t=window.location.hash||"#/";document.querySelectorAll(".nav-link").forEach(s=>{s.getAttribute("href")===t?s.classList.add("active"):s.classList.remove("active")})};window.addEventListener("hashchange",l),l();const e=document.getElementById("sidebar");document.getElementById("menu-toggle").addEventListener("click",()=>{e.classList.toggle("open")}),document.getElementById("main-wrapper").addEventListener("click",t=>{window.innerWidth<=768&&t.target.id!=="menu-toggle"&&e.classList.remove("open")}),document.getElementById("logout-btn").addEventListener("click",async()=>{try{await g.logout()}catch(t){console.error(t)}T.clearUser(),window.location.hash="#/login",window.location.reload()})}function h(a,n="info"){const o=document.getElementById("toast-container");if(!o)return;const d=document.createElement("div");d.className=`toast toast-${n}`,d.textContent=a,o.appendChild(d),setTimeout(()=>{d.style.opacity="0",d.style.transition="opacity 0.3s ease",setTimeout(()=>d.remove(),300)},4e3)}const F={render(a){a.innerHTML=`
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
    `;const n=document.getElementById("login-form"),o=document.getElementById("toggle-pw"),d=document.getElementById("password"),l=document.getElementById("login-error"),e=document.getElementById("submit-btn");o.addEventListener("click",()=>{d.type==="password"?d.type="text":d.type="password"}),n.addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("email").value.trim(),r=d.value;l.style.display="none",e.disabled=!0,e.innerHTML='<span class="loader-sm"></span> Signing In...';try{const i=await g.login(s,r),p=i.user||i.data&&i.data.user||i.data;if(p)T.setUser(p),O.navigate("/");else throw new Error("Invalid login response from server")}catch(i){let p="Authentication failed. Please check your credentials.";i&&(typeof i.message=="string"&&i.message.trim()&&i.message!=="[object Object]"?p=i.message:typeof i.error=="string"?p=i.error:typeof i=="string"&&(p=i)),l.textContent=p,l.style.display="block",e.disabled=!1,e.innerHTML="<span>Sign In to Dashboard</span>"}})}},J={async render(a){a.innerHTML=`
      <div class="page-header">
        <h2>Executive Dashboard</h2>
        <span class="badge badge-success">Live Google Sheets Sync</span>
      </div>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const n=await g.getDashboard(),o=n&&n.data?n.data:n||{},d=o.kpis||{totalJobs:o.totalJobs||0,openTasks:o.openTasks||0,completedTasks:o.completedTasks||0,overdueTasks:o.overdueTasks||0,completionRate:o.completionRate||0,activeEmployees:o.activeEmployees||0,overloadedEmployees:o.overloadedEmployees||0,pendingPayments:o.pendingPayments||0,revenue:o.totalRevenue||o.revenue||0,outstandingBalance:o.outstandingBalance||0},l=o.taskStatusDist||o.taskStatusDistribution||{},e=o.workTypeDist||o.workTypeDistribution||{},t=o.employeeWorkload||o.workloadByEmployee||[],s=o.recentActivity||[],r=`
        <div class="dashboard-grid">
          <div class="card stat-card"><div class="stat-title">Total Jobs</div><div class="stat-value">${d.totalJobs??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Open Tasks</div><div class="stat-value">${d.openTasks??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Completed Tasks</div><div class="stat-value" style="color:var(--success)">${d.completedTasks??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Overdue Tasks</div><div class="stat-value" style="color:var(--danger)">${d.overdueTasks??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Completion Rate</div><div class="stat-value">${d.completionRate??0}%</div></div>
          <div class="card stat-card"><div class="stat-title">Active Employees</div><div class="stat-value">${d.activeEmployees??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Overloaded Staff</div><div class="stat-value" style="color:${(d.overloadedEmployees||0)>0?"var(--danger)":"inherit"}">${d.overloadedEmployees??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Pending Payments</div><div class="stat-value">${d.pendingPayments??0}</div></div>
          <div class="card stat-card"><div class="stat-title">Total Revenue</div><div class="stat-value" style="color:var(--primary)">$${(d.revenue||0).toLocaleString()}</div></div>
          <div class="card stat-card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${(d.outstandingBalance||0).toLocaleString()}</div></div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="card">
            <h3>Task Status Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.keys(l).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No task data recorded yet.</p>':Object.entries(l).map(([i,p])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span class="badge badge-${i}">${i}</span>
                  <strong>${p}</strong>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="card">
            <h3>Work Type Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.keys(e).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No jobs recorded yet.</p>':Object.entries(e).map(([i,p])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span>${i}</span>
                  <strong>${p}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <h3>Workload by Employee</h3>
          <div style="margin-top:1rem;">
            ${t.length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No active employees found.</p>':t.map(i=>{const p=i.utilization!==void 0?i.utilization:i.capacity>0?Math.round((i.open||i.openTasks||0)/i.capacity*100):0,E=i.openTasks!==void 0?i.openTasks:i.open||0,c=p>=100?"progress-red":p>=80?"progress-orange":"progress-green";return`
                  <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.3rem;">
                      <span><strong>${i.name}</strong></span>
                      <span>${p}% (${E} / ${i.capacity||40} tasks)</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill ${c}" style="width: ${Math.min(p,100)}%;"></div>
                    </div>
                  </div>
                `}).join("")}
          </div>
        </div>
        
        <div class="card">
          <h3>Recent Operational Activity</h3>
          <div style="margin-top:1rem;">
            ${s.length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No audit activities recorded yet.</p>':s.map(i=>`
                <div style="padding:0.6rem 0; border-bottom:1px solid var(--border); font-size:0.875rem; display:flex; justify-content:space-between;">
                  <div>
                    <strong>${i.userName||"System"}</strong>
                    <span style="color:var(--text-muted)"> ${i.action} ${i.module||""} ${i.recordId?`[${i.recordId}]`:""}</span>
                  </div>
                  <span style="color:var(--text-muted); font-size:0.8rem;">${i.timestamp?new Date(i.timestamp).toLocaleString():""}</span>
                </div>
              `).join("")}
          </div>
        </div>
      `;document.getElementById("dash-content").innerHTML=r}catch(n){document.getElementById("dash-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load dashboard: ${n.message}</div>`}}};function $(a,{columns:n,data:o,loading:d,error:l,onRowClick:e,emptyMessage:t="No records found"}){if(d){a.innerHTML='<div class="loader-container"><div class="loader"></div></div>';return}if(l){a.innerHTML=`<div style="color:var(--danger); padding: 1rem;">Error loading data: ${l}</div>`;return}let s=[];if(Array.isArray(o)?s=o:o&&typeof o=="object"&&(s=o.items||o.jobs||o.tasks||o.users||o.payments||o.logs||o.report||o.employeeStats||[]),!s||s.length===0){a.innerHTML=`<div style="padding: 2.5rem 1rem; color: var(--text-muted); text-align: center; font-size: 0.9rem;">${t}</div>`;return}const r=document.createElement("div");r.className="table-container table-responsive-mobile";const i=document.createElement("table"),p=document.createElement("thead"),E=document.createElement("tr");n.forEach(u=>{const m=document.createElement("th");m.textContent=u.label,E.appendChild(m)}),p.appendChild(E),i.appendChild(p);const c=document.createElement("tbody");s.forEach((u,m)=>{const y=document.createElement("tr");e&&(y.classList.add("clickable"),y.addEventListener("click",k=>{k.target.tagName.toLowerCase()==="button"||k.target.closest("button")||k.target.tagName.toLowerCase()==="a"||e(u)})),n.forEach(k=>{const L=document.createElement("td");if(L.setAttribute("data-label",k.label),k.render)L.innerHTML=k.render(u,m);else{const I=k.key&&u[k.key]!==void 0?u[k.key]:k.label&&u[k.label]!==void 0?u[k.label]:"";L.textContent=I??""}y.appendChild(L)}),c.appendChild(y)}),i.appendChild(c),r.appendChild(i),a.innerHTML="",a.appendChild(r)}const Y={async render(a){a.innerHTML=`
      <div class="page-header">
        <h2>Decision Center</h2>
        <span class="badge badge-primary">Operational Intelligence</span>
      </div>
      <div id="dc-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const n=await g.getDecisionCenter(),o=n&&n.data?n.data:n||{},d=o.insights||{},l=o.employeeStats||o.employeeWorkload||o.employees||[],e=o.alerts||[];let t="";e&&e.length>0&&(t+=`
          <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <h3 style="color:var(--danger)">⚠️ Action Required</h3>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
              ${e.map(u=>`<li>${u}</li>`).join("")}
            </ul>
          </div>
        `);const s=d.highestWorkloadEmployee,r=s&&typeof s=="object"&&s.name?`${s.name} (${s.utilizationPercent??s.utilization??0}%)`:typeof s=="string"?s:"None",i=d.highestOverdueEmployee,p=i&&typeof i=="object"&&i.name?`${i.name} (${i.overdueCount??i.overdueTasks??0} overdue)`:typeof i=="string"?i:"None",E=d.highestBacklogTaskType||"None",c=d.bottleneckDepartments&&d.bottleneckDepartments.length>0?d.bottleneckDepartments.join(", "):"None";t+=`
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
            <div class="stat-value" style="font-size:1.15rem; color:var(--primary);">${E}</div>
          </div>
          <div class="card">
            <div class="stat-title">Bottleneck Depts</div>
            <div class="stat-value" style="font-size:1.15rem; color:${c!=="None"?"var(--warning)":"inherit"};">${c}</div>
          </div>
        </div>
      `,t+=`
        <div class="card mb-4">
          <h3>Employee Workload & Capacity Signals</h3>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem;">
            🟢 <strong>AVAILABLE</strong> (&lt;80%) &nbsp;|&nbsp; 
            🟠 <strong>HIGH</strong> (80-99%) &nbsp;|&nbsp; 
            🔴 <strong>OVERLOADED</strong> (≥100%)
          </p>
          <div id="emp-table-container"></div>
        </div>
      `,document.getElementById("dc-content").innerHTML=t,$(document.getElementById("emp-table-container"),{columns:[{label:"Employee",render:u=>`<strong>${u.name||u.userName||"-"}</strong>`},{label:"Department",render:u=>u.department||u.Department||"-"},{label:"Open Tasks",render:u=>u.openCount??u.openTasks??0},{label:"Completed",render:u=>u.completedCount??u.completedTasks??0},{label:"Overdue",render:u=>{const m=u.overdueCount??u.overdueTasks??0;return m>0?`<span style="color:var(--danger);font-weight:bold;">${m}</span>`:"0"}},{label:"Capacity",render:u=>u.capacity??40},{label:"Utilization",render:u=>{const m=u.utilizationPercent!==void 0?u.utilizationPercent:u.utilization??0,y=m>=100?"progress-red":m>=80?"progress-orange":"progress-green";return`
              <div style="min-width:120px;">
                <div style="font-size:0.8rem; margin-bottom:2px;">${m}%</div>
                <div class="progress-bar-bg" style="height:6px;">
                  <div class="progress-bar-fill ${y}" style="width:${Math.min(m,100)}%;"></div>
                </div>
              </div>
            `}},{label:"Signal",render:u=>{const m=u.signal||(u.utilizationPercent>=100?"OVERLOADED":u.utilizationPercent>=80?"HIGH":"AVAILABLE");return`<span class="badge ${m==="OVERLOADED"?"badge-danger":m==="HIGH"?"badge-warning":"badge-success"}">${m}</span>`}}],data:l,emptyMessage:"No employee workload records found."})}catch(n){document.getElementById("dc-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load Decision Center: ${n.message}</div>`}}};function A({title:a,content:n,actions:o="",size:d=""}){S();const l=document.createElement("div");l.className="modal-overlay",l.id="active-modal",l.innerHTML=`
    <div class="modal-content ${d?`modal-${d}`:""}">
      <div class="modal-header">
        <h3 style="margin:0">${a}</h3>
        <button class="btn btn-outline" id="modal-close-x" style="border:none; background:none; font-size:1.5rem; line-height:1; padding:0;">&times;</button>
      </div>
      <div class="modal-body">
        ${n}
      </div>
      ${o?`<div class="modal-footer">${o}</div>`:""}
    </div>
  `,document.body.appendChild(l);const e=document.getElementById("modal-close-x");return e&&e.addEventListener("click",S),l.addEventListener("click",t=>{t.target===l&&S()}),l}function S(){const a=document.getElementById("active-modal");a&&a.remove()}function K({title:a,message:n,onConfirm:o}){A({title:a,content:`<p>${n}</p>`,actions:`
      <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Confirm</button>
    `}),document.getElementById("confirm-cancel").addEventListener("click",S),document.getElementById("confirm-ok").addEventListener("click",()=>{S(),o&&o()})}const X={async render(a){a.innerHTML=`
      <div class="page-header">
        <h2>Jobs Management</h2>
        <button id="btn-new-job" class="btn btn-primary">+ New Job</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <input type="text" id="search-job" class="form-control" placeholder="Search Client / Company..." style="max-width:240px;">
        <select id="filter-status" class="form-control" style="max-width:160px;">
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select id="filter-priority" class="form-control" style="max-width:160px;">
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="jobs-table-container"></div>
    `;const n=async()=>{var E;const e=document.getElementById("search-job").value.trim(),t=document.getElementById("filter-status").value,s=document.getElementById("filter-priority").value;let r=new URLSearchParams;e&&r.append("search",e),t&&r.append("status",t),s&&r.append("priority",s);const i=r.toString()?`?${r.toString()}`:"",p=document.getElementById("jobs-table-container");$(p,{loading:!0});try{const c=await g.getJobs(i),u=Array.isArray(c.data)?c.data:((E=c.data)==null?void 0:E.jobs)||c.jobs||[];$(p,{columns:[{label:"Job ID",render:m=>`<strong>${m["Job ID"]||m.id||m.jobId||"-"}</strong>`},{label:"Client",render:m=>m.Client||m.clientName||m.client||"-"},{label:"Company",render:m=>m.Company||m.companyName||m.company||"-"},{label:"Work Type",render:m=>m["Work Type"]||m.workType||"-"},{label:"Priority",render:m=>{const y=m.Priority||m.priority||"MEDIUM";return`<span class="badge badge-${y}">${y}</span>`}},{label:"Status",render:m=>{const y=m.Status||m.status||"NEW";return`<span class="badge badge-${y}">${y}</span>`}},{label:"Due Date",render:m=>{const y=m["Due Date"]||m.dueDate;return y?new Date(y).toLocaleDateString():"-"}},{label:"Actions",render:m=>{const y=m["Job ID"]||m.id||m.jobId;return`
                <div style="display:flex;gap:0.5rem;">
                  <button class="btn btn-sm btn-outline edit-btn" data-id="${y}">Edit</button>
                  <button class="btn btn-sm btn-danger del-btn" data-id="${y}">Del</button>
                </div>
              `}}],data:u,emptyMessage:'No jobs found. Click "+ New Job" to create your first job.',onRowClick:m=>d(m["Job ID"]||m.id||m.jobId)}),p.querySelectorAll(".edit-btn").forEach(m=>{m.addEventListener("click",y=>{y.stopPropagation(),l(y.target.dataset.id)})}),p.querySelectorAll(".del-btn").forEach(m=>{m.addEventListener("click",y=>{y.stopPropagation(),o(y.target.dataset.id)})})}catch(c){$(p,{error:c.message})}},o=e=>{K({title:"Delete Job",message:`Are you sure you want to cancel / delete job ${e}?`,onConfirm:async()=>{try{await g.deleteJob(e),h("Job cancelled successfully","success"),n()}catch(t){h(t.message,"error")}}})},d=async e=>{try{const t=await g.getJob(e),s=t.data&&t.data.job?t.data.job:t.data||t,r=s["Job ID"]||s.id||e,i=`
          <div class="grid grid-cols-2 gap-4">
            <div><strong>Client:</strong> ${s.Client||s.clientName||"-"}</div>
            <div><strong>Company:</strong> ${s.Company||s.companyName||"-"}</div>
            <div><strong>Work Type:</strong> ${s["Work Type"]||s.workType||"-"}</div>
            <div><strong>Location:</strong> ${s.Location||s.location||"-"}</div>
            <div><strong>Function:</strong> ${s.Function||s.function||"-"}</div>
            <div><strong>Status:</strong> <span class="badge badge-${s.Status||s.status}">${s.Status||s.status||"NEW"}</span></div>
            <div><strong>Priority:</strong> <span class="badge badge-${s.Priority||s.priority}">${s.Priority||s.priority||"MEDIUM"}</span></div>
            <div><strong>In Date:</strong> ${s["In Date"]||s.inDate?new Date(s["In Date"]||s.inDate).toLocaleDateString():"-"}</div>
            <div><strong>Due Date:</strong> ${s["Due Date"]||s.dueDate?new Date(s["Due Date"]||s.dueDate).toLocaleDateString():"-"}</div>
          </div>
          <div class="mt-4">
            <strong>Notes:</strong>
            <p style="background:var(--bg);padding:0.75rem;border-radius:4px;margin-top:0.3rem;">${s.Notes||s.notes||"No notes provided."}</p>
          </div>
        `;A({title:`Job Details: ${r}`,content:i,size:"lg"})}catch(t){h(t.message,"error")}},l=async(e=null)=>{let t={};if(e)try{const I=await g.getJob(e);t=I.data&&I.data.job?I.data.job:I.data||I}catch(I){return h(I.message,"error")}const s=t.Client||t.clientName||"",r=t.Company||t.companyName||"",i=t.Location||t.location||"",p=t.Function||t.function||"",E=t["Work Type"]||t.workType||"",c=t.Priority||t.priority||"MEDIUM",u=t.Status||t.status||"NEW",m=t["In Date"]||t.inDate?(t["In Date"]||t.inDate).substring(0,10):new Date().toISOString().substring(0,10),y=t["Due Date"]||t.dueDate?(t["Due Date"]||t.dueDate).substring(0,10):"",k=t.Notes||t.notes||"",L=`
        <form id="job-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Client Name *</label><input type="text" id="jf-client" class="form-control" value="${s}" required></div>
            <div class="form-group"><label class="form-label">Company Name</label><input type="text" id="jf-company" class="form-control" value="${r}"></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" id="jf-location" class="form-control" value="${i}"></div>
            <div class="form-group"><label class="form-label">Function</label><input type="text" id="jf-function" class="form-control" value="${p}"></div>
            <div class="form-group"><label class="form-label">Work Type *</label><input type="text" id="jf-type" class="form-control" value="${E}" placeholder="e.g. Photography / Video Edit" required></div>
            <div class="form-group"><label class="form-label">Priority</label>
              <select id="jf-priority" class="form-control">
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(I=>`<option value="${I}" ${c===I?"selected":""}>${I}</option>`).join("")}
              </select>
            </div>
            <div class="form-group"><label class="form-label">In Date *</label><input type="date" id="jf-indate" class="form-control" value="${m}" required></div>
            <div class="form-group"><label class="form-label">Due Date *</label><input type="date" id="jf-duedate" class="form-control" value="${y}" required></div>
            ${e?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="jf-status" class="form-control">
                  ${["NEW","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"].map(I=>`<option value="${I}" ${u===I?"selected":""}>${I}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <div class="form-group mt-4"><label class="form-label">Notes</label><textarea id="jf-notes" class="form-control" rows="3" placeholder="Job instructions and notes...">${k}</textarea></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Job Record</button>
        </form>
      `;A({title:e?`Edit Job: ${e}`:"Create New Job",content:L,size:"lg"}),document.getElementById("job-form").addEventListener("submit",async I=>{I.preventDefault();const B={Client:document.getElementById("jf-client").value.trim(),Company:document.getElementById("jf-company").value.trim(),Location:document.getElementById("jf-location").value.trim(),Function:document.getElementById("jf-function").value.trim(),WorkType:document.getElementById("jf-type").value.trim(),Priority:document.getElementById("jf-priority").value,InDate:document.getElementById("jf-indate").value,DueDate:document.getElementById("jf-duedate").value,Notes:document.getElementById("jf-notes").value.trim()};e&&document.getElementById("jf-status")&&(B.Status=document.getElementById("jf-status").value);try{e?await g.updateJob(e,B):await g.createJob(B),h(`Job ${e?"updated":"created"} successfully`,"success"),S(),n()}catch(C){h(C.message,"error")}})};document.getElementById("btn-new-job").addEventListener("click",()=>l()),document.getElementById("btn-refresh").addEventListener("click",n),document.getElementById("search-job").addEventListener("input",e=>{e.target.timeout&&clearTimeout(e.target.timeout),e.target.timeout=setTimeout(n,400)}),document.getElementById("filter-status").addEventListener("change",n),document.getElementById("filter-priority").addEventListener("change",n),n()}},Q={async render(a){a.innerHTML=`
      <div class="page-header">
        <h2>Tasks Management</h2>
        ${T.canAccess("jobs")?'<button id="btn-new-task" class="btn btn-primary">+ New Task</button>':""}
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
    `,await(async()=>{var l;try{if(T.getRole()!=="EDITOR"){const e=await g.getUsers(),t=Array.isArray(e.data)?e.data:((l=e.data)==null?void 0:l.users)||e.users||[],s=document.getElementById("filter-assignee");s&&t.forEach(r=>{const i=r["User ID"]||r.id||r.userId,p=r.Name||r.name||"User",E=document.createElement("option");E.value=i,E.textContent=`${p} (${r.Department||r.department||"Staff"})`,s.appendChild(E)})}}catch{}})();const o=async()=>{var i;const l=document.getElementById("filter-status").value,e=document.getElementById("filter-assignee")?document.getElementById("filter-assignee").value:"";let t=new URLSearchParams;l&&t.append("status",l),e&&t.append("assignedTo",e);const s=t.toString()?`?${t.toString()}`:"",r=document.getElementById("tasks-table-container");$(r,{loading:!0});try{const p=await g.getTasks(s),E=Array.isArray(p.data)?p.data:((i=p.data)==null?void 0:i.tasks)||p.tasks||[];$(r,{columns:[{label:"Task ID",render:c=>`<strong>${c["Task ID"]||c.id||c.taskId||"-"}</strong>`},{label:"Title",render:c=>`<strong>${c.Title||c.title||"-"}</strong>`},{label:"Type",render:c=>`<span class="badge badge-primary">${c["Task Type"]||c.taskType||"-"}</span>`},{label:"Job ID",render:c=>c["Job ID"]||c.jobId||"-"},{label:"Assigned To",render:c=>c["Assigned Name"]||c.assignedName||c["Assigned To"]||c.assignedTo||"Unassigned"},{label:"Priority",render:c=>{const u=c.Priority||c.priority||"MEDIUM";return`<span class="badge badge-${u}">${u}</span>`}},{label:"Status",render:c=>{const u=c.Status||c.status||"PENDING";return`<span class="badge badge-${u}">${u}</span>`}},{label:"Due Date",render:c=>{const u=c["Due Date"]||c.dueDate;return u?new Date(u).toLocaleDateString():"-"}},{label:"Actions",render:c=>`<button class="btn btn-sm btn-outline edit-btn" data-id="${c["Task ID"]||c.id||c.taskId}">Edit</button>`}],data:E,emptyMessage:'No tasks found. Click "+ New Task" to create one.',onRowClick:c=>d(c["Task ID"]||c.id||c.taskId)}),r.querySelectorAll(".edit-btn").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation(),d(u.target.dataset.id)})})}catch(p){$(r,{error:p.message})}},d=async(l=null)=>{var B,C;let e={},t=[],s=[];try{if(l){const v=await g.getTask(l);e=v.data&&v.data.task?v.data.task:v.data||v}if(T.canAccess("jobs")){const v=await g.getUsers(),f=await g.getJobs(),D=Array.isArray(v.data)?v.data:((B=v.data)==null?void 0:B.users)||v.users||[],q=Array.isArray(f.data)?f.data:((C=f.data)==null?void 0:C.jobs)||f.jobs||[];t=D.filter(N=>(N.Status||N.status)==="ACTIVE"),s=q.filter(N=>(N.Status||N.status)!=="CANCELLED")}}catch(v){return h(v.message,"error")}const r=T.getRole()==="EDITOR",i=e["Job ID"]||e.jobId||"",p=e["Task Type"]||e.taskType||"HIGHLIGHTS",E=e.Title||e.title||"",c=e["Assigned To"]||e.assignedTo||"",u=e.Priority||e.priority||"MEDIUM",m=e.Status||e.status||"PENDING",y=e["Due Date"]||e.dueDate?(e["Due Date"]||e.dueDate).substring(0,10):"",k=e.Notes||e.notes||"",L=["HIGHLIGHTS","CUT","PRE WED","REEL","TEASER","SYSTEM","DELIVERY","CORRECTION","OTHER"],I=`
        <form id="task-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Job Reference *</label>
              ${l||r?`<input type="text" id="tf-job" class="form-control" value="${i}" disabled>`:`
                <select id="tf-job" class="form-control" required>
                  <option value="">Select Associated Job...</option>
                  ${s.map(v=>{const f=v["Job ID"]||v.id,D=v.Client||v.clientName||"Job";return`<option value="${f}" ${i===f?"selected":""}>${f} - ${D}</option>`}).join("")}
                </select>
              `}
            </div>
            
            <div class="form-group">
              <label class="form-label">Task Type *</label>
              <select id="tf-type" class="form-control" ${r?"disabled":"required"}>
                ${L.map(v=>`<option value="${v}" ${p===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group" style="grid-column: span 2">
              <label class="form-label">Task Title *</label>
              <input type="text" id="tf-title" class="form-control" placeholder="e.g. Color grading highlight reel" value="${E}" ${r?"disabled":"required"}>
            </div>
            
            ${r?"":`
              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select id="tf-assignee" class="form-control">
                  <option value="">Unassigned</option>
                  ${t.map(v=>{const f=v["User ID"]||v.id,D=v.Name||v.name;return`<option value="${f}" ${c===f?"selected":""}>${D} (${v.Department||v.department||"Staff"})</option>`}).join("")}
                </select>
              </div>
            `}
            
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="tf-priority" class="form-control" ${r?"disabled":""}>
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(v=>`<option value="${v}" ${u===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Due Date *</label>
              <input type="date" id="tf-duedate" class="form-control" value="${y}" ${r?"disabled":"required"}>
            </div>
            
            ${l?`
              <div class="form-group">
                <label class="form-label">Status</label>
                <select id="tf-status" class="form-control">
                  ${["PENDING","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"].map(v=>`<option value="${v}" ${m===v?"selected":""}>${v}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          
          <div class="form-group mt-4">
            <label class="form-label">Task Instructions / Notes</label>
            <textarea id="tf-notes" class="form-control" rows="3" placeholder="Additional notes or specifications...">${k}</textarea>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Save Task Record</button>
        </form>
      `;A({title:l?`Edit Task: ${l}`:"Create New Task",content:I,size:"lg"}),document.getElementById("task-form").addEventListener("submit",async v=>{v.preventDefault();try{if(l){const f={Notes:document.getElementById("tf-notes").value.trim()};if(document.getElementById("tf-status")&&(f.Status=document.getElementById("tf-status").value),!r){f.Title=document.getElementById("tf-title").value.trim(),f.TaskType=document.getElementById("tf-type").value,f.Priority=document.getElementById("tf-priority").value,f.DueDate=document.getElementById("tf-duedate").value;const D=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:null;D&&D!==c&&(f.AssignedTo=D)}await g.updateTask(l,f),h("Task updated successfully","success")}else{const f={JobId:document.getElementById("tf-job").value,TaskType:document.getElementById("tf-type").value,Title:document.getElementById("tf-title").value.trim(),Priority:document.getElementById("tf-priority").value,DueDate:document.getElementById("tf-duedate").value,Notes:document.getElementById("tf-notes").value.trim()},D=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:"";D&&(f.AssignedTo=D),await g.createTask(f),h("Task created successfully","success")}S(),o()}catch(f){h(f.message,"error")}})};document.getElementById("btn-new-task")&&document.getElementById("btn-new-task").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",o),document.getElementById("filter-status").addEventListener("change",o),document.getElementById("filter-assignee")&&document.getElementById("filter-assignee").addEventListener("change",o),o()}},Z={async render(a){a.innerHTML=`
      <h2>Team Overview</h2>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const o=(await g.getDecisionCenter()).data.employeeWorkload,d=`
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;document.getElementById("team-content").innerHTML=d,$(document.getElementById("team-table"),{columns:[{label:"Employee",key:"name"},{label:"Department",key:"department"},{label:"Open Tasks",key:"openTasks"},{label:"Capacity",key:"capacity"},{label:"Utilization",render:l=>{const e=l.utilization,t=e>90?"var(--danger)":e>75?"var(--warning)":"var(--success)";return`<div style="display:flex;align-items:center;gap:0.5rem">
              <div style="width:50px">${e}%</div>
              <div class="progress-bar-bg" style="width:100px;margin:0"><div class="progress-bar-fill" style="background-color:${t};width:${Math.min(e,100)}%"></div></div>
            </div>`}},{label:"Completed",key:"completedTasks"},{label:"Overdue",render:l=>`<span style="color:${l.overdueTasks>0?"var(--danger)":"inherit"}">${l.overdueTasks}</span>`},{label:"Signal",render:l=>`<span class="badge badge-${l.signal.includes("OVERLOADED")?"OVERLOADED":l.signal==="HIGH"?"HIGH-SIGNAL":"AVAILABLE"}">${l.signal}</span>`}],data:o,onRowClick:l=>{O.navigate(`/tasks?assigneeId=${l.id}`),window.location.hash="#/tasks",setTimeout(()=>{const e=document.getElementById("filter-assignee");e&&(e.value=l.id,e.dispatchEvent(new Event("change")))},100)}})}catch(n){document.getElementById("team-content").innerHTML=`<div style="color:var(--danger)">Failed to load team data: ${n.message}</div>`}}},ee={async render(a){a.innerHTML=`
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
    `;const n=async()=>{try{const e=(await g.getPaymentSummary()).data;document.getElementById("payment-summary").innerHTML=`
          <div class="card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${e.totalRevenue.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Total Advance</div><div class="stat-value">$${e.totalAdvance.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${e.totalOutstanding.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Pending Count</div><div class="stat-value">${e.pendingCount}</div></div>
        `}catch(l){console.error("Failed to load payment summary",l)}},o=async()=>{const l=document.getElementById("filter-status").value;let e=l?`?status=${l}`:"";const t=document.getElementById("payments-table-container");$(t,{loading:!0});try{const s=await g.getPayments(e);$(t,{columns:[{label:"ID",key:"id"},{label:"Client",key:"clientName"},{label:"Job ID",key:"jobId"},{label:"Amount",render:r=>`$${r.totalAmount.toLocaleString()}`},{label:"Advance",render:r=>`$${r.advancePayment.toLocaleString()}`},{label:"Balance",render:r=>`$${r.balance.toLocaleString()}`},{label:"Status",render:r=>`<span class="badge badge-${r.status}">${r.status}</span>`},{label:"Date",render:r=>new Date(r.dateStr).toLocaleDateString()},{label:"Actions",render:r=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
              `}],data:s.data,onRowClick:r=>d(r.id)}),t.querySelectorAll(".edit-btn").forEach(r=>{r.addEventListener("click",i=>{i.stopPropagation(),d(i.target.dataset.id)})})}catch(s){$(t,{error:s.message})}},d=async(l=null)=>{let e={totalAmount:0,advancePayment:0};if(l)try{e=(await g.getPayment(l)).data}catch(s){return h(s.message,"error")}const t=`
        <form id="payment-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="pf-job" class="form-control" value="${e.jobId||""}" ${l?"disabled":"required"}></div>
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="pf-client" class="form-control" value="${e.clientName||""}" required></div>
            <div class="form-group"><label class="form-label">Total Amount</label><input type="number" step="0.01" id="pf-total" class="form-control" value="${e.totalAmount}" required></div>
            <div class="form-group"><label class="form-label">Advance Payment</label><input type="number" step="0.01" id="pf-advance" class="form-control" value="${e.advancePayment}" required></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="pf-date" class="form-control" value="${e.dateStr?e.dateStr.substring(0,10):new Date().toISOString().substring(0,10)}" required></div>
            ${l?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="pf-status" class="form-control">
                  ${["PENDING","PARTIAL","PAID"].map(s=>`<option value="${s}" ${e.status===s?"selected":""}>${s}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Payment</button>
        </form>
      `;A({title:l?"Edit Payment":"New Payment",content:t}),document.getElementById("payment-form").addEventListener("submit",async s=>{s.preventDefault();const r={clientName:document.getElementById("pf-client").value,totalAmount:parseFloat(document.getElementById("pf-total").value),advancePayment:parseFloat(document.getElementById("pf-advance").value),dateStr:document.getElementById("pf-date").value};l||(r.jobId=document.getElementById("pf-job").value),l&&(r.status=document.getElementById("pf-status").value);try{l?await g.updatePayment(l,r):await g.createPayment(r),h(`Payment ${l?"updated":"created"}`,"success"),S(),n(),o()}catch(i){h(i.message,"error")}})};document.getElementById("btn-new-payment").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",()=>{n(),o()}),document.getElementById("filter-status").addEventListener("change",o),n(),o()}},te={render(a){a.innerHTML=`
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
    `;let n="monthly";const o=()=>{const l=document.getElementById("report-filters");if(n==="monthly"){const e=new Date;l.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Year</label><input type="number" id="rf-year" class="form-control" value="${e.getFullYear()}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">Month</label>
            <select id="rf-month" class="form-control">
              ${Array.from({length:12},(t,s)=>`<option value="${s+1}" ${e.getMonth()===s?"selected":""}>${new Date(2e3,s,1).toLocaleString("default",{month:"long"})}</option>`).join("")}
            </select>
          </div>
        `}else{const e=new Date().toISOString().substring(0,10),t=new Date(Date.now()-30*24*60*60*1e3).toISOString().substring(0,10);l.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Start Date</label><input type="date" id="rf-start" class="form-control" value="${t}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">End Date</label><input type="date" id="rf-end" class="form-control" value="${e}"></div>
        `}},d=async()=>{const l=document.getElementById("report-results");l.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{let e;if(n==="monthly"){const t=document.getElementById("rf-year").value,s=document.getElementById("rf-month").value;e=await g.getMonthlyReport(t,s),l.innerHTML=`
            <h3>Summary for ${t}-${s.padStart(2,"0")}</h3>
            <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
              <div class="card"><div class="stat-title">Completed Jobs</div><div class="stat-value">${e.data.summary.completedJobs}</div></div>
              <div class="card"><div class="stat-title">New Jobs</div><div class="stat-value">${e.data.summary.newJobs}</div></div>
              <div class="card"><div class="stat-title">Revenue Received</div><div class="stat-value">$${e.data.summary.revenueReceived.toLocaleString()}</div></div>
            </div>
            <h4>Jobs Breakdown</h4>
            <div id="rep-table"></div>
          `,$(document.getElementById("rep-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Work Type",key:"workType"},{label:"Status",key:"status"}],data:e.data.jobs})}else if(n==="employee"){const t=document.getElementById("rf-start").value,s=document.getElementById("rf-end").value;e=await g.getEmployeePerformanceReport(t,s),l.innerHTML=`<h3>Employee Performance (${t} to ${s})</h3><div id="rep-table" class="mt-4"></div>`,$(document.getElementById("rep-table"),{columns:[{label:"Employee ID",key:"employeeId"},{label:"Tasks Completed",key:"completedTasks"},{label:"Overdue Tasks",key:"overdueTasks"}],data:e.data})}else if(n==="worktype"){const t=document.getElementById("rf-start").value,s=document.getElementById("rf-end").value;e=await g.getWorkTypeReport(t,s),l.innerHTML=`<h3>Work Type Summary (${t} to ${s})</h3><div id="rep-table" class="mt-4"></div>`,$(document.getElementById("rep-table"),{columns:[{label:"Work Type",key:"workType"},{label:"Total Jobs",key:"count"},{label:"Total Value",render:r=>`$${r.totalValue.toLocaleString()}`}],data:e.data})}}catch(e){l.innerHTML=`<div style="color:var(--danger)">Error: ${e.message}</div>`}};document.querySelectorAll(".rep-tab").forEach(l=>{l.addEventListener("click",e=>{document.querySelectorAll(".rep-tab").forEach(t=>t.classList.remove("active")),e.target.classList.add("active"),n=e.target.dataset.type,o(),document.getElementById("report-results").innerHTML="Please select parameters and load report."})}),document.getElementById("btn-load-report").addEventListener("click",d),o()}},ae={async render(a){a.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Users</h2>
        <button id="btn-new-user" class="btn btn-primary">+ New User</button>
      </div>
      <div id="users-table-container"></div>
    `;const n=async()=>{const e=document.getElementById("users-table-container");$(e,{loading:!0});try{const t=await g.getUsers();$(e,{columns:[{label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},{label:"Role",render:s=>`<span class="badge badge-IN_PROGRESS">${s.role}</span>`},{label:"Department",key:"department"},{label:"Capacity",key:"capacity"},{label:"Status",render:s=>`<span class="badge badge-${s.status}">${s.status}</span>`},{label:"Actions",render:s=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${s.id}">Edit</button>
                <button class="btn btn-sm btn-outline pw-btn" data-id="${s.id}">Reset PW</button>
                ${s.status==="ACTIVE"?`<button class="btn btn-sm btn-danger deact-btn" data-id="${s.id}">Deactivate</button>`:`<button class="btn btn-sm btn-success act-btn" data-id="${s.id}">Activate</button>`}
              `}],data:t.data}),e.querySelectorAll(".edit-btn").forEach(s=>s.addEventListener("click",r=>l(r.target.dataset.id))),e.querySelectorAll(".pw-btn").forEach(s=>s.addEventListener("click",r=>d(r.target.dataset.id))),e.querySelectorAll(".deact-btn").forEach(s=>s.addEventListener("click",r=>o(r.target.dataset.id,!1))),e.querySelectorAll(".act-btn").forEach(s=>s.addEventListener("click",r=>o(r.target.dataset.id,!0)))}catch(t){$(e,{error:t.message})}},o=async(e,t)=>{try{t?await g.activateUser(e):await g.deactivateUser(e),h(`User ${t?"activated":"deactivated"}`,"success"),n()}catch(s){h(s.message,"error")}},d=e=>{A({title:"Reset Password",content:`
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="pw-new" class="form-control" required></div>
          <button id="btn-reset-pw" class="btn btn-primary w-full mt-4">Update Password</button>
        `}),document.getElementById("btn-reset-pw").addEventListener("click",async()=>{const t=document.getElementById("pw-new").value;if(!t)return h("Password required","warning");try{await g.resetPassword(e,t),h("Password updated","success"),S()}catch(s){h(s.message,"error")}})},l=async(e=null)=>{let t={capacity:10,role:"EDITOR"};if(e)try{t=(await g.getUser(e)).data}catch(r){return h(r.message,"error")}const s=`
        <form id="user-form">
          <div class="form-group"><label class="form-label">Name</label><input type="text" id="uf-name" class="form-control" value="${t.name||""}" required></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" id="uf-email" class="form-control" value="${t.email||""}" ${e?"disabled":"required"}></div>
          ${e?"":'<div class="form-group"><label class="form-label">Password</label><input type="password" id="uf-pw" class="form-control" required></div>'}
          <div class="form-group"><label class="form-label">Role</label>
            <select id="uf-role" class="form-control">
              ${["ADMIN","MANAGER","EDITOR","VIEWER"].map(r=>`<option value="${r}" ${t.role===r?"selected":""}>${r}</option>`).join("")}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Department</label><input type="text" id="uf-dept" class="form-control" value="${t.department||""}"></div>
          <div class="form-group"><label class="form-label">Capacity (Max open tasks)</label><input type="number" id="uf-cap" class="form-control" value="${t.capacity}" required></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save User</button>
        </form>
      `;A({title:e?"Edit User":"New User",content:s}),document.getElementById("user-form").addEventListener("submit",async r=>{r.preventDefault();const i={name:document.getElementById("uf-name").value,role:document.getElementById("uf-role").value,department:document.getElementById("uf-dept").value,capacity:parseInt(document.getElementById("uf-cap").value)};try{e?(await g.updateUser(e,i),i.role!==t.role&&await g.changeRole(e,i.role),h("User updated","success")):(i.email=document.getElementById("uf-email").value,i.password=document.getElementById("uf-pw").value,await g.createUser(i),h("User created","success")),S(),n()}catch(p){h(p.message,"error")}})};document.getElementById("btn-new-user").addEventListener("click",()=>l()),n()}},se={async render(a){a.innerHTML=`
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
    `;const n=async()=>{const o=document.getElementById("filter-module").value,d=document.getElementById("filter-action").value;let l="?";o&&(l+=`module=${o}&`),d&&(l+=`action=${d}`);const e=document.getElementById("audit-table-container");$(e,{loading:!0});try{const t=await g.getAuditLog(l);$(e,{columns:[{label:"Timestamp",render:s=>new Date(s.timestamp).toLocaleString()},{label:"User",key:"userName"},{label:"Action",key:"action"},{label:"Module",key:"module"},{label:"Record ID",key:"recordId"},{label:"Changes",render:s=>s.action==="UPDATE"&&s.changes?`<div style="font-size:0.75rem; max-width:300px; overflow-x:auto;">
                  ${Object.entries(s.changes).map(([r,i])=>`${r}: ${i.old} → ${i.new}`).join("<br>")}
                </div>`:"-"}],data:t.data})}catch(t){$(e,{error:t.message})}};document.getElementById("btn-refresh").addEventListener("click",n),document.getElementById("filter-module").addEventListener("change",n),document.getElementById("filter-action").addEventListener("change",n),n()}},ne={async render(a){a.innerHTML=`
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
    `;const n=document.getElementById("sys-output");document.getElementById("btn-test-db").addEventListener("click",async()=>{n.style.display="block",n.textContent="Testing connection...";try{const o=await g.testDbConnection();n.textContent=JSON.stringify(o.data,null,2)}catch(o){n.textContent=`Error: ${o.message}`}}),document.getElementById("btn-discover").addEventListener("click",async()=>{n.style.display="block",n.textContent="Discovering sheets...";try{const o=await g.discoverSheets();n.textContent=JSON.stringify(o.data,null,2)}catch(o){n.textContent=`Error: ${o.message}`}});try{const d=(await g.getSettings()).data;let l='<form id="settings-form" class="grid grid-cols-2 gap-4">';for(const[e,t]of Object.entries(d))l+=`
          <div class="form-group">
            <label class="form-label">${e}</label>
            <input type="text" name="${e}" class="form-control" value="${t}">
          </div>
        `;l+='<div style="grid-column: span 2"><button type="submit" class="btn btn-primary">Save Settings</button></div>',l+="</form>",document.getElementById("settings-form-container").innerHTML=l,document.getElementById("settings-form").addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),s=Object.fromEntries(t.entries());try{await g.updateSettings(s),h("Settings saved successfully","success")}catch(r){h(r.message,"error")}})}catch(o){document.getElementById("settings-form-container").innerHTML=`<div style="color:var(--danger)">Error loading settings: ${o.message}</div>`}}};document.getElementById("app");const oe={"/login":{page:F},"/":{page:J,module:"dashboard"},"/decision-center":{page:Y,module:"decision-center"},"/jobs":{page:X,module:"jobs"},"/tasks":{page:Q,module:"tasks"},"/team":{page:Z,module:"team"},"/payments":{page:ee,module:"payments"},"/reports":{page:te,module:"reports"},"/users":{page:ae,module:"users"},"/audit":{page:se,module:"audit"},"/settings":{page:ne,module:"settings"},"*":{page:J,module:"dashboard"}};function U(a,n){if(!a||!n)return;const o=a.page||a.render;o&&typeof o.render=="function"?o.render(n):typeof o=="function"&&o(n)}async function W(){const a=document.getElementById("app");if(a){try{const n=await g.getMe(),o=n.user||n.data&&n.data.user||n.data;o&&T.setUser(o)}catch{T.clearUser()}if(!document.getElementById("toast-container")){const n=document.createElement("div");n.id="toast-container",document.body.appendChild(n)}O.onRoute(n=>{if(!T.isAuthenticated())a.innerHTML="",U(n,a);else{_(a,T.getUser());const o=document.getElementById("page-content");o&&(o.innerHTML="",U(n,o))}}),O.init(oe)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",W):W();

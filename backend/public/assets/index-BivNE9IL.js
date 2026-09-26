(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))d(o);new MutationObserver(o=>{for(const e of o)if(e.type==="childList")for(const t of e.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&d(t)}).observe(document,{childList:!0,subtree:!0});function l(o){const e={};return o.integrity&&(e.integrity=o.integrity),o.referrerPolicy&&(e.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?e.credentials="include":o.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function d(o){if(o.ep)return;o.ep=!0;const e=l(o);fetch(o.href,e)}})();const J="/api";async function b(n,s={}){const l=`${J}${n}`,d={credentials:"include",...s,headers:{"Content-Type":"application/json",...s.headers}};try{const o=await fetch(l,d);let e;try{e=await o.json()}catch{if(!o.ok)throw new Error(`HTTP Error: ${o.status}`);return null}if(!o.ok||e.success===!1){const t=e.error,a=t&&t.message?t.message:typeof t=="string"?t:e.message||`Request failed (${o.status})`,r=new Error(a);throw r.code=t&&t.code||null,r.statusCode=o.status,r}return e}catch(o){throw console.error(`API Error on ${n}:`,o.message),o}}const p={login:(n,s)=>b("/auth/login",{method:"POST",body:JSON.stringify({email:n,password:s})}),logout:()=>b("/auth/logout",{method:"POST"}),getMe:()=>b("/auth/me"),getDashboard:()=>b("/dashboard"),getDecisionCenter:()=>b("/decision-center"),getJobs:(n="")=>b(`/jobs${n}`),getJob:n=>b(`/jobs/${n}`),createJob:n=>b("/jobs",{method:"POST",body:JSON.stringify(n)}),updateJob:(n,s)=>b(`/jobs/${n}`,{method:"PUT",body:JSON.stringify(s)}),deleteJob:n=>b(`/jobs/${n}`,{method:"DELETE"}),getTasks:(n="")=>b(`/tasks${n}`),getTask:n=>b(`/tasks/${n}`),createTask:n=>b("/tasks",{method:"POST",body:JSON.stringify(n)}),updateTask:(n,s)=>b(`/tasks/${n}`,{method:"PUT",body:JSON.stringify(s)}),assignTask:(n,s)=>b(`/tasks/${n}/assign`,{method:"POST",body:JSON.stringify(s)}),getUsers:()=>b("/users"),getUser:n=>b(`/users/${n}`),createUser:n=>b("/users",{method:"POST",body:JSON.stringify(n)}),updateUser:(n,s)=>b(`/users/${n}`,{method:"PUT",body:JSON.stringify(s)}),activateUser:n=>b(`/users/${n}/activate`,{method:"POST"}),deactivateUser:n=>b(`/users/${n}/deactivate`,{method:"POST"}),changeRole:(n,s)=>b(`/users/${n}/role`,{method:"PUT",body:JSON.stringify({role:s})}),resetPassword:(n,s)=>b(`/users/${n}/reset-password`,{method:"POST",body:JSON.stringify({password:s})}),getPayments:(n="")=>b(`/payments${n}`),getPayment:n=>b(`/payments/${n}`),createPayment:n=>b("/payments",{method:"POST",body:JSON.stringify(n)}),updatePayment:(n,s)=>b(`/payments/${n}`,{method:"PUT",body:JSON.stringify(s)}),getPaymentSummary:()=>b("/payments/summary"),getMonthlyReport:(n,s)=>b(`/reports/monthly?year=${n}&month=${s}`),getEmployeePerformanceReport:(n,s)=>b(`/reports/employee-performance?startDate=${n}&endDate=${s}`),getWorkTypeReport:(n,s)=>b(`/reports/work-type?startDate=${n}&endDate=${s}`),getDepartmentReport:(n,s)=>b(`/reports/department?startDate=${n}&endDate=${s}`),getAuditLog:(n="")=>b(`/audit${n}`),getSettings:()=>b("/settings"),updateSettings:n=>b("/settings",{method:"PUT",body:JSON.stringify(n)}),testDbConnection:()=>b("/settings/test-db"),discoverSheets:()=>b("/settings/discover")};let w=null;const U={ADMIN:["dashboard","decision-center","jobs","tasks","team","payments","reports","users","audit","settings"],MANAGER:["dashboard","decision-center","jobs","tasks","team","payments","reports","audit"],TEAM_LEADER:["dashboard","decision-center","jobs","tasks","team"],EDITOR:["dashboard","tasks","jobs","team"],DATA_ENTRY:["jobs","tasks"],VIEWER:["dashboard","decision-center","reports"]},D={getUser:()=>w,setUser:n=>{w=n},clearUser:()=>{w=null},isAuthenticated:()=>!!w,getRole:()=>(w==null?void 0:w.role)||null,canAccess:n=>!w||!w.role?!1:w.role==="ADMIN"?!0:(U[w.role]||[]).includes(n)};let O={},j=null;const P={init(n){O=n,window.addEventListener("hashchange",()=>this.handleHashChange()),this.handleHashChange()},navigate(n){const s=n.startsWith("#")?n:"#"+n;window.location.hash===s?this.handleHashChange():window.location.hash=s},onRoute(n){j=n},handleHashChange(){let n=window.location.hash;n.startsWith("#")&&(n=n.slice(1));const s=(n||"/").split("?")[0];if(!D.isAuthenticated()&&s!=="/login"){this.navigate("/login");return}if(D.isAuthenticated()&&s==="/login"){this.navigate("/");return}let l=O[s]||O["*"];if(l){if(l.module&&!D.canAccess(l.module)){console.warn(`Access denied to module ${l.module}`),this.navigate("/");return}j&&j(l)}}};function W(n,s){if(document.getElementById("sidebar"))return;const d=[{name:"Dashboard",path:"#/",module:"dashboard",icon:"📊"},{name:"Decision Center",path:"#/decision-center",module:"decision-center",icon:"🎯"},{name:"Jobs",path:"#/jobs",module:"jobs",icon:"💼"},{name:"Tasks",path:"#/tasks",module:"tasks",icon:"📋"},{name:"Team",path:"#/team",module:"team",icon:"👥"},{name:"Payments",path:"#/payments",module:"payments",icon:"💰"},{name:"Reports",path:"#/reports",module:"reports",icon:"📈"},{name:"Users",path:"#/users",module:"users",icon:"⚙️"},{name:"Audit Log",path:"#/audit",module:"audit",icon:"📝"},{name:"Settings",path:"#/settings",module:"settings",icon:"🔧"}].filter(t=>D.canAccess(t.module));n.innerHTML=`
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
          <span class="user-info">${s?s.name||s.Name||s.email||"User":""} (${s?s.role||s.Role||"ADMIN":""})</span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
        </div>

      </header>
      <main id="page-content"></main>
    </div>
  `;const o=()=>{const t=window.location.hash||"#/";document.querySelectorAll(".nav-link").forEach(a=>{a.getAttribute("href")===t?a.classList.add("active"):a.classList.remove("active")})};window.addEventListener("hashchange",o),o();const e=document.getElementById("sidebar");document.getElementById("menu-toggle").addEventListener("click",()=>{e.classList.toggle("open")}),document.getElementById("main-wrapper").addEventListener("click",t=>{window.innerWidth<=768&&t.target.id!=="menu-toggle"&&e.classList.remove("open")}),document.getElementById("logout-btn").addEventListener("click",async()=>{try{await p.logout()}catch(t){console.error(t)}D.clearUser(),window.location.hash="#/login",window.location.reload()})}function h(n,s="info"){const l=document.getElementById("toast-container");if(!l)return;const d=document.createElement("div");d.className=`toast toast-${s}`,d.textContent=n,l.appendChild(d),setTimeout(()=>{d.style.opacity="0",d.style.transition="opacity 0.3s ease",setTimeout(()=>d.remove(),300)},4e3)}const q={render(n){n.innerHTML=`
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
    `;const s=document.getElementById("login-form"),l=document.getElementById("toggle-pw"),d=document.getElementById("password"),o=document.getElementById("login-error"),e=document.getElementById("submit-btn");l.addEventListener("click",()=>{d.type==="password"?d.type="text":d.type="password"}),s.addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("email").value.trim(),r=d.value;o.style.display="none",e.disabled=!0,e.innerHTML='<span class="loader-sm"></span> Signing In...';try{const i=await p.login(a,r),g=i.user||i.data&&i.data.user||i.data;if(g)D.setUser(g),P.navigate("/");else throw new Error("Invalid login response from server")}catch(i){o.textContent=i.message||"Authentication failed. Please check your credentials.",o.style.display="block",e.disabled=!1,e.innerHTML="<span>Sign In to Dashboard</span>"}})}},R={async render(n){n.innerHTML=`
      <div class="page-header">
        <h2>Executive Dashboard</h2>
        <span class="badge badge-success">Live Google Sheets Sync</span>
      </div>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const s=await p.getDashboard(),l=s&&s.data?s.data:s||{},d=l.kpis||{totalJobs:l.totalJobs||0,openTasks:l.openTasks||0,completedTasks:l.completedTasks||0,overdueTasks:l.overdueTasks||0,completionRate:l.completionRate||0,activeEmployees:l.activeEmployees||0,overloadedEmployees:l.overloadedEmployees||0,pendingPayments:l.pendingPayments||0,revenue:l.totalRevenue||l.revenue||0,outstandingBalance:l.outstandingBalance||0},o=l.taskStatusDist||l.taskStatusDistribution||{},e=l.workTypeDist||l.workTypeDistribution||{},t=l.employeeWorkload||l.workloadByEmployee||[],a=l.recentActivity||[],r=`
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
              ${Object.keys(o).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No task data recorded yet.</p>':Object.entries(o).map(([i,g])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span class="badge badge-${i}">${i}</span>
                  <strong>${g}</strong>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="card">
            <h3>Work Type Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.keys(e).length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No jobs recorded yet.</p>':Object.entries(e).map(([i,g])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span>${i}</span>
                  <strong>${g}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <h3>Workload by Employee</h3>
          <div style="margin-top:1rem;">
            ${t.length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No active employees found.</p>':t.map(i=>{const g=i.utilization!==void 0?i.utilization:i.capacity>0?Math.round((i.open||i.openTasks||0)/i.capacity*100):0,I=i.openTasks!==void 0?i.openTasks:i.open||0,c=g>=100?"progress-red":g>=80?"progress-orange":"progress-green";return`
                  <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.3rem;">
                      <span><strong>${i.name}</strong></span>
                      <span>${g}% (${I} / ${i.capacity||40} tasks)</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill ${c}" style="width: ${Math.min(g,100)}%;"></div>
                    </div>
                  </div>
                `}).join("")}
          </div>
        </div>
        
        <div class="card">
          <h3>Recent Operational Activity</h3>
          <div style="margin-top:1rem;">
            ${a.length===0?'<p style="color:var(--text-muted);font-size:0.875rem;">No audit activities recorded yet.</p>':a.map(i=>`
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
      `;document.getElementById("dash-content").innerHTML=r}catch(s){document.getElementById("dash-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load dashboard: ${s.message}</div>`}}};function $(n,{columns:s,data:l,loading:d,error:o,onRowClick:e,emptyMessage:t="No records found"}){if(d){n.innerHTML='<div class="loader-container"><div class="loader"></div></div>';return}if(o){n.innerHTML=`<div style="color:var(--danger); padding: 1rem;">Error loading data: ${o}</div>`;return}let a=[];if(Array.isArray(l)?a=l:l&&typeof l=="object"&&(a=l.items||l.jobs||l.tasks||l.users||l.payments||l.logs||l.report||l.employeeStats||[]),!a||a.length===0){n.innerHTML=`<div style="padding: 2.5rem 1rem; color: var(--text-muted); text-align: center; font-size: 0.9rem;">${t}</div>`;return}const r=document.createElement("div");r.className="table-container table-responsive-mobile";const i=document.createElement("table"),g=document.createElement("thead"),I=document.createElement("tr");s.forEach(u=>{const m=document.createElement("th");m.textContent=u.label,I.appendChild(m)}),g.appendChild(I),i.appendChild(g);const c=document.createElement("tbody");a.forEach((u,m)=>{const y=document.createElement("tr");e&&(y.classList.add("clickable"),y.addEventListener("click",T=>{T.target.tagName.toLowerCase()==="button"||T.target.closest("button")||T.target.tagName.toLowerCase()==="a"||e(u)})),s.forEach(T=>{const S=document.createElement("td");if(S.setAttribute("data-label",T.label),T.render)S.innerHTML=T.render(u,m);else{const E=T.key&&u[T.key]!==void 0?u[T.key]:T.label&&u[T.label]!==void 0?u[T.label]:"";S.textContent=E??""}y.appendChild(S)}),c.appendChild(y)}),i.appendChild(c),r.appendChild(i),n.innerHTML="",n.appendChild(r)}const G={async render(n){n.innerHTML=`
      <div class="page-header">
        <h2>Decision Center</h2>
        <span class="badge badge-primary">Operational Intelligence</span>
      </div>
      <div id="dc-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const s=await p.getDecisionCenter(),l=s&&s.data?s.data:s||{},d=l.insights||{},o=l.employeeStats||l.employeeWorkload||l.employees||[],e=l.alerts||[];let t="";e&&e.length>0&&(t+=`
          <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <h3 style="color:var(--danger)">⚠️ Action Required</h3>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
              ${e.map(u=>`<li>${u}</li>`).join("")}
            </ul>
          </div>
        `);const a=d.highestWorkloadEmployee,r=a&&typeof a=="object"&&a.name?`${a.name} (${a.utilizationPercent??a.utilization??0}%)`:typeof a=="string"?a:"None",i=d.highestOverdueEmployee,g=i&&typeof i=="object"&&i.name?`${i.name} (${i.overdueCount??i.overdueTasks??0} overdue)`:typeof i=="string"?i:"None",I=d.highestBacklogTaskType||"None",c=d.bottleneckDepartments&&d.bottleneckDepartments.length>0?d.bottleneckDepartments.join(", "):"None";t+=`
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="card">
            <div class="stat-title">Highest Workload</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--text);">${r}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Overdue</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--danger);">${g}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Backlog Type</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--primary);">${I}</div>
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
            `}},{label:"Signal",render:u=>{const m=u.signal||(u.utilizationPercent>=100?"OVERLOADED":u.utilizationPercent>=80?"HIGH":"AVAILABLE");return`<span class="badge ${m==="OVERLOADED"?"badge-danger":m==="HIGH"?"badge-warning":"badge-success"}">${m}</span>`}}],data:o,emptyMessage:"No employee workload records found."})}catch(s){document.getElementById("dc-content").innerHTML=`<div style="color:var(--danger); padding:1rem;">Failed to load Decision Center: ${s.message}</div>`}}};function A({title:n,content:s,actions:l="",size:d=""}){L();const o=document.createElement("div");o.className="modal-overlay",o.id="active-modal",o.innerHTML=`
    <div class="modal-content ${d?`modal-${d}`:""}">
      <div class="modal-header">
        <h3 style="margin:0">${n}</h3>
        <button class="btn btn-outline" id="modal-close-x" style="border:none; background:none; font-size:1.5rem; line-height:1; padding:0;">&times;</button>
      </div>
      <div class="modal-body">
        ${s}
      </div>
      ${l?`<div class="modal-footer">${l}</div>`:""}
    </div>
  `,document.body.appendChild(o);const e=document.getElementById("modal-close-x");return e&&e.addEventListener("click",L),o.addEventListener("click",t=>{t.target===o&&L()}),o}function L(){const n=document.getElementById("active-modal");n&&n.remove()}function z({title:n,message:s,onConfirm:l}){A({title:n,content:`<p>${s}</p>`,actions:`
      <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Confirm</button>
    `}),document.getElementById("confirm-cancel").addEventListener("click",L),document.getElementById("confirm-ok").addEventListener("click",()=>{L(),l&&l()})}const V={async render(n){n.innerHTML=`
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
    `;const s=async()=>{var I;const e=document.getElementById("search-job").value.trim(),t=document.getElementById("filter-status").value,a=document.getElementById("filter-priority").value;let r=new URLSearchParams;e&&r.append("search",e),t&&r.append("status",t),a&&r.append("priority",a);const i=r.toString()?`?${r.toString()}`:"",g=document.getElementById("jobs-table-container");$(g,{loading:!0});try{const c=await p.getJobs(i),u=Array.isArray(c.data)?c.data:((I=c.data)==null?void 0:I.jobs)||c.jobs||[];$(g,{columns:[{label:"Job ID",render:m=>`<strong>${m["Job ID"]||m.id||m.jobId||"-"}</strong>`},{label:"Client",render:m=>m.Client||m.clientName||m.client||"-"},{label:"Company",render:m=>m.Company||m.companyName||m.company||"-"},{label:"Work Type",render:m=>m["Work Type"]||m.workType||"-"},{label:"Priority",render:m=>{const y=m.Priority||m.priority||"MEDIUM";return`<span class="badge badge-${y}">${y}</span>`}},{label:"Status",render:m=>{const y=m.Status||m.status||"NEW";return`<span class="badge badge-${y}">${y}</span>`}},{label:"Due Date",render:m=>{const y=m["Due Date"]||m.dueDate;return y?new Date(y).toLocaleDateString():"-"}},{label:"Actions",render:m=>{const y=m["Job ID"]||m.id||m.jobId;return`
                <div style="display:flex;gap:0.5rem;">
                  <button class="btn btn-sm btn-outline edit-btn" data-id="${y}">Edit</button>
                  <button class="btn btn-sm btn-danger del-btn" data-id="${y}">Del</button>
                </div>
              `}}],data:u,emptyMessage:'No jobs found. Click "+ New Job" to create your first job.',onRowClick:m=>d(m["Job ID"]||m.id||m.jobId)}),g.querySelectorAll(".edit-btn").forEach(m=>{m.addEventListener("click",y=>{y.stopPropagation(),o(y.target.dataset.id)})}),g.querySelectorAll(".del-btn").forEach(m=>{m.addEventListener("click",y=>{y.stopPropagation(),l(y.target.dataset.id)})})}catch(c){$(g,{error:c.message})}},l=e=>{z({title:"Delete Job",message:`Are you sure you want to cancel / delete job ${e}?`,onConfirm:async()=>{try{await p.deleteJob(e),h("Job cancelled successfully","success"),s()}catch(t){h(t.message,"error")}}})},d=async e=>{try{const t=await p.getJob(e),a=t.data&&t.data.job?t.data.job:t.data||t,r=a["Job ID"]||a.id||e,i=`
          <div class="grid grid-cols-2 gap-4">
            <div><strong>Client:</strong> ${a.Client||a.clientName||"-"}</div>
            <div><strong>Company:</strong> ${a.Company||a.companyName||"-"}</div>
            <div><strong>Work Type:</strong> ${a["Work Type"]||a.workType||"-"}</div>
            <div><strong>Location:</strong> ${a.Location||a.location||"-"}</div>
            <div><strong>Function:</strong> ${a.Function||a.function||"-"}</div>
            <div><strong>Status:</strong> <span class="badge badge-${a.Status||a.status}">${a.Status||a.status||"NEW"}</span></div>
            <div><strong>Priority:</strong> <span class="badge badge-${a.Priority||a.priority}">${a.Priority||a.priority||"MEDIUM"}</span></div>
            <div><strong>In Date:</strong> ${a["In Date"]||a.inDate?new Date(a["In Date"]||a.inDate).toLocaleDateString():"-"}</div>
            <div><strong>Due Date:</strong> ${a["Due Date"]||a.dueDate?new Date(a["Due Date"]||a.dueDate).toLocaleDateString():"-"}</div>
          </div>
          <div class="mt-4">
            <strong>Notes:</strong>
            <p style="background:var(--bg);padding:0.75rem;border-radius:4px;margin-top:0.3rem;">${a.Notes||a.notes||"No notes provided."}</p>
          </div>
        `;A({title:`Job Details: ${r}`,content:i,size:"lg"})}catch(t){h(t.message,"error")}},o=async(e=null)=>{let t={};if(e)try{const E=await p.getJob(e);t=E.data&&E.data.job?E.data.job:E.data||E}catch(E){return h(E.message,"error")}const a=t.Client||t.clientName||"",r=t.Company||t.companyName||"",i=t.Location||t.location||"",g=t.Function||t.function||"",I=t["Work Type"]||t.workType||"",c=t.Priority||t.priority||"MEDIUM",u=t.Status||t.status||"NEW",m=t["In Date"]||t.inDate?(t["In Date"]||t.inDate).substring(0,10):new Date().toISOString().substring(0,10),y=t["Due Date"]||t.dueDate?(t["Due Date"]||t.dueDate).substring(0,10):"",T=t.Notes||t.notes||"",S=`
        <form id="job-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Client Name *</label><input type="text" id="jf-client" class="form-control" value="${a}" required></div>
            <div class="form-group"><label class="form-label">Company Name</label><input type="text" id="jf-company" class="form-control" value="${r}"></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" id="jf-location" class="form-control" value="${i}"></div>
            <div class="form-group"><label class="form-label">Function</label><input type="text" id="jf-function" class="form-control" value="${g}"></div>
            <div class="form-group"><label class="form-label">Work Type *</label><input type="text" id="jf-type" class="form-control" value="${I}" placeholder="e.g. Photography / Video Edit" required></div>
            <div class="form-group"><label class="form-label">Priority</label>
              <select id="jf-priority" class="form-control">
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(E=>`<option value="${E}" ${c===E?"selected":""}>${E}</option>`).join("")}
              </select>
            </div>
            <div class="form-group"><label class="form-label">In Date *</label><input type="date" id="jf-indate" class="form-control" value="${m}" required></div>
            <div class="form-group"><label class="form-label">Due Date *</label><input type="date" id="jf-duedate" class="form-control" value="${y}" required></div>
            ${e?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="jf-status" class="form-control">
                  ${["NEW","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"].map(E=>`<option value="${E}" ${u===E?"selected":""}>${E}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <div class="form-group mt-4"><label class="form-label">Notes</label><textarea id="jf-notes" class="form-control" rows="3" placeholder="Job instructions and notes...">${T}</textarea></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Job Record</button>
        </form>
      `;A({title:e?`Edit Job: ${e}`:"Create New Job",content:S,size:"lg"}),document.getElementById("job-form").addEventListener("submit",async E=>{E.preventDefault();const B={Client:document.getElementById("jf-client").value.trim(),Company:document.getElementById("jf-company").value.trim(),Location:document.getElementById("jf-location").value.trim(),Function:document.getElementById("jf-function").value.trim(),WorkType:document.getElementById("jf-type").value.trim(),Priority:document.getElementById("jf-priority").value,InDate:document.getElementById("jf-indate").value,DueDate:document.getElementById("jf-duedate").value,Notes:document.getElementById("jf-notes").value.trim()};e&&document.getElementById("jf-status")&&(B.Status=document.getElementById("jf-status").value);try{e?await p.updateJob(e,B):await p.createJob(B),h(`Job ${e?"updated":"created"} successfully`,"success"),L(),s()}catch(N){h(N.message,"error")}})};document.getElementById("btn-new-job").addEventListener("click",()=>o()),document.getElementById("btn-refresh").addEventListener("click",s),document.getElementById("search-job").addEventListener("input",e=>{e.target.timeout&&clearTimeout(e.target.timeout),e.target.timeout=setTimeout(s,400)}),document.getElementById("filter-status").addEventListener("change",s),document.getElementById("filter-priority").addEventListener("change",s),s()}},F={async render(n){n.innerHTML=`
      <div class="page-header">
        <h2>Tasks Management</h2>
        ${D.canAccess("jobs")?'<button id="btn-new-task" class="btn btn-primary">+ New Task</button>':""}
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
    `,await(async()=>{var o;try{if(D.getRole()!=="EDITOR"){const e=await p.getUsers(),t=Array.isArray(e.data)?e.data:((o=e.data)==null?void 0:o.users)||e.users||[],a=document.getElementById("filter-assignee");a&&t.forEach(r=>{const i=r["User ID"]||r.id||r.userId,g=r.Name||r.name||"User",I=document.createElement("option");I.value=i,I.textContent=`${g} (${r.Department||r.department||"Staff"})`,a.appendChild(I)})}}catch{}})();const l=async()=>{var i;const o=document.getElementById("filter-status").value,e=document.getElementById("filter-assignee")?document.getElementById("filter-assignee").value:"";let t=new URLSearchParams;o&&t.append("status",o),e&&t.append("assignedTo",e);const a=t.toString()?`?${t.toString()}`:"",r=document.getElementById("tasks-table-container");$(r,{loading:!0});try{const g=await p.getTasks(a),I=Array.isArray(g.data)?g.data:((i=g.data)==null?void 0:i.tasks)||g.tasks||[];$(r,{columns:[{label:"Task ID",render:c=>`<strong>${c["Task ID"]||c.id||c.taskId||"-"}</strong>`},{label:"Title",render:c=>`<strong>${c.Title||c.title||"-"}</strong>`},{label:"Type",render:c=>`<span class="badge badge-primary">${c["Task Type"]||c.taskType||"-"}</span>`},{label:"Job ID",render:c=>c["Job ID"]||c.jobId||"-"},{label:"Assigned To",render:c=>c["Assigned Name"]||c.assignedName||c["Assigned To"]||c.assignedTo||"Unassigned"},{label:"Priority",render:c=>{const u=c.Priority||c.priority||"MEDIUM";return`<span class="badge badge-${u}">${u}</span>`}},{label:"Status",render:c=>{const u=c.Status||c.status||"PENDING";return`<span class="badge badge-${u}">${u}</span>`}},{label:"Due Date",render:c=>{const u=c["Due Date"]||c.dueDate;return u?new Date(u).toLocaleDateString():"-"}},{label:"Actions",render:c=>`<button class="btn btn-sm btn-outline edit-btn" data-id="${c["Task ID"]||c.id||c.taskId}">Edit</button>`}],data:I,emptyMessage:'No tasks found. Click "+ New Task" to create one.',onRowClick:c=>d(c["Task ID"]||c.id||c.taskId)}),r.querySelectorAll(".edit-btn").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation(),d(u.target.dataset.id)})})}catch(g){$(r,{error:g.message})}},d=async(o=null)=>{var B,N;let e={},t=[],a=[];try{if(o){const v=await p.getTask(o);e=v.data&&v.data.task?v.data.task:v.data||v}if(D.canAccess("jobs")){const v=await p.getUsers(),f=await p.getJobs(),k=Array.isArray(v.data)?v.data:((B=v.data)==null?void 0:B.users)||v.users||[],H=Array.isArray(f.data)?f.data:((N=f.data)==null?void 0:N.jobs)||f.jobs||[];t=k.filter(C=>(C.Status||C.status)==="ACTIVE"),a=H.filter(C=>(C.Status||C.status)!=="CANCELLED")}}catch(v){return h(v.message,"error")}const r=D.getRole()==="EDITOR",i=e["Job ID"]||e.jobId||"",g=e["Task Type"]||e.taskType||"HIGHLIGHTS",I=e.Title||e.title||"",c=e["Assigned To"]||e.assignedTo||"",u=e.Priority||e.priority||"MEDIUM",m=e.Status||e.status||"PENDING",y=e["Due Date"]||e.dueDate?(e["Due Date"]||e.dueDate).substring(0,10):"",T=e.Notes||e.notes||"",S=["HIGHLIGHTS","CUT","PRE WED","REEL","TEASER","SYSTEM","DELIVERY","CORRECTION","OTHER"],E=`
        <form id="task-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Job Reference *</label>
              ${o||r?`<input type="text" id="tf-job" class="form-control" value="${i}" disabled>`:`
                <select id="tf-job" class="form-control" required>
                  <option value="">Select Associated Job...</option>
                  ${a.map(v=>{const f=v["Job ID"]||v.id,k=v.Client||v.clientName||"Job";return`<option value="${f}" ${i===f?"selected":""}>${f} - ${k}</option>`}).join("")}
                </select>
              `}
            </div>
            
            <div class="form-group">
              <label class="form-label">Task Type *</label>
              <select id="tf-type" class="form-control" ${r?"disabled":"required"}>
                ${S.map(v=>`<option value="${v}" ${g===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group" style="grid-column: span 2">
              <label class="form-label">Task Title *</label>
              <input type="text" id="tf-title" class="form-control" placeholder="e.g. Color grading highlight reel" value="${I}" ${r?"disabled":"required"}>
            </div>
            
            ${r?"":`
              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select id="tf-assignee" class="form-control">
                  <option value="">Unassigned</option>
                  ${t.map(v=>{const f=v["User ID"]||v.id,k=v.Name||v.name;return`<option value="${f}" ${c===f?"selected":""}>${k} (${v.Department||v.department||"Staff"})</option>`}).join("")}
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
            
            ${o?`
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
            <textarea id="tf-notes" class="form-control" rows="3" placeholder="Additional notes or specifications...">${T}</textarea>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Save Task Record</button>
        </form>
      `;A({title:o?`Edit Task: ${o}`:"Create New Task",content:E,size:"lg"}),document.getElementById("task-form").addEventListener("submit",async v=>{v.preventDefault();try{if(o){const f={Notes:document.getElementById("tf-notes").value.trim()};if(document.getElementById("tf-status")&&(f.Status=document.getElementById("tf-status").value),!r){f.Title=document.getElementById("tf-title").value.trim(),f.TaskType=document.getElementById("tf-type").value,f.Priority=document.getElementById("tf-priority").value,f.DueDate=document.getElementById("tf-duedate").value;const k=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:null;k&&k!==c&&(f.AssignedTo=k)}await p.updateTask(o,f),h("Task updated successfully","success")}else{const f={JobId:document.getElementById("tf-job").value,TaskType:document.getElementById("tf-type").value,Title:document.getElementById("tf-title").value.trim(),Priority:document.getElementById("tf-priority").value,DueDate:document.getElementById("tf-duedate").value,Notes:document.getElementById("tf-notes").value.trim()},k=document.getElementById("tf-assignee")?document.getElementById("tf-assignee").value:"";k&&(f.AssignedTo=k),await p.createTask(f),h("Task created successfully","success")}L(),l()}catch(f){h(f.message,"error")}})};document.getElementById("btn-new-task")&&document.getElementById("btn-new-task").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",l),document.getElementById("filter-status").addEventListener("change",l),document.getElementById("filter-assignee")&&document.getElementById("filter-assignee").addEventListener("change",l),l()}},_={async render(n){n.innerHTML=`
      <h2>Team Overview</h2>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const l=(await p.getDecisionCenter()).data.employeeWorkload,d=`
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;document.getElementById("team-content").innerHTML=d,$(document.getElementById("team-table"),{columns:[{label:"Employee",key:"name"},{label:"Department",key:"department"},{label:"Open Tasks",key:"openTasks"},{label:"Capacity",key:"capacity"},{label:"Utilization",render:o=>{const e=o.utilization,t=e>90?"var(--danger)":e>75?"var(--warning)":"var(--success)";return`<div style="display:flex;align-items:center;gap:0.5rem">
              <div style="width:50px">${e}%</div>
              <div class="progress-bar-bg" style="width:100px;margin:0"><div class="progress-bar-fill" style="background-color:${t};width:${Math.min(e,100)}%"></div></div>
            </div>`}},{label:"Completed",key:"completedTasks"},{label:"Overdue",render:o=>`<span style="color:${o.overdueTasks>0?"var(--danger)":"inherit"}">${o.overdueTasks}</span>`},{label:"Signal",render:o=>`<span class="badge badge-${o.signal.includes("OVERLOADED")?"OVERLOADED":o.signal==="HIGH"?"HIGH-SIGNAL":"AVAILABLE"}">${o.signal}</span>`}],data:l,onRowClick:o=>{P.navigate(`/tasks?assigneeId=${o.id}`),window.location.hash="#/tasks",setTimeout(()=>{const e=document.getElementById("filter-assignee");e&&(e.value=o.id,e.dispatchEvent(new Event("change")))},100)}})}catch(s){document.getElementById("team-content").innerHTML=`<div style="color:var(--danger)">Failed to load team data: ${s.message}</div>`}}},Y={async render(n){n.innerHTML=`
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
    `;const s=async()=>{try{const e=(await p.getPaymentSummary()).data;document.getElementById("payment-summary").innerHTML=`
          <div class="card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${e.totalRevenue.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Total Advance</div><div class="stat-value">$${e.totalAdvance.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${e.totalOutstanding.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Pending Count</div><div class="stat-value">${e.pendingCount}</div></div>
        `}catch(o){console.error("Failed to load payment summary",o)}},l=async()=>{const o=document.getElementById("filter-status").value;let e=o?`?status=${o}`:"";const t=document.getElementById("payments-table-container");$(t,{loading:!0});try{const a=await p.getPayments(e);$(t,{columns:[{label:"ID",key:"id"},{label:"Client",key:"clientName"},{label:"Job ID",key:"jobId"},{label:"Amount",render:r=>`$${r.totalAmount.toLocaleString()}`},{label:"Advance",render:r=>`$${r.advancePayment.toLocaleString()}`},{label:"Balance",render:r=>`$${r.balance.toLocaleString()}`},{label:"Status",render:r=>`<span class="badge badge-${r.status}">${r.status}</span>`},{label:"Date",render:r=>new Date(r.dateStr).toLocaleDateString()},{label:"Actions",render:r=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
              `}],data:a.data,onRowClick:r=>d(r.id)}),t.querySelectorAll(".edit-btn").forEach(r=>{r.addEventListener("click",i=>{i.stopPropagation(),d(i.target.dataset.id)})})}catch(a){$(t,{error:a.message})}},d=async(o=null)=>{let e={totalAmount:0,advancePayment:0};if(o)try{e=(await p.getPayment(o)).data}catch(a){return h(a.message,"error")}const t=`
        <form id="payment-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="pf-job" class="form-control" value="${e.jobId||""}" ${o?"disabled":"required"}></div>
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="pf-client" class="form-control" value="${e.clientName||""}" required></div>
            <div class="form-group"><label class="form-label">Total Amount</label><input type="number" step="0.01" id="pf-total" class="form-control" value="${e.totalAmount}" required></div>
            <div class="form-group"><label class="form-label">Advance Payment</label><input type="number" step="0.01" id="pf-advance" class="form-control" value="${e.advancePayment}" required></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="pf-date" class="form-control" value="${e.dateStr?e.dateStr.substring(0,10):new Date().toISOString().substring(0,10)}" required></div>
            ${o?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="pf-status" class="form-control">
                  ${["PENDING","PARTIAL","PAID"].map(a=>`<option value="${a}" ${e.status===a?"selected":""}>${a}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Payment</button>
        </form>
      `;A({title:o?"Edit Payment":"New Payment",content:t}),document.getElementById("payment-form").addEventListener("submit",async a=>{a.preventDefault();const r={clientName:document.getElementById("pf-client").value,totalAmount:parseFloat(document.getElementById("pf-total").value),advancePayment:parseFloat(document.getElementById("pf-advance").value),dateStr:document.getElementById("pf-date").value};o||(r.jobId=document.getElementById("pf-job").value),o&&(r.status=document.getElementById("pf-status").value);try{o?await p.updatePayment(o,r):await p.createPayment(r),h(`Payment ${o?"updated":"created"}`,"success"),L(),s(),l()}catch(i){h(i.message,"error")}})};document.getElementById("btn-new-payment").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",()=>{s(),l()}),document.getElementById("filter-status").addEventListener("change",l),s(),l()}},K={render(n){n.innerHTML=`
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
    `;let s="monthly";const l=()=>{const o=document.getElementById("report-filters");if(s==="monthly"){const e=new Date;o.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Year</label><input type="number" id="rf-year" class="form-control" value="${e.getFullYear()}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">Month</label>
            <select id="rf-month" class="form-control">
              ${Array.from({length:12},(t,a)=>`<option value="${a+1}" ${e.getMonth()===a?"selected":""}>${new Date(2e3,a,1).toLocaleString("default",{month:"long"})}</option>`).join("")}
            </select>
          </div>
        `}else{const e=new Date().toISOString().substring(0,10),t=new Date(Date.now()-30*24*60*60*1e3).toISOString().substring(0,10);o.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Start Date</label><input type="date" id="rf-start" class="form-control" value="${t}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">End Date</label><input type="date" id="rf-end" class="form-control" value="${e}"></div>
        `}},d=async()=>{const o=document.getElementById("report-results");o.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{let e;if(s==="monthly"){const t=document.getElementById("rf-year").value,a=document.getElementById("rf-month").value;e=await p.getMonthlyReport(t,a),o.innerHTML=`
            <h3>Summary for ${t}-${a.padStart(2,"0")}</h3>
            <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
              <div class="card"><div class="stat-title">Completed Jobs</div><div class="stat-value">${e.data.summary.completedJobs}</div></div>
              <div class="card"><div class="stat-title">New Jobs</div><div class="stat-value">${e.data.summary.newJobs}</div></div>
              <div class="card"><div class="stat-title">Revenue Received</div><div class="stat-value">$${e.data.summary.revenueReceived.toLocaleString()}</div></div>
            </div>
            <h4>Jobs Breakdown</h4>
            <div id="rep-table"></div>
          `,$(document.getElementById("rep-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Work Type",key:"workType"},{label:"Status",key:"status"}],data:e.data.jobs})}else if(s==="employee"){const t=document.getElementById("rf-start").value,a=document.getElementById("rf-end").value;e=await p.getEmployeePerformanceReport(t,a),o.innerHTML=`<h3>Employee Performance (${t} to ${a})</h3><div id="rep-table" class="mt-4"></div>`,$(document.getElementById("rep-table"),{columns:[{label:"Employee ID",key:"employeeId"},{label:"Tasks Completed",key:"completedTasks"},{label:"Overdue Tasks",key:"overdueTasks"}],data:e.data})}else if(s==="worktype"){const t=document.getElementById("rf-start").value,a=document.getElementById("rf-end").value;e=await p.getWorkTypeReport(t,a),o.innerHTML=`<h3>Work Type Summary (${t} to ${a})</h3><div id="rep-table" class="mt-4"></div>`,$(document.getElementById("rep-table"),{columns:[{label:"Work Type",key:"workType"},{label:"Total Jobs",key:"count"},{label:"Total Value",render:r=>`$${r.totalValue.toLocaleString()}`}],data:e.data})}}catch(e){o.innerHTML=`<div style="color:var(--danger)">Error: ${e.message}</div>`}};document.querySelectorAll(".rep-tab").forEach(o=>{o.addEventListener("click",e=>{document.querySelectorAll(".rep-tab").forEach(t=>t.classList.remove("active")),e.target.classList.add("active"),s=e.target.dataset.type,l(),document.getElementById("report-results").innerHTML="Please select parameters and load report."})}),document.getElementById("btn-load-report").addEventListener("click",d),l()}},X={async render(n){n.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Users</h2>
        <button id="btn-new-user" class="btn btn-primary">+ New User</button>
      </div>
      <div id="users-table-container"></div>
    `;const s=async()=>{const e=document.getElementById("users-table-container");$(e,{loading:!0});try{const t=await p.getUsers();$(e,{columns:[{label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},{label:"Role",render:a=>`<span class="badge badge-IN_PROGRESS">${a.role}</span>`},{label:"Department",key:"department"},{label:"Capacity",key:"capacity"},{label:"Status",render:a=>`<span class="badge badge-${a.status}">${a.status}</span>`},{label:"Actions",render:a=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${a.id}">Edit</button>
                <button class="btn btn-sm btn-outline pw-btn" data-id="${a.id}">Reset PW</button>
                ${a.status==="ACTIVE"?`<button class="btn btn-sm btn-danger deact-btn" data-id="${a.id}">Deactivate</button>`:`<button class="btn btn-sm btn-success act-btn" data-id="${a.id}">Activate</button>`}
              `}],data:t.data}),e.querySelectorAll(".edit-btn").forEach(a=>a.addEventListener("click",r=>o(r.target.dataset.id))),e.querySelectorAll(".pw-btn").forEach(a=>a.addEventListener("click",r=>d(r.target.dataset.id))),e.querySelectorAll(".deact-btn").forEach(a=>a.addEventListener("click",r=>l(r.target.dataset.id,!1))),e.querySelectorAll(".act-btn").forEach(a=>a.addEventListener("click",r=>l(r.target.dataset.id,!0)))}catch(t){$(e,{error:t.message})}},l=async(e,t)=>{try{t?await p.activateUser(e):await p.deactivateUser(e),h(`User ${t?"activated":"deactivated"}`,"success"),s()}catch(a){h(a.message,"error")}},d=e=>{A({title:"Reset Password",content:`
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="pw-new" class="form-control" required></div>
          <button id="btn-reset-pw" class="btn btn-primary w-full mt-4">Update Password</button>
        `}),document.getElementById("btn-reset-pw").addEventListener("click",async()=>{const t=document.getElementById("pw-new").value;if(!t)return h("Password required","warning");try{await p.resetPassword(e,t),h("Password updated","success"),L()}catch(a){h(a.message,"error")}})},o=async(e=null)=>{let t={capacity:10,role:"EDITOR"};if(e)try{t=(await p.getUser(e)).data}catch(r){return h(r.message,"error")}const a=`
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
      `;A({title:e?"Edit User":"New User",content:a}),document.getElementById("user-form").addEventListener("submit",async r=>{r.preventDefault();const i={name:document.getElementById("uf-name").value,role:document.getElementById("uf-role").value,department:document.getElementById("uf-dept").value,capacity:parseInt(document.getElementById("uf-cap").value)};try{e?(await p.updateUser(e,i),i.role!==t.role&&await p.changeRole(e,i.role),h("User updated","success")):(i.email=document.getElementById("uf-email").value,i.password=document.getElementById("uf-pw").value,await p.createUser(i),h("User created","success")),L(),s()}catch(g){h(g.message,"error")}})};document.getElementById("btn-new-user").addEventListener("click",()=>o()),s()}},Q={async render(n){n.innerHTML=`
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
    `;const s=async()=>{const l=document.getElementById("filter-module").value,d=document.getElementById("filter-action").value;let o="?";l&&(o+=`module=${l}&`),d&&(o+=`action=${d}`);const e=document.getElementById("audit-table-container");$(e,{loading:!0});try{const t=await p.getAuditLog(o);$(e,{columns:[{label:"Timestamp",render:a=>new Date(a.timestamp).toLocaleString()},{label:"User",key:"userName"},{label:"Action",key:"action"},{label:"Module",key:"module"},{label:"Record ID",key:"recordId"},{label:"Changes",render:a=>a.action==="UPDATE"&&a.changes?`<div style="font-size:0.75rem; max-width:300px; overflow-x:auto;">
                  ${Object.entries(a.changes).map(([r,i])=>`${r}: ${i.old} → ${i.new}`).join("<br>")}
                </div>`:"-"}],data:t.data})}catch(t){$(e,{error:t.message})}};document.getElementById("btn-refresh").addEventListener("click",s),document.getElementById("filter-module").addEventListener("change",s),document.getElementById("filter-action").addEventListener("change",s),s()}},Z={async render(n){n.innerHTML=`
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
    `;const s=document.getElementById("sys-output");document.getElementById("btn-test-db").addEventListener("click",async()=>{s.style.display="block",s.textContent="Testing connection...";try{const l=await p.testDbConnection();s.textContent=JSON.stringify(l.data,null,2)}catch(l){s.textContent=`Error: ${l.message}`}}),document.getElementById("btn-discover").addEventListener("click",async()=>{s.style.display="block",s.textContent="Discovering sheets...";try{const l=await p.discoverSheets();s.textContent=JSON.stringify(l.data,null,2)}catch(l){s.textContent=`Error: ${l.message}`}});try{const d=(await p.getSettings()).data;let o='<form id="settings-form" class="grid grid-cols-2 gap-4">';for(const[e,t]of Object.entries(d))o+=`
          <div class="form-group">
            <label class="form-label">${e}</label>
            <input type="text" name="${e}" class="form-control" value="${t}">
          </div>
        `;o+='<div style="grid-column: span 2"><button type="submit" class="btn btn-primary">Save Settings</button></div>',o+="</form>",document.getElementById("settings-form-container").innerHTML=o,document.getElementById("settings-form").addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),a=Object.fromEntries(t.entries());try{await p.updateSettings(a),h("Settings saved successfully","success")}catch(r){h(r.message,"error")}})}catch(l){document.getElementById("settings-form-container").innerHTML=`<div style="color:var(--danger)">Error loading settings: ${l.message}</div>`}}};document.getElementById("app");const ee={"/login":{page:q},"/":{page:R,module:"dashboard"},"/decision-center":{page:G,module:"decision-center"},"/jobs":{page:V,module:"jobs"},"/tasks":{page:F,module:"tasks"},"/team":{page:_,module:"team"},"/payments":{page:Y,module:"payments"},"/reports":{page:K,module:"reports"},"/users":{page:X,module:"users"},"/audit":{page:Q,module:"audit"},"/settings":{page:Z,module:"settings"},"*":{page:R,module:"dashboard"}};function x(n,s){if(!n||!s)return;const l=n.page||n.render;l&&typeof l.render=="function"?l.render(s):typeof l=="function"&&l(s)}async function M(){const n=document.getElementById("app");if(n){try{const s=await p.getMe(),l=s.user||s.data&&s.data.user||s.data;l&&D.setUser(l)}catch{D.clearUser()}if(!document.getElementById("toast-container")){const s=document.createElement("div");s.id="toast-container",document.body.appendChild(s)}P.onRoute(s=>{if(!D.isAuthenticated())n.innerHTML="",x(s,n);else{W(n,D.getUser());const l=document.getElementById("page-content");l&&(l.innerHTML="",x(s,l))}}),P.init(ee)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M):M();

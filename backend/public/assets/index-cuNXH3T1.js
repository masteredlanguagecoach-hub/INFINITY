(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))d(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const a of e.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&d(a)}).observe(document,{childList:!0,subtree:!0});function l(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function d(t){if(t.ep)return;t.ep=!0;const e=l(t);fetch(t.href,e)}})();const A="/api";async function m(s,n={}){const l=`${A}${s}`,d={credentials:"include",...n,headers:{"Content-Type":"application/json",...n.headers}};try{const t=await fetch(l,d);let e;try{e=await t.json()}catch{if(!t.ok)throw new Error(`HTTP Error: ${t.status}`);return null}if(!t.ok||e.success===!1){const a=e.error,o=a&&a.message?a.message:typeof a=="string"?a:e.message||`Request failed (${t.status})`,i=new Error(o);throw i.code=a&&a.code||null,i.statusCode=t.status,i}return e}catch(t){throw console.error(`API Error on ${s}:`,t.message),t}}const c={login:(s,n)=>m("/auth/login",{method:"POST",body:JSON.stringify({email:s,password:n})}),logout:()=>m("/auth/logout",{method:"POST"}),getMe:()=>m("/auth/me"),getDashboard:()=>m("/dashboard"),getDecisionCenter:()=>m("/decision-center"),getJobs:(s="")=>m(`/jobs${s}`),getJob:s=>m(`/jobs/${s}`),createJob:s=>m("/jobs",{method:"POST",body:JSON.stringify(s)}),updateJob:(s,n)=>m(`/jobs/${s}`,{method:"PUT",body:JSON.stringify(n)}),deleteJob:s=>m(`/jobs/${s}`,{method:"DELETE"}),getTasks:(s="")=>m(`/tasks${s}`),getTask:s=>m(`/tasks/${s}`),createTask:s=>m("/tasks",{method:"POST",body:JSON.stringify(s)}),updateTask:(s,n)=>m(`/tasks/${s}`,{method:"PUT",body:JSON.stringify(n)}),assignTask:(s,n)=>m(`/tasks/${s}/assign`,{method:"POST",body:JSON.stringify(n)}),getUsers:()=>m("/users"),getUser:s=>m(`/users/${s}`),createUser:s=>m("/users",{method:"POST",body:JSON.stringify(s)}),updateUser:(s,n)=>m(`/users/${s}`,{method:"PUT",body:JSON.stringify(n)}),activateUser:s=>m(`/users/${s}/activate`,{method:"POST"}),deactivateUser:s=>m(`/users/${s}/deactivate`,{method:"POST"}),changeRole:(s,n)=>m(`/users/${s}/role`,{method:"PUT",body:JSON.stringify({role:n})}),resetPassword:(s,n)=>m(`/users/${s}/reset-password`,{method:"POST",body:JSON.stringify({password:n})}),getPayments:(s="")=>m(`/payments${s}`),getPayment:s=>m(`/payments/${s}`),createPayment:s=>m("/payments",{method:"POST",body:JSON.stringify(s)}),updatePayment:(s,n)=>m(`/payments/${s}`,{method:"PUT",body:JSON.stringify(n)}),getPaymentSummary:()=>m("/payments/summary"),getMonthlyReport:(s,n)=>m(`/reports/monthly?year=${s}&month=${n}`),getEmployeePerformanceReport:(s,n)=>m(`/reports/employee-performance?startDate=${s}&endDate=${n}`),getWorkTypeReport:(s,n)=>m(`/reports/work-type?startDate=${s}&endDate=${n}`),getDepartmentReport:(s,n)=>m(`/reports/department?startDate=${s}&endDate=${n}`),getAuditLog:(s="")=>m(`/audit${s}`),getSettings:()=>m("/settings"),updateSettings:s=>m("/settings",{method:"PUT",body:JSON.stringify(s)}),testDbConnection:()=>m("/settings/test-db"),discoverSheets:()=>m("/settings/discover")};let f=null;const C={ADMIN:["dashboard","decision-center","jobs","tasks","team","payments","reports","users","audit","settings"],MANAGER:["dashboard","decision-center","jobs","tasks","team","payments","reports","audit"],TEAM_LEADER:["dashboard","decision-center","jobs","tasks","team"],EDITOR:["dashboard","tasks","jobs","team"],DATA_ENTRY:["jobs","tasks"],VIEWER:["dashboard","decision-center","reports"]},g={getUser:()=>f,setUser:s=>{f=s},clearUser:()=>{f=null},isAuthenticated:()=>!!f,getRole:()=>(f==null?void 0:f.role)||null,canAccess:s=>!f||!f.role?!1:f.role==="ADMIN"?!0:(C[f.role]||[]).includes(s)};let D={},L=null;const T={init(s){D=s,window.addEventListener("hashchange",this.handleHashChange.bind(this)),this.handleHashChange()},navigate(s){window.location.hash=s},onRoute(s){L=s},handleHashChange(){const n=(window.location.hash.slice(1)||"/").split("?")[0];if(!g.isAuthenticated()&&n!=="/login")return this.navigate("/login");if(g.isAuthenticated()&&n==="/login")return this.navigate("/");let l=D[n]||D["*"];if(l){if(l.module&&!g.canAccess(l.module))return console.warn(`Access denied to module ${l.module}`),this.navigate("/");L&&L(l)}}};function P(s,n){if(document.getElementById("sidebar"))return;const d=[{name:"Dashboard",path:"#/",module:"dashboard",icon:"📊"},{name:"Decision Center",path:"#/decision-center",module:"decision-center",icon:"🎯"},{name:"Jobs",path:"#/jobs",module:"jobs",icon:"💼"},{name:"Tasks",path:"#/tasks",module:"tasks",icon:"📋"},{name:"Team",path:"#/team",module:"team",icon:"👥"},{name:"Payments",path:"#/payments",module:"payments",icon:"💰"},{name:"Reports",path:"#/reports",module:"reports",icon:"📈"},{name:"Users",path:"#/users",module:"users",icon:"⚙️"},{name:"Audit Log",path:"#/audit",module:"audit",icon:"📝"},{name:"Settings",path:"#/settings",module:"settings",icon:"🔧"}].filter(a=>g.canAccess(a.module));s.innerHTML=`
    <div id="sidebar">
      <div class="sidebar-header">PDC Center</div>
      <nav class="sidebar-nav">
        ${d.map(a=>`
          <a href="${a.path}" class="nav-link" data-path="${a.path}">
            ${a.icon} ${a.name}
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
  `;const t=()=>{const a=window.location.hash||"#/";document.querySelectorAll(".nav-link").forEach(o=>{o.getAttribute("href")===a?o.classList.add("active"):o.classList.remove("active")})};window.addEventListener("hashchange",t),t();const e=document.getElementById("sidebar");document.getElementById("menu-toggle").addEventListener("click",()=>{e.classList.toggle("open")}),document.getElementById("main-wrapper").addEventListener("click",a=>{window.innerWidth<=768&&a.target.id!=="menu-toggle"&&e.classList.remove("open")}),document.getElementById("logout-btn").addEventListener("click",async()=>{try{await c.logout()}catch(a){console.error(a)}g.clearUser(),window.location.hash="#/login",window.location.reload()})}function v(s,n="info"){const l=document.getElementById("toast-container");if(!l)return;const d=document.createElement("div");d.className=`toast toast-${n}`,d.textContent=s,l.appendChild(d),setTimeout(()=>{d.style.opacity="0",d.style.transition="opacity 0.3s ease",setTimeout(()=>d.remove(),300)},4e3)}const N={render(s){s.innerHTML=`
      <div style="display:flex; height:100vh; align-items:center; justify-content:center; background:var(--bg);">
        <div class="card" style="width:100%; max-width:400px;">
          <h2 class="text-center" style="margin-bottom:1.5rem; color:var(--primary);">PRODUCTION DECISION CENTER</h2>
          <form id="login-form">
            <div id="login-error" style="color:var(--danger); margin-bottom:1rem; text-align:center; display:none;"></div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position:relative;">
                <input type="password" id="password" class="form-control" required>
                <button type="button" id="toggle-pw" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer;">👁️</button>
              </div>
            </div>
            <button type="submit" id="submit-btn" class="btn btn-primary w-full mt-4">Sign In</button>
          </form>
        </div>
      </div>
    `;const n=document.getElementById("login-form"),l=document.getElementById("toggle-pw"),d=document.getElementById("password"),t=document.getElementById("login-error"),e=document.getElementById("submit-btn");l.addEventListener("click",()=>{d.type==="password"?d.type="text":d.type="password"}),n.addEventListener("submit",async a=>{a.preventDefault();const o=document.getElementById("email").value,i=d.value;t.style.display="none",e.disabled=!0,e.innerHTML='<div class="loader" style="width:16px;height:16px;border-width:2px;"></div>';try{const r=await c.login(o,i),u=r.user||r.data&&r.data.user||r.data;if(u)g.setUser(u),T.navigate("/");else throw new Error("Invalid login response from server")}catch(r){t.textContent=r.message,t.style.display="block",e.disabled=!1,e.textContent="Sign In"}})}},S={async render(s){s.innerHTML=`
      <h2>Dashboard</h2>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const l=(await c.getDashboard()).data,d=`
        <div class="dashboard-grid">
          <div class="card stat-card"><div class="stat-title">Total Jobs</div><div class="stat-value">${l.kpis.totalJobs}</div></div>
          <div class="card stat-card"><div class="stat-title">Open Tasks</div><div class="stat-value">${l.kpis.openTasks}</div></div>
          <div class="card stat-card"><div class="stat-title">Completed Tasks</div><div class="stat-value">${l.kpis.completedTasks}</div></div>
          <div class="card stat-card"><div class="stat-title">Overdue Tasks</div><div class="stat-value" style="color:var(--danger)">${l.kpis.overdueTasks}</div></div>
          <div class="card stat-card"><div class="stat-title">Completion Rate</div><div class="stat-value">${l.kpis.completionRate}%</div></div>
          <div class="card stat-card"><div class="stat-title">Active Employees</div><div class="stat-value">${l.kpis.activeEmployees}</div></div>
          <div class="card stat-card"><div class="stat-title">Overloaded Employees</div><div class="stat-value" style="color:var(--danger)">${l.kpis.overloadedEmployees}</div></div>
          <div class="card stat-card"><div class="stat-title">Pending Payments</div><div class="stat-value">${l.kpis.pendingPayments}</div></div>
          <div class="card stat-card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${l.kpis.revenue.toLocaleString()}</div></div>
          <div class="card stat-card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${l.kpis.outstandingBalance.toLocaleString()}</div></div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="card">
            <h3>Task Status Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.entries(l.taskStatusDist).map(([t,e])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                  <span>${t}</span>
                  <strong>${e}</strong>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="card">
            <h3>Work Type Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.entries(l.workTypeDist).map(([t,e])=>`
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                  <span>${t}</span>
                  <strong>${e}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <h3>Workload by Employee</h3>
          <div style="margin-top:1rem;">
            ${l.employeeWorkload.map(t=>{const e=t.utilization,a=e>90?"progress-red":e>75?"progress-orange":"progress-green";return`
                <div style="margin-bottom:1rem;">
                  <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
                    <span>${t.name}</span>
                    <span>${e}% (${t.openTasks}/${t.capacity})</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${a}" style="width: ${Math.min(e,100)}%;"></div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <div class="card">
          <h3>Recent Activity</h3>
          <div style="margin-top:1rem;">
            ${l.recentActivity.map(t=>`
              <div style="padding:0.5rem 0; border-bottom:1px solid var(--border); font-size:0.875rem;">
                <strong style="display:inline-block; width:150px;">${new Date(t.timestamp).toLocaleString()}</strong>
                <span><strong>${t.userName}</strong> ${t.action} ${t.module} (ID: ${t.recordId})</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;document.getElementById("dash-content").innerHTML=d}catch(n){document.getElementById("dash-content").innerHTML=`<div style="color:var(--danger)">Failed to load dashboard: ${n.message}</div>`}}};function b(s,{columns:n,data:l,loading:d,error:t,onRowClick:e,emptyMessage:a="No records found"}){if(d){s.innerHTML='<div class="loader-container"><div class="loader"></div></div>';return}if(t){s.innerHTML=`<div style="color:var(--danger); padding: 1rem;">Error loading data: ${t}</div>`;return}if(!l||l.length===0){s.innerHTML=`<div style="padding: 1rem; color: var(--text-muted); text-align: center;">${a}</div>`;return}const o=document.createElement("div");o.className="table-container table-responsive-mobile";const i=document.createElement("table"),r=document.createElement("thead"),u=document.createElement("tr");n.forEach(y=>{const I=document.createElement("th");I.textContent=y.label,u.appendChild(I)}),r.appendChild(u),i.appendChild(r);const p=document.createElement("tbody");l.forEach((y,I)=>{const k=document.createElement("tr");e&&(k.classList.add("clickable"),k.addEventListener("click",E=>{E.target.tagName.toLowerCase()==="button"||E.target.closest("button")||e(y)})),n.forEach(E=>{const w=document.createElement("td");w.setAttribute("data-label",E.label),E.render?w.innerHTML=E.render(y,I):w.textContent=y[E.key]||"",k.appendChild(w)}),p.appendChild(k)}),i.appendChild(p),o.appendChild(i),s.innerHTML="",s.appendChild(o)}const j={async render(s){s.innerHTML=`
      <h2>Decision Center</h2>
      <div id="dc-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const l=(await c.getDecisionCenter()).data;let d="";l.alerts&&l.alerts.length>0&&(d+=`
          <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <h3 style="color:var(--danger)">Critical Alerts</h3>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
              ${l.alerts.map(t=>`<li>${t}</li>`).join("")}
            </ul>
          </div>
        `),d+=`
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="card"><div class="stat-title">Highest Workload</div><div class="stat-value" style="font-size:1.25rem;">${l.insights.highestWorkloadEmployee}</div></div>
          <div class="card"><div class="stat-title">Highest Overdue</div><div class="stat-value" style="font-size:1.25rem;color:var(--danger)">${l.insights.highestOverdueEmployee}</div></div>
          <div class="card"><div class="stat-title">Highest Backlog Type</div><div class="stat-value" style="font-size:1.25rem;">${l.insights.highestBacklogTaskType}</div></div>
          <div class="card"><div class="stat-title">Bottleneck Depts</div><div class="stat-value" style="font-size:1.25rem;">${l.insights.bottleneckDepartments.join(", ")||"None"}</div></div>
        </div>
      `,d+='<div class="card mb-4"><h3>Employee Workload</h3><div id="emp-table-container"></div></div>',d+=`<div class="grid grid-cols-2 gap-4">
                <div class="card"><h3>Jobs Approaching Deadline (7 days)</h3><div id="approaching-table"></div></div>
                <div class="card"><h3>Overdue Jobs</h3><div id="overdue-table"></div></div>
               </div>`,document.getElementById("dc-content").innerHTML=d,b(document.getElementById("emp-table-container"),{columns:[{label:"Employee",key:"name"},{label:"Dept",key:"department"},{label:"Open",key:"openTasks"},{label:"Completed",key:"completedTasks"},{label:"Overdue",render:t=>`<span style="color:${t.overdueTasks>0?"var(--danger)":"inherit"}">${t.overdueTasks}</span>`},{label:"Capacity",key:"capacity"},{label:"Util %",render:t=>{const e=t.utilization,a=e>90?"var(--danger)":e>75?"var(--warning)":"var(--success)";return`<div style="display:flex;align-items:center;gap:0.5rem">
              <div style="width:50px">${e}%</div>
              <div class="progress-bar-bg" style="width:100px;margin:0"><div class="progress-bar-fill" style="background-color:${a};width:${Math.min(e,100)}%"></div></div>
            </div>`}},{label:"Signal",render:t=>`<span class="badge badge-${t.signal.includes("OVERLOADED")?"OVERLOADED":t.signal==="HIGH"?"HIGH-SIGNAL":"AVAILABLE"}">${t.signal}</span>`}],data:l.employeeWorkload}),b(document.getElementById("approaching-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Due Date",render:t=>new Date(t.dueDate).toLocaleDateString()}],data:l.insights.jobsApproachingDeadline,emptyMessage:"No jobs approaching deadline"}),b(document.getElementById("overdue-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Due Date",render:t=>`<span style="color:var(--danger)">${new Date(t.dueDate).toLocaleDateString()}</span>`}],data:l.insights.overdueJobs,emptyMessage:"No overdue jobs"})}catch(n){document.getElementById("dc-content").innerHTML=`<div style="color:var(--danger)">Failed to load data: ${n.message}</div>`}}};function $({title:s,content:n,actions:l="",size:d=""}){h();const t=document.createElement("div");t.className="modal-overlay",t.id="active-modal",t.innerHTML=`
    <div class="modal-content ${d?`modal-${d}`:""}">
      <div class="modal-header">
        <h3 style="margin:0">${s}</h3>
        <button class="btn btn-outline" id="modal-close-x" style="border:none; background:none; font-size:1.5rem; line-height:1; padding:0;">&times;</button>
      </div>
      <div class="modal-body">
        ${n}
      </div>
      ${l?`<div class="modal-footer">${l}</div>`:""}
    </div>
  `,document.body.appendChild(t);const e=document.getElementById("modal-close-x");return e&&e.addEventListener("click",h),t.addEventListener("click",a=>{a.target===t&&h()}),t}function h(){const s=document.getElementById("active-modal");s&&s.remove()}function O({title:s,message:n,onConfirm:l}){$({title:s,content:`<p>${n}</p>`,actions:`
      <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Confirm</button>
    `}),document.getElementById("confirm-cancel").addEventListener("click",h),document.getElementById("confirm-ok").addEventListener("click",()=>{h(),l&&l()})}const x={async render(s){s.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Jobs</h2>
        <button id="btn-new-job" class="btn btn-primary">+ New Job</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center;">
        <input type="text" id="search-job" class="form-control" placeholder="Search Client/Company..." style="max-width:200px;">
        <select id="filter-status" class="form-control" style="max-width:150px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select id="filter-priority" class="form-control" style="max-width:150px;">
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="jobs-table-container"></div>
    `;const n=async()=>{const e=document.getElementById("search-job").value,a=document.getElementById("filter-status").value,o=document.getElementById("filter-priority").value;let i="?";e&&(i+=`search=${encodeURIComponent(e)}&`),a&&(i+=`status=${a}&`),o&&(i+=`priority=${o}`);const r=document.getElementById("jobs-table-container");b(r,{loading:!0});try{const u=await c.getJobs(i);b(r,{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Company",key:"companyName"},{label:"Work Type",key:"workType"},{label:"Priority",render:p=>`<span class="badge badge-${p.priority}">${p.priority}</span>`},{label:"Status",render:p=>`<span class="badge badge-${p.status}">${p.status}</span>`},{label:"Due Date",render:p=>new Date(p.dueDate).toLocaleDateString()},{label:"Actions",render:p=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger del-btn" data-id="${p.id}">Del</button>
              `}],data:u.data,onRowClick:p=>d(p.id)}),r.querySelectorAll(".edit-btn").forEach(p=>{p.addEventListener("click",y=>{y.stopPropagation(),t(y.target.dataset.id)})}),r.querySelectorAll(".del-btn").forEach(p=>{p.addEventListener("click",y=>{y.stopPropagation(),l(y.target.dataset.id)})})}catch(u){b(r,{error:u.message})}},l=e=>{O({title:"Delete Job",message:`Are you sure you want to delete job ${e}?`,onConfirm:async()=>{try{await c.deleteJob(e),v("Job deleted","success"),n()}catch(a){v(a.message,"error")}}})},d=async e=>{try{const o=(await c.getJob(e)).data,i=`
          <div class="grid grid-cols-2 gap-4">
            <div><strong>Client:</strong> ${o.clientName}</div>
            <div><strong>Company:</strong> ${o.companyName||"-"}</div>
            <div><strong>Work Type:</strong> ${o.workType}</div>
            <div><strong>Status:</strong> <span class="badge badge-${o.status}">${o.status}</span></div>
            <div><strong>Priority:</strong> <span class="badge badge-${o.priority}">${o.priority}</span></div>
            <div><strong>Due Date:</strong> ${new Date(o.dueDate).toLocaleDateString()}</div>
          </div>
          <div class="mt-4"><strong>Notes:</strong><p>${o.notes||"-"}</p></div>
        `;$({title:`Job Detail: ${o.id}`,content:i,size:"lg"})}catch(a){v(a.message,"error")}},t=async(e=null)=>{let a={};if(e)try{a=(await c.getJob(e)).data}catch(i){return v(i.message,"error")}const o=`
        <form id="job-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="jf-client" class="form-control" value="${a.clientName||""}" required></div>
            <div class="form-group"><label class="form-label">Company Name</label><input type="text" id="jf-company" class="form-control" value="${a.companyName||""}"></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" id="jf-location" class="form-control" value="${a.location||""}"></div>
            <div class="form-group"><label class="form-label">Function</label><input type="text" id="jf-function" class="form-control" value="${a.function||""}"></div>
            <div class="form-group"><label class="form-label">Work Type</label><input type="text" id="jf-type" class="form-control" value="${a.workType||""}" required></div>
            <div class="form-group"><label class="form-label">Priority</label>
              <select id="jf-priority" class="form-control">
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(i=>`<option value="${i}" ${a.priority===i?"selected":""}>${i}</option>`).join("")}
              </select>
            </div>
            <div class="form-group"><label class="form-label">In Date</label><input type="date" id="jf-indate" class="form-control" value="${a.inDate?a.inDate.substring(0,10):""}" required></div>
            <div class="form-group"><label class="form-label">Due Date</label><input type="date" id="jf-duedate" class="form-control" value="${a.dueDate?a.dueDate.substring(0,10):""}" required></div>
            ${e?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="jf-status" class="form-control">
                  ${["PENDING","ACTIVE","COMPLETED","CANCELLED"].map(i=>`<option value="${i}" ${a.status===i?"selected":""}>${i}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <div class="form-group mt-4"><label class="form-label">Notes</label><textarea id="jf-notes" class="form-control" rows="3">${a.notes||""}</textarea></div>
          <button type="submit" class="btn btn-primary w-full">Save Job</button>
        </form>
      `;$({title:e?"Edit Job":"New Job",content:o,size:"lg"}),document.getElementById("job-form").addEventListener("submit",async i=>{i.preventDefault();const r={clientName:document.getElementById("jf-client").value,companyName:document.getElementById("jf-company").value,location:document.getElementById("jf-location").value,function:document.getElementById("jf-function").value,workType:document.getElementById("jf-type").value,priority:document.getElementById("jf-priority").value,inDate:document.getElementById("jf-indate").value,dueDate:document.getElementById("jf-duedate").value,notes:document.getElementById("jf-notes").value};e&&(r.status=document.getElementById("jf-status").value);try{e?await c.updateJob(e,r):await c.createJob(r),v(`Job ${e?"updated":"created"} successfully`,"success"),h(),n()}catch(u){v(u.message,"error")}})};document.getElementById("btn-new-job").addEventListener("click",()=>t()),document.getElementById("btn-refresh").addEventListener("click",n),document.getElementById("search-job").addEventListener("input",e=>{e.target.timeout&&clearTimeout(e.target.timeout),e.target.timeout=setTimeout(n,500)}),document.getElementById("filter-status").addEventListener("change",n),document.getElementById("filter-priority").addEventListener("change",n),n()}},R={async render(s){s.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Tasks</h2>
        ${g.canAccess("jobs")?'<button id="btn-new-task" class="btn btn-primary">+ New Task</button>':""}
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <select id="filter-status" class="form-control" style="max-width:150px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <select id="filter-assignee" class="form-control" style="max-width:150px;">
          <option value="">All Assignees</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="tasks-table-container"></div>
    `,await(async()=>{try{if(g.getRole()!=="EDITOR"){const t=await c.getUsers(),e=document.getElementById("filter-assignee");t.data.forEach(a=>{const o=document.createElement("option");o.value=a.id,o.textContent=a.name,e.appendChild(o)})}}catch{}})();const l=async()=>{const t=document.getElementById("filter-status").value,e=document.getElementById("filter-assignee")?document.getElementById("filter-assignee").value:"";let a="?";t&&(a+=`status=${t}&`),e&&(a+=`assigneeId=${e}`);const o=document.getElementById("tasks-table-container");b(o,{loading:!0});try{const i=await c.getTasks(a);b(o,{columns:[{label:"Task ID",key:"id"},{label:"Title",key:"title"},{label:"Type",key:"taskType"},{label:"Job ID",key:"jobId"},{label:"Assigned To",key:"assigneeName"},{label:"Priority",render:r=>`<span class="badge badge-${r.priority}">${r.priority}</span>`},{label:"Status",render:r=>`<span class="badge badge-${r.status}">${r.status}</span>`},{label:"Due Date",render:r=>new Date(r.dueDate).toLocaleDateString()},{label:"Actions",render:r=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
              `}],data:i.data,onRowClick:r=>d(r.id)}),o.querySelectorAll(".edit-btn").forEach(r=>{r.addEventListener("click",u=>{u.stopPropagation(),d(u.target.dataset.id)})})}catch(i){b(o,{error:i.message})}},d=async(t=null)=>{let e={},a=[];try{t&&(e=(await c.getTask(t)).data),g.canAccess("jobs")&&(a=(await c.getUsers()).data.filter(u=>u.status==="ACTIVE"))}catch(r){return v(r.message,"error")}const o=g.getRole()==="EDITOR",i=`
        <form id="task-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="tf-job" class="form-control" value="${e.jobId||""}" ${t||o?"disabled":"required"}></div>
            <div class="form-group"><label class="form-label">Task Type</label><input type="text" id="tf-type" class="form-control" value="${e.taskType||""}" ${o?"disabled":"required"}></div>
            <div class="form-group" style="grid-column: span 2"><label class="form-label">Title</label><input type="text" id="tf-title" class="form-control" value="${e.title||""}" ${o?"disabled":"required"}></div>
            
            ${o?"":`
              <div class="form-group"><label class="form-label">Assignee</label>
                <select id="tf-assignee" class="form-control">
                  <option value="">Unassigned</option>
                  ${a.map(r=>`<option value="${r.id}" ${e.assigneeId===r.id?"selected":""}>${r.name} (${r.department})</option>`).join("")}
                </select>
              </div>
            `}
            
            <div class="form-group"><label class="form-label">Priority</label>
              <select id="tf-priority" class="form-control" ${o?"disabled":""}>
                ${["LOW","MEDIUM","HIGH","CRITICAL"].map(r=>`<option value="${r}" ${e.priority===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Due Date</label><input type="date" id="tf-duedate" class="form-control" value="${e.dueDate?e.dueDate.substring(0,10):""}" ${o?"disabled":"required"}></div>
            ${t?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="tf-status" class="form-control">
                  ${["PENDING","IN_PROGRESS","COMPLETED"].map(r=>`<option value="${r}" ${e.status===r?"selected":""}>${r}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <div class="form-group mt-4"><label class="form-label">Notes</label><textarea id="tf-notes" class="form-control" rows="3">${e.notes||""}</textarea></div>
          <button type="submit" class="btn btn-primary w-full">Save Task</button>
        </form>
      `;$({title:t?"Edit Task":"New Task",content:i,size:"lg"}),document.getElementById("task-form").addEventListener("submit",async r=>{r.preventDefault();try{if(t){const u={notes:document.getElementById("tf-notes").value};if(document.getElementById("tf-status")&&(u.status=document.getElementById("tf-status").value),!o){u.title=document.getElementById("tf-title").value,u.taskType=document.getElementById("tf-type").value,u.priority=document.getElementById("tf-priority").value,u.dueDate=document.getElementById("tf-duedate").value;const p=document.getElementById("tf-assignee").value;p!==e.assigneeId&&await c.assignTask(t,{assigneeId:p||null})}await c.updateTask(t,u),v("Task updated","success")}else{const u={jobId:document.getElementById("tf-job").value,taskType:document.getElementById("tf-type").value,title:document.getElementById("tf-title").value,priority:document.getElementById("tf-priority").value,dueDate:document.getElementById("tf-duedate").value,notes:document.getElementById("tf-notes").value},p=document.getElementById("tf-assignee").value;p&&(u.assigneeId=p),await c.createTask(u),v("Task created","success")}h(),l()}catch(u){v(u.message,"error")}})};document.getElementById("btn-new-task")&&document.getElementById("btn-new-task").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",l),document.getElementById("filter-status").addEventListener("change",l),document.getElementById("filter-assignee")&&document.getElementById("filter-assignee").addEventListener("change",l),l()}},M={async render(s){s.innerHTML=`
      <h2>Team Overview</h2>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;try{const l=(await c.getDecisionCenter()).data.employeeWorkload,d=`
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;document.getElementById("team-content").innerHTML=d,b(document.getElementById("team-table"),{columns:[{label:"Employee",key:"name"},{label:"Department",key:"department"},{label:"Open Tasks",key:"openTasks"},{label:"Capacity",key:"capacity"},{label:"Utilization",render:t=>{const e=t.utilization,a=e>90?"var(--danger)":e>75?"var(--warning)":"var(--success)";return`<div style="display:flex;align-items:center;gap:0.5rem">
              <div style="width:50px">${e}%</div>
              <div class="progress-bar-bg" style="width:100px;margin:0"><div class="progress-bar-fill" style="background-color:${a};width:${Math.min(e,100)}%"></div></div>
            </div>`}},{label:"Completed",key:"completedTasks"},{label:"Overdue",render:t=>`<span style="color:${t.overdueTasks>0?"var(--danger)":"inherit"}">${t.overdueTasks}</span>`},{label:"Signal",render:t=>`<span class="badge badge-${t.signal.includes("OVERLOADED")?"OVERLOADED":t.signal==="HIGH"?"HIGH-SIGNAL":"AVAILABLE"}">${t.signal}</span>`}],data:l,onRowClick:t=>{T.navigate(`/tasks?assigneeId=${t.id}`),window.location.hash="#/tasks",setTimeout(()=>{const e=document.getElementById("filter-assignee");e&&(e.value=t.id,e.dispatchEvent(new Event("change")))},100)}})}catch(n){document.getElementById("team-content").innerHTML=`<div style="color:var(--danger)">Failed to load team data: ${n.message}</div>`}}},H={async render(s){s.innerHTML=`
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
    `;const n=async()=>{try{const e=(await c.getPaymentSummary()).data;document.getElementById("payment-summary").innerHTML=`
          <div class="card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${e.totalRevenue.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Total Advance</div><div class="stat-value">$${e.totalAdvance.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${e.totalOutstanding.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Pending Count</div><div class="stat-value">${e.pendingCount}</div></div>
        `}catch(t){console.error("Failed to load payment summary",t)}},l=async()=>{const t=document.getElementById("filter-status").value;let e=t?`?status=${t}`:"";const a=document.getElementById("payments-table-container");b(a,{loading:!0});try{const o=await c.getPayments(e);b(a,{columns:[{label:"ID",key:"id"},{label:"Client",key:"clientName"},{label:"Job ID",key:"jobId"},{label:"Amount",render:i=>`$${i.totalAmount.toLocaleString()}`},{label:"Advance",render:i=>`$${i.advancePayment.toLocaleString()}`},{label:"Balance",render:i=>`$${i.balance.toLocaleString()}`},{label:"Status",render:i=>`<span class="badge badge-${i.status}">${i.status}</span>`},{label:"Date",render:i=>new Date(i.dateStr).toLocaleDateString()},{label:"Actions",render:i=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${i.id}">Edit</button>
              `}],data:o.data,onRowClick:i=>d(i.id)}),a.querySelectorAll(".edit-btn").forEach(i=>{i.addEventListener("click",r=>{r.stopPropagation(),d(r.target.dataset.id)})})}catch(o){b(a,{error:o.message})}},d=async(t=null)=>{let e={totalAmount:0,advancePayment:0};if(t)try{e=(await c.getPayment(t)).data}catch(o){return v(o.message,"error")}const a=`
        <form id="payment-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="pf-job" class="form-control" value="${e.jobId||""}" ${t?"disabled":"required"}></div>
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="pf-client" class="form-control" value="${e.clientName||""}" required></div>
            <div class="form-group"><label class="form-label">Total Amount</label><input type="number" step="0.01" id="pf-total" class="form-control" value="${e.totalAmount}" required></div>
            <div class="form-group"><label class="form-label">Advance Payment</label><input type="number" step="0.01" id="pf-advance" class="form-control" value="${e.advancePayment}" required></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="pf-date" class="form-control" value="${e.dateStr?e.dateStr.substring(0,10):new Date().toISOString().substring(0,10)}" required></div>
            ${t?`
              <div class="form-group"><label class="form-label">Status</label>
                <select id="pf-status" class="form-control">
                  ${["PENDING","PARTIAL","PAID"].map(o=>`<option value="${o}" ${e.status===o?"selected":""}>${o}</option>`).join("")}
                </select>
              </div>
            `:""}
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Payment</button>
        </form>
      `;$({title:t?"Edit Payment":"New Payment",content:a}),document.getElementById("payment-form").addEventListener("submit",async o=>{o.preventDefault();const i={clientName:document.getElementById("pf-client").value,totalAmount:parseFloat(document.getElementById("pf-total").value),advancePayment:parseFloat(document.getElementById("pf-advance").value),dateStr:document.getElementById("pf-date").value};t||(i.jobId=document.getElementById("pf-job").value),t&&(i.status=document.getElementById("pf-status").value);try{t?await c.updatePayment(t,i):await c.createPayment(i),v(`Payment ${t?"updated":"created"}`,"success"),h(),n(),l()}catch(r){v(r.message,"error")}})};document.getElementById("btn-new-payment").addEventListener("click",()=>d()),document.getElementById("btn-refresh").addEventListener("click",()=>{n(),l()}),document.getElementById("filter-status").addEventListener("change",l),n(),l()}},J={render(s){s.innerHTML=`
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
    `;let n="monthly";const l=()=>{const t=document.getElementById("report-filters");if(n==="monthly"){const e=new Date;t.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Year</label><input type="number" id="rf-year" class="form-control" value="${e.getFullYear()}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">Month</label>
            <select id="rf-month" class="form-control">
              ${Array.from({length:12},(a,o)=>`<option value="${o+1}" ${e.getMonth()===o?"selected":""}>${new Date(2e3,o,1).toLocaleString("default",{month:"long"})}</option>`).join("")}
            </select>
          </div>
        `}else{const e=new Date().toISOString().substring(0,10),a=new Date(Date.now()-30*24*60*60*1e3).toISOString().substring(0,10);t.innerHTML=`
          <div class="form-group" style="margin:0"><label class="form-label">Start Date</label><input type="date" id="rf-start" class="form-control" value="${a}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">End Date</label><input type="date" id="rf-end" class="form-control" value="${e}"></div>
        `}},d=async()=>{const t=document.getElementById("report-results");t.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{let e;if(n==="monthly"){const a=document.getElementById("rf-year").value,o=document.getElementById("rf-month").value;e=await c.getMonthlyReport(a,o),t.innerHTML=`
            <h3>Summary for ${a}-${o.padStart(2,"0")}</h3>
            <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
              <div class="card"><div class="stat-title">Completed Jobs</div><div class="stat-value">${e.data.summary.completedJobs}</div></div>
              <div class="card"><div class="stat-title">New Jobs</div><div class="stat-value">${e.data.summary.newJobs}</div></div>
              <div class="card"><div class="stat-title">Revenue Received</div><div class="stat-value">$${e.data.summary.revenueReceived.toLocaleString()}</div></div>
            </div>
            <h4>Jobs Breakdown</h4>
            <div id="rep-table"></div>
          `,b(document.getElementById("rep-table"),{columns:[{label:"Job ID",key:"id"},{label:"Client",key:"clientName"},{label:"Work Type",key:"workType"},{label:"Status",key:"status"}],data:e.data.jobs})}else if(n==="employee"){const a=document.getElementById("rf-start").value,o=document.getElementById("rf-end").value;e=await c.getEmployeePerformanceReport(a,o),t.innerHTML=`<h3>Employee Performance (${a} to ${o})</h3><div id="rep-table" class="mt-4"></div>`,b(document.getElementById("rep-table"),{columns:[{label:"Employee ID",key:"employeeId"},{label:"Tasks Completed",key:"completedTasks"},{label:"Overdue Tasks",key:"overdueTasks"}],data:e.data})}else if(n==="worktype"){const a=document.getElementById("rf-start").value,o=document.getElementById("rf-end").value;e=await c.getWorkTypeReport(a,o),t.innerHTML=`<h3>Work Type Summary (${a} to ${o})</h3><div id="rep-table" class="mt-4"></div>`,b(document.getElementById("rep-table"),{columns:[{label:"Work Type",key:"workType"},{label:"Total Jobs",key:"count"},{label:"Total Value",render:i=>`$${i.totalValue.toLocaleString()}`}],data:e.data})}}catch(e){t.innerHTML=`<div style="color:var(--danger)">Error: ${e.message}</div>`}};document.querySelectorAll(".rep-tab").forEach(t=>{t.addEventListener("click",e=>{document.querySelectorAll(".rep-tab").forEach(a=>a.classList.remove("active")),e.target.classList.add("active"),n=e.target.dataset.type,l(),document.getElementById("report-results").innerHTML="Please select parameters and load report."})}),document.getElementById("btn-load-report").addEventListener("click",d),l()}},U={async render(s){s.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Users</h2>
        <button id="btn-new-user" class="btn btn-primary">+ New User</button>
      </div>
      <div id="users-table-container"></div>
    `;const n=async()=>{const e=document.getElementById("users-table-container");b(e,{loading:!0});try{const a=await c.getUsers();b(e,{columns:[{label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},{label:"Role",render:o=>`<span class="badge badge-IN_PROGRESS">${o.role}</span>`},{label:"Department",key:"department"},{label:"Capacity",key:"capacity"},{label:"Status",render:o=>`<span class="badge badge-${o.status}">${o.status}</span>`},{label:"Actions",render:o=>`
                <button class="btn btn-sm btn-outline edit-btn" data-id="${o.id}">Edit</button>
                <button class="btn btn-sm btn-outline pw-btn" data-id="${o.id}">Reset PW</button>
                ${o.status==="ACTIVE"?`<button class="btn btn-sm btn-danger deact-btn" data-id="${o.id}">Deactivate</button>`:`<button class="btn btn-sm btn-success act-btn" data-id="${o.id}">Activate</button>`}
              `}],data:a.data}),e.querySelectorAll(".edit-btn").forEach(o=>o.addEventListener("click",i=>t(i.target.dataset.id))),e.querySelectorAll(".pw-btn").forEach(o=>o.addEventListener("click",i=>d(i.target.dataset.id))),e.querySelectorAll(".deact-btn").forEach(o=>o.addEventListener("click",i=>l(i.target.dataset.id,!1))),e.querySelectorAll(".act-btn").forEach(o=>o.addEventListener("click",i=>l(i.target.dataset.id,!0)))}catch(a){b(e,{error:a.message})}},l=async(e,a)=>{try{a?await c.activateUser(e):await c.deactivateUser(e),v(`User ${a?"activated":"deactivated"}`,"success"),n()}catch(o){v(o.message,"error")}},d=e=>{$({title:"Reset Password",content:`
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="pw-new" class="form-control" required></div>
          <button id="btn-reset-pw" class="btn btn-primary w-full mt-4">Update Password</button>
        `}),document.getElementById("btn-reset-pw").addEventListener("click",async()=>{const a=document.getElementById("pw-new").value;if(!a)return v("Password required","warning");try{await c.resetPassword(e,a),v("Password updated","success"),h()}catch(o){v(o.message,"error")}})},t=async(e=null)=>{let a={capacity:10,role:"EDITOR"};if(e)try{a=(await c.getUser(e)).data}catch(i){return v(i.message,"error")}const o=`
        <form id="user-form">
          <div class="form-group"><label class="form-label">Name</label><input type="text" id="uf-name" class="form-control" value="${a.name||""}" required></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" id="uf-email" class="form-control" value="${a.email||""}" ${e?"disabled":"required"}></div>
          ${e?"":'<div class="form-group"><label class="form-label">Password</label><input type="password" id="uf-pw" class="form-control" required></div>'}
          <div class="form-group"><label class="form-label">Role</label>
            <select id="uf-role" class="form-control">
              ${["ADMIN","MANAGER","EDITOR","VIEWER"].map(i=>`<option value="${i}" ${a.role===i?"selected":""}>${i}</option>`).join("")}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Department</label><input type="text" id="uf-dept" class="form-control" value="${a.department||""}"></div>
          <div class="form-group"><label class="form-label">Capacity (Max open tasks)</label><input type="number" id="uf-cap" class="form-control" value="${a.capacity}" required></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save User</button>
        </form>
      `;$({title:e?"Edit User":"New User",content:o}),document.getElementById("user-form").addEventListener("submit",async i=>{i.preventDefault();const r={name:document.getElementById("uf-name").value,role:document.getElementById("uf-role").value,department:document.getElementById("uf-dept").value,capacity:parseInt(document.getElementById("uf-cap").value)};try{e?(await c.updateUser(e,r),r.role!==a.role&&await c.changeRole(e,r.role),v("User updated","success")):(r.email=document.getElementById("uf-email").value,r.password=document.getElementById("uf-pw").value,await c.createUser(r),v("User created","success")),h(),n()}catch(u){v(u.message,"error")}})};document.getElementById("btn-new-user").addEventListener("click",()=>t()),n()}},q={async render(s){s.innerHTML=`
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
    `;const n=async()=>{const l=document.getElementById("filter-module").value,d=document.getElementById("filter-action").value;let t="?";l&&(t+=`module=${l}&`),d&&(t+=`action=${d}`);const e=document.getElementById("audit-table-container");b(e,{loading:!0});try{const a=await c.getAuditLog(t);b(e,{columns:[{label:"Timestamp",render:o=>new Date(o.timestamp).toLocaleString()},{label:"User",key:"userName"},{label:"Action",key:"action"},{label:"Module",key:"module"},{label:"Record ID",key:"recordId"},{label:"Changes",render:o=>o.action==="UPDATE"&&o.changes?`<div style="font-size:0.75rem; max-width:300px; overflow-x:auto;">
                  ${Object.entries(o.changes).map(([i,r])=>`${i}: ${r.old} → ${r.new}`).join("<br>")}
                </div>`:"-"}],data:a.data})}catch(a){b(e,{error:a.message})}};document.getElementById("btn-refresh").addEventListener("click",n),document.getElementById("filter-module").addEventListener("change",n),document.getElementById("filter-action").addEventListener("change",n),n()}},G={async render(s){s.innerHTML=`
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
    `;const n=document.getElementById("sys-output");document.getElementById("btn-test-db").addEventListener("click",async()=>{n.style.display="block",n.textContent="Testing connection...";try{const l=await c.testDbConnection();n.textContent=JSON.stringify(l.data,null,2)}catch(l){n.textContent=`Error: ${l.message}`}}),document.getElementById("btn-discover").addEventListener("click",async()=>{n.style.display="block",n.textContent="Discovering sheets...";try{const l=await c.discoverSheets();n.textContent=JSON.stringify(l.data,null,2)}catch(l){n.textContent=`Error: ${l.message}`}});try{const d=(await c.getSettings()).data;let t='<form id="settings-form" class="grid grid-cols-2 gap-4">';for(const[e,a]of Object.entries(d))t+=`
          <div class="form-group">
            <label class="form-label">${e}</label>
            <input type="text" name="${e}" class="form-control" value="${a}">
          </div>
        `;t+='<div style="grid-column: span 2"><button type="submit" class="btn btn-primary">Save Settings</button></div>',t+="</form>",document.getElementById("settings-form-container").innerHTML=t,document.getElementById("settings-form").addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),o=Object.fromEntries(a.entries());try{await c.updateSettings(o),v("Settings saved successfully","success")}catch(i){v(i.message,"error")}})}catch(l){document.getElementById("settings-form-container").innerHTML=`<div style="color:var(--danger)">Error loading settings: ${l.message}</div>`}}};document.getElementById("app");const W={"/login":{render:N},"/":{render:S,module:"dashboard"},"/decision-center":{render:j,module:"decision-center"},"/jobs":{render:x,module:"jobs"},"/tasks":{render:R,module:"tasks"},"/team":{render:M,module:"team"},"/payments":{render:H,module:"payments"},"/reports":{render:J,module:"reports"},"/users":{render:U,module:"users"},"/audit":{render:q,module:"audit"},"/settings":{render:G,module:"settings"},"*":{render:S,module:"dashboard"}};async function B(){const s=document.getElementById("app");if(s){s.innerHTML='<div class="loader-container"><div class="loader"></div></div>';try{const n=await c.getMe(),l=n.user||n.data&&n.data.user||n.data;l&&g.setUser(l)}catch{g.clearUser()}if(!document.getElementById("toast-container")){const n=document.createElement("div");n.id="toast-container",document.body.appendChild(n)}T.onRoute(n=>{if(!g.isAuthenticated())s.innerHTML="",n.render(s);else{P(s,g.getUser());const l=document.getElementById("page-content");l&&(l.innerHTML="",n.render(l))}}),T.init(W)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):B();

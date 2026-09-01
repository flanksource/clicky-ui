import{j as e,r as d,a1 as q,a3 as st,a0 as rt,a2 as it,a4 as lt,y as ct}from"./iframe-9kVTKmJ0.js";import{B as K}from"./button-BPQ9SyIv.js";import{M as dt}from"./Modal-BbLdbhrq.js";import{D as l}from"./DataTable-uV5sRdY5.js";import"./preload-helper-95TtevsV.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-MkmNbgtg.js";import"./index-Cr37FOZC.js";import"./index-BTeDEC8L.js";import"./Icon-CvI4mGjv.js";import"./modalStack-CNqfYGm3.js";import"./zIndex-BGbNBNA8.js";import"./SortableHeader-DLQcNgJx.js";import"./FilterBar-CXhcWigS.js";import"./floating-ui.react-BUMPLM4a.js";import"./FilterPill-DQt4CJ8q.js";import"./Combobox-D7J1PGfl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BbOmlTv2.js";import"./MultiSelect-CSjhdo7W.js";import"./RangeSlider-ClpMy-rf.js";import"./TimeRange-M6wT7L0F.js";import"./select-DuAtkH3m.js";import"./WorkloadPicker-DlkRC9Xa.js";import"./NamespacePicker-D8blYim1.js";import"./index-CX2ajmSK.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BRT7w1kY.js";import"./TagList-DnY7mgYd.js";import"./Badge-BcfKC88e.js";import"./HoverCard-CPC5ZKyE.js";import"./Properties-BnqeAvxD.js";import"./IconButton-DFVj-CAC.js";import"./DropdownMenu-BNM_4WBn.js";import"./DropdownMenuSubmenu-YGHNpTO4.js";import"./StatusDot-DP4lLckB.js";const{expect:i,userEvent:g,within:m}=__STORYBOOK_MODULE_TEST__,w=[{service:"api",status:"healthy",restarts:0,owner:"platform",notes:"Primary public API with long-form notes that should keep its width."},{service:"worker",status:"degraded",restarts:3,owner:"data",notes:"Background job processor with retry queues."},{service:"cron",status:"healthy",restarts:1,owner:"platform",notes:"Nightly maintenance and reporting runner."}],b=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"restarts",label:"Restarts",shrink:!0,align:"right",sortValue:a=>Number(a??0)},{key:"owner",label:"Owner",shrink:!0},{key:"notes",label:"Notes",grow:!0}],ut=[{name:"api",state:"healthy",age:"12m"},{name:"worker",state:"degraded",age:"4m"},{name:"cron",state:"healthy",age:"2h"}],mt=[{key:"name",label:"Name",shrink:!0},{key:"state",label:"State",shrink:!0},{key:"age",label:"Age",shrink:!0,align:"right"}],pt=[{service:"api",status:"healthy",region:"us-east",version:"2026.04.1",owner:"platform",latency:42},{service:"billing",status:"healthy",region:"eu-west",version:"2026.04.0",owner:"finance",latency:58},{service:"worker",status:"degraded",region:"us-west",version:"2026.03.9",owner:"data",latency:131}],gt=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"latency",label:"Latency ms",shrink:!0,align:"right",sortValue:a=>Number(a??0)}],J=[{service:"api",namespace:"frontend",cluster:"prod-a",region:"us-east",zone:"use1-a",status:"healthy",owner:"platform",version:"2026.04.1",cpu:"62%",memory:"5.1 GiB",latency:42,restarts:0,updated:"4m ago",notes:"Primary public API serving customer traffic."},{service:"worker",namespace:"jobs",cluster:"prod-b",region:"us-west",zone:"usw2-c",status:"degraded",owner:"data",version:"2026.03.9",cpu:"78%",memory:"7.8 GiB",latency:131,restarts:3,updated:"9m ago",notes:"Queue processor draining delayed retry batches."},{service:"billing",namespace:"finance",cluster:"prod-eu",region:"eu-west",zone:"euw1-b",status:"healthy",owner:"finance",version:"2026.04.0",cpu:"41%",memory:"3.4 GiB",latency:58,restarts:1,updated:"18m ago",notes:"Ledger sync and invoice reconciliation service."}],_=[{key:"service",label:"Service",grow:!0},{key:"namespace",label:"Namespace",shrink:!0},{key:"cluster",label:"Cluster",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"zone",label:"Zone",shrink:!0},{key:"status",label:"Status",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"cpu",label:"CPU",align:"right",shrink:!0},{key:"memory",label:"Memory",align:"right",shrink:!0},{key:"latency",label:"Latency ms",align:"right",shrink:!0,sortValue:a=>Number(a??0)},{key:"restarts",label:"Restarts",align:"right",shrink:!0,sortValue:a=>Number(a??0)},{key:"updated",label:"Updated",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function ht(a){var f,k;const[t,s]=d.useState("now-24h"),[o,n]=d.useState("now"),[r,u]=d.useState(""),[h,v]=d.useState("");return e.jsx(l,{...a,filterBarProps:{timeRange:{from:t,to:o,onApply:(y,p)=>{s(y),n(p)}},dateRange:{from:r,to:h,onApply:(y,p)=>{u(y),v(p)}}},renderExpandedRow:y=>e.jsxs("div",{className:"text-sm text-muted-foreground",children:[y.service," is owned by ",e.jsx("strong",{children:y.owner}),"."]})},[a.theme??"system",((f=a.defaultSort)==null?void 0:f.key)??"",((k=a.defaultSort)==null?void 0:k.dir)??""].join(":"))}function yt(){return e.jsx(l,{data:ut,columns:mt,defaultSort:{key:"name",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-few-columns"})}function wt(){return e.jsx(l,{data:pt,columns:gt,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-everything-fits"})}function bt(){return e.jsx(l,{data:J,columns:_,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-lots-of-columns"})}function ft(){return e.jsx(l,{data:[],columns:_,loading:!0,loadingMessage:"Loading execution results…",loadingRowCount:8,showGlobalFilter:!1,columnResizeStorageKey:"clicky-ui-story-data-table-loading"})}const ot=[{id:"download-yaml",label:"YAML",icon:rt,iconClassName:"text-violet-600 dark:text-violet-400",onSelect:()=>{console.info("Download YAML")}},{id:"download-json",label:"JSON",icon:q,onSelect:()=>{console.info("Download JSON")}},{id:"download-csv",label:"CSV",icon:it,iconClassName:"text-emerald-600 dark:text-emerald-400",onSelect:()=>{console.info("Download CSV")}},{id:"download-pdf",label:"PDF",icon:st,iconClassName:"text-rose-600 dark:text-rose-400",onSelect:()=>{console.info("Download PDF")}},{id:"download-markdown",label:"Markdown",icon:lt,onSelect:()=>{console.info("Download Markdown")}}];function vt(){return e.jsx(l,{data:J,columns:_,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:ot,columnResizeStorageKey:"clicky-ui-story-data-table-menu-actions"})}const St=[{id:"view-clicky",label:"Clicky",icon:q,section:"View",disabled:!0,onSelect:()=>{console.info("View Clicky")}},{id:"view-json",label:"JSON",icon:q,section:"View",onSelect:()=>{console.info("View JSON")}},{id:"view-pdf",label:"PDF",icon:st,iconClassName:"text-rose-600 dark:text-rose-400",section:"View",onSelect:()=>{console.info("View PDF")}},...ot];function xt(){return e.jsx(l,{data:J,columns:_,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:St,columnResizeStorageKey:"clicky-ui-story-data-table-grouped-menu-actions"})}function kt(a){const t=new Date("2026-04-15T12:04:33Z").getTime(),s=["api","worker","billing","auth"],o=["INFO","WARN","error","ERR","failed","ok"],n=[["region:us-east","tier:edge","v=2026.04.1"],["region:eu-west","tier:core"],["region:us-west","tier:edge","v=2026.04.0","owner=platform"],["region:eu-west","tier:core","owner=finance"],["region:us-east"],["region:ap-south","tier:edge","v=2026.03.9"]],r=a==="subMinute"?8e3:a==="sameDay"?18e5:864e5*90;return Array.from({length:6},(u,h)=>({ts:new Date(t+r*h).toISOString(),level:o[h%o.length],service:s[h%s.length],message:`event #${h} from ${s[h%s.length]}`,tags:n[h%n.length]}))}const Bt=[{key:"ts",label:"Timestamp",kind:"timestamp",shrink:!0},{key:"level",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"message",label:"Message",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:2}}];function Rt(){const[a,t]=d.useState("sameDay"),s=kt(a);return e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Data spread:"}),["subMinute","sameDay","multiYear"].map(o=>e.jsx("button",{type:"button",onClick:()=>t(o),className:`rounded-md border px-2 py-1 text-xs ${a===o?"bg-accent text-accent-foreground":"text-muted-foreground"}`,children:o},o))]}),e.jsx(l,{data:s,columns:Bt,autoFilter:!0,defaultSort:{key:"ts",dir:"desc"},columnResizeStorageKey:`clicky-ui-story-data-table-timestamps-${a}`})]})}const Tt=[{id:"1",name:"auth-service",tags:["env=prod","team=identity","tier=edge","region=us-east","v=2026.04.1"]},{id:"2",name:"billing-svc",tags:["env=prod","team=finance","tier=core"]},{id:"3",name:"ingest-pipeline",tags:["env=staging","team=data","tier=core"]},{id:"4",name:"marketing-site",tags:["env=prod","team=growth"]},{id:"5",name:"many-tags",tags:Array.from({length:30},(a,t)=>`label-${t}=value-${t}`)}],Ct=[{key:"id",label:"ID",shrink:!0},{key:"name",label:"Name",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:3}}];function jt(){return e.jsx(l,{data:Tt,columns:Ct,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-tags"})}const At=[{service:"api",state:"ok",notes:"running normally"},{service:"worker",state:"ERROR",notes:"stack overflow"},{service:"billing",state:"warning",notes:"latency p95 elevated"},{service:"auth",state:"healthy",notes:"all checks green"},{service:"search",state:"failed",notes:"circuit broken"},{service:"cron",state:"degraded",notes:"1/3 retries"},{service:"router",state:"info",notes:"info-only event"},{service:"unknown",state:"mystery",notes:"unmapped value falls through"}],Nt=[{key:"state",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function Dt(){return e.jsx(l,{data:At,columns:Nt,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-status-dot"})}function Ft(){return e.jsx(l,{data:w,columns:b,defaultSort:{key:"restarts",dir:"asc"},detailStyle:"dialog",detailDialogTitle:a=>`${a.service} details`,columnResizeStorageKey:"clicky-ui-story-data-table-detail-dialog",renderExpandedRow:a=>e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("p",{className:"text-muted-foreground",children:[a.service," is owned by ",e.jsx("strong",{children:a.owner}),"."]}),e.jsx("pre",{className:"overflow-auto rounded border border-border bg-muted p-2 text-xs",children:JSON.stringify(a,null,2)})]})})}function Mt(){const[a,t]=d.useState({}),[s,o]=d.useState(""),[n,r]=d.useState(""),[u,h]=d.useState(""),v=[{key:"service",kind:"enum",label:"Service",description:"Single-select: show only the chosen service, or leave empty for all.",placeholder:"any service",value:u,options:w.map(c=>({value:c.service})),onChange:h},{key:"status",kind:"multi",label:"Status",description:"Include or exclude services by health. Click once to include, again to exclude.",value:a,options:[{value:"healthy",label:"healthy"},{value:"degraded",label:"degraded"}],onChange:t},{key:"owner",kind:"text",label:"Owner",description:"Match the owning team by substring, e.g. `plat` matches `platform`.",placeholder:"team name…",value:s,onChange:o},{key:"restarts",kind:"number",label:"Min restarts",description:"Only show services that have restarted at least this many times.",value:{min:n},domainMin:0,domainMax:5,step:1,onChange:c=>r(c.min??"")}],f=Object.entries(a).filter(([,c])=>c==="include").map(([c])=>c),k=Object.entries(a).filter(([,c])=>c==="exclude").map(([c])=>c),y=s.trim().toLowerCase(),p=n===""?null:Number(n),S=w.filter(c=>!(u&&c.service!==u||f.length>0&&!f.includes(c.status)||k.includes(c.status)||y&&!c.owner.toLowerCase().includes(y)||p!==null&&c.restarts<p));return e.jsx(l,{data:S,columns:b,defaultSort:{key:"restarts",dir:"asc"},externalFilters:v,columnResizeStorageKey:"clicky-ui-story-data-table-filter-descriptions"})}const U=["Ada","Grace","Alan","Linus","Katherine","Edsger","Barbara","Dennis","Margaret","Ken","Radia","Donald"],Y=["Lovelace","Hopper","Turing","Torvalds","Johnson","Dijkstra","Liskov","Ritchie","Hamilton","Thompson","Perlman","Knuth"],W=["Platform","Finance","Data","Growth","Identity","Support"],Q=["Admin","Editor","Viewer"],X=["active","invited","disabled"],Z=Array.from({length:120},(a,t)=>{const s=U[t%U.length],o=Y[t*7%Y.length];return{id:`person-${t+1}`,name:`${s} ${o}`,email:`${s}.${o}${t+1}`.toLowerCase()+"@example.com",team:W[t%W.length],role:Q[t%Q.length],status:X[t%X.length]}}),Et=[{key:"name",label:"Name",grow:!0},{key:"email",label:"Email",grow:!0},{key:"team",label:"Team",shrink:!0},{key:"role",label:"Role",shrink:!0},{key:"status",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}}];function It(a,t){if(!t)return a;const s=t.dir==="asc"?1:-1,o=t.key;return[...a].sort((n,r)=>s*String(n[o]).localeCompare(String(r[o])))}function Vt(){const[a,t]=d.useState(!0),[s,o]=d.useState(0),[n,r]=d.useState(10),[u,h]=d.useState({key:"name",dir:"asc"}),[v,f]=d.useState({}),y=It(Z,u).slice(s*n,s*n+n),p=Object.keys(v).length;return e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1.5 text-primary-foreground",onClick:()=>t(!0),children:"Add people"}),e.jsx(dt,{open:a,onClose:()=>t(!1),title:"Add people",size:"xl",expandable:!0,scrollBody:!1,footer:e.jsxs("div",{className:"flex items-center justify-between gap-3",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:p===0?"Select one or more people from the table.":`${p} selected`}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50",onClick:()=>f({}),disabled:p===0,children:"Clear"}),e.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50",onClick:()=>t(!1),disabled:p===0,children:p>0?`Add ${p}`:"Add"})]})]}),children:e.jsx(l,{className:"min-h-0 flex-1",data:y,columns:Et,getRowId:S=>S.id,sort:u,onSortChange:h,manualSort:!0,columnResizeStorageKey:"clicky-ui-story-data-table-dialog",rowSelection:{selectedRowIds:Object.keys(v),toggleOnRowClick:!0,onSelectionChange:(S,c)=>{const nt=new Map(c.map(x=>[x.id,x]));f(Object.fromEntries(S.map(x=>[x,nt.get(x)??v[x]])))}},pagination:{page:s,pageSize:n,total:Z.length,pageSizeOptions:[10,25,50],onPageChange:o,onPageSizeChange:S=>{o(0),r(S)}}})})]})}function Ot(){const a={getGroupKey:t=>t.owner,getGroupLabel:t=>`Owned by ${t}`,getGroupMeta:(t,s)=>`${s.reduce((o,n)=>o+n.restarts,0)} restarts`};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("section",{className:"space-y-2",children:[e.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "end" (default)'}),e.jsx(l,{data:w,columns:b,getRowId:t=>t.service,grouping:a})]}),e.jsxs("section",{className:"space-y-2",children:[e.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "start"'}),e.jsx(l,{data:w,columns:b,getRowId:t=>t.service,grouping:{...a,metaAlign:"start"}})]})]})}const Pt=[{type:"column",value:"owner",label:"Owner",columnKey:"owner"},{type:"custom",value:"status",label:"Status",getGroupKey:a=>a.status,getGroupLabel:a=>`Status: ${a}`},{type:"none",value:"none",label:"No grouping"}];function Lt(){return e.jsx(l,{data:w,columns:b,getRowId:a=>a.service,groupingModes:Pt,defaultGroupingMode:"owner"})}const H=3706;function Gt(){const[a,t]=d.useState([]),[s,o]=d.useState(!1),n=()=>{o(!0),window.setTimeout(()=>{t(Array.from({length:H},(r,u)=>`service-${u}`)),o(!1)},300)};return e.jsx(l,{data:w,columns:b,getRowId:r=>r.service,rowSelection:{selectedRowIds:a,onSelectionChange:r=>t(r),selectAllPages:{noun:"services",loading:s,scopes:[{total:H,onSelectAll:n}]}},pagination:{page:0,pageSize:3,total:H,onPageChange:()=>{},onPageSizeChange:()=>{}},selectionActions:({selectedRowIds:r,clearSelection:u})=>e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-xs",children:e.jsxs("b",{children:[r.length.toLocaleString()," selected"]})}),e.jsxs("span",{className:"flex gap-2",children:[e.jsx(K,{size:"sm",variant:"ghost",onClick:u,children:"Clear"}),e.jsxs(K,{size:"sm",children:["Restart ",r.length.toLocaleString()]})]})]})})}function zt(){const[a,t]=d.useState([]);return e.jsx(l,{data:w,columns:b,getRowId:s=>s.service,rowSelection:{selectedRowIds:a,onSelectionChange:s=>t(s)},getRowClassName:s=>s.restarts>=3?"bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10":void 0,footer:({visibleRowCount:s,totalRowCount:o})=>`Showing ${s} of ${o} services · ${w.reduce((n,r)=>n+r.restarts,0)} restarts total`,selectionActions:({selectedRows:s,clearSelection:o})=>e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"text-xs",children:[e.jsxs("b",{children:[s.length," selected"]}),e.jsxs("span",{className:"opacity-70",children:[" · ",s.reduce((n,r)=>n+r.restarts,0)," ","restarts"]})]}),e.jsxs("span",{className:"flex gap-2",children:[e.jsx(K,{size:"sm",variant:"ghost",onClick:o,children:"Clear"}),e.jsxs(K,{size:"sm",children:["Restart ",s.length]})]})]})})}function $t(){const[a,t]=d.useState([]),[s,o]=d.useState([]),n=r=>o(u=>[...u,r]);return e.jsxs("div",{className:"flex flex-col gap-density-2",children:[e.jsx(l,{data:w,columns:b,getRowId:r=>r.service,rowSelection:{selectedRowIds:a,onSelectionChange:r=>t(r)},selectionActions:[{id:"restart",label:"Restart",primary:!0,variant:"default",icon:ct,pendingLabel:"Restarting…",onSelect:async r=>{await new Promise(u=>setTimeout(u,600)),n(`restarted ${r.selectedRowIds.join(", ")}`)}},{id:"drain",label:"Drain",primary:!0,onSelect:()=>n("drained")},{id:"delete",label:"Delete",primary:!0,variant:"destructive",confirm:{message:r=>`Delete ${r.selectedRows.length} services? This cannot be undone.`},onSelect:r=>n(`deleted ${r.selectedRowIds.length}`)},{id:"export",label:"Export",section:"Download",onSelect:()=>{},children:[{id:"export-csv",label:"CSV",onSelect:()=>n("exported csv")},{id:"export-json",label:"JSON",onSelect:()=>n("exported json")}]},{id:"tag",label:"Add tag",onSelect:()=>n("tagged")}]}),e.jsx("p",{className:"px-1 text-xs text-muted-foreground",children:s.length?s.join(" · "):"No actions run yet."})]})}const ja={title:"Data/DataTable",component:l,render:a=>e.jsx(ht,{...a}),args:{data:w,columns:b,loading:!1,loadingMessage:"Loading services…",loadingRowCount:8,emptyMessage:"No services",autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:"Search all columns…",defaultSort:{key:"restarts",dir:"asc"},resizableColumns:!0,hideableColumns:!0,persistColumnWidths:!0,persistColumnVisibility:!0,persistDensity:!0,showDensityControl:!0,showThemeControl:!1,showHeaderFilters:!0,showFullscreenControl:!1,fullscreenTitle:"Services",fullscreenButtonLabel:"Open table full screen"},argTypes:{data:{control:!1,table:{category:"Data"}},columns:{control:!1,table:{category:"Data"}},loading:{control:"boolean",table:{category:"State"}},loadingMessage:{control:"text",table:{category:"State"}},loadingRowCount:{control:{type:"range",min:1,max:20,step:1},table:{category:"State"}},emptyMessage:{control:"text",table:{category:"State"}},autoFilter:{control:"boolean",table:{category:"Filtering"}},showGlobalFilter:{control:"boolean",table:{category:"Filtering"}},globalFilterPlaceholder:{control:"text",table:{category:"Filtering"}},showHeaderFilters:{control:"boolean",table:{category:"Filtering"}},resizableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnWidths:{control:"boolean",table:{category:"Columns"}},hideableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnVisibility:{control:"boolean",table:{category:"Columns"}},persistDensity:{control:"boolean",table:{category:"Preferences"}},showDensityControl:{control:"boolean",table:{category:"Preferences"}},showThemeControl:{control:"boolean",table:{category:"Preferences"}},showFullscreenControl:{control:"boolean",table:{category:"Fullscreen"}},fullscreenTitle:{control:"text",table:{category:"Fullscreen"}},fullscreenButtonLabel:{control:"text",table:{category:"Fullscreen"}}},parameters:{docs:{description:{component:"Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns."}}}},B={},R={args:{showFullscreenControl:!0,fullscreenButtonLabel:"Open controlled table"},play:async({canvasElement:a})=>{const t=m(a);await i(t.getByRole("button",{name:"Open controlled table"})).toBeVisible()}},T={render:()=>e.jsx(yt,{})},C={render:()=>e.jsx(ft,{})},j={render:()=>e.jsx(wt,{})},A={render:()=>e.jsx(bt,{})},N={render:()=>e.jsx(vt,{})},D={render:()=>e.jsx(xt,{}),parameters:{docs:{description:{story:"Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."}}}},F={render:()=>e.jsx(Rt,{})},M={render:()=>e.jsx(jt,{})},E={render:()=>e.jsx(Dt,{})},I={render:()=>e.jsx(Ft,{})},V={render:()=>e.jsx(Vt,{}),parameters:{docs:{description:{story:['A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.',"","- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.","- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.",'- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for "Page X of Y".'].join(`
`)}}}},O={render:()=>e.jsx(zt,{}),parameters:{docs:{description:{story:["`selectionActions` renders bulk actions in the toolbar beside the table menu whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.","",'`footer` replaces the default "N of M rows" strip, and `getRowClassName` tints the degraded row.'].join(`
`)}}},play:async({canvasElement:a})=>{const t=m(a);await i(t.getByText(/Showing 3 of 3 services/)).toBeInTheDocument(),await i(t.queryByText("3 of 3 rows")).toBeNull(),await g.click(t.getByRole("checkbox",{name:"Select row worker"}));const s=m(t.getByTestId("data-table-selection-actions"));await i(s.getByText("1 selected")).toBeVisible(),await i(s.getByText(/3 restarts/)).toBeVisible(),await g.click(s.getByRole("button",{name:"Clear"})),await i(t.queryByTestId("data-table-selection-actions")).toBeNull()}},P={render:()=>e.jsx($t,{}),parameters:{docs:{description:{story:["`selectionActions` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.","","`primary` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same `section`/`children` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."].join(`
`)}}},play:async({canvasElement:a})=>{const t=m(a);await g.click(t.getByRole("checkbox",{name:"Select row worker"})),await g.click(t.getByRole("checkbox",{name:"Select row cron"}));const s=m(t.getByTestId("data-table-selection-actions"));await i(s.getByText("2 selected")).toBeVisible(),await i(s.getByRole("button",{name:"Restart"})).toBeVisible(),await i(s.getByRole("button",{name:"Delete"})).toBeVisible(),await g.click(s.getByRole("button",{name:"Delete"})),await i(await m(document.body).findByText("Delete 2 services? This cannot be undone.")).toBeVisible(),await g.click(m(document.body).getByRole("button",{name:"Cancel"})),await i(t.getByText("No actions run yet.")).toBeVisible(),await g.click(s.getByRole("button",{name:/More/}));const o=m(await m(document.body).findByRole("menu"));await i(o.getByRole("menuitem",{name:"Add tag"})).toBeVisible()}},L={render:()=>e.jsx(Gt,{}),parameters:{docs:{description:{story:["The header checkbox reaches only the rows the table is holding. `rowSelection.selectAllPages` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling `onSelectAll` so the caller can fetch the pages it has not loaded.","","`scopes` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so `select all` means the rows in front of the reader before it means every row the filters allow. A scope's `total` defaults to `pagination.total`."].join(`
`)}}},play:async({canvasElement:a})=>{const t=m(a);await i(t.queryByTestId("data-table-selection-scope")).toBeNull(),await g.click(t.getByRole("checkbox",{name:"Select all visible rows"}));const s=m(t.getByTestId("data-table-selection-scope"));await i(s.getByText("3 of 3,706 services selected.")).toBeVisible(),await g.click(s.getByRole("button",{name:"Select all 3,706 services"})),await i(await t.findByText("All 3,706 services selected.")).toBeVisible();const o=m(t.getByTestId("data-table-selection-actions"));await i(o.getByText("3,706 selected")).toBeVisible(),await g.click(t.getByRole("button",{name:"Clear selection"})),await i(t.queryByTestId("data-table-selection-scope")).toBeNull()}},G={render:()=>e.jsx(Mt,{}),parameters:{docs:{description:{story:"Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."}}}},z={render:()=>e.jsx(Ot,{}),parameters:{docs:{description:{story:["`grouping` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.","",'`getGroupMeta` is a per-group summary rendered inside the header row. `metaAlign` places it: `"end"` (the default) pins it to the trailing edge, while `"start"` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'].join(`
`)}}},play:async({canvasElement:a})=>{const s=m(a).getAllByRole("button").filter(r=>r.hasAttribute("aria-expanded")),[o]=s,n=s[s.length/2];await i(o).toHaveClass("flex-1"),await i(n).not.toHaveClass("flex-1"),await i(n==null?void 0:n.nextElementSibling).toHaveTextContent("restarts"),await g.click(n),await i(n).toHaveAttribute("aria-expanded","false")}},$={render:()=>e.jsx(Lt,{}),parameters:{docs:{description:{story:"`groupingModes` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."}}},play:async({canvasElement:a})=>{const t=m(a),s=t.getByRole("combobox",{name:"Group rows by"});await i(s).toHaveValue("owner"),await g.click(t.getByRole("button",{name:"Collapse all groups"})),await i(t.queryByText("api")).toBeNull(),await g.selectOptions(s,"status"),await i(t.getByRole("button",{name:/^Status: healthy/})).toBeVisible()}};var ee,te,ae;B.parameters={...B.parameters,docs:{...(ee=B.parameters)==null?void 0:ee.docs,source:{originalSource:"{}",...(ae=(te=B.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var se,oe,ne;R.parameters={...R.parameters,docs:{...(se=R.parameters)==null?void 0:se.docs,source:{originalSource:`{
  args: {
    showFullscreenControl: true,
    fullscreenButtonLabel: "Open controlled table"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Open controlled table"
    })).toBeVisible();
  }
}`,...(ne=(oe=R.parameters)==null?void 0:oe.docs)==null?void 0:ne.source}}};var re,ie,le;T.parameters={...T.parameters,docs:{...(re=T.parameters)==null?void 0:re.docs,source:{originalSource:`{
  render: () => <FewColumnsShowcase />
}`,...(le=(ie=T.parameters)==null?void 0:ie.docs)==null?void 0:le.source}}};var ce,de,ue;C.parameters={...C.parameters,docs:{...(ce=C.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => <LoadingShowcase />
}`,...(ue=(de=C.parameters)==null?void 0:de.docs)==null?void 0:ue.source}}};var me,pe,ge;j.parameters={...j.parameters,docs:{...(me=j.parameters)==null?void 0:me.docs,source:{originalSource:`{
  render: () => <EverythingFitsShowcase />
}`,...(ge=(pe=j.parameters)==null?void 0:pe.docs)==null?void 0:ge.source}}};var he,ye,we;A.parameters={...A.parameters,docs:{...(he=A.parameters)==null?void 0:he.docs,source:{originalSource:`{
  render: () => <LotsOfColumnsShowcase />
}`,...(we=(ye=A.parameters)==null?void 0:ye.docs)==null?void 0:we.source}}};var be,fe,ve;N.parameters={...N.parameters,docs:{...(be=N.parameters)==null?void 0:be.docs,source:{originalSource:`{
  render: () => <MenuActionsShowcase />
}`,...(ve=(fe=N.parameters)==null?void 0:fe.docs)==null?void 0:ve.source}}};var Se,xe,ke;D.parameters={...D.parameters,docs:{...(Se=D.parameters)==null?void 0:Se.docs,source:{originalSource:`{
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Menu actions with a \`section\` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."
      }
    }
  }
}`,...(ke=(xe=D.parameters)==null?void 0:xe.docs)==null?void 0:ke.source}}};var Be,Re,Te;F.parameters={...F.parameters,docs:{...(Be=F.parameters)==null?void 0:Be.docs,source:{originalSource:`{
  render: () => <TimestampsShowcase />
}`,...(Te=(Re=F.parameters)==null?void 0:Re.docs)==null?void 0:Te.source}}};var Ce,je,Ae;M.parameters={...M.parameters,docs:{...(Ce=M.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  render: () => <TagsShowcase />
}`,...(Ae=(je=M.parameters)==null?void 0:je.docs)==null?void 0:Ae.source}}};var Ne,De,Fe;E.parameters={...E.parameters,docs:{...(Ne=E.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
  render: () => <StatusDotShowcase />
}`,...(Fe=(De=E.parameters)==null?void 0:De.docs)==null?void 0:Fe.source}}};var Me,Ee,Ie;I.parameters={...I.parameters,docs:{...(Me=I.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  render: () => <RowDetailDialogShowcase />
}`,...(Ie=(Ee=I.parameters)==null?void 0:Ee.docs)==null?void 0:Ie.source}}};var Ve,Oe,Pe;V.parameters={...V.parameters,docs:{...(Ve=V.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: ['A DataTable hosted inside a \`Modal\` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.', "", "- **Only the rows scroll.** The dialog sets \`scrollBody={false}\`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.", "- **Selection persists across pages.** It is keyed by \`getRowId\`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.", '- **Pagination is server-shaped.** The DataTable never slices \`data\`, so the story sorts and slices the current page itself and reports the true \`total\` for "Page X of Y".'].join("\\n")
      }
    }
  }
}`,...(Pe=(Oe=V.parameters)==null?void 0:Oe.docs)==null?void 0:Pe.source}}};var Le,Ge,ze;O.parameters={...O.parameters,docs:{...(Le=O.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  render: () => <SelectionActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: ["\`selectionActions\` renders bulk actions in the toolbar beside the table menu whenever \`rowSelection\` holds a non-empty selection — it receives the selected rows and a \`clearSelection\` callback, so the caller owns the copy and the actions but not the plumbing.", "", '\`footer\` replaces the default "N of M rows" strip, and \`getRowClassName\` tints the degraded row.'].join("\\n")
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Showing 3 of 3 services/)).toBeInTheDocument();
    await expect(canvas.queryByText("3 of 3 rows")).toBeNull();
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Select row worker"
    }));
    const bar = within(canvas.getByTestId("data-table-selection-actions"));
    await expect(bar.getByText("1 selected")).toBeVisible();
    await expect(bar.getByText(/3 restarts/)).toBeVisible();
    await userEvent.click(bar.getByRole("button", {
      name: "Clear"
    }));
    await expect(canvas.queryByTestId("data-table-selection-actions")).toBeNull();
  }
}`,...(ze=(Ge=O.parameters)==null?void 0:Ge.docs)==null?void 0:ze.source}}};var $e,Ke,_e;P.parameters={...P.parameters,docs:{...($e=P.parameters)==null?void 0:$e.docs,source:{originalSource:`{
  render: () => <SelectionActionDescriptorsShowcase />,
  parameters: {
    docs: {
      description: {
        story: ["\`selectionActions\` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.", "", "\`primary\` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same \`section\`/\`children\` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."].join("\\n")
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Select row worker"
    }));
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Select row cron"
    }));
    const bar = within(canvas.getByTestId("data-table-selection-actions"));
    await expect(bar.getByText("2 selected")).toBeVisible();
    await expect(bar.getByRole("button", {
      name: "Restart"
    })).toBeVisible();
    await expect(bar.getByRole("button", {
      name: "Delete"
    })).toBeVisible();

    // A destructive action names the count before it runs, and backing out runs
    // nothing.
    await userEvent.click(bar.getByRole("button", {
      name: "Delete"
    }));
    await expect(await within(document.body).findByText("Delete 2 services? This cannot be undone.")).toBeVisible();
    await userEvent.click(within(document.body).getByRole("button", {
      name: "Cancel"
    }));
    await expect(canvas.getByText("No actions run yet.")).toBeVisible();

    // The unpinned actions live in the overflow, grouped by section.
    await userEvent.click(bar.getByRole("button", {
      name: /More/
    }));
    const menu = within(await within(document.body).findByRole("menu"));
    await expect(menu.getByRole("menuitem", {
      name: "Add tag"
    })).toBeVisible();
  }
}`,...(_e=(Ke=P.parameters)==null?void 0:Ke.docs)==null?void 0:_e.source}}};var He,qe,Je;L.parameters={...L.parameters,docs:{...(He=L.parameters)==null?void 0:He.docs,source:{originalSource:`{
  render: () => <SelectAllPagesShowcase />,
  parameters: {
    docs: {
      description: {
        story: ["The header checkbox reaches only the rows the table is holding. \`rowSelection.selectAllPages\` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling \`onSelectAll\` so the caller can fetch the pages it has not loaded.", "", "\`scopes\` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so \`select all\` means the rows in front of the reader before it means every row the filters allow. A scope's \`total\` defaults to \`pagination.total\`."].join("\\n")
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByTestId("data-table-selection-scope")).toBeNull();
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Select all visible rows"
    }));
    const scope = within(canvas.getByTestId("data-table-selection-scope"));
    await expect(scope.getByText("3 of 3,706 services selected.")).toBeVisible();
    await userEvent.click(scope.getByRole("button", {
      name: "Select all 3,706 services"
    }));
    await expect(await canvas.findByText("All 3,706 services selected.")).toBeVisible();
    const bar = within(canvas.getByTestId("data-table-selection-actions"));
    await expect(bar.getByText("3,706 selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {
      name: "Clear selection"
    }));
    await expect(canvas.queryByTestId("data-table-selection-scope")).toBeNull();
  }
}`,...(Je=(qe=L.parameters)==null?void 0:qe.docs)==null?void 0:Je.source}}};var Ue,Ye,We;G.parameters={...G.parameters,docs:{...(Ue=G.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Caller-owned filters that each carry a \`description\`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."
      }
    }
  }
}`,...(We=(Ye=G.parameters)==null?void 0:Ye.docs)==null?void 0:We.source}}};var Qe,Xe,Ze;z.parameters={...z.parameters,docs:{...(Qe=z.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
  render: () => <GroupedRowsShowcase />,
  parameters: {
    docs: {
      description: {
        story: ["\`grouping\` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.", "", '\`getGroupMeta\` is a per-group summary rendered inside the header row. \`metaAlign\` places it: \`"end"\` (the default) pins it to the trailing edge, while \`"start"\` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'].join("\\n")
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const headers = canvas.getAllByRole("button").filter(button => button.hasAttribute("aria-expanded"));
    // Two groups per table, default table first.
    const [trailing] = headers;
    const adjacent = headers[headers.length / 2];

    // The summary is always the label's next sibling; \`flex-1\` on the label is
    // what pushes it to the far edge, so that is what the option toggles.
    await expect(trailing).toHaveClass("flex-1");
    await expect(adjacent).not.toHaveClass("flex-1");
    await expect(adjacent?.nextElementSibling).toHaveTextContent("restarts");
    await userEvent.click(adjacent!);
    await expect(adjacent).toHaveAttribute("aria-expanded", "false");
  }
}`,...(Ze=(Xe=z.parameters)==null?void 0:Xe.docs)==null?void 0:Ze.source}}};var et,tt,at;$.parameters={...$.parameters,docs:{...(et=$.parameters)==null?void 0:et.docs,source:{originalSource:`{
  render: () => <NativeGroupingShowcase />,
  parameters: {
    docs: {
      description: {
        story: "\`groupingModes\` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const picker = canvas.getByRole("combobox", {
      name: "Group rows by"
    });
    await expect(picker).toHaveValue("owner");
    await userEvent.click(canvas.getByRole("button", {
      name: "Collapse all groups"
    }));
    await expect(canvas.queryByText("api")).toBeNull();
    await userEvent.selectOptions(picker, "status");
    await expect(canvas.getByRole("button", {
      name: /^Status: healthy/
    })).toBeVisible();
  }
}`,...(at=(tt=$.parameters)==null?void 0:tt.docs)==null?void 0:at.source}}};const Aa=["Default","Playground","FewColumns","InitialLoading","EverythingFits","LotsOfColumns","MenuActions","GroupedMenuActions","Timestamps","Tags","StatusDots","RowDetailDialog","InDialogWithPagingAndSelection","SelectionActionsAndFooter","SelectionActionDescriptors","SelectAllPages","FilterDescriptions","GroupedRows","NativeGrouping"];export{B as Default,j as EverythingFits,T as FewColumns,G as FilterDescriptions,D as GroupedMenuActions,z as GroupedRows,V as InDialogWithPagingAndSelection,C as InitialLoading,A as LotsOfColumns,N as MenuActions,$ as NativeGrouping,R as Playground,I as RowDetailDialog,L as SelectAllPages,P as SelectionActionDescriptors,O as SelectionActionsAndFooter,E as StatusDots,M as Tags,F as Timestamps,Aa as __namedExportsOrder,ja as default};

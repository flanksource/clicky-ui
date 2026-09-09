import{j as a,r as c,a3 as Q,a5 as ht,a2 as ft,a4 as vt,a6 as xt,E as St}from"./iframe-BNefQpor.js";import{B as C}from"./button-DzbDFHiG.js";import{M as kt}from"./Modal-0C9g1z3t.js";import{D as i}from"./DataTable-Cj_dnzGR.js";import"./preload-helper-BvsCWBK3.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C39MVSz-.js";import"./index-DPbJXMEv.js";import"./index-C0j4VFB1.js";import"./Icon-Wyal3cEo.js";import"./modalStack-Ex--0n26.js";import"./zIndex-BGbNBNA8.js";import"./SortableHeader-CbX2dvi0.js";import"./router-BHvqksm0.js";import"./FilterBar-D8UKqCRR.js";import"./floating-ui.react-CAaUf1g-.js";import"./FilterPill-B-I7OT5q.js";import"./Combobox-DQBzXAlP.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-m-mQGuIY.js";import"./MultiSelect-Bu2fQyw8.js";import"./RangeSlider-C6VyblUQ.js";import"./TimeRange-DZTak6Yo.js";import"./select-C26WemBw.js";import"./WorkloadPicker-HSXtcOtU.js";import"./NamespacePicker-7bVQ8q6w.js";import"./index-DA3YuafW.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DxFT-f8X.js";import"./TagList-uQe_Pz6j.js";import"./Badge-8CVShKQz.js";import"./HoverCard-BT2elvub.js";import"./Properties-DtWRSIUU.js";import"./IconButton-B46C5Nql.js";import"./DropdownMenu-CC-C7gGw.js";import"./DropdownMenuSubmenu-DHHN9TUM.js";import"./StatusDot-1JACEmby.js";const{expect:l,userEvent:m,waitFor:B,within:p}=__STORYBOOK_MODULE_TEST__,y=[{service:"api",status:"healthy",restarts:0,owner:"platform",notes:"Primary public API with long-form notes that should keep its width."},{service:"worker",status:"degraded",restarts:3,owner:"data",notes:"Background job processor with retry queues."},{service:"cron",status:"healthy",restarts:1,owner:"platform",notes:"Nightly maintenance and reporting runner."}],b=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"restarts",label:"Restarts",shrink:!0,align:"right",sortValue:e=>Number(e??0)},{key:"owner",label:"Owner",shrink:!0},{key:"notes",label:"Notes",grow:!0}],Bt=[{name:"api",state:"healthy",age:"12m"},{name:"worker",state:"degraded",age:"4m"},{name:"cron",state:"healthy",age:"2h"}],Ct=[{key:"name",label:"Name",shrink:!0},{key:"state",label:"State",shrink:!0},{key:"age",label:"Age",shrink:!0,align:"right"}],Tt=[{service:"api",status:"healthy",region:"us-east",version:"2026.04.1",owner:"platform",latency:42},{service:"billing",status:"healthy",region:"eu-west",version:"2026.04.0",owner:"finance",latency:58},{service:"worker",status:"degraded",region:"us-west",version:"2026.03.9",owner:"data",latency:131}],Rt=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"latency",label:"Latency ms",shrink:!0,align:"right",sortValue:e=>Number(e??0)}],X=[{service:"api",namespace:"frontend",cluster:"prod-a",region:"us-east",zone:"use1-a",status:"healthy",owner:"platform",version:"2026.04.1",cpu:"62%",memory:"5.1 GiB",latency:42,restarts:0,updated:"4m ago",notes:"Primary public API serving customer traffic."},{service:"worker",namespace:"jobs",cluster:"prod-b",region:"us-west",zone:"usw2-c",status:"degraded",owner:"data",version:"2026.03.9",cpu:"78%",memory:"7.8 GiB",latency:131,restarts:3,updated:"9m ago",notes:"Queue processor draining delayed retry batches."},{service:"billing",namespace:"finance",cluster:"prod-eu",region:"eu-west",zone:"euw1-b",status:"healthy",owner:"finance",version:"2026.04.0",cpu:"41%",memory:"3.4 GiB",latency:58,restarts:1,updated:"18m ago",notes:"Ledger sync and invoice reconciliation service."}],U=[{key:"service",label:"Service",grow:!0},{key:"namespace",label:"Namespace",shrink:!0},{key:"cluster",label:"Cluster",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"zone",label:"Zone",shrink:!0},{key:"status",label:"Status",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"cpu",label:"CPU",align:"right",shrink:!0},{key:"memory",label:"Memory",align:"right",shrink:!0},{key:"latency",label:"Latency ms",align:"right",shrink:!0,sortValue:e=>Number(e??0)},{key:"restarts",label:"Restarts",align:"right",shrink:!0,sortValue:e=>Number(e??0)},{key:"updated",label:"Updated",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function jt(e){var f,k;const[t,s]=c.useState("now-24h"),[r,n]=c.useState("now"),[o,u]=c.useState(""),[g,v]=c.useState("");return a.jsx(i,{...e,filterBarProps:{timeRange:{from:t,to:r,onApply:(w,h)=>{s(w),n(h)}},dateRange:{from:o,to:g,onApply:(w,h)=>{u(w),v(h)}}},renderExpandedRow:w=>a.jsxs("div",{className:"text-sm text-muted-foreground",children:[w.service," is owned by ",a.jsx("strong",{children:w.owner}),"."]})},[e.theme??"system",((f=e.defaultSort)==null?void 0:f.key)??"",((k=e.defaultSort)==null?void 0:k.dir)??""].join(":"))}function At(){return a.jsx(i,{data:Bt,columns:Ct,defaultSort:{key:"name",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-few-columns"})}function Dt(){return a.jsx(i,{data:Tt,columns:Rt,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-everything-fits"})}function Nt(){return a.jsx(i,{data:X,columns:U,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-lots-of-columns"})}function Ft(){return a.jsx(i,{data:[],columns:U,loading:!0,loadingMessage:"Loading execution results…",loadingRowCount:8,showGlobalFilter:!1,columnResizeStorageKey:"clicky-ui-story-data-table-loading"})}const gt=[{id:"download-yaml",label:"YAML",icon:ft,iconClassName:"text-violet-600 dark:text-violet-400",onSelect:()=>{console.info("Download YAML")}},{id:"download-json",label:"JSON",icon:Q,onSelect:()=>{console.info("Download JSON")}},{id:"download-csv",label:"CSV",icon:vt,iconClassName:"text-emerald-600 dark:text-emerald-400",onSelect:()=>{console.info("Download CSV")}},{id:"download-pdf",label:"PDF",icon:ht,iconClassName:"text-rose-600 dark:text-rose-400",onSelect:()=>{console.info("Download PDF")}},{id:"download-markdown",label:"Markdown",icon:xt,onSelect:()=>{console.info("Download Markdown")}}];function Et(){return a.jsx(i,{data:X,columns:U,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:gt,columnResizeStorageKey:"clicky-ui-story-data-table-menu-actions"})}const Mt=[{id:"view-clicky",label:"Clicky",icon:Q,section:"View",disabled:!0,onSelect:()=>{console.info("View Clicky")}},{id:"view-json",label:"JSON",icon:Q,section:"View",onSelect:()=>{console.info("View JSON")}},{id:"view-pdf",label:"PDF",icon:ht,iconClassName:"text-rose-600 dark:text-rose-400",section:"View",onSelect:()=>{console.info("View PDF")}},...gt];function Vt(){return a.jsx(i,{data:X,columns:U,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:Mt,columnResizeStorageKey:"clicky-ui-story-data-table-grouped-menu-actions"})}function Ot(e){const t=new Date("2026-04-15T12:04:33Z").getTime(),s=["api","worker","billing","auth"],r=["INFO","WARN","error","ERR","failed","ok"],n=[["region:us-east","tier:edge","v=2026.04.1"],["region:eu-west","tier:core"],["region:us-west","tier:edge","v=2026.04.0","owner=platform"],["region:eu-west","tier:core","owner=finance"],["region:us-east"],["region:ap-south","tier:edge","v=2026.03.9"]],o=e==="subMinute"?8e3:e==="sameDay"?18e5:864e5*90;return Array.from({length:6},(u,g)=>({ts:new Date(t+o*g).toISOString(),level:r[g%r.length],service:s[g%s.length],message:`event #${g} from ${s[g%s.length]}`,tags:n[g%n.length]}))}const It=[{key:"ts",label:"Timestamp",kind:"timestamp",shrink:!0},{key:"level",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"message",label:"Message",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:2}}];function Pt(){const[e,t]=c.useState("sameDay"),s=Ot(e);return a.jsxs("div",{className:"space-y-3",children:[a.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[a.jsx("span",{className:"text-muted-foreground",children:"Data spread:"}),["subMinute","sameDay","multiYear"].map(r=>a.jsx("button",{type:"button",onClick:()=>t(r),className:`rounded-md border px-2 py-1 text-xs ${e===r?"bg-accent text-accent-foreground":"text-muted-foreground"}`,children:r},r))]}),a.jsx(i,{data:s,columns:It,autoFilter:!0,defaultSort:{key:"ts",dir:"desc"},columnResizeStorageKey:`clicky-ui-story-data-table-timestamps-${e}`})]})}const zt=[{id:"1",name:"auth-service",tags:["env=prod","team=identity","tier=edge","region=us-east","v=2026.04.1"]},{id:"2",name:"billing-svc",tags:["env=prod","team=finance","tier=core"]},{id:"3",name:"ingest-pipeline",tags:["env=staging","team=data","tier=core"]},{id:"4",name:"marketing-site",tags:["env=prod","team=growth"]},{id:"5",name:"many-tags",tags:Array.from({length:30},(e,t)=>`label-${t}=value-${t}`)}],Lt=[{key:"id",label:"ID",shrink:!0},{key:"name",label:"Name",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:3}}];function Gt(){return a.jsx(i,{data:zt,columns:Lt,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-tags"})}const $t=[{service:"api",state:"ok",notes:"running normally"},{service:"worker",state:"ERROR",notes:"stack overflow"},{service:"billing",state:"warning",notes:"latency p95 elevated"},{service:"auth",state:"healthy",notes:"all checks green"},{service:"search",state:"failed",notes:"circuit broken"},{service:"cron",state:"degraded",notes:"1/3 retries"},{service:"router",state:"info",notes:"info-only event"},{service:"unknown",state:"mystery",notes:"unmapped value falls through"}],qt=[{key:"state",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function Kt(){return a.jsx(i,{data:$t,columns:qt,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-status-dot"})}function _t(){return a.jsx(i,{data:y,columns:b,defaultSort:{key:"restarts",dir:"asc"},detailStyle:"dialog",detailDialogTitle:e=>`${e.service} details`,columnResizeStorageKey:"clicky-ui-story-data-table-detail-dialog",renderExpandedRow:e=>a.jsxs("div",{className:"space-y-2 text-sm",children:[a.jsxs("p",{className:"text-muted-foreground",children:[e.service," is owned by ",a.jsx("strong",{children:e.owner}),"."]}),a.jsx("pre",{className:"overflow-auto rounded border border-border bg-muted p-2 text-xs",children:JSON.stringify(e,null,2)})]})})}function Ht(){const[e,t]=c.useState({}),[s,r]=c.useState(""),[n,o]=c.useState(""),[u,g]=c.useState(""),v=[{key:"service",kind:"enum",label:"Service",description:"Single-select: show only the chosen service, or leave empty for all.",placeholder:"any service",value:u,options:y.map(d=>({value:d.service})),onChange:g},{key:"status",kind:"multi",label:"Status",description:"Include or exclude services by health. Click once to include, again to exclude.",value:e,options:[{value:"healthy",label:"healthy"},{value:"degraded",label:"degraded"}],onChange:t},{key:"owner",kind:"text",label:"Owner",description:"Match the owning team by substring, e.g. `plat` matches `platform`.",placeholder:"team name…",value:s,onChange:r},{key:"restarts",kind:"number",label:"Min restarts",description:"Only show services that have restarted at least this many times.",value:{min:n},domainMin:0,domainMax:5,step:1,onChange:d=>o(d.min??"")}],f=Object.entries(e).filter(([,d])=>d==="include").map(([d])=>d),k=Object.entries(e).filter(([,d])=>d==="exclude").map(([d])=>d),w=s.trim().toLowerCase(),h=n===""?null:Number(n),x=y.filter(d=>!(u&&d.service!==u||f.length>0&&!f.includes(d.status)||k.includes(d.status)||w&&!d.owner.toLowerCase().includes(w)||h!==null&&d.restarts<h));return a.jsx(i,{data:x,columns:b,defaultSort:{key:"restarts",dir:"asc"},externalFilters:v,columnResizeStorageKey:"clicky-ui-story-data-table-filter-descriptions"})}const ee=["Ada","Grace","Alan","Linus","Katherine","Edsger","Barbara","Dennis","Margaret","Ken","Radia","Donald"],te=["Lovelace","Hopper","Turing","Torvalds","Johnson","Dijkstra","Liskov","Ritchie","Hamilton","Thompson","Perlman","Knuth"],ae=["Platform","Finance","Data","Growth","Identity","Support"],se=["Admin","Editor","Viewer"],ne=["active","invited","disabled"],J=Array.from({length:120},(e,t)=>{const s=ee[t%ee.length],r=te[t*7%te.length];return{id:`person-${t+1}`,name:`${s} ${r}`,email:`${s}.${r}${t+1}`.toLowerCase()+"@example.com",team:ae[t%ae.length],role:se[t%se.length],status:ne[t%ne.length]}}),Z=[{key:"name",label:"Name",grow:!0},{key:"email",label:"Email",grow:!0},{key:"team",label:"Team",shrink:!0},{key:"role",label:"Role",shrink:!0},{key:"status",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}}];function Jt(e,t){if(!t)return e;const s=t.dir==="asc"?1:-1,r=t.key;return[...e].sort((n,o)=>s*String(n[r]).localeCompare(String(o[r])))}function Ut(){const[e,t]=c.useState(!0),[s,r]=c.useState(0),[n,o]=c.useState(10),[u,g]=c.useState({key:"name",dir:"asc"}),[v,f]=c.useState({}),w=Jt(J,u).slice(s*n,s*n+n),h=Object.keys(v).length;return a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1.5 text-primary-foreground",onClick:()=>t(!0),children:"Add people"}),a.jsx(kt,{open:e,onClose:()=>t(!1),title:"Add people",size:"xl",expandable:!0,scrollBody:!1,footer:a.jsxs("div",{className:"flex items-center justify-between gap-3",children:[a.jsx("span",{className:"text-xs text-muted-foreground",children:h===0?"Select one or more people from the table.":`${h} selected`}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50",onClick:()=>f({}),disabled:h===0,children:"Clear"}),a.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50",onClick:()=>t(!1),disabled:h===0,children:h>0?`Add ${h}`:"Add"})]})]}),children:a.jsx(i,{className:"min-h-0 flex-1",data:w,columns:Z,getRowId:x=>x.id,sort:u,onSortChange:g,manualSort:!0,columnResizeStorageKey:"clicky-ui-story-data-table-dialog",rowSelection:{selectedRowIds:Object.keys(v),toggleOnRowClick:!0,onSelectionChange:(x,d)=>{const bt=new Map(d.map(S=>[S.id,S]));f(Object.fromEntries(x.map(S=>[S,bt.get(S)??v[S]])))}},pagination:{page:s,pageSize:n,total:J.length,pageSizeOptions:[10,25,50],onPageChange:r,onPageSizeChange:x=>{r(0),o(x)}}})})]})}function Wt(){const e={getGroupKey:t=>t.owner,getGroupLabel:t=>`Owned by ${t}`,getGroupMeta:(t,s)=>`${s.reduce((r,n)=>r+n.restarts,0)} restarts`};return a.jsxs("div",{className:"space-y-6",children:[a.jsxs("section",{className:"space-y-2",children:[a.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "end" (default)'}),a.jsx(i,{data:y,columns:b,getRowId:t=>t.service,grouping:e})]}),a.jsxs("section",{className:"space-y-2",children:[a.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "start"'}),a.jsx(i,{data:y,columns:b,getRowId:t=>t.service,grouping:{...e,metaAlign:"start"}})]})]})}const Yt=[{type:"column",value:"owner",label:"Owner",columnKey:"owner"},{type:"custom",value:"status",label:"Status",getGroupKey:e=>e.status,getGroupLabel:e=>`Status: ${e}`},{type:"none",value:"none",label:"No grouping"}];function Qt(){return a.jsx(i,{data:y,columns:b,getRowId:e=>e.service,groupingModes:Yt,defaultGroupingMode:"owner"})}const W=3706;function Xt(){const[e,t]=c.useState([]),[s,r]=c.useState(!1),n=()=>{r(!0),window.setTimeout(()=>{t(Array.from({length:W},(o,u)=>`service-${u}`)),r(!1)},300)};return a.jsx(i,{data:y,columns:b,getRowId:o=>o.service,rowSelection:{selectedRowIds:e,onSelectionChange:o=>t(o),selectAllPages:{noun:"services",loading:s,scopes:[{total:W,onSelectAll:n}]}},pagination:{page:0,pageSize:3,total:W,onPageChange:()=>{},onPageSizeChange:()=>{}},selectionActions:({selectedRowIds:o,clearSelection:u})=>a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"text-xs",children:a.jsxs("b",{children:[o.length.toLocaleString()," selected"]})}),a.jsxs("span",{className:"flex gap-2",children:[a.jsx(C,{size:"sm",variant:"ghost",onClick:u,children:"Clear"}),a.jsxs(C,{size:"sm",children:["Restart ",o.length.toLocaleString()]})]})]})})}function Zt(){const[e,t]=c.useState([]);return a.jsx(i,{data:y,columns:b,getRowId:s=>s.service,rowSelection:{selectedRowIds:e,onSelectionChange:s=>t(s)},getRowClassName:s=>s.restarts>=3?"bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10":void 0,footer:({visibleRowCount:s,totalRowCount:r})=>`Showing ${s} of ${r} services · ${y.reduce((n,o)=>n+o.restarts,0)} restarts total`,selectionActions:({selectedRows:s,clearSelection:r})=>a.jsxs(a.Fragment,{children:[a.jsxs("span",{className:"text-xs",children:[a.jsxs("b",{children:[s.length," selected"]}),a.jsxs("span",{className:"opacity-70",children:[" · ",s.reduce((n,o)=>n+o.restarts,0)," ","restarts"]})]}),a.jsxs("span",{className:"flex gap-2",children:[a.jsx(C,{size:"sm",variant:"ghost",onClick:r,children:"Clear"}),a.jsxs(C,{size:"sm",children:["Restart ",s.length]})]})]})})}function ea(){const[e,t]=c.useState([]),[s,r]=c.useState([]),n=o=>r(u=>[...u,o]);return a.jsxs("div",{className:"flex flex-col gap-density-2",children:[a.jsx(i,{data:y,columns:b,getRowId:o=>o.service,rowSelection:{selectedRowIds:e,onSelectionChange:o=>t(o)},selectionActions:[{id:"restart",label:"Restart",primary:!0,variant:"default",icon:St,pendingLabel:"Restarting…",onSelect:async o=>{await new Promise(u=>setTimeout(u,600)),n(`restarted ${o.selectedRowIds.join(", ")}`)}},{id:"drain",label:"Drain",primary:!0,onSelect:()=>n("drained")},{id:"delete",label:"Delete",primary:!0,variant:"destructive",confirm:{message:o=>`Delete ${o.selectedRows.length} services? This cannot be undone.`},onSelect:o=>n(`deleted ${o.selectedRowIds.length}`)},{id:"export",label:"Export",section:"Download",onSelect:()=>{},children:[{id:"export-csv",label:"CSV",onSelect:()=>n("exported csv")},{id:"export-json",label:"JSON",onSelect:()=>n("exported json")}]},{id:"tag",label:"Add tag",onSelect:()=>n("tagged")}]}),a.jsx("p",{className:"px-1 text-xs text-muted-foreground",children:s.length?s.join(" · "):"No actions run yet."})]})}const Ga={title:"Data/DataTable",component:i,render:e=>a.jsx(jt,{...e}),args:{data:y,columns:b,loading:!1,loadingMessage:"Loading services…",loadingRowCount:8,emptyMessage:"No services",autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:"Search all columns…",defaultSort:{key:"restarts",dir:"asc"},resizableColumns:!0,hideableColumns:!0,persistColumnWidths:!0,persistColumnVisibility:!0,persistDensity:!0,showDensityControl:!0,showThemeControl:!1,showHeaderFilters:!0,showFullscreenControl:!1,fullscreenTitle:"Services",fullscreenButtonLabel:"Open table full screen"},argTypes:{data:{control:!1,table:{category:"Data"}},columns:{control:!1,table:{category:"Data"}},loading:{control:"boolean",table:{category:"State"}},loadingMessage:{control:"text",table:{category:"State"}},loadingRowCount:{control:{type:"range",min:1,max:20,step:1},table:{category:"State"}},emptyMessage:{control:"text",table:{category:"State"}},autoFilter:{control:"boolean",table:{category:"Filtering"}},showGlobalFilter:{control:"boolean",table:{category:"Filtering"}},globalFilterPlaceholder:{control:"text",table:{category:"Filtering"}},showHeaderFilters:{control:"boolean",table:{category:"Filtering"}},resizableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnWidths:{control:"boolean",table:{category:"Columns"}},hideableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnVisibility:{control:"boolean",table:{category:"Columns"}},persistDensity:{control:"boolean",table:{category:"Preferences"}},showDensityControl:{control:"boolean",table:{category:"Preferences"}},showThemeControl:{control:"boolean",table:{category:"Preferences"}},showFullscreenControl:{control:"boolean",table:{category:"Fullscreen"}},fullscreenTitle:{control:"text",table:{category:"Fullscreen"}},fullscreenButtonLabel:{control:"text",table:{category:"Fullscreen"}}},parameters:{docs:{description:{component:"Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns."}}}},T={},R={args:{showFullscreenControl:!0,fullscreenButtonLabel:"Open controlled table"},play:async({canvasElement:e})=>{const t=p(e);await l(t.getByRole("button",{name:"Open controlled table"})).toBeVisible()}},j={render:()=>a.jsx(At,{})},A={render:()=>a.jsx(Ft,{})},D={render:()=>a.jsx(Dt,{})},N={render:()=>a.jsx(Nt,{})},F={render:()=>a.jsx(Et,{})},E={render:()=>a.jsx(Vt,{}),parameters:{docs:{description:{story:"Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."}}}},M={render:()=>a.jsx(Pt,{})},V={render:()=>a.jsx(Gt,{})},O={render:()=>a.jsx(Kt,{})},I={render:()=>a.jsx(_t,{})},P={render:()=>a.jsx(Ut,{}),parameters:{docs:{description:{story:['A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.',"","- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.","- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.",'- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for "Page X of Y".'].join(`
`)}}}},z={render:()=>a.jsx(Zt,{}),parameters:{docs:{description:{story:["`selectionActions` renders bulk actions in the toolbar beside the table menu whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.","",'`footer` replaces the default "N of M rows" strip, and `getRowClassName` tints the degraded row.'].join(`
`)}}},play:async({canvasElement:e})=>{const t=p(e);await l(t.getByText(/Showing 3 of 3 services/)).toBeInTheDocument(),await l(t.queryByText("3 of 3 rows")).toBeNull(),await m.click(t.getByRole("checkbox",{name:"Select row worker"}));const s=p(t.getByTestId("data-table-selection-actions"));await l(s.getByText("1 selected")).toBeVisible(),await l(s.getByText(/3 restarts/)).toBeVisible(),await m.click(s.getByRole("button",{name:"Clear"})),await l(t.queryByTestId("data-table-selection-actions")).toBeNull()}},L={render:()=>a.jsx(ea,{}),parameters:{docs:{description:{story:["`selectionActions` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.","","`primary` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same `section`/`children` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."].join(`
`)}}},play:async({canvasElement:e})=>{const t=p(e);await m.click(t.getByRole("checkbox",{name:"Select row worker"})),await m.click(t.getByRole("checkbox",{name:"Select row cron"}));const s=p(t.getByTestId("data-table-selection-actions"));await l(s.getByText("2 selected")).toBeVisible(),await l(s.getByRole("button",{name:"Restart"})).toBeVisible(),await l(s.getByRole("button",{name:"Delete"})).toBeVisible(),await m.click(s.getByRole("button",{name:"Delete"})),await l(await p(document.body).findByText("Delete 2 services? This cannot be undone.")).toBeVisible(),await m.click(p(document.body).getByRole("button",{name:"Cancel"})),await l(t.getByText("No actions run yet.")).toBeVisible(),await m.click(s.getByRole("button",{name:/More/}));const r=p(await p(document.body).findByRole("menu"));await l(r.getByRole("menuitem",{name:"Add tag"})).toBeVisible()}},G={render:()=>a.jsx(Xt,{}),parameters:{docs:{description:{story:["The header checkbox reaches only the rows the table is holding. `rowSelection.selectAllPages` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling `onSelectAll` so the caller can fetch the pages it has not loaded.","","`scopes` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so `select all` means the rows in front of the reader before it means every row the filters allow. A scope's `total` defaults to `pagination.total`."].join(`
`)}}},play:async({canvasElement:e})=>{const t=p(e);await l(t.queryByTestId("data-table-selection-scope")).toBeNull(),await m.click(t.getByRole("checkbox",{name:"Select all visible rows"}));const s=p(t.getByTestId("data-table-selection-scope"));await l(s.getByText("3 of 3,706 services selected.")).toBeVisible(),await m.click(s.getByRole("button",{name:"Select all 3,706 services"})),await l(await t.findByText("All 3,706 services selected.")).toBeVisible();const r=p(t.getByTestId("data-table-selection-actions"));await l(r.getByText("3,706 selected")).toBeVisible(),await m.click(t.getByRole("button",{name:"Clear selection"})),await l(t.queryByTestId("data-table-selection-scope")).toBeNull()}},$={render:()=>a.jsx(Ht,{}),parameters:{docs:{description:{story:"Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."}}}},q={render:()=>a.jsx(Wt,{}),parameters:{docs:{description:{story:["`grouping` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.","",'`getGroupMeta` is a per-group summary rendered inside the header row. `metaAlign` places it: `"end"` (the default) pins it to the trailing edge, while `"start"` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'].join(`
`)}}},play:async({canvasElement:e})=>{const s=p(e).getAllByRole("button").filter(o=>o.hasAttribute("aria-expanded")),[r]=s,n=s[s.length/2];await l(r).toHaveClass("flex-1"),await l(n).not.toHaveClass("flex-1"),await l(n==null?void 0:n.nextElementSibling).toHaveTextContent("restarts"),await m.click(n),await l(n).toHaveAttribute("aria-expanded","false")}},K={render:()=>a.jsx(Qt,{}),parameters:{docs:{description:{story:"`groupingModes` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."}}},play:async({canvasElement:e})=>{const t=p(e),s=t.getByRole("combobox",{name:"Group rows by"});await l(s).toHaveValue("owner"),await m.click(t.getByRole("button",{name:"Collapse all groups"})),await l(t.queryByText("api")).toBeNull(),await m.selectOptions(s,"status"),await l(t.getByRole("button",{name:/^Status: healthy/})).toBeVisible()}},wt=Array.from({length:5e3},(e,t)=>{const s=J[t%J.length];return{...s,id:`person-${t+1}`,name:`${s.name} #${t+1}`}});function Y(e){return e.querySelectorAll("tbody tr:not([data-virtual-spacer])").length}function yt(e){const t=e.querySelector(".overflow-auto");if(!t)throw new Error("no scroll container");return t}const _={render:()=>a.jsx(i,{data:wt,columns:Z,virtualize:!0,scrollContainerClassName:"max-h-[26rem]"}),parameters:{docs:{description:{story:"`virtualize` keeps only the rows near the viewport in the DOM — 5,000 rows here cost a few dozen `<tr>`s plus two spacers. The data is not windowed: counts, grouping and select-all still see all 5,000."}}},play:async({canvasElement:e})=>{const t=p(e);await l(await t.findByText(/#1$/)).toBeVisible(),await B(()=>l(Y(e)).toBeLessThan(120)),await l(Y(e)).toBeGreaterThan(0);const s=e.querySelector("thead th"),r=s.getBoundingClientRect().width,n=yt(e);n.scrollTop=n.scrollHeight,await B(()=>{var o;return l((o=e.querySelector("tbody"))==null?void 0:o.textContent).toContain("#5000")}),await l(Y(e)).toBeLessThan(120),await l(s.getBoundingClientRect().width).toBeCloseTo(r,0),n.scrollTop=0,await B(()=>{var o;return l((o=e.querySelector("tbody"))==null?void 0:o.textContent).toContain("#1")})}},H={render:function(){const[,t]=c.useState(0);return a.jsxs("div",{className:"flex flex-col gap-2",children:[a.jsx(C,{size:"sm",onClick:()=>t(s=>s+1),children:"Rebuild rows array"}),a.jsx(i,{data:[...wt],columns:Z,virtualize:!0,scrollContainerClassName:"max-h-[26rem]"})]})},play:async({canvasElement:e})=>{const t=p(e),s=yt(e),r=4e3;s.scrollTop=r,await B(()=>l(e.querySelector("tbody").textContent).toContain("#100"));const n=s.scrollTop,o=e.querySelector("tbody").textContent;await m.click(t.getByRole("button",{name:"Rebuild rows array"})),await l(s.scrollTop).toBe(n),await B(()=>l(e.querySelector("tbody").textContent).toBe(o))}};var oe,re,le;T.parameters={...T.parameters,docs:{...(oe=T.parameters)==null?void 0:oe.docs,source:{originalSource:"{}",...(le=(re=T.parameters)==null?void 0:re.docs)==null?void 0:le.source}}};var ie,ce,de;R.parameters={...R.parameters,docs:{...(ie=R.parameters)==null?void 0:ie.docs,source:{originalSource:`{
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
}`,...(de=(ce=R.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var ue,pe,me;j.parameters={...j.parameters,docs:{...(ue=j.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: () => <FewColumnsShowcase />
}`,...(me=(pe=j.parameters)==null?void 0:pe.docs)==null?void 0:me.source}}};var he,ge,we;A.parameters={...A.parameters,docs:{...(he=A.parameters)==null?void 0:he.docs,source:{originalSource:`{
  render: () => <LoadingShowcase />
}`,...(we=(ge=A.parameters)==null?void 0:ge.docs)==null?void 0:we.source}}};var ye,be,fe;D.parameters={...D.parameters,docs:{...(ye=D.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  render: () => <EverythingFitsShowcase />
}`,...(fe=(be=D.parameters)==null?void 0:be.docs)==null?void 0:fe.source}}};var ve,xe,Se;N.parameters={...N.parameters,docs:{...(ve=N.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  render: () => <LotsOfColumnsShowcase />
}`,...(Se=(xe=N.parameters)==null?void 0:xe.docs)==null?void 0:Se.source}}};var ke,Be,Ce;F.parameters={...F.parameters,docs:{...(ke=F.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  render: () => <MenuActionsShowcase />
}`,...(Ce=(Be=F.parameters)==null?void 0:Be.docs)==null?void 0:Ce.source}}};var Te,Re,je;E.parameters={...E.parameters,docs:{...(Te=E.parameters)==null?void 0:Te.docs,source:{originalSource:`{
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Menu actions with a \`section\` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."
      }
    }
  }
}`,...(je=(Re=E.parameters)==null?void 0:Re.docs)==null?void 0:je.source}}};var Ae,De,Ne;M.parameters={...M.parameters,docs:{...(Ae=M.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  render: () => <TimestampsShowcase />
}`,...(Ne=(De=M.parameters)==null?void 0:De.docs)==null?void 0:Ne.source}}};var Fe,Ee,Me;V.parameters={...V.parameters,docs:{...(Fe=V.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
  render: () => <TagsShowcase />
}`,...(Me=(Ee=V.parameters)==null?void 0:Ee.docs)==null?void 0:Me.source}}};var Ve,Oe,Ie;O.parameters={...O.parameters,docs:{...(Ve=O.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
  render: () => <StatusDotShowcase />
}`,...(Ie=(Oe=O.parameters)==null?void 0:Oe.docs)==null?void 0:Ie.source}}};var Pe,ze,Le;I.parameters={...I.parameters,docs:{...(Pe=I.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  render: () => <RowDetailDialogShowcase />
}`,...(Le=(ze=I.parameters)==null?void 0:ze.docs)==null?void 0:Le.source}}};var Ge,$e,qe;P.parameters={...P.parameters,docs:{...(Ge=P.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: ['A DataTable hosted inside a \`Modal\` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.', "", "- **Only the rows scroll.** The dialog sets \`scrollBody={false}\`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.", "- **Selection persists across pages.** It is keyed by \`getRowId\`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.", '- **Pagination is server-shaped.** The DataTable never slices \`data\`, so the story sorts and slices the current page itself and reports the true \`total\` for "Page X of Y".'].join("\\n")
      }
    }
  }
}`,...(qe=($e=P.parameters)==null?void 0:$e.docs)==null?void 0:qe.source}}};var Ke,_e,He;z.parameters={...z.parameters,docs:{...(Ke=z.parameters)==null?void 0:Ke.docs,source:{originalSource:`{
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
}`,...(He=(_e=z.parameters)==null?void 0:_e.docs)==null?void 0:He.source}}};var Je,Ue,We;L.parameters={...L.parameters,docs:{...(Je=L.parameters)==null?void 0:Je.docs,source:{originalSource:`{
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
}`,...(We=(Ue=L.parameters)==null?void 0:Ue.docs)==null?void 0:We.source}}};var Ye,Qe,Xe;G.parameters={...G.parameters,docs:{...(Ye=G.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...(Xe=(Qe=G.parameters)==null?void 0:Qe.docs)==null?void 0:Xe.source}}};var Ze,et,tt;$.parameters={...$.parameters,docs:{...(Ze=$.parameters)==null?void 0:Ze.docs,source:{originalSource:`{
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Caller-owned filters that each carry a \`description\`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."
      }
    }
  }
}`,...(tt=(et=$.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var at,st,nt;q.parameters={...q.parameters,docs:{...(at=q.parameters)==null?void 0:at.docs,source:{originalSource:`{
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
}`,...(nt=(st=q.parameters)==null?void 0:st.docs)==null?void 0:nt.source}}};var ot,rt,lt;K.parameters={...K.parameters,docs:{...(ot=K.parameters)==null?void 0:ot.docs,source:{originalSource:`{
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
}`,...(lt=(rt=K.parameters)==null?void 0:rt.docs)==null?void 0:lt.source}}};var it,ct,dt;_.parameters={..._.parameters,docs:{...(it=_.parameters)==null?void 0:it.docs,source:{originalSource:`{
  render: () => <DataTable data={manyPeople} columns={peopleColumns} virtualize scrollContainerClassName="max-h-[26rem]" />,
  parameters: {
    docs: {
      description: {
        story: "\`virtualize\` keeps only the rows near the viewport in the DOM — 5,000 rows here cost a few dozen \`<tr>\`s plus two spacers. The data is not windowed: counts, grouping and select-all still see all 5,000."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/#1$/)).toBeVisible();

    // A tiny fraction of 5,000 rows is in the DOM — that is the whole point.
    await waitFor(() => expect(rowCount(canvasElement)).toBeLessThan(120));
    await expect(rowCount(canvasElement)).toBeGreaterThan(0);

    // Column widths must not shift as new windows scroll in.
    const header = canvasElement.querySelector<HTMLElement>("thead th")!;
    const widthBefore = header.getBoundingClientRect().width;
    const el = scroller(canvasElement);
    el.scrollTop = el.scrollHeight;
    await waitFor(() => expect(canvasElement.querySelector("tbody")?.textContent).toContain("#5000"));
    await expect(rowCount(canvasElement)).toBeLessThan(120);
    await expect(header.getBoundingClientRect().width).toBeCloseTo(widthBefore, 0);

    // Scrolling back finds the first row again.
    el.scrollTop = 0;
    await waitFor(() => expect(canvasElement.querySelector("tbody")?.textContent).toContain("#1"));
  }
}`,...(dt=(ct=_.parameters)==null?void 0:ct.docs)==null?void 0:dt.source}}};var ut,pt,mt;H.parameters={...H.parameters,docs:{...(ut=H.parameters)==null?void 0:ut.docs,source:{originalSource:`{
  render: function Render() {
    const [, force] = useState(0);
    return <div className="flex flex-col gap-2">
        <Button size="sm" onClick={() => force(n => n + 1)}>
          Rebuild rows array
        </Button>
        <DataTable
      // A fresh array with identical contents on every render — the shape a
      // parent produces with \`rows.map(...)\` in its render body. The old
      // clientReveal window reset to its first batch here, throwing away
      // everything the reader had scrolled to.
      data={[...manyPeople]} columns={peopleColumns} virtualize scrollContainerClassName="max-h-[26rem]" />
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const el = scroller(canvasElement);
    const deepScrollOffset = 4000;
    el.scrollTop = deepScrollOffset;
    await waitFor(() => expect(canvasElement.querySelector("tbody")!.textContent).toContain("#100"));
    const scrollTopAtDepth = el.scrollTop;
    const textAtDepth = canvasElement.querySelector("tbody")!.textContent;
    await userEvent.click(canvas.getByRole("button", {
      name: "Rebuild rows array"
    }));

    // Same settled scroll offset, same rows: a new array identity is inert.
    await expect(el.scrollTop).toBe(scrollTopAtDepth);
    await waitFor(() => expect(canvasElement.querySelector("tbody")!.textContent).toBe(textAtDepth));
  }
}`,...(mt=(pt=H.parameters)==null?void 0:pt.docs)==null?void 0:mt.source}}};const $a=["Default","Playground","FewColumns","InitialLoading","EverythingFits","LotsOfColumns","MenuActions","GroupedMenuActions","Timestamps","Tags","StatusDots","RowDetailDialog","InDialogWithPagingAndSelection","SelectionActionsAndFooter","SelectionActionDescriptors","SelectAllPages","FilterDescriptions","GroupedRows","NativeGrouping","Virtualized","VirtualizedKeepsRowsWhenDataIsRebuilt"];export{T as Default,D as EverythingFits,j as FewColumns,$ as FilterDescriptions,E as GroupedMenuActions,q as GroupedRows,P as InDialogWithPagingAndSelection,A as InitialLoading,N as LotsOfColumns,F as MenuActions,K as NativeGrouping,R as Playground,I as RowDetailDialog,G as SelectAllPages,L as SelectionActionDescriptors,z as SelectionActionsAndFooter,O as StatusDots,V as Tags,M as Timestamps,_ as Virtualized,H as VirtualizedKeepsRowsWhenDataIsRebuilt,$a as __namedExportsOrder,Ga as default};

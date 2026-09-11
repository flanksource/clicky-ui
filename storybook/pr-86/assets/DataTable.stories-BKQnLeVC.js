import{j as t,r as c,a4 as Q,a6 as ft,a3 as kt,a5 as Bt,a7 as Ct,F as Tt}from"./iframe-DAGeDdmW.js";import{B as C}from"./button-B7rSq3cQ.js";import{M as Rt}from"./Modal-D6taPS5_.js";import{D as l}from"./DataTable-Cc5LSKP0.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-bJuzykOR.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./Icon-IzT7REGK.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./SortableHeader-DZZ3Z5vv.js";import"./router-CBmx4Jzs.js";import"./FilterBar-6Q0dYKcM.js";import"./floating-ui.react-BkCnCGeJ.js";import"./FilterPill-DV-iQbbS.js";import"./Combobox-HGgQ0fO7.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bwg-aphn.js";import"./MultiSelect-BlqhYQ5i.js";import"./RangeSlider-BgtPntN_.js";import"./TimeRange-DDd7oDN_.js";import"./select-Bi98GQIF.js";import"./WorkloadPicker-DDYK6JQf.js";import"./NamespacePicker-DRk60EPo.js";import"./index-WFHNvFaJ.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Do3doFXk.js";import"./TagList-uFsLomSl.js";import"./Badge-W8TfuLL4.js";import"./HoverCard-BVfeNivj.js";import"./Properties-DcW2ye_v.js";import"./IconButton-Cr79YAU0.js";import"./DropdownMenu-JxGWd7zY.js";import"./DropdownMenuSubmenu-YmOPmNs-.js";import"./StatusDot-CAKBy3jR.js";const{expect:i,userEvent:m,waitFor:B,within:p}=__STORYBOOK_MODULE_TEST__,y=[{service:"api",status:"healthy",restarts:0,owner:"platform",notes:"Primary public API with long-form notes that should keep its width."},{service:"worker",status:"degraded",restarts:3,owner:"data",notes:"Background job processor with retry queues."},{service:"cron",status:"healthy",restarts:1,owner:"platform",notes:"Nightly maintenance and reporting runner."}],b=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"restarts",label:"Restarts",shrink:!0,align:"right",sortValue:e=>Number(e??0)},{key:"owner",label:"Owner",shrink:!0},{key:"notes",label:"Notes",grow:!0}],jt=[{name:"api",state:"healthy",age:"12m"},{name:"worker",state:"degraded",age:"4m"},{name:"cron",state:"healthy",age:"2h"}],At=[{key:"name",label:"Name",shrink:!0},{key:"state",label:"State",shrink:!0},{key:"age",label:"Age",shrink:!0,align:"right"}],Dt=[{service:"api",status:"healthy",region:"us-east",version:"2026.04.1",owner:"platform",latency:42},{service:"billing",status:"healthy",region:"eu-west",version:"2026.04.0",owner:"finance",latency:58},{service:"worker",status:"degraded",region:"us-west",version:"2026.03.9",owner:"data",latency:131}],Nt=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"latency",label:"Latency ms",shrink:!0,align:"right",sortValue:e=>Number(e??0)}],X=[{service:"api",namespace:"frontend",cluster:"prod-a",region:"us-east",zone:"use1-a",status:"healthy",owner:"platform",version:"2026.04.1",cpu:"62%",memory:"5.1 GiB",latency:42,restarts:0,updated:"4m ago",notes:"Primary public API serving customer traffic."},{service:"worker",namespace:"jobs",cluster:"prod-b",region:"us-west",zone:"usw2-c",status:"degraded",owner:"data",version:"2026.03.9",cpu:"78%",memory:"7.8 GiB",latency:131,restarts:3,updated:"9m ago",notes:"Queue processor draining delayed retry batches."},{service:"billing",namespace:"finance",cluster:"prod-eu",region:"eu-west",zone:"euw1-b",status:"healthy",owner:"finance",version:"2026.04.0",cpu:"41%",memory:"3.4 GiB",latency:58,restarts:1,updated:"18m ago",notes:"Ledger sync and invoice reconciliation service."}],W=[{key:"service",label:"Service",grow:!0},{key:"namespace",label:"Namespace",shrink:!0},{key:"cluster",label:"Cluster",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"zone",label:"Zone",shrink:!0},{key:"status",label:"Status",shrink:!0},{key:"owner",label:"Owner",shrink:!0},{key:"version",label:"Version",shrink:!0},{key:"cpu",label:"CPU",align:"right",shrink:!0},{key:"memory",label:"Memory",align:"right",shrink:!0},{key:"latency",label:"Latency ms",align:"right",shrink:!0,sortValue:e=>Number(e??0)},{key:"restarts",label:"Restarts",align:"right",shrink:!0,sortValue:e=>Number(e??0)},{key:"updated",label:"Updated",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function Ft(e){var f,k;const[a,o]=c.useState("now-24h"),[r,n]=c.useState("now"),[s,u]=c.useState(""),[g,v]=c.useState("");return t.jsx(l,{...e,filterBarProps:{timeRange:{from:a,to:r,onApply:(w,h)=>{o(w),n(h)}},dateRange:{from:s,to:g,onApply:(w,h)=>{u(w),v(h)}}},renderExpandedRow:w=>t.jsxs("div",{className:"text-sm text-muted-foreground",children:[w.service," is owned by ",t.jsx("strong",{children:w.owner}),"."]})},[e.theme??"system",((f=e.defaultSort)==null?void 0:f.key)??"",((k=e.defaultSort)==null?void 0:k.dir)??""].join(":"))}function Mt(){return t.jsx(l,{data:jt,columns:At,defaultSort:{key:"name",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-few-columns"})}function Et(){return t.jsx(l,{data:Dt,columns:Nt,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-everything-fits"})}function Vt(){return t.jsx(l,{data:X,columns:W,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},columnResizeStorageKey:"clicky-ui-story-data-table-lots-of-columns"})}function Pt(){return t.jsx(l,{data:[],columns:W,loading:!0,loadingMessage:"Loading execution results…",loadingRowCount:8,showGlobalFilter:!1,columnResizeStorageKey:"clicky-ui-story-data-table-loading"})}const ee=[{id:"download-yaml",label:"YAML",icon:kt,iconClassName:"text-violet-600 dark:text-violet-400",onSelect:()=>{console.info("Download YAML")}},{id:"download-json",label:"JSON",icon:Q,onSelect:()=>{console.info("Download JSON")}},{id:"download-csv",label:"CSV",icon:Bt,iconClassName:"text-emerald-600 dark:text-emerald-400",onSelect:()=>{console.info("Download CSV")}},{id:"download-pdf",label:"PDF",icon:ft,iconClassName:"text-rose-600 dark:text-rose-400",onSelect:()=>{console.info("Download PDF")}},{id:"download-markdown",label:"Markdown",icon:Ct,onSelect:()=>{console.info("Download Markdown")}}];function It(){return t.jsx(l,{data:X,columns:W,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:ee,columnResizeStorageKey:"clicky-ui-story-data-table-menu-actions"})}const Ot=[{id:"view-clicky",label:"Clicky",icon:Q,section:"View",disabled:!0,onSelect:()=>{console.info("View Clicky")}},{id:"view-json",label:"JSON",icon:Q,section:"View",onSelect:()=>{console.info("View JSON")}},{id:"view-pdf",label:"PDF",icon:ft,iconClassName:"text-rose-600 dark:text-rose-400",section:"View",onSelect:()=>{console.info("View PDF")}},...ee];function zt(){return t.jsx(l,{data:X,columns:W,autoFilter:!0,defaultSort:{key:"latency",dir:"asc"},menuActions:Ot,columnResizeStorageKey:"clicky-ui-story-data-table-grouped-menu-actions"})}function Lt(e){const a=new Date("2026-04-15T12:04:33Z").getTime(),o=["api","worker","billing","auth"],r=["INFO","WARN","error","ERR","failed","ok"],n=[["region:us-east","tier:edge","v=2026.04.1"],["region:eu-west","tier:core"],["region:us-west","tier:edge","v=2026.04.0","owner=platform"],["region:eu-west","tier:core","owner=finance"],["region:us-east"],["region:ap-south","tier:edge","v=2026.03.9"]],s=e==="subMinute"?8e3:e==="sameDay"?18e5:864e5*90;return Array.from({length:6},(u,g)=>({ts:new Date(a+s*g).toISOString(),level:r[g%r.length],service:o[g%o.length],message:`event #${g} from ${o[g%o.length]}`,tags:n[g%n.length]}))}const Gt=[{key:"ts",label:"Timestamp",kind:"timestamp",shrink:!0},{key:"level",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"message",label:"Message",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:2}}];function $t(){const[e,a]=c.useState("sameDay"),o=Lt(e);return t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[t.jsx("span",{className:"text-muted-foreground",children:"Data spread:"}),["subMinute","sameDay","multiYear"].map(r=>t.jsx("button",{type:"button",onClick:()=>a(r),className:`rounded-md border px-2 py-1 text-xs ${e===r?"bg-accent text-accent-foreground":"text-muted-foreground"}`,children:r},r))]}),t.jsx(l,{data:o,columns:Gt,autoFilter:!0,defaultSort:{key:"ts",dir:"desc"},columnResizeStorageKey:`clicky-ui-story-data-table-timestamps-${e}`})]})}const qt=[{id:"1",name:"auth-service",tags:["env=prod","team=identity","tier=edge","region=us-east","v=2026.04.1"]},{id:"2",name:"billing-svc",tags:["env=prod","team=finance","tier=core"]},{id:"3",name:"ingest-pipeline",tags:["env=staging","team=data","tier=core"]},{id:"4",name:"marketing-site",tags:["env=prod","team=growth"]},{id:"5",name:"many-tags",tags:Array.from({length:30},(e,a)=>`label-${a}=value-${a}`)}],Kt=[{key:"id",label:"ID",shrink:!0},{key:"name",label:"Name",grow:!0},{key:"tags",label:"Tags",kind:"tags",grow:!0,tags:{maxVisible:3}}];function Ht(){return t.jsx(l,{data:qt,columns:Kt,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-tags"})}const _t=[{service:"api",state:"ok",notes:"running normally"},{service:"worker",state:"ERROR",notes:"stack overflow"},{service:"billing",state:"warning",notes:"latency p95 elevated"},{service:"auth",state:"healthy",notes:"all checks green"},{service:"search",state:"failed",notes:"circuit broken"},{service:"cron",state:"degraded",notes:"1/3 retries"},{service:"router",state:"info",notes:"info-only event"},{service:"unknown",state:"mystery",notes:"unmapped value falls through"}],Ut=[{key:"state",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}},{key:"service",label:"Service",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function Jt(){return t.jsx(l,{data:_t,columns:Ut,autoFilter:!0,columnResizeStorageKey:"clicky-ui-story-data-table-status-dot"})}function Wt(){return t.jsx(l,{data:y,columns:b,defaultSort:{key:"restarts",dir:"asc"},detailStyle:"dialog",detailDialogTitle:e=>`${e.service} details`,columnResizeStorageKey:"clicky-ui-story-data-table-detail-dialog",renderExpandedRow:e=>t.jsxs("div",{className:"space-y-2 text-sm",children:[t.jsxs("p",{className:"text-muted-foreground",children:[e.service," is owned by ",t.jsx("strong",{children:e.owner}),"."]}),t.jsx("pre",{className:"overflow-auto rounded border border-border bg-muted p-2 text-xs",children:JSON.stringify(e,null,2)})]})})}function Yt(){const[e,a]=c.useState({}),[o,r]=c.useState(""),[n,s]=c.useState(""),[u,g]=c.useState(""),v=[{key:"service",kind:"enum",label:"Service",description:"Single-select: show only the chosen service, or leave empty for all.",placeholder:"any service",value:u,options:y.map(d=>({value:d.service})),onChange:g},{key:"status",kind:"multi",label:"Status",description:"Include or exclude services by health. Click once to include, again to exclude.",value:e,options:[{value:"healthy",label:"healthy"},{value:"degraded",label:"degraded"}],onChange:a},{key:"owner",kind:"text",label:"Owner",description:"Match the owning team by substring, e.g. `plat` matches `platform`.",placeholder:"team name…",value:o,onChange:r},{key:"restarts",kind:"number",label:"Min restarts",description:"Only show services that have restarted at least this many times.",value:{min:n},domainMin:0,domainMax:5,step:1,onChange:d=>s(d.min??"")}],f=Object.entries(e).filter(([,d])=>d==="include").map(([d])=>d),k=Object.entries(e).filter(([,d])=>d==="exclude").map(([d])=>d),w=o.trim().toLowerCase(),h=n===""?null:Number(n),x=y.filter(d=>!(u&&d.service!==u||f.length>0&&!f.includes(d.status)||k.includes(d.status)||w&&!d.owner.toLowerCase().includes(w)||h!==null&&d.restarts<h));return t.jsx(l,{data:x,columns:b,defaultSort:{key:"restarts",dir:"asc"},externalFilters:v,columnResizeStorageKey:"clicky-ui-story-data-table-filter-descriptions"})}const ae=["Ada","Grace","Alan","Linus","Katherine","Edsger","Barbara","Dennis","Margaret","Ken","Radia","Donald"],oe=["Lovelace","Hopper","Turing","Torvalds","Johnson","Dijkstra","Liskov","Ritchie","Hamilton","Thompson","Perlman","Knuth"],ne=["Platform","Finance","Data","Growth","Identity","Support"],se=["Admin","Editor","Viewer"],re=["active","invited","disabled"],J=Array.from({length:120},(e,a)=>{const o=ae[a%ae.length],r=oe[a*7%oe.length];return{id:`person-${a+1}`,name:`${o} ${r}`,email:`${o}.${r}${a+1}`.toLowerCase()+"@example.com",team:ne[a%ne.length],role:se[a%se.length],status:re[a%re.length]}}),te=[{key:"name",label:"Name",grow:!0},{key:"email",label:"Email",grow:!0},{key:"team",label:"Team",shrink:!0},{key:"role",label:"Role",shrink:!0},{key:"status",label:"Status",kind:"status",shrink:!0,status:{showLabel:!0}}];function Zt(e,a){if(!a)return e;const o=a.dir==="asc"?1:-1,r=a.key;return[...e].sort((n,s)=>o*String(n[r]).localeCompare(String(s[r])))}function Qt(){const[e,a]=c.useState(!0),[o,r]=c.useState(0),[n,s]=c.useState(10),[u,g]=c.useState({key:"name",dir:"asc"}),[v,f]=c.useState({}),w=Zt(J,u).slice(o*n,o*n+n),h=Object.keys(v).length;return t.jsxs(t.Fragment,{children:[t.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1.5 text-primary-foreground",onClick:()=>a(!0),children:"Add people"}),t.jsx(Rt,{open:e,onClose:()=>a(!1),title:"Add people",size:"xl",expandable:!0,scrollBody:!1,footer:t.jsxs("div",{className:"flex items-center justify-between gap-3",children:[t.jsx("span",{className:"text-xs text-muted-foreground",children:h===0?"Select one or more people from the table.":`${h} selected`}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50",onClick:()=>f({}),disabled:h===0,children:"Clear"}),t.jsx("button",{type:"button",className:"rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50",onClick:()=>a(!1),disabled:h===0,children:h>0?`Add ${h}`:"Add"})]})]}),children:t.jsx(l,{className:"min-h-0 flex-1",data:w,columns:te,getRowId:x=>x.id,sort:u,onSortChange:g,manualSort:!0,columnResizeStorageKey:"clicky-ui-story-data-table-dialog",rowSelection:{selectedRowIds:Object.keys(v),toggleOnRowClick:!0,onSelectionChange:(x,d)=>{const St=new Map(d.map(S=>[S.id,S]));f(Object.fromEntries(x.map(S=>[S,St.get(S)??v[S]])))}},pagination:{page:o,pageSize:n,total:J.length,pageSizeOptions:[10,25,50],onPageChange:r,onPageSizeChange:x=>{r(0),s(x)}}})})]})}function Xt(){const e={getGroupKey:a=>a.owner,getGroupLabel:a=>`Owned by ${a}`,getGroupMeta:(a,o)=>`${o.reduce((r,n)=>r+n.restarts,0)} restarts`};return t.jsxs("div",{className:"space-y-6",children:[t.jsxs("section",{className:"space-y-2",children:[t.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "end" (default)'}),t.jsx(l,{data:y,columns:b,getRowId:a=>a.service,grouping:e})]}),t.jsxs("section",{className:"space-y-2",children:[t.jsx("h3",{className:"text-sm font-medium",children:'metaAlign: "start"'}),t.jsx(l,{data:y,columns:b,getRowId:a=>a.service,grouping:{...e,metaAlign:"start"}})]})]})}const ea=[{type:"column",value:"owner",label:"Owner",columnKey:"owner"},{type:"custom",value:"status",label:"Status",getGroupKey:e=>e.status,getGroupLabel:e=>`Status: ${e}`},{type:"none",value:"none",label:"No grouping"}];function ta(){return t.jsx(l,{data:y,columns:b,getRowId:e=>e.service,groupingModes:ea,defaultGroupingMode:"owner"})}const Y=3706;function aa(){const[e,a]=c.useState([]),[o,r]=c.useState(!1),n=()=>{r(!0),window.setTimeout(()=>{a(Array.from({length:Y},(s,u)=>`service-${u}`)),r(!1)},300)};return t.jsx(l,{data:y,columns:b,getRowId:s=>s.service,rowSelection:{selectedRowIds:e,onSelectionChange:s=>a(s),selectAllPages:{noun:"services",loading:o,scopes:[{total:Y,onSelectAll:n}]}},pagination:{page:0,pageSize:3,total:Y,onPageChange:()=>{},onPageSizeChange:()=>{}},selectionActions:({selectedRowIds:s,clearSelection:u})=>t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"text-xs",children:t.jsxs("b",{children:[s.length.toLocaleString()," selected"]})}),t.jsxs("span",{className:"flex gap-2",children:[t.jsx(C,{size:"sm",variant:"ghost",onClick:u,children:"Clear"}),t.jsxs(C,{size:"sm",children:["Restart ",s.length.toLocaleString()]})]})]})})}function oa(){const[e,a]=c.useState([]);return t.jsx(l,{data:y,columns:b,getRowId:o=>o.service,rowSelection:{selectedRowIds:e,onSelectionChange:o=>a(o)},getRowClassName:o=>o.restarts>=3?"bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10":void 0,footer:({visibleRowCount:o,totalRowCount:r})=>`Showing ${o} of ${r} services · ${y.reduce((n,s)=>n+s.restarts,0)} restarts total`,selectionActions:({selectedRows:o,clearSelection:r})=>t.jsxs(t.Fragment,{children:[t.jsxs("span",{className:"text-xs",children:[t.jsxs("b",{children:[o.length," selected"]}),t.jsxs("span",{className:"opacity-70",children:[" · ",o.reduce((n,s)=>n+s.restarts,0)," ","restarts"]})]}),t.jsxs("span",{className:"flex gap-2",children:[t.jsx(C,{size:"sm",variant:"ghost",onClick:r,children:"Clear"}),t.jsxs(C,{size:"sm",children:["Restart ",o.length]})]})]})})}function na(){const[e,a]=c.useState([]),[o,r]=c.useState([]),n=s=>r(u=>[...u,s]);return t.jsxs("div",{className:"flex flex-col gap-density-2",children:[t.jsx(l,{data:y,columns:b,getRowId:s=>s.service,rowSelection:{selectedRowIds:e,onSelectionChange:s=>a(s)},selectionActions:[{id:"restart",label:"Restart",primary:!0,variant:"default",icon:Tt,pendingLabel:"Restarting…",onSelect:async s=>{await new Promise(u=>setTimeout(u,600)),n(`restarted ${s.selectedRowIds.join(", ")}`)}},{id:"drain",label:"Drain",primary:!0,onSelect:()=>n("drained")},{id:"delete",label:"Delete",primary:!0,variant:"destructive",confirm:{message:s=>`Delete ${s.selectedRows.length} services? This cannot be undone.`},onSelect:s=>n(`deleted ${s.selectedRowIds.length}`)},{id:"export",label:"Export",section:"Download",onSelect:()=>{},children:[{id:"export-csv",label:"CSV",onSelect:()=>n("exported csv")},{id:"export-json",label:"JSON",onSelect:()=>n("exported json")}]},{id:"tag",label:"Add tag",onSelect:()=>n("tagged")}]}),t.jsx("p",{className:"px-1 text-xs text-muted-foreground",children:o.length?o.join(" · "):"No actions run yet."})]})}const sa=[{service:"api",status:"healthy",region:"us-east",updated:"2026-04-15T12:04:33Z",notes:"Primary public API serving customer traffic."},{service:"worker",status:"degraded",region:"us-west",updated:"2026-04-15T11:58:10Z",notes:"Queue processor draining a delayed retry batch."},{service:"billing",status:"healthy",region:"eu-west",updated:"2026-04-15T11:40:02Z",notes:"Ledger sync and invoice reconciliation."}],ra=[{key:"service",label:"Service",grow:!0},{key:"status",label:"Status",shrink:!0},{key:"region",label:"Region",shrink:!0},{key:"updated",label:"Updated",kind:"timestamp",shrink:!0},{key:"notes",label:"Notes",grow:!0}];function ia(){return t.jsx(l,{data:sa,columns:ra,autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:"Search services…",hideableColumns:!0,menuActions:ee,getRowHref:e=>`/services/${e.service}`,pagination:{page:0,pageSize:50,total:5324,onPageChange:()=>{},onPageSizeChange:()=>{}},columnResizeStorageKey:"clicky-ui-story-data-table-mobile-phone"})}const Ja={title:"Data/DataTable",component:l,render:e=>t.jsx(Ft,{...e}),args:{data:y,columns:b,loading:!1,loadingMessage:"Loading services…",loadingRowCount:8,emptyMessage:"No services",autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:"Search all columns…",defaultSort:{key:"restarts",dir:"asc"},resizableColumns:!0,hideableColumns:!0,persistColumnWidths:!0,persistColumnVisibility:!0,persistDensity:!0,showDensityControl:!0,showThemeControl:!1,showHeaderFilters:!0,showFullscreenControl:!1,fullscreenTitle:"Services",fullscreenButtonLabel:"Open table full screen"},argTypes:{data:{control:!1,table:{category:"Data"}},columns:{control:!1,table:{category:"Data"}},loading:{control:"boolean",table:{category:"State"}},loadingMessage:{control:"text",table:{category:"State"}},loadingRowCount:{control:{type:"range",min:1,max:20,step:1},table:{category:"State"}},emptyMessage:{control:"text",table:{category:"State"}},autoFilter:{control:"boolean",table:{category:"Filtering"}},showGlobalFilter:{control:"boolean",table:{category:"Filtering"}},globalFilterPlaceholder:{control:"text",table:{category:"Filtering"}},showHeaderFilters:{control:"boolean",table:{category:"Filtering"}},resizableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnWidths:{control:"boolean",table:{category:"Columns"}},hideableColumns:{control:"boolean",table:{category:"Columns"}},persistColumnVisibility:{control:"boolean",table:{category:"Columns"}},persistDensity:{control:"boolean",table:{category:"Preferences"}},showDensityControl:{control:"boolean",table:{category:"Preferences"}},showThemeControl:{control:"boolean",table:{category:"Preferences"}},showFullscreenControl:{control:"boolean",table:{category:"Fullscreen"}},fullscreenTitle:{control:"text",table:{category:"Fullscreen"}},fullscreenButtonLabel:{control:"text",table:{category:"Fullscreen"}}},parameters:{docs:{description:{component:"Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns."}}}},T={},R={args:{showFullscreenControl:!0,fullscreenButtonLabel:"Open controlled table"},play:async({canvasElement:e})=>{const a=p(e);await i(a.getByRole("button",{name:"Open controlled table"})).toBeVisible()}},j={render:()=>t.jsx(Mt,{})},A={render:()=>t.jsx(Pt,{})},D={render:()=>t.jsx(Et,{})},N={render:()=>t.jsx(Vt,{})},F={render:()=>t.jsx(It,{})},M={render:()=>t.jsx(zt,{}),parameters:{docs:{description:{story:"Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."}}}},E={render:()=>t.jsx($t,{})},V={render:()=>t.jsx(Ht,{})},P={render:()=>t.jsx(Jt,{})},I={render:()=>t.jsx(Wt,{})},O={render:()=>t.jsx(Qt,{}),parameters:{docs:{description:{story:['A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.',"","- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.","- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.",'- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for "Page X of Y".'].join(`
`)}}}},z={render:()=>t.jsx(oa,{}),parameters:{docs:{description:{story:["`selectionActions` renders bulk actions in the toolbar beside the table menu whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.","",'`footer` replaces the default "N of M rows" strip, and `getRowClassName` tints the degraded row.'].join(`
`)}}},play:async({canvasElement:e})=>{const a=p(e);await i(a.getByText(/Showing 3 of 3 services/)).toBeInTheDocument(),await i(a.queryByText("3 of 3 rows")).toBeNull(),await m.click(a.getByRole("checkbox",{name:"Select row worker"}));const o=p(a.getByTestId("data-table-selection-actions"));await i(o.getByText("1 selected")).toBeVisible(),await i(o.getByText(/3 restarts/)).toBeVisible(),await m.click(o.getByRole("button",{name:"Clear"})),await i(a.queryByTestId("data-table-selection-actions")).toBeNull()}},L={render:()=>t.jsx(na,{}),parameters:{docs:{description:{story:["`selectionActions` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.","","`primary` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same `section`/`children` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."].join(`
`)}}},play:async({canvasElement:e})=>{const a=p(e);await m.click(a.getByRole("checkbox",{name:"Select row worker"})),await m.click(a.getByRole("checkbox",{name:"Select row cron"}));const o=p(a.getByTestId("data-table-selection-actions"));await i(o.getByText("2 selected")).toBeVisible(),await i(o.getByRole("button",{name:"Restart"})).toBeVisible(),await i(o.getByRole("button",{name:"Delete"})).toBeVisible(),await m.click(o.getByRole("button",{name:"Delete"})),await i(await p(document.body).findByText("Delete 2 services? This cannot be undone.")).toBeVisible(),await m.click(p(document.body).getByRole("button",{name:"Cancel"})),await i(a.getByText("No actions run yet.")).toBeVisible(),await m.click(o.getByRole("button",{name:/More/}));const r=p(await p(document.body).findByRole("menu"));await i(r.getByRole("menuitem",{name:"Add tag"})).toBeVisible()}},G={render:()=>t.jsx(aa,{}),parameters:{docs:{description:{story:["The header checkbox reaches only the rows the table is holding. `rowSelection.selectAllPages` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling `onSelectAll` so the caller can fetch the pages it has not loaded.","","`scopes` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so `select all` means the rows in front of the reader before it means every row the filters allow. A scope's `total` defaults to `pagination.total`."].join(`
`)}}},play:async({canvasElement:e})=>{const a=p(e);await i(a.queryByTestId("data-table-selection-scope")).toBeNull(),await m.click(a.getByRole("checkbox",{name:"Select all visible rows"}));const o=p(a.getByTestId("data-table-selection-scope"));await i(o.getByText("3 of 3,706 services selected.")).toBeVisible(),await m.click(o.getByRole("button",{name:"Select all 3,706 services"})),await i(await a.findByText("All 3,706 services selected.")).toBeVisible();const r=p(a.getByTestId("data-table-selection-actions"));await i(r.getByText("3,706 selected")).toBeVisible(),await m.click(a.getByRole("button",{name:"Clear selection"})),await i(a.queryByTestId("data-table-selection-scope")).toBeNull()}},$={render:()=>t.jsx(Yt,{}),parameters:{docs:{description:{story:"Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."}}}},q={render:()=>t.jsx(Xt,{}),parameters:{docs:{description:{story:["`grouping` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.","",'`getGroupMeta` is a per-group summary rendered inside the header row. `metaAlign` places it: `"end"` (the default) pins it to the trailing edge, while `"start"` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'].join(`
`)}}},play:async({canvasElement:e})=>{const o=p(e).getAllByRole("button").filter(s=>s.hasAttribute("aria-expanded")),[r]=o,n=o[o.length/2];await i(r).toHaveClass("flex-1"),await i(n).not.toHaveClass("flex-1"),await i(n==null?void 0:n.nextElementSibling).toHaveTextContent("restarts"),await m.click(n),await i(n).toHaveAttribute("aria-expanded","false")}},K={render:()=>t.jsx(ta,{}),parameters:{docs:{description:{story:"`groupingModes` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."}}},play:async({canvasElement:e})=>{const a=p(e),o=a.getByRole("combobox",{name:"Group rows by"});await i(o).toHaveValue("owner"),await m.click(a.getByRole("button",{name:"Collapse all groups"})),await i(a.queryByText("api")).toBeNull(),await m.selectOptions(o,"status"),await i(a.getByRole("button",{name:/^Status: healthy/})).toBeVisible()}},vt=Array.from({length:5e3},(e,a)=>{const o=J[a%J.length];return{...o,id:`person-${a+1}`,name:`${o.name} #${a+1}`}});function Z(e){return e.querySelectorAll("tbody tr:not([data-virtual-spacer])").length}function xt(e){const a=e.querySelector(".overflow-auto");if(!a)throw new Error("no scroll container");return a}const H={render:()=>t.jsx(l,{data:vt,columns:te,virtualize:!0,scrollContainerClassName:"max-h-[26rem]"}),parameters:{docs:{description:{story:"`virtualize` keeps only the rows near the viewport in the DOM — 5,000 rows here cost a few dozen `<tr>`s plus two spacers. The data is not windowed: counts, grouping and select-all still see all 5,000."}}},play:async({canvasElement:e})=>{const a=p(e);await i(await a.findByText(/#1$/)).toBeVisible(),await B(()=>i(Z(e)).toBeLessThan(120)),await i(Z(e)).toBeGreaterThan(0);const o=e.querySelector("thead th"),r=o.getBoundingClientRect().width,n=xt(e);n.scrollTop=n.scrollHeight,await B(()=>{var s;return i((s=e.querySelector("tbody"))==null?void 0:s.textContent).toContain("#5000")}),await i(Z(e)).toBeLessThan(120),await i(o.getBoundingClientRect().width).toBeCloseTo(r,0),n.scrollTop=0,await B(()=>{var s;return i((s=e.querySelector("tbody"))==null?void 0:s.textContent).toContain("#1")})}},_={render:function(){const[,a]=c.useState(0);return t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx(C,{size:"sm",onClick:()=>a(o=>o+1),children:"Rebuild rows array"}),t.jsx(l,{data:[...vt],columns:te,virtualize:!0,scrollContainerClassName:"max-h-[26rem]"})]})},play:async({canvasElement:e})=>{const a=p(e),o=xt(e),r=4e3;o.scrollTop=r,await B(()=>i(e.querySelector("tbody").textContent).toContain("#100"));const n=o.scrollTop,s=e.querySelector("tbody").textContent;await m.click(a.getByRole("button",{name:"Rebuild rows array"})),await i(o.scrollTop).toBe(n),await B(()=>i(e.querySelector("tbody").textContent).toBe(s))}},U={render:()=>t.jsx(ia,{}),parameters:{viewport:{defaultViewport:"mobile1"},docs:{description:{story:"Below the `sm` breakpoint the ⋯ menu opens as a full-height sheet, the pagination footer stays on one line with a compact page indicator, and the stretched row link no longer starts a native drag."}}}};var ie,le,ce;T.parameters={...T.parameters,docs:{...(ie=T.parameters)==null?void 0:ie.docs,source:{originalSource:"{}",...(ce=(le=T.parameters)==null?void 0:le.docs)==null?void 0:ce.source}}};var de,ue,pe;R.parameters={...R.parameters,docs:{...(de=R.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
}`,...(pe=(ue=R.parameters)==null?void 0:ue.docs)==null?void 0:pe.source}}};var me,he,ge;j.parameters={...j.parameters,docs:{...(me=j.parameters)==null?void 0:me.docs,source:{originalSource:`{
  render: () => <FewColumnsShowcase />
}`,...(ge=(he=j.parameters)==null?void 0:he.docs)==null?void 0:ge.source}}};var we,ye,be;A.parameters={...A.parameters,docs:{...(we=A.parameters)==null?void 0:we.docs,source:{originalSource:`{
  render: () => <LoadingShowcase />
}`,...(be=(ye=A.parameters)==null?void 0:ye.docs)==null?void 0:be.source}}};var fe,ve,xe;D.parameters={...D.parameters,docs:{...(fe=D.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  render: () => <EverythingFitsShowcase />
}`,...(xe=(ve=D.parameters)==null?void 0:ve.docs)==null?void 0:xe.source}}};var Se,ke,Be;N.parameters={...N.parameters,docs:{...(Se=N.parameters)==null?void 0:Se.docs,source:{originalSource:`{
  render: () => <LotsOfColumnsShowcase />
}`,...(Be=(ke=N.parameters)==null?void 0:ke.docs)==null?void 0:Be.source}}};var Ce,Te,Re;F.parameters={...F.parameters,docs:{...(Ce=F.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
  render: () => <MenuActionsShowcase />
}`,...(Re=(Te=F.parameters)==null?void 0:Te.docs)==null?void 0:Re.source}}};var je,Ae,De;M.parameters={...M.parameters,docs:{...(je=M.parameters)==null?void 0:je.docs,source:{originalSource:`{
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Menu actions with a \`section\` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."
      }
    }
  }
}`,...(De=(Ae=M.parameters)==null?void 0:Ae.docs)==null?void 0:De.source}}};var Ne,Fe,Me;E.parameters={...E.parameters,docs:{...(Ne=E.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
  render: () => <TimestampsShowcase />
}`,...(Me=(Fe=E.parameters)==null?void 0:Fe.docs)==null?void 0:Me.source}}};var Ee,Ve,Pe;V.parameters={...V.parameters,docs:{...(Ee=V.parameters)==null?void 0:Ee.docs,source:{originalSource:`{
  render: () => <TagsShowcase />
}`,...(Pe=(Ve=V.parameters)==null?void 0:Ve.docs)==null?void 0:Pe.source}}};var Ie,Oe,ze;P.parameters={...P.parameters,docs:{...(Ie=P.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
  render: () => <StatusDotShowcase />
}`,...(ze=(Oe=P.parameters)==null?void 0:Oe.docs)==null?void 0:ze.source}}};var Le,Ge,$e;I.parameters={...I.parameters,docs:{...(Le=I.parameters)==null?void 0:Le.docs,source:{originalSource:`{
  render: () => <RowDetailDialogShowcase />
}`,...($e=(Ge=I.parameters)==null?void 0:Ge.docs)==null?void 0:$e.source}}};var qe,Ke,He;O.parameters={...O.parameters,docs:{...(qe=O.parameters)==null?void 0:qe.docs,source:{originalSource:`{
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: ['A DataTable hosted inside a \`Modal\` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.', "", "- **Only the rows scroll.** The dialog sets \`scrollBody={false}\`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.", "- **Selection persists across pages.** It is keyed by \`getRowId\`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.", '- **Pagination is server-shaped.** The DataTable never slices \`data\`, so the story sorts and slices the current page itself and reports the true \`total\` for "Page X of Y".'].join("\\n")
      }
    }
  }
}`,...(He=(Ke=O.parameters)==null?void 0:Ke.docs)==null?void 0:He.source}}};var _e,Ue,Je;z.parameters={...z.parameters,docs:{...(_e=z.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(Je=(Ue=z.parameters)==null?void 0:Ue.docs)==null?void 0:Je.source}}};var We,Ye,Ze;L.parameters={...L.parameters,docs:{...(We=L.parameters)==null?void 0:We.docs,source:{originalSource:`{
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
}`,...(Ze=(Ye=L.parameters)==null?void 0:Ye.docs)==null?void 0:Ze.source}}};var Qe,Xe,et;G.parameters={...G.parameters,docs:{...(Qe=G.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
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
}`,...(et=(Xe=G.parameters)==null?void 0:Xe.docs)==null?void 0:et.source}}};var tt,at,ot;$.parameters={...$.parameters,docs:{...(tt=$.parameters)==null?void 0:tt.docs,source:{originalSource:`{
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Caller-owned filters that each carry a \`description\`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."
      }
    }
  }
}`,...(ot=(at=$.parameters)==null?void 0:at.docs)==null?void 0:ot.source}}};var nt,st,rt;q.parameters={...q.parameters,docs:{...(nt=q.parameters)==null?void 0:nt.docs,source:{originalSource:`{
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
}`,...(rt=(st=q.parameters)==null?void 0:st.docs)==null?void 0:rt.source}}};var it,lt,ct;K.parameters={...K.parameters,docs:{...(it=K.parameters)==null?void 0:it.docs,source:{originalSource:`{
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
}`,...(ct=(lt=K.parameters)==null?void 0:lt.docs)==null?void 0:ct.source}}};var dt,ut,pt;H.parameters={...H.parameters,docs:{...(dt=H.parameters)==null?void 0:dt.docs,source:{originalSource:`{
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
}`,...(pt=(ut=H.parameters)==null?void 0:ut.docs)==null?void 0:pt.source}}};var mt,ht,gt;_.parameters={..._.parameters,docs:{...(mt=_.parameters)==null?void 0:mt.docs,source:{originalSource:`{
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
}`,...(gt=(ht=_.parameters)==null?void 0:ht.docs)==null?void 0:gt.source}}};var wt,yt,bt;U.parameters={...U.parameters,docs:{...(wt=U.parameters)==null?void 0:wt.docs,source:{originalSource:`{
  render: () => <MobilePhoneShowcase />,
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    docs: {
      description: {
        story: "Below the \`sm\` breakpoint the ⋯ menu opens as a full-height sheet, the pagination footer stays on one line with a compact page indicator, and the stretched row link no longer starts a native drag."
      }
    }
  }
}`,...(bt=(yt=U.parameters)==null?void 0:yt.docs)==null?void 0:bt.source}}};const Wa=["Default","Playground","FewColumns","InitialLoading","EverythingFits","LotsOfColumns","MenuActions","GroupedMenuActions","Timestamps","Tags","StatusDots","RowDetailDialog","InDialogWithPagingAndSelection","SelectionActionsAndFooter","SelectionActionDescriptors","SelectAllPages","FilterDescriptions","GroupedRows","NativeGrouping","Virtualized","VirtualizedKeepsRowsWhenDataIsRebuilt","MobilePhone"];export{T as Default,D as EverythingFits,j as FewColumns,$ as FilterDescriptions,M as GroupedMenuActions,q as GroupedRows,O as InDialogWithPagingAndSelection,A as InitialLoading,N as LotsOfColumns,F as MenuActions,U as MobilePhone,K as NativeGrouping,R as Playground,I as RowDetailDialog,G as SelectAllPages,L as SelectionActionDescriptors,z as SelectionActionsAndFooter,P as StatusDots,V as Tags,E as Timestamps,H as Virtualized,_ as VirtualizedKeepsRowsWhenDataIsRebuilt,Wa as __namedExportsOrder,Ja as default};

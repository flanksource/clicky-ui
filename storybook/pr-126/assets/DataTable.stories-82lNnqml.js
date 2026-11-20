import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Ca as r,_a as i,aa as a,ll as o,n as s,sa as c,ya as l}from"./icons-ClABX2sF.js";import{n as ee,t as u}from"./button-CLtlb14M.js";import{n as te,t as ne}from"./Modal-DKSo89cp.js";import{n as re,t as d}from"./DataTable-CTJCJKlJ.js";function ie(e){let[t,n]=(0,f.useState)(`now-24h`),[r,i]=(0,f.useState)(`now`),[a,o]=(0,f.useState)(``),[s,c]=(0,f.useState)(``);return(0,p.jsx)(d,{...e,filterBarProps:{timeRange:{from:t,to:r,onApply:(e,t)=>{n(e),i(t)}},dateRange:{from:a,to:s,onApply:(e,t)=>{o(e),c(t)}}},renderExpandedRow:e=>(0,p.jsxs)(`div`,{className:`text-sm text-muted-foreground`,children:[e.service,` is owned by `,(0,p.jsx)(`strong`,{children:e.owner}),`.`]})},[e.theme??`system`,e.defaultSort?.key??``,e.defaultSort?.dir??``].join(`:`))}function ae(){return(0,p.jsx)(d,{data:Oe,columns:ke,defaultSort:{key:`name`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-few-columns`})}function oe(){return(0,p.jsx)(d,{data:Ae,columns:je,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-everything-fits`})}function se(){return(0,p.jsx)(d,{data:b,columns:x,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-lots-of-columns`})}function ce(){return(0,p.jsx)(d,{data:[],columns:x,loading:!0,loadingMessage:`Loading execution results…`,loadingRowCount:8,showGlobalFilter:!1,columnResizeStorageKey:`clicky-ui-story-data-table-loading`})}function le(){return(0,p.jsx)(d,{data:b,columns:x,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},menuActions:S,columnResizeStorageKey:`clicky-ui-story-data-table-menu-actions`})}function ue(){return(0,p.jsx)(d,{data:b,columns:x,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},menuActions:Me,columnResizeStorageKey:`clicky-ui-story-data-table-grouped-menu-actions`})}function de(e){let t=new Date(`2026-04-15T12:04:33Z`).getTime(),n=[`api`,`worker`,`billing`,`auth`],r=[`INFO`,`WARN`,`error`,`ERR`,`failed`,`ok`],i=[[`region:us-east`,`tier:edge`,`v=2026.04.1`],[`region:eu-west`,`tier:core`],[`region:us-west`,`tier:edge`,`v=2026.04.0`,`owner=platform`],[`region:eu-west`,`tier:core`,`owner=finance`],[`region:us-east`],[`region:ap-south`,`tier:edge`,`v=2026.03.9`]],a=e===`subMinute`?8e3:e===`sameDay`?18e5:7776e6;return Array.from({length:6},(e,o)=>({ts:new Date(t+a*o).toISOString(),level:r[o%r.length],service:n[o%n.length],message:`event #${o} from ${n[o%n.length]}`,tags:i[o%i.length]}))}function fe(){let[e,t]=(0,f.useState)(`sameDay`),n=de(e);return(0,p.jsxs)(`div`,{className:`space-y-3`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-2 text-sm`,children:[(0,p.jsx)(`span`,{className:`text-muted-foreground`,children:`Data spread:`}),[`subMinute`,`sameDay`,`multiYear`].map(n=>(0,p.jsx)(`button`,{type:`button`,onClick:()=>t(n),className:`rounded-md border px-2 py-1 text-xs ${e===n?`bg-accent text-accent-foreground`:`text-muted-foreground`}`,children:n},n))]}),(0,p.jsx)(d,{data:n,columns:Ne,autoFilter:!0,defaultSort:{key:`ts`,dir:`desc`},columnResizeStorageKey:`clicky-ui-story-data-table-timestamps-${e}`})]})}function pe(){return(0,p.jsx)(d,{data:Pe,columns:Fe,autoFilter:!0,columnResizeStorageKey:`clicky-ui-story-data-table-tags`})}function me(){return(0,p.jsx)(d,{data:Ie,columns:Le,autoFilter:!0,columnResizeStorageKey:`clicky-ui-story-data-table-status-dot`})}function he(){return(0,p.jsx)(d,{data:v,columns:y,defaultSort:{key:`restarts`,dir:`asc`},detailStyle:`dialog`,detailDialogTitle:e=>`${e.service} details`,columnResizeStorageKey:`clicky-ui-story-data-table-detail-dialog`,renderExpandedRow:e=>(0,p.jsxs)(`div`,{className:`space-y-2 text-sm`,children:[(0,p.jsxs)(`p`,{className:`text-muted-foreground`,children:[e.service,` is owned by `,(0,p.jsx)(`strong`,{children:e.owner}),`.`]}),(0,p.jsx)(`pre`,{className:`overflow-auto rounded border border-border bg-muted p-2 text-xs`,children:JSON.stringify(e,null,2)})]})})}function ge(){let[e,t]=(0,f.useState)({}),[n,r]=(0,f.useState)(``),[i,a]=(0,f.useState)(``),[o,s]=(0,f.useState)(``),c=[{key:`service`,kind:`enum`,label:`Service`,description:`Single-select: show only the chosen service, or leave empty for all.`,placeholder:`any service`,value:o,options:v.map(e=>({value:e.service})),onChange:s},{key:`status`,kind:`multi`,label:`Status`,description:`Include or exclude services by health. Click once to include, again to exclude.`,value:e,options:[{value:`healthy`,label:`healthy`},{value:`degraded`,label:`degraded`}],onChange:t},{key:`owner`,kind:`text`,label:`Owner`,description:"Match the owning team by substring, e.g. `plat` matches `platform`.",placeholder:`team name…`,value:n,onChange:r},{key:`restarts`,kind:`number`,label:`Min restarts`,description:`Only show services that have restarted at least this many times.`,value:{min:i},domainMin:0,domainMax:5,step:1,onChange:e=>a(e.min??``)}],l=Object.entries(e).filter(([,e])=>e===`include`).map(([e])=>e),ee=Object.entries(e).filter(([,e])=>e===`exclude`).map(([e])=>e),u=n.trim().toLowerCase(),te=i===``?null:Number(i),ne=v.filter(e=>!(o&&e.service!==o||l.length>0&&!l.includes(e.status)||ee.includes(e.status)||u&&!e.owner.toLowerCase().includes(u)||te!==null&&e.restarts<te));return(0,p.jsx)(d,{data:ne,columns:y,defaultSort:{key:`restarts`,dir:`asc`},externalFilters:c,columnResizeStorageKey:`clicky-ui-story-data-table-filter-descriptions`})}function _e(e,t){if(!t)return e;let n=t.dir===`asc`?1:-1,r=t.key;return[...e].sort((e,t)=>n*String(e[r]).localeCompare(String(t[r])))}function ve(){let[e,t]=(0,f.useState)(!0),[n,r]=(0,f.useState)(0),[i,a]=(0,f.useState)(10),[o,s]=(0,f.useState)({key:`name`,dir:`asc`}),[c,l]=(0,f.useState)({}),ee=_e(D,o).slice(n*i,n*i+i),u=Object.keys(c).length;return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`button`,{type:`button`,className:`rounded-md bg-primary px-3 py-1.5 text-primary-foreground`,onClick:()=>t(!0),children:`Add people`}),(0,p.jsx)(ne,{open:e,onClose:()=>t(!1),title:`Add people`,size:`xl`,expandable:!0,scrollBody:!1,footer:(0,p.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,p.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:u===0?`Select one or more people from the table.`:`${u} selected`}),(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(`button`,{type:`button`,className:`rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50`,onClick:()=>l({}),disabled:u===0,children:`Clear`}),(0,p.jsx)(`button`,{type:`button`,className:`rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50`,onClick:()=>t(!1),disabled:u===0,children:u>0?`Add ${u}`:`Add`})]})]}),children:(0,p.jsx)(d,{className:`min-h-0 flex-1`,data:ee,columns:O,getRowId:e=>e.id,sort:o,onSortChange:s,manualSort:!0,columnResizeStorageKey:`clicky-ui-story-data-table-dialog`,rowSelection:{selectedRowIds:Object.keys(c),toggleOnRowClick:!0,onSelectionChange:(e,t)=>{let n=new Map(t.map(e=>[e.id,e]));l(Object.fromEntries(e.map(e=>[e,n.get(e)??c[e]])))}},pagination:{page:n,pageSize:i,total:D.length,pageSizeOptions:[10,25,50],onPageChange:r,onPageSizeChange:e=>{r(0),a(e)}}})})]})}function ye(){let e={getGroupKey:e=>e.owner,getGroupLabel:e=>`Owned by ${e}`,getGroupMeta:(e,t)=>`${t.reduce((e,t)=>e+t.restarts,0)} restarts`};return(0,p.jsxs)(`div`,{className:`space-y-6`,children:[(0,p.jsxs)(`section`,{className:`space-y-2`,children:[(0,p.jsx)(`h3`,{className:`text-sm font-medium`,children:`metaAlign: "end" (default)`}),(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,grouping:e})]}),(0,p.jsxs)(`section`,{className:`space-y-2`,children:[(0,p.jsx)(`h3`,{className:`text-sm font-medium`,children:`metaAlign: "start"`}),(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,grouping:{...e,metaAlign:`start`}})]})]})}function be(){return(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,groupingModes:ze,defaultGroupingMode:`owner`})}function xe(){let[e,t]=(0,f.useState)([]),[n,r]=(0,f.useState)(!1);return(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e),selectAllPages:{noun:`services`,loading:n,scopes:[{total:k,onSelectAll:()=>{r(!0),window.setTimeout(()=>{t(Array.from({length:k},(e,t)=>`service-${t}`)),r(!1)},300)}}]}},pagination:{page:0,pageSize:3,total:k,onPageChange:()=>{},onPageSizeChange:()=>{}},selectionActions:({selectedRowIds:e,clearSelection:t})=>(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`span`,{className:`text-xs`,children:(0,p.jsxs)(`b`,{children:[e.length.toLocaleString(),` selected`]})}),(0,p.jsxs)(`span`,{className:`flex gap-2`,children:[(0,p.jsx)(u,{size:`sm`,variant:`ghost`,onClick:t,children:`Clear`}),(0,p.jsxs)(u,{size:`sm`,children:[`Restart `,e.length.toLocaleString()]})]})]})})}function Se(){let[e,t]=(0,f.useState)([]);return(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e)},getRowClassName:e=>e.restarts>=3?`bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10`:void 0,footer:({visibleRowCount:e,totalRowCount:t})=>`Showing ${e} of ${t} services · ${v.reduce((e,t)=>e+t.restarts,0)} restarts total`,selectionActions:({selectedRows:e,clearSelection:t})=>(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`span`,{className:`text-xs`,children:[(0,p.jsxs)(`b`,{children:[e.length,` selected`]}),(0,p.jsxs)(`span`,{className:`opacity-70`,children:[` · `,e.reduce((e,t)=>e+t.restarts,0),` `,`restarts`]})]}),(0,p.jsxs)(`span`,{className:`flex gap-2`,children:[(0,p.jsx)(u,{size:`sm`,variant:`ghost`,onClick:t,children:`Clear`}),(0,p.jsxs)(u,{size:`sm`,children:[`Restart `,e.length]})]})]})})}function Ce(){let[e,t]=(0,f.useState)([]),[n,r]=(0,f.useState)([]),i=e=>r(t=>[...t,e]);return(0,p.jsxs)(`div`,{className:`flex flex-col gap-density-2`,children:[(0,p.jsx)(d,{data:v,columns:y,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e)},selectionActions:[{id:`restart`,label:`Restart`,primary:!0,variant:`default`,icon:o,pendingLabel:`Restarting…`,onSelect:async e=>{await new Promise(e=>setTimeout(e,600)),i(`restarted ${e.selectedRowIds.join(`, `)}`)}},{id:`drain`,label:`Drain`,primary:!0,onSelect:()=>i(`drained`)},{id:`delete`,label:`Delete`,primary:!0,variant:`destructive`,confirm:{message:e=>`Delete ${e.selectedRows.length} services? This cannot be undone.`},onSelect:e=>i(`deleted ${e.selectedRowIds.length}`)},{id:`export`,label:`Export`,section:`Download`,onSelect:()=>void 0,children:[{id:`export-csv`,label:`CSV`,onSelect:()=>i(`exported csv`)},{id:`export-json`,label:`JSON`,onSelect:()=>i(`exported json`)}]},{id:`tag`,label:`Add tag`,onSelect:()=>i(`tagged`)}]}),(0,p.jsx)(`p`,{className:`px-1 text-xs text-muted-foreground`,children:n.length?n.join(` · `):`No actions run yet.`})]})}function we(){return(0,p.jsx)(d,{data:Be,columns:Ve,autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:`Search services…`,hideableColumns:!0,menuActions:S,getRowHref:e=>`/services/${e.service}`,pagination:{page:0,pageSize:50,total:5324,onPageChange:()=>{},onPageSizeChange:()=>{}},columnResizeStorageKey:`clicky-ui-story-data-table-mobile-phone`})}function Te(e){return e.querySelectorAll(`tbody tr:not([data-virtual-spacer])`).length}function Ee(e){let t=e.querySelector(`.overflow-auto`);if(!t)throw Error(`no scroll container`);return t}function De({width:e}){let[t,n]=(0,f.useState)([]);return(0,p.jsx)(`div`,{style:{width:e},className:`rounded-md border border-dashed border-border p-2`,children:(0,p.jsx)(d,{data:v,columns:Ge,getRowId:e=>e.service,layout:`auto`,showGlobalFilter:!0,expandedRowIds:t,onExpandedRowIdsChange:n,renderExpandedRow:e=>(0,p.jsx)(`p`,{className:`text-sm`,children:e.notes})})})}var f,p,m,h,g,_,v,y,Oe,ke,Ae,je,b,x,S,Me,Ne,Pe,Fe,Ie,Le,C,w,T,E,Re,D,O,ze,k,Be,Ve,He,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Ue,Y,X,Z,We,Ge,Q,$,Ke;function qe(){return(qe=e((()=>{f=t(),ee(),s(),te(),re(),p=n(),{expect:m,userEvent:h,waitFor:g,within:_}=__STORYBOOK_MODULE_TEST__,v=[{service:`api`,status:`healthy`,restarts:0,owner:`platform`,notes:`Primary public API with long-form notes that should keep its width.`},{service:`worker`,status:`degraded`,restarts:3,owner:`data`,notes:`Background job processor with retry queues.`},{service:`cron`,status:`healthy`,restarts:1,owner:`platform`,notes:`Nightly maintenance and reporting runner.`}],y=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`restarts`,label:`Restarts`,shrink:!0,align:`right`,sortValue:e=>Number(e??0)},{key:`owner`,label:`Owner`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],Oe=[{name:`api`,state:`healthy`,age:`12m`},{name:`worker`,state:`degraded`,age:`4m`},{name:`cron`,state:`healthy`,age:`2h`}],ke=[{key:`name`,label:`Name`,shrink:!0},{key:`state`,label:`State`,shrink:!0},{key:`age`,label:`Age`,shrink:!0,align:`right`}],Ae=[{service:`api`,status:`healthy`,region:`us-east`,version:`2026.04.1`,owner:`platform`,latency:42},{service:`billing`,status:`healthy`,region:`eu-west`,version:`2026.04.0`,owner:`finance`,latency:58},{service:`worker`,status:`degraded`,region:`us-west`,version:`2026.03.9`,owner:`data`,latency:131}],je=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`version`,label:`Version`,shrink:!0},{key:`owner`,label:`Owner`,shrink:!0},{key:`latency`,label:`Latency ms`,shrink:!0,align:`right`,sortValue:e=>Number(e??0)}],b=[{service:`api`,namespace:`frontend`,cluster:`prod-a`,region:`us-east`,zone:`use1-a`,status:`healthy`,owner:`platform`,version:`2026.04.1`,cpu:`62%`,memory:`5.1 GiB`,latency:42,restarts:0,updated:`4m ago`,notes:`Primary public API serving customer traffic.`},{service:`worker`,namespace:`jobs`,cluster:`prod-b`,region:`us-west`,zone:`usw2-c`,status:`degraded`,owner:`data`,version:`2026.03.9`,cpu:`78%`,memory:`7.8 GiB`,latency:131,restarts:3,updated:`9m ago`,notes:`Queue processor draining delayed retry batches.`},{service:`billing`,namespace:`finance`,cluster:`prod-eu`,region:`eu-west`,zone:`euw1-b`,status:`healthy`,owner:`finance`,version:`2026.04.0`,cpu:`41%`,memory:`3.4 GiB`,latency:58,restarts:1,updated:`18m ago`,notes:`Ledger sync and invoice reconciliation service.`}],x=[{key:`service`,label:`Service`,grow:!0},{key:`namespace`,label:`Namespace`,shrink:!0},{key:`cluster`,label:`Cluster`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`zone`,label:`Zone`,shrink:!0},{key:`status`,label:`Status`,shrink:!0},{key:`owner`,label:`Owner`,shrink:!0},{key:`version`,label:`Version`,shrink:!0},{key:`cpu`,label:`CPU`,align:`right`,shrink:!0},{key:`memory`,label:`Memory`,align:`right`,shrink:!0},{key:`latency`,label:`Latency ms`,align:`right`,shrink:!0,sortValue:e=>Number(e??0)},{key:`restarts`,label:`Restarts`,align:`right`,shrink:!0,sortValue:e=>Number(e??0)},{key:`updated`,label:`Updated`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],S=[{id:`download-yaml`,label:`YAML`,icon:r,iconClassName:`text-violet-600 dark:text-violet-400`,onSelect:()=>{console.info(`Download YAML`)}},{id:`download-json`,label:`JSON`,icon:l,onSelect:()=>{console.info(`Download JSON`)}},{id:`download-csv`,label:`CSV`,icon:a,iconClassName:`text-emerald-600 dark:text-emerald-400`,onSelect:()=>{console.info(`Download CSV`)}},{id:`download-pdf`,label:`PDF`,icon:c,iconClassName:`text-rose-600 dark:text-rose-400`,onSelect:()=>{console.info(`Download PDF`)}},{id:`download-markdown`,label:`Markdown`,icon:i,onSelect:()=>{console.info(`Download Markdown`)}}],Me=[{id:`view-clicky`,label:`Clicky`,icon:l,section:`View`,disabled:!0,onSelect:()=>{console.info(`View Clicky`)}},{id:`view-json`,label:`JSON`,icon:l,section:`View`,onSelect:()=>{console.info(`View JSON`)}},{id:`view-pdf`,label:`PDF`,icon:c,iconClassName:`text-rose-600 dark:text-rose-400`,section:`View`,onSelect:()=>{console.info(`View PDF`)}},...S],Ne=[{key:`ts`,label:`Timestamp`,kind:`timestamp`,shrink:!0},{key:`level`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}},{key:`service`,label:`Service`,shrink:!0},{key:`message`,label:`Message`,grow:!0},{key:`tags`,label:`Tags`,kind:`tags`,grow:!0,tags:{maxVisible:2}}],Pe=[{id:`1`,name:`auth-service`,tags:[`env=prod`,`team=identity`,`tier=edge`,`region=us-east`,`v=2026.04.1`]},{id:`2`,name:`billing-svc`,tags:[`env=prod`,`team=finance`,`tier=core`]},{id:`3`,name:`ingest-pipeline`,tags:[`env=staging`,`team=data`,`tier=core`]},{id:`4`,name:`marketing-site`,tags:[`env=prod`,`team=growth`]},{id:`5`,name:`many-tags`,tags:Array.from({length:30},(e,t)=>`label-${t}=value-${t}`)}],Fe=[{key:`id`,label:`ID`,shrink:!0},{key:`name`,label:`Name`,grow:!0},{key:`tags`,label:`Tags`,kind:`tags`,grow:!0,tags:{maxVisible:3}}],Ie=[{service:`api`,state:`ok`,notes:`running normally`},{service:`worker`,state:`ERROR`,notes:`stack overflow`},{service:`billing`,state:`warning`,notes:`latency p95 elevated`},{service:`auth`,state:`healthy`,notes:`all checks green`},{service:`search`,state:`failed`,notes:`circuit broken`},{service:`cron`,state:`degraded`,notes:`1/3 retries`},{service:`router`,state:`info`,notes:`info-only event`},{service:`unknown`,state:`mystery`,notes:`unmapped value falls through`}],Le=[{key:`state`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}},{key:`service`,label:`Service`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],C=[`Ada`,`Grace`,`Alan`,`Linus`,`Katherine`,`Edsger`,`Barbara`,`Dennis`,`Margaret`,`Ken`,`Radia`,`Donald`],w=[`Lovelace`,`Hopper`,`Turing`,`Torvalds`,`Johnson`,`Dijkstra`,`Liskov`,`Ritchie`,`Hamilton`,`Thompson`,`Perlman`,`Knuth`],T=[`Platform`,`Finance`,`Data`,`Growth`,`Identity`,`Support`],E=[`Admin`,`Editor`,`Viewer`],Re=[`active`,`invited`,`disabled`],D=Array.from({length:120},(e,t)=>{let n=C[t%C.length],r=w[t*7%w.length];return{id:`person-${t+1}`,name:`${n} ${r}`,email:`${n}.${r}${t+1}`.toLowerCase()+`@example.com`,team:T[t%T.length],role:E[t%E.length],status:Re[t%Re.length]}}),O=[{key:`name`,label:`Name`,grow:!0},{key:`email`,label:`Email`,grow:!0},{key:`team`,label:`Team`,shrink:!0},{key:`role`,label:`Role`,shrink:!0},{key:`status`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}}],ze=[{type:`column`,value:`owner`,label:`Owner`,columnKey:`owner`},{type:`custom`,value:`status`,label:`Status`,getGroupKey:e=>e.status,getGroupLabel:e=>`Status: ${e}`},{type:`none`,value:`none`,label:`No grouping`}],k=3706,Be=[{service:`api`,status:`healthy`,region:`us-east`,updated:`2026-04-15T12:04:33Z`,notes:`Primary public API serving customer traffic.`},{service:`worker`,status:`degraded`,region:`us-west`,updated:`2026-04-15T11:58:10Z`,notes:`Queue processor draining a delayed retry batch.`},{service:`billing`,status:`healthy`,region:`eu-west`,updated:`2026-04-15T11:40:02Z`,notes:`Ledger sync and invoice reconciliation.`}],Ve=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`updated`,label:`Updated`,kind:`timestamp`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],He={title:`Data/DataTable`,component:d,render:e=>(0,p.jsx)(ie,{...e}),args:{data:v,columns:y,loading:!1,loadingMessage:`Loading services…`,loadingRowCount:8,emptyMessage:`No services`,autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:`Search all columns…`,defaultSort:{key:`restarts`,dir:`asc`},resizableColumns:!0,hideableColumns:!0,persistColumnWidths:!0,persistColumnVisibility:!0,persistDensity:!0,showDensityControl:!0,showThemeControl:!1,showHeaderFilters:!0,showFullscreenControl:!1,fullscreenTitle:`Services`,fullscreenButtonLabel:`Open table full screen`},argTypes:{data:{control:!1,table:{category:`Data`}},columns:{control:!1,table:{category:`Data`}},loading:{control:`boolean`,table:{category:`State`}},loadingMessage:{control:`text`,table:{category:`State`}},loadingRowCount:{control:{type:`range`,min:1,max:20,step:1},table:{category:`State`}},emptyMessage:{control:`text`,table:{category:`State`}},autoFilter:{control:`boolean`,table:{category:`Filtering`}},showGlobalFilter:{control:`boolean`,table:{category:`Filtering`}},globalFilterPlaceholder:{control:`text`,table:{category:`Filtering`}},showHeaderFilters:{control:`boolean`,table:{category:`Filtering`}},resizableColumns:{control:`boolean`,table:{category:`Columns`}},persistColumnWidths:{control:`boolean`,table:{category:`Columns`}},hideableColumns:{control:`boolean`,table:{category:`Columns`}},persistColumnVisibility:{control:`boolean`,table:{category:`Columns`}},persistDensity:{control:`boolean`,table:{category:`Preferences`}},showDensityControl:{control:`boolean`,table:{category:`Preferences`}},showThemeControl:{control:`boolean`,table:{category:`Preferences`}},showFullscreenControl:{control:`boolean`,table:{category:`Fullscreen`}},fullscreenTitle:{control:`text`,table:{category:`Fullscreen`}},fullscreenButtonLabel:{control:`text`,table:{category:`Fullscreen`}}},parameters:{docs:{description:{component:`Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns.`}}}},A={},j={args:{showFullscreenControl:!0,fullscreenButtonLabel:`Open controlled table`},play:async({canvasElement:e})=>{let t=_(e);await m(t.getByRole(`button`,{name:`Open controlled table`})).toBeVisible()}},M={render:()=>(0,p.jsx)(ae,{})},N={render:()=>(0,p.jsx)(ce,{})},P={render:()=>(0,p.jsx)(oe,{})},F={render:()=>(0,p.jsx)(se,{})},I={render:()=>(0,p.jsx)(le,{})},L={render:()=>(0,p.jsx)(ue,{}),parameters:{docs:{description:{story:"Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."}}}},R={render:()=>(0,p.jsx)(fe,{})},z={render:()=>(0,p.jsx)(pe,{})},B={render:()=>(0,p.jsx)(me,{})},V={render:()=>(0,p.jsx)(he,{})},H={render:()=>(0,p.jsx)(ve,{}),parameters:{docs:{description:{story:'A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.\n\n- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table\'s own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.\n- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.\n- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for "Page X of Y".'}}}},U={render:()=>(0,p.jsx)(Se,{}),parameters:{docs:{description:{story:'`selectionActions` renders bulk actions in the toolbar beside the table menu whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.\n\n`footer` replaces the default "N of M rows" strip, and `getRowClassName` tints the degraded row.'}}},play:async({canvasElement:e})=>{let t=_(e);await m(t.getByText(/Showing 3 of 3 services/)).toBeInTheDocument(),await m(t.queryByText(`3 of 3 rows`)).toBeNull(),await h.click(t.getByRole(`checkbox`,{name:`Select row worker`}));let n=_(t.getByTestId(`data-table-selection-actions`));await m(n.getByText(`1 selected`)).toBeVisible(),await m(n.getByText(/3 restarts/)).toBeVisible(),await h.click(n.getByRole(`button`,{name:`Clear`})),await m(t.queryByTestId(`data-table-selection-actions`)).toBeNull()}},W={render:()=>(0,p.jsx)(Ce,{}),parameters:{docs:{description:{story:"`selectionActions` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.\n\n`primary` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same `section`/`children` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."}}},play:async({canvasElement:e})=>{let t=_(e);await h.click(t.getByRole(`checkbox`,{name:`Select row worker`})),await h.click(t.getByRole(`checkbox`,{name:`Select row cron`}));let n=_(t.getByTestId(`data-table-selection-actions`));await m(n.getByText(`2 selected`)).toBeVisible(),await m(n.getByRole(`button`,{name:`Restart`})).toBeVisible(),await m(n.getByRole(`button`,{name:`Delete`})).toBeVisible(),await h.click(n.getByRole(`button`,{name:`Delete`})),await m(await _(document.body).findByText(`Delete 2 services? This cannot be undone.`)).toBeVisible(),await h.click(_(document.body).getByRole(`button`,{name:`Cancel`})),await m(t.getByText(`No actions run yet.`)).toBeVisible(),await h.click(n.getByRole(`button`,{name:/More/}));let r=_(await _(document.body).findByRole(`menu`));await m(r.getByRole(`menuitem`,{name:`Add tag`})).toBeVisible()}},G={render:()=>(0,p.jsx)(xe,{}),parameters:{docs:{description:{story:"The header checkbox reaches only the rows the table is holding. `rowSelection.selectAllPages` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling `onSelectAll` so the caller can fetch the pages it has not loaded.\n\n`scopes` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so `select all` means the rows in front of the reader before it means every row the filters allow. A scope's `total` defaults to `pagination.total`."}}},play:async({canvasElement:e})=>{let t=_(e);await m(t.queryByTestId(`data-table-selection-scope`)).toBeNull(),await h.click(t.getByRole(`checkbox`,{name:`Select all visible rows`}));let n=_(t.getByTestId(`data-table-selection-scope`));await m(n.getByText(`3 of 3,706 services selected.`)).toBeVisible(),await h.click(n.getByRole(`button`,{name:`Select all 3,706 services`})),await m(await t.findByText(`All 3,706 services selected.`)).toBeVisible();let r=_(t.getByTestId(`data-table-selection-actions`));await m(r.getByText(`3,706 selected`)).toBeVisible(),await h.click(t.getByRole(`button`,{name:`Clear selection`})),await m(t.queryByTestId(`data-table-selection-scope`)).toBeNull()}},K={render:()=>(0,p.jsx)(ge,{}),parameters:{docs:{description:{story:"Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."}}}},q={render:()=>(0,p.jsx)(ye,{}),parameters:{docs:{description:{story:'`grouping` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.\n\n`getGroupMeta` is a per-group summary rendered inside the header row. `metaAlign` places it: `"end"` (the default) pins it to the trailing edge, while `"start"` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'}}},play:async({canvasElement:e})=>{let t=_(e).getAllByRole(`button`).filter(e=>e.hasAttribute(`aria-expanded`)),[n]=t,r=t[t.length/2];await m(n).toHaveClass(`flex-1`),await m(r).not.toHaveClass(`flex-1`),await m(r?.nextElementSibling).toHaveTextContent(`restarts`),await h.click(r),await m(r).toHaveAttribute(`aria-expanded`,`false`)}},J={render:()=>(0,p.jsx)(be,{}),parameters:{docs:{description:{story:"`groupingModes` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."}}},play:async({canvasElement:e})=>{let t=_(e),n=t.getByRole(`combobox`,{name:`Group rows by`});await m(n).toHaveValue(`owner`),await h.click(t.getByRole(`button`,{name:`Collapse all groups`})),await m(t.queryByText(`api`)).toBeNull(),await h.selectOptions(n,`status`),await m(t.getByRole(`button`,{name:/^Status: healthy/})).toBeVisible()}},Ue=Array.from({length:5e3},(e,t)=>{let n=D[t%D.length];return{...n,id:`person-${t+1}`,name:`${n.name} #${t+1}`}}),Y={tags:[`browser`],render:()=>(0,p.jsx)(d,{data:Ue,columns:O,virtualize:!0,scrollContainerClassName:`max-h-[26rem]`}),parameters:{docs:{description:{story:"`virtualize` keeps only the rows near the viewport in the DOM — 5,000 rows here cost a few dozen `<tr>`s plus two spacers. The data is not windowed: counts, grouping and select-all still see all 5,000."}}},play:async({canvasElement:e})=>{let t=_(e);await m(await t.findByText(/#1$/)).toBeVisible(),await g(()=>m(Te(e)).toBeLessThan(120)),await m(Te(e)).toBeGreaterThan(0);let n=e.querySelector(`thead th`),r=n.getBoundingClientRect().width,i=Ee(e);i.scrollTop=i.scrollHeight,await g(()=>m(e.querySelector(`tbody`)?.textContent).toContain(`#5000`)),await m(Te(e)).toBeLessThan(120),await m(n.getBoundingClientRect().width).toBeCloseTo(r,0),i.scrollTop=0,await g(()=>m(e.querySelector(`tbody`)?.textContent).toContain(`#1`))}},X={tags:[`browser`],render:function(){let[,e]=(0,f.useState)(0);return(0,p.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,p.jsx)(u,{size:`sm`,onClick:()=>e(e=>e+1),children:`Rebuild rows array`}),(0,p.jsx)(d,{data:[...Ue],columns:O,virtualize:!0,scrollContainerClassName:`max-h-[26rem]`})]})},play:async({canvasElement:e})=>{let t=_(e),n=Ee(e);n.scrollTop=4e3,await g(()=>m(e.querySelector(`tbody`).textContent).toContain(`#100`));let r=n.scrollTop,i=e.querySelector(`tbody`).textContent;await h.click(t.getByRole(`button`,{name:`Rebuild rows array`})),await m(n.scrollTop).toBe(r),await g(()=>m(e.querySelector(`tbody`).textContent).toBe(i))}},Z={render:()=>(0,p.jsx)(we,{}),parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:"Below the `sm` breakpoint the ⋯ menu opens as a full-height sheet, the pagination footer stays on one line with a compact page indicator, and the stretched row link no longer starts a native drag."}}}},We={healthy:`bg-emerald-500`,degraded:`bg-amber-500`},Ge=[{key:`service`,label:`Service`,listRole:`title`},{key:`status`,label:`Status`,listRole:`status`,listRender:e=>(0,p.jsx)(`span`,{role:`img`,"aria-label":String(e),title:String(e),className:`inline-block size-2 rounded-full ${We[String(e)]??`bg-muted-foreground`}`})},{key:`restarts`,label:`Restarts`,listRole:`meta`,listRender:e=>`${String(e)} restarts`},{key:`owner`,label:`Owner`,listRole:`meta`},{key:`notes`,label:`Notes`,listRole:`hidden`}],Q={tags:[`browser`],render:()=>(0,p.jsx)(De,{width:360}),parameters:{docs:{description:{story:'`layout="auto"` in a 360px container: each row is its title and a status icon, then a meta line of the `meta` columns (Notes is `listRole: "hidden"`). Sort moves into the ⋯ menu; search and row detail work as in the grid.'}}},play:async({canvasElement:e})=>{let t=_(e);await g(()=>m(e.querySelectorAll(`[data-list-item]`)).toHaveLength(v.length)),await m(t.queryByRole(`columnheader`,{name:/Status/})).toBeNull(),await m(t.getByRole(`img`,{name:`degraded`})).toBeInTheDocument(),await h.click(t.getByText(`worker`)),await m(t.getByText(`Background job processor with retry queues.`)).toBeVisible()}},$={tags:[`browser`],render:()=>(0,p.jsx)(De,{width:900}),parameters:{docs:{description:{story:'The same `layout="auto"` table in a 900px container stays a grid.'}}},play:async({canvasElement:e})=>{let t=_(e);await m(t.getByRole(`columnheader`,{name:/Status/})).toBeVisible(),await m(e.querySelector(`[data-list-item]`)).toBeNull()}},Ke=[`Default`,`Playground`,`FewColumns`,`InitialLoading`,`EverythingFits`,`LotsOfColumns`,`MenuActions`,`GroupedMenuActions`,`Timestamps`,`Tags`,`StatusDots`,`RowDetailDialog`,`InDialogWithPagingAndSelection`,`SelectionActionsAndFooter`,`SelectionActionDescriptors`,`SelectAllPages`,`FilterDescriptions`,`GroupedRows`,`NativeGrouping`,`Virtualized`,`VirtualizedKeepsRowsWhenDataIsRebuilt`,`MobilePhone`,`ListLayout`,`ListLayoutAboveBreakpoint`],A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <FewColumnsShowcase />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <LoadingShowcase />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <EverythingFitsShowcase />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <LotsOfColumnsShowcase />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <MenuActionsShowcase />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Menu actions with a \`section\` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."
      }
    }
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <TimestampsShowcase />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <TagsShowcase />
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <StatusDotShowcase />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <RowDetailDialogShowcase />
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: ['A DataTable hosted inside a \`Modal\` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.', "", "- **Only the rows scroll.** The dialog sets \`scrollBody={false}\`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.", "- **Selection persists across pages.** It is keyed by \`getRowId\`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.", '- **Pagination is server-shaped.** The DataTable never slices \`data\`, so the story sorts and slices the current page itself and reports the true \`total\` for "Page X of Y".'].join("\\n")
      }
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Caller-owned filters that each carry a \`description\`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."
      }
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  render: () => <ListLayoutShowcase width={360} />,
  parameters: {
    docs: {
      description: {
        story: '\`layout="auto"\` in a 360px container: each row is its title and a status icon, then a meta line of the \`meta\` columns (Notes is \`listRole: "hidden"\`). Sort moves into the ⋯ menu; search and row detail work as in the grid.'
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll("[data-list-item]")).toHaveLength(rows.length));
    await expect(canvas.queryByRole("columnheader", {
      name: /Status/
    })).toBeNull();
    await expect(canvas.getByRole("img", {
      name: "degraded"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByText("worker"));
    await expect(canvas.getByText("Background job processor with retry queues.")).toBeVisible();
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  render: () => <ListLayoutShowcase width={900} />,
  parameters: {
    docs: {
      description: {
        story: 'The same \`layout="auto"\` table in a 900px container stays a grid.'
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("columnheader", {
      name: /Status/
    })).toBeVisible();
    await expect(canvasElement.querySelector("[data-list-item]")).toBeNull();
  }
}`,...$.parameters?.docs?.source}}}})))()}qe();export{A as Default,P as EverythingFits,M as FewColumns,K as FilterDescriptions,L as GroupedMenuActions,q as GroupedRows,H as InDialogWithPagingAndSelection,N as InitialLoading,Q as ListLayout,$ as ListLayoutAboveBreakpoint,F as LotsOfColumns,I as MenuActions,Z as MobilePhone,J as NativeGrouping,j as Playground,V as RowDetailDialog,G as SelectAllPages,W as SelectionActionDescriptors,U as SelectionActionsAndFooter,B as StatusDots,z as Tags,R as Timestamps,Y as Virtualized,X as VirtualizedKeepsRowsWhenDataIsRebuilt,Ke as __namedExportsOrder,He as default};
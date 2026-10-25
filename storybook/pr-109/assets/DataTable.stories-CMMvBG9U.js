import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ii as r,Ji as i,Ki as a,Pi as o,Qi as s,kc as c,n as l}from"./icons-N6BqLuiz.js";import{n as ee,t as u}from"./button-DWTXPYSk.js";import{n as te,t as ne}from"./Modal-D4pnBlUm.js";import{n as re,t as d}from"./DataTable-Bq9nvU6n.js";function ie(e){let[t,n]=(0,p.useState)(`now-24h`),[r,i]=(0,p.useState)(`now`),[a,o]=(0,p.useState)(``),[s,c]=(0,p.useState)(``);return(0,m.jsx)(d,{...e,filterBarProps:{timeRange:{from:t,to:r,onApply:(e,t)=>{n(e),i(t)}},dateRange:{from:a,to:s,onApply:(e,t)=>{o(e),c(t)}}},renderExpandedRow:e=>(0,m.jsxs)(`div`,{className:`text-sm text-muted-foreground`,children:[e.service,` is owned by `,(0,m.jsx)(`strong`,{children:e.owner}),`.`]})},[e.theme??`system`,e.defaultSort?.key??``,e.defaultSort?.dir??``].join(`:`))}function ae(){return(0,m.jsx)(d,{data:Ee,columns:De,defaultSort:{key:`name`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-few-columns`})}function oe(){return(0,m.jsx)(d,{data:Oe,columns:ke,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-everything-fits`})}function se(){return(0,m.jsx)(d,{data:x,columns:S,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},columnResizeStorageKey:`clicky-ui-story-data-table-lots-of-columns`})}function ce(){return(0,m.jsx)(d,{data:[],columns:S,loading:!0,loadingMessage:`Loading execution results…`,loadingRowCount:8,showGlobalFilter:!1,columnResizeStorageKey:`clicky-ui-story-data-table-loading`})}function le(){return(0,m.jsx)(d,{data:x,columns:S,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},menuActions:C,columnResizeStorageKey:`clicky-ui-story-data-table-menu-actions`})}function ue(){return(0,m.jsx)(d,{data:x,columns:S,autoFilter:!0,defaultSort:{key:`latency`,dir:`asc`},menuActions:Ae,columnResizeStorageKey:`clicky-ui-story-data-table-grouped-menu-actions`})}function de(e){let t=new Date(`2026-04-15T12:04:33Z`).getTime(),n=[`api`,`worker`,`billing`,`auth`],r=[`INFO`,`WARN`,`error`,`ERR`,`failed`,`ok`],i=[[`region:us-east`,`tier:edge`,`v=2026.04.1`],[`region:eu-west`,`tier:core`],[`region:us-west`,`tier:edge`,`v=2026.04.0`,`owner=platform`],[`region:eu-west`,`tier:core`,`owner=finance`],[`region:us-east`],[`region:ap-south`,`tier:edge`,`v=2026.03.9`]],a=e===`subMinute`?8e3:e===`sameDay`?18e5:7776e6;return Array.from({length:6},(e,o)=>({ts:new Date(t+a*o).toISOString(),level:r[o%r.length],service:n[o%n.length],message:`event #${o} from ${n[o%n.length]}`,tags:i[o%i.length]}))}function fe(){let[e,t]=(0,p.useState)(`sameDay`),n=de(e);return(0,m.jsxs)(`div`,{className:`space-y-3`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-2 text-sm`,children:[(0,m.jsx)(`span`,{className:`text-muted-foreground`,children:`Data spread:`}),[`subMinute`,`sameDay`,`multiYear`].map(n=>(0,m.jsx)(`button`,{type:`button`,onClick:()=>t(n),className:`rounded-md border px-2 py-1 text-xs ${e===n?`bg-accent text-accent-foreground`:`text-muted-foreground`}`,children:n},n))]}),(0,m.jsx)(d,{data:n,columns:je,autoFilter:!0,defaultSort:{key:`ts`,dir:`desc`},columnResizeStorageKey:`clicky-ui-story-data-table-timestamps-${e}`})]})}function pe(){return(0,m.jsx)(d,{data:Me,columns:Ne,autoFilter:!0,columnResizeStorageKey:`clicky-ui-story-data-table-tags`})}function me(){return(0,m.jsx)(d,{data:Pe,columns:Fe,autoFilter:!0,columnResizeStorageKey:`clicky-ui-story-data-table-status-dot`})}function he(){return(0,m.jsx)(d,{data:y,columns:b,defaultSort:{key:`restarts`,dir:`asc`},detailStyle:`dialog`,detailDialogTitle:e=>`${e.service} details`,columnResizeStorageKey:`clicky-ui-story-data-table-detail-dialog`,renderExpandedRow:e=>(0,m.jsxs)(`div`,{className:`space-y-2 text-sm`,children:[(0,m.jsxs)(`p`,{className:`text-muted-foreground`,children:[e.service,` is owned by `,(0,m.jsx)(`strong`,{children:e.owner}),`.`]}),(0,m.jsx)(`pre`,{className:`overflow-auto rounded border border-border bg-muted p-2 text-xs`,children:JSON.stringify(e,null,2)})]})})}function ge(){let[e,t]=(0,p.useState)({}),[n,r]=(0,p.useState)(``),[i,a]=(0,p.useState)(``),[o,s]=(0,p.useState)(``),c=[{key:`service`,kind:`enum`,label:`Service`,description:`Single-select: show only the chosen service, or leave empty for all.`,placeholder:`any service`,value:o,options:y.map(e=>({value:e.service})),onChange:s},{key:`status`,kind:`multi`,label:`Status`,description:`Include or exclude services by health. Click once to include, again to exclude.`,value:e,options:[{value:`healthy`,label:`healthy`},{value:`degraded`,label:`degraded`}],onChange:t},{key:`owner`,kind:`text`,label:`Owner`,description:"Match the owning team by substring, e.g. `plat` matches `platform`.",placeholder:`team name…`,value:n,onChange:r},{key:`restarts`,kind:`number`,label:`Min restarts`,description:`Only show services that have restarted at least this many times.`,value:{min:i},domainMin:0,domainMax:5,step:1,onChange:e=>a(e.min??``)}],l=Object.entries(e).filter(([,e])=>e===`include`).map(([e])=>e),ee=Object.entries(e).filter(([,e])=>e===`exclude`).map(([e])=>e),u=n.trim().toLowerCase(),te=i===``?null:Number(i),ne=y.filter(e=>!(o&&e.service!==o||l.length>0&&!l.includes(e.status)||ee.includes(e.status)||u&&!e.owner.toLowerCase().includes(u)||te!==null&&e.restarts<te));return(0,m.jsx)(d,{data:ne,columns:b,defaultSort:{key:`restarts`,dir:`asc`},externalFilters:c,columnResizeStorageKey:`clicky-ui-story-data-table-filter-descriptions`})}function _e(e,t){if(!t)return e;let n=t.dir===`asc`?1:-1,r=t.key;return[...e].sort((e,t)=>n*String(e[r]).localeCompare(String(t[r])))}function ve(){let[e,t]=(0,p.useState)(!0),[n,r]=(0,p.useState)(0),[i,a]=(0,p.useState)(10),[o,s]=(0,p.useState)({key:`name`,dir:`asc`}),[c,l]=(0,p.useState)({}),ee=_e(k,o).slice(n*i,n*i+i),u=Object.keys(c).length;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`button`,{type:`button`,className:`rounded-md bg-primary px-3 py-1.5 text-primary-foreground`,onClick:()=>t(!0),children:`Add people`}),(0,m.jsx)(ne,{open:e,onClose:()=>t(!1),title:`Add people`,size:`xl`,expandable:!0,scrollBody:!1,footer:(0,m.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,m.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:u===0?`Select one or more people from the table.`:`${u} selected`}),(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(`button`,{type:`button`,className:`rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50`,onClick:()=>l({}),disabled:u===0,children:`Clear`}),(0,m.jsx)(`button`,{type:`button`,className:`rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50`,onClick:()=>t(!1),disabled:u===0,children:u>0?`Add ${u}`:`Add`})]})]}),children:(0,m.jsx)(d,{className:`min-h-0 flex-1`,data:ee,columns:A,getRowId:e=>e.id,sort:o,onSortChange:s,manualSort:!0,columnResizeStorageKey:`clicky-ui-story-data-table-dialog`,rowSelection:{selectedRowIds:Object.keys(c),toggleOnRowClick:!0,onSelectionChange:(e,t)=>{let n=new Map(t.map(e=>[e.id,e]));l(Object.fromEntries(e.map(e=>[e,n.get(e)??c[e]])))}},pagination:{page:n,pageSize:i,total:k.length,pageSizeOptions:[10,25,50],onPageChange:r,onPageSizeChange:e=>{r(0),a(e)}}})})]})}function ye(){let e={getGroupKey:e=>e.owner,getGroupLabel:e=>`Owned by ${e}`,getGroupMeta:(e,t)=>`${t.reduce((e,t)=>e+t.restarts,0)} restarts`};return(0,m.jsxs)(`div`,{className:`space-y-6`,children:[(0,m.jsxs)(`section`,{className:`space-y-2`,children:[(0,m.jsx)(`h3`,{className:`text-sm font-medium`,children:`metaAlign: "end" (default)`}),(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,grouping:e})]}),(0,m.jsxs)(`section`,{className:`space-y-2`,children:[(0,m.jsx)(`h3`,{className:`text-sm font-medium`,children:`metaAlign: "start"`}),(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,grouping:{...e,metaAlign:`start`}})]})]})}function be(){return(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,groupingModes:Ie,defaultGroupingMode:`owner`})}function xe(){let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)(!1);return(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e),selectAllPages:{noun:`services`,loading:n,scopes:[{total:j,onSelectAll:()=>{r(!0),window.setTimeout(()=>{t(Array.from({length:j},(e,t)=>`service-${t}`)),r(!1)},300)}}]}},pagination:{page:0,pageSize:3,total:j,onPageChange:()=>{},onPageSizeChange:()=>{}},selectionActions:({selectedRowIds:e,clearSelection:t})=>(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`span`,{className:`text-xs`,children:(0,m.jsxs)(`b`,{children:[e.length.toLocaleString(),` selected`]})}),(0,m.jsxs)(`span`,{className:`flex gap-2`,children:[(0,m.jsx)(u,{size:`sm`,variant:`ghost`,onClick:t,children:`Clear`}),(0,m.jsxs)(u,{size:`sm`,children:[`Restart `,e.length.toLocaleString()]})]})]})})}function Se(){let[e,t]=(0,p.useState)([]);return(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e)},getRowClassName:e=>e.restarts>=3?`bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10`:void 0,footer:({visibleRowCount:e,totalRowCount:t})=>`Showing ${e} of ${t} services · ${y.reduce((e,t)=>e+t.restarts,0)} restarts total`,selectionActions:({selectedRows:e,clearSelection:t})=>(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(`span`,{className:`text-xs`,children:[(0,m.jsxs)(`b`,{children:[e.length,` selected`]}),(0,m.jsxs)(`span`,{className:`opacity-70`,children:[` · `,e.reduce((e,t)=>e+t.restarts,0),` `,`restarts`]})]}),(0,m.jsxs)(`span`,{className:`flex gap-2`,children:[(0,m.jsx)(u,{size:`sm`,variant:`ghost`,onClick:t,children:`Clear`}),(0,m.jsxs)(u,{size:`sm`,children:[`Restart `,e.length]})]})]})})}function Ce(){let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)([]),i=e=>r(t=>[...t,e]);return(0,m.jsxs)(`div`,{className:`flex flex-col gap-density-2`,children:[(0,m.jsx)(d,{data:y,columns:b,getRowId:e=>e.service,rowSelection:{selectedRowIds:e,onSelectionChange:e=>t(e)},selectionActions:[{id:`restart`,label:`Restart`,primary:!0,variant:`default`,icon:c,pendingLabel:`Restarting…`,onSelect:async e=>{await new Promise(e=>setTimeout(e,600)),i(`restarted ${e.selectedRowIds.join(`, `)}`)}},{id:`drain`,label:`Drain`,primary:!0,onSelect:()=>i(`drained`)},{id:`delete`,label:`Delete`,primary:!0,variant:`destructive`,confirm:{message:e=>`Delete ${e.selectedRows.length} services? This cannot be undone.`},onSelect:e=>i(`deleted ${e.selectedRowIds.length}`)},{id:`export`,label:`Export`,section:`Download`,onSelect:()=>void 0,children:[{id:`export-csv`,label:`CSV`,onSelect:()=>i(`exported csv`)},{id:`export-json`,label:`JSON`,onSelect:()=>i(`exported json`)}]},{id:`tag`,label:`Add tag`,onSelect:()=>i(`tagged`)}]}),(0,m.jsx)(`p`,{className:`px-1 text-xs text-muted-foreground`,children:n.length?n.join(` · `):`No actions run yet.`})]})}function we(){return(0,m.jsx)(d,{data:Le,columns:Re,autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:`Search services…`,hideableColumns:!0,menuActions:C,getRowHref:e=>`/services/${e.service}`,pagination:{page:0,pageSize:50,total:5324,onPageChange:()=>{},onPageSizeChange:()=>{}},columnResizeStorageKey:`clicky-ui-story-data-table-mobile-phone`})}function f(e){return e.querySelectorAll(`tbody tr:not([data-virtual-spacer])`).length}function Te(e){let t=e.querySelector(`.overflow-auto`);if(!t)throw Error(`no scroll container`);return t}var p,m,h,g,_,v,y,b,Ee,De,Oe,ke,x,S,C,Ae,je,Me,Ne,Pe,Fe,w,T,E,D,O,k,A,Ie,j,Le,Re,ze,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Be,Z,Q,$,Ve;function He(){return(He=e((()=>{p=t(),ee(),l(),te(),re(),m=n(),{expect:h,userEvent:g,waitFor:_,within:v}=__STORYBOOK_MODULE_TEST__,y=[{service:`api`,status:`healthy`,restarts:0,owner:`platform`,notes:`Primary public API with long-form notes that should keep its width.`},{service:`worker`,status:`degraded`,restarts:3,owner:`data`,notes:`Background job processor with retry queues.`},{service:`cron`,status:`healthy`,restarts:1,owner:`platform`,notes:`Nightly maintenance and reporting runner.`}],b=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`restarts`,label:`Restarts`,shrink:!0,align:`right`,sortValue:e=>Number(e??0)},{key:`owner`,label:`Owner`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],Ee=[{name:`api`,state:`healthy`,age:`12m`},{name:`worker`,state:`degraded`,age:`4m`},{name:`cron`,state:`healthy`,age:`2h`}],De=[{key:`name`,label:`Name`,shrink:!0},{key:`state`,label:`State`,shrink:!0},{key:`age`,label:`Age`,shrink:!0,align:`right`}],Oe=[{service:`api`,status:`healthy`,region:`us-east`,version:`2026.04.1`,owner:`platform`,latency:42},{service:`billing`,status:`healthy`,region:`eu-west`,version:`2026.04.0`,owner:`finance`,latency:58},{service:`worker`,status:`degraded`,region:`us-west`,version:`2026.03.9`,owner:`data`,latency:131}],ke=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`version`,label:`Version`,shrink:!0},{key:`owner`,label:`Owner`,shrink:!0},{key:`latency`,label:`Latency ms`,shrink:!0,align:`right`,sortValue:e=>Number(e??0)}],x=[{service:`api`,namespace:`frontend`,cluster:`prod-a`,region:`us-east`,zone:`use1-a`,status:`healthy`,owner:`platform`,version:`2026.04.1`,cpu:`62%`,memory:`5.1 GiB`,latency:42,restarts:0,updated:`4m ago`,notes:`Primary public API serving customer traffic.`},{service:`worker`,namespace:`jobs`,cluster:`prod-b`,region:`us-west`,zone:`usw2-c`,status:`degraded`,owner:`data`,version:`2026.03.9`,cpu:`78%`,memory:`7.8 GiB`,latency:131,restarts:3,updated:`9m ago`,notes:`Queue processor draining delayed retry batches.`},{service:`billing`,namespace:`finance`,cluster:`prod-eu`,region:`eu-west`,zone:`euw1-b`,status:`healthy`,owner:`finance`,version:`2026.04.0`,cpu:`41%`,memory:`3.4 GiB`,latency:58,restarts:1,updated:`18m ago`,notes:`Ledger sync and invoice reconciliation service.`}],S=[{key:`service`,label:`Service`,grow:!0},{key:`namespace`,label:`Namespace`,shrink:!0},{key:`cluster`,label:`Cluster`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`zone`,label:`Zone`,shrink:!0},{key:`status`,label:`Status`,shrink:!0},{key:`owner`,label:`Owner`,shrink:!0},{key:`version`,label:`Version`,shrink:!0},{key:`cpu`,label:`CPU`,align:`right`,shrink:!0},{key:`memory`,label:`Memory`,align:`right`,shrink:!0},{key:`latency`,label:`Latency ms`,align:`right`,shrink:!0,sortValue:e=>Number(e??0)},{key:`restarts`,label:`Restarts`,align:`right`,shrink:!0,sortValue:e=>Number(e??0)},{key:`updated`,label:`Updated`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],C=[{id:`download-yaml`,label:`YAML`,icon:s,iconClassName:`text-violet-600 dark:text-violet-400`,onSelect:()=>{console.info(`Download YAML`)}},{id:`download-json`,label:`JSON`,icon:i,onSelect:()=>{console.info(`Download JSON`)}},{id:`download-csv`,label:`CSV`,icon:o,iconClassName:`text-emerald-600 dark:text-emerald-400`,onSelect:()=>{console.info(`Download CSV`)}},{id:`download-pdf`,label:`PDF`,icon:r,iconClassName:`text-rose-600 dark:text-rose-400`,onSelect:()=>{console.info(`Download PDF`)}},{id:`download-markdown`,label:`Markdown`,icon:a,onSelect:()=>{console.info(`Download Markdown`)}}],Ae=[{id:`view-clicky`,label:`Clicky`,icon:i,section:`View`,disabled:!0,onSelect:()=>{console.info(`View Clicky`)}},{id:`view-json`,label:`JSON`,icon:i,section:`View`,onSelect:()=>{console.info(`View JSON`)}},{id:`view-pdf`,label:`PDF`,icon:r,iconClassName:`text-rose-600 dark:text-rose-400`,section:`View`,onSelect:()=>{console.info(`View PDF`)}},...C],je=[{key:`ts`,label:`Timestamp`,kind:`timestamp`,shrink:!0},{key:`level`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}},{key:`service`,label:`Service`,shrink:!0},{key:`message`,label:`Message`,grow:!0},{key:`tags`,label:`Tags`,kind:`tags`,grow:!0,tags:{maxVisible:2}}],Me=[{id:`1`,name:`auth-service`,tags:[`env=prod`,`team=identity`,`tier=edge`,`region=us-east`,`v=2026.04.1`]},{id:`2`,name:`billing-svc`,tags:[`env=prod`,`team=finance`,`tier=core`]},{id:`3`,name:`ingest-pipeline`,tags:[`env=staging`,`team=data`,`tier=core`]},{id:`4`,name:`marketing-site`,tags:[`env=prod`,`team=growth`]},{id:`5`,name:`many-tags`,tags:Array.from({length:30},(e,t)=>`label-${t}=value-${t}`)}],Ne=[{key:`id`,label:`ID`,shrink:!0},{key:`name`,label:`Name`,grow:!0},{key:`tags`,label:`Tags`,kind:`tags`,grow:!0,tags:{maxVisible:3}}],Pe=[{service:`api`,state:`ok`,notes:`running normally`},{service:`worker`,state:`ERROR`,notes:`stack overflow`},{service:`billing`,state:`warning`,notes:`latency p95 elevated`},{service:`auth`,state:`healthy`,notes:`all checks green`},{service:`search`,state:`failed`,notes:`circuit broken`},{service:`cron`,state:`degraded`,notes:`1/3 retries`},{service:`router`,state:`info`,notes:`info-only event`},{service:`unknown`,state:`mystery`,notes:`unmapped value falls through`}],Fe=[{key:`state`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}},{key:`service`,label:`Service`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],w=[`Ada`,`Grace`,`Alan`,`Linus`,`Katherine`,`Edsger`,`Barbara`,`Dennis`,`Margaret`,`Ken`,`Radia`,`Donald`],T=[`Lovelace`,`Hopper`,`Turing`,`Torvalds`,`Johnson`,`Dijkstra`,`Liskov`,`Ritchie`,`Hamilton`,`Thompson`,`Perlman`,`Knuth`],E=[`Platform`,`Finance`,`Data`,`Growth`,`Identity`,`Support`],D=[`Admin`,`Editor`,`Viewer`],O=[`active`,`invited`,`disabled`],k=Array.from({length:120},(e,t)=>{let n=w[t%w.length],r=T[t*7%T.length];return{id:`person-${t+1}`,name:`${n} ${r}`,email:`${n}.${r}${t+1}`.toLowerCase()+`@example.com`,team:E[t%E.length],role:D[t%D.length],status:O[t%O.length]}}),A=[{key:`name`,label:`Name`,grow:!0},{key:`email`,label:`Email`,grow:!0},{key:`team`,label:`Team`,shrink:!0},{key:`role`,label:`Role`,shrink:!0},{key:`status`,label:`Status`,kind:`status`,shrink:!0,status:{showLabel:!0}}],Ie=[{type:`column`,value:`owner`,label:`Owner`,columnKey:`owner`},{type:`custom`,value:`status`,label:`Status`,getGroupKey:e=>e.status,getGroupLabel:e=>`Status: ${e}`},{type:`none`,value:`none`,label:`No grouping`}],j=3706,Le=[{service:`api`,status:`healthy`,region:`us-east`,updated:`2026-04-15T12:04:33Z`,notes:`Primary public API serving customer traffic.`},{service:`worker`,status:`degraded`,region:`us-west`,updated:`2026-04-15T11:58:10Z`,notes:`Queue processor draining a delayed retry batch.`},{service:`billing`,status:`healthy`,region:`eu-west`,updated:`2026-04-15T11:40:02Z`,notes:`Ledger sync and invoice reconciliation.`}],Re=[{key:`service`,label:`Service`,grow:!0},{key:`status`,label:`Status`,shrink:!0},{key:`region`,label:`Region`,shrink:!0},{key:`updated`,label:`Updated`,kind:`timestamp`,shrink:!0},{key:`notes`,label:`Notes`,grow:!0}],ze={title:`Data/DataTable`,component:d,render:e=>(0,m.jsx)(ie,{...e}),args:{data:y,columns:b,loading:!1,loadingMessage:`Loading services…`,loadingRowCount:8,emptyMessage:`No services`,autoFilter:!0,showGlobalFilter:!0,globalFilterPlaceholder:`Search all columns…`,defaultSort:{key:`restarts`,dir:`asc`},resizableColumns:!0,hideableColumns:!0,persistColumnWidths:!0,persistColumnVisibility:!0,persistDensity:!0,showDensityControl:!0,showThemeControl:!1,showHeaderFilters:!0,showFullscreenControl:!1,fullscreenTitle:`Services`,fullscreenButtonLabel:`Open table full screen`},argTypes:{data:{control:!1,table:{category:`Data`}},columns:{control:!1,table:{category:`Data`}},loading:{control:`boolean`,table:{category:`State`}},loadingMessage:{control:`text`,table:{category:`State`}},loadingRowCount:{control:{type:`range`,min:1,max:20,step:1},table:{category:`State`}},emptyMessage:{control:`text`,table:{category:`State`}},autoFilter:{control:`boolean`,table:{category:`Filtering`}},showGlobalFilter:{control:`boolean`,table:{category:`Filtering`}},globalFilterPlaceholder:{control:`text`,table:{category:`Filtering`}},showHeaderFilters:{control:`boolean`,table:{category:`Filtering`}},resizableColumns:{control:`boolean`,table:{category:`Columns`}},persistColumnWidths:{control:`boolean`,table:{category:`Columns`}},hideableColumns:{control:`boolean`,table:{category:`Columns`}},persistColumnVisibility:{control:`boolean`,table:{category:`Columns`}},persistDensity:{control:`boolean`,table:{category:`Preferences`}},showDensityControl:{control:`boolean`,table:{category:`Preferences`}},showThemeControl:{control:`boolean`,table:{category:`Preferences`}},showFullscreenControl:{control:`boolean`,table:{category:`Fullscreen`}},fullscreenTitle:{control:`text`,table:{category:`Fullscreen`}},fullscreenButtonLabel:{control:`text`,table:{category:`Fullscreen`}}},parameters:{docs:{description:{component:`Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns.`}}}},M={},N={args:{showFullscreenControl:!0,fullscreenButtonLabel:`Open controlled table`},play:async({canvasElement:e})=>{let t=v(e);await h(t.getByRole(`button`,{name:`Open controlled table`})).toBeVisible()}},P={render:()=>(0,m.jsx)(ae,{})},F={render:()=>(0,m.jsx)(ce,{})},I={render:()=>(0,m.jsx)(oe,{})},L={render:()=>(0,m.jsx)(se,{})},R={render:()=>(0,m.jsx)(le,{})},z={render:()=>(0,m.jsx)(ue,{}),parameters:{docs:{description:{story:"Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."}}}},B={render:()=>(0,m.jsx)(fe,{})},V={render:()=>(0,m.jsx)(pe,{})},H={render:()=>(0,m.jsx)(me,{})},U={render:()=>(0,m.jsx)(he,{})},W={render:()=>(0,m.jsx)(ve,{}),parameters:{docs:{description:{story:'A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.\n\n- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table\'s own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.\n- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.\n- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for "Page X of Y".'}}}},G={render:()=>(0,m.jsx)(Se,{}),parameters:{docs:{description:{story:'`selectionActions` renders bulk actions in the toolbar beside the table menu whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.\n\n`footer` replaces the default "N of M rows" strip, and `getRowClassName` tints the degraded row.'}}},play:async({canvasElement:e})=>{let t=v(e);await h(t.getByText(/Showing 3 of 3 services/)).toBeInTheDocument(),await h(t.queryByText(`3 of 3 rows`)).toBeNull(),await g.click(t.getByRole(`checkbox`,{name:`Select row worker`}));let n=v(t.getByTestId(`data-table-selection-actions`));await h(n.getByText(`1 selected`)).toBeVisible(),await h(n.getByText(/3 restarts/)).toBeVisible(),await g.click(n.getByRole(`button`,{name:`Clear`})),await h(t.queryByTestId(`data-table-selection-actions`)).toBeNull()}},K={render:()=>(0,m.jsx)(Ce,{}),parameters:{docs:{description:{story:"`selectionActions` also takes a list of descriptors, and then the table renders them: the count, the Clear, the buttons, the overflow menu, the pending state while an async action is in flight, and the prompt in front of a destructive one.\n\n`primary` pins an action to the toolbar; the rest collapse into a menu whose sections and submenus come from the same `section`/`children` fields the table preferences menu uses. The render-prop form is still there for a cluster that is genuinely bespoke."}}},play:async({canvasElement:e})=>{let t=v(e);await g.click(t.getByRole(`checkbox`,{name:`Select row worker`})),await g.click(t.getByRole(`checkbox`,{name:`Select row cron`}));let n=v(t.getByTestId(`data-table-selection-actions`));await h(n.getByText(`2 selected`)).toBeVisible(),await h(n.getByRole(`button`,{name:`Restart`})).toBeVisible(),await h(n.getByRole(`button`,{name:`Delete`})).toBeVisible(),await g.click(n.getByRole(`button`,{name:`Delete`})),await h(await v(document.body).findByText(`Delete 2 services? This cannot be undone.`)).toBeVisible(),await g.click(v(document.body).getByRole(`button`,{name:`Cancel`})),await h(t.getByText(`No actions run yet.`)).toBeVisible(),await g.click(n.getByRole(`button`,{name:/More/}));let r=v(await v(document.body).findByRole(`menu`));await h(r.getByRole(`menuitem`,{name:`Add tag`})).toBeVisible()}},q={render:()=>(0,m.jsx)(xe,{}),parameters:{docs:{description:{story:"The header checkbox reaches only the rows the table is holding. `rowSelection.selectAllPages` adds the step past the page: the count shows for any selection, and once every loaded row is selected the table offers the rest, calling `onSelectAll` so the caller can fetch the pages it has not loaded.\n\n`scopes` is a ladder, narrowest first. A table showing one group of a larger result passes the group and then the whole match, so `select all` means the rows in front of the reader before it means every row the filters allow. A scope's `total` defaults to `pagination.total`."}}},play:async({canvasElement:e})=>{let t=v(e);await h(t.queryByTestId(`data-table-selection-scope`)).toBeNull(),await g.click(t.getByRole(`checkbox`,{name:`Select all visible rows`}));let n=v(t.getByTestId(`data-table-selection-scope`));await h(n.getByText(`3 of 3,706 services selected.`)).toBeVisible(),await g.click(n.getByRole(`button`,{name:`Select all 3,706 services`})),await h(await t.findByText(`All 3,706 services selected.`)).toBeVisible();let r=v(t.getByTestId(`data-table-selection-actions`));await h(r.getByText(`3,706 selected`)).toBeVisible(),await g.click(t.getByRole(`button`,{name:`Clear selection`})),await h(t.queryByTestId(`data-table-selection-scope`)).toBeNull()}},J={render:()=>(0,m.jsx)(ge,{}),parameters:{docs:{description:{story:"Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."}}}},Y={render:()=>(0,m.jsx)(ye,{}),parameters:{docs:{description:{story:'`grouping` splits the rendered rows into collapsible groups. It presents what is already on screen — it runs after filtering, sorting and pagination, so it never reorders rows within a group and never pulls in rows from another page.\n\n`getGroupMeta` is a per-group summary rendered inside the header row. `metaAlign` places it: `"end"` (the default) pins it to the trailing edge, while `"start"` keeps it immediately after the label and count — which is what you want when the summary is an aggregate of the group rather than a status for the row region.'}}},play:async({canvasElement:e})=>{let t=v(e).getAllByRole(`button`).filter(e=>e.hasAttribute(`aria-expanded`)),[n]=t,r=t[t.length/2];await h(n).toHaveClass(`flex-1`),await h(r).not.toHaveClass(`flex-1`),await h(r?.nextElementSibling).toHaveTextContent(`restarts`),await g.click(r),await h(r).toHaveAttribute(`aria-expanded`,`false`)}},X={render:()=>(0,m.jsx)(be,{}),parameters:{docs:{description:{story:"`groupingModes` adds DataTable-owned grouping controls to its FilterBar. Modes can group automatically by a scalar column, provide a custom key and label, or turn grouping off. Expand-all and collapse-all apply to current and subsequently revealed groups."}}},play:async({canvasElement:e})=>{let t=v(e),n=t.getByRole(`combobox`,{name:`Group rows by`});await h(n).toHaveValue(`owner`),await g.click(t.getByRole(`button`,{name:`Collapse all groups`})),await h(t.queryByText(`api`)).toBeNull(),await g.selectOptions(n,`status`),await h(t.getByRole(`button`,{name:/^Status: healthy/})).toBeVisible()}},Be=Array.from({length:5e3},(e,t)=>{let n=k[t%k.length];return{...n,id:`person-${t+1}`,name:`${n.name} #${t+1}`}}),Z={render:()=>(0,m.jsx)(d,{data:Be,columns:A,virtualize:!0,scrollContainerClassName:`max-h-[26rem]`}),parameters:{docs:{description:{story:"`virtualize` keeps only the rows near the viewport in the DOM — 5,000 rows here cost a few dozen `<tr>`s plus two spacers. The data is not windowed: counts, grouping and select-all still see all 5,000."}}},play:async({canvasElement:e})=>{let t=v(e);await h(await t.findByText(/#1$/)).toBeVisible(),await _(()=>h(f(e)).toBeLessThan(120)),await h(f(e)).toBeGreaterThan(0);let n=e.querySelector(`thead th`),r=n.getBoundingClientRect().width,i=Te(e);i.scrollTop=i.scrollHeight,await _(()=>h(e.querySelector(`tbody`)?.textContent).toContain(`#5000`)),await h(f(e)).toBeLessThan(120),await h(n.getBoundingClientRect().width).toBeCloseTo(r,0),i.scrollTop=0,await _(()=>h(e.querySelector(`tbody`)?.textContent).toContain(`#1`))}},Q={render:function(){let[,e]=(0,p.useState)(0);return(0,m.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,m.jsx)(u,{size:`sm`,onClick:()=>e(e=>e+1),children:`Rebuild rows array`}),(0,m.jsx)(d,{data:[...Be],columns:A,virtualize:!0,scrollContainerClassName:`max-h-[26rem]`})]})},play:async({canvasElement:e})=>{let t=v(e),n=Te(e);n.scrollTop=4e3,await _(()=>h(e.querySelector(`tbody`).textContent).toContain(`#100`));let r=n.scrollTop,i=e.querySelector(`tbody`).textContent;await g.click(t.getByRole(`button`,{name:`Rebuild rows array`})),await h(n.scrollTop).toBe(r),await _(()=>h(e.querySelector(`tbody`).textContent).toBe(i))}},$={render:()=>(0,m.jsx)(we,{}),parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:"Below the `sm` breakpoint the ⋯ menu opens as a full-height sheet, the pagination footer stays on one line with a compact page indicator, and the stretched row link no longer starts a native drag."}}}},Ve=[`Default`,`Playground`,`FewColumns`,`InitialLoading`,`EverythingFits`,`LotsOfColumns`,`MenuActions`,`GroupedMenuActions`,`Timestamps`,`Tags`,`StatusDots`,`RowDetailDialog`,`InDialogWithPagingAndSelection`,`SelectionActionsAndFooter`,`SelectionActionDescriptors`,`SelectAllPages`,`FilterDescriptions`,`GroupedRows`,`NativeGrouping`,`Virtualized`,`VirtualizedKeepsRowsWhenDataIsRebuilt`,`MobilePhone`],M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <FewColumnsShowcase />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <LoadingShowcase />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <EverythingFitsShowcase />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <LotsOfColumnsShowcase />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <MenuActionsShowcase />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Menu actions with a \`section\` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar."
      }
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <TimestampsShowcase />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <TagsShowcase />
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <StatusDotShowcase />
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <RowDetailDialogShowcase />
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: ['A DataTable hosted inside a \`Modal\` with server-style pagination and controlled multi-row selection — the pattern behind the chat "Add context" picker.', "", "- **Only the rows scroll.** The dialog sets \`scrollBody={false}\`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.", "- **Selection persists across pages.** It is keyed by \`getRowId\`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.", '- **Pagination is server-shaped.** The DataTable never slices \`data\`, so the story sorts and slices the current page itself and reports the true \`total\` for "Page X of Y".'].join("\\n")
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: "Caller-owned filters that each carry a \`description\`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count."
      }
    }
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}}})))()}He();export{M as Default,I as EverythingFits,P as FewColumns,J as FilterDescriptions,z as GroupedMenuActions,Y as GroupedRows,W as InDialogWithPagingAndSelection,F as InitialLoading,L as LotsOfColumns,R as MenuActions,$ as MobilePhone,X as NativeGrouping,N as Playground,U as RowDetailDialog,q as SelectAllPages,K as SelectionActionDescriptors,G as SelectionActionsAndFooter,H as StatusDots,V as Tags,B as Timestamps,Z as Virtualized,Q as VirtualizedKeepsRowsWhenDataIsRebuilt,Ve as __namedExportsOrder,ze as default};
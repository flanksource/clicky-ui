import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{i as r,r as i,t as a}from"./sessionTypes-xOjgwTbV.js";import{Ci as ee,Uo as te,Vt as ne,ld as re,n as o,xc as s,xu as ie}from"./icons-gNlgqXHH.js";import{n as c,t as l}from"./utils-DLaO06-s.js";import{n as u,t as d}from"./button-CLtlb14M.js";import{r as f,t as p}from"./Icon-C19Ihno2.js";import{n as m,t as h}from"./Modal-CdOfQYVL.js";import{n as g,t as _}from"./Badge-l_f_W1uG.js";import{n as v,t as y}from"./Callout-BCRxQokA.js";import{n as ae,t as oe}from"./CodeBlock-CNjt0JUG.js";import{n as se,t as ce}from"./use-resource-clock-D7D8Kv28.js";function b(e){let t=!i(e.state),n=e.controllable&&t,r=e.state===`stopping`;return{stop:{visible:n,disabled:r},extend:{visible:n,disabled:r},restart:{visible:e.restartable&&!t}}}function x(e){let t=[e.file&&`in ${e.file}`,e.host&&`on ${e.host}`].filter(Boolean);return t.length>0?t.join(` `):`on the ${e.backend} store`}function S(e){let t=Math.max(0,Math.round(e/C)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=t%60,a=[];return n>0&&a.push(`${n}h`),r>0&&a.push(`${r}m`),(i>0||a.length===0)&&a.push(`${i}s`),a.join(` `)}function le(e,t){let n=Date.parse(e);if(Number.isNaN(n))throw Error(`session stopAt is not a timestamp: ${e}`);let r=n-t;return r>=0?`Stops in ${S(r)}`:`Deadline passed ${S(-r)} ago`}var C,w,ue,de,fe;function T(){return(T=e((()=>{a(),C=1e3,w=60*C,ue=60*w,de=[5*w,15*w,ue],fe={starting:`info`,running:`info`,stopping:`warning`,completed:`success`,stopped:`neutral`,failed:`danger`,interrupted:`warning`}})))()}function pe(e,t){return t===`restart`?e.restart.visible:e[t].visible&&!e[t].disabled}function E({session:e,onStop:t,onExtend:n,onRestart:i,mutating:a,renderConfirm:ee,durationPresetsMs:re,pendingAction:o}){let s=b(e),[c,l]=(0,he.useState)(null),[u,f]=(0,he.useState)(null);c&&!pe(s,c)&&l(null),u&&!pe(s,u.action)&&f(null);let m=({action:e,durationMs:r})=>{if(f(null),e===`stop`)return t();if(r===void 0)throw Error(`session ${e} was requested without a duration`);return e===`extend`?n(r):i({durationMs:r})},h=e=>a?f(e):m(e);return!s.stop.visible&&!s.extend.visible&&!s.restart.visible?null:(0,D.jsxs)(`div`,{className:`flex flex-col items-end gap-2`,"data-slot":`session-header-controls`,children:[(0,D.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[s.extend.visible&&(0,D.jsxs)(d,{size:`sm`,variant:`outline`,disabled:s.extend.disabled,loading:o===`extend`,onClick:()=>l(`extend`),children:[(0,D.jsx)(p,{icon:ne,className:`size-4`}),`Extend`]}),s.stop.visible&&(0,D.jsxs)(d,{size:`sm`,variant:`destructive`,disabled:s.stop.disabled,loading:o===`stop`,onClick:()=>h({action:`stop`}),children:[(0,D.jsx)(p,{icon:te,className:`size-4`}),`Stop`]}),s.restart.visible&&(0,D.jsxs)(d,{size:`sm`,variant:`outline`,loading:o===`restart`,onClick:()=>{let t=r(e);t===void 0?l(`restart`):h({action:`restart`,durationMs:t})},children:[(0,D.jsx)(p,{icon:ie,className:`size-4`}),`Restart`]})]}),c&&(0,D.jsxs)(`div`,{role:`group`,"aria-label":`${ge[c]} duration`,className:`flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/40 p-1 text-xs`,children:[(0,D.jsx)(`span`,{className:`px-1 text-muted-foreground`,children:c===`extend`?`Extend by`:`Run for`}),re.map(e=>(0,D.jsx)(d,{size:`sm`,variant:`ghost`,onClick:()=>{l(null),h({action:c,durationMs:e})},children:S(e)},e)),(0,D.jsx)(d,{size:`sm`,variant:`ghost`,onClick:()=>l(null),children:`Cancel`})]}),u&&(ee?ee({action:u.action,session:e,...u.durationMs===void 0?{}:{durationMs:u.durationMs},confirm:()=>m(u),cancel:()=>f(null)}):(0,D.jsx)(me,{request:u,onConfirm:()=>m(u),onCancel:()=>f(null)}))]})}function me({request:e,onConfirm:t,onCancel:n}){let r=ge[e.action];return(0,D.jsx)(h,{open:!0,onClose:n,size:`sm`,title:`${r} this session?`,footer:(0,D.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,D.jsx)(d,{size:`sm`,variant:`ghost`,onClick:n,children:`Cancel`}),(0,D.jsx)(d,{size:`sm`,variant:`destructive`,onClick:t,children:r})]}),children:(0,D.jsxs)(`p`,{className:`text-sm`,children:[`This session changes the target's behaviour.`,e.durationMs!==void 0&&(e.action===`extend`?` Its deadline moves ${S(e.durationMs)} later.`:` It will run for ${S(e.durationMs)}.`)]})})}var he,D,ge;function _e(){return(_e=e((()=>{he=t(),u(),f(),o(),m(),T(),a(),D=n(),ge={stop:`Stop`,extend:`Extend`,restart:`Restart`};try{E.displayName=`SessionHeaderControls`,E.__docgenInfo={description:``,displayName:`SessionHeaderControls`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,methods:[],props:{session:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`session`,required:!0,tags:{},type:{name:`SessionInfo`}},onStop:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`onStop`,required:!0,tags:{},type:{name:`() => void`}},onExtend:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`onExtend`,required:!0,tags:{},type:{name:`(durationMs: number) => void`}},onRestart:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`onRestart`,required:!0,tags:{},type:{name:`(options: { durationMs: number; }) => void`}},mutating:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`mutating`,required:!0,tags:{},type:{name:`boolean`}},renderConfirm:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`renderConfirm`,required:!0,tags:{},type:{name:`((args: SessionConfirmRenderArgs) => ReactNode) | undefined`}},durationPresetsMs:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`durationPresetsMs`,required:!0,tags:{},type:{name:`readonly number[]`}},pendingAction:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeaderControls.tsx`,name:`TypeLiteral`}],description:``,name:`pendingAction`,required:!0,tags:{},type:{name:`SessionAction | null`}}},tags:{}}}catch{}})))()}function ve(e){return e.length>8?e.slice(0,8):e}function O({session:e,getSessionHref:t,renderLink:n=be,onStop:r,onExtend:a,onRestart:te,mutating:o=!1,renderConfirm:ie,durationPresetsMs:c=de,pendingAction:u=null,actionError:d,title:f,actions:m,className:h}){let g=!i(e.state),v=g&&e.stopAt!==void 0,y=se(v),ae=f===void 0&&e.labels?.label!==void 0,ce=f===void 0&&e.labels?.label===void 0,b=Object.entries(e.labels??{}).filter(([e])=>!(ae&&e===`label`)),x=e=>n({to:t(e),children:ve(e),className:xe,title:e,key:e});return(0,k.jsxs)(`header`,{className:l(`space-y-2 rounded-md border border-border bg-card p-3`,h),"data-slot":`session-header`,children:[(0,k.jsxs)(`div`,{className:`flex items-start gap-3`,children:[(0,k.jsxs)(`div`,{className:`min-w-0 flex-1 space-y-1.5`,children:[(0,k.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,k.jsx)(`h2`,{className:`truncate text-base font-semibold`,children:f??e.labels?.label??e.profile}),(0,k.jsx)(_,{tone:fe[e.state],size:`sm`,children:e.state}),e.unresponsive&&(0,k.jsx)(_,{tone:`warning`,variant:`outline`,size:`sm`,icon:s,children:`unresponsive`}),v&&(0,k.jsxs)(`span`,{className:`inline-flex items-center gap-1 text-xs text-muted-foreground`,children:[(0,k.jsx)(p,{icon:ne,className:`size-3.5`}),le(e.stopAt,y)]})]}),(0,k.jsxs)(`div`,{className:`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground`,children:[!ce&&(0,k.jsx)(`span`,{className:`font-mono`,children:e.profile}),e.events&&(0,k.jsxs)(`span`,{className:`font-mono`,children:[`Event kind: `,e.events.kind]}),(0,k.jsxs)(`span`,{className:`inline-flex items-center gap-1`,children:[(0,k.jsx)(p,{icon:ee,className:`size-3.5`}),`${e.owner.host} · pid ${e.owner.pid}`]}),e.principal&&(0,k.jsxs)(`span`,{children:[`by `,e.principal]}),(0,k.jsxs)(`span`,{children:[e.eventCount.toLocaleString(),` events`]}),e.handle&&(0,k.jsx)(`span`,{className:`font-mono`,children:e.handle}),!g&&e.stopReason&&(0,k.jsx)(`span`,{children:e.stopReason}),b.length>0&&(0,k.jsx)(`ul`,{role:`list`,className:`flex flex-wrap gap-1`,"aria-label":`Labels`,children:b.map(([e,t])=>(0,k.jsx)(`li`,{children:(0,k.jsx)(_,{tone:`neutral`,variant:`outline`,size:`xs`,children:`${e}=${t}`})},e))}),e.restartOf&&(0,k.jsxs)(`span`,{className:`text-foreground`,children:[`Restart of `,x(e.restartOf)]}),e.restartedAs&&e.restartedAs.length>0&&(0,k.jsxs)(`span`,{className:`inline-flex flex-wrap items-center gap-1 text-foreground`,children:[`Restarted as `,e.restartedAs.map(x)]}),e.metadata?.map(e=>(0,k.jsxs)(`details`,{className:`group open:basis-full`,"data-slot":`session-metadata`,children:[(0,k.jsxs)(`summary`,{className:`inline-flex cursor-pointer list-none items-center gap-1 hover:text-foreground`,children:[(0,k.jsx)(p,{icon:re,className:`size-3.5 transition-transform group-open:rotate-90`}),e.label,e.language&&(0,k.jsx)(_,{tone:`neutral`,variant:`outline`,size:`xs`,className:`uppercase`,children:e.language})]}),(0,k.jsx)(`div`,{className:`mt-2 max-h-64 overflow-y-auto text-foreground`,"data-slot":`session-metadata-value`,children:(0,k.jsx)(oe,{language:e.language??`text`,source:e.value,copyable:!0})})]},e.name))]})]}),(0,k.jsxs)(`div`,{className:`flex shrink-0 items-start gap-2`,"data-slot":`session-header-actions`,children:[m,(0,k.jsx)(E,{session:e,onStop:r,onExtend:a,onRestart:te,mutating:o,renderConfirm:ie,durationPresetsMs:c,pendingAction:u})]})]}),(0,k.jsx)(ye,{session:e,active:g,actionError:d})]})}function ye({session:e,active:t,actionError:n}){let r=e.events!==void 0&&!e.eventsAvailable,i=t&&!e.controllable,a=n!=null;return!a&&!e.error&&!e.warning&&!r&&!i?null:(0,k.jsxs)(`div`,{className:`space-y-2`,children:[a&&(0,k.jsx)(y,{variant:`caution`,label:`Action failed`,children:n instanceof Error?n.message:String(n)}),e.error&&(0,k.jsx)(y,{variant:`caution`,label:`Error`,children:e.error}),e.warning&&(0,k.jsx)(y,{variant:`warning`,label:`Warning`,children:e.warning}),r&&e.events&&(0,k.jsx)(y,{variant:`warning`,label:`Events unavailable`,children:`Events were ${x(e.events.store)}; this server cannot read that store.`}),i&&(0,k.jsx)(y,{variant:`note`,label:`Read only`,children:`Controlled by ${e.owner.host} (pid ${e.owner.pid}); this server cannot stop or extend it.`})]})}var k,be,xe;function Se(){return(Se=e((()=>{g(),v(),ae(),f(),ce(),o(),c(),T(),_e(),a(),k=n(),be=({to:e,children:t,className:n,title:r,key:i})=>(0,k.jsx)(`a`,{href:e,className:n,title:r,children:t},i),xe=`font-mono text-primary underline-offset-2 hover:underline`;try{O.displayName=`SessionHeader`,O.__docgenInfo={description:``,displayName:`SessionHeader`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,methods:[],props:{session:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:``,name:`session`,required:!0,tags:{},type:{name:`SessionInfo`}},getSessionHref:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:"Route of another session's page, for `restartOf` / `restartedAs` links.",name:`getSessionHref`,required:!0,tags:{},type:{name:`(id: string) => string`}},renderLink:{defaultValue:{value:`({ to, children, className, title, key }) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
)`},declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:`Renders those links with the host's router. Defaults to a plain anchor.`,name:`renderLink`,required:!1,tags:{},type:{name:`RenderLink`}},onStop:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:``,name:`onStop`,required:!0,tags:{},type:{name:`() => void`}},onExtend:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:``,name:`onExtend`,required:!0,tags:{},type:{name:`(durationMs: number) => void`}},onRestart:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:"Called with the run's own `params.durationMs`, or the duration picked when it had none.",name:`onRestart`,required:!0,tags:{},type:{name:`(options: { durationMs: number; }) => void`}},mutating:{defaultValue:{value:`false`},declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:`The session's kind changes the target's behaviour (a class patch, say):
Stop, Extend and Restart each wait for confirmation first.`,name:`mutating`,required:!1,tags:{},type:{name:`boolean`}},renderConfirm:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:`Confirmation slot for a mutating kind. Defaults to a small modal.`,name:`renderConfirm`,required:!1,tags:{},type:{name:`(args: SessionConfirmRenderArgs) => ReactNode`}},durationPresetsMs:{defaultValue:{value:`[5 * MINUTE, 15 * MINUTE, HOUR]`},declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:`Durations offered by the Extend and Restart prompts.`,name:`durationPresetsMs`,required:!1,tags:{},type:{name:`readonly number[]`}},pendingAction:{defaultValue:{value:`null`},declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:"The control request in flight (useSession's `pendingAction`).",name:`pendingAction`,required:!1,tags:{},type:{name:`SessionAction | null`}},actionError:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:"The last control request's failure (useSession's `actionError`); rendered until the next action.",name:`actionError`,required:!1,tags:{},type:{name:`unknown`}},title:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:"Heading; defaults to `labels.label`, then the profile.",name:`title`,required:!1,tags:{},type:{name:`ReactNode`}},actions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:`The host's own actions, placed beside the session controls on the title row.`,name:`actions`,required:!1,tags:{},type:{name:`ReactNode`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/rpc/SessionHeader.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}function A(e={}){return{...N,...e}}function j(e,t={}){let{stoppedAt:n,stopReason:r,...i}=N;return{...i,state:`running`,stopAt:e,controllable:!0,restartable:!1,...t}}var M,N,Ce,we,P;function Te(){return(Te=e((()=>{M={stream:`probe:FileMessageListener.onMessage.617519d6`,kind:`jvm_trace`,generation:`9b2f6c1e-4d0a-4c7e-8e1f-2a5b7d3c9f10`,low:1,high:1843,from:1,to:1843,total:1843,expiresAt:`2026-10-15T10:09:12Z`,store:{backend:`sqlite`,host:`mission-control-oipa-6d9f`,file:`/data/oipa-cli/trace-results/environments/oipa.lab/records.sqlite`}},N={schemaVersion:1,id:`7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b`,profile:`trace-capture/jvm_trace`,kind:`capture`,role:`capture`,params:{target:`cycle`,class:`com.example.messaging.FileMessageListener`,method:`onMessage`,loader:`org.apache.catalina.loader.ParallelWebappClassLoader@617519d6`,args:!0,return:!0,exception:!0,calls:!0,events:1e3,expand:3,chars:16384,durationMs:9e5},labels:{target:`cycle`,origin:`web`,via:`http`,label:`FileMessageListener#onMessage (trace)`,environment:`oipa.lab`},principal:`admin`,owner:{host:`mission-control-oipa-6d9f`,pid:1,boot:`b41c9e0d`},startedAt:`2026-09-15T10:00:00Z`,state:`stopped`,eventCount:1843,updatedAt:`2026-09-15T10:09:14Z`,heartbeatAt:`2026-09-15T10:09:00Z`,stopAt:`2026-09-15T10:15:00Z`,stoppedAt:`2026-09-15T10:09:12Z`,stopReason:`stopped by admin`,handle:`FileMessageListener.onMessage.617519d6`,events:M,summary:{calls:1843,errors:3,p95Ms:412,dropped:0,suppressed:12,methods:[`onMessage(Message)`]},controllable:!1,localWriter:!0,eventsAvailable:!0,unresponsive:!1,restartable:!0},Ce={...M,store:{backend:`kv`}},we={name:`sql_xevent.statements`,label:`Started with`,language:`sql`,value:`CREATE EVENT SESSION [trace_7c1e2f4a] ON SERVER
ADD EVENT sqlserver.rpc_completed (
    ACTION (package0.event_sequence, sqlserver.client_app_name, sqlserver.client_hostname, sqlserver.database_name, sqlserver.session_id, sqlserver.sql_text, sqlserver.username)
    WHERE ([duration] >= 1000 AND sqlserver.like_i_sql_unicode_string(sqlserver.database_name, N'POLICY[_]%') AND NOT (sqlserver.equal_i_sql_unicode_string(sqlserver.client_app_name, N'go/example-cli')) AND sqlserver.like_i_sql_unicode_string(sqlserver.client_hostname, N'cycle%'))
),
ADD EVENT sqlserver.sql_batch_completed (
    ACTION (package0.event_sequence, sqlserver.client_app_name, sqlserver.client_hostname, sqlserver.database_name, sqlserver.session_id, sqlserver.sql_text, sqlserver.username)
    WHERE ([duration] >= 1000 AND sqlserver.like_i_sql_unicode_string(sqlserver.database_name, N'POLICY[_]%') AND NOT (sqlserver.equal_i_sql_unicode_string(sqlserver.client_app_name, N'go/example-cli')) AND sqlserver.like_i_sql_unicode_string(sqlserver.client_hostname, N'cycle%'))
)
ADD TARGET package0.ring_buffer (SET max_memory = 4096, max_events_limit = 8192)
WITH (MAX_DISPATCH_LATENCY = 1 SECONDS, TRACK_CAUSALITY = OFF, STARTUP_STATE = OFF);

ALTER EVENT SESSION [trace_7c1e2f4a] ON SERVER STATE = START;`},P=A({profile:`trace-capture/sql_xevent`,params:{database:`POLICY_*`,host:`cycle*`,minDuration:`1ms`,durationMs:6e5},labels:{target:`sql`,origin:`web`,label:`SQL trace · cycle*`,environment:`oipa.lab`},handle:`trace_7c1e2f4a`,events:{...M,stream:`sql_xevent:trace_7c1e2f4a`,kind:`sql_xevent`},summary:{events:1843,errors:0},metadata:[we]})})))()}var F,I,L,R,Ee,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,De;function Oe(){return(Oe=e((()=>{Se(),Te(),F=n(),{fn:I}=__STORYBOOK_MODULE_TEST__,L=e=>new Date(Date.now()+e*6e4).toISOString(),R=e=>new Date(Date.now()-e*6e4).toISOString(),Ee={title:`Clicky-RPC/SessionHeader`,component:O,tags:[`autodocs`],parameters:{docs:{description:{component:"Props-only header for one commons-db query session (`GET /api/v1/sessions/{id}`): state with an unresponsive badge, owner host and pid, label chips, restart lineage links, a stopAt countdown, and Stop/Extend/Restart gated by `controllable` and `restartable`. Pair it with `useSession` for data and actions."}}},args:{session:N,getSessionHref:e=>`#/traces/sessions/${e}`,onStop:I(),onExtend:I(),onRestart:I()},argTypes:{session:{control:`object`}},render:e=>(0,F.jsx)(`div`,{className:`max-w-4xl`,children:(0,F.jsx)(O,{...e})})},z={args:{session:j(L(6))}},B={args:{session:j(L(6),{state:`stopping`,stopReason:`stopped by admin`})}},V={},H={args:{session:A({state:`interrupted`,stopReason:`heartbeat lost`,controllable:!1,localWriter:!1,stoppedAt:R(2)})}},U={args:{session:j(L(6),{unresponsive:!0,controllable:!1,localWriter:!1,heartbeatAt:R(4)})}},W={args:{session:A({eventsAvailable:!1,localWriter:!1})}},G={args:{session:A({eventsAvailable:!1,localWriter:!1,events:Ce})}},K={args:{session:j(L(6)),actionError:Error(`POST /api/v1/sessions/7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b/extend?duration=300000ms failed: session is not controllable by this principal`)}},q={args:{session:j(L(12),{controllable:!1,localWriter:!1,owner:{host:`mission-control-oipa-7a01`,pid:1,boot:`e93a1f7c`}})}},J={args:{session:P,actions:(0,F.jsx)(`button`,{type:`button`,className:`h-8 rounded-md border border-border px-3 text-sm`,children:`Reconcile`})}},Y={args:{session:P}},X={args:{session:A({state:`failed`,stopReason:``,error:`probe detached: class com.example.messaging.FileMessageListener was retransformed`,warning:`status write failed 2 times: redis i/o timeout`,restartable:!0})}},Z={args:{session:A({params:{...N.params,durationMs:0}})}},Q={args:{mutating:!0,session:j(L(3),{profile:`trace-capture/jvm_redefine`,labels:{target:`cycle`,origin:`web`,label:`FileMessageListener (patch)`},handle:`com.example.messaging.FileMessageListener@617519d6`})}},$={args:{session:A({restartOf:`3f0a9c12-7b44-4e21-9d0e-5a6b7c8d9e0f`,restartedAs:[`9d2f3a5b-4c6e-4f70-9bac-1d2e3f4a5b6c`]})}},De=[`RunningWithCountdown`,`Stopping`,`StoppedRestartable`,`Interrupted`,`RunningButUnresponsive`,`EventsUnavailable`,`EventsUnavailableInKvStore`,`ActionFailed`,`NotControllable`,`WithHostActions`,`SqlTraceStartedWith`,`FailedWithWarning`,`RestartPromptsForDuration`,`MutatingKindConfirms`,`RestartLineage`],z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    session: runningSessionFixture(inMinutes(6))
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    session: runningSessionFixture(inMinutes(6), {
      state: "stopping",
      stopReason: "stopped by admin"
    })
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      state: "interrupted",
      stopReason: "heartbeat lost",
      controllable: false,
      localWriter: false,
      stoppedAt: agoMinutes(2)
    })
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    session: runningSessionFixture(inMinutes(6), {
      unresponsive: true,
      controllable: false,
      localWriter: false,
      heartbeatAt: agoMinutes(4)
    })
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      eventsAvailable: false,
      localWriter: false
    })
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      eventsAvailable: false,
      localWriter: false,
      events: KV_STORE_EVENTS
    })
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    session: runningSessionFixture(inMinutes(6)),
    actionError: new Error("POST /api/v1/sessions/7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b/extend?duration=300000ms failed: session is not controllable by this principal")
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    session: runningSessionFixture(inMinutes(12), {
      controllable: false,
      localWriter: false,
      owner: {
        host: "mission-control-oipa-7a01",
        pid: 1,
        boot: "e93a1f7c"
      }
    })
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    session: STOPPED_SQL_XEVENT_SESSION,
    actions: <button type="button" className="h-8 rounded-md border border-border px-3 text-sm">
        Reconcile
      </button>
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    session: STOPPED_SQL_XEVENT_SESSION
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      state: "failed",
      stopReason: "",
      error: "probe detached: class com.example.messaging.FileMessageListener was retransformed",
      warning: "status write failed 2 times: redis i/o timeout",
      restartable: true
    })
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      params: {
        ...STOPPED_JVM_TRACE_SESSION.params,
        durationMs: 0
      }
    })
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    mutating: true,
    session: runningSessionFixture(inMinutes(3), {
      profile: "trace-capture/jvm_redefine",
      labels: {
        target: "cycle",
        origin: "web",
        label: "FileMessageListener (patch)"
      },
      handle: "com.example.messaging.FileMessageListener@617519d6"
    })
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    session: sessionFixture({
      restartOf: "3f0a9c12-7b44-4e21-9d0e-5a6b7c8d9e0f",
      restartedAs: ["9d2f3a5b-4c6e-4f70-9bac-1d2e3f4a5b6c"]
    })
  }
}`,...$.parameters?.docs?.source}}}})))()}Oe();export{K as ActionFailed,W as EventsUnavailable,G as EventsUnavailableInKvStore,X as FailedWithWarning,H as Interrupted,Q as MutatingKindConfirms,q as NotControllable,$ as RestartLineage,Z as RestartPromptsForDuration,U as RunningButUnresponsive,z as RunningWithCountdown,Y as SqlTraceStartedWith,V as StoppedRestartable,B as Stopping,J as WithHostActions,De as __namedExportsOrder,Ee as default};
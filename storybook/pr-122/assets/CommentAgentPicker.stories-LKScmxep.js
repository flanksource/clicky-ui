import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./button-BkkE1MlD.js";import{n as a,t as o}from"./utils-DLaO06-s.js";import{n as s,t as c}from"./AgentIdentity-CzULYAsy.js";import{n as l,t as u}from"./Badge-BE5PAZSL.js";import{n as d,t as f}from"./SegmentedControl-CwktkRgn.js";import{n as p,t as ee}from"./InputField-CpL9u_8T.js";import{n as m,t as te}from"./Switch-Cg492Q2O.js";import{n as ne,t as h}from"./Field-Dwd8SXQ4.js";import{n as g,t as _}from"./select-DEJTU9aP.js";import{n as v,t as y}from"./PromptRunEditor-BIZqV--D.js";function b(){return(b=e((()=>{})))()}function x(e){return e.file?e.location:`db:${e.kind}:${e.path??``}`}function re(e,t){let n=e.layers.find(e=>E(e,t));return n&&x(n)}function ie(e){let{settings:t,provenance:n,field:r}=e,i=n[r];if(!i)return{label:`default`,title:`No settings layer sets this field, so gavel's built-in default applies`,set:!1};let a=t.layers.find(e=>x(e)===i.layer);if(!a)throw Error(`the ${r} of the comment agent comes from ${i.layer}, which is not one of the target's settings layers`);return{label:`${a.file?a.location.split(`/`).pop():`DB`}${i.page?` (page)`:``}`,title:i.page?`${i.layer} · ${i.page}`:i.layer,set:!0}}function ae(e,t){switch(t){case`enabled`:return e.enabled?`on`:`off`;case`assign`:return e.assign?`yes`:`no`;case`edits`:return e.edits??`direct`;case`prompt`:return e.prompt??`editor-comments`;case`presets`:return(e.presets??[]).join(`, `);case`spec`:return typeof e.spec?.model==`string`?e.spec.model:Object.keys(e.spec??{}).length?JSON.stringify(e.spec):``;case`variables`:return Object.keys(e.variables??{}).length?JSON.stringify(e.variables):``;case`instructions`:return e.instructions??``;case`group`:return e.group??``}}function S(e){return{prompt:e.prompt??`editor-comments`,presets:e.presets??[],spec:e.spec??{},variables:e.variables??{},instructions:e.instructions??``}}function C(e,t){let n=S(e),r=Object.keys(t).filter(e=>JSON.stringify(t[e])!==JSON.stringify(n[e]));return Object.fromEntries(r.map(e=>[e,se(t[e])?null:t[e]]))}function oe(e){return{[e]:null}}function w(e){return e.resumable?`resumes`:e.status!==`ended`&&!e.inCmux?`not in cmux`:e.status??`running`}function T(e){return e.context?Math.round(e.context.usedTokens/e.context.windowTokens*100):void 0}var E,se;function D(){return(D=e((()=>{b(),E=(e,t)=>e.kind===t.kind&&(e.path??``)===(t.path??``)&&(e.file??``)===(t.file??``),se=e=>typeof e==`string`?e.trim()===``:Array.isArray(e)?e.length===0:Object.keys(e).length===0})))()}function O({agent:e,prompts:t,runtimes:n,busy:r,onSave:a}){let o=(0,k.useId)(),[s,c]=(0,k.useState)(()=>S(e)),[l,u]=(0,k.useState)(!0),d=C(e,s),f=Object.keys(d).length>0,p=t?.find(e=>e.id===s.prompt),m=t&&[...t.map(e=>({value:e.id,label:e.label})),...p?[]:[{value:s.prompt,label:`${s.prompt} (not in the catalog)`}]];return(0,A.jsxs)(`div`,{className:`space-y-3`,children:[m&&(0,A.jsx)(h,{label:`Prompt`,htmlFor:`${o}-prompt`,helper:p?.description??`The captain prompt that works each new thread.`,children:(0,A.jsx)(_,{id:`${o}-prompt`,value:s.prompt,options:m,onChange:e=>c({...s,prompt:e.currentTarget.value,variables:{}})})}),n&&(0,A.jsx)(y,{value:{spec:s.spec,presets:s.presets,variables:s.variables},onChange:e=>c({...s,spec:e.spec??{},presets:e.presets??[],variables:e.variables??{}}),models:n.models,families:n.families,presets:n.presets,variablesSchema:p?.variablesSchema,onVariablesValidityChange:u},s.prompt),(0,A.jsx)(h,{label:`Instructions`,htmlFor:`${o}-instructions`,helper:`Appended to every thread the agent is given.`,children:(0,A.jsx)(ee,{as:`textarea`,id:`${o}-instructions`,rows:3,value:s.instructions,onChange:e=>c({...s,instructions:e})})}),(0,A.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,A.jsx)(i,{variant:`ghost`,size:`sm`,disabled:r||!f,onClick:()=>c(S(e)),children:`Reset`}),(0,A.jsx)(i,{size:`sm`,disabled:r||!f||!l,onClick:()=>a(d),children:`Save run settings`})]})]})}var k,A;function ce(){return(ce=e((()=>{k=t(),r(),ne(),p(),g(),v(),D(),A=n();try{O.displayName=`CommentAgentRunSettings`,O.__docgenInfo={description:"The prompt, runtime, presets, variables and instructions of the comment agent, edited as one form. Mount with a `key` per resolved agent.",displayName:`CommentAgentRunSettings`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,methods:[],props:{agent:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:`The agent as resolved now; the form starts from it and saves only what it changes.`,name:`agent`,required:!0,tags:{},type:{name:`CommentAgent`}},prompts:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`prompts`,required:!1,tags:{},type:{name:`CommentAgentPromptOption[] | undefined`}},runtimes:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`runtimes`,required:!1,tags:{},type:{name:`CommentAgentRuntimeOptions | undefined`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`busy`,required:!0,tags:{},type:{name:`boolean`}},onSave:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`onSave`,required:!0,tags:{},type:{name:`(patch: CommentAgentPatch) => void`}}},tags:{}}}catch{}})))()}function le(e){let{session:t,pressed:n,onSelect:r,assignAll:a}=e,o=T(t);return(0,M.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,M.jsxs)(i,{variant:`ghost`,size:`sm`,className:`h-auto min-w-0 flex-1 justify-start gap-2 py-2 text-left`,"aria-label":ue(t),...n===void 0?{}:{"aria-pressed":n},title:`${t.title}\n${t.cwd??``}\n${t.id}`,onClick:r,children:[(0,M.jsxs)(`span`,{className:`flex min-w-0 flex-1 flex-col gap-1`,children:[(0,M.jsx)(`span`,{className:`truncate`,children:t.title}),(0,M.jsxs)(`span`,{className:`flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground`,children:[(0,M.jsx)(c,{...t.model?{model:t.model}:{provider:t.source},identityId:t.id}),(0,M.jsx)(`span`,{className:`truncate`,children:t.cwd?.split(`/`).filter(Boolean).at(-1)??t.id.slice(0,12)}),o!==void 0&&(0,M.jsxs)(`span`,{className:`tabular-nums`,title:`Context window in use`,children:[o,`%`]})]})]}),(0,M.jsx)(u,{variant:`soft`,tone:t.resumable?`neutral`:`info`,clickToCopy:!1,children:w(t)})]}),a&&(0,M.jsx)(i,{size:`sm`,variant:`outline`,"aria-label":`Assign all to ${t.title}`,disabled:a.disabled,onClick:a.onAssign,children:`Assign all`})]})}function j({sessions:e,busy:t}){let{items:n,state:r,error:a,selectedId:o,onSelect:s,onNew:c,onAll:l,assignAll:u}=e,d=c!==void 0&&o===void 0;return(0,M.jsxs)(`section`,{className:`space-y-2`,"aria-label":`Active sessions`,children:[(0,M.jsx)(`h2`,{className:`font-semibold`,children:`Active sessions`}),r===`loading`&&(0,M.jsx)(`p`,{role:`status`,className:`text-muted-foreground`,children:`Loading active sessions…`}),r===`ready`&&n.length===0&&(0,M.jsx)(`p`,{className:`text-muted-foreground`,children:`No active sessions.`}),r===`error`&&a&&(0,M.jsx)(`p`,{className:`break-words text-destructive`,children:a}),c&&(0,M.jsxs)(i,{variant:`ghost`,size:`sm`,"aria-pressed":d,"aria-label":`New session`,className:`h-auto w-full justify-start gap-2 py-2 text-left`,onClick:c,children:[(0,M.jsx)(`span`,{className:`truncate`,children:`New session`}),(0,M.jsx)(`span`,{className:`text-muted-foreground`,children:`runs the agent above`})]}),u&&(0,M.jsxs)(`div`,{className:`space-y-1`,children:[(0,M.jsx)(i,{size:`sm`,variant:`outline`,className:`w-full`,"aria-label":`Assign all to a new session`,disabled:t||u.count===0,onClick:u.onNew,children:`Assign all to a new session`}),(0,M.jsx)(`p`,{className:`text-muted-foreground`,children:u.count===0?`No open threads`:`${u.count} open ${u.count===1?`thread`:`threads`}`})]}),n.map(e=>(0,M.jsx)(le,{session:e,pressed:c?o===e.id:void 0,onSelect:()=>s(e),assignAll:u&&{disabled:t||u.count===0,onAssign:()=>u.onSession(e)}},e.id)),l&&(0,M.jsx)(i,{size:`sm`,variant:`outline`,className:`w-full`,onClick:l,children:`All sessions…`})]})}var M,ue;function de(){return(de=e((()=>{r(),l(),s(),D(),M=n(),ue=e=>`Use session ${e.title}`;try{j.displayName=`CommentAgentSessions`,j.__docgenInfo={description:`The live and resumable sessions section of the comment agent picker.`,displayName:`CommentAgentSessions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,methods:[],props:{sessions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,name:`TypeLiteral`}],description:``,name:`sessions`,required:!0,tags:{},type:{name:`CommentAgentPickerSessions`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,name:`TypeLiteral`}],description:``,name:`busy`,required:!0,tags:{},type:{name:`boolean`}}},tags:{}}}catch{}})))()}function N(e){let{agents:t,heading:n,busy:r=!1,autoRunUnavailable:a,prompts:s,runtimes:c,grouping:l,sessions:d,className:p}=e,[ee,m]=(0,P.useState)(!1),[ne,h]=(0,P.useState)(null),g=t.agent,_=t.settings,v=r||ee,y=async e=>{m(!0),h(null);try{await e()}catch(e){h(e instanceof Error?e.message:String(e))}finally{m(!1)}},b=ne??t.error,x=b&&(0,F.jsx)(`p`,{role:`alert`,className:`break-words text-destructive`,children:b}),S=d&&(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(`hr`,{className:`border-border`}),(0,F.jsx)(j,{sessions:d,busy:v})]}),C=e=>(0,F.jsxs)(`div`,{className:o(`space-y-3 p-3 text-xs`,p),children:[n&&(0,F.jsx)(`h2`,{className:`font-semibold`,children:n}),e]});if(!t.ready||!g||!_)return C((0,F.jsxs)(F.Fragment,{children:[t.error?x:(0,F.jsx)(`p`,{role:`status`,className:`text-muted-foreground`,children:`Loading the comment agent…`}),S]}));let w=t.ownLayer&&re(_,t.ownLayer),T=e=>{let n=ie({settings:_,provenance:g.provenance,field:e});return(0,F.jsxs)(`span`,{className:`flex shrink-0 items-center gap-1`,children:[(0,F.jsx)(u,{tone:`neutral`,variant:`soft`,clickToCopy:!1,children:(0,F.jsx)(`span`,{title:n.title,children:n.label})}),w!==void 0&&g.provenance[e]?.layer===w&&(0,F.jsx)(i,{size:`sm`,variant:`ghost`,"aria-label":`Inherit ${e}`,title:`Remove ${e} from the project entry so it inherits again`,disabled:v,onClick:()=>void y(()=>t.save({agent:oe(e)})),children:`Inherit`})]})},E=(e,t,n)=>(0,F.jsxs)(`div`,{"data-field":e,className:`space-y-1`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2`,children:[t,T(e)]}),n&&(0,F.jsx)(`p`,{className:`text-muted-foreground`,children:n})]});return C((0,F.jsxs)(F.Fragment,{children:[t.session&&(0,F.jsxs)(`p`,{"data-testid":`agent-session-route`,className:`text-muted-foreground`,children:[`New threads go to the live session `,(0,F.jsx)(`span`,{className:`font-mono`,children:t.session}),` (`,(0,F.jsx)(`code`,{children:`gavel edit --session`}),`), ahead of the rule below.`]}),E(`enabled`,(0,F.jsx)(`span`,{title:a,children:(0,F.jsx)(te,{label:`Auto-run new comments`,checked:t.enabled,disabled:v||a!==void 0,onChange:e=>void y(()=>t.setEnabled(e))})})),E(`assign`,(0,F.jsx)(te,{label:`Show the agent as the thread's assignee`,checked:g.agent.assign===!0,disabled:v||!t.enabled,onChange:e=>void y(()=>t.save({agent:{assign:e}}))})),E(`edits`,(0,F.jsx)(f,{size:`sm`,"aria-label":`Agent edits`,value:t.edits,options:[{id:`direct`,label:`Edit directly`,disabled:v},{id:`propose`,label:`Propose patches`,disabled:v}],onChange:e=>void y(()=>t.setEdits(e))}),fe[t.edits]),l&&E(`group`,(0,F.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,F.jsx)(`span`,{children:`Sessions`}),(0,F.jsx)(f,{size:`sm`,"aria-label":`Session grouping`,value:l.value,options:[{id:`shared`,label:`Shared`,disabled:v},{id:`page`,label:`Per page`,disabled:v}],onChange:l.onChange})]})),(0,F.jsx)(`hr`,{className:`border-border`}),(0,F.jsx)(`h2`,{className:`font-semibold`,children:`Run settings`}),(0,F.jsx)(`dl`,{className:`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1`,children:pe.map(e=>(0,F.jsxs)(`div`,{"data-field":e,className:`col-span-3 grid grid-cols-subgrid items-center`,children:[(0,F.jsx)(`dt`,{className:`text-muted-foreground`,children:e}),(0,F.jsx)(`dd`,{className:`min-w-0 truncate font-mono`,title:ae(g.agent,e),children:ae(g.agent,e)||`—`}),(0,F.jsx)(`dd`,{children:T(e)})]},e))}),(0,F.jsx)(O,{agent:g.agent,prompts:s,runtimes:c,busy:v,onSave:e=>void y(()=>t.save({agent:e}))},JSON.stringify(g.agent)),x,S]}))}var P,F,fe,pe;function me(){return(me=e((()=>{P=t(),r(),d(),m(),l(),a(),D(),ce(),de(),F=n(),fe={direct:`The agent edits the project's files itself.`,propose:`The agent must not edit project files: it answers with a patch you apply, stage, reject or ask to revise.`},pe=[`prompt`,`presets`,`spec`,`variables`,`instructions`];try{N.displayName=`CommentAgentPicker`,N.__docgenInfo={description:`Everything about a target's comment agent in one body: auto-run, assignment,
how the agent edits (settable with auto-run off), the prompt, runtime and
instructions, how sessions are grouped, and the live and resumable sessions
to deliver to. Each value shows the settings layer it was resolved from and,
when the layer it saves to (the project's settings file, or its database
layer when it has none) itself sets it, a way to make it inherit again.
Data-agnostic: values and writes come from \`useGavelAgents\`.`,displayName:`CommentAgentPicker`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{agents:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:"The target's comment agent and the writes that change it: the result of `useGavelAgents`.",name:`agents`,required:!0,tags:{},type:{name:`{ agent: { agent: CommentAgent; provenance: Record<string, { layer: string; page?: string; }>; found: boolean; } | undefined; settings: { positions: { kind: "path" | "user" | "parent" | "project"; path?: string; dir: string; files: string[]; db: boolean; }[]; layers: (SettingsRef & { ...; })[]; provenance: Record<.....`}},heading:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:``,name:`heading`,required:!1,tags:{},type:{name:`ReactNode`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Disables every control, for a host that is busy with something else.`,name:`busy`,required:!1,tags:{},type:{name:`boolean`}},autoRunUnavailable:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Why auto-run cannot be switched on yet, such as no page being open; it disables the switch and is shown as its tooltip.`,name:`autoRunUnavailable`,required:!1,tags:{},type:{name:`string`}},prompts:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`The captain prompts the agent can run; without them the prompt is shown but not chosen.`,name:`prompts`,required:!1,tags:{},type:{name:`CommentAgentPromptOption[]`}},runtimes:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`The runtime and model catalog; without it the runtime, model and preset controls are not offered.`,name:`runtimes`,required:!1,tags:{},type:{name:`CommentAgentRuntimeOptions`}},grouping:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`How sessions are grouped, owned by the host.`,name:`grouping`,required:!1,tags:{},type:{name:`{ value: CommentAgentGrouping; onChange: (grouping: CommentAgentGrouping) => void; }`}},sessions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Omitted where only the agent's settings are edited.`,name:`sessions`,required:!1,tags:{},type:{name:`CommentAgentPickerSessions`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}try{CommentAgentPromptOption.displayName=`CommentAgentPromptOption`,CommentAgentPromptOption.__docgenInfo={description:`A captain prompt the comment agent can run.`,displayName:`CommentAgentPromptOption`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}try{CommentAgentRuntimeOptions.displayName=`CommentAgentRuntimeOptions`,CommentAgentRuntimeOptions.__docgenInfo={description:`What the runtime and model controls choose from: the host's model catalog,
the agent runtime families it offers, and the presets a run can layer.`,displayName:`CommentAgentRuntimeOptions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}try{CommentAgentPickerSessions.displayName=`CommentAgentPickerSessions`,CommentAgentPickerSessions.__docgenInfo={description:"The sessions threads can be delivered to, and what choosing one does. Values come from `useAgentSessions`.",displayName:`CommentAgentPickerSessions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}})))()}function he(e,t){return Object.fromEntries(Object.entries({...e,...t}).filter(([,e])=>e!==null))}function ge(e){let t=e.fileBacked?ye:ve,n=e.fileBacked?K:G,[r,i]=(0,I.useState)(e.initial),[a,o]=(0,I.useState)(e.provenance),[s,c]=(0,I.useState)(null),l=(0,I.useCallback)(async t=>{if(e.failSaves){c(e.failSaves);return}let s=t===null?{}:he(r,t);i(s),o(Object.fromEntries(Object.keys(s).map(e=>[e,a[e]??n]))),c(null)},[r,a,e.failSaves,n]);return{agent:{agent:r,provenance:a,found:!0},settings:t,session:e.session,ownLayer:e.fileBacked?{kind:`project`,file:`.gavel.yaml`}:{kind:`project`},enabled:r.enabled===!0,edits:r.edits??`direct`,ready:!0,error:s,save:async e=>(await l(e.agent),{settings:t,agent:{agent:r,provenance:a,found:!0}}),setEnabled:async e=>l({enabled:e}),setEdits:async e=>l({edits:e})}}function _e(e){let{initial:t,provenance:n,failSaves:r,fileBacked:i,session:a,...o}=e,s=ge({initial:t,provenance:n,...r?{failSaves:r}:{},...i?{fileBacked:i}:{},...a?{session:a}:{}});return(0,L.jsx)(N,{agents:s,...o})}var I,L,R,z,B,V,H,U,ve,ye,W,G,K,q,be,xe,Se,J,Y,X,Z,Q,$,Ce;function we(){return(we=e((()=>{I=t(),me(),L=n(),{expect:R,fn:z,userEvent:B,waitFor:V,within:H}=__STORYBOOK_MODULE_TEST__,U={kind:`user`,file:`.gavel.yaml`,location:`/home/example/.gavel.yaml`,config:{}},ve={positions:[{kind:`project`,dir:`/work/site`,files:[],db:!0}],provenance:{},layers:[U,{kind:`project`,location:`db`,config:{}}]},ye={positions:[{kind:`project`,dir:`/work/site`,files:[`.gavel.yaml`],db:!1}],provenance:{},layers:[U,{kind:`project`,file:`.gavel.yaml`,location:`/work/site/.gavel.yaml`,config:{}}]},W={layer:`/home/example/.gavel.yaml`},G={layer:`db:project:`,page:`docs/README.md`},K={layer:`/work/site/.gavel.yaml`,page:`docs/README.md`},q=[{id:`claude`,label:`Claude`,provider:`anthropic`,modes:[{id:`agent`,label:`Agent`,defaultModel:`claude-example`,provider:`anthropic`}]}],be=[{id:`editor-comments`,label:`Editor comments`,description:`Works comment threads in the project directory.`},{id:`doc-review`,label:`Document review`}],xe=[{id:`s-live`,source:`claude`,title:`Review the docs`,model:`claude-example`,cwd:`/work/site`,status:`active`,inCmux:!0,context:{usedTokens:6e4,windowTokens:2e5}},{id:`s-ended`,source:`claude`,title:`Welcome threads`,status:`ended`,managed:!0,resumable:!0,inCmux:!1}],Se={title:`Comments/CommentAgentPicker`,component:_e,parameters:{layout:`padded`},tags:[`autodocs`],args:{initial:{},provenance:{},prompts:be,runtimes:{models:[],families:q},heading:`Comment agent`},decorators:[e=>(0,L.jsx)(`div`,{className:`max-w-md rounded-md border border-border bg-card`,children:(0,L.jsx)(e,{})})]},J={args:{initial:{enabled:!1,edits:`propose`},provenance:{enabled:G,edits:G}},play:async({canvasElement:e})=>{let t=H(e);await R(t.getByRole(`radio`,{name:`Propose patches`})).toBeChecked(),await R(t.getByRole(`switch`,{name:`Auto-run new comments`})).not.toBeChecked(),await B.click(t.getByRole(`radio`,{name:`Edit directly`})),await V(()=>R(t.getByRole(`radio`,{name:`Edit directly`})).toBeChecked()),await R(t.getByRole(`switch`,{name:`Auto-run new comments`})).not.toBeChecked()}},Y={args:{initial:{enabled:!0,assign:!0,prompt:`doc-review`,instructions:`Keep replies short.`,edits:`propose`},provenance:{enabled:W,assign:W,prompt:W,instructions:G,edits:W}},play:async({canvasElement:e})=>{let t=H(e);await R(t.getAllByText(`.gavel.yaml`).length).toBeGreaterThanOrEqual(4),await R(t.getByRole(`button`,{name:`Inherit instructions`})).toBeInTheDocument(),await R(t.queryByRole(`button`,{name:`Inherit prompt`})).toBeNull()}},X={args:{fileBacked:!0,initial:{enabled:!0,prompt:`doc-review`,instructions:`Keep replies short.`},provenance:{enabled:W,prompt:K,instructions:K}},play:async({canvasElement:e})=>{let t=H(e);await R(t.getByRole(`button`,{name:`Inherit prompt`})).toBeInTheDocument(),await R(t.queryByRole(`button`,{name:`Inherit enabled`})).toBeNull(),await B.click(t.getByRole(`button`,{name:`Inherit prompt`})),await V(()=>R(t.queryByRole(`button`,{name:`Inherit prompt`})).toBeNull())}},Z={args:{initial:{enabled:!0},provenance:{enabled:G},session:`claude-site-1`},play:async({canvasElement:e})=>{await R(H(e).getByTestId(`agent-session-route`)).toHaveTextContent(`claude-site-1`)}},Q={args:{initial:{enabled:!1,edits:`direct`},provenance:{edits:G},failSaves:`403 only humans can change comment agents`},play:async({canvasElement:e})=>{let t=H(e);await B.click(t.getByRole(`radio`,{name:`Propose patches`})),await R(await t.findByRole(`alert`)).toHaveTextContent(`403 only humans can change comment agents`),await R(t.getByRole(`radio`,{name:`Edit directly`})).toBeChecked()}},$={args:{initial:{enabled:!0,edits:`direct`,group:`docs`},provenance:{enabled:G,edits:G,group:G},grouping:{value:`page`,onChange:z()},sessions:{items:xe,state:`ready`,selectedId:`s-live`,onSelect:z(),onNew:z(),assignAll:{count:2,onSession:z(),onNew:z()}}}},Ce=[`ProposeWithAutoRunOff`,`InheritedValues`,`FileBackedProject`,`RoutedToSession`,`SaveError`,`WithSessions`],J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      enabled: false,
      edits: "propose"
    },
    provenance: {
      enabled: PROJECT,
      edits: PROJECT
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", {
      name: "Propose patches"
    })).toBeChecked();
    await expect(canvas.getByRole("switch", {
      name: "Auto-run new comments"
    })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("radio", {
      name: "Edit directly"
    }));
    await waitFor(() => expect(canvas.getByRole("radio", {
      name: "Edit directly"
    })).toBeChecked());
    await expect(canvas.getByRole("switch", {
      name: "Auto-run new comments"
    })).not.toBeChecked();
  }
}`,...J.parameters?.docs?.source},description:{story:`Auto-run is off, yet how the agent edits is still saved: choosing "Edit directly" leaves auto-run off.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      enabled: true,
      assign: true,
      prompt: "doc-review",
      instructions: "Keep replies short.",
      edits: "propose"
    },
    provenance: {
      enabled: USER,
      assign: USER,
      prompt: USER,
      instructions: PROJECT,
      edits: USER
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(".gavel.yaml").length).toBeGreaterThanOrEqual(4);
    await expect(canvas.getByRole("button", {
      name: "Inherit instructions"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", {
      name: "Inherit prompt"
    })).toBeNull();
  }
}`,...Y.parameters?.docs?.source},description:{story:'Values the user\'s own `.gavel.yaml` sets show that file; the project layer can override them but cannot "inherit" what it does not hold.',...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    fileBacked: true,
    initial: {
      enabled: true,
      prompt: "doc-review",
      instructions: "Keep replies short."
    },
    provenance: {
      enabled: USER,
      prompt: PROJECT_FILE,
      instructions: PROJECT_FILE
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Inherit prompt"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", {
      name: "Inherit enabled"
    })).toBeNull();
    await userEvent.click(canvas.getByRole("button", {
      name: "Inherit prompt"
    }));
    await waitFor(() => expect(canvas.queryByRole("button", {
      name: "Inherit prompt"
    })).toBeNull());
  }
}`,...X.parameters?.docs?.source},description:{story:`A project with its own .gavel.yaml: its values name that file, and Inherit removes the field from it, since gavel refuses a database layer beside it.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      enabled: true
    },
    provenance: {
      enabled: PROJECT
    },
    session: "claude-site-1"
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByTestId("agent-session-route")).toHaveTextContent("claude-site-1");
  }
}`,...Z.parameters?.docs?.source},description:{story:"`gavel edit --session` routes every new thread to one live session, ahead of the rule.",...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      enabled: false,
      edits: "direct"
    },
    provenance: {
      edits: PROJECT
    },
    failSaves: "403 only humans can change comment agents"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", {
      name: "Propose patches"
    }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("403 only humans can change comment agents");
    await expect(canvas.getByRole("radio", {
      name: "Edit directly"
    })).toBeChecked();
  }
}`,...Q.parameters?.docs?.source},description:{story:`A refused write is shown and the previous choice stays.`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      enabled: true,
      edits: "direct",
      group: "docs"
    },
    provenance: {
      enabled: PROJECT,
      edits: PROJECT,
      group: PROJECT
    },
    grouping: {
      value: "page",
      onChange: fn()
    },
    sessions: {
      items: sessions,
      state: "ready",
      selectedId: "s-live",
      onSelect: fn(),
      onNew: fn(),
      assignAll: {
        count: 2,
        onSession: fn(),
        onNew: fn()
      }
    }
  }
}`,...$.parameters?.docs?.source},description:{story:`Auto-run on, grouping, and the live and resumable sessions threads can be delivered to.`,...$.parameters?.docs?.description}}}})))()}we();export{X as FileBackedProject,Y as InheritedValues,J as ProposeWithAutoRunOff,Z as RoutedToSession,Q as SaveError,$ as WithSessions,Ce as __namedExportsOrder,Se as default};
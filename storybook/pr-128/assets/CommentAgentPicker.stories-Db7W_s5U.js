import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Lt as r,n as i}from"./icons-ClABX2sF.js";import{n as a,t as o}from"./utils-DLaO06-s.js";import{n as s,t as c}from"./button-CLtlb14M.js";import{n as l,t as u}from"./AgentIdentity-C1yl8t0r.js";import{n as d,t as f}from"./Badge-BjP6ZnAv.js";import{n as p,t as m}from"./SegmentedControl-iIgUhUc8.js";import{n as h,t as ee}from"./InputField-V-HcLB8q.js";import{n as g,t as te}from"./Switch-Cg492Q2O.js";import{n as _,t as v}from"./Field-Dwd8SXQ4.js";import{n as y,t as b}from"./select-DOwpIXhP.js";import{n as x,t as S}from"./PromptRunEditor-CRS23LkG.js";function C(){return(C=e((()=>{})))()}function w(e){return e.file?e.location:`db:${e.kind}:${e.path??``}`}function ne(e,t){let n=e.layers.find(e=>se(e,t));return n&&w(n)}function re(e){let{settings:t,provenance:n,field:r}=e,i=n[r];if(!i)return{label:`default`,title:`No settings layer sets this field, so gavel's built-in default applies`,set:!1};let a=t.layers.find(e=>w(e)===i.layer);if(!a)throw Error(`the ${r} of the comment agent comes from ${i.layer}, which is not one of the target's settings layers`);return{label:`${a.file?a.location.split(`/`).pop():`DB`}${i.page?` (page)`:``}`,title:i.page?`${i.layer} · ${i.page}`:i.layer,set:!0}}function ie(e,t){switch(t){case`enabled`:return e.enabled?`on`:`off`;case`assign`:return e.assign?`yes`:`no`;case`edits`:return e.edits??`direct`;case`prompt`:return e.prompt??`editor-comments`;case`presets`:return(e.presets??[]).join(`, `);case`spec`:return typeof e.spec?.model==`string`?e.spec.model:Object.keys(e.spec??{}).length?JSON.stringify(e.spec):``;case`variables`:return Object.keys(e.variables??{}).length?JSON.stringify(e.variables):``;case`instructions`:return e.instructions??``;case`group`:return e.group??``}}function T(e){return{prompt:e.prompt??`editor-comments`,presets:e.presets??[],spec:e.spec??{},variables:e.variables??{},instructions:e.instructions??``}}function E(e,t){let n=T(e),r=Object.keys(t).filter(e=>JSON.stringify(t[e])!==JSON.stringify(n[e]));return Object.fromEntries(r.map(e=>[e,ce(t[e])?null:t[e]]))}function ae(e){return{[e]:null}}function D(e){return e.resumable?`resumes`:e.status!==`ended`&&!e.managed&&!e.inCmux?`not in cmux`:e.status??`running`}function oe(e){return e.context?Math.round(e.context.usedTokens/e.context.windowTokens*100):void 0}var se,ce;function O(){return(O=e((()=>{C(),se=(e,t)=>e.kind===t.kind&&(e.path??``)===(t.path??``)&&(e.file??``)===(t.file??``),ce=e=>typeof e==`string`?e.trim()===``:Array.isArray(e)?e.length===0:Object.keys(e).length===0})))()}function k({agent:e,prompts:t,runtimes:n,busy:r,onSave:i}){let a=(0,A.useId)(),[o,s]=(0,A.useState)(()=>T(e)),[l,u]=(0,A.useState)(!0),d=E(e,o),f=Object.keys(d).length>0,p=t?.find(e=>e.id===o.prompt),m=t&&[...t.map(e=>({value:e.id,label:e.label})),...p?[]:[{value:o.prompt,label:`${o.prompt} (not in the catalog)`}]];return(0,j.jsxs)(`div`,{className:`space-y-3`,children:[m&&(0,j.jsx)(v,{label:`Prompt`,htmlFor:`${a}-prompt`,helper:p?.description??`The captain prompt that works each new thread.`,children:(0,j.jsx)(b,{id:`${a}-prompt`,value:o.prompt,options:m,onChange:e=>s({...o,prompt:e.currentTarget.value,variables:{}})})}),n&&(0,j.jsx)(S,{value:{spec:o.spec,presets:o.presets,variables:o.variables},onChange:e=>s({...o,spec:e.spec??{},presets:e.presets??[],variables:e.variables??{}}),models:n.models,families:n.families,presets:n.presets,variablesSchema:p?.variablesSchema,onVariablesValidityChange:u},o.prompt),(0,j.jsx)(v,{label:`Instructions`,htmlFor:`${a}-instructions`,helper:`Appended to every thread the agent is given.`,children:(0,j.jsx)(ee,{as:`textarea`,id:`${a}-instructions`,rows:3,value:o.instructions,onChange:e=>s({...o,instructions:e})})}),(0,j.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,j.jsx)(c,{variant:`ghost`,size:`sm`,disabled:r||!f,onClick:()=>s(T(e)),children:`Reset`}),(0,j.jsx)(c,{size:`sm`,disabled:r||!f||!l,onClick:()=>i(d),children:`Save run settings`})]})]})}var A,j;function le(){return(le=e((()=>{A=t(),s(),_(),h(),y(),x(),O(),j=n();try{k.displayName=`CommentAgentRunSettings`,k.__docgenInfo={description:"The prompt, runtime, presets, variables and instructions of the comment agent, edited as one form. Mount with a `key` per resolved agent.",displayName:`CommentAgentRunSettings`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,methods:[],props:{agent:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:`The agent as resolved now; the form starts from it and saves only what it changes.`,name:`agent`,required:!0,tags:{},type:{name:`CommentAgent`}},prompts:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`prompts`,required:!1,tags:{},type:{name:`CommentAgentPromptOption[] | undefined`}},runtimes:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`runtimes`,required:!1,tags:{},type:{name:`CommentAgentRuntimeOptions | undefined`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`busy`,required:!0,tags:{},type:{name:`boolean`}},onSave:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentRunSettings.tsx`,name:`TypeLiteral`}],description:``,name:`onSave`,required:!0,tags:{},type:{name:`(patch: CommentAgentPatch) => void`}}},tags:{}}}catch{}})))()}function ue(e){let{session:t,pressed:n,disabled:i,onSelect:a,assignAll:o}=e,s=oe(t);return(0,N.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,N.jsx)(c,{variant:`ghost`,size:`sm`,className:`h-auto min-w-0 flex-1 justify-start gap-2 py-2 text-left aria-pressed:bg-accent`,"aria-label":de(t),disabled:i,...n===void 0?{}:{"aria-pressed":n},title:`${t.title}\n${t.cwd??``}\n${t.id}`,onClick:a,children:(0,N.jsxs)(`span`,{className:`flex min-w-0 flex-1 flex-col gap-1`,children:[(0,N.jsx)(`span`,{className:`whitespace-normal break-words`,children:t.title}),(0,N.jsxs)(`span`,{className:`flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground`,children:[(0,N.jsx)(u,{...t.model?{model:t.model}:{provider:t.source},identityId:t.id}),(0,N.jsx)(`span`,{className:`truncate`,children:t.cwd?.split(`/`).filter(Boolean).at(-1)??t.id.slice(0,12)}),s!==void 0&&(0,N.jsxs)(`span`,{className:`tabular-nums`,title:`Context window in use`,children:[s,`%`]}),(0,N.jsx)(f,{variant:`soft`,tone:t.resumable?`neutral`:`info`,clickToCopy:!1,children:D(t)}),n&&(0,N.jsx)(`span`,{children:`Selected`})]})]})}),o&&(0,N.jsx)(c,{size:`icon`,variant:`ghost`,className:`size-8 shrink-0`,"aria-label":`Assign all to ${t.title}`,title:`Assign all open threads to ${t.title}`,disabled:o.disabled,onClick:o.onAssign,children:(0,N.jsx)(r,{className:`size-4`,"aria-hidden":!0})})]})}function M({sessions:e,busy:t,children:n}){let{items:r,state:i,error:a,selectedId:o,onSelect:s,onNew:l,onAll:u,assignAll:d}=e;return(0,N.jsxs)(`section`,{className:`space-y-2`,"aria-label":`Active sessions`,children:[u&&(0,N.jsx)(c,{size:`sm`,variant:`outline`,className:`w-full`,onClick:u,children:`All sessions…`}),l&&(0,N.jsxs)(c,{variant:`ghost`,size:`sm`,disabled:t,"aria-pressed":l!==void 0&&o===void 0,"aria-label":`New session`,className:`h-auto w-full justify-start gap-2 py-2 text-left`,onClick:l,children:[(0,N.jsx)(`span`,{className:`truncate`,children:`New session`}),(0,N.jsx)(`span`,{className:`text-muted-foreground`,children:`runs the agent above`})]}),d&&(0,N.jsxs)(`div`,{className:`space-y-1`,children:[(0,N.jsx)(c,{size:`sm`,variant:`outline`,className:`w-full`,"aria-label":`Assign all to a new session`,disabled:t||d.count===0,onClick:d.onNew,children:`Assign all to a new session`}),(0,N.jsx)(`p`,{className:`text-muted-foreground`,children:d.count===0?d.emptyLabel??`No open threads`:`${d.count} open ${d.count===1?`thread`:`threads`}`})]}),(0,N.jsx)(`h2`,{className:`font-semibold`,children:`Active sessions`}),n,i===`loading`&&(0,N.jsx)(`p`,{role:`status`,className:`text-muted-foreground`,children:`Loading active sessions…`}),i===`ready`&&r.length===0&&(0,N.jsx)(`p`,{className:`text-muted-foreground`,children:`No active sessions.`}),i===`error`&&a&&(0,N.jsx)(`p`,{className:`break-words text-destructive`,children:a}),r.map(e=>(0,N.jsx)(ue,{session:e,pressed:o!==void 0||l?o===e.id:void 0,disabled:t,onSelect:()=>s(e),assignAll:d&&{disabled:t||d.count===0,onAssign:()=>d.onSession(e)}},e.id))]})}var N,de;function fe(){return(fe=e((()=>{s(),i(),d(),l(),O(),N=n(),de=e=>`Use session ${e.title}`;try{M.displayName=`CommentAgentSessions`,M.__docgenInfo={description:`The live and resumable sessions section of the comment agent picker.`,displayName:`CommentAgentSessions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,methods:[],props:{sessions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,name:`TypeLiteral`}],description:``,name:`sessions`,required:!0,tags:{},type:{name:`CommentAgentPickerSessions`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentSessions.tsx`,name:`TypeLiteral`}],description:``,name:`busy`,required:!0,tags:{},type:{name:`boolean`}}},tags:{}}}catch{}})))()}function P(e){let{agents:t,heading:n,busy:r=!1,autoRunUnavailable:i,prompts:a,runtimes:s,grouping:l,sessions:u,className:d}=e,[p,h]=(0,F.useState)(!1),[ee,g]=(0,F.useState)(null),_=t.agent,v=t.settings,y=r||p,b=async e=>{h(!0),g(null);try{await e()}catch(e){g(e instanceof Error?e.message:String(e))}finally{h(!1)}},x=ee??t.error,S=x&&(0,I.jsx)(`p`,{role:`alert`,className:`break-words text-destructive`,children:x}),C=u&&(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`hr`,{className:`border-border`}),(0,I.jsx)(M,{sessions:u,busy:y})]}),w=e=>(0,I.jsxs)(`div`,{className:o(`space-y-3 p-3 text-xs`,d),children:[n&&(0,I.jsx)(`h2`,{className:`font-semibold`,children:n}),e]});if(!t.ready||!_||!v)return w((0,I.jsxs)(I.Fragment,{children:[t.error?S:(0,I.jsx)(`p`,{role:`status`,className:`text-muted-foreground`,children:`Loading the comment agent…`}),C]}));let T=t.ownLayer&&ne(v,t.ownLayer),E=e=>{let n=re({settings:v,provenance:_.provenance,field:e});return(0,I.jsxs)(`span`,{className:`flex shrink-0 items-center gap-1`,children:[(0,I.jsx)(f,{tone:`neutral`,variant:`soft`,clickToCopy:!1,children:(0,I.jsx)(`span`,{title:n.title,children:n.label})}),T!==void 0&&_.provenance[e]?.layer===T&&(0,I.jsx)(c,{size:`sm`,variant:`ghost`,"aria-label":`Inherit ${e}`,title:`Remove ${e} from the project entry so it inherits again`,disabled:y,onClick:()=>void b(()=>t.save({agent:ae(e)})),children:`Inherit`})]})},D=(e,t,n)=>(0,I.jsxs)(`div`,{"data-field":e,className:`space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2`,children:[t,E(e)]}),n&&(0,I.jsx)(`p`,{className:`text-muted-foreground`,children:n})]});return w((0,I.jsxs)(I.Fragment,{children:[t.session&&(0,I.jsxs)(`p`,{"data-testid":`agent-session-route`,className:`text-muted-foreground`,children:[`New threads go to the live session `,(0,I.jsx)(`span`,{className:`font-mono`,children:t.session}),` (`,(0,I.jsx)(`code`,{children:`gavel edit --session`}),`), ahead of the rule below.`]}),D(`enabled`,(0,I.jsx)(`span`,{title:i,children:(0,I.jsx)(te,{label:`Auto-run new comments`,checked:t.enabled,disabled:y||i!==void 0,onChange:e=>void b(()=>t.setEnabled(e))})})),D(`assign`,(0,I.jsx)(te,{label:`Show the agent as the thread's assignee`,checked:_.agent.assign===!0,disabled:y||!t.enabled,onChange:e=>void b(()=>t.save({agent:{assign:e}}))})),D(`edits`,(0,I.jsx)(m,{size:`sm`,"aria-label":`Agent edits`,value:t.edits,options:[{id:`direct`,label:`Edit directly`,disabled:y},{id:`propose`,label:`Propose patches`,disabled:y}],onChange:e=>void b(()=>t.setEdits(e))}),pe[t.edits]),l&&D(`group`,(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(`span`,{children:`Sessions`}),(0,I.jsx)(m,{size:`sm`,"aria-label":`Session grouping`,value:l.value,options:[{id:`shared`,label:`Shared`,disabled:y},{id:`page`,label:`Per page`,disabled:y}],onChange:l.onChange})]})),(0,I.jsx)(`hr`,{className:`border-border`}),(0,I.jsx)(`h2`,{className:`font-semibold`,children:`Run settings`}),(0,I.jsx)(`dl`,{className:`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1`,children:me.map(e=>(0,I.jsxs)(`div`,{"data-field":e,className:`col-span-3 grid grid-cols-subgrid items-center`,children:[(0,I.jsx)(`dt`,{className:`text-muted-foreground`,children:e}),(0,I.jsx)(`dd`,{className:`min-w-0 truncate font-mono`,title:ie(_.agent,e),children:ie(_.agent,e)||`—`}),(0,I.jsx)(`dd`,{children:E(e)})]},e))}),(0,I.jsx)(k,{agent:_.agent,prompts:a,runtimes:s,busy:y,onSave:e=>void b(()=>t.save({agent:e}))},JSON.stringify(_.agent)),S,C]}))}var F,I,pe,me;function he(){return(he=e((()=>{F=t(),s(),p(),g(),d(),a(),O(),le(),fe(),I=n(),pe={direct:`The agent edits the project's files itself.`,propose:`The agent must not edit project files: it answers with a patch you apply, stage, reject or ask to revise.`},me=[`prompt`,`presets`,`spec`,`variables`,`instructions`];try{P.displayName=`CommentAgentPicker`,P.__docgenInfo={description:`Everything about a target's comment agent in one body: auto-run, assignment,
how the agent edits (settable with auto-run off), the prompt, runtime and
instructions, how sessions are grouped, and the live and resumable sessions
to deliver to. Each value shows the settings layer it was resolved from and,
when the layer it saves to (the project's settings file, or its database
layer when it has none) itself sets it, a way to make it inherit again.
Data-agnostic: values and writes come from \`useGavelAgents\`.`,displayName:`CommentAgentPicker`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{agents:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:"The target's comment agent and the writes that change it: the result of `useGavelAgents`.",name:`agents`,required:!0,tags:{},type:{name:`{ agent: { agent: CommentAgent; provenance: Record<string, { layer: string; page?: string; }>; found: boolean; } | undefined; settings: { positions: { kind: "path" | "user" | "parent" | "project"; path?: string; dir: string; files: string[]; db: boolean; }[]; layers: (SettingsRef & { ...; })[]; provenance: Record<.....`}},heading:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:``,name:`heading`,required:!1,tags:{},type:{name:`ReactNode`}},busy:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Disables every control, for a host that is busy with something else.`,name:`busy`,required:!1,tags:{},type:{name:`boolean`}},autoRunUnavailable:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Why auto-run cannot be switched on yet, such as no page being open; it disables the switch and is shown as its tooltip.`,name:`autoRunUnavailable`,required:!1,tags:{},type:{name:`string`}},prompts:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`The captain prompts the agent can run; without them the prompt is shown but not chosen.`,name:`prompts`,required:!1,tags:{},type:{name:`CommentAgentPromptOption[]`}},runtimes:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`The runtime and model catalog; without it the runtime, model and preset controls are not offered.`,name:`runtimes`,required:!1,tags:{},type:{name:`CommentAgentRuntimeOptions`}},grouping:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`How sessions are grouped, owned by the host.`,name:`grouping`,required:!1,tags:{},type:{name:`{ value: CommentAgentGrouping; onChange: (grouping: CommentAgentGrouping) => void; }`}},sessions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:`Omitted where only the agent's settings are edited.`,name:`sessions`,required:!1,tags:{},type:{name:`CommentAgentPickerSessions`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}try{CommentAgentPromptOption.displayName=`CommentAgentPromptOption`,CommentAgentPromptOption.__docgenInfo={description:`A captain prompt the comment agent can run.`,displayName:`CommentAgentPromptOption`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}try{CommentAgentRuntimeOptions.displayName=`CommentAgentRuntimeOptions`,CommentAgentRuntimeOptions.__docgenInfo={description:`What the runtime and model controls choose from: the host's model catalog,
the agent runtime families it offers, and the presets a run can layer.`,displayName:`CommentAgentRuntimeOptions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}try{CommentAgentPickerSessions.displayName=`CommentAgentPickerSessions`,CommentAgentPickerSessions.__docgenInfo={description:"The sessions threads can be delivered to, and what choosing one does. Values come from `useAgentSessions`.",displayName:`CommentAgentPickerSessions`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/comments/gavel/CommentAgentPicker.tsx`,methods:[],props:{},tags:{}}}catch{}})))()}function ge(e,t){return Object.fromEntries(Object.entries({...e,...t}).filter(([,e])=>e!==null))}function _e(e){let t=e.fileBacked?be:ye,n=e.fileBacked?q:K,[r,i]=(0,L.useState)(e.initial),[a,o]=(0,L.useState)(e.provenance),[s,c]=(0,L.useState)(null),l=(0,L.useCallback)(async t=>{if(e.failSaves){c(e.failSaves);return}let s=t===null?{}:ge(r,t);i(s),o(Object.fromEntries(Object.keys(s).map(e=>[e,a[e]??n]))),c(null)},[r,a,e.failSaves,n]);return{agent:{agent:r,provenance:a,found:!0},settings:t,session:e.session,ownLayer:e.fileBacked?{kind:`project`,file:`.gavel.yaml`}:{kind:`project`},enabled:r.enabled===!0,edits:r.edits??`direct`,ready:!0,error:s,save:async e=>(await l(e.agent),{settings:t,agent:{agent:r,provenance:a,found:!0}}),setEnabled:async e=>l({enabled:e}),setEdits:async e=>l({edits:e})}}function ve(e){let{initial:t,provenance:n,failSaves:r,fileBacked:i,session:a,...o}=e,s=_e({initial:t,provenance:n,...r?{failSaves:r}:{},...i?{fileBacked:i}:{},...a?{session:a}:{}});return(0,R.jsx)(P,{agents:s,...o})}var L,R,z,B,V,H,U,W,ye,be,G,K,q,xe,Se,Ce,we,J,Y,X,Z,Q,$,Te;function Ee(){return(Ee=e((()=>{L=t(),he(),R=n(),{expect:z,fn:B,userEvent:V,waitFor:H,within:U}=__STORYBOOK_MODULE_TEST__,W={kind:`user`,file:`.gavel.yaml`,location:`/home/example/.gavel.yaml`,config:{}},ye={positions:[{kind:`project`,dir:`/work/site`,files:[],db:!0}],provenance:{},layers:[W,{kind:`project`,location:`db`,config:{}}]},be={positions:[{kind:`project`,dir:`/work/site`,files:[`.gavel.yaml`],db:!1}],provenance:{},layers:[W,{kind:`project`,file:`.gavel.yaml`,location:`/work/site/.gavel.yaml`,config:{}}]},G={layer:`/home/example/.gavel.yaml`},K={layer:`db:project:`,page:`docs/README.md`},q={layer:`/work/site/.gavel.yaml`,page:`docs/README.md`},xe=[{id:`claude`,label:`Claude`,provider:`anthropic`,modes:[{id:`agent`,label:`Agent`,defaultModel:`claude-example`,provider:`anthropic`}]}],Se=[{id:`editor-comments`,label:`Editor comments`,description:`Works comment threads in the project directory.`},{id:`doc-review`,label:`Document review`}],Ce=[{id:`s-live`,source:`claude`,title:`Review the docs`,model:`claude-example`,cwd:`/work/site`,status:`active`,inCmux:!0,context:{usedTokens:6e4,windowTokens:2e5}},{id:`s-ended`,source:`claude`,title:`Welcome threads`,status:`ended`,managed:!0,resumable:!0,inCmux:!1}],we={title:`Comments/CommentAgentPicker`,component:ve,parameters:{layout:`padded`},tags:[`autodocs`],args:{initial:{},provenance:{},prompts:Se,runtimes:{models:[],families:xe},heading:`Comment agent`},decorators:[e=>(0,R.jsx)(`div`,{className:`max-w-md rounded-md border border-border bg-card`,children:(0,R.jsx)(e,{})})]},J={args:{initial:{enabled:!1,edits:`propose`},provenance:{enabled:K,edits:K}},play:async({canvasElement:e})=>{let t=U(e);await z(t.getByRole(`radio`,{name:`Propose patches`})).toBeChecked(),await z(t.getByRole(`switch`,{name:`Auto-run new comments`})).not.toBeChecked(),await V.click(t.getByRole(`radio`,{name:`Edit directly`})),await H(()=>z(t.getByRole(`radio`,{name:`Edit directly`})).toBeChecked()),await z(t.getByRole(`switch`,{name:`Auto-run new comments`})).not.toBeChecked()}},Y={args:{initial:{enabled:!0,assign:!0,prompt:`doc-review`,instructions:`Keep replies short.`,edits:`propose`},provenance:{enabled:G,assign:G,prompt:G,instructions:K,edits:G}},play:async({canvasElement:e})=>{let t=U(e);await z(t.getAllByText(`.gavel.yaml`).length).toBeGreaterThanOrEqual(4),await z(t.getByRole(`button`,{name:`Inherit instructions`})).toBeInTheDocument(),await z(t.queryByRole(`button`,{name:`Inherit prompt`})).toBeNull()}},X={args:{fileBacked:!0,initial:{enabled:!0,prompt:`doc-review`,instructions:`Keep replies short.`},provenance:{enabled:G,prompt:q,instructions:q}},play:async({canvasElement:e})=>{let t=U(e);await z(t.getByRole(`button`,{name:`Inherit prompt`})).toBeInTheDocument(),await z(t.queryByRole(`button`,{name:`Inherit enabled`})).toBeNull(),await V.click(t.getByRole(`button`,{name:`Inherit prompt`})),await H(()=>z(t.queryByRole(`button`,{name:`Inherit prompt`})).toBeNull())}},Z={args:{initial:{enabled:!0},provenance:{enabled:K},session:`claude-site-1`},play:async({canvasElement:e})=>{await z(U(e).getByTestId(`agent-session-route`)).toHaveTextContent(`claude-site-1`)}},Q={args:{initial:{enabled:!1,edits:`direct`},provenance:{edits:K},failSaves:`403 only humans can change comment agents`},play:async({canvasElement:e})=>{let t=U(e);await V.click(t.getByRole(`radio`,{name:`Propose patches`})),await z(await t.findByRole(`alert`)).toHaveTextContent(`403 only humans can change comment agents`),await z(t.getByRole(`radio`,{name:`Edit directly`})).toBeChecked()}},$={args:{initial:{enabled:!0,edits:`direct`,group:`docs`},provenance:{enabled:K,edits:K,group:K},grouping:{value:`page`,onChange:B()},sessions:{items:Ce,state:`ready`,selectedId:`s-live`,onSelect:B(),onNew:B(),assignAll:{count:2,onSession:B(),onNew:B()}}}},Te=[`ProposeWithAutoRunOff`,`InheritedValues`,`FileBackedProject`,`RoutedToSession`,`SaveError`,`WithSessions`],J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Auto-run on, grouping, and the live and resumable sessions threads can be delivered to.`,...$.parameters?.docs?.description}}}})))()}Ee();export{X as FileBackedProject,Y as InheritedValues,J as ProposeWithAutoRunOff,Z as RoutedToSession,Q as SaveError,$ as WithSessions,Te as __namedExportsOrder,we as default};
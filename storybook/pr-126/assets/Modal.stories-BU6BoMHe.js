import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{t as r}from"./react-dom-Dlw-Hk_P.js";import{n as i,t as a}from"./button-3J0br0ze.js";import{i as o,r as s}from"./loading-DGvF0cjn.js";import{n as c,t as l}from"./zIndex-BWOyxFwV.js";import{n as u,t as d}from"./Modal-BfTtpwyX.js";import{n as f,t as p}from"./InputField-DiYZ4Y7D.js";import{r as m}from"./collections-CwGo4MXl.js";function h(){let e=(0,g.useContext)(_);if(!e)throw Error(`useModal must be used within a <ModalProvider>`);return e}var g,_;function v(){return(v=e((()=>{g=t(),_=(0,g.createContext)(null)})))()}function y(e){return`clicky.modal.${encodeURIComponent(e)}:`}function b(e,t){window.sessionStorage.setItem(e,JSON.stringify({...t,version:w}))}function x(e){let t=window.sessionStorage;return Array.from({length:t.length},(e,n)=>t.key(n)).filter(t=>t!==null&&t.startsWith(e))}function S(e,t){let n=C(e),r=Object.hasOwn(t,n.formKey)?t[n.formKey]:void 0;if(!r?.recovery)throw Error(`The saved form is unavailable`);return{form:r,record:n,draft:r.recovery.restore(n.draft)}}function ee(e){b(e,{...C(e),status:`rejected`})}function C(e){let t=window.sessionStorage.getItem(e);if(t===null)throw Error(`Saved draft is missing`);let n=JSON.parse(t);if(!m(n)||n.version!==w||typeof n.formKey!=`string`||!m(n.draft)||n.status!==`pending`&&n.status!==`rejected`)throw Error(`Invalid saved draft`);return{version:w,formKey:n.formKey,draft:n.draft,status:n.status}}var w;function T(){return(T=e((()=>{w=1})))()}function E(e){return(0,j.jsx)(D,{...e},e.scope)}function D({scope:e,forms:t,children:n}){let r=y(e),i=(0,k.useRef)(t);i.current=t;let o=(0,k.useRef)(!1),s=(0,k.useRef)(new Map),[l,u]=(0,k.useState)([]),[d,f]=(0,k.useState)([]),p=(0,k.useCallback)(e=>{s.current.set(e.id,e),u(Array.from(s.current.values()))},[]);(0,k.useLayoutEffect)(()=>(o.current=!0,()=>{o.current=!1}),[]),(0,k.useEffect)(()=>{let e=[];try{for(let t of x(r))try{let{form:e,record:n,draft:r}=S(t,i.current);p({id:t,storageKey:t,formKey:n.formKey,form:e,initialDraft:r,state:`recoverable`,error:n.status===`pending`?N:P})}catch{e.push({storageKey:t,message:`Could not restore a saved draft.`})}}catch{Object.values(i.current).some(e=>e.recovery)&&e.push({message:`Could not read saved drafts from this tab.`})}f(e)},[r,p]);let m=(0,k.useCallback)((e,n)=>{let i=Object.hasOwn(t,e)?t[e]:void 0;if(!i)throw Error(`Modal form "${e}" is not registered`);let a=r+crypto.getRandomValues(new Uint32Array(4)).join(`-`);p({id:a,formKey:e,form:i,initialDraft:n,state:`open`})},[t,r,p]),h=(0,k.useMemo)(()=>({openModal:m}),[m]);function g(e){try{window.sessionStorage.removeItem(e),f(t=>t.filter(t=>t.storageKey!==e))}catch{f(t=>[...t.filter(t=>t.storageKey!==e),{storageKey:e,message:`Could not clear the saved draft from this tab.`}])}}function v(e){e.storageKey&&g(e.storageKey),s.current.delete(e.id),u(Array.from(s.current.values()))}async function C(e,{draft:t,request:n,onSuccess:r}){let i=s.current.get(e);if(!o.current||i?.state!==`open`)return;let{error:a,...c}=i,{form:l,formKey:u}=c,d={...c,state:`pending`};if(l.recovery)try{b(e,{formKey:u,draft:l.recovery.serialize(t),status:`pending`}),d.storageKey=e}catch{p({...i,error:`Could not save the draft in this tab.`});return}p(d);let f;try{f=await n()}catch{}if(!o.current)return;if(f?.status===`success`){v(d),await r?.(f.value);return}let m=f?.status===`rejected`?f.error||P:f?.error?`${N} ${f.error}`:N;if(d.storageKey&&f?.status===`rejected`)try{ee(d.storageKey)}catch{m+=` Could not save the submission result in this tab.`}p({...d,state:`open`,error:m})}return(0,j.jsxs)(_.Provider,{value:h,children:[n,l.map(e=>e.state!==`recoverable`&&(0,j.jsx)(e.form.Form,{initialDraft:e.initialDraft,submit:t=>C(e.id,t),modalProps:{open:!0,onClose:()=>{let t=s.current.get(e.id);t?.state===`open`&&v(t)},title:e.form.title,minimized:e.state===`pending`,error:e.error}},e.id)),typeof document<`u`&&(0,A.createPortal)((0,j.jsxs)(`div`,{className:`pointer-events-none fixed inset-x-4 bottom-4 flex max-h-[50dvh] flex-col gap-density-2 overflow-auto sm:left-auto sm:w-80`,style:{zIndex:c.popover},children:[l.map(e=>e.state!==`open`&&(0,j.jsx)(O,{entry:e,onRestore:()=>p({...e,state:`open`}),onDiscard:()=>v(e)},e.id)),d.map(({storageKey:e,message:t})=>(0,j.jsxs)(`div`,{className:`${I} pointer-events-auto`,children:[(0,j.jsx)(`div`,{role:`alert`,children:t}),e&&(0,j.jsx)(a,{type:`button`,size:`sm`,variant:`outline`,className:`mt-density-2`,onClick:()=>g(e),children:`Discard saved draft`})]},e??t))]}),document.body)]})}function O({entry:e,onRestore:t,onDiscard:n}){return e.state===`pending`?(0,j.jsxs)(`div`,{"data-slot":`modal-submission-card`,role:`status`,className:`${L} flex items-center gap-density-2`,children:[(0,j.jsx)(s,{className:`size-4 motion-reduce:hidden`}),(0,j.jsxs)(`div`,{className:`min-w-0`,children:[(0,j.jsx)(`div`,{className:`wrap-break-word font-medium`,children:e.form.title}),(0,j.jsx)(`div`,{className:`opacity-80`,children:`Submitting…`})]})]}):(0,j.jsxs)(`div`,{"data-slot":`modal-submission-card`,className:`${I} pointer-events-auto`,children:[(0,j.jsx)(`div`,{className:`wrap-break-word font-medium`,children:e.form.title}),(0,j.jsx)(`div`,{className:`text-muted-foreground`,children:e.error===N?M:`Submission rejected`}),(0,j.jsxs)(`div`,{className:`mt-density-2 flex flex-wrap gap-density-2`,children:[(0,j.jsx)(a,{type:`button`,size:`sm`,variant:`outline`,onClick:t,children:`Restore draft`}),(0,j.jsx)(a,{type:`button`,size:`sm`,variant:`ghost`,onClick:n,children:`Discard`})]})]})}var k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{k=t(),A=r(),i(),o(),v(),T(),l(),j=n(),M=`Submission outcome unknown`,N=`${M}. Check whether the change was applied before retrying.`,P=`The previous submission was rejected. Review your saved values and try again.`,F=`w-full rounded-lg border px-density-3 py-density-2 text-sm shadow-lg`,I=`${F} border-border bg-popover text-popover-foreground`,L=`${F} border-primary bg-primary text-primary-foreground`;try{E.displayName=`ModalProvider`,E.__docgenInfo={description:``,displayName:`ModalProvider`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/overlay/ModalProvider.tsx`,methods:[],props:{scope:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/ModalProvider.tsx`,name:`TypeLiteral`}],description:`Namespace specific to the app, account and workspace.`,name:`scope`,required:!0,tags:{},type:{name:`string`}},forms:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/overlay/ModalProvider.tsx`,name:`TypeLiteral`}],description:``,name:`forms`,required:!0,tags:{},type:{name:`Readonly<Record<string, ModalFormDefinition>>`}}},tags:{}}}catch{}})))()}function z({modalProps:e,initialDraft:t,submit:n}){let[r,i]=(0,V.useState)(String(t.name)),o=(0,V.useId)(),s=(0,V.useId)(),c=r.trim()!==``;return(0,H.jsx)(d,{...e,footer:(0,H.jsxs)(`div`,{className:`flex justify-end gap-density-2`,children:[(0,H.jsx)(a,{type:`button`,variant:`outline`,onClick:e.onClose,children:`Cancel`}),(0,H.jsx)(a,{type:`submit`,form:o,disabled:!c,children:`Save`})]}),children:(0,H.jsxs)(`form`,{id:o,className:`space-y-density-2`,onSubmit:e=>{if(e.preventDefault(),!c)return;let t={name:r.trim()};n({draft:t,request:()=>new Promise(e=>{window.setTimeout(()=>{e(t.name.toLowerCase()===`taken`?{status:`rejected`,error:`A report named “Taken” already exists.`}:{status:`success`,value:t.name})},5e3)})})},children:[(0,H.jsx)(`label`,{className:`block text-sm font-medium`,htmlFor:s,children:`Report name`}),(0,H.jsx)(p,{id:s,required:!0,value:r,onChange:i})]})})}function B({onNavigate:e}){let{openModal:t}=h();return(0,H.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,H.jsx)(a,{type:`button`,onClick:()=>t(`renameReport`,{name:`Weekly report`}),children:`Rename report`}),(0,H.jsx)(a,{type:`button`,variant:`outline`,onClick:e,children:`View activity`})]})}var V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{V=t(),i(),f(),u(),R(),v(),H=n(),U={title:`Overlay/Modal`,component:d,args:{open:!0,title:`Confirm action`,size:`md`,closeOnBackdrop:!1,closeOnEsc:!0,hideClose:!1,expandable:!0,onClose:()=>void 0,children:(0,H.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})},argTypes:{size:{control:`inline-radio`,options:[`sm`,`md`,`lg`,`xl`,`full`],description:`Width/height preset for the dialog panel.`,table:{category:`Layout`,defaultValue:{summary:`md`}}},title:{control:`text`,table:{category:`Layout`}},open:{control:`boolean`,description:`Controls whether the modal is mounted.`,table:{category:`State`}},closeOnBackdrop:{control:`boolean`,description:`Close when the backdrop is clicked. Off by default.`,table:{category:`Behavior`,defaultValue:{summary:`false`}}},closeOnEsc:{control:`boolean`,description:`Close when Escape is pressed.`,table:{category:`Behavior`,defaultValue:{summary:`true`}}},hideClose:{control:`boolean`,description:`Hide the header close button.`,table:{category:`Behavior`}},expandable:{control:`boolean`,description:`Show the expand/restore-to-fullscreen button.`,table:{category:`Behavior`,defaultValue:{summary:`true`}}},confirmClose:{control:`boolean`,description:`Guard every close path behind a discard-confirmation prompt; onClose only fires once confirmed. Pass an options object to customise the copy.`,table:{category:`Behavior`,defaultValue:{summary:`false`}}},onClose:{control:!1,table:{category:`Events`}},children:{control:!1,table:{category:`Content`}},footer:{control:!1,table:{category:`Content`}},headerSlot:{control:!1,table:{category:`Content`}}},parameters:{docs:{description:{component:`Centered modal overlay with an optional header, footer, backdrop/Escape closing, focus restoration, and built-in expand-to-fullscreen behavior.

**When to use**
- Confirmations, short forms, and row-detail panels that should trap focus.
- Prefer \`size="sm"\` for confirmations and \`lg\`/\`xl\` for detail content; users can expand to fullscreen when \`expandable\` is on.

**Behavior**
- Closes on Escape (\`closeOnEsc\`, on by default) and the close button; backdrop click is opt-in via \`closeOnBackdrop\`.
- Nests cleanly: a modal opened over another renders above it without hiding it, and Escape closes one layer at a time (topmost first).
- Restores focus to the previously-focused element on close.
- When \`title\` is a string it becomes the dialog's accessible label.
- Below 640px, the modal becomes a full mobile page: it slides over the previous view, uses a back-navigation header, and keeps its header and footer pinned while the body scrolls.

**Usage**
\`\`\`tsx
const [open, setOpen] = useState(false);
<Modal open={open} onClose={() => setOpen(false)} title="Delete item" size="sm"
  footer={<button onClick={() => setOpen(false)}>Cancel</button>}>
  <p>This action cannot be undone.</p>
</Modal>
\`\`\`

The **Playground** story renders the modal open inline so the controls drive it directly; the other stories show the trigger-button pattern you'll use in real apps.`}}}},W={parameters:{docs:{description:{story:"The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle `expandable`, `hideClose`, and `size` to see the header and panel respond."}}},render:e=>(0,H.jsx)(d,{...e,children:e.children??(0,H.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})})},G={render:()=>{let[e,t]=(0,V.useState)(!1);return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open modal`}),(0,H.jsx)(d,{open:e,onClose:()=>t(!1),title:`Confirm action`,children:(0,H.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})})]})}},K={render:()=>{let[e,t]=(0,V.useState)(!1);return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open modal with footer`}),(0,H.jsx)(d,{open:e,onClose:()=>t(!1),title:`Delete item`,size:`sm`,footer:(0,H.jsxs)(`div`,{className:`flex justify-end gap-density-2`,children:[(0,H.jsx)(`button`,{className:`px-3 py-1 text-sm`,onClick:()=>t(!1),children:`Cancel`}),(0,H.jsx)(`button`,{className:`px-3 py-1 text-sm rounded bg-red-500 text-white`,onClick:()=>t(!1),children:`Delete`})]}),children:(0,H.jsx)(`p`,{className:`text-sm`,children:`This action cannot be undone.`})})]})}},q={parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:`On mobile the modal becomes a borderless, shadowless page with back navigation. Its header and footer stay visible while this long form scrolls inside the body.`}}},render:()=>(0,H.jsx)(d,{open:!0,onClose:()=>{},title:`Run capture`,size:`lg`,footer:(0,H.jsxs)(`div`,{className:`flex flex-wrap justify-end gap-density-2`,children:[(0,H.jsx)(`button`,{className:`rounded-md border border-border px-3 py-1 text-sm`,children:`Cancel`}),(0,H.jsx)(`button`,{className:`rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground`,children:`Run capture`})]}),children:(0,H.jsx)(`div`,{className:`grid grid-cols-1 gap-density-3 sm:grid-cols-2`,children:Array.from({length:18},(e,t)=>(0,H.jsxs)(`label`,{className:`flex min-w-0 flex-col gap-1 text-sm`,children:[(0,H.jsxs)(`span`,{className:`font-medium`,children:[`Field `,t+1]}),(0,H.jsx)(`input`,{className:`min-w-0 rounded-md border border-border px-2 py-1.5`,defaultValue:`Responsive value`})]},t))})})},J={parameters:{docs:{description:{story:"With `confirmClose` set, the close button, Escape, and backdrop all surface a discard prompt; `onClose` runs only after the user confirms. Use it to guard modals holding unsaved edits."}}},render:()=>{let[e,t]=(0,V.useState)(!1);return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open guarded modal`}),(0,H.jsx)(d,{open:e,onClose:()=>t(!1),title:`Edit context`,size:`lg`,confirmClose:{title:`Discard this context?`,message:`The endpoints you configured haven't been saved yet.`,confirmLabel:`Discard`,cancelLabel:`Keep editing`},children:(0,H.jsx)(`p`,{className:`text-sm`,children:`Try the close button, Escape, or clicking the backdrop.`})})]})}},Y={render:()=>{let[e,t]=(0,V.useState)(!1);return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open expandable modal`}),(0,H.jsx)(d,{open:e,onClose:()=>t(!1),title:`Row detail`,size:`lg`,children:(0,H.jsx)(`p`,{className:`text-sm`,children:`Use the expand icon in the header to toggle between the configured size and fullscreen.`})})]})}},X={renameReport:{title:`Rename report`,Form:z,recovery:{serialize:e=>({name:String(e.name)}),restore:e=>{if(e&&typeof e==`object`&&`name`in e&&typeof e.name==`string`)return{name:e.name};throw Error(`Invalid report draft`)}}}},Z={parameters:{docs:{description:{story:"Mount `ModalProvider` above the route outlet. Register the hosted form once and use `useModal().openModal(formKey, initialDraft)` to open it. Spread its `modalProps` into `Modal` and keep the draft in the hosted form so inputs survive minimization.\n\nGive forms that support reload recovery a `recovery` codec. The provider saves the fields selected by `serialize` before dispatch and validates them with `restore` after reload. Use a scope tied to the app, account, and workspace.\n\nSave to see the pending card. Use the name `Taken` for a server rejection, or refresh while submitting to restore the draft with an unknown outcome."}}},render:function(){let[e,t]=(0,V.useState)(!1);return(0,H.jsx)(E,{scope:`storybook:demo:reports`,forms:X,children:e?(0,H.jsxs)(`div`,{className:`space-y-density-2`,children:[(0,H.jsx)(`h2`,{className:`font-semibold`,children:`Report activity`}),(0,H.jsx)(a,{type:`button`,variant:`outline`,onClick:()=>t(!1),children:`Back to reports`})]}):(0,H.jsx)(B,{onNavigate:()=>t(!0)})})}},Q=[`Playground`,`Default`,`WithFooter`,`MobileScrollable`,`ConfirmClose`,`Expandable`,`OptimisticSubmission`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle \`expandable\`, \`hideClose\`, and \`size\` to see the header and panel respond."
      }
    }
  },
  render: args => <Modal {...args}>
      {args.children ?? <p className="text-sm">Are you sure you want to proceed?</p>}
    </Modal>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground" onClick={() => setOpen(true)}>
          Open modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Confirm action">
          <p className="text-sm">Are you sure you want to proceed?</p>
        </Modal>
      </>;
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground" onClick={() => setOpen(true)}>
          Open modal with footer
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Delete item" size="sm" footer={<div className="flex justify-end gap-density-2">
              <button className="px-3 py-1 text-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="px-3 py-1 text-sm rounded bg-red-500 text-white" onClick={() => setOpen(false)}>
                Delete
              </button>
            </div>}>
          <p className="text-sm">This action cannot be undone.</p>
        </Modal>
      </>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    docs: {
      description: {
        story: "On mobile the modal becomes a borderless, shadowless page with back navigation. Its header and footer stay visible while this long form scrolls inside the body."
      }
    }
  },
  render: () => <Modal open onClose={() => {}} title="Run capture" size="lg" footer={<div className="flex flex-wrap justify-end gap-density-2">
          <button className="rounded-md border border-border px-3 py-1 text-sm">Cancel</button>
          <button className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
            Run capture
          </button>
        </div>}>
      <div className="grid grid-cols-1 gap-density-3 sm:grid-cols-2">
        {Array.from({
        length: 18
      }, (_, index) => <label key={index} className="flex min-w-0 flex-col gap-1 text-sm">
            <span className="font-medium">Field {index + 1}</span>
            <input className="min-w-0 rounded-md border border-border px-2 py-1.5" defaultValue="Responsive value" />
          </label>)}
      </div>
    </Modal>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "With \`confirmClose\` set, the close button, Escape, and backdrop all surface a discard prompt; \`onClose\` runs only after the user confirms. Use it to guard modals holding unsaved edits."
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground" onClick={() => setOpen(true)}>
          Open guarded modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Edit context" size="lg" confirmClose={{
        title: "Discard this context?",
        message: "The endpoints you configured haven't been saved yet.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing"
      }}>
          <p className="text-sm">Try the close button, Escape, or clicking the backdrop.</p>
        </Modal>
      </>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground" onClick={() => setOpen(true)}>
          Open expandable modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Row detail" size="lg">
          <p className="text-sm">
            Use the expand icon in the header to toggle between the configured size and fullscreen.
          </p>
        </Modal>
      </>;
  }
}`,...Y.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: ["Mount \`ModalProvider\` above the route outlet. Register the hosted form once and use \`useModal().openModal(formKey, initialDraft)\` to open it. Spread its \`modalProps\` into \`Modal\` and keep the draft in the hosted form so inputs survive minimization.", "", "Give forms that support reload recovery a \`recovery\` codec. The provider saves the fields selected by \`serialize\` before dispatch and validates them with \`restore\` after reload. Use a scope tied to the app, account, and workspace.", "", 'Save to see the pending card. Use the name \`Taken\` for a server rejection, or refresh while submitting to restore the draft with an unknown outcome.'].join("\\n")
      }
    }
  },
  render: function OptimisticSubmissionStory() {
    const [activity, setActivity] = useState(false);
    return <ModalProvider scope="storybook:demo:reports" forms={reportForms}>
        {activity ? <div className="space-y-density-2">
            <h2 className="font-semibold">Report activity</h2>
            <Button type="button" variant="outline" onClick={() => setActivity(false)}>
              Back to reports
            </Button>
          </div> : <ReportPage onNavigate={() => setActivity(true)} />}
      </ModalProvider>;
  }
}`,...Z.parameters?.docs?.source}}}})))()}$();export{J as ConfirmClose,G as Default,Y as Expandable,q as MobileScrollable,Z as OptimisticSubmission,W as Playground,K as WithFooter,Q as __namedExportsOrder,U as default};
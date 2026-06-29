import{r as c,j as e}from"./iframe-C9yFQwwi.js";import{M as n}from"./Modal-DfeEiwDA.js";import"./preload-helper-C4wV90-x.js";import"./index-DV4EKk1L.js";import"./index-DNnTLrC-.js";import"./utils-CR52uffu.js";import"./Icon-CPfok5dB.js";import"./button-BUPOCWxe.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";import"./modalStack-CeDZWai7.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-C2nfMBhc.js";import"./UiClose-CrCIES2T.js";const K={title:"Overlay/Modal",component:n,args:{open:!0,title:"Confirm action",size:"md",closeOnBackdrop:!1,closeOnEsc:!0,hideClose:!1,expandable:!0,onClose:()=>{},children:e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})},argTypes:{size:{control:"inline-radio",options:["sm","md","lg","xl","full"],description:"Width/height preset for the dialog panel.",table:{category:"Layout",defaultValue:{summary:"md"}}},title:{control:"text",table:{category:"Layout"}},open:{control:"boolean",description:"Controls whether the modal is mounted.",table:{category:"State"}},closeOnBackdrop:{control:"boolean",description:"Close when the backdrop is clicked. Off by default.",table:{category:"Behavior",defaultValue:{summary:"false"}}},closeOnEsc:{control:"boolean",description:"Close when Escape is pressed.",table:{category:"Behavior",defaultValue:{summary:"true"}}},hideClose:{control:"boolean",description:"Hide the header close button.",table:{category:"Behavior"}},expandable:{control:"boolean",description:"Show the expand/restore-to-fullscreen button.",table:{category:"Behavior",defaultValue:{summary:"true"}}},confirmClose:{control:"boolean",description:"Guard every close path behind a discard-confirmation prompt; onClose only fires once confirmed. Pass an options object to customise the copy.",table:{category:"Behavior",defaultValue:{summary:"false"}}},onClose:{control:!1,table:{category:"Events"}},children:{control:!1,table:{category:"Content"}},footer:{control:!1,table:{category:"Content"}},headerSlot:{control:!1,table:{category:"Content"}}},parameters:{docs:{description:{component:["Centered modal overlay with an optional header, footer, backdrop/Escape closing, focus restoration, and built-in expand-to-fullscreen behavior.","","**When to use**","- Confirmations, short forms, and row-detail panels that should trap focus.",'- Prefer `size="sm"` for confirmations and `lg`/`xl` for detail content; users can expand to fullscreen when `expandable` is on.',"","**Behavior**","- Closes on Escape (`closeOnEsc`, on by default) and the close button; backdrop click is opt-in via `closeOnBackdrop`.","- Nests cleanly: a modal opened over another renders above it without hiding it, and Escape closes one layer at a time (topmost first).","- Restores focus to the previously-focused element on close.","- When `title` is a string it becomes the dialog's accessible label.","","**Usage**","```tsx","const [open, setOpen] = useState(false);",'<Modal open={open} onClose={() => setOpen(false)} title="Delete item" size="sm"',"  footer={<button onClick={() => setOpen(false)}>Cancel</button>}>","  <p>This action cannot be undone.</p>","</Modal>","```","","The **Playground** story renders the modal open inline so the controls drive it directly; the other stories show the trigger-button pattern you'll use in real apps."].join(`
`)}}}},r={parameters:{docs:{description:{story:"The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle `expandable`, `hideClose`, and `size` to see the header and panel respond."}}},render:t=>e.jsx(n,{...t,children:t.children??e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})})},s={render:()=>{const[t,o]=c.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>o(!0),children:"Open modal"}),e.jsx(n,{open:t,onClose:()=>o(!1),title:"Confirm action",children:e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})})]})}},a={render:()=>{const[t,o]=c.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>o(!0),children:"Open modal with footer"}),e.jsx(n,{open:t,onClose:()=>o(!1),title:"Delete item",size:"sm",footer:e.jsxs("div",{className:"flex justify-end gap-density-2",children:[e.jsx("button",{className:"px-3 py-1 text-sm",onClick:()=>o(!1),children:"Cancel"}),e.jsx("button",{className:"px-3 py-1 text-sm rounded bg-red-500 text-white",onClick:()=>o(!1),children:"Delete"})]}),children:e.jsx("p",{className:"text-sm",children:"This action cannot be undone."})})]})}},l={parameters:{viewport:{defaultViewport:"mobile1"}},render:()=>e.jsx(n,{open:!0,onClose:()=>{},title:"Run capture",size:"lg",footer:e.jsxs("div",{className:"flex flex-wrap justify-end gap-density-2",children:[e.jsx("button",{className:"rounded-md border border-border px-3 py-1 text-sm",children:"Cancel"}),e.jsx("button",{className:"rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground",children:"Run capture"})]}),children:e.jsx("div",{className:"grid grid-cols-1 gap-density-3 sm:grid-cols-2",children:Array.from({length:18},(t,o)=>e.jsxs("label",{className:"flex min-w-0 flex-col gap-1 text-sm",children:[e.jsxs("span",{className:"font-medium",children:["Field ",o+1]}),e.jsx("input",{className:"min-w-0 rounded-md border border-border px-2 py-1.5",defaultValue:"Responsive value"})]},o))})})},d={parameters:{docs:{description:{story:"With `confirmClose` set, the close button, Escape, and backdrop all surface a discard prompt; `onClose` runs only after the user confirms. Use it to guard modals holding unsaved edits."}}},render:()=>{const[t,o]=c.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>o(!0),children:"Open guarded modal"}),e.jsx(n,{open:t,onClose:()=>o(!1),title:"Edit context",size:"lg",confirmClose:{title:"Discard this context?",message:"The endpoints you configured haven't been saved yet.",confirmLabel:"Discard",cancelLabel:"Keep editing"},children:e.jsx("p",{className:"text-sm",children:"Try the close button, Escape, or clicking the backdrop."})})]})}},i={render:()=>{const[t,o]=c.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>o(!0),children:"Open expandable modal"}),e.jsx(n,{open:t,onClose:()=>o(!1),title:"Row detail",size:"lg",children:e.jsx("p",{className:"text-sm",children:"Use the expand icon in the header to toggle between the configured size and fullscreen."})})]})}};var p,m,u;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(m=r.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var f,h,b;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(b=(h=s.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var x,y,g;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(y=a.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var C,v,N;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
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
}`,...(N=(v=l.parameters)==null?void 0:v.docs)==null?void 0:N.source}}};var j,O,w;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(w=(O=d.parameters)==null?void 0:O.docs)==null?void 0:w.source}}};var k,S,E;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(E=(S=i.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};const G=["Playground","Default","WithFooter","MobileScrollable","ConfirmClose","Expandable"];export{d as ConfirmClose,s as Default,i as Expandable,l as MobileScrollable,r as Playground,a as WithFooter,G as __namedExportsOrder,K as default};

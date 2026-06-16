import{r as d,j as e}from"./iframe-C5-Xigqm.js";import{M as n}from"./Modal-BLOjTCH7.js";import"./preload-helper-BZuLNX-z.js";import"./index-CcHfWVh5.js";import"./index-BdO2_bcU.js";import"./utils-BLSKlp9E.js";import"./Icon-B_F1F--U.js";import"./button-E1Q476uu.js";import"./index-1evVQkiP.js";import"./loading-DE8-iriR.js";import"./UiFullscreen-BaVINs0G.js";import"./UiClose-BxxNesIi.js";const A={title:"Overlay/Modal",component:n,args:{open:!0,title:"Confirm action",size:"md",closeOnBackdrop:!1,closeOnEsc:!0,hideClose:!1,expandable:!0,onClose:()=>{},children:e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})},argTypes:{size:{control:"inline-radio",options:["sm","md","lg","xl","full"],description:"Width/height preset for the dialog panel.",table:{category:"Layout",defaultValue:{summary:"md"}}},title:{control:"text",table:{category:"Layout"}},open:{control:"boolean",description:"Controls whether the modal is mounted.",table:{category:"State"}},closeOnBackdrop:{control:"boolean",description:"Close when the backdrop is clicked. Off by default.",table:{category:"Behavior",defaultValue:{summary:"false"}}},closeOnEsc:{control:"boolean",description:"Close when Escape is pressed.",table:{category:"Behavior",defaultValue:{summary:"true"}}},hideClose:{control:"boolean",description:"Hide the header close button.",table:{category:"Behavior"}},expandable:{control:"boolean",description:"Show the expand/restore-to-fullscreen button.",table:{category:"Behavior",defaultValue:{summary:"true"}}},confirmClose:{control:"boolean",description:"Guard every close path behind a discard-confirmation prompt; onClose only fires once confirmed. Pass an options object to customise the copy.",table:{category:"Behavior",defaultValue:{summary:"false"}}},onClose:{control:!1,table:{category:"Events"}},children:{control:!1,table:{category:"Content"}},footer:{control:!1,table:{category:"Content"}},headerSlot:{control:!1,table:{category:"Content"}}},parameters:{docs:{description:{component:["Centered modal overlay with an optional header, footer, backdrop/Escape closing, focus restoration, and built-in expand-to-fullscreen behavior.","","**When to use**","- Confirmations, short forms, and row-detail panels that should trap focus.",'- Prefer `size="sm"` for confirmations and `lg`/`xl` for detail content; users can expand to fullscreen when `expandable` is on.',"","**Behavior**","- Closes on Escape (`closeOnEsc`, on by default) and the close button; backdrop click is opt-in via `closeOnBackdrop`.","- Nests cleanly: a modal opened over another renders above it without hiding it, and Escape closes one layer at a time (topmost first).","- Restores focus to the previously-focused element on close.","- When `title` is a string it becomes the dialog's accessible label.","","**Usage**","```tsx","const [open, setOpen] = useState(false);",'<Modal open={open} onClose={() => setOpen(false)} title="Delete item" size="sm"',"  footer={<button onClick={() => setOpen(false)}>Cancel</button>}>","  <p>This action cannot be undone.</p>","</Modal>","```","","The **Playground** story renders the modal open inline so the controls drive it directly; the other stories show the trigger-button pattern you'll use in real apps."].join(`
`)}}}},s={parameters:{docs:{description:{story:"The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle `expandable`, `hideClose`, and `size` to see the header and panel respond."}}},render:o=>e.jsx(n,{...o,children:o.children??e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})})},r={render:()=>{const[o,t]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>t(!0),children:"Open modal"}),e.jsx(n,{open:o,onClose:()=>t(!1),title:"Confirm action",children:e.jsx("p",{className:"text-sm",children:"Are you sure you want to proceed?"})})]})}},a={render:()=>{const[o,t]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>t(!0),children:"Open modal with footer"}),e.jsx(n,{open:o,onClose:()=>t(!1),title:"Delete item",size:"sm",footer:e.jsxs("div",{className:"flex justify-end gap-density-2",children:[e.jsx("button",{className:"px-3 py-1 text-sm",onClick:()=>t(!1),children:"Cancel"}),e.jsx("button",{className:"px-3 py-1 text-sm rounded bg-red-500 text-white",onClick:()=>t(!1),children:"Delete"})]}),children:e.jsx("p",{className:"text-sm",children:"This action cannot be undone."})})]})}},l={parameters:{docs:{description:{story:"With `confirmClose` set, the close button, Escape, and backdrop all surface a discard prompt; `onClose` runs only after the user confirms. Use it to guard modals holding unsaved edits."}}},render:()=>{const[o,t]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>t(!0),children:"Open guarded modal"}),e.jsx(n,{open:o,onClose:()=>t(!1),title:"Edit context",size:"lg",confirmClose:{title:"Discard this context?",message:"The endpoints you configured haven't been saved yet.",confirmLabel:"Discard",cancelLabel:"Keep editing"},children:e.jsx("p",{className:"text-sm",children:"Try the close button, Escape, or clicking the backdrop."})})]})}},i={render:()=>{const[o,t]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"px-3 py-1.5 rounded-md bg-primary text-primary-foreground",onClick:()=>t(!0),children:"Open expandable modal"}),e.jsx(n,{open:o,onClose:()=>t(!1),title:"Row detail",size:"lg",children:e.jsx("p",{className:"text-sm",children:"Use the expand icon in the header to toggle between the configured size and fullscreen."})})]})}};var c,p,m;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(m=(p=s.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,h,f;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(f=(h=r.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var y,b,x;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(x=(b=a.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var g,C,O;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(O=(C=l.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var v,k,j;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(j=(k=i.parameters)==null?void 0:k.docs)==null?void 0:j.source}}};const P=["Playground","Default","WithFooter","ConfirmClose","Expandable"];export{l as ConfirmClose,r as Default,i as Expandable,s as Playground,a as WithFooter,P as __namedExportsOrder,A as default};

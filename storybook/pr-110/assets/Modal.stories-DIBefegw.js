import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Modal-D0XTA801.js";var a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{a=t(),r(),o=n(),s={title:`Overlay/Modal`,component:i,args:{open:!0,title:`Confirm action`,size:`md`,closeOnBackdrop:!1,closeOnEsc:!0,hideClose:!1,expandable:!0,onClose:()=>void 0,children:(0,o.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})},argTypes:{size:{control:`inline-radio`,options:[`sm`,`md`,`lg`,`xl`,`full`],description:`Width/height preset for the dialog panel.`,table:{category:`Layout`,defaultValue:{summary:`md`}}},title:{control:`text`,table:{category:`Layout`}},open:{control:`boolean`,description:`Controls whether the modal is mounted.`,table:{category:`State`}},closeOnBackdrop:{control:`boolean`,description:`Close when the backdrop is clicked. Off by default.`,table:{category:`Behavior`,defaultValue:{summary:`false`}}},closeOnEsc:{control:`boolean`,description:`Close when Escape is pressed.`,table:{category:`Behavior`,defaultValue:{summary:`true`}}},hideClose:{control:`boolean`,description:`Hide the header close button.`,table:{category:`Behavior`}},expandable:{control:`boolean`,description:`Show the expand/restore-to-fullscreen button.`,table:{category:`Behavior`,defaultValue:{summary:`true`}}},confirmClose:{control:`boolean`,description:`Guard every close path behind a discard-confirmation prompt; onClose only fires once confirmed. Pass an options object to customise the copy.`,table:{category:`Behavior`,defaultValue:{summary:`false`}}},onClose:{control:!1,table:{category:`Events`}},children:{control:!1,table:{category:`Content`}},footer:{control:!1,table:{category:`Content`}},headerSlot:{control:!1,table:{category:`Content`}}},parameters:{docs:{description:{component:`Centered modal overlay with an optional header, footer, backdrop/Escape closing, focus restoration, and built-in expand-to-fullscreen behavior.

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

The **Playground** story renders the modal open inline so the controls drive it directly; the other stories show the trigger-button pattern you'll use in real apps.`}}}},c={parameters:{docs:{description:{story:"The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle `expandable`, `hideClose`, and `size` to see the header and panel respond."}}},render:e=>(0,o.jsx)(i,{...e,children:e.children??(0,o.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})})},l={render:()=>{let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open modal`}),(0,o.jsx)(i,{open:e,onClose:()=>t(!1),title:`Confirm action`,children:(0,o.jsx)(`p`,{className:`text-sm`,children:`Are you sure you want to proceed?`})})]})}},u={render:()=>{let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open modal with footer`}),(0,o.jsx)(i,{open:e,onClose:()=>t(!1),title:`Delete item`,size:`sm`,footer:(0,o.jsxs)(`div`,{className:`flex justify-end gap-density-2`,children:[(0,o.jsx)(`button`,{className:`px-3 py-1 text-sm`,onClick:()=>t(!1),children:`Cancel`}),(0,o.jsx)(`button`,{className:`px-3 py-1 text-sm rounded bg-red-500 text-white`,onClick:()=>t(!1),children:`Delete`})]}),children:(0,o.jsx)(`p`,{className:`text-sm`,children:`This action cannot be undone.`})})]})}},d={parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:`On mobile the modal becomes a borderless, shadowless page with back navigation. Its header and footer stay visible while this long form scrolls inside the body.`}}},render:()=>(0,o.jsx)(i,{open:!0,onClose:()=>{},title:`Run capture`,size:`lg`,footer:(0,o.jsxs)(`div`,{className:`flex flex-wrap justify-end gap-density-2`,children:[(0,o.jsx)(`button`,{className:`rounded-md border border-border px-3 py-1 text-sm`,children:`Cancel`}),(0,o.jsx)(`button`,{className:`rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground`,children:`Run capture`})]}),children:(0,o.jsx)(`div`,{className:`grid grid-cols-1 gap-density-3 sm:grid-cols-2`,children:Array.from({length:18},(e,t)=>(0,o.jsxs)(`label`,{className:`flex min-w-0 flex-col gap-1 text-sm`,children:[(0,o.jsxs)(`span`,{className:`font-medium`,children:[`Field `,t+1]}),(0,o.jsx)(`input`,{className:`min-w-0 rounded-md border border-border px-2 py-1.5`,defaultValue:`Responsive value`})]},t))})})},f={parameters:{docs:{description:{story:"With `confirmClose` set, the close button, Escape, and backdrop all surface a discard prompt; `onClose` runs only after the user confirms. Use it to guard modals holding unsaved edits."}}},render:()=>{let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open guarded modal`}),(0,o.jsx)(i,{open:e,onClose:()=>t(!1),title:`Edit context`,size:`lg`,confirmClose:{title:`Discard this context?`,message:`The endpoints you configured haven't been saved yet.`,confirmLabel:`Discard`,cancelLabel:`Keep editing`},children:(0,o.jsx)(`p`,{className:`text-sm`,children:`Try the close button, Escape, or clicking the backdrop.`})})]})}},p={render:()=>{let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`button`,{className:`px-3 py-1.5 rounded-md bg-primary text-primary-foreground`,onClick:()=>t(!0),children:`Open expandable modal`}),(0,o.jsx)(i,{open:e,onClose:()=>t(!1),title:`Row detail`,size:`lg`,children:(0,o.jsx)(`p`,{className:`text-sm`,children:`Use the expand icon in the header to toggle between the configured size and fullscreen.`})})]})}},m=[`Playground`,`Default`,`WithFooter`,`MobileScrollable`,`ConfirmClose`,`Expandable`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as ConfirmClose,l as Default,p as Expandable,d as MobileScrollable,c as Playground,u as WithFooter,m as __namedExportsOrder,s as default};
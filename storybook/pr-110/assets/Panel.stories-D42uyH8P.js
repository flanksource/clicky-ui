import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Ks as n,n as r}from"./icons-N6BqLuiz.js";import{n as i,t as a}from"./Panel-CLyKaTAQ.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{r(),i(),o=t(),s={title:`Layout/Panel`,component:a,args:{title:`Checks`,count:6,tone:`default`,padded:!0,children:(0,o.jsxs)(`ul`,{className:`text-sm space-y-density-1`,children:[(0,o.jsx)(`li`,{children:`build · passed`}),(0,o.jsx)(`li`,{children:`lint · passed`}),(0,o.jsx)(`li`,{children:`test · failed`})]})},argTypes:{tone:{control:`inline-radio`,options:[`default`,`danger`,`warning`,`success`,`info`]},padded:{control:`boolean`},icon:{table:{disable:!0}},actions:{table:{disable:!0}},footer:{table:{disable:!0}},children:{table:{disable:!0}}},parameters:{docs:{description:{component:`Non-collapsible carded surface with an optional header (title, icon, count pill, right-aligned actions) and optional footer. Use for content panels where Section's disclosure behaviour isn't wanted.`}}}},c={},l={args:{icon:n,tone:`danger`,actions:(0,o.jsx)(`button`,{type:`button`,className:`text-xs text-muted-foreground hover:text-foreground`,children:`Copy`}),footer:(0,o.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`3 of 12 shown`})}},u={args:{title:void 0,count:void 0,children:(0,o.jsx)(`p`,{className:`text-sm`,children:`A plain card with no header row.`})}},d={args:{title:`Files`,count:3,padded:!1,children:(0,o.jsx)(`div`,{className:`divide-y divide-border text-sm`,children:[`handler.go`,`service.go`,`router.go`].map(e=>(0,o.jsx)(`div`,{className:`px-density-3 py-density-2 font-mono`,children:e},e))})}},f=[`Default`,`WithActions`,`Headerless`,`FlushRows`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    icon: UiWarningCircle,
    tone: "danger",
    actions: <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
        Copy
      </button>,
    footer: <span className="text-xs text-muted-foreground">3 of 12 shown</span>
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    title: undefined,
    count: undefined,
    children: <p className="text-sm">A plain card with no header row.</p>
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Files",
    count: 3,
    padded: false,
    children: <div className="divide-y divide-border text-sm">
        {["handler.go", "service.go", "router.go"].map(f => <div key={f} className="px-density-3 py-density-2 font-mono">
            {f}
          </div>)}
      </div>
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{c as Default,d as FlushRows,u as Headerless,l as WithActions,f as __namedExportsOrder,s as default};
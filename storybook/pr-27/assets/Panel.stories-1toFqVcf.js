import{j as e}from"./iframe-BpjD9CLN.js";import{P as b}from"./Panel-B93qE3jW.js";import{U as v}from"./UiWarningCircle-6tW6mImb.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./Icon-CNN2zWKh.js";const A={title:"Layout/Panel",component:b,args:{title:"Checks",count:6,tone:"default",padded:!0,children:e.jsxs("ul",{className:"text-sm space-y-density-1",children:[e.jsx("li",{children:"build · passed"}),e.jsx("li",{children:"lint · passed"}),e.jsx("li",{children:"test · failed"})]})},argTypes:{tone:{control:"inline-radio",options:["default","danger","warning","success","info"]},padded:{control:"boolean"},icon:{table:{disable:!0}},actions:{table:{disable:!0}},footer:{table:{disable:!0}},children:{table:{disable:!0}}},parameters:{docs:{description:{component:"Non-collapsible carded surface with an optional header (title, icon, count pill, right-aligned actions) and optional footer. Use for content panels where Section's disclosure behaviour isn't wanted."}}}},t={},s={args:{icon:v,tone:"danger",actions:e.jsx("button",{type:"button",className:"text-xs text-muted-foreground hover:text-foreground",children:"Copy"}),footer:e.jsx("span",{className:"text-xs text-muted-foreground",children:"3 of 12 shown"})}},o={args:{title:void 0,count:void 0,children:e.jsx("p",{className:"text-sm",children:"A plain card with no header row."})}},r={args:{title:"Files",count:3,padded:!1,children:e.jsx("div",{className:"divide-y divide-border text-sm",children:["handler.go","service.go","router.go"].map(n=>e.jsx("div",{className:"px-density-3 py-density-2 font-mono",children:n},n))})}};var a,i,d;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:"{}",...(d=(i=t.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var c,l,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    icon: UiWarningCircle,
    tone: "danger",
    actions: <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
        Copy
      </button>,
    footer: <span className="text-xs text-muted-foreground">3 of 12 shown</span>
  }
}`,...(p=(l=s.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var u,m,h;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    title: undefined,
    count: undefined,
    children: <p className="text-sm">A plain card with no header row.</p>
  }
}`,...(h=(m=o.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var x,f,g;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};const F=["Default","WithActions","Headerless","FlushRows"];export{t as Default,r as FlushRows,o as Headerless,s as WithActions,F as __namedExportsOrder,A as default};

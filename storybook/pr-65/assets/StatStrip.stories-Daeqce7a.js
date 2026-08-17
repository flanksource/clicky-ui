import{j as a,Q as k,J as S}from"./iframe-BOqGPkjA.js";import{c as s}from"./utils-CR52uffu.js";import{I as w}from"./Icon-DmMP-gqZ.js";import"./preload-helper-BHaa9cja.js";const _={neutral:"text-foreground",success:"text-emerald-600 [[data-theme=dark]_&]:text-emerald-400",danger:"text-rose-600 [[data-theme=dark]_&]:text-rose-400",warning:"text-amber-600 [[data-theme=dark]_&]:text-amber-400",info:"text-sky-600 [[data-theme=dark]_&]:text-sky-400"};function N({item:e,classNames:t}){const r=a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:s("flex items-center gap-1.5 text-xs font-medium text-muted-foreground",t.label),children:[e.icon&&a.jsx(w,{...typeof e.icon=="string"?{name:e.icon}:{icon:e.icon},className:"text-sm"}),a.jsx("span",{className:"truncate",children:e.label})]}),a.jsx("div",{className:s("font-mono text-lg leading-tight tabular-nums",_[e.tone??"neutral"],t.value),children:e.value}),e.sub!==void 0&&a.jsx("div",{className:s("text-xs text-muted-foreground",t.sub),children:e.sub})]}),n=s("flex flex-col gap-0.5 bg-card px-density-3 py-density-2 text-left",t.cell);return e.href?a.jsx("a",{href:e.href,className:s(n,"hover:bg-accent/40"),children:r}):e.onClick?a.jsx("button",{type:"button",onClick:e.onClick,className:s(n,"hover:bg-accent/40"),children:r}):a.jsx("div",{className:n,children:r})}function c({items:e,columns:t,className:r,classNames:n={}}){return a.jsx("div",{className:s("overflow-hidden rounded-md border border-border bg-border",r),"data-testid":"stat-strip",children:a.jsx("div",{className:"grid grid-cols-2 gap-px md:grid-cols-[repeat(var(--stat-cols,4),minmax(0,1fr))]",style:{"--stat-cols":t??Math.max(e.length,1)},children:e.map((y,v)=>a.jsx(N,{item:y,classNames:n},v))})})}try{c.displayName="StatStrip",c.__docgenInfo={description:`A row of headline figures — the summary strip that sits above a table or
detail page. Purely presentational: it derives nothing, the caller supplies
already-formatted values.

Cell separators come from a 1px grid gap over the container background, so
they stay correct however the grid wraps.`,displayName:"StatStrip",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/StatStrip.tsx",methods:[],props:{items:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/StatStrip.tsx",name:"TypeLiteral"}],description:"",name:"items",required:!0,tags:{},type:{name:"StatStripItem[]"}},columns:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/StatStrip.tsx",name:"TypeLiteral"}],description:"Cells per row on md+ screens. Defaults to the item count.",name:"columns",required:!1,tags:{},type:{name:"number"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/StatStrip.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}},classNames:{defaultValue:{value:"{}"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/StatStrip.tsx",name:"TypeLiteral"}],description:"",name:"classNames",required:!1,tags:{},type:{name:"StatStripClassNames"}}},tags:{}}}catch{}const{expect:j,within:A}=__STORYBOOK_MODULE_TEST__,E={title:"Data/StatStrip",component:c,tags:["autodocs"],parameters:{docs:{description:{component:"A row of headline figures for the top of a list or detail page. Purely presentational — the caller supplies already-formatted values. Cell separators come from a 1px grid gap over the container background, so they stay correct however the grid wraps; below `md` the strip falls back to two columns."}}},args:{items:[{label:"Open requests",value:"7",sub:"Awaiting a decision"},{label:"Ready",value:"5",sub:"All pre-flight checks clear",tone:"success"},{label:"Held",value:"2",sub:"Blocked or needs review",tone:"warning"},{label:"Value awaiting",value:"2,412,905",sub:"ZAR · excludes chart changes"}]}},l={},i={args:{items:[{label:"Oldest request",value:"9d",sub:"za-itr14-tax-position",icon:k,tone:"danger"},{label:"Blocked",value:"1",sub:"Missing tax rate",icon:S,tone:"warning"}]}},o={args:{items:[{label:"Open requests",value:"7",sub:"Awaiting a decision",href:"#open"},{label:"Rejected",value:"1",sub:"Last 30 days",href:"#rejected"}]},play:async({canvasElement:e})=>{const t=A(e);await j(t.getByRole("link",{name:/Open requests/})).toHaveAttribute("href","#open")}};var d,u,p;l.parameters={...l.parameters,docs:{...(d=l.parameters)==null?void 0:d.docs,source:{originalSource:"{}",...(p=(u=l.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var m,g,h;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    items: [{
      label: "Oldest request",
      value: "9d",
      sub: "za-itr14-tax-position",
      icon: UiClock,
      tone: "danger"
    }, {
      label: "Blocked",
      value: "1",
      sub: "Missing tax rate",
      icon: UiWarningTriangle,
      tone: "warning"
    }]
  }
}`,...(h=(g=i.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var f,x,b;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    items: [{
      label: "Open requests",
      value: "7",
      sub: "Awaiting a decision",
      href: "#open"
    }, {
      label: "Rejected",
      value: "1",
      sub: "Last 30 days",
      href: "#rejected"
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {
      name: /Open requests/
    })).toHaveAttribute("href", "#open");
  }
}`,...(b=(x=o.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};const L=["Default","WithIcons","Actionable"];export{o as Actionable,l as Default,i as WithIcons,L as __namedExportsOrder,E as default};

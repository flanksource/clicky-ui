import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ws as r,kr as i,n as a}from"./icons-N6BqLuiz.js";import{n as o,t as s}from"./utils-CEDXhWC6.js";import{r as c,t as l}from"./Icon-C-TekGYq.js";function u({item:e,classNames:t}){let n=(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`div`,{className:s(`flex items-center gap-1.5 text-xs font-medium text-muted-foreground`,t.label),children:[e.icon&&(0,f.jsx)(l,{...typeof e.icon==`string`?{name:e.icon}:{icon:e.icon},className:`text-sm`}),(0,f.jsx)(`span`,{className:`truncate`,children:e.label})]}),(0,f.jsx)(`div`,{className:s(`font-mono text-lg leading-tight tabular-nums`,p[e.tone??`neutral`],t.value),children:e.value}),e.sub!==void 0&&(0,f.jsx)(`div`,{className:s(`text-xs text-muted-foreground`,t.sub),children:e.sub})]}),r=s(`flex flex-col gap-0.5 bg-card px-density-3 py-density-2 text-left`,t.cell);return e.href?(0,f.jsx)(`a`,{href:e.href,className:s(r,`hover:bg-accent/40`),children:n}):e.onClick?(0,f.jsx)(`button`,{type:`button`,onClick:e.onClick,className:s(r,`hover:bg-accent/40`),children:n}):(0,f.jsx)(`div`,{className:r,children:n})}function d({items:e,columns:t,className:n,classNames:r={}}){return(0,f.jsx)(`div`,{className:s(`overflow-hidden rounded-md border border-border bg-border`,n),"data-testid":`stat-strip`,children:(0,f.jsx)(`div`,{className:`grid grid-cols-2 gap-px md:grid-cols-[repeat(var(--stat-cols,4),minmax(0,1fr))]`,style:{"--stat-cols":t??Math.max(e.length,1)},children:e.map((e,t)=>(0,f.jsx)(u,{item:e,classNames:r},t))})})}var f,p;function m(){return(m=e((()=>{t(),o(),c(),f=n(),p={neutral:`text-foreground`,success:`text-emerald-600 [[data-theme=dark]_&]:text-emerald-400`,danger:`text-rose-600 [[data-theme=dark]_&]:text-rose-400`,warning:`text-amber-600 [[data-theme=dark]_&]:text-amber-400`,info:`text-sky-600 [[data-theme=dark]_&]:text-sky-400`};try{d.displayName=`StatStrip`,d.__docgenInfo={description:`A row of headline figures — the summary strip that sits above a table or
detail page. Purely presentational: it derives nothing, the caller supplies
already-formatted values.

Cell separators come from a 1px grid gap over the container background, so
they stay correct however the grid wraps.`,displayName:`StatStrip`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/StatStrip.tsx`,methods:[],props:{items:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/StatStrip.tsx`,name:`TypeLiteral`}],description:``,name:`items`,required:!0,tags:{},type:{name:`StatStripItem[]`}},columns:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/StatStrip.tsx`,name:`TypeLiteral`}],description:`Cells per row on md+ screens. Defaults to the item count.`,name:`columns`,required:!1,tags:{},type:{name:`number`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/StatStrip.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}},classNames:{defaultValue:{value:`{}`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/StatStrip.tsx`,name:`TypeLiteral`}],description:``,name:`classNames`,required:!1,tags:{},type:{name:`StatStripClassNames`}}},tags:{}}}catch{}})))()}var h,g,_,v,y,b,x;function S(){return(S=e((()=>{m(),a(),{expect:h,within:g}=__STORYBOOK_MODULE_TEST__,_={title:`Data/StatStrip`,component:d,tags:[`autodocs`],parameters:{docs:{description:{component:"A row of headline figures for the top of a list or detail page. Purely presentational — the caller supplies already-formatted values. Cell separators come from a 1px grid gap over the container background, so they stay correct however the grid wraps; below `md` the strip falls back to two columns."}}},args:{items:[{label:`Open requests`,value:`7`,sub:`Awaiting a decision`},{label:`Ready`,value:`5`,sub:`All pre-flight checks clear`,tone:`success`},{label:`Held`,value:`2`,sub:`Blocked or needs review`,tone:`warning`},{label:`Value awaiting`,value:`2,412,905`,sub:`ZAR · excludes chart changes`}]}},v={},y={args:{items:[{label:`Oldest request`,value:`9d`,sub:`za-itr14-tax-position`,icon:i,tone:`danger`},{label:`Blocked`,value:`1`,sub:`Missing tax rate`,icon:r,tone:`warning`}]}},b={args:{items:[{label:`Open requests`,value:`7`,sub:`Awaiting a decision`,href:`#open`},{label:`Rejected`,value:`1`,sub:`Last 30 days`,href:`#rejected`}]},play:async({canvasElement:e})=>{let t=g(e);await h(t.getByRole(`link`,{name:/Open requests/})).toHaveAttribute(`href`,`#open`)}},x=[`Default`,`WithIcons`,`Actionable`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}}})))()}S();export{b as Actionable,v as Default,y as WithIcons,x as __namedExportsOrder,_ as default};
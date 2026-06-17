import{j as t,r as g}from"./iframe-ChhGfndY.js";import{R as d}from"./RangeSlider-BWkiL0FG.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";function x({value:o,...u}){const[s,i]=g.useState(o);return t.jsxs("div",{className:"w-80 space-y-3",children:[t.jsx(d,{...u,value:s,onChange:i}),t.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["[",s[0],", ",s[1],"]"]})]})}const S={title:"Components/RangeSlider",component:d,tags:["autodocs"],render:o=>t.jsx(x,{...o}),parameters:{docs:{description:{component:'Dual-thumb range slider built from two overlaid native `<input type="range">` elements. The thumbs cannot cross; the filled segment between them reflects the selected `[lower, upper]` window. Fully controlled.'}}},argTypes:{min:{control:"number"},max:{control:"number"},step:{control:"number"},value:{control:!1},onChange:{control:!1}},args:{min:0,max:100,step:1,value:[20,70]}},e={},r={args:{min:0,max:1e3,step:50,value:[200,600]}};var a,n,l;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:"{}",...(l=(n=e.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var m,c,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 1000,
    step: 50,
    value: [200, 600]
  }
}`,...(p=(c=r.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};const j=["Default","Stepped"];export{e as Default,r as Stepped,j as __namedExportsOrder,S as default};

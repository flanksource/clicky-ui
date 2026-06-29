import{j as a}from"./iframe-C9yFQwwi.js";import{c as s}from"./utils-CR52uffu.js";import"./preload-helper-C4wV90-x.js";function G(e){return`${e>=0?"+":""}${e.toFixed(2)}%`}function d({value:e,max:t=50,significant:m=!0,positiveIsBad:u=!1,format:V=G,height:P="h-4",className:E}){const M=Math.max(-t,Math.min(t,e)),g=Math.abs(M)/t*50,p=m&&(u?e>0:e<0),f=m&&(u?e<0:e>0),$=p?"bg-red-500":f?"bg-green-500":"bg-muted-foreground/40",F=p?"text-red-600 dark:text-red-400":f?"text-green-600 dark:text-green-400":"text-muted-foreground";return a.jsxs("div",{className:s("flex items-center gap-2 w-full",E),children:[a.jsxs("div",{className:s("relative flex-1 min-w-[80px] bg-muted rounded overflow-hidden",P),role:"meter","aria-valuenow":e,"aria-valuemin":-t,"aria-valuemax":t,children:[a.jsx("div",{className:"absolute inset-y-0 left-1/2 w-px bg-border"}),a.jsx("div",{className:s("absolute inset-y-0",$),style:e>=0?{left:"50%",width:`${g}%`}:{right:"50%",width:`${g}%`}})]}),a.jsx("span",{className:s("text-xs tabular-nums w-16 text-right",F,m&&"font-semibold"),children:V(e)})]})}try{d.displayName="SignedDeltaBar",d.__docgenInfo={description:"",displayName:"SignedDeltaBar",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:"Signed value to visualize. Negative grows left, positive grows right.",name:"value",required:!0,tags:{},type:{name:"number"}},max:{defaultValue:{value:"50"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:"Magnitude (in `value` units) that maps to a full half-bar. Larger values clamp.",name:"max",required:!1,tags:{},type:{name:"number"}},significant:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:`When false the bar renders muted, signalling the delta is not meaningful
(e.g. below a statistical-significance threshold).`,name:"significant",required:!1,tags:{},type:{name:"boolean"}},positiveIsBad:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:'Treat positive values as the "bad" direction (red) and negative as "good"\n(green). Benchmarks pass `true` — a positive runtime delta is a regression.\nDefaults to `false`, where positive is green and negative is red.',name:"positiveIsBad",required:!1,tags:{},type:{name:"boolean"}},format:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:"Formats the trailing label. Defaults to a signed two-decimal percentage.",name:"format",required:!1,tags:{},type:{name:"(value: number) => string"}},height:{defaultValue:{value:"h-4"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:"Height utility class, e.g. `h-4`.",name:"height",required:!1,tags:{},type:{name:"string"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx",name:"TypeLiteral"}],description:"Classes applied to the root.",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const H={title:"Charts/SignedDeltaBar",component:d,args:{value:12.4,max:50,significant:!0,positiveIsBad:!1,height:"h-4"},argTypes:{value:{control:{type:"number",min:-250,max:250,step:.1}},max:{control:{type:"number",min:1,max:250,step:1}},significant:{control:"boolean"},positiveIsBad:{control:"boolean"},height:{control:"select",options:["h-2","h-3","h-4","h-5"]},format:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Centered, bidirectional bar for a signed delta. Grows right for positive and left for negative, clamped at ±max. Color encodes direction (good/bad) and the bar mutes when not significant. Use `positiveIsBad` to flip semantics (e.g. benchmark regressions)."}}}},r={},i={args:{value:-8.1}},n={args:{value:0}},l={args:{value:-3.2,significant:!1}},o={args:{value:220,max:50}},c={render:()=>a.jsx("div",{className:"w-80 space-y-2",children:[{label:"BenchParse",value:14.2},{label:"BenchEncode",value:-22.6},{label:"BenchScan",value:1.1,significant:!1},{label:"BenchSort",value:-4.8}].map(e=>a.jsxs("div",{className:"flex items-center gap-3 text-xs",children:[a.jsx("span",{className:"w-24 font-mono text-muted-foreground",children:e.label}),a.jsx(d,{value:e.value,positiveIsBad:!0,significant:e.significant??!0})]},e.label))})};var h,v,x;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:"{}",...(x=(v=r.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var b,y,B;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    value: -8.1
  }
}`,...(B=(y=i.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var N,S,k;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    value: 0
  }
}`,...(k=(S=n.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var w,D,j;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    value: -3.2,
    significant: false
  }
}`,...(j=(D=l.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var _,T,C;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    value: 220,
    max: 50
  }
}`,...(C=(T=o.parameters)==null?void 0:T.docs)==null?void 0:C.source}}};var L,q,I;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <div className="w-80 space-y-2">
      {[{
      label: "BenchParse",
      value: 14.2
    }, {
      label: "BenchEncode",
      value: -22.6
    }, {
      label: "BenchScan",
      value: 1.1,
      significant: false
    }, {
      label: "BenchSort",
      value: -4.8
    }].map(row => <div key={row.label} className="flex items-center gap-3 text-xs">
          <span className="w-24 font-mono text-muted-foreground">
            {row.label}
          </span>
          <SignedDeltaBar value={row.value} positiveIsBad significant={row.significant ?? true} />
        </div>)}
    </div>
}`,...(I=(q=c.parameters)==null?void 0:q.docs)==null?void 0:I.source}}};const O=["Positive","Negative","Zero","NotSignificant","Clamped","BenchmarkSemantics"];export{c as BenchmarkSemantics,o as Clamped,i as Negative,l as NotSignificant,r as Positive,n as Zero,O as __namedExportsOrder,H as default};

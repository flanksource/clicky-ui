import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./utils-CEDXhWC6.js";function i(e){return`${e>=0?`+`:``}${e.toFixed(2)}%`}function a({value:e,max:t=50,significant:n=!0,positiveIsBad:a=!1,format:s=i,height:c=`h-4`,className:l}){let u=Math.max(-t,Math.min(t,e)),d=Math.abs(u)/t*50,f=n&&(a?e>0:e<0),p=n&&(a?e<0:e>0),m=f?`bg-red-500`:p?`bg-green-500`:`bg-muted-foreground/40`,h=f?`text-red-600 dark:text-red-400`:p?`text-green-600 dark:text-green-400`:`text-muted-foreground`;return(0,o.jsxs)(`div`,{className:r(`flex items-center gap-2 w-full`,l),children:[(0,o.jsxs)(`div`,{className:r(`relative flex-1 min-w-[80px] bg-muted rounded overflow-hidden`,c),role:`meter`,"aria-valuenow":e,"aria-valuemin":-t,"aria-valuemax":t,children:[(0,o.jsx)(`div`,{className:`absolute inset-y-0 left-1/2 w-px bg-border`}),(0,o.jsx)(`div`,{className:r(`absolute inset-y-0`,m),style:e>=0?{left:`50%`,width:`${d}%`}:{right:`50%`,width:`${d}%`}})]}),(0,o.jsx)(`span`,{className:r(`text-xs tabular-nums w-16 text-right`,h,n&&`font-semibold`),children:s(e)})]})}var o;function s(){return(s=e((()=>{n(),o=t();try{a.displayName=`SignedDeltaBar`,a.__docgenInfo={description:``,displayName:`SignedDeltaBar`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,methods:[],props:{value:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:`Signed value to visualize. Negative grows left, positive grows right.`,name:`value`,required:!0,tags:{},type:{name:`number`}},max:{defaultValue:{value:`50`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:"Magnitude (in `value` units) that maps to a full half-bar. Larger values clamp.",name:`max`,required:!1,tags:{},type:{name:`number`}},significant:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:`When false the bar renders muted, signalling the delta is not meaningful
(e.g. below a statistical-significance threshold).`,name:`significant`,required:!1,tags:{},type:{name:`boolean`}},positiveIsBad:{defaultValue:{value:`false`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:'Treat positive values as the "bad" direction (red) and negative as "good"\n(green). Benchmarks pass `true` — a positive runtime delta is a regression.\nDefaults to `false`, where positive is green and negative is red.',name:`positiveIsBad`,required:!1,tags:{},type:{name:`boolean`}},format:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:`Formats the trailing label. Defaults to a signed two-decimal percentage.`,name:`format`,required:!1,tags:{},type:{name:`(value: number) => string`}},height:{defaultValue:{value:`h-4`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:"Height utility class, e.g. `h-4`.",name:`height`,required:!1,tags:{},type:{name:`string`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/SignedDeltaBar.tsx`,name:`TypeLiteral`}],description:`Classes applied to the root.`,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{s(),c=t(),l={title:`Charts/SignedDeltaBar`,component:a,args:{value:12.4,max:50,significant:!0,positiveIsBad:!1,height:`h-4`},argTypes:{value:{control:{type:`number`,min:-250,max:250,step:.1}},max:{control:{type:`number`,min:1,max:250,step:1}},significant:{control:`boolean`},positiveIsBad:{control:`boolean`},height:{control:`select`,options:[`h-2`,`h-3`,`h-4`,`h-5`]},format:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Centered, bidirectional bar for a signed delta. Grows right for positive and left for negative, clamped at ±max. Color encodes direction (good/bad) and the bar mutes when not significant. Use `positiveIsBad` to flip semantics (e.g. benchmark regressions)."}}}},u={},d={args:{value:-8.1}},f={args:{value:0}},p={args:{value:-3.2,significant:!1}},m={args:{value:220,max:50}},h={render:()=>(0,c.jsx)(`div`,{className:`w-80 space-y-2`,children:[{label:`BenchParse`,value:14.2},{label:`BenchEncode`,value:-22.6},{label:`BenchScan`,value:1.1,significant:!1},{label:`BenchSort`,value:-4.8}].map(e=>(0,c.jsxs)(`div`,{className:`flex items-center gap-3 text-xs`,children:[(0,c.jsx)(`span`,{className:`w-24 font-mono text-muted-foreground`,children:e.label}),(0,c.jsx)(a,{value:e.value,positiveIsBad:!0,significant:e.significant??!0})]},e.label))})},g=[`Positive`,`Negative`,`Zero`,`NotSignificant`,`Clamped`,`BenchmarkSemantics`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: -8.1
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: -3.2,
    significant: false
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 220,
    max: 50
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}}})))()}_();export{h as BenchmarkSemantics,m as Clamped,d as Negative,p as NotSignificant,u as Positive,f as Zero,g as __namedExportsOrder,l as default};
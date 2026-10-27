import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{kr as n,n as r}from"./icons-N6BqLuiz.js";import{n as i,t as a}from"./HoverCard-Yg_OM6VY.js";function o(e){let t=e.replace(/[_-]+/g,` `).trim();return t?t[0].toUpperCase()+t.slice(1):e}function s(e){return e>=1e3?`${(e/1e3).toFixed(1)} s`:e<10?`${e.toFixed(1)} ms`:`${Math.round(e)} ms`}function c(e){return e.description&&Object.keys(e.counters).length===0?e.description:u[e.name]??o(e.name)}function l(e){let t=Object.entries(e.counters);if(t.length!==0)return t.map(([e,t])=>{let n=d[e]?.[Math.abs(t)===1?0:1]??o(e).toLowerCase();return`${t.toLocaleString(`en-US`)} ${n}`}).join(` · `)}var u,d;function f(){return(f=e((()=>{u={total:`Total`,command:`Command`,format:`Format response`,sql:`SQL`,redis:`Redis`},d={queries:[`query`,`queries`],rows_returned:[`row returned`,`rows returned`],rows_scanned:[`row scanned`,`rows scanned`],ops:[`operation`,`operations`],hits:[`hit`,`hits`],misses:[`miss`,`misses`],errors:[`error`,`errors`]}})))()}function p({metrics:e,placement:t=`bottom`,className:r}){let i=e?.find(e=>e.name===`total`);if(!i)return null;let o=e?.filter(e=>e.name!==`total`)??[],u=Math.max(1,...o.map(e=>e.duration));return(0,m.jsx)(a,{placement:t,arrow:!1,trigger:(0,m.jsxs)(`button`,{type:`button`,"aria-label":`Show server timing`,className:`inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground`,children:[(0,m.jsx)(n,{className:`h-3.5 w-3.5`}),s(i.duration)]}),cardClassName:`w-64 whitespace-normal p-2.5`,className:r,children:(0,m.jsxs)(`div`,{className:`space-y-2`,children:[(0,m.jsxs)(`div`,{className:`flex items-center justify-between gap-4 text-xs font-medium`,children:[(0,m.jsx)(`span`,{className:`text-foreground`,children:`Server timing`}),(0,m.jsx)(`span`,{className:`tabular-nums text-muted-foreground`,children:s(i.duration)})]}),o.length===0?(0,m.jsx)(`div`,{className:`text-[11px] text-muted-foreground`,children:`No phase breakdown.`}):(0,m.jsx)(`ul`,{className:`space-y-2`,children:o.map((e,t)=>{let n=l(e);return(0,m.jsxs)(`li`,{children:[(0,m.jsxs)(`div`,{className:`flex items-center justify-between gap-4 text-[11px]`,children:[(0,m.jsx)(`span`,{className:`text-muted-foreground`,children:c(e)}),(0,m.jsx)(`span`,{className:`shrink-0 tabular-nums text-foreground`,children:s(e.duration)})]}),n?(0,m.jsx)(`div`,{className:`mt-0.5 text-[10px] text-muted-foreground`,children:n}):null,(0,m.jsx)(`div`,{className:`mt-1 h-1 overflow-hidden rounded-full bg-muted`,children:(0,m.jsx)(`div`,{className:`h-full rounded-full bg-primary/70`,style:{width:e.duration===0?`0%`:`${Math.max(e.duration/u*100,4)}%`}})})]},`${e.name}-${t}`)})})]})})}var m;function h(){return(h=e((()=>{r(),i(),f(),m=t();try{p.displayName=`ServerTimingBadge`,p.__docgenInfo={description:``,displayName:`ServerTimingBadge`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,methods:[],props:{metrics:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`}],description:``,name:`metrics`,parent:{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`},required:!1,tags:{},type:{name:`readonly ServerTimingMetric[]`}},placement:{defaultValue:{value:`bottom`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`}],description:``,name:`placement`,parent:{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`},required:!1,tags:{},type:{name:`enum`,raw:`HoverCardPlacement`,value:[{value:`"left"`},{value:`"right"`},{value:`"top"`},{value:`"bottom"`}]}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`}],description:``,name:`className`,parent:{fileName:`clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx`,name:`ServerTimingBadgeProps`},required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{h(),{expect:g,userEvent:_,within:v}=__STORYBOOK_MODULE_TEST__,y={title:`Data/ServerTimingBadge`,component:p,tags:[`autodocs`],args:{metrics:[{name:`total`,duration:120.5,counters:{}},{name:`command`,duration:95.2,counters:{}},{name:`format`,duration:4.1,counters:{}},{name:`sql`,duration:18.6,description:`queries=2 rows_returned=501`,counters:{queries:2,rows_returned:501}},{name:`redis`,duration:1.2,description:`ops=3 hits=2 misses=1 errors=0`,counters:{ops:3,hits:2,misses:1,errors:0}}]},parameters:{docs:{description:{component:`Compact Server-Timing badge with a hover and focus breakdown of request phases and diagnostic counters.`}}}},b={play:async({canvasElement:e})=>{let t=v(e).getByRole(`button`,{name:`Show server timing`});await _.hover(t),await g(v(document.body).getByText(/501 rows returned/)).toBeVisible()}},x={args:{metrics:[{name:`total`,duration:8.2,counters:{}},{name:`sql`,duration:0,description:`queries=0 rows_returned=0`,counters:{queries:0,rows_returned:0}},{name:`redis`,duration:0,description:`ops=0 hits=0 misses=0 errors=0`,counters:{ops:0,hits:0,misses:0,errors:0}}]}},S={args:{metrics:[{name:`total`,duration:12035.3,counters:{}},{name:`command`,duration:12020.1,counters:{}},{name:`format`,duration:15.2,counters:{}}]}},C=[`Default`,`NoBackendActivity`,`MultiSecond`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show server timing"
    });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText(/501 rows returned/)).toBeVisible();
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: [{
      name: "total",
      duration: 8.2,
      counters: {}
    }, {
      name: "sql",
      duration: 0,
      description: "queries=0 rows_returned=0",
      counters: {
        queries: 0,
        rows_returned: 0
      }
    }, {
      name: "redis",
      duration: 0,
      description: "ops=0 hits=0 misses=0 errors=0",
      counters: {
        ops: 0,
        hits: 0,
        misses: 0,
        errors: 0
      }
    }]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: [{
      name: "total",
      duration: 12035.3,
      counters: {}
    }, {
      name: "command",
      duration: 12020.1,
      counters: {}
    }, {
      name: "format",
      duration: 15.2,
      counters: {}
    }]
  }
}`,...S.parameters?.docs?.source}}}})))()}w();export{b as Default,S as MultiSecond,x as NoBackendActivity,C as __namedExportsOrder,y as default};
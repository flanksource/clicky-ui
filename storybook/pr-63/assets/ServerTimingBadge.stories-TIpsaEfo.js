import{j as r,Q as _}from"./iframe-DQ4bl7_4.js";import{H as j}from"./HoverCard-rof_d5zl.js";import"./preload-helper-Bz0j3TbD.js";import"./index-COx9F93F.js";import"./index-CSwS8kWJ.js";import"./utils-CR52uffu.js";import"./modalStack-iZddL8t7.js";import"./zIndex-BGbNBNA8.js";const k={total:"Total",command:"Command",format:"Format response",sql:"SQL",redis:"Redis"},q={queries:["query","queries"],rows_returned:["row returned","rows returned"],rows_scanned:["row scanned","rows scanned"],ops:["operation","operations"],hits:["hit","hits"],misses:["miss","misses"],errors:["error","errors"]};function N(e){const n=e.replace(/[_-]+/g," ").trim();return n?n[0].toUpperCase()+n.slice(1):e}function m(e){return e>=1e3?`${(e/1e3).toFixed(1)} s`:e<10?`${e.toFixed(1)} ms`:`${Math.round(e)} ms`}function E(e){return e.description&&Object.keys(e.counters).length===0?e.description:k[e.name]??N(e.name)}function C(e){const n=Object.entries(e.counters);if(n.length!==0)return n.map(([o,s])=>{const a=q[o],u=(a==null?void 0:a[Math.abs(s)===1?0:1])??N(o).toLowerCase();return`${s.toLocaleString("en-US")} ${u}`}).join(" · ")}function l({metrics:e,placement:n="bottom",className:o}){const s=e==null?void 0:e.find(t=>t.name==="total");if(!s)return null;const a=(e==null?void 0:e.filter(t=>t.name!=="total"))??[],u=Math.max(1,...a.map(t=>t.duration));return r.jsx(j,{placement:n,arrow:!1,trigger:r.jsxs("button",{type:"button","aria-label":"Show server timing",className:"inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",children:[r.jsx(_,{className:"h-3.5 w-3.5"}),m(s.duration)]}),cardClassName:"w-64 whitespace-normal p-2.5",className:o,children:r.jsxs("div",{className:"space-y-2",children:[r.jsxs("div",{className:"flex items-center justify-between gap-4 text-xs font-medium",children:[r.jsx("span",{className:"text-foreground",children:"Server timing"}),r.jsx("span",{className:"tabular-nums text-muted-foreground",children:m(s.duration)})]}),a.length===0?r.jsx("div",{className:"text-[11px] text-muted-foreground",children:"No phase breakdown."}):r.jsx("ul",{className:"space-y-2",children:a.map((t,B)=>{const p=C(t);return r.jsxs("li",{children:[r.jsxs("div",{className:"flex items-center justify-between gap-4 text-[11px]",children:[r.jsx("span",{className:"text-muted-foreground",children:E(t)}),r.jsx("span",{className:"shrink-0 tabular-nums text-foreground",children:m(t.duration)})]}),p?r.jsx("div",{className:"mt-0.5 text-[10px] text-muted-foreground",children:p}):null,r.jsx("div",{className:"mt-1 h-1 overflow-hidden rounded-full bg-muted",children:r.jsx("div",{className:"h-full rounded-full bg-primary/70",style:{width:t.duration===0?"0%":`${Math.max(t.duration/u*100,4)}%`}})})]},`${t.name}-${B}`)})})]})})}try{l.displayName="ServerTimingBadge",l.__docgenInfo={description:"",displayName:"ServerTimingBadge",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",methods:[],props:{metrics:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"}],description:"",name:"metrics",parent:{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"},required:!1,tags:{},type:{name:"readonly ServerTimingMetric[]"}},placement:{defaultValue:{value:"bottom"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"}],description:"",name:"placement",parent:{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"},required:!1,tags:{},type:{name:"enum",raw:"HoverCardPlacement",value:[{value:'"left"'},{value:'"right"'},{value:'"top"'},{value:'"bottom"'}]}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"}],description:"",name:"className",parent:{fileName:"clicky-ui/packages/ui/src/data/ServerTimingBadge.tsx",name:"ServerTimingBadgeProps"},required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:M,userEvent:L,within:g}=__STORYBOOK_MODULE_TEST__,O=[{name:"total",duration:120.5,counters:{}},{name:"command",duration:95.2,counters:{}},{name:"format",duration:4.1,counters:{}},{name:"sql",duration:18.6,description:"queries=2 rows_returned=501",counters:{queries:2,rows_returned:501}},{name:"redis",duration:1.2,description:"ops=3 hits=2 misses=1 errors=0",counters:{ops:3,hits:2,misses:1,errors:0}}],H={title:"Data/ServerTimingBadge",component:l,tags:["autodocs"],args:{metrics:O},parameters:{docs:{description:{component:"Compact Server-Timing badge with a hover and focus breakdown of request phases and diagnostic counters."}}}},i={play:async({canvasElement:e})=>{const n=g(e).getByRole("button",{name:"Show server timing"});await L.hover(n),await M(g(document.body).getByText(/501 rows returned/)).toBeVisible()}},c={args:{metrics:[{name:"total",duration:8.2,counters:{}},{name:"sql",duration:0,description:"queries=0 rows_returned=0",counters:{queries:0,rows_returned:0}},{name:"redis",duration:0,description:"ops=0 hits=0 misses=0 errors=0",counters:{ops:0,hits:0,misses:0,errors:0}}]}},d={args:{metrics:[{name:"total",duration:12035.3,counters:{}},{name:"command",duration:12020.1,counters:{}},{name:"format",duration:15.2,counters:{}}]}};var f,x,h;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show server timing"
    });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText(/501 rows returned/)).toBeVisible();
  }
}`,...(h=(x=i.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var v,w,y;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(y=(w=c.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var S,b,T;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(T=(b=d.parameters)==null?void 0:b.docs)==null?void 0:T.source}}};const I=["Default","NoBackendActivity","MultiSecond"];export{i as Default,d as MultiSecond,c as NoBackendActivity,I as __namedExportsOrder,H as default};

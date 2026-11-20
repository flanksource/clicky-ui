import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./event-source-provider-BZJpd1_z.js";import{n as a,r as o}from"./QueryClientProvider-b6YDq6fV.js";import{n as s,t as c}from"./queryClient-lXfmqi15.js";import{n as l,r as u,t as d}from"./TaskPoolUsage-BB0WfZTo.js";import{i as f,n as p,r as m,t as h}from"./timeseries-stream.fixtures-CMWUU7OQ.js";function g(e){return t=>{let n=new h(t),r=Date.now(),i=n.ids.flatMap(t=>{let n=e[t];return n===void 0?[]:[{id:t,source:t,points:Array.from({length:15},(e,t)=>({at:new Date(r-(14-t)*6e4).toISOString(),value:n}))}]}),a=setTimeout(()=>n.emit(`snapshot`,{series:i}),50);return n.onClose=()=>clearTimeout(a),n}}function _({state:e,runId:t}){let[n]=(0,v.useState)(()=>new c),[r]=(0,v.useState)(()=>g(e));return(0,y.jsx)(a,{client:n,children:(0,y.jsx)(i,{value:r,children:(0,y.jsx)(m,{children:(0,y.jsxs)(`div`,{className:`space-y-3`,children:[(0,y.jsx)(d,{basePath:`/api/v1`}),t?(0,y.jsx)(l,{basePath:`/api/v1`,runId:t}):null]})})})})}var v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{s(),o(),v=t(),r(),f(),p(),u(),y=n(),{expect:b,within:x}=__STORYBOOK_MODULE_TEST__,S=`commit-gavel`,C={"pool:workers-busy":0,"pool:workers-limit":4,"pool:slots-used":0,"pool:slots-capacity":4,"pool:queued":0,"pool:supervisors":0},w={"pool:workers-busy":4,"pool:workers-limit":4,"pool:slots-used":4,"pool:slots-capacity":4,"pool:queued":9,"pool:supervisors":1,[`${S}:concurrency-running`]:1,[`${S}:concurrency-limit`]:1,[`${S}:concurrency-waiting`]:3},T={title:`Data/TaskPoolUsage`,component:_},E={args:{state:C},play:async({canvasElement:e})=>{let t=x(e);await b(await t.findByLabelText(`Workers busy: 0`)).toBeInTheDocument()}},D={args:{state:w,runId:S},play:async({canvasElement:e})=>{let t=x(e);await b(await t.findByLabelText(`Workers busy: 4`)).toBeInTheDocument(),await b(await t.findByLabelText(`Queued: 9`)).toBeInTheDocument(),await b(await t.findByLabelText(`Waiting for a permit: 3`)).toBeInTheDocument()}},O=[`Idle`,`SaturatedWithThrottledRun`],E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    state: IDLE
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Workers busy: 0")).toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    state: SATURATED,
    runId: RUN_ID
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Workers busy: 4")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Queued: 9")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Waiting for a permit: 3")).toBeInTheDocument();
  }
}`,...D.parameters?.docs?.source}}}})))()}k();export{E as Idle,D as SaturatedWithThrottledRun,O as __namedExportsOrder,T as default};
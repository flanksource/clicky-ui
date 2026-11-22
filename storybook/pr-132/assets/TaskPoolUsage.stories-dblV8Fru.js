import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./event-source-provider-BZJpd1_z.js";import{n as a,r as o}from"./QueryClientProvider-b6YDq6fV.js";import{n as s,t as c}from"./queryClient-lXfmqi15.js";import{i as l,n as u,r as d,t as f}from"./TaskPoolUsage-SxxcXSmi.js";import{i as p,n as m,r as h,t as g}from"./timeseries-stream.fixtures-CMWUU7OQ.js";function _(e){return t=>{let n=new g(t),r=Date.now(),i=n.ids.flatMap(t=>{let n=e[t];return n===void 0?[]:[{id:t,source:t,points:Array.from({length:15},(e,t)=>({at:new Date(r-(14-t)*6e4).toISOString(),value:n}))}]}),a=setTimeout(()=>n.emit(`snapshot`,{series:i}),50);return n.onClose=()=>clearTimeout(a),n}}function v({state:e,runId:t,collapsed:n}){let[r]=(0,y.useState)(()=>new c),[o]=(0,y.useState)(()=>_(e)),[s,l]=(0,y.useState)(!1);return(0,b.jsx)(a,{client:r,children:(0,b.jsx)(i,{value:o,children:(0,b.jsx)(h,{children:(0,b.jsxs)(`div`,{className:`space-y-3`,style:n?{width:360}:void 0,children:[n?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(f,{basePath:`/api/v1`,expanded:s,onExpandedChange:l,controls:`story-pool-gauges`}),s?(0,b.jsx)(u,{id:`story-pool-gauges`,basePath:`/api/v1`}):null]}):(0,b.jsx)(u,{basePath:`/api/v1`}),t?(0,b.jsx)(d,{basePath:`/api/v1`,runId:t}):null]})})})})}var y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{s(),o(),y=t(),r(),p(),m(),l(),b=n(),{expect:x,userEvent:S,within:C}=__STORYBOOK_MODULE_TEST__,w=`commit-gavel`,T={"pool:workers-busy":0,"pool:workers-limit":4,"pool:slots-used":0,"pool:slots-capacity":4,"pool:queued":0,"pool:supervisors":0},E={"pool:workers-busy":4,"pool:workers-limit":4,"pool:slots-used":4,"pool:slots-capacity":4,"pool:queued":9,"pool:supervisors":1,[`${w}:concurrency-running`]:1,[`${w}:concurrency-limit`]:1,[`${w}:concurrency-waiting`]:3},D={title:`Data/TaskPoolUsage`,component:v},O={args:{state:T},play:async({canvasElement:e})=>{let t=C(e);await x(await t.findByLabelText(`Workers busy: 0`)).toBeInTheDocument()}},k={args:{state:E,runId:w},play:async({canvasElement:e})=>{let t=C(e);await x(await t.findByLabelText(`Workers busy: 4`)).toBeInTheDocument(),await x(await t.findByLabelText(`Queued: 9`)).toBeInTheDocument(),await x(await t.findByLabelText(`Waiting for a permit: 3`)).toBeInTheDocument()}},A={args:{state:E,collapsed:!0},play:async({canvasElement:e})=>{let t=C(e),n=await t.findByRole(`button`,{name:`Worker pool: 4 busy · 4 slots · 9 queued · 1 supervisor`});await x(n).toHaveAttribute(`aria-expanded`,`false`),await S.click(n),await x(await t.findByLabelText(`Queued: 9`)).toBeInTheDocument()}},j=[`Idle`,`SaturatedWithThrottledRun`,`CollapsedSummary`],O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    state: IDLE
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Workers busy: 0")).toBeInTheDocument();
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    state: SATURATED,
    collapsed: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole("button", {
      name: "Worker pool: 4 busy · 4 slots · 9 queued · 1 supervisor"
    });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(await canvas.findByLabelText("Queued: 9")).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source}}}})))()}M();export{A as CollapsedSummary,O as Idle,k as SaturatedWithThrottledRun,j as __namedExportsOrder,D as default};
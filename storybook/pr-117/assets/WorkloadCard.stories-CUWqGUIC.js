import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{g as r,h as i}from"./suspense-Bcp9qyqt.js";import{n as a,t as o}from"./queryClient-BlbTeML9.js";import{n as s,t as c}from"./WorkloadCard-DaFozr0A.js";function l(e){return Array.from({length:12},(t,n)=>({at:new Date(w+n*3e4).toISOString(),value:e*(.72+n/11*.28)}))}function u(e){return async t=>({id:t,points:l((e.find(e=>t.includes(e.match))??e[0])?.latest??0)})}function d(e){return u([{match:`cpu.usage`,latest:e.cpuValue},{match:`cpu.limit`,latest:e.cpuMax},{match:`memory.usage`,latest:e.memoryValue},{match:`memory.limit`,latest:e.memoryMax},{match:`disk.usage`,latest:e.diskValue},{match:`disk.limit`,latest:e.diskMax}])}function f(e){return{kind:e.kind,name:e.name,...e.namespace?{namespace:e.namespace}:{},...e.role?{role:e.role}:{},createdAt:`2026-06-01T08:00:00Z`,replicas:{ready:e.readyReplicas,desired:e.desiredReplicas},status:{health:e.statusHealth,code:e.statusCode,message:`${e.name} is ${e.statusHealth}`}}}function p(e){return{cpu:{value:{id:`workload.cpu.usage`},max:{id:`workload.cpu.limit`},orientation:`vertical`},memory:{value:{id:`workload.memory.usage`},max:{id:`workload.memory.limit`}},...e.showDisk?{disk:{value:{id:`workload.disk.usage`},max:{id:`workload.disk.limit`}}}:{}}}function m(e){let t=(0,b.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[e.cpuValue,e.cpuMax,e.memoryValue,e.memoryMax,e.diskValue,e.diskMax,e.showDisk]);return(0,x.jsx)(i,{client:t,children:(0,x.jsx)(`div`,{className:T[e.size??`md`],children:(0,x.jsx)(c,{workload:f(e),metrics:p(e),...e.baseUrl===void 0?{}:{baseUrl:e.baseUrl},...e.range===void 0?{}:{range:e.range},...e.refreshMs===void 0?{}:{refreshMs:e.refreshMs},...e.expandable===void 0?{}:{expandable:e.expandable},...e.size===void 0?{}:{size:e.size},...e.variant===void 0?{}:{variant:e.variant},...e.className===void 0?{}:{className:e.className},fetcher:e.fetcher??d(e)})})})}function h(){let e=(0,b.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),t=[{...D,name:`cycle`,role:`api`,statusHealth:`healthy`,statusCode:`Ready`},{...D,kind:`statefulset`,name:`activemq`,role:`queue`,statusHealth:`warning`,statusCode:`Degraded`,cpuValue:3200,cpuMax:4e3,memoryValue:66e8},{...D,kind:`pod`,name:`cycle-worker-746bc9`,role:`worker`,readyReplicas:1,desiredReplicas:1,cpuValue:950,cpuMax:1e3,memoryValue:17e8,memoryMax:2e9,diskValue:92e8,size:`sm`,variant:`outline`},{...D,kind:`ingress`,name:`edge.example.com`,role:`edge`,showDisk:!1,readyReplicas:0,desiredReplicas:0,cpuValue:120,cpuMax:500,memoryValue:18e7,memoryMax:512e6,size:`sm`,variant:`ghost`}];return(0,x.jsx)(i,{client:e,children:(0,x.jsx)(`div`,{className:`grid w-[52rem] grid-cols-2 gap-3`,children:t.map(e=>(0,x.jsx)(c,{workload:f(e),metrics:p(e),...e.baseUrl===void 0?{}:{baseUrl:e.baseUrl},...e.range===void 0?{}:{range:e.range},...e.refreshMs===void 0?{}:{refreshMs:e.refreshMs},...e.expandable===void 0?{}:{expandable:e.expandable},...e.size===void 0?{}:{size:e.size},...e.variant===void 0?{}:{variant:e.variant},fetcher:d(e)},`${e.kind}:${e.name}`))})})}function g(){let e=(0,b.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,x.jsx)(i,{client:e,children:(0,x.jsx)(`div`,{className:`grid w-[64rem] grid-cols-[18rem_24rem_30rem] items-start gap-4`,children:[`sm`,`md`,`lg`].map(e=>{let t={...D,size:e,name:e===`sm`?`cycle-worker`:`cycle`,variant:e===`sm`?`subtle`:`default`};return(0,x.jsx)(c,{size:e,variant:t.variant,workload:f(t),metrics:p(t),fetcher:d(t),refreshMs:0},e)})})})}function _(){let e=(0,b.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,x.jsx)(i,{client:e,children:(0,x.jsx)(`div`,{className:`grid w-[64rem] grid-cols-2 gap-3 bg-background p-1`,children:[`default`,`outline`,`subtle`,`elevated`,`ghost`].map(e=>{let t={...D,variant:e,name:`${e}-cycle`,statusHealth:e===`ghost`?`warning`:`healthy`,statusCode:e===`ghost`?`Reconciling`:`Ready`};return(0,x.jsx)(c,{variant:e,workload:f(t),metrics:p(t),fetcher:d(t),refreshMs:0},e)})})})}function v(e,t){return async({signal:n})=>(n.throwIfAborted(),{id:e,points:l(t)})}function y(){let e=(0,b.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),t=[{id:`i-0a1b2c3d`,name:`build-runner-1`,region:`us-east-1`,size:`m6i.large`,health:`healthy`,label:`running`,cpu:1200,memory:5.5*E},{id:`i-9f8e7d6c`,name:`build-runner-2`,region:`eu-west-1`,size:`m6i.xlarge`,health:`warning`,label:`impaired`,cpu:3500,memory:13*E}];return(0,x.jsx)(i,{client:e,children:(0,x.jsx)(`div`,{className:`grid w-[52rem] grid-cols-2 gap-3`,children:t.map(e=>(0,x.jsx)(c,{workload:{type:`EC2 instance`,name:e.name,createdAt:`2026-05-28T09:30:00Z`,status:{label:e.label,health:e.health},metadata:[{label:`region`,value:e.region},{label:`size`,value:e.size},{label:`id`,value:(0,x.jsx)(`code`,{children:e.id})}]},metrics:{cpu:{value:{id:`${e.id}.cpu`,load:v(`${e.id}.cpu`,e.cpu)},max:4e3},memory:{value:{id:`${e.id}.memory`,load:v(`${e.id}.memory`,e.memory)},max:16*E}},refreshMs:0},e.id))})})}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{b=t(),a(),r(),s(),x=n(),{expect:S,within:C}=__STORYBOOK_MODULE_TEST__,w=Date.parse(`2026-06-02T12:00:00Z`),T={sm:`w-72`,md:`w-[24rem]`,lg:`w-[30rem]`},E=1024**3,D={workload:{kind:`deployment`,name:`cycle`},metrics:{cpu:{value:{id:`workload.cpu.usage`},max:{id:`workload.cpu.limit`}},memory:{value:{id:`workload.memory.usage`},max:{id:`workload.memory.limit`}},disk:{value:{id:`workload.disk.usage`},max:{id:`workload.disk.limit`}}},kind:`deployment`,name:`cycle`,namespace:`ops`,role:`api`,statusHealth:`healthy`,statusCode:`Ready`,readyReplicas:3,desiredReplicas:3,cpuValue:2300,cpuMax:4e3,memoryValue:32e8,memoryMax:8e9,diskValue:18e9,diskMax:64e9,showDisk:!0,baseUrl:`/api/v1/metrics/`,range:`1h`,refreshMs:0,expandable:!0,size:`md`,variant:`default`},O={title:`Charts/WorkloadCard`,component:c,parameters:{docs:{description:{component:`Compact workload resource card backed by the shared time-series primitives. Callers pass explicit CPU, memory, and disk series; the card composes live CPU core bars, memory/disk gauges, and a card-level history modal.`}}},args:D,argTypes:{kind:{control:`select`,options:[`service`,`ingress`,`deployment`,`statefulset`,`pod`]},name:{control:`text`},namespace:{control:`text`},role:{control:`text`},statusHealth:{name:`status`,control:`select`,options:[`healthy`,`warning`,`unhealthy`,`unknown`]},statusCode:{control:`text`},readyReplicas:{control:{type:`number`,min:0,step:1}},desiredReplicas:{control:{type:`number`,min:0,step:1}},cpuValue:{name:`CPU usage`,control:{type:`number`,min:0,step:100}},cpuMax:{name:`CPU max`,control:{type:`number`,min:100,step:100}},memoryValue:{name:`memory usage`,control:{type:`number`,min:0,step:1e8}},memoryMax:{name:`memory max`,control:{type:`number`,min:1,step:1e8}},diskValue:{name:`disk usage`,control:{type:`number`,min:0,step:1e9}},diskMax:{name:`disk max`,control:{type:`number`,min:1,step:1e9}},showDisk:{control:`boolean`},size:{control:`inline-radio`,options:[`sm`,`md`,`lg`]},variant:{control:`select`,options:[`default`,`outline`,`subtle`,`elevated`,`ghost`]},baseUrl:{control:`text`},range:{control:`text`},refreshMs:{control:{type:`number`,min:0,step:1e3}},expandable:{control:`boolean`},workload:{table:{disable:!0}},metrics:{table:{disable:!0}},fetcher:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,x.jsx)(m,{...e})},k={},A={args:{kind:`statefulset`,name:`activemq`,role:`queue`,statusHealth:`warning`,statusCode:`Degraded`,cpuValue:3200,memoryValue:66e8}},j={args:{kind:`pod`,name:`cycle-worker-746bc9`,role:`worker`,readyReplicas:1,desiredReplicas:1,cpuValue:950,cpuMax:1e3,memoryValue:17e8,memoryMax:2e9}},M={args:{kind:`service`,name:`cycle-svc`,role:`internal`,showDisk:!1,cpuValue:260,cpuMax:500,memoryValue:256e6,memoryMax:512e6}},N={args:{kind:`ingress`,name:`edge.example.com`,role:`edge`,showDisk:!1,readyReplicas:0,desiredReplicas:0,cpuValue:120,cpuMax:500,memoryValue:18e7,memoryMax:512e6}},P={args:{statusHealth:`unhealthy`,statusCode:`CrashLoopBackOff`,cpuValue:3900,cpuMax:4e3,memoryValue:77e8,diskValue:61e9}},F={args:{showDisk:!1}},I={args:{size:`sm`,variant:`subtle`,name:`cycle-worker`}},L={args:{size:`lg`,variant:`elevated`,name:`cycle-api`}},R={render:()=>(0,x.jsx)(g,{})},z={render:()=>(0,x.jsx)(_,{})},B={render:()=>(0,x.jsx)(h,{})},V={render:()=>(0,x.jsx)(y,{}),play:async({canvasElement:e})=>{let t=C(e);await S(t.getAllByText(`EC2 instance`)).toHaveLength(2),await S(t.getByText(`us-east-1`)).toBeInTheDocument(),await S(await t.findByText(`1.2 cores`)).toBeInTheDocument()}},H=[`Deployment`,`StatefulSet`,`Pod`,`Service`,`Ingress`,`Danger`,`WithoutDisk`,`Small`,`Large`,`Sizes`,`Variants`,`Grid`,`NonKubernetes`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "statefulset",
    name: "activemq",
    role: "queue",
    statusHealth: "warning",
    statusCode: "Degraded",
    cpuValue: 3200,
    memoryValue: 6_600_000_000
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "pod",
    name: "cycle-worker-746bc9",
    role: "worker",
    readyReplicas: 1,
    desiredReplicas: 1,
    cpuValue: 950,
    cpuMax: 1000,
    memoryValue: 1_700_000_000,
    memoryMax: 2_000_000_000
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "service",
    name: "cycle-svc",
    role: "internal",
    showDisk: false,
    cpuValue: 260,
    cpuMax: 500,
    memoryValue: 256_000_000,
    memoryMax: 512_000_000
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "ingress",
    name: "edge.example.com",
    role: "edge",
    showDisk: false,
    readyReplicas: 0,
    desiredReplicas: 0,
    cpuValue: 120,
    cpuMax: 500,
    memoryValue: 180_000_000,
    memoryMax: 512_000_000
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    statusHealth: "unhealthy",
    statusCode: "CrashLoopBackOff",
    cpuValue: 3900,
    cpuMax: 4000,
    memoryValue: 7_700_000_000,
    diskValue: 61_000_000_000
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    showDisk: false
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm",
    variant: "subtle",
    name: "cycle-worker"
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg",
    variant: "elevated",
    name: "cycle-api"
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <WorkloadCardSizeGallery />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <WorkloadCardVariantGallery />
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <WorkloadCardGrid />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <NonKubernetesWorkloads />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("EC2 instance")).toHaveLength(2);
    await expect(canvas.getByText("us-east-1")).toBeInTheDocument();
    await expect(await canvas.findByText("1.2 cores")).toBeInTheDocument();
  }
}`,...V.parameters?.docs?.source},description:{story:'Workloads that aren\'t Kubernetes resources: no `kind`, a free-form `type`\nlabel, caller-defined `metadata`, and metrics loaded by `load` functions\nwith fixed numeric capacities (drawn as a "capacity" line in the history).',...V.parameters?.docs?.description}}}})))()}U();export{P as Danger,k as Deployment,B as Grid,N as Ingress,L as Large,V as NonKubernetes,j as Pod,M as Service,R as Sizes,I as Small,A as StatefulSet,z as Variants,F as WithoutDisk,H as __namedExportsOrder,O as default};
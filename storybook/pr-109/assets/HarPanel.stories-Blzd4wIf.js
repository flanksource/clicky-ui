import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./HarPanel-DE4BypR3.js";function a(e,t){return{startedDateTime:e.toISOString(),time:t,_id:`req-cycles-run`,_pending:!0,request:{method:`POST`,url:`https://api.example.com/v1/cycles/run`,headers:[{name:`content-type`,value:`application/json`}],postData:{mimeType:`application/json`,text:JSON.stringify({cycle:`nightly`})},bodySize:20},response:{status:0,bodySize:0}}}function o(e,t){return{startedDateTime:e.toISOString(),time:3e4,_id:`req-activities-pending`,_error:t,request:{method:`GET`,url:`https://api.example.com/v1/activities/pending`,headers:[],bodySize:0},response:{status:0,bodySize:0}}}var s;function c(){return(c=e((()=>{s=[{startedDateTime:new Date().toISOString(),time:123,request:{method:`GET`,url:`https://api.example.com/v1/configs`,httpVersion:`HTTP/1.1`,headers:[{name:`accept`,value:`application/json`},{name:`authorization`,value:`Bearer ***`}],queryString:[],bodySize:0},response:{status:200,statusText:`OK`,headers:[{name:`content-type`,value:`application/json`}],content:{size:64,mimeType:`application/json`,text:JSON.stringify({items:[{id:1,name:`db`}]},null,2)},bodySize:64}},{startedDateTime:new Date().toISOString(),time:420,request:{method:`POST`,url:`https://api.example.com/v1/configs`,headers:[{name:`content-type`,value:`application/json`}],postData:{mimeType:`application/json`,text:JSON.stringify({name:`new-config`})},bodySize:24},response:{status:201,headers:[{name:`content-type`,value:`application/json`}],content:{size:18,mimeType:`application/json`,text:`{"id":"abc"}`},bodySize:18}},{startedDateTime:new Date().toISOString(),time:88,request:{method:`GET`,url:`https://api.example.com/v1/missing`,headers:[],bodySize:0},response:{status:404,headers:[],content:{size:9,mimeType:`text/plain`,text:`Not found`},bodySize:9}},{startedDateTime:new Date().toISOString(),time:1200,request:{method:`GET`,url:`https://api.example.com/v1/slow`,headers:[],bodySize:0},response:{status:503,headers:[],content:{size:22,mimeType:`text/plain`,text:`Service Unavailable`},bodySize:22}}]})))()}var l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{l=t(),r(),c(),u=n(),{expect:d,within:f}=__STORYBOOK_MODULE_TEST__,p={title:`Data/HarPanel`,component:i,args:{entries:s,emptyLabel:`No HTTP traffic captured`},parameters:{docs:{description:{component:"HAR entry table for HTTP diagnostics. It filters captured requests, summarizes method/url/status/timing/size, and expands rows into request and response details. Entries flagged `_pending` render as running with a live elapsed clock; entries with `_error` render as ERR with the transport error."}}}},m={render:()=>(0,u.jsx)(`div`,{className:`h-[480px] border border-border rounded-md`,children:(0,u.jsx)(i,{entries:s})})},h={render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsxs)(`div`,{className:`space-y-density-2`,children:[(0,u.jsx)(`input`,{className:`border border-border rounded-md px-density-2 py-1 text-sm w-full`,placeholder:`Filter URL, method, or body...`,value:e,onChange:e=>t(e.target.value)}),(0,u.jsx)(`div`,{className:`h-[440px] border border-border rounded-md`,children:(0,u.jsx)(i,{entries:s,search:e})})]})}},g=4e4,_=38500,v={name:`In flight`,render:()=>(0,u.jsx)(`div`,{className:`h-[480px] border border-border rounded-md`,children:(0,u.jsx)(i,{entries:[...s,a(new Date(Date.now()-g),_)]})}),play:async({canvasElement:e})=>{let t=f(e);await d(t.getByText(`running`)).toBeInTheDocument(),await d(t.getByText(/· 1 running$/)).toBeInTheDocument()}},y={name:`Transport error`,render:()=>(0,u.jsx)(`div`,{className:`h-[480px] border border-border rounded-md`,children:(0,u.jsx)(i,{entries:[...s,o(new Date,`dial tcp 10.0.4.12:443: connection reset by peer`)]})}),play:async({canvasElement:e})=>{let t=f(e);await d(t.getByText(`ERR`)).toBeInTheDocument(),await d(t.getByText(/connection reset by peer/)).toBeInTheDocument()}},b={render:()=>(0,u.jsx)(`div`,{className:`h-[240px] border border-border rounded-md`,children:(0,u.jsx)(i,{entries:[]})})},x=[`Default`,`WithExternalSearch`,`InFlight`,`TransportError`,`Empty`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[480px] border border-border rounded-md">
      <HarPanel entries={sampleHarEntries} />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [q, setQ] = useState("");
    return <div className="space-y-density-2">
        <input className="border border-border rounded-md px-density-2 py-1 text-sm w-full" placeholder="Filter URL, method, or body..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="h-[440px] border border-border rounded-md">
          <HarPanel entries={sampleHarEntries} search={q} />
        </div>
      </div>;
  }
}`,...h.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "In flight",
  render: () => <div className="h-[480px] border border-border rounded-md">
      <HarPanel entries={[...sampleHarEntries, pendingHarEntry(new Date(Date.now() - IN_FLIGHT_FOR_MS), SNAPSHOT_ELAPSED_MS)]} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("running")).toBeInTheDocument();
    await expect(canvas.getByText(/· 1 running$/)).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:"One request still in flight next to completed ones. The running row's clock\nticks from `startedDateTime`, and the footer counts it.",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "Transport error",
  render: () => <div className="h-[480px] border border-border rounded-md">
      <HarPanel entries={[...sampleHarEntries, transportErrorHarEntry(new Date(), "dial tcp 10.0.4.12:443: connection reset by peer")]} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ERR")).toBeInTheDocument();
    await expect(canvas.getByText(/connection reset by peer/)).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:`A request that never got a response: status 0 with the transport error beside the URL.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[240px] border border-border rounded-md">
      <HarPanel entries={[]} />
    </div>
}`,...b.parameters?.docs?.source}}}})))()}S();export{m as Default,b as Empty,v as InFlight,y as TransportError,h as WithExternalSearch,x as __namedExportsOrder,p as default};
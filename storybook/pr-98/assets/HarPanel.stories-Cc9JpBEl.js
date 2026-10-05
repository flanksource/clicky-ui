import{j as e,r as z}from"./iframe-CRAMrqdr.js";import{H as n}from"./HarPanel-BCB_TwrK.js";import"./preload-helper-BpddQVpQ.js";import"./use-resource-clock-BRwrLngN.js";import"./format-2niohfpq.js";import"./DataTable-CSory7qv.js";import"./SortableHeader-BDxzOEMM.js";import"./utils-DW-IJACk.js";import"./loading-C6pXG8vv.js";import"./router-D9Y2fZfJ.js";import"./Modal-oPG10GDr.js";import"./index-OBWOC1jm.js";import"./index-Dhhf_61s.js";import"./Icon-BMbq9_zN.js";import"./button-DMzgHLRl.js";import"./index-CPURVhFy.js";import"./modalStack-CwY5BXIM.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CN4V-jPS.js";import"./floating-ui.react-CfpWOLb9.js";import"./FilterPill-D2dqjYSS.js";import"./Combobox-BlOvR2S7.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Qn5q0z3i.js";import"./MultiSelect-Djvz-tMb.js";import"./RangeSlider-NDy24q6w.js";import"./TimeRange-BQ0MqSd7.js";import"./select-VRx-e_Ni.js";import"./WorkloadPicker-DiWxfrCb.js";import"./NamespacePicker-Dow2X7GM.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-ClLnH0b8.js";import"./TagList-Cx6UfecG.js";import"./Badge-D_cUJGQB.js";import"./HoverCard-Bb-2z-j6.js";import"./Properties-CLxSZpPj.js";import"./IconButton-Dgyjf8-C.js";import"./DropdownMenu-DfpWvqFK.js";import"./DropdownMenuSubmenu-Cfi5dRDD.js";import"./StatusDot-RD8JAo5O.js";import"./JsonView-lIQuAVJ4.js";function B(r,t){return{startedDateTime:r.toISOString(),time:t,_id:"req-cycles-run",_pending:!0,request:{method:"POST",url:"https://api.example.com/v1/cycles/run",headers:[{name:"content-type",value:"application/json"}],postData:{mimeType:"application/json",text:JSON.stringify({cycle:"nightly"})},bodySize:20},response:{status:0,bodySize:0}}}function q(r,t){return{startedDateTime:r.toISOString(),time:3e4,_id:"req-activities-pending",_error:t,request:{method:"GET",url:"https://api.example.com/v1/activities/pending",headers:[],bodySize:0},response:{status:0,bodySize:0}}}const s=[{startedDateTime:new Date().toISOString(),time:123,request:{method:"GET",url:"https://api.example.com/v1/configs",httpVersion:"HTTP/1.1",headers:[{name:"accept",value:"application/json"},{name:"authorization",value:"Bearer ***"}],queryString:[],bodySize:0},response:{status:200,statusText:"OK",headers:[{name:"content-type",value:"application/json"}],content:{size:64,mimeType:"application/json",text:JSON.stringify({items:[{id:1,name:"db"}]},null,2)},bodySize:64}},{startedDateTime:new Date().toISOString(),time:420,request:{method:"POST",url:"https://api.example.com/v1/configs",headers:[{name:"content-type",value:"application/json"}],postData:{mimeType:"application/json",text:JSON.stringify({name:"new-config"})},bodySize:24},response:{status:201,headers:[{name:"content-type",value:"application/json"}],content:{size:18,mimeType:"application/json",text:'{"id":"abc"}'},bodySize:18}},{startedDateTime:new Date().toISOString(),time:88,request:{method:"GET",url:"https://api.example.com/v1/missing",headers:[],bodySize:0},response:{status:404,headers:[],content:{size:9,mimeType:"text/plain",text:"Not found"},bodySize:9}},{startedDateTime:new Date().toISOString(),time:1200,request:{method:"GET",url:"https://api.example.com/v1/slow",headers:[],bodySize:0},response:{status:503,headers:[],content:{size:22,mimeType:"text/plain",text:"Service Unavailable"},bodySize:22}}],{expect:m,within:N}=__STORYBOOK_MODULE_TEST__,He={title:"Data/HarPanel",component:n,args:{entries:s,emptyLabel:"No HTTP traffic captured"},parameters:{docs:{description:{component:"HAR entry table for HTTP diagnostics. It filters captured requests, summarizes method/url/status/timing/size, and expands rows into request and response details. Entries flagged `_pending` render as running with a live elapsed clock; entries with `_error` render as ERR with the transport error."}}}},i={render:()=>e.jsx("div",{className:"h-[480px] border border-border rounded-md",children:e.jsx(n,{entries:s})})},d={render:()=>{const[r,t]=z.useState("");return e.jsxs("div",{className:"space-y-density-2",children:[e.jsx("input",{className:"border border-border rounded-md px-density-2 py-1 text-sm w-full",placeholder:"Filter URL, method, or body...",value:r,onChange:O=>t(O.target.value)}),e.jsx("div",{className:"h-[440px] border border-border rounded-md",children:e.jsx(n,{entries:s,search:r})})]})}},P=4e4,R=38500,a={name:"In flight",render:()=>e.jsx("div",{className:"h-[480px] border border-border rounded-md",children:e.jsx(n,{entries:[...s,B(new Date(Date.now()-P),R)]})}),play:async({canvasElement:r})=>{const t=N(r);await m(t.getByText("running")).toBeInTheDocument(),await m(t.getByText(/· 1 running$/)).toBeInTheDocument()}},o={name:"Transport error",render:()=>e.jsx("div",{className:"h-[480px] border border-border rounded-md",children:e.jsx(n,{entries:[...s,q(new Date,"dial tcp 10.0.4.12:443: connection reset by peer")]})}),play:async({canvasElement:r})=>{const t=N(r);await m(t.getByText("ERR")).toBeInTheDocument(),await m(t.getByText(/connection reset by peer/)).toBeInTheDocument()}},p={render:()=>e.jsx("div",{className:"h-[240px] border border-border rounded-md",children:e.jsx(n,{entries:[]})})};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="h-[480px] border border-border rounded-md">
      <HarPanel entries={sampleHarEntries} />
    </div>
}`,...(u=(l=i.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var h,y,x;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => {
    const [q, setQ] = useState("");
    return <div className="space-y-density-2">
        <input className="border border-border rounded-md px-density-2 py-1 text-sm w-full" placeholder="Filter URL, method, or body..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="h-[440px] border border-border rounded-md">
          <HarPanel entries={sampleHarEntries} search={q} />
        </div>
      </div>;
  }
}`,...(x=(y=d.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var b,g,T,v,S;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(T=(g=a.parameters)==null?void 0:g.docs)==null?void 0:T.source},description:{story:"One request still in flight next to completed ones. The running row's clock\nticks from `startedDateTime`, and the footer counts it.",...(S=(v=a.parameters)==null?void 0:v.docs)==null?void 0:S.description}}};var E,D,w,f,H;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(w=(D=o.parameters)==null?void 0:D.docs)==null?void 0:w.source},description:{story:"A request that never got a response: status 0 with the transport error beside the URL.",...(H=(f=o.parameters)==null?void 0:f.docs)==null?void 0:H.description}}};var _,j,I;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="h-[240px] border border-border rounded-md">
      <HarPanel entries={[]} />
    </div>
}`,...(I=(j=p.parameters)==null?void 0:j.docs)==null?void 0:I.source}}};const _e=["Default","WithExternalSearch","InFlight","TransportError","Empty"];export{i as Default,p as Empty,a as InFlight,o as TransportError,d as WithExternalSearch,_e as __namedExportsOrder,He as default};

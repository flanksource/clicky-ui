var B=Object.defineProperty;var x=(e,t,n)=>t in e?B(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var o=(e,t,n)=>x(e,typeof t!="symbol"?t+"":t,n);import{j as r,r as c}from"./iframe-Dxfrw1Ky.js";import{Q as k}from"./queryClient-CPpX_vd7.js";import{Q as E}from"./suspense-D1Bcd_NK.js";import{T as w}from"./TaskManager-D0WGUpfv.js";import"./preload-helper-BBRSUrHX.js";import"./useMutation-CwG0RV2E.js";import"./utils-DW-IJACk.js";import"./format-2niohfpq.js";import"./use-resource-clock-CgpujYJH.js";import"./event-source-D8oZEeiP.js";import"./Icon-uVU5xHJk.js";import"./DataTable-BIhpbnpq.js";import"./SortableHeader-Bfd9tbsl.js";import"./loading-DdWtU95m.js";import"./router-BkznFUli.js";import"./Modal-D6Y2Y0Td.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./button-Cd-gFBA2.js";import"./index-CPURVhFy.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CRB8Fu3i.js";import"./floating-ui.react-CnFTnPO5.js";import"./FilterPill-DPJ4_JlW.js";import"./filter-bar-multi-B5teDMbU.js";import"./Combobox-CkPoK2Rk.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Do5gRvQn.js";import"./MultiSelect-UaYFpP5m.js";import"./RangeSlider-DswKR2c-.js";import"./TimeRange-DViFc0-X.js";import"./select-C8OQW2cZ.js";import"./WorkloadPicker-BMOl_vHV.js";import"./NamespacePicker-Bacf9vZs.js";import"./index-BUwwOD0W.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BdeaaCOh.js";import"./TagList-BlEnFNAp.js";import"./Badge-aB9oNZTO.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BpuwyYbr.js";import"./Properties-D97LrD4y.js";import"./IconButton-XTWE7kYN.js";import"./DropdownMenu-BrgsovJR.js";import"./DropdownMenuSubmenu-ngeQOpm6.js";import"./JsonView-C0lt5M6a.js";import"./AccordionList-BTYKiV83.js";import"./collections-CoHfwOze.js";import"./StatusDot-uL2bc0oE.js";import"./ProgressBar-DGq7uTiv.js";import"./TaskProgress-BmQonLiS.js";import"./CopyButton-C01vQxpT.js";import"./clipboard-C31elYxF.js";import"./SplitButton-PtMh1FDA.js";import"./TimeseriesGauge-CT-RmMCd.js";import"./TimeseriesPanel-nUGu8Q0e.js";import"./timeseries-query-DOqVkWUZ.js";import"./index-B-NV2Fp2.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-BP1V432K.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-B-jsljC_.js";import"./Tree-D-3f6UEm.js";import"./TreeNode-4m2l8kkX.js";import"./utils-Y5hh5shO.js";import"./shell-command-K5vcnqpg.js";import"./AnsiHtml-C2CmY0im.js";import"./string-Ye519DiV.js";const{expect:a,userEvent:u,waitFor:S,within:I}=__STORYBOOK_MODULE_TEST__,D=[{id:"run-agent",name:"claude-agent",kind:"agent",status:"running",startedAt:"2026-06-02T12:00:00Z",total:1,completed:0,failed:0,running:1}],b=e=>({pid:4242,command:"tsx",status:"running",restarts:0,restartPolicy:"no",latest:{cpuPercent:3.1,rssBytes:1024,vmsBytes:2048,openFiles:8,sampledAt:e},peak:{cpuPercent:9.4,rssBytes:4096,vmsBytes:8192,openFiles:12,sampledAt:e},metrics:{},metadata:{state:"running",session:"df7aa36e",turn:{planMode:!1,pending:1}}}),O={id:"run-agent",name:"claude-agent",type:"group",status:"running",groupId:"run-agent",total:1,running:1},i=(e,t)=>({id:"agent-task",name:"run agent",type:"task",status:"running",groupId:"run-agent",duration:e,details:b(t)}),l=`starting agent
connected
`,R=`turn 1 complete
`;class d{constructor(t){o(this,"listeners",{});o(this,"onerror",null);o(this,"timers",[]);const s=t.includes("/tasks/runs/stream")?[[0,"runs",D]]:[[0,"task",O],[0,"task",i("1s","2026-06-02T12:00:01Z")],[20,"output",{id:"agent-task",groupId:"run-agent",stream:"stdout",data:l,offset:0,reset:!0}],[120,"task",i("2s","2026-06-02T12:00:02Z")],[220,"task",i("3s","2026-06-02T12:00:03Z")],[320,"output",{id:"agent-task",groupId:"run-agent",stream:"stdout",data:R,offset:l.length}],[420,"task",i("4s","2026-06-02T12:00:04Z")]];for(const[y,p,f]of s)this.timers.push(setTimeout(()=>{for(const v of this.listeners[p]??[])v(new MessageEvent(p,{data:JSON.stringify(f)}))},y))}addEventListener(t,n){var s;((s=this.listeners)[t]??(s[t]=[])).push(n)}close(){for(const t of this.timers)clearTimeout(t)}}const _=e=>{const[t]=c.useState(()=>new k({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}}));return r.jsx(E,{client:t,children:r.jsx(e,{})})},F=e=>{const t=c.useRef(void 0);return globalThis.EventSource!==d&&(t.current=globalThis.EventSource,globalThis.EventSource=d),c.useEffect(()=>()=>{t.current&&(globalThis.EventSource=t.current)},[]),r.jsx(e,{})},Wt={title:"Data/TaskManager Output",component:w,decorators:[F,_],parameters:{docs:{description:{component:"A supervised process whose stdout arrives as append-only SSE deltas while its task frames keep changing. Guards the accumulator: task frames carry no output, and must not take the accumulated output with them when they replace a snapshot."}}}},m={render:()=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(w,{basePath:"/api/v1"})}),play:async({canvasElement:e})=>{const t=I(e);await u.click(await t.findByText("claude-agent")),await u.click(await t.findByText("run agent")),await a(await t.findByRole("button",{name:"stdout"})).toBeInTheDocument(),await a(await t.findByText(/starting agent/)).toBeInTheDocument(),await S(async()=>{await a(t.getByText(/turn 1 complete/)).toBeInTheDocument()}),await a(t.getByRole("button",{name:"stdout"})).toBeInTheDocument(),await a(t.getByText(/starting agent/)).toHaveTextContent("starting agent connected turn 1 complete"),await a(t.getByTitle("state: running")).toBeInTheDocument(),await a(t.getByTitle("session: df7aa36e")).toBeInTheDocument(),await a(t.queryByTitle(/^turn:/)).toBeNull()}};var g,h,T;m.parameters={...m.parameters,docs:{...(g=m.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="max-w-2xl">
      <TaskManager basePath="/api/v1" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText("claude-agent"));
    await userEvent.click(await canvas.findByText("run agent"));

    // The tab exists once output has arrived...
    await expect(await canvas.findByRole("button", {
      name: "stdout"
    })).toBeInTheDocument();
    await expect(await canvas.findByText(/starting agent/)).toBeInTheDocument();

    // ...and is still there after the task frames that carry none, with the
    // later delta appended to what was already on screen rather than replacing
    // it. Both chunks present is the whole point: one of them alone would mean
    // the pane had been reset in between.
    await waitFor(async () => {
      await expect(canvas.getByText(/turn 1 complete/)).toBeInTheDocument();
    });
    await expect(canvas.getByRole("button", {
      name: "stdout"
    })).toBeInTheDocument();
    await expect(canvas.getByText(/starting agent/)).toHaveTextContent("starting agent connected turn 1 complete");

    // The structured metadata reaches the header as chips, and keeps its
    // structure out of them.
    await expect(canvas.getByTitle("state: running")).toBeInTheDocument();
    await expect(canvas.getByTitle("session: df7aa36e")).toBeInTheDocument();
    await expect(canvas.queryByTitle(/^turn:/)).toBeNull();
  }
}`,...(T=(h=m.parameters)==null?void 0:h.docs)==null?void 0:T.source}}};const Xt=["OutputSurvivesLaterTaskFrames"];export{m as OutputSurvivesLaterTaskFrames,Xt as __namedExportsOrder,Wt as default};

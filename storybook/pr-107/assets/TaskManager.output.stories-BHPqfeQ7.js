var B=Object.defineProperty;var x=(e,t,n)=>t in e?B(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var o=(e,t,n)=>x(e,typeof t!="symbol"?t+"":t,n);import{j as r,r as c}from"./iframe-BsAqiW63.js";import{Q as k}from"./queryClient-CGaE9-tu.js";import{Q as E}from"./suspense-yabXK1kN.js";import{T as w}from"./TaskManager-C6uGN6_3.js";import"./preload-helper-Drww7zV3.js";import"./useMutation-CeHD0UzW.js";import"./utils-DW-IJACk.js";import"./format-2niohfpq.js";import"./use-resource-clock-BDxUuUeC.js";import"./event-source-Bm9AmdJa.js";import"./Icon-Dyy6aaqa.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./loading-BJEbCWIe.js";import"./router-BgYu87PQ.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./StatusDot-CrwAY-qs.js";import"./ProgressBar-BUVB-74E.js";import"./TaskProgress-CC2SK9CW.js";import"./CopyButton-CDgQNJbP.js";import"./clipboard-Q2DnJGH7.js";import"./SplitButton-CQb5G2Lm.js";import"./TimeseriesGauge-zjvKglSW.js";import"./TimeseriesPanel-CF1l9SJV.js";import"./timeseries-query-CZZOP-Vd.js";import"./index-DZBPU6Sp.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-Cc9jHqwW.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-B2nzUuHG.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./utils-Cc6tkQt_.js";import"./shell-command-K5vcnqpg.js";import"./AnsiHtml-fT4U1N1H.js";import"./string-XSKS3ZaR.js";const{expect:a,userEvent:u,waitFor:S,within:I}=__STORYBOOK_MODULE_TEST__,D=[{id:"run-agent",name:"claude-agent",kind:"agent",status:"running",startedAt:"2026-06-02T12:00:00Z",total:1,completed:0,failed:0,running:1}],b=e=>({pid:4242,command:"tsx",status:"running",restarts:0,restartPolicy:"no",latest:{cpuPercent:3.1,rssBytes:1024,vmsBytes:2048,openFiles:8,sampledAt:e},peak:{cpuPercent:9.4,rssBytes:4096,vmsBytes:8192,openFiles:12,sampledAt:e},metrics:{},metadata:{state:"running",session:"df7aa36e",turn:{planMode:!1,pending:1}}}),O={id:"run-agent",name:"claude-agent",type:"group",status:"running",groupId:"run-agent",total:1,running:1},i=(e,t)=>({id:"agent-task",name:"run agent",type:"task",status:"running",groupId:"run-agent",duration:e,details:b(t)}),l=`starting agent
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

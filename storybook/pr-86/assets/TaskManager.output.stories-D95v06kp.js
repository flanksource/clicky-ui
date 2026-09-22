var B=Object.defineProperty;var x=(e,t,n)=>t in e?B(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var o=(e,t,n)=>x(e,typeof t!="symbol"?t+"":t,n);import{j as s,r as u}from"./iframe-DyL4RmGG.js";import{Q as k}from"./queryClient-Xt9RVV6X.js";import{Q as E}from"./suspense-jN3_x6dp.js";import{T as w}from"./TaskManager-CE1kyIY2.js";import"./preload-helper-CcRYDqr-.js";import"./useMutation-C8_CrGUM.js";import"./utils-DW-IJACk.js";import"./Icon-COVZwsWL.js";import"./ProgressBar-Bx63t97_.js";import"./Timestamp-BgTC8mmn.js";import"./timestamp-format-DJzkpO9P.js";import"./TaskProgress-i09E4ZeC.js";import"./button-BTOItCTV.js";import"./index-CPURVhFy.js";import"./loading-BIPMexql.js";import"./CopyButton-CnWmwfRA.js";import"./IconButton-C8c2Bsu4.js";import"./clipboard-CWSx5JJa.js";import"./SplitButton-DZcwBI8A.js";import"./DropdownMenu-BUAttuFQ.js";import"./floating-ui.react-D_VnvmSA.js";import"./index-MomY5yw3.js";import"./index-BKFNVha0.js";import"./DropdownMenuSubmenu-D9QpaiqI.js";import"./modalStack-CzjsIGEp.js";import"./zIndex-BGbNBNA8.js";import"./TimeseriesGauge-CBY-_Twt.js";import"./useQueries-Ob6Tj4bs.js";import"./format-2niohfpq.js";import"./Modal-D7h-gNLF.js";import"./TimeseriesPanel-C6ij3MDb.js";import"./index-B2R1vz3b.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-BP2BLgcT.js";import"./HoverCard-BfwUXTN4.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-CdDH5_d3.js";import"./Tree-DbKiRmyq.js";import"./TreeNode-C5L9qvxU.js";import"./use-resource-clock-BmrwRjFL.js";import"./shell-command-K5vcnqpg.js";import"./JsonView-DhsCquBn.js";import"./collections-CoHfwOze.js";import"./AnsiHtml-e6B1iFO4.js";import"./string-Ye519DiV.js";const{expect:a,userEvent:p,waitFor:S,within:I}=__STORYBOOK_MODULE_TEST__,D=[{id:"run-agent",name:"claude-agent",kind:"agent",status:"running",startedAt:"2026-06-02T12:00:00Z",total:1,completed:0,failed:0,running:1}],b=e=>({pid:4242,command:"tsx",status:"running",restarts:0,restartPolicy:"no",latest:{cpuPercent:3.1,rssBytes:1024,vmsBytes:2048,openFiles:8,sampledAt:e},peak:{cpuPercent:9.4,rssBytes:4096,vmsBytes:8192,openFiles:12,sampledAt:e},metrics:{},metadata:{state:"running",session:"df7aa36e",turn:{planMode:!1,pending:1}}}),O={id:"run-agent",name:"claude-agent",type:"group",status:"running",groupId:"run-agent",total:1,running:1},i=(e,t)=>({id:"agent-task",name:"run agent",type:"task",status:"running",groupId:"run-agent",duration:e,details:b(t)}),l=`starting agent
connected
`,R=`turn 1 complete
`;class d{constructor(t){o(this,"listeners",{});o(this,"onerror",null);o(this,"timers",[]);const r=t.includes("/tasks/runs/stream")?[[0,"runs",D]]:[[0,"task",O],[0,"task",i("1s","2026-06-02T12:00:01Z")],[20,"output",{id:"agent-task",groupId:"run-agent",stream:"stdout",data:l,offset:0,reset:!0}],[120,"task",i("2s","2026-06-02T12:00:02Z")],[220,"task",i("3s","2026-06-02T12:00:03Z")],[320,"output",{id:"agent-task",groupId:"run-agent",stream:"stdout",data:R,offset:l.length}],[420,"task",i("4s","2026-06-02T12:00:04Z")]];for(const[y,m,f]of r)this.timers.push(setTimeout(()=>{for(const v of this.listeners[m]??[])v(new MessageEvent(m,{data:JSON.stringify(f)}))},y))}addEventListener(t,n){var r;((r=this.listeners)[t]??(r[t]=[])).push(n)}close(){for(const t of this.timers)clearTimeout(t)}}const _=e=>{const[t]=u.useState(()=>new k({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}}));return s.jsx(E,{client:t,children:s.jsx(e,{})})},F=e=>{const t=u.useRef(void 0);return globalThis.EventSource!==d&&(t.current=globalThis.EventSource,globalThis.EventSource=d),u.useEffect(()=>()=>{t.current&&(globalThis.EventSource=t.current)},[]),s.jsx(e,{})},St={title:"Data/TaskManager Output",component:w,decorators:[F,_],parameters:{docs:{description:{component:"A supervised process whose stdout arrives as append-only SSE deltas while its task frames keep changing. Guards the accumulator: task frames carry no output, and must not take the accumulated output with them when they replace a snapshot."}}}},c={render:()=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(w,{basePath:"/api/v1"})}),play:async({canvasElement:e})=>{const t=I(e);await p.click(await t.findByText("claude-agent")),await p.click(await t.findByText("run agent")),await a(await t.findByRole("button",{name:"stdout"})).toBeInTheDocument(),await a(await t.findByText(/starting agent/)).toBeInTheDocument(),await S(async()=>{await a(t.getByText(/turn 1 complete/)).toBeInTheDocument()}),await a(t.getByRole("button",{name:"stdout"})).toBeInTheDocument(),await a(t.getByText(/starting agent/)).toHaveTextContent("starting agent connected turn 1 complete"),await a(t.getByTitle("state: running")).toBeInTheDocument(),await a(t.getByTitle("session: df7aa36e")).toBeInTheDocument(),await a(t.queryByTitle(/^turn:/)).toBeNull()}};var g,h,T;c.parameters={...c.parameters,docs:{...(g=c.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(T=(h=c.parameters)==null?void 0:h.docs)==null?void 0:T.source}}};const It=["OutputSurvivesLaterTaskFrames"];export{c as OutputSurvivesLaterTaskFrames,It as __namedExportsOrder,St as default};

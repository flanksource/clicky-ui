import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./TaskManager-BDkhgbnu.js";import{n as a,r as o}from"./QueryClientProvider-b6YDq6fV.js";import{n as s,t as c}from"./queryClient-lXfmqi15.js";import{a as l,i as u,n as d,o as f,r as p,s as m,t as h}from"./TaskSession.story-support-hIRR8R7F.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{g=t(),s(),o(),r(),f(),_=n(),{expect:v,userEvent:y,waitFor:b,within:x}=__STORYBOOK_MODULE_TEST__,S=[{id:`run-agent`,name:`claude-agent`,kind:`agent`,status:`running`,startedAt:`2026-06-02T12:00:00Z`,total:1,completed:0,failed:0,running:1,session:p}],C=e=>({pid:4242,command:`tsx`,status:`running`,restarts:0,restartPolicy:`no`,latest:{cpuPercent:3.1,rssBytes:1024,vmsBytes:2048,openFiles:8,sampledAt:e},peak:{cpuPercent:9.4,rssBytes:4096,vmsBytes:8192,openFiles:12,sampledAt:e},metrics:{},metadata:{state:`running`,turn:{planMode:!1,pending:1}}}),w={id:`run-agent`,name:`claude-agent`,type:`group`,status:`running`,groupId:`run-agent`,total:1,running:1,session:p},T=e=>({id:`agent-task`,name:`run agent`,type:`task`,status:`running`,groupId:`run-agent`,startedAt:`2026-06-02T12:00:00Z`,details:C(e)}),E=u.actions+1,D={...w,session:{...p,summary:{...u,actions:E}}},O=`starting agent
connected
`,k=`turn 1 complete
`,A=class{listeners={};onerror=null;timers=[];constructor(e){let t=e.includes(`/tasks/runs/stream`)?[[0,`runs`,S]]:[[0,`task`,w],[0,`task`,T(`2026-06-02T12:00:01Z`)],[20,`output`,{id:`agent-task`,groupId:`run-agent`,stream:`stdout`,data:O,offset:0,reset:!0}],[120,`task`,T(`2026-06-02T12:00:02Z`)],[220,`task`,T(`2026-06-02T12:00:03Z`)],[320,`output`,{id:`agent-task`,groupId:`run-agent`,stream:`stdout`,data:k,offset:25}],[420,`task`,T(`2026-06-02T12:00:04Z`)],[420,`task`,D],...[600,1200,1800,2400].map(e=>[e,`session`,l(h)])];for(let[e,n,r]of t)this.timers.push(setTimeout(()=>{for(let e of this.listeners[n]??[])e(new MessageEvent(n,{data:JSON.stringify(r)}))},e))}addEventListener(e,t){(this.listeners[e]??=[]).push(t)}close(){for(let e of this.timers)clearTimeout(e)}},j=e=>{let[t]=(0,g.useState)(()=>new c({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}}));return(0,_.jsx)(a,{client:t,children:(0,_.jsx)(e,{})})},M=e=>{let t=(0,g.useRef)(void 0);return globalThis.EventSource!==A&&(t.current=globalThis.EventSource,globalThis.EventSource=A),(0,g.useEffect)(()=>()=>{t.current&&(globalThis.EventSource=t.current)},[]),(0,_.jsx)(e,{})},N={title:`Data/TaskManager Output`,component:i,decorators:[M,m,j],parameters:{docs:{description:{component:`A supervised process whose stdout arrives as append-only SSE deltas while its task frames keep changing. Guards the accumulator: task frames carry no output, and must not take the accumulated output with them when they replace a snapshot.`}}}},P={render:()=>(0,_.jsx)(`div`,{className:`max-w-2xl`,children:(0,_.jsx)(i,{basePath:`/api/v1`,timeRange:{from:`2026-06-02T00:00:00Z`,to:`2026-06-03T00:00:00Z`}})}),play:async({canvasElement:e})=>{let t=x(e);await y.click(await t.findByText(`claude-agent`)),await y.click(await t.findByText(`run agent`)),await v(await t.findByRole(`button`,{name:`Session`})).toHaveAttribute(`aria-current`,`true`),await b(()=>v(t.getByText(d)).toBeInTheDocument(),{timeout:4e3}),await y.click(await t.findByRole(`button`,{name:`stdout`})),await v(await t.findByText(/starting agent/)).toBeInTheDocument(),await b(async()=>{await v(t.getByText(/turn 1 complete/)).toBeInTheDocument()}),await v(t.getByRole(`button`,{name:`stdout`})).toBeInTheDocument(),await v(t.getByText(/starting agent/)).toHaveTextContent(`starting agent connected turn 1 complete`),await v(t.getByTitle(`state: running`)).toBeInTheDocument(),await v(t.queryByTitle(/^turn:/)).toBeNull(),await v((await t.findAllByTestId(`session-task-summary`)).length).toBeGreaterThan(1),await b(()=>v(t.getByText(`${E} actions`)).toBeInTheDocument())}},F=[`OutputSurvivesLaterTaskFrames`],P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-2xl">
      <TaskManager basePath="/api/v1" timeRange={{
      from: "2026-06-02T00:00:00Z",
      to: "2026-06-03T00:00:00Z"
    }} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText("claude-agent"));
    await userEvent.click(await canvas.findByText("run agent"));

    // The task drives a session, so the Session tab is first and selected; the
    // stdout tab exists once output has arrived...
    await expect(await canvas.findByRole("button", {
      name: "Session"
    })).toHaveAttribute("aria-current", "true");

    // Its live entries arrive as \`session\` frames on this same task stream and
    // land in the open inspector, which opens no EventSource of its own.
    await waitFor(() => expect(canvas.getByText(CAPTAIN_SESSION_LIVE_TEXT)).toBeInTheDocument(), {
      timeout: 4000
    });
    await userEvent.click(await canvas.findByRole("button", {
      name: "stdout"
    }));
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
    await expect(canvas.queryByTitle(/^turn:/)).toBeNull();

    // The session the run drives is a typed reference rather than a metadata
    // chip: the run row and the task row each carry its summary line, drawn
    // from the listing and the task stream with no session request. The task
    // row follows the group frame that refreshed the summary.
    await expect((await canvas.findAllByTestId("session-task-summary")).length).toBeGreaterThan(1);
    await waitFor(() => expect(canvas.getByText(\`\${SUMMARY_ACTIONS_LATER} actions\`)).toBeInTheDocument());
  }
}`,...P.parameters?.docs?.source}}}})))()}I();export{P as OutputSurvivesLaterTaskFrames,F as __namedExportsOrder,N as default};
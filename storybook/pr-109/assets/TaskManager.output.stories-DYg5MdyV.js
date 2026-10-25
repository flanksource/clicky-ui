import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./TaskManager-CpIgLr73.js";import{g as a,h as o}from"./suspense-Bcp9qyqt.js";import{n as s,t as c}from"./queryClient-BlbTeML9.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{l=t(),s(),a(),r(),u=n(),{expect:d,userEvent:f,waitFor:p,within:m}=__STORYBOOK_MODULE_TEST__,h=[{id:`run-agent`,name:`claude-agent`,kind:`agent`,status:`running`,startedAt:`2026-06-02T12:00:00Z`,total:1,completed:0,failed:0,running:1}],g=e=>({pid:4242,command:`tsx`,status:`running`,restarts:0,restartPolicy:`no`,latest:{cpuPercent:3.1,rssBytes:1024,vmsBytes:2048,openFiles:8,sampledAt:e},peak:{cpuPercent:9.4,rssBytes:4096,vmsBytes:8192,openFiles:12,sampledAt:e},metrics:{},metadata:{state:`running`,session:`df7aa36e`,turn:{planMode:!1,pending:1}}}),_={id:`run-agent`,name:`claude-agent`,type:`group`,status:`running`,groupId:`run-agent`,total:1,running:1},v=(e,t)=>({id:`agent-task`,name:`run agent`,type:`task`,status:`running`,groupId:`run-agent`,duration:e,details:g(t)}),y=`starting agent
connected
`,b=`turn 1 complete
`,x=class{listeners={};onerror=null;timers=[];constructor(e){let t=e.includes(`/tasks/runs/stream`)?[[0,`runs`,h]]:[[0,`task`,_],[0,`task`,v(`1s`,`2026-06-02T12:00:01Z`)],[20,`output`,{id:`agent-task`,groupId:`run-agent`,stream:`stdout`,data:y,offset:0,reset:!0}],[120,`task`,v(`2s`,`2026-06-02T12:00:02Z`)],[220,`task`,v(`3s`,`2026-06-02T12:00:03Z`)],[320,`output`,{id:`agent-task`,groupId:`run-agent`,stream:`stdout`,data:b,offset:25}],[420,`task`,v(`4s`,`2026-06-02T12:00:04Z`)]];for(let[e,n,r]of t)this.timers.push(setTimeout(()=>{for(let e of this.listeners[n]??[])e(new MessageEvent(n,{data:JSON.stringify(r)}))},e))}addEventListener(e,t){(this.listeners[e]??=[]).push(t)}close(){for(let e of this.timers)clearTimeout(e)}},S=e=>{let[t]=(0,l.useState)(()=>new c({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}}));return(0,u.jsx)(o,{client:t,children:(0,u.jsx)(e,{})})},C=e=>{let t=(0,l.useRef)(void 0);return globalThis.EventSource!==x&&(t.current=globalThis.EventSource,globalThis.EventSource=x),(0,l.useEffect)(()=>()=>{t.current&&(globalThis.EventSource=t.current)},[]),(0,u.jsx)(e,{})},w={title:`Data/TaskManager Output`,component:i,decorators:[C,S],parameters:{docs:{description:{component:`A supervised process whose stdout arrives as append-only SSE deltas while its task frames keep changing. Guards the accumulator: task frames carry no output, and must not take the accumulated output with them when they replace a snapshot.`}}}},T={render:()=>(0,u.jsx)(`div`,{className:`max-w-2xl`,children:(0,u.jsx)(i,{basePath:`/api/v1`})}),play:async({canvasElement:e})=>{let t=m(e);await f.click(await t.findByText(`claude-agent`)),await f.click(await t.findByText(`run agent`)),await d(await t.findByRole(`button`,{name:`stdout`})).toBeInTheDocument(),await d(await t.findByText(/starting agent/)).toBeInTheDocument(),await p(async()=>{await d(t.getByText(/turn 1 complete/)).toBeInTheDocument()}),await d(t.getByRole(`button`,{name:`stdout`})).toBeInTheDocument(),await d(t.getByText(/starting agent/)).toHaveTextContent(`starting agent connected turn 1 complete`),await d(t.getByTitle(`state: running`)).toBeInTheDocument(),await d(t.getByTitle(`session: df7aa36e`)).toBeInTheDocument(),await d(t.queryByTitle(/^turn:/)).toBeNull()}},E=[`OutputSurvivesLaterTaskFrames`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}}})))()}D();export{T as OutputSurvivesLaterTaskFrames,E as __namedExportsOrder,w as default};
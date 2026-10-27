import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./button-6-GcSFqM.js";import{n as a,t as o}from"./Modal-ZC1XdCdw.js";import{T as s,m as c,y as l}from"./MarkIcons-Bgbp8W1d.js";import{a as u,o as d}from"./context-mgpTUgnY.js";import{n as f,t as p}from"./TestRunner-CDnLM3W-.js";import{i as m,n as h,r as g,t as _}from"./TestRunner.fixtures-BOCQYxYx.js";function v(e,t,n=0){let r={id:`node-${n}`,label:`Generated record ${n} with a deliberately verbose label to force horizontal overflow in the JSON viewer`,enabled:n%2==0,score:Number((n*1.37).toFixed(4)),tags:Array.from({length:t},(e,t)=>`tag-${n}-${t}`),metrics:{p50:n,p95:n*4,p99:n*9,samples:n*1e3}};return e>0&&(r.children=Array.from({length:t},(r,i)=>v(e-1,t,n*t+i+1))),r}function y(e,t,n,r){if(t===0){let t=r%6==0,n=!t&&r%5==0,i={name:`case ${e}`,framework:T(r),route_path:e,passed:!t&&!n,failed:t,skipped:n,duration:b(r*17%800+5),stdout:S,detail:E};return t&&(i.message=`assertion failed in case ${e}`,i.failure_detail={kind:`gomega`,summary:`case ${e} did not meet expectations`,expected:`ok (${e})`,actual:`error at iteration ${r}`,location:`pkg/case_${r}_test.go:${r%200+1}`}),i}return{name:`group ${e}`,framework:T(r),route_path:e,children:Array.from({length:n},(i,a)=>y(`${e}.${a}`,t-1,n,r*n+a+1))}}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{b=e=>e*1e6,x=Array.from({length:500},(e,t)=>({index:t,policyNumber:`POL-${String(t).padStart(6,`0`)}`,status:t%5==0?`FAILED`:`OK`,durationMs:t*13%900,message:`row ${t}: processed with a moderately long human-readable status note`})),S=Array.from({length:800},(e,t)=>`[2026-06-09T17:${String(t%60).padStart(2,`0`)}:00Z] step ${t} :: emitting record ${t} with a long-unbroken-token-${`x`.repeat(40)} and trailing context`).join(`
`),C=[{name:`data pipeline`,framework:`fixture`,route_path:`pipeline`,children:[{name:`hydrates the full entity graph`,framework:`fixture`,route_path:`pipeline/graph`,passed:!0,duration:b(4200),detail:v(6,4)},{name:`imports 500 policy rows`,framework:`fixture`,route_path:`pipeline/import`,failed:!0,duration:b(9100),message:`100 of 500 rows failed validation`,stdout:S,detail:{summary:{total:500,ok:400,failed:100},rows:x}}]}],w=[`go test`,`ginkgo`,`fixture`],T=e=>w[e%w.length]??`fixture`,E={summary:{total:500,ok:400,failed:100},rows:x,graph:v(5,3,7)},D=Array.from({length:4},(e,t)=>y(`${t}`,3,4,t+1))})))()}function k({tests:e,done:t,adapters:n}){let[r,i]=(0,A.useState)(null),[a,o]=(0,A.useState)(s()),[l,u]=(0,A.useState)(null),d=c(e,a.status,a.framework);return(0,j.jsx)(p,{tests:d,selected:r,filters:a,expandAll:l,done:t,now:t?void 0:0,startTime:0,endTime:t?31278:null,runMeta:{sequence:1,kind:`initial`},statusText:t?`Test run complete`:`Running tests...`,onSelect:i,onFiltersChange:o,onExpandAllChange:u,onRerun:e=>window.alert(`Rerun ${e.name}`),...n?{adapters:n}:{}})}var A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{A=t(),f(),a(),r(),l(),d(),h(),O(),j=n(),{expect:M,userEvent:N,within:P}=__STORYBOOK_MODULE_TEST__,F={title:`Data/TestRunner`,component:p,parameters:{layout:`fullscreen`,docs:{description:{component:`Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui.`}}}},I={render:()=>(0,j.jsx)(`div`,{className:`h-screen`,children:(0,j.jsx)(k,{tests:_,done:!0})})},L={render:()=>(0,j.jsx)(`div`,{className:`h-screen`,children:(0,j.jsx)(k,{tests:g,done:!1})})},R={render:()=>(0,j.jsx)(`div`,{className:`h-screen`,children:(0,j.jsx)(k,{tests:_,done:!0,adapters:u([m])})})},z={render:()=>(0,j.jsx)(`div`,{className:`h-screen`,children:(0,j.jsx)(k,{tests:C,done:!0})}),play:async({canvasElement:e})=>{let t=P(e);await N.click(t.getByText(`imports 500 policy rows`));let n=t.getAllByRole(`button`,{name:`Expand value`});await M(n).toHaveLength(500),await N.click(n[499]),await M(t.getByText(`POL-000499`)).toBeVisible()}},B={render:()=>{let[e,t]=(0,A.useState)(!0);return(0,j.jsxs)(`div`,{className:`p-density-4`,children:[(0,j.jsx)(i,{onClick:()=>t(!0),children:`Open test results`}),(0,j.jsx)(o,{open:e,onClose:()=>t(!1),title:`Test results`,size:`full`,children:(0,j.jsx)(`div`,{className:`-mx-density-4 -my-density-3 h-[75vh]`,children:(0,j.jsx)(k,{tests:D,done:!0})})})]})},play:async({canvasElement:e})=>{let t=P(e.ownerDocument.body);await N.click(t.getByRole(`button`,{name:/^Status/}));let n=P(await t.findByRole(`menu`,{name:`Status`}));await N.click(n.getByText(`Failed`)),await N.keyboard(`{Escape}`);let r=P(t.getByRole(`tree`));await N.click(r.getByText(`case 3.3.2.3`)),await M(t.getByText(`case 3.3.2.3 did not meet expectations`)).toBeVisible(),await M(r.queryByText(`case 3.3.3.3`)).not.toBeInTheDocument()}},V=[`Default`,`Running`,`WithCustomAdapter`,`LargePayloads`,`InsideDialog`],I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done />
    </div>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={runningTests} done={false} />
    </div>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done adapters={createTestRunnerRegistry([setupAdapter])} />
    </div>
}`,...R.parameters?.docs?.source},description:{story:`Registers a host adapter for "setup" nodes — custom detail body, a "Context"
tab, and a node action — demonstrating the extension seam that replaces the
wrapper-with-an-if-chain pattern hosts use today. Select the \`setup\` node.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={largeDetailTests} done />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("imports 500 policy rows"));
    const rows = canvas.getAllByRole("button", {
      name: "Expand value"
    });
    await expect(rows).toHaveLength(500);
    await userEvent.click(rows[499]!);
    await expect(canvas.getByText("POL-000499")).toBeVisible();
  }
}`,...z.parameters?.docs?.source},description:{story:`Leaves carrying very large payloads — a deep 6×4 object, a 500-row array, and
an 800-line log. Select "imports 500 policy rows" to stress the JSON view and
confirm the detail pane scrolls independently of the tree. The failing branch
opens by default.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(true);
    return <div className="p-density-4">
        <Button onClick={() => setOpen(true)}>Open test results</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Test results" size="full">
          <div className="-mx-density-4 -my-density-3 h-[75vh]">
            <Harness tests={largeTreeTests} done />
          </div>
        </Modal>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", {
      name: /^Status/
    }));
    const statusMenu = within(await canvas.findByRole("menu", {
      name: "Status"
    }));
    await userEvent.click(statusMenu.getByText("Failed"));
    await userEvent.keyboard("{Escape}");
    const tree = within(canvas.getByRole("tree"));
    await userEvent.click(tree.getByText("case 3.3.2.3"));
    await expect(canvas.getByText("case 3.3.2.3 did not meet expectations")).toBeVisible();
    await expect(tree.queryByText("case 3.3.3.3")).not.toBeInTheDocument();
  }
}`,...B.parameters?.docs?.source},description:{story:`The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
a very large, deeply-nested tree on the left (hundreds of nodes, so it
scrolls and the filter/expand controls earn their keep) and very large JSON
payloads + logs on the right. Each pane scrolls independently within the
dialog bounds.`,...B.parameters?.docs?.description}}}})))()}H();export{I as Default,B as InsideDialog,z as LargePayloads,L as Running,R as WithCustomAdapter,V as __namedExportsOrder,F as default};
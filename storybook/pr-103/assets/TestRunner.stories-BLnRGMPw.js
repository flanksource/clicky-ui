import{j as r,r as y}from"./iframe-DNj_zNZU.js";import{T as V}from"./TestRunner-Ckx01rTJ.js";import{M as Q}from"./Modal-BTkFnERZ.js";import{B as X}from"./button-l9qmO7rt.js";import{e as ee,g as te}from"./status-kHMr9duR.js";import{c as ne}from"./context-wWds-GDC.js";import{c as q,r as se,s as re}from"./TestRunner.fixtures-CGDnubHv.js";import"./preload-helper-LCYGeQwd.js";import"./Icon-D173D1Xm.js";import"./utils-DW-IJACk.js";import"./SplitPane-DJ3MhDOw.js";import"./use-container-width-DeUORlNR.js";import"./TestTree-CpaqaLmK.js";import"./Tree-XmGojDQe.js";import"./TreeNode-DFpQ6EqE.js";import"./TestTreeNode-BwHP0-u1.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./index-CPURVhFy.js";import"./IconButton-CofRhqoZ.js";import"./MarkIcons-C6oAybEZ.js";import"./TestDetailPanel-BnIM1Uiw.js";import"./select-C4MKv3sD.js";import"./SplitButton-jryXdT3G.js";import"./DropdownMenu-BZOVBMap.js";import"./floating-ui.react-CUsd8blK.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./clipboard-IZxkOcMV.js";import"./JsonView-ABwU1Fjr.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./TabButton-CywAph2D.js";import"./TestFailureDetail-Da12leBW.js";import"./LogViewer-C7quY9zq.js";import"./AnsiHtml-Dt_CWBoi.js";import"./TestRunSummary-Bb3nEe3h.js";import"./ProgressBar-CK0at_0C.js";import"./TestFilterBar-C3OCtFcE.js";import"./filter-bar-multi-wUCtNmvd.js";import"./FilterPill-BCljltSy.js";import"./Combobox-BpxNrIrE.js";import"./loading-CmRQFweU.js";const w=t=>t*1e6;function v(t,e,n=0){const s={id:`node-${n}`,label:`Generated record ${n} with a deliberately verbose label to force horizontal overflow in the JSON viewer`,enabled:n%2===0,score:Number((n*1.37).toFixed(4)),tags:Array.from({length:e},(o,a)=>`tag-${n}-${a}`),metrics:{p50:n,p95:n*4,p99:n*9,samples:n*1e3}};return t>0&&(s.children=Array.from({length:e},(o,a)=>v(t-1,e,n*e+a+1))),s}const J=Array.from({length:500},(t,e)=>({index:e,policyNumber:`POL-${String(e).padStart(6,"0")}`,status:e%5===0?"FAILED":"OK",durationMs:e*13%900,message:`row ${e}: processed with a moderately long human-readable status note`})),K=Array.from({length:800},(t,e)=>`[2026-06-09T17:${String(e%60).padStart(2,"0")}:00Z] step ${e} :: emitting record ${e} with a long-unbroken-token-${"x".repeat(40)} and trailing context`).join(`
`),ae=[{name:"data pipeline",framework:"fixture",route_path:"pipeline",children:[{name:"hydrates the full entity graph",framework:"fixture",route_path:"pipeline/graph",passed:!0,duration:w(4200),detail:v(6,4)},{name:"imports 500 policy rows",framework:"fixture",route_path:"pipeline/import",failed:!0,duration:w(9100),message:"100 of 500 rows failed validation",stdout:K,detail:{summary:{total:500,ok:400,failed:100},rows:J}}]}],x=["go test","ginkgo","fixture"],T=t=>x[t%x.length]??"fixture",oe={summary:{total:500,ok:400,failed:100},rows:J,graph:v(5,3,7)};function W(t,e,n,s){if(e===0){const o=s%6===0,a=!o&&s%5===0,c={name:`case ${t}`,framework:T(s),route_path:t,passed:!o&&!a,failed:o,skipped:a,duration:w(s*17%800+5),stdout:K,detail:oe};return o&&(c.message=`assertion failed in case ${t}`,c.failure_detail={kind:"gomega",summary:`case ${t} did not meet expectations`,expected:`ok (${t})`,actual:`error at iteration ${s}`,location:`pkg/case_${s}_test.go:${s%200+1}`}),c}return{name:`group ${t}`,framework:T(s),route_path:t,children:Array.from({length:n},(o,a)=>W(`${t}.${a}`,e-1,n,s*n+a+1))}}const ie=Array.from({length:4},(t,e)=>W(`${e}`,3,4,e+1)),{expect:f,userEvent:i,within:h}=__STORYBOOK_MODULE_TEST__,tt={title:"Data/TestRunner",component:V,parameters:{layout:"fullscreen",docs:{description:{component:"Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui."}}}};function m({tests:t,done:e,adapters:n}){const[s,o]=y.useState(null),[a,c]=y.useState(ee()),[G,U]=y.useState(null),Y=te(t,a.status,a.framework);return r.jsx(V,{tests:Y,selected:s,filters:a,expandAll:G,done:e,now:e?void 0:0,startTime:0,endTime:e?31278:null,runMeta:{sequence:1,kind:"initial"},statusText:e?"Test run complete":"Running tests...",onSelect:o,onFiltersChange:c,onExpandAllChange:U,onRerun:Z=>window.alert(`Rerun ${Z.name}`),...n?{adapters:n}:{}})}const u={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(m,{tests:q,done:!0})})},g={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(m,{tests:se,done:!1})})},l={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(m,{tests:q,done:!0,adapters:ne([re])})})},p={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(m,{tests:ae,done:!0})}),play:async({canvasElement:t})=>{const e=h(t);await i.click(e.getByText("imports 500 policy rows"));const n=e.getAllByRole("button",{name:"Expand value"});await f(n).toHaveLength(500),await i.click(n[499]),await f(e.getByText("POL-000499")).toBeVisible()}},d={render:()=>{const[t,e]=y.useState(!0);return r.jsxs("div",{className:"p-density-4",children:[r.jsx(X,{onClick:()=>e(!0),children:"Open test results"}),r.jsx(Q,{open:t,onClose:()=>e(!1),title:"Test results",size:"full",children:r.jsx("div",{className:"-mx-density-4 -my-density-3 h-[75vh]",children:r.jsx(m,{tests:ie,done:!0})})})]})},play:async({canvasElement:t})=>{const e=h(t.ownerDocument.body);await i.click(e.getByRole("button",{name:/^Status/}));const n=h(await e.findByRole("menu",{name:"Status"}));await i.click(n.getByText("Failed")),await i.keyboard("{Escape}");const s=h(e.getByRole("tree"));await i.click(s.getByText("case 3.3.2.3")),await f(e.getByText("case 3.3.2.3 did not meet expectations")).toBeVisible(),await f(s.queryByText("case 3.3.3.3")).not.toBeInTheDocument()}};var k,B,S;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done />
    </div>
}`,...(S=(B=u.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var b,E,R;g.parameters={...g.parameters,docs:{...(b=g.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={runningTests} done={false} />
    </div>
}`,...(R=(E=g.parameters)==null?void 0:E.docs)==null?void 0:R.source}}};var _,$,O,j,A;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done adapters={createTestRunnerRegistry([setupAdapter])} />
    </div>
}`,...(O=($=l.parameters)==null?void 0:$.docs)==null?void 0:O.source},description:{story:'Registers a host adapter for "setup" nodes — custom detail body, a "Context"\ntab, and a node action — demonstrating the extension seam that replaces the\nwrapper-with-an-if-chain pattern hosts use today. Select the `setup` node.',...(A=(j=l.parameters)==null?void 0:j.docs)==null?void 0:A.description}}};var N,D,L,M,C;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(L=(D=p.parameters)==null?void 0:D.docs)==null?void 0:L.source},description:{story:`Leaves carrying very large payloads — a deep 6×4 object, a 500-row array, and
an 800-line log. Select "imports 500 policy rows" to stress the JSON view and
confirm the detail pane scrolls independently of the tree. The failing branch
opens by default.`,...(C=(M=p.parameters)==null?void 0:M.docs)==null?void 0:C.description}}};var F,H,P,I,z;d.parameters={...d.parameters,docs:{...(F=d.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(P=(H=d.parameters)==null?void 0:H.docs)==null?void 0:P.source},description:{story:`The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
a very large, deeply-nested tree on the left (hundreds of nodes, so it
scrolls and the filter/expand controls earn their keep) and very large JSON
payloads + logs on the right. Each pane scrolls independently within the
dialog bounds.`,...(z=(I=d.parameters)==null?void 0:I.docs)==null?void 0:z.description}}};const nt=["Default","Running","WithCustomAdapter","LargePayloads","InsideDialog"];export{u as Default,d as InsideDialog,p as LargePayloads,g as Running,l as WithCustomAdapter,nt as __namedExportsOrder,tt as default};

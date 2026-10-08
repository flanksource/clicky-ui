import{j as n,r as g}from"./iframe-DiGWdYeS.js";import{T as V}from"./TestRunner-D9qOedeB.js";import{M as Q}from"./Modal-Lv5UDAp3.js";import{B as X}from"./button-B88NSOe0.js";import{k as ee,l as te}from"./status-CkizSFbO.js";import{c as re}from"./context-oc7PYxSq.js";import{c as q,r as se,s as ne}from"./TestRunner.fixtures-CDQv6cGC.js";import"./preload-helper-CLP1olNy.js";import"./Icon-CXYnH2qb.js";import"./utils-DW-IJACk.js";import"./SplitPane-Ddq9tDYH.js";import"./TestTree-BjDVy2j-.js";import"./Tree-8sIwi2ln.js";import"./TreeNode-BRhH8gFW.js";import"./TestTreeNode-0dnmGeTN.js";import"./Badge-B4Sqf9xK.js";import"./index-CPURVhFy.js";import"./IconButton-dxd2gk7y.js";import"./frameworkIcon-DuZLCDNh.js";import"./TestDetailPanel-BP3oXfWq.js";import"./JsonView-CKM0fZaH.js";import"./AccordionList-COZSOkta.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./TabButton-CBFHkL0c.js";import"./TestFailureDetail-Dg4OewdF.js";import"./LogViewer-DEVDjIhr.js";import"./TestRunSummary-iipiBKJ9.js";import"./ProgressBar-DhOSAKmR.js";import"./TestFilterBar-D5Vsqucc.js";import"./index-Bs9RhWmJ.js";import"./index-3jltqwNg.js";import"./modalStack-D4VFZXfx.js";import"./zIndex-BGbNBNA8.js";import"./loading-do6Jc8dp.js";const f=t=>t*1e6;function v(t,e,r=0){const s={id:`node-${r}`,label:`Generated record ${r} with a deliberately verbose label to force horizontal overflow in the JSON viewer`,enabled:r%2===0,score:Number((r*1.37).toFixed(4)),tags:Array.from({length:e},(o,a)=>`tag-${r}-${a}`),metrics:{p50:r,p95:r*4,p99:r*9,samples:r*1e3}};return t>0&&(s.children=Array.from({length:e},(o,a)=>v(t-1,e,r*e+a+1))),s}const J=Array.from({length:500},(t,e)=>({index:e,policyNumber:`POL-${String(e).padStart(6,"0")}`,status:e%5===0?"FAILED":"OK",durationMs:e*13%900,message:`row ${e}: processed with a moderately long human-readable status note`})),K=Array.from({length:800},(t,e)=>`[2026-06-09T17:${String(e%60).padStart(2,"0")}:00Z] step ${e} :: emitting record ${e} with a long-unbroken-token-${"x".repeat(40)} and trailing context`).join(`
`),ae=[{name:"data pipeline",framework:"fixture",route_path:"pipeline",children:[{name:"hydrates the full entity graph",framework:"fixture",route_path:"pipeline/graph",passed:!0,duration:f(4200),detail:v(6,4)},{name:"imports 500 policy rows",framework:"fixture",route_path:"pipeline/import",failed:!0,duration:f(9100),message:"100 of 500 rows failed validation",stdout:K,detail:{summary:{total:500,ok:400,failed:100},rows:J}}]}],w=["go test","ginkgo","fixture"],T=t=>w[t%w.length]??"fixture",oe={summary:{total:500,ok:400,failed:100},rows:J,graph:v(5,3,7)};function W(t,e,r,s){if(e===0){const o=s%6===0,a=!o&&s%5===0,i={name:`case ${t}`,framework:T(s),route_path:t,passed:!o&&!a,failed:o,skipped:a,duration:f(s*17%800+5),stdout:K,detail:oe};return o&&(i.message=`assertion failed in case ${t}`,i.failure_detail={kind:"gomega",summary:`case ${t} did not meet expectations`,expected:`ok (${t})`,actual:`error at iteration ${s}`,location:`pkg/case_${s}_test.go:${s%200+1}`}),i}return{name:`group ${t}`,framework:T(s),route_path:t,children:Array.from({length:r},(o,a)=>W(`${t}.${a}`,e-1,r,s*r+a+1))}}const ie=Array.from({length:4},(t,e)=>W(`${e}`,3,4,e+1)),{expect:y,userEvent:h,within:x}=__STORYBOOK_MODULE_TEST__,Ve={title:"Data/TestRunner",component:V,parameters:{layout:"fullscreen",docs:{description:{component:"Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui."}}}};function p({tests:t,done:e,adapters:r}){const[s,o]=g.useState(null),[a,i]=g.useState(ee()),[G,U]=g.useState(null),Y=te(t,a.status,a.framework);return n.jsx(V,{tests:Y,selected:s,filters:a,expandAll:G,done:e,now:e?void 0:0,startTime:0,endTime:e?31278:null,runMeta:{sequence:1,kind:"initial"},statusText:e?"Test run complete":"Running tests...",onSelect:o,onFiltersChange:i,onExpandAllChange:U,onRerun:Z=>window.alert(`Rerun ${Z.name}`),...r?{adapters:r}:{}})}const m={render:()=>n.jsx("div",{className:"h-screen",children:n.jsx(p,{tests:q,done:!0})})},u={render:()=>n.jsx("div",{className:"h-screen",children:n.jsx(p,{tests:se,done:!1})})},l={render:()=>n.jsx("div",{className:"h-screen",children:n.jsx(p,{tests:q,done:!0,adapters:re([ne])})})},c={render:()=>n.jsx("div",{className:"h-screen",children:n.jsx(p,{tests:ae,done:!0})}),play:async({canvasElement:t})=>{const e=x(t);await h.click(e.getByText("imports 500 policy rows"));const r=e.getAllByRole("button",{name:"Expand value"});await y(r).toHaveLength(500),await h.click(r[499]),await y(e.getByText("POL-000499")).toBeVisible()}},d={render:()=>{const[t,e]=g.useState(!0);return n.jsxs("div",{className:"p-density-4",children:[n.jsx(X,{onClick:()=>e(!0),children:"Open test results"}),n.jsx(Q,{open:t,onClose:()=>e(!1),title:"Test results",size:"full",children:n.jsx("div",{className:"-mx-density-4 -my-density-3 h-[75vh]",children:n.jsx(p,{tests:ie,done:!0})})})]})},play:async({canvasElement:t})=>{const e=x(t.ownerDocument.body);await h.click(e.getByTitle("Failed: neutral"));const r=x(e.getByRole("tree"));await h.click(r.getByText("case 3.3.2.3")),await y(e.getByText("case 3.3.2.3 did not meet expectations")).toBeVisible(),await y(r.queryByText("case 3.3.3.3")).not.toBeInTheDocument()}};var k,B,S;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done />
    </div>
}`,...(S=(B=m.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var b,_,$;u.parameters={...u.parameters,docs:{...(b=u.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={runningTests} done={false} />
    </div>
}`,...($=(_=u.parameters)==null?void 0:_.docs)==null?void 0:$.source}}};var E,O,R,j,A;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done adapters={createTestRunnerRegistry([setupAdapter])} />
    </div>
}`,...(R=(O=l.parameters)==null?void 0:O.docs)==null?void 0:R.source},description:{story:'Registers a host adapter for "setup" nodes — custom detail body, a "Context"\ntab, and a node action — demonstrating the extension seam that replaces the\nwrapper-with-an-if-chain pattern hosts use today. Select the `setup` node.',...(A=(j=l.parameters)==null?void 0:j.docs)==null?void 0:A.description}}};var N,D,L,C,F;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(L=(D=c.parameters)==null?void 0:D.docs)==null?void 0:L.source},description:{story:`Leaves carrying very large payloads — a deep 6×4 object, a 500-row array, and
an 800-line log. Select "imports 500 policy rows" to stress the JSON view and
confirm the detail pane scrolls independently of the tree. The failing branch
opens by default.`,...(F=(C=c.parameters)==null?void 0:C.docs)==null?void 0:F.description}}};var M,H,P,I,z;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
    await userEvent.click(canvas.getByTitle("Failed: neutral"));
    const tree = within(canvas.getByRole("tree"));
    await userEvent.click(tree.getByText("case 3.3.2.3"));
    await expect(canvas.getByText("case 3.3.2.3 did not meet expectations")).toBeVisible();
    await expect(tree.queryByText("case 3.3.3.3")).not.toBeInTheDocument();
  }
}`,...(P=(H=d.parameters)==null?void 0:H.docs)==null?void 0:P.source},description:{story:`The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
a very large, deeply-nested tree on the left (hundreds of nodes, so it
scrolls and the filter/expand controls earn their keep) and very large JSON
payloads + logs on the right. Each pane scrolls independently within the
dialog bounds.`,...(z=(I=d.parameters)==null?void 0:I.docs)==null?void 0:z.description}}};const qe=["Default","Running","WithCustomAdapter","LargePayloads","InsideDialog"];export{m as Default,d as InsideDialog,c as LargePayloads,u as Running,l as WithCustomAdapter,qe as __namedExportsOrder,Ve as default};

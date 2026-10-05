import{j as e,r as d}from"./iframe-yuMqpJhb.js";import{T as H}from"./TestRunner-BRiBiX3a.js";import{M as W}from"./Modal-CvmmoTwj.js";import{B as _}from"./button-FFEDo1GN.js";import{k as q,l as G}from"./status-CePNqLwa.js";import{c as $}from"./context-Bl7AYTpI.js";import{c as M,l as K,a as Q,r as U,s as V}from"./TestRunner.fixtures-avsLeWpM.js";import"./preload-helper-DxStcPpW.js";import"./Icon-DbERJsbC.js";import"./utils-DW-IJACk.js";import"./SplitPane-u1uCztaV.js";import"./TestTree-DIgTIsBo.js";import"./Tree-CNa4Jwo5.js";import"./TreeNode-BiehcMpK.js";import"./TestTreeNode-BXtqX1SV.js";import"./Badge-BxnYNHl7.js";import"./index-CPURVhFy.js";import"./IconButton-CLZ4GHfp.js";import"./frameworkIcon-CQ4zr8qj.js";import"./TestDetailPanel-DdXQb3zP.js";import"./JsonView-Cjjo78UN.js";import"./TabButton-CCzxMUU1.js";import"./TestFailureDetail-B9o5cbrP.js";import"./LogViewer-B7Vhoct1.js";import"./TestRunSummary-BGKpWHSK.js";import"./ProgressBar-Dgo3FJdK.js";import"./TestFilterBar-DbOawTiU.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./loading-C6QaURdm.js";const ke={title:"Data/TestRunner",component:H,parameters:{layout:"fullscreen",docs:{description:{component:"Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui."}}}};function a({tests:l,done:s,adapters:c}){const[B,P]=d.useState(null),[p,z]=d.useState(q()),[F,L]=d.useState(null),I=G(l,p.status,p.framework);return e.jsx(H,{tests:I,selected:B,filters:p,expandAll:F,done:s,now:s?void 0:0,startTime:0,endTime:s?31278:null,runMeta:{sequence:1,kind:"initial"},statusText:s?"Test run complete":"Running tests...",onSelect:P,onFiltersChange:z,onExpandAllChange:L,onRerun:J=>window.alert(`Rerun ${J.name}`),...c?{adapters:c}:{}})}const o={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:M,done:!0})})},i={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:U,done:!1})})},t={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:M,done:!0,adapters:$([V])})})},r={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:Q,done:!0})})},n={render:()=>{const[l,s]=d.useState(!0);return e.jsxs("div",{className:"p-density-4",children:[e.jsx(_,{onClick:()=>s(!0),children:"Open test results"}),e.jsx(W,{open:l,onClose:()=>s(!1),title:"Test results",size:"full",children:e.jsx("div",{className:"-mx-density-4 -my-density-3 h-[75vh]",children:e.jsx(a,{tests:K,done:!0})})})]})}};var m,u,h;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done />
    </div>
}`,...(h=(u=o.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var g,f,y;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={runningTests} done={false} />
    </div>
}`,...(y=(f=i.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var v,x,T,j,S;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={completedTests} done adapters={createTestRunnerRegistry([setupAdapter])} />
    </div>
}`,...(T=(x=t.parameters)==null?void 0:x.docs)==null?void 0:T.source},description:{story:'Registers a host adapter for "setup" nodes — custom detail body, a "Context"\ntab, and a node action — demonstrating the extension seam that replaces the\nwrapper-with-an-if-chain pattern hosts use today. Select the `setup` node.',...(S=(j=t.parameters)==null?void 0:j.docs)==null?void 0:S.description}}};var N,R,w,b,C;r.parameters={...r.parameters,docs:{...(N=r.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <Harness tests={largeDetailTests} done />
    </div>
}`,...(w=(R=r.parameters)==null?void 0:R.docs)==null?void 0:w.source},description:{story:`Leaves carrying very large payloads — a deep 6×4 object, a 500-row array, and
an 800-line log. Select "imports 500 policy rows" to stress the JSON view and
confirm the detail pane scrolls independently of the tree. The failing branch
opens by default.`,...(C=(b=r.parameters)==null?void 0:b.docs)==null?void 0:C.description}}};var O,k,A,D,E;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
  }
}`,...(A=(k=n.parameters)==null?void 0:k.docs)==null?void 0:A.source},description:{story:`The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
a very large, deeply-nested tree on the left (hundreds of nodes, so it
scrolls and the filter/expand controls earn their keep) and very large JSON
payloads + logs on the right. Each pane scrolls independently within the
dialog bounds.`,...(E=(D=n.parameters)==null?void 0:D.docs)==null?void 0:E.description}}};const Ae=["Default","Running","WithCustomAdapter","LargePayloads","InsideDialog"];export{o as Default,n as InsideDialog,r as LargePayloads,i as Running,t as WithCustomAdapter,Ae as __namedExportsOrder,ke as default};

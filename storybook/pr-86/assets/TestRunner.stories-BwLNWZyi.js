import{j as e,r as d}from"./iframe-v660Eh3J.js";import{T as H}from"./TestRunner-Ll_B9Koh.js";import{M as W}from"./Modal-WyKeqA_t.js";import{B as _}from"./button-DaO-3A-f.js";import{e as q,h as G}from"./status-DHYz_rzt.js";import{c as $}from"./adapter-mtVXS8mm.js";import{c as M,l as K,a as Q,r as U,s as V}from"./TestRunner.fixtures-C-3BSZK-.js";import"./preload-helper-CcRYDqr-.js";import"./Icon-pN7oW891.js";import"./utils-DW-IJACk.js";import"./SplitPane-CALu-IhY.js";import"./TestTree-RI6MyPGR.js";import"./Tree-DaKsVOci.js";import"./TreeNode-B-l1kSGR.js";import"./TestTreeNode-Uc_0nHmR.js";import"./Badge-B3waKE4p.js";import"./index-CPURVhFy.js";import"./IconButton-fv4G9gOe.js";import"./frameworkIcon-BI6AdVeY.js";import"./TestDetailPanel-CPNfPU1F.js";import"./JsonView-3s3g6ujc.js";import"./TabButton-DeI-6eZc.js";import"./TestFailureDetail-ByWsvBYq.js";import"./LogViewer-BneqzGP7.js";import"./TestRunSummary-DW6ngtwX.js";import"./ProgressBar-cAtI-mLV.js";import"./TestFilterBar-DPvT-9ad.js";import"./index-BTij907j.js";import"./index-De58Dh1Z.js";import"./modalStack-SZlRUvIz.js";import"./zIndex-BGbNBNA8.js";import"./loading-CqVpLPQc.js";const Ae={title:"Data/TestRunner",component:H,parameters:{layout:"fullscreen",docs:{description:{component:"Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui."}}}};function a({tests:l,done:s,adapters:c}){const[B,P]=d.useState(null),[p,z]=d.useState(q()),[F,L]=d.useState(null),I=G(l,p.status,p.framework);return e.jsx(H,{tests:I,selected:B,filters:p,expandAll:F,done:s,now:s?void 0:0,startTime:0,endTime:s?31278:null,runMeta:{sequence:1,kind:"initial"},statusText:s?"Test run complete":"Running tests...",onSelect:P,onFiltersChange:z,onExpandAllChange:L,onRerun:J=>window.alert(`Rerun ${J.name}`),...c?{adapters:c}:{}})}const o={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:M,done:!0})})},i={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:U,done:!1})})},t={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:M,done:!0,adapters:$([V])})})},r={render:()=>e.jsx("div",{className:"h-screen",children:e.jsx(a,{tests:Q,done:!0})})},n={render:()=>{const[l,s]=d.useState(!0);return e.jsxs("div",{className:"p-density-4",children:[e.jsx(_,{onClick:()=>s(!0),children:"Open test results"}),e.jsx(W,{open:l,onClose:()=>s(!1),title:"Test results",size:"full",children:e.jsx("div",{className:"-mx-density-4 -my-density-3 h-[75vh]",children:e.jsx(a,{tests:K,done:!0})})})]})}};var m,u,h;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
opens by default.`,...(C=(b=r.parameters)==null?void 0:b.docs)==null?void 0:C.description}}};var O,A,D,k,E;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(D=(A=n.parameters)==null?void 0:A.docs)==null?void 0:D.source},description:{story:`The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
a very large, deeply-nested tree on the left (hundreds of nodes, so it
scrolls and the filter/expand controls earn their keep) and very large JSON
payloads + logs on the right. Each pane scrolls independently within the
dialog bounds.`,...(E=(k=n.parameters)==null?void 0:k.docs)==null?void 0:E.description}}};const De=["Default","Running","WithCustomAdapter","LargePayloads","InsideDialog"];export{o as Default,n as InsideDialog,r as LargePayloads,i as Running,t as WithCustomAdapter,De as __namedExportsOrder,Ae as default};

import{j as s}from"./iframe-DxH86FBA.js";import{V as n}from"./VerificationResults-Bvi8ve3g.js";import"./preload-helper-CwXsRPHT.js";import"./utils-DW-IJACk.js";import"./Icon-w2YOVKhv.js";import"./JsonView-GcXUgX4X.js";import"./TestFailureDetail-BJwLVUMh.js";import"./LogViewer-BmIt139Y.js";import"./status-Dzoq5ZKo.js";import"./context-C3JVKxMk.js";import"./TestRunner-Ch61gVK7.js";import"./SplitPane-C2OvZPTU.js";import"./TestTree-CLaQtBNI.js";import"./Tree-DYj4yj7v.js";import"./TreeNode-0_t9gltg.js";import"./TestTreeNode-mJ2aS7K5.js";import"./Badge-ul0vb2Pp.js";import"./index-CPURVhFy.js";import"./IconButton-C9GSHWpU.js";import"./frameworkIcon-BaNYuxgN.js";import"./TestDetailPanel-CT0yBsw7.js";import"./button-O6d4Fxrc.js";import"./loading-DCaPMG1Q.js";import"./TabButton-SH496z5C.js";import"./TestRunSummary-GCipvDjR.js";import"./ProgressBar-B6t282Ad.js";import"./TestFilterBar-CngZ3EVY.js";function I(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function L(e){return e.failed?"failed":e.timed_out?"timedout":e.warned?"warned":e.skipped?"skipped":e.running?"running":e.pending?"pending":e.passed?"passed":null}function z(e,r){e.total+=r.total,e.passed+=r.passed,e.failed+=r.failed,e.warned+=r.warned,e.skipped+=r.skipped,e.pending+=r.pending,e.running+=r.running,e.timedout+=r.timedout}function B(e){const r=I(),i=A=>{for(const t of A){if(t.summary){z(r,t.summary);continue}if(t.children&&t.children.length>0){i(t.children);continue}const f=L(t);f!==null&&(r[f]+=1,r.total+=1)}};return i(e),r}const fe={title:"Data/Verification",component:n,parameters:{layout:"fullscreen",docs:{description:{component:"Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing."}}}};function a(e){const r=e.state??"passed",i=e.tests??[];return{kind:"fixture",ran:!0,passed:r==="passed",summary:B(i),state:r,...e}}const o={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"run unit tests",framework:"fixture",passed:!0,duration:41e8}],checklist:[{item:"docs updated",passed:!0}]})})})},d={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({passed:!1,state:"failed",reason:"1 of 2 checks failed",tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"assert no regressions",framework:"fixture",failed:!0,duration:125e7,context:{cel_expression:"results.failed == 0",cel_vars:{failed:2,suite:"todos"},expected:0,actual:2}}]})})})},c={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({state:"running",tests:[{name:"compile the fixture",framework:"fixture",running:!0,progress:{phase:"build",done:3,total:10}}]})})})},p={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({passed:!1,state:"failed",checklist:[{item:"readme updated",passed:!0},{item:"changelog entry added",passed:!1,message:"missing entry for this change"},{item:"reviewed by a teammate",passed:null}]})})})},m={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({kind:"cmd",state:"failed",reason:"1 of 2 checks failed",feedback:`checking config...
FAIL: missing field 'name'`})})})},u={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:a({kind:"cmd",state:"errored",reason:"verifier crashed: exit status 1"})})})},l={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:null})})};var h,g,k;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      tests: [{
        name: "lint the repo",
        framework: "fixture",
        passed: true,
        duration: 820_000_000
      }, {
        name: "run unit tests",
        framework: "fixture",
        passed: true,
        duration: 4_100_000_000
      }],
      checklist: [{
        item: "docs updated",
        passed: true
      }]
    })} />
    </div>
}`,...(k=(g=o.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};var x,v,y;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      passed: false,
      state: "failed",
      reason: "1 of 2 checks failed",
      tests: [{
        name: "lint the repo",
        framework: "fixture",
        passed: true,
        duration: 820_000_000
      }, {
        name: "assert no regressions",
        framework: "fixture",
        failed: true,
        duration: 1_250_000_000,
        context: {
          cel_expression: "results.failed == 0",
          cel_vars: {
            failed: 2,
            suite: "todos"
          },
          expected: 0,
          actual: 2
        }
      }]
    })} />
    </div>
}`,...(y=(v=d.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var w,N,_;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      state: "running",
      tests: [{
        name: "compile the fixture",
        framework: "fixture",
        running: true,
        progress: {
          phase: "build",
          done: 3,
          total: 10
        }
      }]
    })} />
    </div>
}`,...(_=(N=c.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var j,R,V;p.parameters={...p.parameters,docs:{...(j=p.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      passed: false,
      state: "failed",
      checklist: [{
        item: "readme updated",
        passed: true
      }, {
        item: "changelog entry added",
        passed: false,
        message: "missing entry for this change"
      }, {
        item: "reviewed by a teammate",
        passed: null
      }]
    })} />
    </div>
}`,...(V=(R=p.parameters)==null?void 0:R.docs)==null?void 0:V.source}}};var b,S,C;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "failed",
      reason: "1 of 2 checks failed",
      feedback: "checking config...\\nFAIL: missing field 'name'"
    })} />
    </div>
}`,...(C=(S=m.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var E,F,W;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "errored",
      reason: "verifier crashed: exit status 1"
    })} />
    </div>
}`,...(W=(F=u.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var P,O,T;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={null} />
    </div>
}`,...(T=(O=l.parameters)==null?void 0:O.docs)==null?void 0:T.source}}};const he=["Passing","FailingWithCel","RunningWithProgress","ChecklistOnly","CmdFeedback","ErroredWithNoTests","Empty"];export{p as ChecklistOnly,m as CmdFeedback,l as Empty,u as ErroredWithNoTests,d as FailingWithCel,o as Passing,c as RunningWithProgress,he as __namedExportsOrder,fe as default};

import{j as s}from"./iframe-BItsxAjD.js";import{V as n}from"./VerificationResults-QftBXqnK.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./JsonView-CWGyot2w.js";import"./button-25dF40vQ.js";import"./index-CPURVhFy.js";import"./loading-BOeFbzh-.js";import"./AccordionList-B60ONwgr.js";import"./collections-CoHfwOze.js";import"./Icon-Dq8eEpLP.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-B4WuduE9.js";import"./TestFailureDetail-CIAGwvn2.js";import"./LogViewer-BorJZ9Zd.js";import"./AnsiHtml-Bh59o8S2.js";import"./status-kHMr9duR.js";import"./MarkIcons-DB3c2xp5.js";import"./context-D1Dc57ze.js";import"./TestRunner-CMxtbfGv.js";import"./SplitPane-CJcE__0_.js";import"./use-container-width-1_6ydqQ8.js";import"./TestTree-DjLVRZcF.js";import"./Tree-Cfrvkts8.js";import"./TreeNode-DRwHEDi3.js";import"./TestTreeNode-YC_DlUKb.js";import"./IconButton-DN_Y5FZs.js";import"./TestDetailPanel-CVsyAdKC.js";import"./SplitButton-BrVmgGZc.js";import"./DropdownMenu-D3oVIRg_.js";import"./floating-ui.react-CNVnZXsN.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./DropdownMenuSubmenu-C4lOloCs.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./clipboard-CvmOL5Gm.js";import"./TabButton-L-L03UjT.js";import"./TestRunSummary-BX6Ao_d8.js";import"./ProgressBar-CA6Y3ar0.js";import"./TestFilterBar-D0SLaPRW.js";import"./filter-bar-multi-DKn2MepO.js";import"./FilterPill-DOPLjimn.js";import"./Combobox-D5npeKNx.js";function I(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function L(e){return e.failed?"failed":e.timed_out?"timedout":e.warned?"warned":e.skipped?"skipped":e.running?"running":e.pending?"pending":e.passed?"passed":null}function z(e,r){e.total+=r.total,e.passed+=r.passed,e.failed+=r.failed,e.warned+=r.warned,e.skipped+=r.skipped,e.pending+=r.pending,e.running+=r.running,e.timedout+=r.timedout}function B(e){const r=I(),a=A=>{for(const t of A){if(t.summary){z(r,t.summary);continue}if(t.children&&t.children.length>0){a(t.children);continue}const f=L(t);f!==null&&(r[f]+=1,r.total+=1)}};return a(e),r}const Fe={title:"Data/Verification",component:n,parameters:{layout:"fullscreen",docs:{description:{component:"Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing."}}}};function i(e){const r=e.state??"passed",a=e.tests??[];return{kind:"fixture",ran:!0,passed:r==="passed",summary:B(a),state:r,...e}}const o={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"run unit tests",framework:"fixture",passed:!0,duration:41e8}],checklist:[{item:"docs updated",passed:!0}]})})})},d={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({passed:!1,state:"failed",reason:"1 of 2 checks failed",tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"assert no regressions",framework:"fixture",failed:!0,duration:125e7,context:{cel_expression:"results.failed == 0",cel_vars:{failed:2,suite:"todos"},expected:0,actual:2}}]})})})},p={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({state:"running",tests:[{name:"compile the fixture",framework:"fixture",running:!0,progress:{phase:"build",done:3,total:10}}]})})})},c={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({passed:!1,state:"failed",checklist:[{item:"readme updated",passed:!0},{item:"changelog entry added",passed:!1,message:"missing entry for this change"},{item:"reviewed by a teammate",passed:null}]})})})},m={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({kind:"cmd",state:"failed",reason:"1 of 2 checks failed",feedback:`checking config...
FAIL: missing field 'name'`})})})},u={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:i({kind:"cmd",state:"errored",reason:"verifier crashed: exit status 1"})})})},l={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:null})})};var h,g,k;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(y=(v=d.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var w,N,_;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(_=(N=p.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var j,R,V;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(V=(R=c.parameters)==null?void 0:R.docs)==null?void 0:V.source}}};var b,S,C;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(T=(O=l.parameters)==null?void 0:O.docs)==null?void 0:T.source}}};const We=["Passing","FailingWithCel","RunningWithProgress","ChecklistOnly","CmdFeedback","ErroredWithNoTests","Empty"];export{c as ChecklistOnly,m as CmdFeedback,l as Empty,u as ErroredWithNoTests,d as FailingWithCel,o as Passing,p as RunningWithProgress,We as __namedExportsOrder,Fe as default};

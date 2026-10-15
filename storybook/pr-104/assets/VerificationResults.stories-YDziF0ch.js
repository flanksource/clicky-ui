import{j as r}from"./iframe-BpsZ2AnK.js";import{V as a}from"./VerificationResults-D2X8-972.js";import"./preload-helper-MsDOuF3K.js";import"./utils-DW-IJACk.js";import"./JsonView-Bc5NK7ov.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./AccordionList-C_UQ-gQM.js";import"./collections-CoHfwOze.js";import"./Icon-nPi6h081.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-D-gKKF74.js";import"./LogViewer-BOJUjsSA.js";import"./AnsiHtml-DwUi97A2.js";import"./MarkIcons-CNtmcNEk.js";import"./context-CqLxKUJH.js";import"./TestRunner-oNz4dWo7.js";import"./SplitPane-DprImfge.js";import"./use-container-width-BECRZpSr.js";import"./TestTree-PQXYvP6Z.js";import"./Tree-CpaciHai.js";import"./TreeNode-CGkFCcsE.js";import"./TestTreeNode-CxihrtzF.js";import"./IconButton-D62I1GKu.js";import"./TestDetailPanel-Cr5opjcf.js";import"./select-DmfR8ats.js";import"./SplitButton-Bzdou-Jh.js";import"./DropdownMenu-BbLBG52q.js";import"./floating-ui.react-B4WvYE6p.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./DropdownMenuSubmenu-bIAIsBPN.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./clipboard-Biao7_zQ.js";import"./TabButton-B6Oftv0m.js";import"./TestRunSummary-BR4aIDqh.js";import"./ProgressBar-B7dlvag5.js";import"./TestFilterBar-CTtPk80d.js";import"./filter-bar-multi-CZ5GAuNj.js";import"./FilterPill-D1QT-mQn.js";import"./Combobox-C062J8HP.js";function z(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function B(e){return e.failed?"failed":e.timed_out?"timedout":e.warned?"warned":e.skipped?"skipped":e.running?"running":e.pending?"pending":e.passed?"passed":null}function H(e,t){e.total+=t.total,e.passed+=t.passed,e.failed+=t.failed,e.warned+=t.warned,e.skipped+=t.skipped,e.pending+=t.pending,e.running+=t.running,e.timedout+=t.timedout}function J(e){const t=z(),n=h=>{for(const s of h){if(s.summary){H(t,s.summary);continue}if(s.children&&s.children.length>0){n(s.children);continue}const g=B(s);g!==null&&(t[g]+=1,t.total+=1)}};return n(e),t}const Le={title:"Data/Verification",component:a,parameters:{layout:"fullscreen",docs:{description:{component:"Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing."}}}};function i(e){const t=e.state??"passed",n=e.tests??[];return{kind:"fixture",ran:!0,passed:t==="passed",summary:J(n),state:t,...e}}const d={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"run unit tests",framework:"fixture",passed:!0,duration:41e8}],checklist:[{item:"docs updated",passed:!0}]})})})},p={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({passed:!1,state:"failed",reason:"1 of 2 checks failed",tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"assert no regressions",framework:"fixture",failed:!0,duration:125e7,context:{cel_expression:"results.failed == 0",cel_vars:{failed:2,suite:"todos"},expected:0,actual:2}}]})})})},m={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({state:"running",tests:[{name:"compile the fixture",framework:"fixture",running:!0,progress:{phase:"build",done:3,total:10}}]})})})},c={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({passed:!1,state:"failed",checklist:[{item:"readme updated",passed:!0},{item:"changelog entry added",passed:!1,message:"missing entry for this change"},{item:"reviewed by a teammate",passed:null}]})})})},l={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({kind:"cmd",state:"failed",reason:"1 of 2 checks failed",feedback:`checking config...
FAIL: missing field 'name'`})})})},u={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({kind:"cmd",state:"errored",reason:"verifier crashed: exit status 1"})})})},o={render:()=>{const e={name:"plan reaches review",framework:"todo_prompt",passed:!0,duration:41e9,detail:{step:{id:"plan",kind:"todo_prompt"},outputs:{plan:{content:"Add greet/greet.go with a Greeting helper"}},exports:{PLAN_ID:{value:"plan-3",step:"plan"}},attempts:[{attempt:1,status:"failed",error:"launch refused: admission queue full",durationMs:2100},{attempt:2,status:"passed",durationMs:38900}],wait:{policy:{until:"todo.status == 'review'",failWhen:"todo.status in ['failed','ask']",interval:"1s",backoff:{factor:1.5,max:"10s"},jitter:"20%",timeout:"3m"},outcome:"satisfied",durationMs:3e3,outputs:{todo:{status:"review"}}}}},{attempts:t,...n}=e.detail,h=[{...e.detail.attempts[0],result:{name:e.name,framework:e.framework,failed:!0,message:"launch refused: admission queue full",detail:{step:n.step,outputs:{launch:{failed:!0}}}}},{...e.detail.attempts[1],result:{...e,detail:n}}],s={...e,detail:{...n,attempts:h}};return r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({tests:[s]}),selected:s,onSelect:()=>{}})})}},f={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:null})})};var k,x,v;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(v=(x=d.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var w,y,_;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(_=(y=p.parameters)==null?void 0:y.docs)==null?void 0:_.source}}};var N,j,R;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(R=(j=m.parameters)==null?void 0:j.docs)==null?void 0:R.source}}};var V,S,b;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(b=(S=c.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var W,A,P;l.parameters={...l.parameters,docs:{...(W=l.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "failed",
      reason: "1 of 2 checks failed",
      feedback: "checking config...\\nFAIL: missing field 'name'"
    })} />
    </div>
}`,...(P=(A=l.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var C,E,F;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "errored",
      reason: "verifier crashed: exit status 1"
    })} />
    </div>
}`,...(F=(E=u.parameters)==null?void 0:E.docs)==null?void 0:F.source}}};var M,T,q,I,L;o.parameters={...o.parameters,docs:{...(M=o.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => {
    const plan = {
      name: "plan reaches review",
      framework: "todo_prompt",
      passed: true,
      duration: 41_000_000_000,
      detail: {
        step: {
          id: "plan",
          kind: "todo_prompt"
        },
        outputs: {
          plan: {
            content: "Add greet/greet.go with a Greeting helper"
          }
        },
        exports: {
          PLAN_ID: {
            value: "plan-3",
            step: "plan"
          }
        },
        attempts: [{
          attempt: 1,
          status: "failed",
          error: "launch refused: admission queue full",
          durationMs: 2100
        }, {
          attempt: 2,
          status: "passed",
          durationMs: 38900
        }],
        wait: {
          policy: {
            until: "todo.status == 'review'",
            failWhen: "todo.status in ['failed','ask']",
            interval: "1s",
            backoff: {
              factor: 1.5,
              max: "10s"
            },
            jitter: "20%",
            timeout: "3m"
          },
          outcome: "satisfied",
          durationMs: 3000,
          outputs: {
            todo: {
              status: "review"
            }
          }
        }
      }
    };
    const {
      attempts: _attempts,
      ...detail
    } = plan.detail;
    const attempts = [{
      ...plan.detail.attempts[0],
      result: {
        name: plan.name,
        framework: plan.framework,
        failed: true,
        message: "launch refused: admission queue full",
        detail: {
          step: detail.step,
          outputs: {
            launch: {
              failed: true
            }
          }
        }
      }
    }, {
      ...plan.detail.attempts[1],
      result: {
        ...plan,
        detail
      }
    }];
    const selected = {
      ...plan,
      detail: {
        ...detail,
        attempts
      }
    };
    return <div className="h-screen">
        <VerificationResults report={report({
        tests: [selected]
      })} selected={selected} onSelect={() => {}} />
      </div>;
  }
}`,...(q=(T=o.parameters)==null?void 0:T.docs)==null?void 0:q.source},description:{story:"A typed `todo_prompt` step: a wait that polled three times, a retried launch, and its exports.",...(L=(I=o.parameters)==null?void 0:I.docs)==null?void 0:L.description}}};var D,O,G;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={null} />
    </div>
}`,...(G=(O=f.parameters)==null?void 0:O.docs)==null?void 0:G.source}}};const De=["Passing","FailingWithCel","RunningWithProgress","ChecklistOnly","CmdFeedback","ErroredWithNoTests","TypedStepWithWait","Empty"];export{c as ChecklistOnly,l as CmdFeedback,f as Empty,u as ErroredWithNoTests,p as FailingWithCel,d as Passing,m as RunningWithProgress,o as TypedStepWithWait,De as __namedExportsOrder,Le as default};

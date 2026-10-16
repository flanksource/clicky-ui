import{j as r}from"./iframe-BUpmsD4_.js";import{V as a}from"./VerificationResults-c8SI7q_i.js";import"./preload-helper-PGaPgbNH.js";import"./utils-DW-IJACk.js";import"./JsonView-B4Nw9Fl0.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./loading-BVCwDMQn.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./Icon-DTAROQQs.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./MarkIcons-CfCn3kEp.js";import"./TestFailureDetail-BrvB66d8.js";import"./LogViewer-CEwue8JF.js";import"./AnsiHtml-D5usPwhf.js";import"./StackDumpView-Bt2PqYit.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-B8te7UN1.js";import"./StackFrameRow-C5aLaa6B.js";import"./FrameSourceWindow-CS1fR05x.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./context-CbxsXGk1.js";import"./TestRunner-C9HU3JQ_.js";import"./SplitPane-DKGU1QZo.js";import"./use-container-width-gqrIhpWo.js";import"./TestTree-D0tj5waL.js";import"./Tree-B-YvG_G5.js";import"./TreeNode-D7MwMn0M.js";import"./TestTreeNode-C1YfD0Rq.js";import"./IconButton-CdsDTQWb.js";import"./TestDetailPanel-CM5yh9cS.js";import"./select-CBErET8H.js";import"./SplitButton-z2Xctce4.js";import"./DropdownMenu-LyJi-wEU.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./clipboard-CryKTeQj.js";import"./TabButton-DQklQpgZ.js";import"./format-2niohfpq.js";import"./MetricTile-Ci2m0b6I.js";import"./metric-tone-UjdEBFmO.js";import"./TestRunSummary-BRG_J7wq.js";import"./ProgressBar-D4O_K_B8.js";import"./TestFilterBar-Bi2uxbDd.js";import"./filter-bar-multi-EJU47-mi.js";import"./FilterPill-ZhMJAiFw.js";import"./Combobox-CaQ5ogPs.js";function z(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function B(e){return e.failed?"failed":e.timed_out?"timedout":e.warned?"warned":e.skipped?"skipped":e.running?"running":e.pending?"pending":e.passed?"passed":null}function H(e,t){e.total+=t.total,e.passed+=t.passed,e.failed+=t.failed,e.warned+=t.warned,e.skipped+=t.skipped,e.pending+=t.pending,e.running+=t.running,e.timedout+=t.timedout}function J(e){const t=z(),n=h=>{for(const s of h){if(s.summary){H(t,s.summary);continue}if(s.children&&s.children.length>0){n(s.children);continue}const g=B(s);g!==null&&(t[g]+=1,t.total+=1)}};return n(e),t}const Qe={title:"Data/Verification",component:a,parameters:{layout:"fullscreen",docs:{description:{component:"Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing."}}}};function i(e){const t=e.state??"passed",n=e.tests??[];return{kind:"fixture",ran:!0,passed:t==="passed",summary:J(n),state:t,...e}}const d={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"run unit tests",framework:"fixture",passed:!0,duration:41e8}],checklist:[{item:"docs updated",passed:!0}]})})})},p={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({passed:!1,state:"failed",reason:"1 of 2 checks failed",tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"assert no regressions",framework:"fixture",failed:!0,duration:125e7,context:{cel_expression:"results.failed == 0",cel_vars:{failed:2,suite:"todos"},expected:0,actual:2}}]})})})},m={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({state:"running",tests:[{name:"compile the fixture",framework:"fixture",running:!0,progress:{phase:"build",done:3,total:10}}]})})})},c={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({passed:!1,state:"failed",checklist:[{item:"readme updated",passed:!0},{item:"changelog entry added",passed:!1,message:"missing entry for this change"},{item:"reviewed by a teammate",passed:null}]})})})},l={render:()=>r.jsx("div",{className:"h-screen",children:r.jsx(a,{report:i({kind:"cmd",state:"failed",reason:"1 of 2 checks failed",feedback:`checking config...
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
}`,...(G=(O=f.parameters)==null?void 0:O.docs)==null?void 0:G.source}}};const Ue=["Passing","FailingWithCel","RunningWithProgress","ChecklistOnly","CmdFeedback","ErroredWithNoTests","TypedStepWithWait","Empty"];export{c as ChecklistOnly,l as CmdFeedback,f as Empty,u as ErroredWithNoTests,p as FailingWithCel,d as Passing,m as RunningWithProgress,o as TypedStepWithWait,Ue as __namedExportsOrder,Qe as default};

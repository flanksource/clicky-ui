import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./VerificationResults-CNyOYMMh.js";function i(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function a(e){return e.failed?`failed`:e.timed_out?`timedout`:e.warned?`warned`:e.skipped?`skipped`:e.running?`running`:e.pending?`pending`:e.passed?`passed`:null}function o(e,t){e.total+=t.total,e.passed+=t.passed,e.failed+=t.failed,e.warned+=t.warned,e.skipped+=t.skipped,e.pending+=t.pending,e.running+=t.running,e.timedout+=t.timedout}function s(e){let t=i(),n=e=>{for(let r of e){if(r.summary){o(t,r.summary);continue}if(r.children&&r.children.length>0){n(r.children);continue}let e=a(r);e!==null&&(t[e]+=1,t.total+=1)}};return n(e),t}function c(e){let t=e.state??`passed`,n=e.tests??[];return{kind:`fixture`,ran:!0,passed:t===`passed`,summary:s(n),state:t,...e}}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{n(),l=t(),u={title:`Data/Verification`,component:r,parameters:{layout:`fullscreen`,docs:{description:{component:`Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing.`}}}},d={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({tests:[{name:`lint the repo`,framework:`fixture`,passed:!0,duration:82e7},{name:`run unit tests`,framework:`fixture`,passed:!0,duration:41e8}],checklist:[{item:`docs updated`,passed:!0}]})})})},f={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({passed:!1,state:`failed`,reason:`1 of 2 checks failed`,tests:[{name:`lint the repo`,framework:`fixture`,passed:!0,duration:82e7},{name:`assert no regressions`,framework:`fixture`,failed:!0,duration:125e7,context:{cel_expression:`results.failed == 0`,cel_vars:{failed:2,suite:`todos`},expected:0,actual:2}}]})})})},p={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({passed:!1,state:`failed`,reason:`2 of 3 checks failed`,tests:[{name:`build`,framework:`exec`,passed:!0,duration:24e8},{name:`render us-f5472`,framework:`exec`,failed:!0,duration:93e8,message:`expected exit code 0, got 1`,stderr:`render failed: CALC_RATE target must be numeric
`,context:{command:`./xero-cli templates render us-f5472 --entity us`,cwd:`/src/xero-cli`,exit_code:1},detail:{step:{id:`us-f5472`,kind:`exec`},source:{file:`pkg/provider/demo/testdata/template-render.fixture.yaml`,line:123,end_line:126,language:`yaml`,text:`  - id: us-f5472
    kind: exec
    exec: ./xero-cli
    args: [templates, render, us-f5472, --entity, us]`}}},{name:`markdown broken`,framework:`exec`,failed:!0,duration:1e7,message:`expected exit code 0, got 3`,context:{command:`bash -c 'exit 3'`,exit_code:3},detail:{source:{file:`docs/checks.md`,line:6,end_line:11,language:`markdown`,text:"## command: markdown broken\n\n```bash\necho boom >&2\nexit 3\n```"}}}]})})})},m={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({state:`running`,tests:[{name:`compile the fixture`,framework:`fixture`,running:!0,progress:{phase:`build`,done:3,total:10}}]})})})},h={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({passed:!1,state:`failed`,checklist:[{item:`readme updated`,passed:!0},{item:`changelog entry added`,passed:!1,message:`missing entry for this change`},{item:`reviewed by a teammate`,passed:null}]})})})},g={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({kind:`cmd`,state:`failed`,reason:`1 of 2 checks failed`,feedback:`checking config...
FAIL: missing field 'name'`})})})},_={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({kind:`cmd`,state:`errored`,reason:`verifier crashed: exit status 1`})})})},v={render:()=>{let e={name:`plan reaches review`,framework:`todo_prompt`,passed:!0,duration:41e9,detail:{step:{id:`plan`,kind:`todo_prompt`},outputs:{plan:{content:`Add greet/greet.go with a Greeting helper`}},exports:{PLAN_ID:{value:`plan-3`,step:`plan`}},attempts:[{attempt:1,status:`failed`,error:`launch refused: admission queue full`,durationMs:2100},{attempt:2,status:`passed`,durationMs:38900}],wait:{policy:{until:`todo.status == 'review'`,failWhen:`todo.status in ['failed','ask']`,interval:`1s`,backoff:{factor:1.5,max:`10s`},jitter:`20%`,timeout:`3m`},outcome:`satisfied`,durationMs:3e3,outputs:{todo:{status:`review`}}}}},{attempts:t,...n}=e.detail,i=[{...e.detail.attempts[0],result:{name:e.name,framework:e.framework,failed:!0,message:`launch refused: admission queue full`,detail:{step:n.step,outputs:{launch:{failed:!0}}}}},{...e.detail.attempts[1],result:{...e,detail:n}}],a={...e,detail:{...n,attempts:i}};return(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({tests:[a]}),selected:a,onSelect:()=>{}})})}},y={file:`pr/ui/testdata/todo-lifecycle/codex.fixture.yaml`,section_path:`todo lifecycle (codex cli, aimock)`,kind:`step`,row_index:8},b={render:()=>{let e={name:`watch`,framework:`fixture`,passed:!0,detail:{name:`watch`,kind:`command`,state:`passed`,origin:y,started_at:`2026-10-18T09:00:04Z`,finished_at:`2026-10-18T09:00:08Z`,duration:4583837958}};return(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({tests:[e]}),selected:e,onSelect:()=>{}})})}},x={render:()=>{let e=`run.state in ['failed', 'cancelled']`,t=`aimock: no scenario rule matched this request
  model: gpt-5
  last message: triage this todo`,n={run:{state:`failed`,error:t},todo:{title:`greeting thing`}},i={name:`triaged`,framework:`fixture`,failed:!0,message:`${t}\n(wait failWhen ${e} is true)`,context:{cel_expression:e,cel_vars:{"run.state":`failed`}},detail:{step:{id:`triaged`,kind:`todo`},kind:`todo`,state:`failed`,origin:{...y,row_index:9},outputs:n,wait:{policy:{until:`run.state == 'completed' && todo.title != 'greeting thing'`,failWhen:e,interval:`1s`,backoff:{factor:1.5,max:`5s`},jitter:`20%`,timeout:`1m30s`},outcome:`failed`,durationMs:19,expression:e,cause:t,outputs:n}}};return(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:c({passed:!1,state:`failed`,tests:[i]}),selected:i,onSelect:()=>{}})})}},S={render:()=>(0,l.jsx)(`div`,{className:`h-screen`,children:(0,l.jsx)(r,{report:null})})},C=[`Passing`,`FailingWithCel`,`FailedStepWithSource`,`RunningWithProgress`,`ChecklistOnly`,`CmdFeedback`,`ErroredWithNoTests`,`TypedStepWithWait`,`ProgressOnlyFixtureStep`,`FailedWaitWithCause`,`Empty`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      passed: false,
      state: "failed",
      reason: "2 of 3 checks failed",
      tests: [{
        name: "build",
        framework: "exec",
        passed: true,
        duration: 2_400_000_000
      }, {
        name: "render us-f5472",
        framework: "exec",
        failed: true,
        duration: 9_300_000_000,
        message: "expected exit code 0, got 1",
        stderr: "render failed: CALC_RATE target must be numeric\\n",
        context: {
          command: "./xero-cli templates render us-f5472 --entity us",
          cwd: "/src/xero-cli",
          exit_code: 1
        },
        detail: {
          step: {
            id: "us-f5472",
            kind: "exec"
          },
          source: {
            file: "pkg/provider/demo/testdata/template-render.fixture.yaml",
            line: 123,
            end_line: 126,
            language: "yaml",
            text: ["  - id: us-f5472", "    kind: exec", "    exec: ./xero-cli", "    args: [templates, render, us-f5472, --entity, us]"].join("\\n")
          }
        }
      }, {
        name: "markdown broken",
        framework: "exec",
        failed: true,
        duration: 10_000_000,
        message: "expected exit code 0, got 3",
        context: {
          command: "bash -c 'exit 3'",
          exit_code: 3
        },
        detail: {
          source: {
            file: "docs/checks.md",
            line: 6,
            end_line: 11,
            language: "markdown",
            text: "## command: markdown broken\\n\\n\`\`\`bash\\necho boom >&2\\nexit 3\\n\`\`\`"
          }
        }
      }]
    })} />
    </div>
}`,...p.parameters?.docs?.source},description:{story:"A failed YAML step and a failed markdown block, each with the source lines gavel attaches as `detail.source`.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "failed",
      reason: "1 of 2 checks failed",
      feedback: "checking config...\\nFAIL: missing field 'name'"
    })} />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "errored",
      reason: "verifier crashed: exit status 1"
    })} />
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:"A typed `todo_prompt` step: a wait that polled three times, a retried launch, and its exports.",...v.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const watch = {
      name: "watch",
      framework: "fixture",
      passed: true,
      detail: {
        name: "watch",
        kind: "command",
        state: "passed",
        origin: FIXTURE_ORIGIN,
        started_at: "2026-10-18T09:00:04Z",
        finished_at: "2026-10-18T09:00:08Z",
        duration: 4_583_837_958
      }
    };
    return <div className="h-screen">
        <VerificationResults report={report({
        tests: [watch]
      })} selected={watch} onSelect={() => {}} />
      </div>;
  }
}`,...b.parameters?.docs?.source},description:{story:`A background step whose result has not reached the node yet: only the execution header is known.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const failWhen = "run.state in ['failed', 'cancelled']";
    const cause = "aimock: no scenario rule matched this request\\n  model: gpt-5\\n  last message: triage this todo";
    const outputs = {
      run: {
        state: "failed",
        error: cause
      },
      todo: {
        title: "greeting thing"
      }
    };
    const triaged = {
      name: "triaged",
      framework: "fixture",
      failed: true,
      message: \`\${cause}\\n(wait failWhen \${failWhen} is true)\`,
      context: {
        cel_expression: failWhen,
        cel_vars: {
          "run.state": "failed"
        }
      },
      detail: {
        step: {
          id: "triaged",
          kind: "todo"
        },
        kind: "todo",
        state: "failed",
        origin: {
          ...FIXTURE_ORIGIN,
          row_index: 9
        },
        outputs,
        wait: {
          policy: {
            until: "run.state == 'completed' && todo.title != 'greeting thing'",
            failWhen,
            interval: "1s",
            backoff: {
              factor: 1.5,
              max: "5s"
            },
            jitter: "20%",
            timeout: "1m30s"
          },
          outcome: "failed",
          durationMs: 19,
          expression: failWhen,
          cause,
          outputs
        }
      }
    };
    return <div className="h-screen">
        <VerificationResults report={report({
        passed: false,
        state: "failed",
        tests: [triaged]
      })} selected={triaged} onSelect={() => {}} />
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:`A wait that ended on its failWhen condition: the cause leads, the deciding condition carries the outcome.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={null} />
    </div>
}`,...S.parameters?.docs?.source}}}})))()}w();export{h as ChecklistOnly,g as CmdFeedback,S as Empty,_ as ErroredWithNoTests,p as FailedStepWithSource,x as FailedWaitWithCause,f as FailingWithCel,d as Passing,b as ProgressOnlyFixtureStep,m as RunningWithProgress,v as TypedStepWithWait,C as __namedExportsOrder,u as default};
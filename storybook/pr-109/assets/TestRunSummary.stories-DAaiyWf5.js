import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestRunSummary-G-OZ0ZWw.js";import{n as r,r as i,t as a}from"./TestRunner.fixtures-B4smJbCB.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),r(),o={title:`Data/TestRunner/TestRunSummary`,component:n,tags:[`autodocs`],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:`boolean`},tests:{control:!1}},args:{tests:a,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:`initial`}}},s={},c={args:{tests:i,done:!1,endTime:null,now:12e3}},l={args:{compact:!0}},u={args:{runMeta:{sequence:1,kind:`initial`,timed_out:!0,exit_code:124}}},d={args:{tests:[{name:`a`,passed:!0},{name:`b`,failed:!0},{name:`after-failure-1`,aborted:!0,skipped:!0},{name:`after-failure-2`,aborted:!0,skipped:!0},{name:`intentional`,skipped:!0}],runMeta:{sequence:1,kind:`initial`,exit_code:1}}},f=[`Completed`,`Running`,`Compact`,`TimedOutRun`,`WithAborted`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    runMeta: {
      sequence: 1,
      kind: "initial",
      timed_out: true,
      exit_code: 124
    }
  }
}`,...u.parameters?.docs?.source},description:{story:`The run hit its timeout: the Timed out chip and the process exit code join the counts.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tests: [{
      name: "a",
      passed: true
    }, {
      name: "b",
      failed: true
    }, {
      name: "after-failure-1",
      aborted: true,
      skipped: true
    }, {
      name: "after-failure-2",
      aborted: true,
      skipped: true
    }, {
      name: "intentional",
      skipped: true
    }],
    runMeta: {
      sequence: 1,
      kind: "initial",
      exit_code: 1
    }
  }
}`,...d.parameters?.docs?.source},description:{story:`Tests that never ran because the run stopped after a failure count as aborted, apart from skipped.`,...d.parameters?.docs?.description}}}})))()}p();export{l as Compact,s as Completed,c as Running,u as TimedOutRun,d as WithAborted,f as __namedExportsOrder,o as default};
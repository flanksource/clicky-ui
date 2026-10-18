import{T as S}from"./TestRunSummary-BPVEfphF.js";import{r as q,c as M}from"./TestRunner.fixtures-Y_HfJs8H.js";import"./iframe-CKgGkAV6.js";import"./preload-helper-D6IOlyYr.js";import"./Icon-zT9BHEU_.js";import"./utils-DW-IJACk.js";import"./ProgressBar-D6hFZtig.js";import"./MarkIcons-BgUpvb7B.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./loading-CVVM6inm.js";const z={title:"Data/TestRunner/TestRunSummary",component:S,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:M,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},r={},a={args:{tests:q,done:!1,endTime:null,now:12e3}},n={args:{compact:!0}},e={args:{runMeta:{sequence:1,kind:"initial",timed_out:!0,exit_code:124}}},t={args:{tests:[{name:"a",passed:!0},{name:"b",failed:!0},{name:"after-failure-1",aborted:!0,skipped:!0},{name:"after-failure-2",aborted:!0,skipped:!0},{name:"intentional",skipped:!0}],runMeta:{sequence:1,kind:"initial",exit_code:1}}};var s,o,i;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(i=(o=r.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};var c,d,m;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000
  }
}`,...(m=(d=a.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,u,l;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...(l=(u=n.parameters)==null?void 0:u.docs)==null?void 0:l.source}}};var g,f,T,h,k;e.parameters={...e.parameters,docs:{...(g=e.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    runMeta: {
      sequence: 1,
      kind: "initial",
      timed_out: true,
      exit_code: 124
    }
  }
}`,...(T=(f=e.parameters)==null?void 0:f.docs)==null?void 0:T.source},description:{story:"The run hit its timeout: the Timed out chip and the process exit code join the counts.",...(k=(h=e.parameters)==null?void 0:h.docs)==null?void 0:k.description}}};var b,_,x,y,R;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(x=(_=t.parameters)==null?void 0:_.docs)==null?void 0:x.source},description:{story:"Tests that never ran because the run stopped after a failure count as aborted, apart from skipped.",...(R=(y=t.parameters)==null?void 0:y.docs)==null?void 0:R.description}}};const B=["Completed","Running","Compact","TimedOutRun","WithAborted"];export{n as Compact,r as Completed,a as Running,e as TimedOutRun,t as WithAborted,B as __namedExportsOrder,z as default};

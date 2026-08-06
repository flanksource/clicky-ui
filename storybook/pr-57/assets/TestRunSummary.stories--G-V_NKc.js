import{T as u}from"./TestRunSummary-Bd21jSR2.js";import{r as l,c as g}from"./TestRunner.fixtures-CX0kqUUy.js";import"./iframe-CE7GD-h8.js";import"./preload-helper-DOqJbnTS.js";import"./Icon-BYgNnDJy.js";import"./utils-CR52uffu.js";import"./ProgressBar-BlVfbUDL.js";import"./status-0S1LqsJ5.js";import"./button-Dfg9Rs1O.js";import"./index-0zBpNI7D.js";import"./loading-15Hwt9WZ.js";const x={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},s={args:{tests:l,done:!1,endTime:null,now:12e3}},r={args:{compact:!0}};var t,o,a;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,c;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000
  }
}`,...(c=(m=s.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var i,p,d;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...(d=(p=r.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const j=["Completed","Running","Compact"];export{r as Compact,e as Completed,s as Running,j as __namedExportsOrder,x as default};

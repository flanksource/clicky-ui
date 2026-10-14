import{T as u}from"./TestRunSummary-CWIVg5LM.js";import{r as l,c as g}from"./TestRunner.fixtures-BwE_EpBK.js";import"./iframe-4S_rqkhx.js";import"./preload-helper-BZq7nIkI.js";import"./Icon-D5QCb7Dz.js";import"./utils-DW-IJACk.js";import"./ProgressBar-Csyk5skT.js";import"./status-kHMr9duR.js";import"./MarkIcons-BMCfNfK0.js";import"./button-BpUyE0O_.js";import"./index-CPURVhFy.js";import"./loading-1HgYxxJ4.js";const j={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},s={args:{compact:!0}};var t,o,a;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,c;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000
  }
}`,...(c=(m=r.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var i,p,d;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...(d=(p=s.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const q=["Completed","Running","Compact"];export{s as Compact,e as Completed,r as Running,q as __namedExportsOrder,j as default};

import{T as u}from"./TestRunSummary-Bl7n23Ul.js";import{r as l,c as g}from"./TestRunner.fixtures-YRxm_lFU.js";import"./iframe-D5a9zzxb.js";import"./preload-helper-D5l2DbWZ.js";import"./Icon-BWpUElqS.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-DIFztrLx.js";import"./status-KucRP3uz.js";import"./UiHourglass-BC3qC8H3.js";import"./UiLoader-DTI26w08.js";import"./UiPause-Br_Dz0k4.js";import"./UiError-B9gFtd75.js";import"./UiWarningTriangle-B5rkGHIL.js";import"./UiPass-BSw2wd7R.js";import"./UiClass-DbBIXnLF.js";import"./UiClock-D9LoG9Lv.js";import"./UiCheck-DiisalZF.js";import"./button-Bu96Zmyu.js";import"./index-1evVQkiP.js";import"./loading-C4NUXH3t.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000
  }
}`,...(i=(m=r.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var p,c,d;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...(d=(c=t.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};const z=["Completed","Running","Compact"];export{t as Compact,e as Completed,r as Running,z as __namedExportsOrder,P as default};

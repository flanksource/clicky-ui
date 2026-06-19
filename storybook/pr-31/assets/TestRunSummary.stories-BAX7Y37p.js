import{T as u}from"./TestRunSummary-BiL7IJSi.js";import{r as l,c as g}from"./TestRunner.fixtures-CSl8Ig01.js";import"./iframe-CCq80owj.js";import"./preload-helper-ByUaG9M2.js";import"./Icon-Cl3hQAjl.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-Bo6aJk-0.js";import"./status-BAjEmoTT.js";import"./UiHourglass-CHGc-cD1.js";import"./UiLoader-DtJEuJLW.js";import"./UiPause-lsWxfh-x.js";import"./UiError-BXHLO891.js";import"./UiWarningTriangle-ClxG8N1P.js";import"./UiPass-D_lSA7eg.js";import"./UiClass-DJ4FTuzF.js";import"./UiClock-DzIGMt3w.js";import"./UiCheck-CzE9SQC0.js";import"./button-CRz4am1-.js";import"./index-1evVQkiP.js";import"./loading-NPQ1cFHI.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

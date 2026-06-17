import{T as u}from"./TestRunSummary-TZXGnVOp.js";import{r as l,c as g}from"./TestRunner.fixtures-C5yWAX4s.js";import"./iframe-DLWo_D3a.js";import"./preload-helper-D5l2DbWZ.js";import"./Icon-DgfT7ULk.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-DkYU4832.js";import"./status-C_xlDL8I.js";import"./UiHourglass-BD37SWSe.js";import"./UiLoader-W4FvX2VX.js";import"./UiPause-DV1ttbhz.js";import"./UiError-CppIQx9b.js";import"./UiWarningTriangle-4ijMoeWg.js";import"./UiPass-Bjg-l-Mw.js";import"./UiClass-BaVAmuEM.js";import"./UiClock-CF_AVV7E.js";import"./UiCheck-BqyrKFDU.js";import"./button-lAmiuTiA.js";import"./index-1evVQkiP.js";import"./loading-Cddz8UD2.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

import{T as u}from"./TestRunSummary-Ca413xOG.js";import{r as l,c as g}from"./TestRunner.fixtures-BqjNtMtF.js";import"./iframe-DIPFVygJ.js";import"./preload-helper-D5l2DbWZ.js";import"./Icon-GGxX1w_8.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-Bfi5VK0H.js";import"./status-1OZvGNPQ.js";import"./UiHourglass-Cyl6xO_p.js";import"./UiLoader-BBAGhnDf.js";import"./UiPause-CEBuuSCN.js";import"./UiError-Cim_tLAs.js";import"./UiWarningTriangle-sNsx3fMD.js";import"./UiPass-RIB3ir6e.js";import"./UiClass-DT149lbJ.js";import"./UiClock-Bc7eRqM8.js";import"./UiCheck-b4szA2d9.js";import"./button-CQO1VsE8.js";import"./index-1evVQkiP.js";import"./loading-CYQBqqDz.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

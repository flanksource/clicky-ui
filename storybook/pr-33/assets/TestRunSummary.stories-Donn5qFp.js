import{T as u}from"./TestRunSummary-CzUJo6FT.js";import{r as l,c as g}from"./TestRunner.fixtures-Bm-QRwLy.js";import"./iframe-BiJjU2HO.js";import"./preload-helper-2oGg8WnX.js";import"./Icon-DO6qyvlM.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-BbgfXood.js";import"./status-DcGFecwF.js";import"./UiHourglass-BvthGUL1.js";import"./UiLoader-Be2ZgHt0.js";import"./UiPause-D9qloiqZ.js";import"./UiError-Beql1L6O.js";import"./UiWarningTriangle-DBel86GK.js";import"./UiPass-C1hRYq5i.js";import"./UiClass-jCy79o5O.js";import"./UiClock-D7qs6oNM.js";import"./UiCheck-r0P984Kc.js";import"./button-Bq6OtZ5-.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

import{T as u}from"./TestRunSummary-oKliWtN5.js";import{r as l,c as g}from"./TestRunner.fixtures-D9tO1JfI.js";import"./iframe-BUI_RHnX.js";import"./preload-helper-DweeuSg3.js";import"./Icon-B3tLlLKZ.js";import"./utils-CR52uffu.js";import"./ProgressBar-DBS_xWVi.js";import"./status-Bz8wYQxp.js";import"./UiHourglass-BLOEdZvs.js";import"./UiLoader-DsaqE2Tz.js";import"./UiPause-CcAe8rm8.js";import"./UiError-DPWyEpQu.js";import"./UiWarningTriangle-CBm1hHQL.js";import"./UiPass-0uSR2hyx.js";import"./UiClass-DlZ4KVqm.js";import"./UiClock-ByVqQxkd.js";import"./UiCheck-DhYKpnrE.js";import"./button-COWLJ6pg.js";import"./index-0zBpNI7D.js";import"./loading-Do60Rp8m.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

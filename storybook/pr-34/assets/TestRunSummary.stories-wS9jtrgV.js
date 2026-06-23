import{T as u}from"./TestRunSummary-fAv3SRo3.js";import{r as l,c as g}from"./TestRunner.fixtures-B467H9xk.js";import"./iframe-B-R1GM9F.js";import"./preload-helper-B4w--iqy.js";import"./Icon-GOgSuK4c.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-BDeMQcjU.js";import"./status-C_d54gg-.js";import"./UiHourglass-DqmQ6Eq7.js";import"./UiLoader-Bl1AsuH7.js";import"./UiPause-MWYnZd-F.js";import"./UiError-CaOzkxg2.js";import"./UiWarningTriangle-BdSlqxJs.js";import"./UiPass-CsJsJTBa.js";import"./UiClass-VPDk_cPh.js";import"./UiClock-CyrGdT6i.js";import"./UiCheck-BThsfaV8.js";import"./button-BuoaacKd.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

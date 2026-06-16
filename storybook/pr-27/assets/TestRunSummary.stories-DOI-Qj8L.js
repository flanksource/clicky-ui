import{T as u}from"./TestRunSummary-C3zzA7Cj.js";import{r as l,c as g}from"./TestRunner.fixtures-DdIXpys4.js";import"./iframe-C5-Xigqm.js";import"./preload-helper-BZuLNX-z.js";import"./Icon-B_F1F--U.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-BVFDFULd.js";import"./status-KRt7oaIV.js";import"./UiHourglass-OVxXJvhT.js";import"./UiLoader-CYzor5L0.js";import"./UiPause-cHCkMDld.js";import"./UiError-DS1ssSvn.js";import"./UiWarningTriangle-D1KFhbI5.js";import"./UiPass-C0h_Hj9M.js";import"./UiClass-BYB9PTC-.js";import"./UiClock-DJwtIyMI.js";import"./UiCheck-DqxKPHJi.js";import"./button-E1Q476uu.js";import"./index-1evVQkiP.js";import"./loading-DE8-iriR.js";const P={title:"Data/TestRunner/TestRunSummary",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers."}}},argTypes:{compact:{control:"boolean"},tests:{control:!1}},args:{tests:g,done:!0,startTime:0,endTime:31278,runMeta:{sequence:1,kind:"initial"}}},e={},r={args:{tests:l,done:!1,endTime:null,now:12e3}},t={args:{compact:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
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

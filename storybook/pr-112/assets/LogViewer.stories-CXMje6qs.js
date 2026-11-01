import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./LogViewer-C_hiP9Pz.js";var r,i,a,o,s;function c(){return(c=e((()=>{t(),r={title:`Data/LogViewer`,component:n,args:{logs:`INFO service ready\\nWARN retry queue above threshold\\nINFO recovered`,collapsedLines:2,maxExpandedVh:70},parameters:{docs:{description:{component:`Expandable plain-text log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap.`}}}},i=Array.from({length:40},(e,t)=>`[line ${t+1}] processing item...`).join(`
`),a={args:{logs:i}},o={args:{logs:`line 1
line 2
line 3`}},s=[`Default`,`Short`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    logs: sample
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    logs: "line 1\\nline 2\\nline 3"
  }
}`,...o.parameters?.docs?.source}}}})))()}c();export{a as Default,o as Short,s as __namedExportsOrder,r as default};
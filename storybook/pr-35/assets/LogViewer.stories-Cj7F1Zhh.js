import{L as p}from"./LogViewer-Dm6Eznm8.js";import"./iframe-BbITQAD0.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";const f={title:"Data/LogViewer",component:p,args:{logs:"INFO service ready\\nWARN retry queue above threshold\\nINFO recovered",collapsedLines:2,maxExpandedVh:70},parameters:{docs:{description:{component:"Expandable plain-text log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap."}}}},c=Array.from({length:40},(m,l)=>`[line ${l+1}] processing item...`).join(`
`),e={args:{logs:c}},r={args:{logs:`line 1
line 2
line 3`}};var a,o,s;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    logs: sample
  }
}`,...(s=(o=e.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var n,t,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    logs: "line 1\\nline 2\\nline 3"
  }
}`,...(i=(t=r.parameters)==null?void 0:t.docs)==null?void 0:i.source}}};const x=["Default","Short"];export{e as Default,r as Short,x as __namedExportsOrder,f as default};

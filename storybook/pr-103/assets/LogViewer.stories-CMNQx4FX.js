import{L as p}from"./LogViewer-C7quY9zq.js";import"./iframe-DNj_zNZU.js";import"./preload-helper-LCYGeQwd.js";import"./utils-DW-IJACk.js";import"./AnsiHtml-Dt_CWBoi.js";const x={title:"Data/LogViewer",component:p,args:{logs:"INFO service ready\\nWARN retry queue above threshold\\nINFO recovered",collapsedLines:2,maxExpandedVh:70},parameters:{docs:{description:{component:"Expandable plain-text log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap."}}}},c=Array.from({length:40},(m,l)=>`[line ${l+1}] processing item...`).join(`
`),e={args:{logs:c}},r={args:{logs:`line 1
line 2
line 3`}};var o,a,s;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    logs: sample
  }
}`,...(s=(a=e.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};var n,t,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    logs: "line 1\\nline 2\\nline 3"
  }
}`,...(i=(t=r.parameters)==null?void 0:t.docs)==null?void 0:i.source}}};const b=["Default","Short"];export{e as Default,r as Short,b as __namedExportsOrder,x as default};

import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./fixtures-BJPJr0mu.js";import{n as a,t as o}from"./OtelTraceTable-pe01U1AP.js";function s(){let[e,t]=(0,c.useState)(),[n,r]=(0,c.useState)();return(0,l.jsx)(o,{...u.args,...e?{selectedTraceId:e}:{},...n?{selectedSpanId:n}:{},onSelectTrace:t,onSelectSpan:r})}var c,l,u,d,f,p;function m(){return(m=e((()=>{c=t(),a(),i(),l=n(),u={title:`Data/Traces/OpenTelemetry rows`,component:o,parameters:{layout:`fullscreen`},args:{spans:r.spans,traceHref:e=>`?trace=${e}`,onSelectTrace:()=>void 0,onSelectSpan:()=>void 0}},d={render:()=>(0,l.jsx)(s,{})},f={args:{spans:[],externalSearch:{value:``,onChange:()=>void 0,placeholder:`Search spans`}}},p=[`Default`,`Empty`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Interactive />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    spans: [],
    externalSearch: {
      value: "",
      onChange: () => undefined,
      placeholder: "Search spans"
    }
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{d as Default,f as Empty,p as __namedExportsOrder,u as default};
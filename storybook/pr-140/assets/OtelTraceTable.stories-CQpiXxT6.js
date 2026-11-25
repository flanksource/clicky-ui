import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{r,t as i}from"./fixtures-DWzexeTs.js";import{n as a,t as o}from"./OtelTraceTable-D7_eLpB1.js";function s(){let[e,t]=(0,l.useState)(),[n,r]=(0,l.useState)();return(0,u.jsx)(o,{...d.args,...e?{selectedTraceId:e}:{},...n?{selectedSpanId:n}:{},onSelectTrace:t,onSelectSpan:r})}function c(){let[e,t]=(0,l.useState)(3),[n,i]=(0,l.useState)(`>=10ms`),a=r.spans.slice(0,e),s=n?new Set(a.filter(e=>e.durationMs>=10).map(e=>e.spanId)):void 0;return(0,u.jsx)(o,{...d.args,selectedTraceId:r.summary.traceId,externalFilters:[{key:`filter.duration_ms`,kind:`text`,label:`Span duration`,value:n,onChange:i}],openTrace:{spans:a,total:r.spans.length,loading:!1,...e<r.spans.length?{onLoadMore:()=>t(r.spans.length)}:{},...s?{matchingSpanIds:s}:{}}})}var l,u,d,f,p,m,h;function g(){return(g=e((()=>{l=t(),a(),i(),u=n(),d={title:`Data/Traces/OpenTelemetry rows`,component:o,parameters:{layout:`fullscreen`},args:{spans:r.spans,traceHref:e=>`?trace=${e}`,onSelectTrace:()=>void 0,onSelectSpan:()=>void 0}},f={render:()=>(0,u.jsx)(s,{})},p={args:{spans:[],externalSearch:{value:``,onChange:()=>void 0,placeholder:`Search spans`}}},m={render:()=>(0,u.jsx)(c,{})},h=[`Default`,`Empty`,`OpenTracePagedAndFiltered`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Interactive />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    spans: [],
    externalSearch: {
      value: "",
      onChange: () => undefined,
      placeholder: "Search spans"
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <OpenTrace />
}`,...m.parameters?.docs?.source},description:{story:`The open trace is fetched apart from the listing, paged, and the listing filters pick spans inside it.`,...m.parameters?.docs?.description}}}})))()}g();export{f as Default,p as Empty,m as OpenTracePagedAndFiltered,h as __namedExportsOrder,d as default};
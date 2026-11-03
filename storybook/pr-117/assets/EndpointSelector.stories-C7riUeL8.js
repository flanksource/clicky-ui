import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./EndpointSelector-Cx1s_4Sy.js";function a({initial:e,...t}){let[n,r]=(0,o.useState)(e);return(0,s.jsxs)(`div`,{className:`w-full max-w-3xl space-y-density-3`,children:[(0,s.jsx)(i,{value:n,onChange:r,...t}),(0,s.jsx)(`pre`,{className:`overflow-auto rounded-md border border-border bg-muted/30 p-density-3 text-xs`,children:JSON.stringify(n,null,2)})]})}var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{o=t(),r(),s=n(),c={service:[{name:`opensearch`,ports:[{name:`http`,number:9200},{name:`metrics`,number:9600}]},{name:`postgres`,ports:[{name:`postgres`,number:5432}]}],ingress:[{name:`opensearch`,hosts:[`search.example.com`]}],deployment:[{name:`opensearch`}],statefulset:[]},l={secret:[{name:`search`,keys:[`url`]}],configmap:[{name:`endpoints`,keys:[`search`]}],helm:[]},u=async e=>Object.fromEntries(e.map(e=>[e,c[e]])),d=async e=>l[e],f=async()=>[],p={title:`Components/EndpointSelector`,component:i,parameters:{docs:{description:{component:`Selects how an endpoint is reached while keeping discovery consumer-owned. Consumers choose the enabled access modes, provide workload and reference loaders, and adapt the emitted typed value to their persisted format.`}}}},m={render:()=>(0,s.jsx)(a,{initial:{mode:`service`,target:{kind:`service`,name:`opensearch`,namespace:`platform`},port:`9200`},namespace:`platform`,modes:[`url`,`service`,`cluster-ip`,`api-proxy`,`ingress`,`port-forward`],loadWorkloads:u,urlSelector:{sources:[`secret`,`configmap`,`value`],loadResources:d,loadKeyPreview:f},showPath:!0,showScheme:!0,showIngressPort:!0,allowCustomPort:!0})},h={render:()=>(0,s.jsx)(a,{initial:{mode:`service`,target:{kind:`service`,name:`opensearch`,namespace:`platform`},scheme:`http`,port:`9200`,path:`/_cluster/health`},namespace:`platform`,modes:[`service`,`ingress`,`url`,`api-proxy`],loadWorkloads:u,urlSelector:{sources:[`secret`,`configmap`,`value`],loadResources:d,loadKeyPreview:f},defaults:{scheme:`http`,port:`9200`},schemes:[`http`,`https`],allowCustomScheme:!1,showPath:!0,showScheme:!0,showIngressPort:!0,allowCustomPort:!0})},g={parameters:{docs:{description:{story:`The workload, closed scheme choice, compact port, and path share one row at the width used by configuration dialogs.`}}},render:()=>(0,s.jsx)(`div`,{className:`w-[45rem] max-w-full`,children:(0,s.jsx)(a,{initial:{mode:`service`,target:{kind:`service`,name:`opensearch`,namespace:`platform`},scheme:`http`,port:`9200`,path:`/_cluster/health`},namespace:`platform`,modes:[`service`,`api-proxy`,`ingress`,`url`],loadWorkloads:u,urlSelector:{sources:[`secret`,`configmap`,`value`],loadResources:d,loadKeyPreview:f},schemes:[`http`,`https`],allowCustomScheme:!1,showPath:!0,showScheme:!0,showIngressPort:!0,allowCustomPort:!0})})},_={render:()=>(0,s.jsx)(a,{initial:{mode:`url`,source:{kind:`secret`,name:`search`,key:`url`}},modes:[`url`,`service`],loadWorkloads:u,urlSelector:{sources:[`secret`,`configmap`,`value`],loadResources:d,loadKeyPreview:f}})},v=[`AllAccessModes`,`OperatorModes`,`CompactServiceFields`,`ReferencedUrl`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    mode: "service",
    target: {
      kind: "service",
      name: "opensearch",
      namespace: "platform"
    },
    port: "9200"
  }} namespace="platform" modes={["url", "service", "cluster-ip", "api-proxy", "ingress", "port-forward"]} loadWorkloads={loadWorkloads} urlSelector={{
    sources: ["secret", "configmap", "value"],
    loadResources,
    loadKeyPreview
  }} showPath showScheme showIngressPort allowCustomPort />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    mode: "service",
    target: {
      kind: "service",
      name: "opensearch",
      namespace: "platform"
    },
    scheme: "http",
    port: "9200",
    path: "/_cluster/health"
  }} namespace="platform" modes={["service", "ingress", "url", "api-proxy"]} loadWorkloads={loadWorkloads} urlSelector={{
    sources: ["secret", "configmap", "value"],
    loadResources,
    loadKeyPreview
  }} defaults={{
    scheme: "http",
    port: "9200"
  }} schemes={["http", "https"]} allowCustomScheme={false} showPath showScheme showIngressPort allowCustomPort />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The workload, closed scheme choice, compact port, and path share one row at the width used by configuration dialogs."
      }
    }
  },
  render: () => <div className="w-[45rem] max-w-full">
      <Playground initial={{
      mode: "service",
      target: {
        kind: "service",
        name: "opensearch",
        namespace: "platform"
      },
      scheme: "http",
      port: "9200",
      path: "/_cluster/health"
    }} namespace="platform" modes={["service", "api-proxy", "ingress", "url"]} loadWorkloads={loadWorkloads} urlSelector={{
      sources: ["secret", "configmap", "value"],
      loadResources,
      loadKeyPreview
    }} schemes={["http", "https"]} allowCustomScheme={false} showPath showScheme showIngressPort allowCustomPort />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    mode: "url",
    source: {
      kind: "secret",
      name: "search",
      key: "url"
    }
  }} modes={["url", "service"]} loadWorkloads={loadWorkloads} urlSelector={{
    sources: ["secret", "configmap", "value"],
    loadResources,
    loadKeyPreview
  }} />
}`,..._.parameters?.docs?.source}}}})))()}y();export{m as AllAccessModes,g as CompactServiceFields,h as OperatorModes,_ as ReferencedUrl,v as __namedExportsOrder,p as default};
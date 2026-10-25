import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Properties-DSuAKSqH.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{a=t(),r(),o=n(),s={title:`Data/Properties`,component:i,args:{items:[{key:`namespace`,value:`production`},{key:`owner`,value:`platform`}],density:`comfortable`},parameters:{layout:`padded`,docs:{description:{component:`Two-column property list for dense metadata, raw payload fields, and detail panels. Rows support custom renderers, label icons, prefix/suffix actions, and expandable child content.`}}}},c=[{key:`namespace`,value:`claims-demo`},{key:`pod`,value:`policy-api-644b55c866-mg7tg`},{key:`container`,value:`policy-api`},{key:`logger`,value:`com.example.policy.filter.ServiceRequestFilter`},{key:`thread`,value:`http-nio-8080-exec-6`}],l={args:{items:c}},u={args:{items:[{key:`heap_bytes`,value:1048576,type:`bytes`},{key:`uptime`,value:9e4,type:`duration`,unit:`ms`},{key:`cpu`,value:.25,type:`number`,unit:`percentunit`},{key:`enabled`,value:!1,type:`boolean`},{key:`started_at`,value:17040672e5,type:`date`},{key:`usage`,value:{used:1024,pools:[`heap`,`non-heap`]}},{key:`config`,value:`{"enabled":true}`,type:`json`}]}},d={render:()=>(0,o.jsx)(i,{gridTemplateColumns:`fit-content(30ch) minmax(0, 1fr)`,items:[{key:`name`,value:`Example service`},{key:`connection`,value:`2 properties`,expandable:!0,expanded:!0,renderChildren:()=>(0,o.jsx)(i,{items:[{key:`host`,value:`localhost`},{key:`credentials`,value:`1 property`,expandable:!0,expanded:!0,renderChildren:()=>(0,o.jsx)(i,{items:[{key:`username`,value:`demo`}]})}]})}]})},f={args:{items:[{key:`namespace`,value:`claims-demo`,subtitle:`Kubernetes namespace`},{key:`pod`,value:`policy-api-644b55c866-mg7tg`,subtitle:`Source pod`},{key:`container`,value:`policy-api`,subtitle:`Container name within pod`},{key:`timestamp`,value:`2026-05-03T10:09:30.288Z`,subtitle:`ECS @timestamp`},{key:`logger`,value:`com.example.policy.filter.ServiceRequestFilter`,subtitle:`Java logger`}],labelIcon:e=>{switch(e){case`namespace`:return`k8s-namespace`;case`pod`:return`k8s-pod`;case`container`:return`server`;case`timestamp`:return`clock`;case`logger`:return`log`;default:return`info-circle`}}}},p={args:{items:c,suffixActions:[{id:`copy`,icon:`copy`,label:e=>`Copy ${e}`,onClick:(e,t)=>{console.log(`copy`,t)}},{id:`edit`,icon:`edit`,label:e=>`Edit ${e}`,onClick:(e,t)=>{console.log(`edit`,t)}}]}},m={render:()=>{let[e,t]=(0,a.useState)({tags:!0}),n=[{key:`namespace`,value:`claims-demo`},{key:`pod`,value:`policy-api-644b55c866-mg7tg`},{key:`tags`,value:[`env=prod`,`team=platform`,`tier=api`],expandable:!0,expanded:e.tags??!1,onToggle:e=>t(t=>({...t,tags:e})),renderChildren:()=>(0,o.jsx)(i,{density:`compact`,items:[`env=prod`,`team=platform`,`tier=api`].map((e,t)=>({key:`tags.${t}`,value:e}))})},{key:`attributes`,value:{"service.name":`policy-api`,"process.thread.name":`http-nio-8080-exec-6`},expandable:!0,expanded:e.attributes??!1,onToggle:e=>t(t=>({...t,attributes:e})),renderChildren:()=>(0,o.jsx)(i,{density:`compact`,items:Object.entries({"service.name":`policy-api`,"process.thread.name":`http-nio-8080-exec-6`}).map(([e,t])=>({key:`attributes.${e}`,value:t}))})}];return(0,o.jsx)(i,{density:`compact`,items:n,prefixActions:[{id:`expand`,icon:`expand-all`,label:e=>`Expand ${e}`,visible:(e,t,n)=>!!n.expandable,disabled:(e,t,n)=>!!n.expanded,onClick:(e,t,n)=>n.onToggle?.(!0)},{id:`collapse`,icon:`collapse-all`,label:e=>`Collapse ${e}`,visible:(e,t,n)=>!!n.expandable,disabled:(e,t,n)=>!n.expanded,onClick:(e,t,n)=>n.onToggle?.(!1)}],suffixActions:[{id:`copy`,icon:`copy`,label:e=>`Copy ${e}`,onClick:()=>{}}]})}},h={render:()=>{let[e,t]=(0,a.useState)({}),n=[{key:`namespace`,value:`claims-demo`},{key:`pod`,value:`policy-api-644b55c866-mg7tg`,subtitle:`Source pod`},{key:`timestamp`,value:`2026-05-03T10:09:30.288Z`,subtitle:`ECS @timestamp`},{key:`thread`,value:`http-nio-8080-exec-6`},{key:`logger`,value:`com.example.policy.filter.ServiceRequestFilter`},{key:`code`,value:`GET /v1/policies?status=ACTIVE
Accept: application/json`,subtitle:`Sample request`},{key:`tags`,value:[`env=prod`,`team=platform`,`tier=api`,`region=eu-west-1`],expandable:!0,expanded:e.tags??!1,onToggle:e=>t(t=>({...t,tags:e})),renderChildren:()=>(0,o.jsx)(i,{density:`compact`,items:[`env=prod`,`team=platform`,`tier=api`,`region=eu-west-1`].map((e,t)=>({key:`tags.${t}`,value:e}))})},{key:`secret`,value:`ssh-rsa AAA...`,hidden:!0}];return(0,o.jsx)(i,{items:n,labelIcon:e=>{switch(e){case`namespace`:return`k8s-namespace`;case`pod`:return`k8s-pod`;case`container`:return`server`;case`timestamp`:return`clock`;case`thread`:return`tag`;case`logger`:return`log`;case`code`:return`code`;case`tags`:return`label`;default:return`info-circle`}},prefixActions:[{id:`expand`,icon:`expand-all`,label:e=>`Expand ${e}`,visible:(e,t,n)=>!!n.expandable,disabled:(e,t,n)=>!!n.expanded,onClick:(e,t,n)=>n.onToggle?.(!0)},{id:`collapse`,icon:`collapse-all`,label:e=>`Collapse ${e}`,visible:(e,t,n)=>!!n.expandable,disabled:(e,t,n)=>!n.expanded,onClick:(e,t,n)=>n.onToggle?.(!1)}],suffixActions:[{id:`copy`,icon:`copy`,label:e=>`Copy ${e}`,onClick:(e,t)=>{typeof navigator<`u`&&navigator.clipboard?.writeText&&navigator.clipboard.writeText(String(t))}},{id:`view`,icon:`eye`,label:e=>`View ${e}`,onClick:()=>{}}]})}},g={args:{density:`compact`,items:c}},_={args:{items:Array.from({length:50},(e,t)=>({key:`attribute_${t.toString().padStart(2,`0`)}`,value:`value-${t}`})),density:`compact`}},v=[`Default`,`TypedValues`,`NestedLabels`,`WithIconsAndSubtitles`,`WithActions`,`Expandable`,`KitchenSink`,`Compact`,`LongList`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    items: baseItems
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      key: "heap_bytes",
      value: 1048576,
      type: "bytes"
    }, {
      key: "uptime",
      value: 90000,
      type: "duration",
      unit: "ms"
    }, {
      key: "cpu",
      value: 0.25,
      type: "number",
      unit: "percentunit"
    }, {
      key: "enabled",
      value: false,
      type: "boolean"
    }, {
      key: "started_at",
      value: 1704067200000,
      type: "date"
    }, {
      key: "usage",
      value: {
        used: 1024,
        pools: ["heap", "non-heap"]
      }
    }, {
      key: "config",
      value: '{"enabled":true}',
      type: "json"
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Properties gridTemplateColumns="fit-content(30ch) minmax(0, 1fr)" items={[{
    key: "name",
    value: "Example service"
  }, {
    key: "connection",
    value: "2 properties",
    expandable: true,
    expanded: true,
    renderChildren: () => <Properties items={[{
      key: "host",
      value: "localhost"
    }, {
      key: "credentials",
      value: "1 property",
      expandable: true,
      expanded: true,
      renderChildren: () => <Properties items={[{
        key: "username",
        value: "demo"
      }]} />
    }]} />
  }]} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      key: "namespace",
      value: "claims-demo",
      subtitle: "Kubernetes namespace"
    }, {
      key: "pod",
      value: "policy-api-644b55c866-mg7tg",
      subtitle: "Source pod"
    }, {
      key: "container",
      value: "policy-api",
      subtitle: "Container name within pod"
    }, {
      key: "timestamp",
      value: "2026-05-03T10:09:30.288Z",
      subtitle: "ECS @timestamp"
    }, {
      key: "logger",
      value: "com.example.policy.filter.ServiceRequestFilter",
      subtitle: "Java logger"
    }],
    labelIcon: key => {
      switch (key) {
        case "namespace":
          return "k8s-namespace";
        case "pod":
          return "k8s-pod";
        case "container":
          return "server";
        case "timestamp":
          return "clock";
        case "logger":
          return "log";
        default:
          return "info-circle";
      }
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    items: baseItems,
    suffixActions: [{
      id: "copy",
      icon: "copy",
      label: key => \`Copy \${key}\`,
      onClick: (_key, value) => {
        // eslint-disable-next-line no-console
        console.log("copy", value);
      }
    }, {
      id: "edit",
      icon: "edit",
      label: key => \`Edit \${key}\`,
      onClick: (_key, value) => {
        // eslint-disable-next-line no-console
        console.log("edit", value);
      }
    }]
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState<Record<string, boolean>>({
      tags: true
    });
    const items: PropertiesItem<unknown>[] = [{
      key: "namespace",
      value: "claims-demo"
    }, {
      key: "pod",
      value: "policy-api-644b55c866-mg7tg"
    }, {
      key: "tags",
      value: ["env=prod", "team=platform", "tier=api"],
      expandable: true,
      expanded: open.tags ?? false,
      onToggle: next => setOpen(s => ({
        ...s,
        tags: next
      })),
      renderChildren: () => <Properties density="compact" items={["env=prod", "team=platform", "tier=api"].map((t, i) => ({
        key: \`tags.\${i}\`,
        value: t
      }))} />
    }, {
      key: "attributes",
      value: {
        "service.name": "policy-api",
        "process.thread.name": "http-nio-8080-exec-6"
      },
      expandable: true,
      expanded: open.attributes ?? false,
      onToggle: next => setOpen(s => ({
        ...s,
        attributes: next
      })),
      renderChildren: () => <Properties density="compact" items={Object.entries({
        "service.name": "policy-api",
        "process.thread.name": "http-nio-8080-exec-6"
      }).map(([k, v]) => ({
        key: \`attributes.\${k}\`,
        value: v
      }))} />
    }];
    return <Properties density="compact" items={items} prefixActions={[{
      id: "expand",
      icon: "expand-all",
      label: key => \`Expand \${key}\`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !!item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(true)
    }, {
      id: "collapse",
      icon: "collapse-all",
      label: key => \`Collapse \${key}\`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(false)
    }]} suffixActions={[{
      id: "copy",
      icon: "copy",
      label: key => \`Copy \${key}\`,
      onClick: () => {}
    }]} />;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const items: PropertiesItem<unknown>[] = [{
      key: "namespace",
      value: "claims-demo"
    }, {
      key: "pod",
      value: "policy-api-644b55c866-mg7tg",
      subtitle: "Source pod"
    }, {
      key: "timestamp",
      value: "2026-05-03T10:09:30.288Z",
      subtitle: "ECS @timestamp"
    }, {
      key: "thread",
      value: "http-nio-8080-exec-6"
    }, {
      key: "logger",
      value: "com.example.policy.filter.ServiceRequestFilter"
    }, {
      key: "code",
      value: "GET /v1/policies?status=ACTIVE\\nAccept: application/json",
      subtitle: "Sample request"
    }, {
      key: "tags",
      value: ["env=prod", "team=platform", "tier=api", "region=eu-west-1"],
      expandable: true,
      expanded: open.tags ?? false,
      onToggle: next => setOpen(s => ({
        ...s,
        tags: next
      })),
      renderChildren: () => <Properties density="compact" items={["env=prod", "team=platform", "tier=api", "region=eu-west-1"].map((t, i) => ({
        key: \`tags.\${i}\`,
        value: t
      }))} />
    }, {
      key: "secret",
      value: "ssh-rsa AAA...",
      hidden: true
    }];
    return <Properties items={items} labelIcon={key => {
      switch (key) {
        case "namespace":
          return "k8s-namespace";
        case "pod":
          return "k8s-pod";
        case "container":
          return "server";
        case "timestamp":
          return "clock";
        case "thread":
          return "tag";
        case "logger":
          return "log";
        case "code":
          return "code";
        case "tags":
          return "label";
        default:
          return "info-circle";
      }
    }} prefixActions={[{
      id: "expand",
      icon: "expand-all",
      label: key => \`Expand \${key}\`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !!item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(true)
    }, {
      id: "collapse",
      icon: "collapse-all",
      label: key => \`Collapse \${key}\`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(false)
    }]} suffixActions={[{
      id: "copy",
      icon: "copy",
      label: key => \`Copy \${key}\`,
      onClick: (_k, value) => {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText(String(value));
        }
      }
    }, {
      id: "view",
      icon: "eye",
      label: key => \`View \${key}\`,
      onClick: () => {}
    }]} />;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    density: "compact",
    items: baseItems
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    items: Array.from({
      length: 50
    }, (_, i) => ({
      key: \`attribute_\${i.toString().padStart(2, "0")}\`,
      value: \`value-\${i}\`
    })),
    density: "compact"
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{g as Compact,l as Default,m as Expandable,h as KitchenSink,_ as LongList,d as NestedLabels,u as TypedValues,p as WithActions,f as WithIconsAndSubtitles,v as __namedExportsOrder,s as default};
import{r as L,j as r}from"./iframe-CCq80owj.js";import{P as i}from"./Properties-CGMOc39t.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";import"./Icon-Cl3hQAjl.js";const J={title:"Data/Properties",component:i,args:{items:[{key:"namespace",value:"production"},{key:"owner",value:"platform"}],density:"comfortable"},parameters:{layout:"padded",docs:{description:{component:"Two-column property list for dense metadata, raw payload fields, and detail panels. Rows support custom renderers, label icons, prefix/suffix actions, and expandable child content."}}}},g=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"container",value:"policy-api"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"thread",value:"http-nio-8080-exec-6"}],l={args:{items:g}},c={args:{items:[{key:"namespace",value:"claims-demo",subtitle:"Kubernetes namespace"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"container",value:"policy-api",subtitle:"Container name within pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter",subtitle:"Java logger"}],labelIcon:t=>{switch(t){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"logger":return"log";default:return"info-circle"}}}},p={args:{items:g,suffixActions:[{id:"copy",icon:"copy",label:t=>`Copy ${t}`,onClick:(t,s)=>{console.log("copy",s)}},{id:"edit",icon:"edit",label:t=>`Edit ${t}`,onClick:(t,s)=>{console.log("edit",s)}}]}},d={render:()=>{const[t,s]=L.useState({tags:!0}),y=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"tags",value:["env=prod","team=platform","tier=api"],expandable:!0,expanded:t.tags??!1,onToggle:e=>s(a=>({...a,tags:e})),renderChildren:()=>r.jsx(i,{density:"compact",items:["env=prod","team=platform","tier=api"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"attributes",value:{"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"},expandable:!0,expanded:t.attributes??!1,onToggle:e=>s(a=>({...a,attributes:e})),renderChildren:()=>r.jsx(i,{density:"compact",items:Object.entries({"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"}).map(([e,a])=>({key:`attributes.${e}`,value:a}))})}];return r.jsx(i,{density:"compact",items:y,prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var o;return(o=n.onToggle)==null?void 0:o.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var o;return(o=n.onToggle)==null?void 0:o.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:()=>{}}]})}},m={render:()=>{const[t,s]=L.useState({}),y=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"thread",value:"http-nio-8080-exec-6"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"code",value:`GET /v1/policies?status=ACTIVE
Accept: application/json`,subtitle:"Sample request"},{key:"tags",value:["env=prod","team=platform","tier=api","region=eu-west-1"],expandable:!0,expanded:t.tags??!1,onToggle:e=>s(a=>({...a,tags:e})),renderChildren:()=>r.jsx(i,{density:"compact",items:["env=prod","team=platform","tier=api","region=eu-west-1"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"secret",value:"ssh-rsa AAA...",hidden:!0}];return r.jsx(i,{items:y,labelIcon:e=>{switch(e){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"thread":return"tag";case"logger":return"log";case"code":return"code";case"tags":return"label";default:return"info-circle"}},prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var o;return(o=n.onToggle)==null?void 0:o.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var o;return(o=n.onToggle)==null?void 0:o.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:(e,a)=>{var n;typeof navigator<"u"&&((n=navigator.clipboard)!=null&&n.writeText)&&navigator.clipboard.writeText(String(a))}},{id:"view",icon:"eye",label:e=>`View ${e}`,onClick:()=>{}}]})}},u={args:{density:"compact",items:g}},k={args:{items:Array.from({length:50},(t,s)=>({key:`attribute_${s.toString().padStart(2,"0")}`,value:`value-${s}`})),density:"compact"}};var v,b,x;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    items: baseItems
  }
}`,...(x=(b=l.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var f,_,C;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(C=(_=c.parameters)==null?void 0:_.docs)==null?void 0:C.source}}};var h,S,$;p.parameters={...p.parameters,docs:{...(h=p.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...($=(S=p.parameters)==null?void 0:S.docs)==null?void 0:$.source}}};var T,A,w;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(w=(A=d.parameters)==null?void 0:A.docs)==null?void 0:w.source}}};var E,I,j;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(j=(I=m.parameters)==null?void 0:I.docs)==null?void 0:j.source}}};var O,P,R;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    density: "compact",
    items: baseItems
  }
}`,...(R=(P=u.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var q,F,K;k.parameters={...k.parameters,docs:{...(q=k.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    items: Array.from({
      length: 50
    }, (_, i) => ({
      key: \`attribute_\${i.toString().padStart(2, "0")}\`,
      value: \`value-\${i}\`
    })),
    density: "compact"
  }
}`,...(K=(F=k.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};const z=["Default","WithIconsAndSubtitles","WithActions","Expandable","KitchenSink","Compact","LongList"];export{u as Compact,l as Default,d as Expandable,m as KitchenSink,k as LongList,p as WithActions,c as WithIconsAndSubtitles,z as __namedExportsOrder,J as default};

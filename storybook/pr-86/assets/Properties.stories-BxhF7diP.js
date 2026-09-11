import{r as D,j as i}from"./iframe-CFT3PPR7.js";import{P as o}from"./Properties-C4f_yUo4.js";import"./preload-helper-CcRYDqr-.js";import"./IconButton-nSFQuYkv.js";import"./utils-DW-IJACk.js";import"./Icon-BtbnjFB3.js";import"./DropdownMenu-BWzAonWM.js";import"./floating-ui.react-BIMNxrra.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./button-DVB_uS1L.js";import"./index-CPURVhFy.js";import"./loading-CZrrBIDI.js";import"./DropdownMenuSubmenu-CqV515YL.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";const se={title:"Data/Properties",component:o,args:{items:[{key:"namespace",value:"production"},{key:"owner",value:"platform"}],density:"comfortable"},parameters:{layout:"padded",docs:{description:{component:"Two-column property list for dense metadata, raw payload fields, and detail panels. Rows support custom renderers, label icons, prefix/suffix actions, and expandable child content."}}}},g=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"container",value:"policy-api"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"thread",value:"http-nio-8080-exec-6"}],l={args:{items:g}},c={render:()=>i.jsx(o,{gridTemplateColumns:"fit-content(30ch) minmax(0, 1fr)",items:[{key:"name",value:"Example service"},{key:"connection",value:"2 properties",expandable:!0,expanded:!0,renderChildren:()=>i.jsx(o,{items:[{key:"host",value:"localhost"},{key:"credentials",value:"1 property",expandable:!0,expanded:!0,renderChildren:()=>i.jsx(o,{items:[{key:"username",value:"demo"}]})}]})}]})},p={args:{items:[{key:"namespace",value:"claims-demo",subtitle:"Kubernetes namespace"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"container",value:"policy-api",subtitle:"Container name within pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter",subtitle:"Java logger"}],labelIcon:t=>{switch(t){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"logger":return"log";default:return"info-circle"}}}},d={args:{items:g,suffixActions:[{id:"copy",icon:"copy",label:t=>`Copy ${t}`,onClick:(t,r)=>{console.log("copy",r)}},{id:"edit",icon:"edit",label:t=>`Edit ${t}`,onClick:(t,r)=>{console.log("edit",r)}}]}},m={render:()=>{const[t,r]=D.useState({tags:!0}),v=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"tags",value:["env=prod","team=platform","tier=api"],expandable:!0,expanded:t.tags??!1,onToggle:e=>r(a=>({...a,tags:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:["env=prod","team=platform","tier=api"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"attributes",value:{"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"},expandable:!0,expanded:t.attributes??!1,onToggle:e=>r(a=>({...a,attributes:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:Object.entries({"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"}).map(([e,a])=>({key:`attributes.${e}`,value:a}))})}];return i.jsx(o,{density:"compact",items:v,prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var s;return(s=n.onToggle)==null?void 0:s.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var s;return(s=n.onToggle)==null?void 0:s.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:()=>{}}]})}},u={render:()=>{const[t,r]=D.useState({}),v=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"thread",value:"http-nio-8080-exec-6"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"code",value:`GET /v1/policies?status=ACTIVE
Accept: application/json`,subtitle:"Sample request"},{key:"tags",value:["env=prod","team=platform","tier=api","region=eu-west-1"],expandable:!0,expanded:t.tags??!1,onToggle:e=>r(a=>({...a,tags:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:["env=prod","team=platform","tier=api","region=eu-west-1"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"secret",value:"ssh-rsa AAA...",hidden:!0}];return i.jsx(o,{items:v,labelIcon:e=>{switch(e){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"thread":return"tag";case"logger":return"log";case"code":return"code";case"tags":return"label";default:return"info-circle"}},prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var s;return(s=n.onToggle)==null?void 0:s.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var s;return(s=n.onToggle)==null?void 0:s.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:(e,a)=>{var n;typeof navigator<"u"&&((n=navigator.clipboard)!=null&&n.writeText)&&navigator.clipboard.writeText(String(a))}},{id:"view",icon:"eye",label:e=>`View ${e}`,onClick:()=>{}}]})}},y={args:{density:"compact",items:g}},k={args:{items:Array.from({length:50},(t,r)=>({key:`attribute_${r.toString().padStart(2,"0")}`,value:`value-${r}`})),density:"compact"}};var b,x,f;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    items: baseItems
  }
}`,...(f=(x=l.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var _,h,C;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(C=(h=c.parameters)==null?void 0:h.docs)==null?void 0:C.source}}};var S,T,$;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...($=(T=p.parameters)==null?void 0:T.docs)==null?void 0:$.source}}};var A,w,E;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(E=(w=d.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var j,I,P;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(P=(I=m.parameters)==null?void 0:I.docs)==null?void 0:P.source}}};var O,R,q;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(q=(R=u.parameters)==null?void 0:R.docs)==null?void 0:q.source}}};var L,F,K;y.parameters={...y.parameters,docs:{...(L=y.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    density: "compact",
    items: baseItems
  }
}`,...(K=(F=y.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};var V,W,Z;k.parameters={...k.parameters,docs:{...(V=k.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    items: Array.from({
      length: 50
    }, (_, i) => ({
      key: \`attribute_\${i.toString().padStart(2, "0")}\`,
      value: \`value-\${i}\`
    })),
    density: "compact"
  }
}`,...(Z=(W=k.parameters)==null?void 0:W.docs)==null?void 0:Z.source}}};const oe=["Default","NestedLabels","WithIconsAndSubtitles","WithActions","Expandable","KitchenSink","Compact","LongList"];export{y as Compact,l as Default,m as Expandable,u as KitchenSink,k as LongList,c as NestedLabels,d as WithActions,p as WithIconsAndSubtitles,oe as __namedExportsOrder,se as default};

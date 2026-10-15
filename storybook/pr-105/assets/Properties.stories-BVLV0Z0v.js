import{r as z,j as i}from"./iframe-DgmZMBKH.js";import{P as o}from"./Properties-Bdq0MR4F.js";import"./preload-helper-BBRSUrHX.js";import"./IconButton-DuZ8w2HQ.js";import"./utils-DW-IJACk.js";import"./Icon-COMQMXZj.js";import"./DropdownMenu-gsWLznB7.js";import"./floating-ui.react-C3ET48Mi.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./format-2niohfpq.js";import"./JsonView-PTiSkJw0.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";const ve={title:"Data/Properties",component:o,args:{items:[{key:"namespace",value:"production"},{key:"owner",value:"platform"}],density:"comfortable"},parameters:{layout:"padded",docs:{description:{component:"Two-column property list for dense metadata, raw payload fields, and detail panels. Rows support custom renderers, label icons, prefix/suffix actions, and expandable child content."}}}},b=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"container",value:"policy-api"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"thread",value:"http-nio-8080-exec-6"}],l={args:{items:b}},p={args:{items:[{key:"heap_bytes",value:1048576,type:"bytes"},{key:"uptime",value:9e4,type:"duration",unit:"ms"},{key:"cpu",value:.25,type:"number",unit:"percentunit"},{key:"enabled",value:!1,type:"boolean"},{key:"started_at",value:17040672e5,type:"date"},{key:"usage",value:{used:1024,pools:["heap","non-heap"]}},{key:"config",value:'{"enabled":true}',type:"json"}]}},c={render:()=>i.jsx(o,{gridTemplateColumns:"fit-content(30ch) minmax(0, 1fr)",items:[{key:"name",value:"Example service"},{key:"connection",value:"2 properties",expandable:!0,expanded:!0,renderChildren:()=>i.jsx(o,{items:[{key:"host",value:"localhost"},{key:"credentials",value:"1 property",expandable:!0,expanded:!0,renderChildren:()=>i.jsx(o,{items:[{key:"username",value:"demo"}]})}]})}]})},d={args:{items:[{key:"namespace",value:"claims-demo",subtitle:"Kubernetes namespace"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"container",value:"policy-api",subtitle:"Container name within pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter",subtitle:"Java logger"}],labelIcon:t=>{switch(t){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"logger":return"log";default:return"info-circle"}}}},u={args:{items:b,suffixActions:[{id:"copy",icon:"copy",label:t=>`Copy ${t}`,onClick:(t,s)=>{console.log("copy",s)}},{id:"edit",icon:"edit",label:t=>`Edit ${t}`,onClick:(t,s)=>{console.log("edit",s)}}]}},m={render:()=>{const[t,s]=z.useState({tags:!0}),g=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg"},{key:"tags",value:["env=prod","team=platform","tier=api"],expandable:!0,expanded:t.tags??!1,onToggle:e=>s(a=>({...a,tags:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:["env=prod","team=platform","tier=api"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"attributes",value:{"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"},expandable:!0,expanded:t.attributes??!1,onToggle:e=>s(a=>({...a,attributes:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:Object.entries({"service.name":"policy-api","process.thread.name":"http-nio-8080-exec-6"}).map(([e,a])=>({key:`attributes.${e}`,value:a}))})}];return i.jsx(o,{density:"compact",items:g,prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var r;return(r=n.onToggle)==null?void 0:r.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var r;return(r=n.onToggle)==null?void 0:r.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:()=>{}}]})}},y={render:()=>{const[t,s]=z.useState({}),g=[{key:"namespace",value:"claims-demo"},{key:"pod",value:"policy-api-644b55c866-mg7tg",subtitle:"Source pod"},{key:"timestamp",value:"2026-05-03T10:09:30.288Z",subtitle:"ECS @timestamp"},{key:"thread",value:"http-nio-8080-exec-6"},{key:"logger",value:"com.example.policy.filter.ServiceRequestFilter"},{key:"code",value:`GET /v1/policies?status=ACTIVE
Accept: application/json`,subtitle:"Sample request"},{key:"tags",value:["env=prod","team=platform","tier=api","region=eu-west-1"],expandable:!0,expanded:t.tags??!1,onToggle:e=>s(a=>({...a,tags:e})),renderChildren:()=>i.jsx(o,{density:"compact",items:["env=prod","team=platform","tier=api","region=eu-west-1"].map((e,a)=>({key:`tags.${a}`,value:e}))})},{key:"secret",value:"ssh-rsa AAA...",hidden:!0}];return i.jsx(o,{items:g,labelIcon:e=>{switch(e){case"namespace":return"k8s-namespace";case"pod":return"k8s-pod";case"container":return"server";case"timestamp":return"clock";case"thread":return"tag";case"logger":return"log";case"code":return"code";case"tags":return"label";default:return"info-circle"}},prefixActions:[{id:"expand",icon:"expand-all",label:e=>`Expand ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!!n.expanded,onClick:(e,a,n)=>{var r;return(r=n.onToggle)==null?void 0:r.call(n,!0)}},{id:"collapse",icon:"collapse-all",label:e=>`Collapse ${e}`,visible:(e,a,n)=>!!n.expandable,disabled:(e,a,n)=>!n.expanded,onClick:(e,a,n)=>{var r;return(r=n.onToggle)==null?void 0:r.call(n,!1)}}],suffixActions:[{id:"copy",icon:"copy",label:e=>`Copy ${e}`,onClick:(e,a)=>{var n;typeof navigator<"u"&&((n=navigator.clipboard)!=null&&n.writeText)&&navigator.clipboard.writeText(String(a))}},{id:"view",icon:"eye",label:e=>`View ${e}`,onClick:()=>{}}]})}},k={args:{density:"compact",items:b}},v={args:{items:Array.from({length:50},(t,s)=>({key:`attribute_${s.toString().padStart(2,"0")}`,value:`value-${s}`})),density:"compact"}};var x,f,_;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    items: baseItems
  }
}`,...(_=(f=l.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var h,C,S;p.parameters={...p.parameters,docs:{...(h=p.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(S=(C=p.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};var T,$,A;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(A=($=c.parameters)==null?void 0:$.docs)==null?void 0:A.source}}};var w,E,j;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(j=(E=d.parameters)==null?void 0:E.docs)==null?void 0:j.source}}};var I,P,O;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(O=(P=u.parameters)==null?void 0:P.docs)==null?void 0:O.source}}};var R,q,L;m.parameters={...m.parameters,docs:{...(R=m.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(L=(q=m.parameters)==null?void 0:q.docs)==null?void 0:L.source}}};var V,F,K;y.parameters={...y.parameters,docs:{...(V=y.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(K=(F=y.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};var W,Z,D;k.parameters={...k.parameters,docs:{...(W=k.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    density: "compact",
    items: baseItems
  }
}`,...(D=(Z=k.parameters)==null?void 0:Z.docs)==null?void 0:D.source}}};var G,J,N;v.parameters={...v.parameters,docs:{...(G=v.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    items: Array.from({
      length: 50
    }, (_, i) => ({
      key: \`attribute_\${i.toString().padStart(2, "0")}\`,
      value: \`value-\${i}\`
    })),
    density: "compact"
  }
}`,...(N=(J=v.parameters)==null?void 0:J.docs)==null?void 0:N.source}}};const ge=["Default","TypedValues","NestedLabels","WithIconsAndSubtitles","WithActions","Expandable","KitchenSink","Compact","LongList"];export{k as Compact,l as Default,m as Expandable,y as KitchenSink,v as LongList,c as NestedLabels,p as TypedValues,u as WithActions,d as WithIconsAndSubtitles,ge as __namedExportsOrder,ve as default};

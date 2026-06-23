import{j as e}from"./iframe-BbITQAD0.js";import{B as a}from"./Badge-0VTPnFgW.js";import{U as t}from"./UiCheck-Dc-rEWul.js";import{U as te}from"./UiWarningTriangle-CICOj5Lg.js";import{U as oe,a as le}from"./UiBoxes-VNe196OQ.js";import{U as de,a as ne,b as ce,c as ue,d as ie,e as y}from"./UiGitBranch-DrDvUQz-.js";import{U as me}from"./UiServer-BsrIYrE_.js";import{U as pe}from"./UiCloud-CV6FpMND.js";import{U as xe}from"./UiClock-GFdiqaaY.js";import{U as be}from"./UiLock-DH5ykaaO.js";import{U as ve}from"./UiCircleX-C75o46yZ.js";import{U as ge}from"./UiInfo-DPvkyTZV.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./Icon-BV_HrUof.js";const Oe={title:"Data/Badge",component:a,args:{children:"Badge",tone:"neutral",variant:"soft",size:"md",shape:"pill"},argTypes:{variant:{control:"select",options:["soft","solid","outline","status","metric","custom","outlined","label"],description:"Visual variant. `soft`/`solid`/`outline` are the simple legacy styles; `status`/`metric`/`custom`/`outlined`/`label` are rich label/value layouts.",table:{category:"Appearance",defaultValue:{summary:"soft"}}},tone:{control:"inline-radio",options:["neutral","success","danger","warning","info"],description:"Semantic color tone for the legacy variants.",table:{category:"Appearance",defaultValue:{summary:"neutral"}}},status:{control:"inline-radio",options:["success","error","warning","info"],description:'Status palette used by `variant="status"`.',table:{category:"Appearance"}},size:{control:"inline-radio",options:["xxs","xs","sm","md","lg"],description:"Density-aware badge size.",table:{category:"Appearance",defaultValue:{summary:"md"}}},shape:{control:"inline-radio",options:["pill","rounded","square"],description:"Corner treatment for the badge frame.",table:{category:"Appearance",defaultValue:{summary:"pill"}}},label:{control:"text",table:{category:"Content"}},value:{control:"text",table:{category:"Content"}},children:{control:"text",table:{category:"Content"}},count:{control:"number",table:{category:"Content"}},color:{control:"color",description:"Custom background color (CSS color) or utility class.",table:{category:"Custom colors"}},textColor:{control:"color",table:{category:"Custom colors"}},borderColor:{control:"color",table:{category:"Custom colors"}},wrap:{control:"boolean",description:"Allow long label/value content to wrap instead of truncating.",table:{category:"Overflow"}},maxWidth:{control:"number",description:"Max width before truncation; numbers are treated as a character budget.",table:{category:"Overflow"}},truncate:{control:"select",options:["prefix","suffix","arn","image","path","url","auto"],description:"Semantic truncation strategy for long single-line values.",table:{category:"Overflow"}},clickToCopy:{control:"boolean",table:{category:"Behavior"}},href:{control:"text",table:{category:"Behavior"}},icon:{control:!1,table:{category:"Content"}}},parameters:{layout:"padded",docs:{description:{component:["Compact status, label/value, metric, and link badge.","","**When to use**","- Simple variants (`soft`/`solid`/`outline`) for inline labels and counts.","- Rich variants when keys, values, icons, truncation, wrapping, or copy behavior matter:","  - `status` — health/state chip with a status palette and optional icon.","  - `metric` — `label | value` pair for numeric readouts (CPU, latency).","  - `label` — split `key | value` chip with its own colored key segment.","  - `custom` / `outlined` — bring-your-own `color`/`textColor`/`borderColor`.","","**Usage**","```tsx",'<Badge variant="status" status="success" label="Build" value="passing" icon={UiCheck} />','<Badge variant="metric" label="Latency" value="45ms" icon={UiActivity} />','<Badge variant="label" label="env" value="production" color="#dcfce7" textColor="#15803d" />',"```","","Use the **Playground** story to drive every prop from the controls panel."].join(`
`)}}}},fe=["neutral","success","danger","warning","info"],ye=["soft","solid","outline"],he=[{label:"Healthy",value:"ready",status:"success",icon:t},{label:"Degraded",value:"latency",status:"warning",icon:te},{label:"Failed",value:"blocked",status:"error",icon:ve},{label:"Pending",value:"queued",status:"info",icon:ge}],Ce=[["engine","postgresql"],["env","production"],["region","eu-west-1"],["tier","critical"],["owner","platform"],["cluster","mission-control"],["backup","nightly"],["retention","35d"],["replicas","3"],["cost-center","infra-ops"]],Ne=[["container","ghcr.io/flanksource/platform/incident-commander-controller"],["image","ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12"],["from","sha256:42e5e2378f81f1b8d0355ab5b12a47f3b7ac91dbd5f3f65a174d4021c9d3eb18"],["to","sha256:8cd15af2d1364a5cb4f8df25e7c6291e67c9dbf6d137db4403228c4a37d00412"]],we=[{label:"prefix",value:"incident-commander-controller-production-eu-west-1",truncate:"prefix",maxWidth:20},{label:"suffix",value:"mission-control-platform-config-reconciliation-job",truncate:"suffix",maxWidth:20},{label:"arn",value:"arn:aws:eks:eu-west-1:123456789012:cluster/production-mission-control",truncate:"arn",maxWidth:20},{label:"image",value:"ghcr.io/flanksource/platform/mission-control-api:v2.4.1-build.17",truncate:"image",maxWidth:20},{label:"path",value:"/configs/production/platform/mission-control.yaml",truncate:"path",maxWidth:20},{label:"url",value:"https://console.flanksource.com/configs/production/mission-control.yaml?env=prod",truncate:"url",maxWidth:20},{label:"auto",value:"ghcr.io/flanksource/platform/mission-control-worker:v2.4.1-build.17",truncate:"auto",maxWidth:20}];function C({children:s}){return e.jsx("div",{className:"space-y-density-3",children:s})}function h({title:s,description:r,children:o}){return e.jsxs("div",{className:"space-y-density-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:s}),r&&e.jsx("p",{className:"text-xs text-muted-foreground",children:r})]}),o]})}const l={args:{variant:"status",status:"success",label:"Build",value:"passing",size:"md"},parameters:{docs:{description:{story:"Drive every prop from the controls panel. Switch `variant` to see how `label`, `value`, `tone`, `status`, and the custom color props apply."}}},render:s=>e.jsx("div",{className:"flex flex-wrap items-center gap-density-2",children:e.jsx(a,{...s,icon:t})})},n={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"status",status:"success",label:"Build",value:"passing",icon:t}),e.jsx(a,{variant:"metric",label:"Latency",value:"45ms",icon:le}),e.jsx(a,{variant:"custom",label:"v2.4.1",icon:ie,color:"#eef2ff",textColor:"#4338ca"}),e.jsx(a,{variant:"outlined",label:"Kubernetes",icon:oe,borderColor:"#326ce5",textColor:"#326ce5"}),e.jsx(a,{variant:"label",label:"env",value:"production",color:"#dcfce7",textColor:"#15803d"})]})},i={render:()=>e.jsxs(C,{children:[ye.map(s=>e.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[e.jsx("span",{className:"w-20 text-xs text-muted-foreground",children:s}),fe.map(r=>e.jsx(a,{tone:r,variant:s,children:r},r))]},s)),e.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[e.jsx(a,{tone:"danger",variant:"solid",count:12,children:"errors"}),e.jsx(a,{tone:"success",icon:t,children:"passed"}),e.jsx(a,{tone:"warning",size:"lg",children:"needs review"})]})]})},d={render:()=>e.jsx("div",{className:"flex flex-wrap gap-density-2",children:he.map(({label:s,value:r,status:o,icon:f})=>e.jsx(a,{variant:"status",status:o,label:s,value:r,icon:f,size:"xs"},s))})},c={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"outlined",label:"Kubernetes",icon:oe,borderColor:"#326ce5",textColor:"#326ce5",size:"xs"}),e.jsx(a,{variant:"outlined",label:"Helm",icon:de,borderColor:"#0f1689",textColor:"#0f1689",size:"xs"}),e.jsx(a,{variant:"outlined",label:"Flux",icon:ne,borderColor:"#5468ff",textColor:"#5468ff",size:"xs"}),e.jsx(a,{variant:"outlined",label:"ArgoCD",icon:ce,borderColor:"#ef7b4d",textColor:"#ef7b4d",size:"xs"})]})},u={render:()=>e.jsx("div",{className:"rounded-lg border border-border bg-muted/40 p-density-3",children:e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"label",label:"container",value:"incident-commander",color:"#dbeafe",textColor:"#1d4ed8",size:"xs",className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-mono text-foreground"}),e.jsx(a,{variant:"label",label:"namespace",value:"mc",color:"#dcfce7",textColor:"#15803d",size:"xs",className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-semibold text-foreground"}),e.jsx(a,{variant:"label",label:"strategy",value:"rolling",color:"#ede9fe",textColor:"#6d28d9",size:"xs",className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-medium text-foreground"})]})})},m={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[e.jsx(a,{variant:"status",status:"success",label:"xxs",size:"xxs",icon:t}),e.jsx(a,{variant:"status",status:"success",label:"xs",size:"xs",icon:t}),e.jsx(a,{variant:"status",status:"success",label:"sm",size:"sm",icon:t}),e.jsx(a,{variant:"status",status:"success",label:"md",size:"md",icon:t}),e.jsx(a,{variant:"status",status:"success",label:"lg",size:"lg",icon:t})]})},p={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"status",status:"info",label:"pill",shape:"pill",size:"xs",icon:y}),e.jsx(a,{variant:"status",status:"info",label:"rounded",shape:"rounded",size:"xs",icon:y}),e.jsx(a,{variant:"status",status:"info",label:"square",shape:"square",size:"xs",icon:y})]})},x={render:()=>e.jsxs(C,{children:[e.jsx(h,{title:"Dense field:value bands",description:"Let compact metadata wrap across lines before switching to a table.",children:e.jsx("div",{className:"rounded-lg border border-border bg-muted/40 p-density-3",children:e.jsx("div",{className:"flex max-w-[28rem] flex-wrap gap-density-2",children:Ce.map(([s,r])=>e.jsx(a,{variant:"label",label:s,value:r,color:"#dbeafe",textColor:"#1d4ed8",size:"xxs",className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-medium text-foreground"},s))})})}),e.jsx(h,{title:"Wrapped xxs badges for long values",description:"Use wrap when dense metadata must stay badge-shaped but long values cannot remain single-line.",children:e.jsx("div",{className:"rounded-lg border border-border bg-muted/40 p-density-3",children:e.jsx("div",{className:"flex max-w-[28rem] flex-wrap gap-density-2",children:Ne.map(([s,r])=>e.jsx(a,{variant:"label",label:s,value:r,color:s==="to"?"#dcfce7":"#dbeafe",textColor:s==="to"?"#15803d":"#1d4ed8",size:"xxs",wrap:!0,maxWidth:20,className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-mono text-foreground"},s))})})}),e.jsx(h,{title:"Truncation styles",description:"Use maxWidth with semantic truncation modes when values must stay single-line but preserve the meaningful part.",children:e.jsx("div",{className:"rounded-lg border border-border bg-muted/40 p-density-3",children:e.jsx("div",{className:"flex max-w-[32rem] flex-wrap gap-density-2",children:we.map(({label:s,value:r,truncate:o,maxWidth:f})=>e.jsx(a,{variant:"label",label:s,value:r,color:"#dbeafe",textColor:"#1d4ed8",size:"xxs",maxWidth:f,truncate:o,className:"bg-background",labelClassName:"uppercase tracking-[0.03em]",valueClassName:"font-mono text-foreground"},s))})})})]})},b={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"outlined",label:"Docs",size:"xs",href:"https://flanksource.com",target:"_blank",borderColor:"#326ce5",textColor:"#326ce5"}),e.jsx(a,{variant:"custom",label:"release notes",size:"xs",href:"#release-notes",color:"#f5f3ff",textColor:"#6d28d9",borderColor:"#ddd6fe"}),e.jsx(a,{variant:"label",label:"run",value:"3482",size:"xs",href:"#run-3482",className:"bg-background",color:"#dbeafe",textColor:"#1d4ed8"})]})},v={render:()=>e.jsxs(C,{children:[e.jsx("div",{className:"rounded-lg border border-border bg-muted/40 p-density-3",children:e.jsxs("ul",{className:"list-disc space-y-1 pl-4 text-sm text-foreground",children:[e.jsx("li",{children:"Use badges for scan-friendly metadata and state, not for long explanations."}),e.jsx("li",{children:"Reserve stronger color for semantics like risk, state, or workflow stage."}),e.jsx("li",{children:'Prefer `size="xs"` for rows that mix prose with many metadata tokens.'}),e.jsx("li",{children:"Use split `label | value` badges when field names repeat across rows."}),e.jsx("li",{children:"Turn on `wrap` before adding one-off CSS for long metadata values."})]})}),e.jsxs("div",{className:"rounded-lg border border-border overflow-hidden",children:[e.jsxs("div",{className:"grid grid-cols-[10rem_1fr_9rem] border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground",children:[e.jsx("div",{className:"px-density-3 py-density-2",children:"service"}),e.jsx("div",{className:"px-density-3 py-density-2",children:"status"}),e.jsx("div",{className:"px-density-3 py-density-2",children:"version"})]}),e.jsxs("div",{className:"grid grid-cols-[10rem_1fr_9rem] items-center border-b border-border/60 text-sm",children:[e.jsx("div",{className:"px-density-3 py-density-2",children:"api-gateway"}),e.jsx("div",{className:"px-density-3 py-density-2",children:e.jsx(a,{variant:"status",status:"success",label:"Healthy",value:"ready",size:"xs",icon:t})}),e.jsx("div",{className:"px-density-3 py-density-2",children:e.jsx(a,{variant:"custom",label:"v2.4.1",size:"xs",color:"#eef2ff",textColor:"#4338ca",borderColor:"#c7d2fe"})})]}),e.jsxs("div",{className:"grid grid-cols-[10rem_1fr_9rem] items-center text-sm",children:[e.jsx("div",{className:"px-density-3 py-density-2",children:"worker-pool"}),e.jsx("div",{className:"px-density-3 py-density-2",children:e.jsx(a,{variant:"status",status:"warning",label:"Degraded",value:"backpressure",size:"xs",icon:te})}),e.jsx("div",{className:"px-density-3 py-density-2",children:e.jsx(a,{variant:"outlined",label:"canary",size:"xs",borderColor:"#f59e0b",textColor:"#b45309"})})]})]})]})},g={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-2",children:[e.jsx(a,{variant:"metric",label:"CPU",value:"42%",icon:le,size:"xs"}),e.jsx(a,{variant:"metric",label:"Memory",value:"8.2 GB",icon:me,size:"xs"}),e.jsx(a,{variant:"metric",label:"Uptime",value:"99.9%",icon:pe,size:"xs"}),e.jsx(a,{variant:"metric",label:"Latency",value:"12ms",icon:xe,size:"xs"}),e.jsx(a,{variant:"custom",color:"#fdf2f8",textColor:"#be185d",label:"Production",icon:ue,size:"xs"}),e.jsx(a,{variant:"custom",color:"#ecfdf5",textColor:"#065f46",label:"Secured",icon:be,size:"xs"}),e.jsx(a,{variant:"custom",color:"#fffbeb",textColor:"#92400e",label:"Beta",icon:ne,size:"xs"}),e.jsx(a,{variant:"custom",color:"#eef2ff",textColor:"#4338ca",label:"v2.4.1",icon:ie,size:"xs"})]})};var N,w,j;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    variant: "status",
    status: "success",
    label: "Build",
    value: "passing",
    size: "md"
  },
  parameters: {
    docs: {
      description: {
        story: "Drive every prop from the controls panel. Switch \`variant\` to see how \`label\`, \`value\`, \`tone\`, \`status\`, and the custom color props apply."
      }
    }
  },
  render: args => <div className="flex flex-wrap items-center gap-density-2">
      <Badge {...args} icon={UiCheck} />
    </div>
}`,...(j=(w=l.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var k,B,z;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="success" label="Build" value="passing" icon={UiCheck} />
      <Badge variant="metric" label="Latency" value="45ms" icon={UiActivity} />
      <Badge variant="custom" label="v2.4.1" icon={UiGitBranch} color="#eef2ff" textColor="#4338ca" />
      <Badge variant="outlined" label="Kubernetes" icon={UiBoxes} borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="label" label="env" value="production" color="#dcfce7" textColor="#15803d" />
    </div>
}`,...(z=(B=n.parameters)==null?void 0:B.docs)==null?void 0:z.source}}};var U,S,A;i.parameters={...i.parameters,docs:{...(U=i.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <StoryStack>
      {LEGACY_VARIANTS.map(variant => <div key={variant} className="flex flex-wrap items-center gap-density-2">
          <span className="w-20 text-xs text-muted-foreground">{variant}</span>
          {TONES.map(tone => <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>)}
        </div>)}
      <div className="flex flex-wrap items-center gap-density-2">
        <Badge tone="danger" variant="solid" count={12}>
          errors
        </Badge>
        <Badge tone="success" icon={UiCheck}>
          passed
        </Badge>
        <Badge tone="warning" size="lg">
          needs review
        </Badge>
      </div>
    </StoryStack>
}`,...(A=(S=i.parameters)==null?void 0:S.docs)==null?void 0:A.source}}};var _,W,G;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      {STATUS_BADGES.map(({
      label,
      value,
      status,
      icon
    }) => <Badge key={label} variant="status" status={status} label={label} value={value} icon={icon} size="xs" />)}
    </div>
}`,...(G=(W=d.parameters)==null?void 0:W.docs)==null?void 0:G.source}}};var D,T,L;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Kubernetes" icon={UiBoxes} borderColor="#326ce5" textColor="#326ce5" size="xs" />
      <Badge variant="outlined" label="Helm" icon={UiShipWheel} borderColor="#0f1689" textColor="#0f1689" size="xs" />
      <Badge variant="outlined" label="Flux" icon={UiZap} borderColor="#5468ff" textColor="#5468ff" size="xs" />
      <Badge variant="outlined" label="ArgoCD" icon={UiRoute} borderColor="#ef7b4d" textColor="#ef7b4d" size="xs" />
    </div>
}`,...(L=(T=c.parameters)==null?void 0:T.docs)==null?void 0:L.source}}};var E,P,R;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div className="rounded-lg border border-border bg-muted/40 p-density-3">
      <div className="flex flex-wrap gap-density-2">
        <Badge variant="label" label="container" value="incident-commander" color="#dbeafe" textColor="#1d4ed8" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-mono text-foreground" />
        <Badge variant="label" label="namespace" value="mc" color="#dcfce7" textColor="#15803d" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-semibold text-foreground" />
        <Badge variant="label" label="strategy" value="rolling" color="#ede9fe" textColor="#6d28d9" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-medium text-foreground" />
      </div>
    </div>
}`,...(R=(P=u.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var O,V,q;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-density-2">
      <Badge variant="status" status="success" label="xxs" size="xxs" icon={UiCheck} />
      <Badge variant="status" status="success" label="xs" size="xs" icon={UiCheck} />
      <Badge variant="status" status="success" label="sm" size="sm" icon={UiCheck} />
      <Badge variant="status" status="success" label="md" size="md" icon={UiCheck} />
      <Badge variant="status" status="success" label="lg" size="lg" icon={UiCheck} />
    </div>
}`,...(q=(V=m.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var I,M,H;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="info" label="pill" shape="pill" size="xs" icon={UiShieldCheck} />
      <Badge variant="status" status="info" label="rounded" shape="rounded" size="xs" icon={UiShieldCheck} />
      <Badge variant="status" status="info" label="square" shape="square" size="xs" icon={UiShieldCheck} />
    </div>
}`,...(H=(M=p.parameters)==null?void 0:M.docs)==null?void 0:H.source}}};var F,K,Z;x.parameters={...x.parameters,docs:{...(F=x.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <StoryStack>
      <StoryGroup title="Dense field:value bands" description="Let compact metadata wrap across lines before switching to a table.">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[28rem] flex-wrap gap-density-2">
            {FIELD_VALUE_BADGES.map(([label, value]) => <Badge key={label} variant="label" label={label} value={value} color="#dbeafe" textColor="#1d4ed8" size="xxs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-medium text-foreground" />)}
          </div>
        </div>
      </StoryGroup>
      <StoryGroup title="Wrapped xxs badges for long values" description="Use wrap when dense metadata must stay badge-shaped but long values cannot remain single-line.">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[28rem] flex-wrap gap-density-2">
            {WRAPPING_BADGES.map(([label, value]) => <Badge key={label} variant="label" label={label} value={value} color={label === "to" ? "#dcfce7" : "#dbeafe"} textColor={label === "to" ? "#15803d" : "#1d4ed8"} size="xxs" wrap maxWidth={20} className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-mono text-foreground" />)}
          </div>
        </div>
      </StoryGroup>
      <StoryGroup title="Truncation styles" description="Use maxWidth with semantic truncation modes when values must stay single-line but preserve the meaningful part.">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[32rem] flex-wrap gap-density-2">
            {TRUNCATION_BADGES.map(({
            label,
            value,
            truncate,
            maxWidth
          }) => <Badge key={label} variant="label" label={label} value={value} color="#dbeafe" textColor="#1d4ed8" size="xxs" maxWidth={maxWidth} truncate={truncate} className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-mono text-foreground" />)}
          </div>
        </div>
      </StoryGroup>
    </StoryStack>
}`,...(Z=(K=x.parameters)==null?void 0:K.docs)==null?void 0:Z.source}}};var Y,X,J;b.parameters={...b.parameters,docs:{...(Y=b.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Docs" size="xs" href="https://flanksource.com" target="_blank" borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="custom" label="release notes" size="xs" href="#release-notes" color="#f5f3ff" textColor="#6d28d9" borderColor="#ddd6fe" />
      <Badge variant="label" label="run" value="3482" size="xs" href="#run-3482" className="bg-background" color="#dbeafe" textColor="#1d4ed8" />
    </div>
}`,...(J=(X=b.parameters)==null?void 0:X.docs)==null?void 0:J.source}}};var Q,$,ee;v.parameters={...v.parameters,docs:{...(Q=v.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: () => <StoryStack>
      <div className="rounded-lg border border-border bg-muted/40 p-density-3">
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
          <li>Use badges for scan-friendly metadata and state, not for long explanations.</li>
          <li>Reserve stronger color for semantics like risk, state, or workflow stage.</li>
          <li>Prefer \`size=&quot;xs&quot;\` for rows that mix prose with many metadata tokens.</li>
          <li>Use split \`label | value\` badges when field names repeat across rows.</li>
          <li>Turn on \`wrap\` before adding one-off CSS for long metadata values.</li>
        </ul>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[10rem_1fr_9rem] border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
          <div className="px-density-3 py-density-2">service</div>
          <div className="px-density-3 py-density-2">status</div>
          <div className="px-density-3 py-density-2">version</div>
        </div>
        <div className="grid grid-cols-[10rem_1fr_9rem] items-center border-b border-border/60 text-sm">
          <div className="px-density-3 py-density-2">api-gateway</div>
          <div className="px-density-3 py-density-2">
            <Badge variant="status" status="success" label="Healthy" value="ready" size="xs" icon={UiCheck} />
          </div>
          <div className="px-density-3 py-density-2">
            <Badge variant="custom" label="v2.4.1" size="xs" color="#eef2ff" textColor="#4338ca" borderColor="#c7d2fe" />
          </div>
        </div>
        <div className="grid grid-cols-[10rem_1fr_9rem] items-center text-sm">
          <div className="px-density-3 py-density-2">worker-pool</div>
          <div className="px-density-3 py-density-2">
            <Badge variant="status" status="warning" label="Degraded" value="backpressure" size="xs" icon={UiWarningTriangle} />
          </div>
          <div className="px-density-3 py-density-2">
            <Badge variant="outlined" label="canary" size="xs" borderColor="#f59e0b" textColor="#b45309" />
          </div>
        </div>
      </div>
    </StoryStack>
}`,...(ee=($=v.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var ae,se,re;g.parameters={...g.parameters,docs:{...(ae=g.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="metric" label="CPU" value="42%" icon={UiActivity} size="xs" />
      <Badge variant="metric" label="Memory" value="8.2 GB" icon={UiServer} size="xs" />
      <Badge variant="metric" label="Uptime" value="99.9%" icon={UiCloud} size="xs" />
      <Badge variant="metric" label="Latency" value="12ms" icon={UiClock} size="xs" />
      <Badge variant="custom" color="#fdf2f8" textColor="#be185d" label="Production" icon={UiRocket} size="xs" />
      <Badge variant="custom" color="#ecfdf5" textColor="#065f46" label="Secured" icon={UiLock} size="xs" />
      <Badge variant="custom" color="#fffbeb" textColor="#92400e" label="Beta" icon={UiZap} size="xs" />
      <Badge variant="custom" color="#eef2ff" textColor="#4338ca" label="v2.4.1" icon={UiGitBranch} size="xs" />
    </div>
}`,...(re=(se=g.parameters)==null?void 0:se.docs)==null?void 0:re.source}}};const Ve=["Playground","Overview","LegacyMatrix","StatusBadges","CustomOutlinedColors","LabelValueHooks","Sizes","Shapes","WrappedMetadata","Clickable","BestPractices","MixedUsage"];export{v as BestPractices,b as Clickable,c as CustomOutlinedColors,u as LabelValueHooks,i as LegacyMatrix,g as MixedUsage,n as Overview,l as Playground,p as Shapes,m as Sizes,d as StatusBadges,x as WrappedMetadata,Ve as __namedExportsOrder,Oe as default};

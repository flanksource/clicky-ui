import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Bs as n,Dl as r,Ei as i,Ho as a,Qr as o,Rs as s,So as c,Ur as l,Ws as u,as as d,bo as f,hs as p,jc as m,kr as h,n as g,wo as _,xs as v}from"./icons-N6BqLuiz.js";import{n as y,t as b}from"./Badge-g8z2airt.js";function x({children:e}){return(0,C.jsx)(`div`,{className:`space-y-density-3`,children:e})}function S({title:e,description:t,children:n}){return(0,C.jsxs)(`div`,{className:`space-y-density-2`,children:[(0,C.jsxs)(`div`,{className:`space-y-1`,children:[(0,C.jsx)(`h3`,{className:`text-sm font-semibold text-foreground`,children:e}),t&&(0,C.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:t})]}),n]})}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{y(),g(),C=t(),w={title:`Data/Badge`,component:b,args:{children:`Badge`,tone:`neutral`,variant:`soft`,size:`md`,shape:`pill`},argTypes:{variant:{control:`select`,options:[`soft`,`solid`,`outline`,`status`,`metric`,`custom`,`outlined`,`label`],description:"Visual variant. `soft`/`solid`/`outline` are the simple legacy styles; `status`/`metric`/`custom`/`outlined`/`label` are rich label/value layouts.",table:{category:`Appearance`,defaultValue:{summary:`soft`}}},tone:{control:`inline-radio`,options:[`neutral`,`success`,`danger`,`warning`,`info`],description:`Semantic color tone for the legacy variants.`,table:{category:`Appearance`,defaultValue:{summary:`neutral`}}},status:{control:`inline-radio`,options:[`success`,`error`,`warning`,`info`],description:'Status palette used by `variant="status"`.',table:{category:`Appearance`}},size:{control:`inline-radio`,options:[`xxs`,`xs`,`sm`,`md`,`lg`],description:`Density-aware badge size.`,table:{category:`Appearance`,defaultValue:{summary:`md`}}},shape:{control:`inline-radio`,options:[`pill`,`rounded`,`square`],description:`Corner treatment for the badge frame.`,table:{category:`Appearance`,defaultValue:{summary:`pill`}}},label:{control:`text`,table:{category:`Content`}},value:{control:`text`,table:{category:`Content`}},children:{control:`text`,table:{category:`Content`}},count:{control:`number`,table:{category:`Content`}},color:{control:`color`,description:`Custom background color (CSS color) or utility class.`,table:{category:`Custom colors`}},textColor:{control:`color`,table:{category:`Custom colors`}},borderColor:{control:`color`,table:{category:`Custom colors`}},wrap:{control:`boolean`,description:`Allow long label/value content to wrap instead of truncating.`,table:{category:`Overflow`}},maxWidth:{control:`number`,description:`Max width before truncation; numbers are treated as a character budget.`,table:{category:`Overflow`}},truncate:{control:`select`,options:[`prefix`,`suffix`,`arn`,`image`,`path`,`url`,`auto`],description:`Semantic truncation strategy for long single-line values.`,table:{category:`Overflow`}},clickToCopy:{control:`boolean`,table:{category:`Behavior`}},href:{control:`text`,table:{category:`Behavior`}},icon:{control:!1,table:{category:`Content`}}},parameters:{layout:`padded`,docs:{description:{component:'Compact status, label/value, metric, and link badge.\n\n**When to use**\n- Simple variants (`soft`/`solid`/`outline`) for inline labels and counts.\n- Rich variants when keys, values, icons, truncation, wrapping, or copy behavior matter:\n  - `status` — health/state chip with a status palette and optional icon.\n  - `metric` — `label | value` pair for numeric readouts (CPU, latency).\n  - `label` — split `key | value` chip with its own colored key segment.\n  - `custom` / `outlined` — bring-your-own `color`/`textColor`/`borderColor`.\n\n**Usage**\n```tsx\n<Badge variant="status" status="success" label="Build" value="passing" icon={UiCheck} />\n<Badge variant="metric" label="Latency" value="45ms" icon={UiActivity} />\n<Badge variant="label" label="env" value="production" color="#dcfce7" textColor="#15803d" />\n```\n\nUse the **Playground** story to drive every prop from the controls panel.'}}}},T=[`neutral`,`success`,`danger`,`warning`,`info`],E=[`soft`,`solid`,`outline`],D=[{label:`Healthy`,value:`ready`,status:`success`,icon:v},{label:`Degraded`,value:`latency`,status:`warning`,icon:u},{label:`Failed`,value:`blocked`,status:`error`,icon:n},{label:`Pending`,value:`queued`,status:`info`,icon:s}],O=[[`engine`,`postgresql`],[`env`,`production`],[`region`,`eu-west-1`],[`tier`,`critical`],[`owner`,`platform`],[`cluster`,`mission-control`],[`backup`,`nightly`],[`retention`,`35d`],[`replicas`,`3`],[`cost-center`,`infra-ops`]],k=[[`container`,`ghcr.io/flanksource/platform/incident-commander-controller`],[`image`,`ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12`],[`from`,`sha256:42e5e2378f81f1b8d0355ab5b12a47f3b7ac91dbd5f3f65a174d4021c9d3eb18`],[`to`,`sha256:8cd15af2d1364a5cb4f8df25e7c6291e67c9dbf6d137db4403228c4a37d00412`]],A=[{label:`prefix`,value:`incident-commander-controller-production-eu-west-1`,truncate:`prefix`,maxWidth:20},{label:`suffix`,value:`mission-control-platform-config-reconciliation-job`,truncate:`suffix`,maxWidth:20},{label:`arn`,value:`arn:aws:eks:eu-west-1:123456789012:cluster/production-mission-control`,truncate:`arn`,maxWidth:20},{label:`image`,value:`ghcr.io/flanksource/platform/mission-control-api:v2.4.1-build.17`,truncate:`image`,maxWidth:20},{label:`path`,value:`/configs/production/platform/mission-control.yaml`,truncate:`path`,maxWidth:20},{label:`url`,value:`https://console.flanksource.com/configs/production/mission-control.yaml?env=prod`,truncate:`url`,maxWidth:20},{label:`auto`,value:`ghcr.io/flanksource/platform/mission-control-worker:v2.4.1-build.17`,truncate:`auto`,maxWidth:20}],j={args:{variant:`status`,status:`success`,label:`Build`,value:`passing`,size:`md`},parameters:{docs:{description:{story:"Drive every prop from the controls panel. Switch `variant` to see how `label`, `value`, `tone`, `status`, and the custom color props apply."}}},render:e=>(0,C.jsx)(`div`,{className:`flex flex-wrap items-center gap-density-2`,children:(0,C.jsx)(b,{...e,icon:v})})},M={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`status`,status:`success`,label:`Build`,value:`passing`,icon:v}),(0,C.jsx)(b,{variant:`metric`,label:`Latency`,value:`45ms`,icon:r}),(0,C.jsx)(b,{variant:`custom`,label:`v2.4.1`,icon:i,color:`#eef2ff`,textColor:`#4338ca`}),(0,C.jsx)(b,{variant:`outlined`,label:`Kubernetes`,icon:a,borderColor:`#326ce5`,textColor:`#326ce5`}),(0,C.jsx)(b,{variant:`label`,label:`env`,value:`production`,color:`#dcfce7`,textColor:`#15803d`})]})},N={render:()=>(0,C.jsxs)(x,{children:[E.map(e=>(0,C.jsxs)(`div`,{className:`flex flex-wrap items-center gap-density-2`,children:[(0,C.jsx)(`span`,{className:`w-20 text-xs text-muted-foreground`,children:e}),T.map(t=>(0,C.jsx)(b,{tone:t,variant:e,children:t},t))]},e)),(0,C.jsxs)(`div`,{className:`flex flex-wrap items-center gap-density-2`,children:[(0,C.jsx)(b,{tone:`danger`,variant:`solid`,count:12,children:`errors`}),(0,C.jsx)(b,{tone:`success`,icon:v,children:`passed`}),(0,C.jsx)(b,{tone:`warning`,size:`lg`,children:`needs review`})]})]})},P={render:()=>(0,C.jsx)(`div`,{className:`flex flex-wrap gap-density-2`,children:D.map(({label:e,value:t,status:n,icon:r})=>(0,C.jsx)(b,{variant:`status`,status:n,label:e,value:t,icon:r,size:`xs`},e))})},F={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`outlined`,label:`Kubernetes`,icon:a,borderColor:`#326ce5`,textColor:`#326ce5`,size:`xs`}),(0,C.jsx)(b,{variant:`outlined`,label:`Helm`,icon:c,borderColor:`#0f1689`,textColor:`#0f1689`,size:`xs`}),(0,C.jsx)(b,{variant:`outlined`,label:`Flux`,icon:f,borderColor:`#5468ff`,textColor:`#5468ff`,size:`xs`}),(0,C.jsx)(b,{variant:`outlined`,label:`ArgoCD`,icon:m,borderColor:`#ef7b4d`,textColor:`#ef7b4d`,size:`xs`})]})},I={render:()=>(0,C.jsx)(`div`,{className:`rounded-lg border border-border bg-muted/40 p-density-3`,children:(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`label`,label:`container`,value:`incident-commander`,color:`#dbeafe`,textColor:`#1d4ed8`,size:`xs`,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-mono text-foreground`}),(0,C.jsx)(b,{variant:`label`,label:`namespace`,value:`mc`,color:`#dcfce7`,textColor:`#15803d`,size:`xs`,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-semibold text-foreground`}),(0,C.jsx)(b,{variant:`label`,label:`strategy`,value:`rolling`,color:`#ede9fe`,textColor:`#6d28d9`,size:`xs`,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-medium text-foreground`})]})})},L={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap items-center gap-density-2`,children:[(0,C.jsx)(b,{variant:`status`,status:`success`,label:`xxs`,size:`xxs`,icon:v}),(0,C.jsx)(b,{variant:`status`,status:`success`,label:`xs`,size:`xs`,icon:v}),(0,C.jsx)(b,{variant:`status`,status:`success`,label:`sm`,size:`sm`,icon:v}),(0,C.jsx)(b,{variant:`status`,status:`success`,label:`md`,size:`md`,icon:v}),(0,C.jsx)(b,{variant:`status`,status:`success`,label:`lg`,size:`lg`,icon:v})]})},R={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`status`,status:`info`,label:`pill`,shape:`pill`,size:`xs`,icon:d}),(0,C.jsx)(b,{variant:`status`,status:`info`,label:`rounded`,shape:`rounded`,size:`xs`,icon:d}),(0,C.jsx)(b,{variant:`status`,status:`info`,label:`square`,shape:`square`,size:`xs`,icon:d})]})},z={render:()=>(0,C.jsxs)(x,{children:[(0,C.jsx)(S,{title:`Dense field:value bands`,description:`Let compact metadata wrap across lines before switching to a table.`,children:(0,C.jsx)(`div`,{className:`rounded-lg border border-border bg-muted/40 p-density-3`,children:(0,C.jsx)(`div`,{className:`flex max-w-[28rem] flex-wrap gap-density-2`,children:O.map(([e,t])=>(0,C.jsx)(b,{variant:`label`,label:e,value:t,color:`#dbeafe`,textColor:`#1d4ed8`,size:`xxs`,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-medium text-foreground`},e))})})}),(0,C.jsx)(S,{title:`Wrapped xxs badges for long values`,description:`Use wrap when dense metadata must stay badge-shaped but long values cannot remain single-line.`,children:(0,C.jsx)(`div`,{className:`rounded-lg border border-border bg-muted/40 p-density-3`,children:(0,C.jsx)(`div`,{className:`flex max-w-[28rem] flex-wrap gap-density-2`,children:k.map(([e,t])=>(0,C.jsx)(b,{variant:`label`,label:e,value:t,color:e===`to`?`#dcfce7`:`#dbeafe`,textColor:e===`to`?`#15803d`:`#1d4ed8`,size:`xxs`,wrap:!0,maxWidth:20,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-mono text-foreground`},e))})})}),(0,C.jsx)(S,{title:`Truncation styles`,description:`Use maxWidth with semantic truncation modes when values must stay single-line but preserve the meaningful part.`,children:(0,C.jsx)(`div`,{className:`rounded-lg border border-border bg-muted/40 p-density-3`,children:(0,C.jsx)(`div`,{className:`flex max-w-[32rem] flex-wrap gap-density-2`,children:A.map(({label:e,value:t,truncate:n,maxWidth:r})=>(0,C.jsx)(b,{variant:`label`,label:e,value:t,color:`#dbeafe`,textColor:`#1d4ed8`,size:`xxs`,maxWidth:r,truncate:n,className:`bg-background`,labelClassName:`uppercase tracking-[0.03em]`,valueClassName:`font-mono text-foreground`},e))})})})]})},B={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`outlined`,label:`Docs`,size:`xs`,href:`https://flanksource.com`,target:`_blank`,borderColor:`#326ce5`,textColor:`#326ce5`}),(0,C.jsx)(b,{variant:`custom`,label:`release notes`,size:`xs`,href:`#release-notes`,color:`#f5f3ff`,textColor:`#6d28d9`,borderColor:`#ddd6fe`}),(0,C.jsx)(b,{variant:`label`,label:`run`,value:`3482`,size:`xs`,href:`#run-3482`,className:`bg-background`,color:`#dbeafe`,textColor:`#1d4ed8`})]})},V={render:()=>(0,C.jsxs)(x,{children:[(0,C.jsx)(`div`,{className:`rounded-lg border border-border bg-muted/40 p-density-3`,children:(0,C.jsxs)(`ul`,{className:`list-disc space-y-1 pl-4 text-sm text-foreground`,children:[(0,C.jsx)(`li`,{children:`Use badges for scan-friendly metadata and state, not for long explanations.`}),(0,C.jsx)(`li`,{children:`Reserve stronger color for semantics like risk, state, or workflow stage.`}),(0,C.jsx)(`li`,{children:'Prefer `size="xs"` for rows that mix prose with many metadata tokens.'}),(0,C.jsx)(`li`,{children:"Use split `label | value` badges when field names repeat across rows."}),(0,C.jsx)(`li`,{children:"Turn on `wrap` before adding one-off CSS for long metadata values."})]})}),(0,C.jsxs)(`div`,{className:`rounded-lg border border-border overflow-hidden`,children:[(0,C.jsxs)(`div`,{className:`grid grid-cols-[10rem_1fr_9rem] border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground`,children:[(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:`service`}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:`status`}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:`version`})]}),(0,C.jsxs)(`div`,{className:`grid grid-cols-[10rem_1fr_9rem] items-center border-b border-border/60 text-sm`,children:[(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:`api-gateway`}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:(0,C.jsx)(b,{variant:`status`,status:`success`,label:`Healthy`,value:`ready`,size:`xs`,icon:v})}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:(0,C.jsx)(b,{variant:`custom`,label:`v2.4.1`,size:`xs`,color:`#eef2ff`,textColor:`#4338ca`,borderColor:`#c7d2fe`})})]}),(0,C.jsxs)(`div`,{className:`grid grid-cols-[10rem_1fr_9rem] items-center text-sm`,children:[(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:`worker-pool`}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:(0,C.jsx)(b,{variant:`status`,status:`warning`,label:`Degraded`,value:`backpressure`,size:`xs`,icon:u})}),(0,C.jsx)(`div`,{className:`px-density-3 py-density-2`,children:(0,C.jsx)(b,{variant:`outlined`,label:`canary`,size:`xs`,borderColor:`#f59e0b`,textColor:`#b45309`})})]})]})]})},H={render:()=>(0,C.jsxs)(`div`,{className:`flex flex-wrap gap-density-2`,children:[(0,C.jsx)(b,{variant:`metric`,label:`CPU`,value:`42%`,icon:r,size:`xs`}),(0,C.jsx)(b,{variant:`metric`,label:`Memory`,value:`8.2 GB`,icon:o,size:`xs`}),(0,C.jsx)(b,{variant:`metric`,label:`Uptime`,value:`99.9%`,icon:l,size:`xs`}),(0,C.jsx)(b,{variant:`metric`,label:`Latency`,value:`12ms`,icon:h,size:`xs`}),(0,C.jsx)(b,{variant:`custom`,color:`#fdf2f8`,textColor:`#be185d`,label:`Production`,icon:_,size:`xs`}),(0,C.jsx)(b,{variant:`custom`,color:`#ecfdf5`,textColor:`#065f46`,label:`Secured`,icon:p,size:`xs`}),(0,C.jsx)(b,{variant:`custom`,color:`#fffbeb`,textColor:`#92400e`,label:`Beta`,icon:f,size:`xs`}),(0,C.jsx)(b,{variant:`custom`,color:`#eef2ff`,textColor:`#4338ca`,label:`v2.4.1`,icon:i,size:`xs`})]})},U=[`Playground`,`Overview`,`LegacyMatrix`,`StatusBadges`,`CustomOutlinedColors`,`LabelValueHooks`,`Sizes`,`Shapes`,`WrappedMetadata`,`Clickable`,`BestPractices`,`MixedUsage`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="success" label="Build" value="passing" icon={UiCheck} />
      <Badge variant="metric" label="Latency" value="45ms" icon={UiActivity} />
      <Badge variant="custom" label="v2.4.1" icon={UiGitBranch} color="#eef2ff" textColor="#4338ca" />
      <Badge variant="outlined" label="Kubernetes" icon={UiBoxes} borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="label" label="env" value="production" color="#dcfce7" textColor="#15803d" />
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      {STATUS_BADGES.map(({
      label,
      value,
      status,
      icon
    }) => <Badge key={label} variant="status" status={status} label={label} value={value} icon={icon} size="xs" />)}
    </div>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Kubernetes" icon={UiBoxes} borderColor="#326ce5" textColor="#326ce5" size="xs" />
      <Badge variant="outlined" label="Helm" icon={UiShipWheel} borderColor="#0f1689" textColor="#0f1689" size="xs" />
      <Badge variant="outlined" label="Flux" icon={UiZap} borderColor="#5468ff" textColor="#5468ff" size="xs" />
      <Badge variant="outlined" label="ArgoCD" icon={UiRoute} borderColor="#ef7b4d" textColor="#ef7b4d" size="xs" />
    </div>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <div className="rounded-lg border border-border bg-muted/40 p-density-3">
      <div className="flex flex-wrap gap-density-2">
        <Badge variant="label" label="container" value="incident-commander" color="#dbeafe" textColor="#1d4ed8" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-mono text-foreground" />
        <Badge variant="label" label="namespace" value="mc" color="#dcfce7" textColor="#15803d" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-semibold text-foreground" />
        <Badge variant="label" label="strategy" value="rolling" color="#ede9fe" textColor="#6d28d9" size="xs" className="bg-background" labelClassName="uppercase tracking-[0.03em]" valueClassName="font-medium text-foreground" />
      </div>
    </div>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-density-2">
      <Badge variant="status" status="success" label="xxs" size="xxs" icon={UiCheck} />
      <Badge variant="status" status="success" label="xs" size="xs" icon={UiCheck} />
      <Badge variant="status" status="success" label="sm" size="sm" icon={UiCheck} />
      <Badge variant="status" status="success" label="md" size="md" icon={UiCheck} />
      <Badge variant="status" status="success" label="lg" size="lg" icon={UiCheck} />
    </div>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="info" label="pill" shape="pill" size="xs" icon={UiShieldCheck} />
      <Badge variant="status" status="info" label="rounded" shape="rounded" size="xs" icon={UiShieldCheck} />
      <Badge variant="status" status="info" label="square" shape="square" size="xs" icon={UiShieldCheck} />
    </div>
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Docs" size="xs" href="https://flanksource.com" target="_blank" borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="custom" label="release notes" size="xs" href="#release-notes" color="#f5f3ff" textColor="#6d28d9" borderColor="#ddd6fe" />
      <Badge variant="label" label="run" value="3482" size="xs" href="#run-3482" className="bg-background" color="#dbeafe" textColor="#1d4ed8" />
    </div>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}}})))()}W();export{V as BestPractices,B as Clickable,F as CustomOutlinedColors,I as LabelValueHooks,N as LegacyMatrix,H as MixedUsage,M as Overview,j as Playground,R as Shapes,L as Sizes,P as StatusBadges,z as WrappedMetadata,U as __namedExportsOrder,w as default};
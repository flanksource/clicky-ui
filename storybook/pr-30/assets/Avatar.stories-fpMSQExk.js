import{j as e}from"./iframe-ChhGfndY.js";import{A as i,a as q,f as H}from"./AvatarBadge-DhUux0X7.js";import{u as P,r as g}from"./Icon-CYeB20F_.js";import{U as W}from"./UiClose-DcGXWzrE.js";import{U as L}from"./UiHourglass-DcZI042s.js";import{U as F}from"./UiCheck-NmGBycic.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";const n=[{full:"Chen, Nora",email:"nora.chen@example.com",initials:"CN"},{full:"Singh, Tara",email:"tara.singh@example.com",initials:"ST"},{full:"Martinez, Theo",email:"theo.martinez@example.com",initials:"MT"},{full:"Architecture Runway Team",email:"[CORP]\\Architecture Runway Team",initials:"AR",kind:"group"},{full:"QA Group",email:"[CORP]\\QA",initials:"QA",kind:"group"}],h=[{title:"Duotone",variant:"duotone",description:"Soft tint and colored type. Best general-purpose default for people and groups."},{title:"Solid",variant:"solid",description:"Dense monogram badge with stronger presence when the avatar needs to carry more weight."},{title:"Stamp",variant:"stamp",description:"Mono-leaning approval mark with a slight rotation for report and workflow contexts."},{title:"Mono",variant:"mono",description:"Editorial box treatment for tables, printouts, and dense review surfaces."}],Q={approved:{icon:F,cellBg:"bg-emerald-50/80",tone:"emerald"},pending:{icon:L,cellBg:"bg-amber-50/85",tone:"amber"},rejected:{icon:W,cellBg:"bg-rose-50/85",tone:"rose"}},V=[{state:"approved",user:n[0]},{state:"pending",user:n[1]},{state:"rejected",user:n[2]}],J=[{state:"approved",user:n[0],comment:"Approved after smoke tests passed."},{state:"pending",user:n[1],comment:"Waiting on the database migration sign-off, release notes review, and confirmation that the linked change request has the required evidence attached."}];function X(a,t){const s=a.kind??"user",r=H(a.full)%360;return s==="group"?t==="solid"?"#d8d4cc":t==="stamp"||t==="mono"?"#8d8778":"#b8b3a7":t==="solid"?`oklch(0.55 0.12 ${r})`:t==="stamp"?`oklch(0.42 0.15 ${r})`:t==="mono"?"#1a1a1a":`oklch(0.55 0.14 ${r} / 0.25)`}function v({comment:a,state:t,user:s,variant:r,size:K="sm"}){const x=Q[t],O=X(s,r);return e.jsx(q,{alt:s.full,avatarKind:s.kind??"user",avatarVariant:r,badgeClassName:x.cellBg,borderColor:O,size:K,statusIcon:x.icon,statusTitle:t,statusTone:x.tone,title:s.full,...a!==void 0?{comment:a}:{},...s.initials!==void 0?{initials:s.initials}:{}})}const le={title:"Data/Avatar",component:i,args:{alt:"Chen, Nora",initials:"CN",size:"md",variant:"duotone",kind:"user"},argTypes:{size:{description:"Density-aware size token.",control:"inline-radio",options:["xs","sm","md","lg","xl"]},variant:{description:"Fallback visual style used when no image is available.",control:"inline-radio",options:h.map(a=>a.variant)},kind:{description:"Identity type. Group avatars use a quieter neutral fallback palette.",control:"inline-radio",options:["user","group"]},rounded:{description:"Avatar corner treatment.",control:"inline-radio",options:["full","md"]}},parameters:{layout:"padded",docs:{description:{component:"Density-aware avatar for users, groups, repositories, and stage-like identities. It renders an image when available and falls back to deterministic initials with selectable visual styles."}}}};function _({user:a,variant:t,size:s="md"}){return e.jsxs("div",{className:"flex min-w-0 items-center gap-2",children:[e.jsx(i,{alt:a.full,initials:a.initials,kind:a.kind??"user",size:s,title:a.full,variant:t}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:a.full}),e.jsx("div",{className:"truncate font-mono text-[11px] text-muted-foreground",children:a.email})]})]})}function Y({description:a,title:t,variant:s}){return e.jsxs("div",{className:"flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-4",children:[e.jsxs("div",{className:"space-y-1 border-b border-border pb-3",children:[e.jsx("div",{className:"text-sm font-semibold text-foreground",children:t}),e.jsx("div",{className:"text-xs leading-5 text-muted-foreground",children:a})]}),e.jsx("div",{className:"grid gap-3 md:grid-cols-2",children:n.map(r=>e.jsx(_,{user:r,variant:s},`${s}-${r.initials}`))}),e.jsxs("div",{className:"rounded-md border border-dashed border-border bg-muted/40 p-3",children:[e.jsx("div",{className:"mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",children:"In a stage cell"}),e.jsx("div",{className:"space-y-2",children:V.map(r=>e.jsx(v,{...r.comment!==void 0?{comment:r.comment}:{},state:r.state,user:r.user,variant:s},`${s}-${r.state}`))})]})]})}const o={},d={render:()=>e.jsxs("div",{className:"space-y-5",children:[e.jsxs("div",{className:"max-w-2xl space-y-1",children:[e.jsx("div",{className:"font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground",children:"Exploration · Option Set A"}),e.jsx("h2",{className:"text-2xl font-semibold tracking-tight text-foreground",children:"User representation"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Shared avatar variants derived from the pipeline-report exploration sheet. The component keeps one API while letting Storybook show the distinct visual tones."})]}),e.jsx("div",{className:"grid gap-4 xl:grid-cols-2",children:h.map(a=>e.jsx(Y,{description:a.description,title:a.title,variant:a.variant},a.variant))})]})},l={render:()=>e.jsxs("div",{className:"grid max-w-4xl gap-4 lg:grid-cols-[1.2fr_0.8fr]",children:[e.jsxs("div",{className:"space-y-3 rounded-lg border border-border bg-card p-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("div",{className:"font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",children:"Deployment report"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"The duotone fallback is the default. Stamp and mono variants support denser review surfaces."})]}),e.jsx("div",{className:"space-y-2",children:n.map(a=>e.jsxs("div",{className:"flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2",children:[e.jsx(_,{user:a,variant:"duotone"}),e.jsx("span",{className:"font-mono text-[11px] uppercase tracking-wide text-muted-foreground",children:a.kind?"group":"submitter"})]},a.initials))})]}),e.jsxs("div",{className:"space-y-3 rounded-lg border border-border bg-card p-4",children:[e.jsx("div",{className:"font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",children:"Approval lane"}),e.jsx("div",{className:"space-y-2",children:n.slice(0,3).map(a=>e.jsxs("div",{className:"flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2",children:[e.jsx(i,{alt:a.full,initials:a.initials,size:"sm",title:a.full,variant:"stamp"}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-medium text-foreground",children:a.full}),e.jsx("div",{className:"font-mono text-[11px] text-muted-foreground",children:"approved · 14:32"})]})]},a.initials))}),e.jsxs("div",{className:"rounded-md border border-border bg-background p-3",children:[e.jsx("div",{className:"mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",children:"Compact list"}),e.jsx("div",{className:"space-y-2",children:n.map(a=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(i,{alt:a.full,initials:a.initials,kind:a.kind??"user",size:"sm",title:a.full,variant:"mono"}),e.jsx("span",{className:"truncate text-sm text-foreground",children:a.full})]},`mono-${a.initials}`))})]})]})]})};function Z(){const a=P();return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"max-w-2xl space-y-1",children:[e.jsx("div",{className:"font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground",children:"Stage cell · size scaling"}),e.jsx("h2",{className:"text-2xl font-semibold tracking-tight text-foreground",children:"Badge-style icons scale with the row"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["The trailing status is rendered via ",e.jsx("code",{children:'<Icon style="badge" />'}),". Pass the same size token used by the neighbouring avatar and the chip, glyph, and row height stay in proportion."]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",children:"comments"}),e.jsx("div",{className:"space-y-3",children:J.map(t=>e.jsx(v,{comment:t.comment,state:t.state,user:t.user,variant:"duotone"},`comment-${t.state}`))})]}),["xs","sm","md","lg","xl"].map(t=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",children:["size = ",t," (",g(t,a),"px · ",a,")"]}),e.jsx("div",{className:"space-y-2",children:V.map(s=>e.jsx(v,{state:s.state,user:s.user,variant:"duotone",size:t},`${t}-${s.state}`))})]},t))]})]})}const c={render:()=>e.jsx(Z,{})},m={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx(i,{alt:"flanksource/clicky-ui",colorKey:"flanksource/clicky-ui",rounded:"md",size:"md",variant:"duotone"}),e.jsx(i,{alt:"other-org/clicky-ui",colorKey:"other-org/clicky-ui",rounded:"md",size:"md",variant:"solid"}),e.jsx(i,{alt:"internal/release-service",colorKey:"internal/release-service",rounded:"md",size:"md",variant:"mono"})]})},p={args:{alt:"GitHub reviewers",href:"https://github.com",initials:"GH",size:"md",variant:"stamp"}};function ee(){const a=P();return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"max-w-2xl space-y-1",children:[e.jsx("div",{className:"font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground",children:"Size scale · name pairing"}),e.jsx("h2",{className:"text-2xl font-semibold tracking-tight text-foreground",children:"Avatar sizes with companion text"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Each row pairs the avatar with the identity label sized so the glyph is only a touch taller than the cap height (font-size ≈ 85% of the avatar box)."})]}),e.jsx("div",{className:"space-y-3",children:["xs","sm","md","lg","xl"].map(t=>{const s=g(t,a);return e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(i,{alt:"Chen, Nora",initials:"CN",size:t,variant:"duotone"}),e.jsx("span",{className:"font-medium leading-none text-foreground",style:{fontSize:Math.round(s*.85)},children:"Chen, Nora"}),e.jsxs("span",{className:"font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",children:[t," · ",s,"px"]})]},t)})}),e.jsx("div",{className:"grid gap-6 md:grid-cols-2 xl:grid-cols-4",children:h.map(t=>e.jsxs("div",{className:"space-y-3 rounded-lg border border-border bg-card p-4",children:[e.jsxs("div",{className:"space-y-1 border-b border-border pb-2",children:[e.jsx("div",{className:"text-sm font-semibold text-foreground",children:t.title}),e.jsx("div",{className:"text-xs leading-5 text-muted-foreground",children:t.description})]}),["xs","sm","md","lg","xl"].map(s=>{const r=g(s,a);return e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(i,{alt:"Chen, Nora",initials:"CN",size:s,variant:t.variant}),e.jsx("span",{className:"font-medium leading-none text-foreground",style:{fontSize:Math.round(r*.85)},children:"Chen, Nora"})]},`${t.variant}-${s}`)})]},t.variant))})]})}const u={render:()=>e.jsx(ee,{})};var f,N,b;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:"{}",...(b=(N=o.parameters)==null?void 0:N.docs)==null?void 0:b.source}}};var j,k,y;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div className="space-y-5">
      <div className="max-w-2xl space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Exploration · Option Set A
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          User representation
        </h2>
        <p className="text-sm text-muted-foreground">
          Shared avatar variants derived from the pipeline-report exploration sheet. The component
          keeps one API while letting Storybook show the distinct visual tones.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {VARIANTS.map(entry => <ExplorationCard key={entry.variant} description={entry.description} title={entry.title} variant={entry.variant} />)}
      </div>
    </div>
}`,...(y=(k=d.parameters)==null?void 0:k.docs)==null?void 0:y.source}}};var S,w,A;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="grid max-w-4xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Deployment report
          </div>
          <div className="text-sm text-muted-foreground">
            The duotone fallback is the default. Stamp and mono variants support denser review
            surfaces.
          </div>
        </div>

        <div className="space-y-2">
          {USERS.map(user => <div key={user.initials} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
              <SampleLine user={user} variant="duotone" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {user.kind ? "group" : "submitter"}
              </span>
            </div>)}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Approval lane
        </div>
        <div className="space-y-2">
          {USERS.slice(0, 3).map(user => <div key={user.initials} className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
              <Avatar alt={user.full} initials={user.initials} size="sm" title={user.full} variant="stamp" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{user.full}</div>
                <div className="font-mono text-[11px] text-muted-foreground">approved · 14:32</div>
              </div>
            </div>)}
        </div>

        <div className="rounded-md border border-border bg-background p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Compact list
          </div>
          <div className="space-y-2">
            {USERS.map(user => <div key={\`mono-\${user.initials}\`} className="flex items-center gap-2">
                <Avatar alt={user.full} initials={user.initials} kind={user.kind ?? "user"} size="sm" title={user.full} variant="mono" />
                <span className="truncate text-sm text-foreground">{user.full}</span>
              </div>)}
          </div>
        </div>
      </div>
    </div>
}`,...(A=(w=l.parameters)==null?void 0:w.docs)==null?void 0:A.source}}};var z,C,T;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <StageSizesView />
}`,...(T=(C=c.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};var E,R,$;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3">
      <Avatar alt="flanksource/clicky-ui" colorKey="flanksource/clicky-ui" rounded="md" size="md" variant="duotone" />
      <Avatar alt="other-org/clicky-ui" colorKey="other-org/clicky-ui" rounded="md" size="md" variant="solid" />
      <Avatar alt="internal/release-service" colorKey="internal/release-service" rounded="md" size="md" variant="mono" />
    </div>
}`,...($=(R=m.parameters)==null?void 0:R.docs)==null?void 0:$.source}}};var U,I,G;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    alt: "GitHub reviewers",
    href: "https://github.com",
    initials: "GH",
    size: "md",
    variant: "stamp"
  }
}`,...(G=(I=p.parameters)==null?void 0:I.docs)==null?void 0:G.source}}};var B,D,M;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <SizesWithNamesView />
}`,...(M=(D=u.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};const ce=["InitialFallback","Exploration","PipelineContext","StageSizes","SquareRepositories","Linked","SizesWithNames"];export{d as Exploration,o as InitialFallback,p as Linked,l as PipelineContext,u as SizesWithNames,m as SquareRepositories,c as StageSizes,ce as __namedExportsOrder,le as default};

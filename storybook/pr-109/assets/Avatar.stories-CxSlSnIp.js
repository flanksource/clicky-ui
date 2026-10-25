import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{s as n,u as r}from"./icon-fallback-DytHJMW_.js";import{Tr as i,Tu as a,n as o,xs as s}from"./icons-N6BqLuiz.js";import{a as c,o as l}from"./Icon-Drf4m9fW.js";import{i as u,n as d,r as f,t as p}from"./Avatar-DBeGjWve.js";import{n as m,t as h}from"./AvatarBadge-BFb042Bw.js";function g(e,t){let n=e.kind??`user`,r=f(e.full)%360;return n===`group`?t===`solid`?`#d8d4cc`:t===`stamp`||t===`mono`?`#8d8778`:`#b8b3a7`:t===`solid`?`oklch(0.55 0.12 ${r})`:t===`stamp`?`oklch(0.42 0.15 ${r})`:t===`mono`?`#1a1a1a`:`oklch(0.55 0.14 ${r} / 0.25)`}function _({comment:e,state:t,user:n,variant:r,size:i=`sm`}){let a=T[t],o=g(n,r);return(0,S.jsx)(h,{alt:n.full,avatarKind:n.kind??`user`,avatarVariant:r,badgeClassName:a.cellBg,borderColor:o,size:i,statusIcon:a.icon,statusTitle:t,statusTone:a.tone,title:n.full,...e===void 0?{}:{comment:e},...n.initials===void 0?{}:{initials:n.initials}})}function v({user:e,variant:t,size:n=`md`}){return(0,S.jsxs)(`div`,{className:`flex min-w-0 items-center gap-2`,children:[(0,S.jsx)(p,{alt:e.full,initials:e.initials,kind:e.kind??`user`,size:n,title:e.full,variant:t}),(0,S.jsxs)(`div`,{className:`min-w-0`,children:[(0,S.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:e.full}),(0,S.jsx)(`div`,{className:`truncate font-mono text-[11px] text-muted-foreground`,children:e.email})]})]})}function y({description:e,title:t,variant:n}){return(0,S.jsxs)(`div`,{className:`flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-4`,children:[(0,S.jsxs)(`div`,{className:`space-y-1 border-b border-border pb-3`,children:[(0,S.jsx)(`div`,{className:`text-sm font-semibold text-foreground`,children:t}),(0,S.jsx)(`div`,{className:`text-xs leading-5 text-muted-foreground`,children:e})]}),(0,S.jsx)(`div`,{className:`grid gap-3 md:grid-cols-2`,children:C.map(e=>(0,S.jsx)(v,{user:e,variant:n},`${n}-${e.initials}`))}),(0,S.jsxs)(`div`,{className:`rounded-md border border-dashed border-border bg-muted/40 p-3`,children:[(0,S.jsx)(`div`,{className:`mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground`,children:`In a stage cell`}),(0,S.jsx)(`div`,{className:`space-y-2`,children:E.map(e=>(0,S.jsx)(_,{...e.comment===void 0?{}:{comment:e.comment},state:e.state,user:e.user,variant:n},`${n}-${e.state}`))})]})]})}function b(){let e=r();return(0,S.jsxs)(`div`,{className:`space-y-6`,children:[(0,S.jsxs)(`div`,{className:`max-w-2xl space-y-1`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground`,children:`Stage cell · size scaling`}),(0,S.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-foreground`,children:`Badge-style icons scale with the row`}),(0,S.jsxs)(`p`,{className:`text-sm text-muted-foreground`,children:[`The trailing status is rendered via `,(0,S.jsx)(`code`,{children:`<Icon style="badge" />`}),`. Pass the same size token used by the neighbouring avatar and the chip, glyph, and row height stay in proportion.`]})]}),(0,S.jsxs)(`div`,{className:`space-y-4`,children:[(0,S.jsxs)(`div`,{className:`space-y-2`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground`,children:`comments`}),(0,S.jsx)(`div`,{className:`space-y-3`,children:D.map(e=>(0,S.jsx)(_,{comment:e.comment,state:e.state,user:e.user,variant:`duotone`},`comment-${e.state}`))})]}),[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,S.jsxs)(`div`,{className:`space-y-2`,children:[(0,S.jsxs)(`div`,{className:`font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground`,children:[`size = `,t,` (`,l(t,e),`px · `,e,`)`]}),(0,S.jsx)(`div`,{className:`space-y-2`,children:E.map(e=>(0,S.jsx)(_,{state:e.state,user:e.user,variant:`duotone`,size:t},`${t}-${e.state}`))})]},t))]})]})}function x(){let e=r();return(0,S.jsxs)(`div`,{className:`space-y-8`,children:[(0,S.jsxs)(`div`,{className:`max-w-2xl space-y-1`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground`,children:`Size scale · name pairing`}),(0,S.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-foreground`,children:`Avatar sizes with companion text`}),(0,S.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Each row pairs the avatar with the identity label sized so the glyph is only a touch taller than the cap height (font-size ≈ 85% of the avatar box).`})]}),(0,S.jsx)(`div`,{className:`space-y-3`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>{let n=l(t,e);return(0,S.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,S.jsx)(p,{alt:`Chen, Nora`,initials:`CN`,size:t,variant:`duotone`}),(0,S.jsx)(`span`,{className:`font-medium leading-none text-foreground`,style:{fontSize:Math.round(n*.85)},children:`Chen, Nora`}),(0,S.jsxs)(`span`,{className:`font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground`,children:[t,` · `,n,`px`]})]},t)})}),(0,S.jsx)(`div`,{className:`grid gap-6 md:grid-cols-2 xl:grid-cols-4`,children:w.map(t=>(0,S.jsxs)(`div`,{className:`space-y-3 rounded-lg border border-border bg-card p-4`,children:[(0,S.jsxs)(`div`,{className:`space-y-1 border-b border-border pb-2`,children:[(0,S.jsx)(`div`,{className:`text-sm font-semibold text-foreground`,children:t.title}),(0,S.jsx)(`div`,{className:`text-xs leading-5 text-muted-foreground`,children:t.description})]}),[`xs`,`sm`,`md`,`lg`,`xl`].map(n=>{let r=l(n,e);return(0,S.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,S.jsx)(p,{alt:`Chen, Nora`,initials:`CN`,size:n,variant:t.variant}),(0,S.jsx)(`span`,{className:`font-medium leading-none text-foreground`,style:{fontSize:Math.round(r*.85)},children:`Chen, Nora`})]},`${t.variant}-${n}`)})]},t.variant))})]})}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{d(),m(),o(),u(),c(),n(),S=t(),C=[{full:`Chen, Nora`,email:`nora.chen@example.com`,initials:`CN`},{full:`Singh, Tara`,email:`tara.singh@example.com`,initials:`ST`},{full:`Martinez, Theo`,email:`theo.martinez@example.com`,initials:`MT`},{full:`Architecture Runway Team`,email:`[CORP]\\Architecture Runway Team`,initials:`AR`,kind:`group`},{full:`QA Group`,email:`[CORP]\\QA`,initials:`QA`,kind:`group`}],w=[{title:`Duotone`,variant:`duotone`,description:`Soft tint and colored type. Best general-purpose default for people and groups.`},{title:`Solid`,variant:`solid`,description:`Dense monogram badge with stronger presence when the avatar needs to carry more weight.`},{title:`Stamp`,variant:`stamp`,description:`Mono-leaning approval mark with a slight rotation for report and workflow contexts.`},{title:`Mono`,variant:`mono`,description:`Editorial box treatment for tables, printouts, and dense review surfaces.`}],T={approved:{icon:s,cellBg:`bg-emerald-50/80`,tone:`emerald`},pending:{icon:i,cellBg:`bg-amber-50/85`,tone:`amber`},rejected:{icon:a,cellBg:`bg-rose-50/85`,tone:`rose`}},E=[{state:`approved`,user:C[0]},{state:`pending`,user:C[1]},{state:`rejected`,user:C[2]}],D=[{state:`approved`,user:C[0],comment:`Approved after smoke tests passed.`},{state:`pending`,user:C[1],comment:`Waiting on the database migration sign-off, release notes review, and confirmation that the linked change request has the required evidence attached.`}],O={title:`Data/Avatar`,component:p,args:{alt:`Chen, Nora`,initials:`CN`,size:`md`,variant:`duotone`,kind:`user`},argTypes:{size:{description:`Density-aware size token.`,control:`inline-radio`,options:[`xs`,`sm`,`md`,`lg`,`xl`]},variant:{description:`Fallback visual style used when no image is available.`,control:`inline-radio`,options:w.map(e=>e.variant)},kind:{description:`Identity type. Group avatars use a quieter neutral fallback palette.`,control:`inline-radio`,options:[`user`,`group`]},rounded:{description:`Avatar corner treatment.`,control:`inline-radio`,options:[`full`,`md`]}},parameters:{layout:`padded`,docs:{description:{component:`Density-aware avatar for users, groups, repositories, and stage-like identities. It renders an image when available and falls back to deterministic initials with selectable visual styles.`}}}},k={},A={render:()=>(0,S.jsxs)(`div`,{className:`space-y-5`,children:[(0,S.jsxs)(`div`,{className:`max-w-2xl space-y-1`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground`,children:`Exploration · Option Set A`}),(0,S.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-foreground`,children:`User representation`}),(0,S.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Shared avatar variants derived from the pipeline-report exploration sheet. The component keeps one API while letting Storybook show the distinct visual tones.`})]}),(0,S.jsx)(`div`,{className:`grid gap-4 xl:grid-cols-2`,children:w.map(e=>(0,S.jsx)(y,{description:e.description,title:e.title,variant:e.variant},e.variant))})]})},j={render:()=>(0,S.jsxs)(`div`,{className:`grid max-w-4xl gap-4 lg:grid-cols-[1.2fr_0.8fr]`,children:[(0,S.jsxs)(`div`,{className:`space-y-3 rounded-lg border border-border bg-card p-4`,children:[(0,S.jsxs)(`div`,{className:`space-y-1`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground`,children:`Deployment report`}),(0,S.jsx)(`div`,{className:`text-sm text-muted-foreground`,children:`The duotone fallback is the default. Stamp and mono variants support denser review surfaces.`})]}),(0,S.jsx)(`div`,{className:`space-y-2`,children:C.map(e=>(0,S.jsxs)(`div`,{className:`flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2`,children:[(0,S.jsx)(v,{user:e,variant:`duotone`}),(0,S.jsx)(`span`,{className:`font-mono text-[11px] uppercase tracking-wide text-muted-foreground`,children:e.kind?`group`:`submitter`})]},e.initials))})]}),(0,S.jsxs)(`div`,{className:`space-y-3 rounded-lg border border-border bg-card p-4`,children:[(0,S.jsx)(`div`,{className:`font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground`,children:`Approval lane`}),(0,S.jsx)(`div`,{className:`space-y-2`,children:C.slice(0,3).map(e=>(0,S.jsxs)(`div`,{className:`flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2`,children:[(0,S.jsx)(p,{alt:e.full,initials:e.initials,size:`sm`,title:e.full,variant:`stamp`}),(0,S.jsxs)(`div`,{className:`min-w-0`,children:[(0,S.jsx)(`div`,{className:`truncate text-sm font-medium text-foreground`,children:e.full}),(0,S.jsx)(`div`,{className:`font-mono text-[11px] text-muted-foreground`,children:`approved · 14:32`})]})]},e.initials))}),(0,S.jsxs)(`div`,{className:`rounded-md border border-border bg-background p-3`,children:[(0,S.jsx)(`div`,{className:`mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground`,children:`Compact list`}),(0,S.jsx)(`div`,{className:`space-y-2`,children:C.map(e=>(0,S.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,S.jsx)(p,{alt:e.full,initials:e.initials,kind:e.kind??`user`,size:`sm`,title:e.full,variant:`mono`}),(0,S.jsx)(`span`,{className:`truncate text-sm text-foreground`,children:e.full})]},`mono-${e.initials}`))})]})]})]})},M={render:()=>(0,S.jsx)(b,{})},N={render:()=>(0,S.jsxs)(`div`,{className:`flex flex-wrap gap-3`,children:[(0,S.jsx)(p,{alt:`flanksource/clicky-ui`,colorKey:`flanksource/clicky-ui`,rounded:`md`,size:`md`,variant:`duotone`}),(0,S.jsx)(p,{alt:`other-org/clicky-ui`,colorKey:`other-org/clicky-ui`,rounded:`md`,size:`md`,variant:`solid`}),(0,S.jsx)(p,{alt:`internal/release-service`,colorKey:`internal/release-service`,rounded:`md`,size:`md`,variant:`mono`})]})},P={args:{alt:`GitHub reviewers`,href:`https://github.com`,initials:`GH`,size:`md`,variant:`stamp`}},F={render:()=>(0,S.jsx)(x,{})},I=[`InitialFallback`,`Exploration`,`PipelineContext`,`StageSizes`,`SquareRepositories`,`Linked`,`SizesWithNames`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <StageSizesView />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3">
      <Avatar alt="flanksource/clicky-ui" colorKey="flanksource/clicky-ui" rounded="md" size="md" variant="duotone" />
      <Avatar alt="other-org/clicky-ui" colorKey="other-org/clicky-ui" rounded="md" size="md" variant="solid" />
      <Avatar alt="internal/release-service" colorKey="internal/release-service" rounded="md" size="md" variant="mono" />
    </div>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    alt: "GitHub reviewers",
    href: "https://github.com",
    initials: "GH",
    size: "md",
    variant: "stamp"
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <SizesWithNamesView />
}`,...F.parameters?.docs?.source}}}})))()}L();export{A as Exploration,k as InitialFallback,P as Linked,j as PipelineContext,F as SizesWithNames,N as SquareRepositories,M as StageSizes,I as __namedExportsOrder,O as default};
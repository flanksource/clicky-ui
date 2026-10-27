import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{dt as n,eo as r,ht as i,lt as a,n as o,no as s,pt as c,r as l,st as u,t as d}from"./icons-N6BqLuiz.js";function f(e){return typeof e==`function`&&`__source`in e&&`__group`in e&&`__consumerName`in e}function p({group:e,query:t,size:n,showSource:r,showStats:i,filledOnly:a,showAliases:o}){let s=t.trim().toLowerCase(),c=b.map(([t,n])=>[t,n.filter(t=>{let n=e===`all`||t.group===e,r=!a||t.name.endsWith(`Filled`),i=s.length===0||t.name.toLowerCase().includes(s)||t.consumerName.toLowerCase().includes(s)||t.source.toLowerCase().includes(s);return n&&r&&i})]).filter(([,e])=>e.length>0);return o?(0,_.jsx)(g,{size:n}):(0,_.jsxs)(`div`,{className:`space-y-6`,children:[i&&(0,_.jsxs)(`div`,{className:`grid gap-3 sm:grid-cols-2 lg:grid-cols-4`,children:[(0,_.jsx)(m,{label:`components`,value:y.length}),(0,_.jsx)(m,{label:`groups`,value:b.length}),(0,_.jsx)(m,{label:`filled variants`,value:y.filter(e=>e.name.endsWith(`Filled`)).length}),(0,_.jsx)(m,{label:`change aliases`,value:Object.keys(l).length})]}),c.map(([e,t])=>(0,_.jsxs)(`section`,{className:`space-y-2`,children:[(0,_.jsxs)(`header`,{className:`flex items-baseline justify-between gap-3`,children:[(0,_.jsx)(`h2`,{className:`text-sm font-semibold`,children:v[e]??e}),(0,_.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:t.length})]}),(0,_.jsx)(`div`,{className:`grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`,children:t.map(e=>(0,_.jsx)(h,{icon:e,showSource:r,size:n},e.name))})]},e))]})}function m({label:e,value:t}){return(0,_.jsxs)(`div`,{className:`rounded border border-border bg-muted/30 p-3`,children:[(0,_.jsx)(`div`,{className:`text-2xl font-semibold`,children:t}),(0,_.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:e})]})}function h({icon:e,showSource:t,size:n}){let r=e.component;return(0,_.jsxs)(`div`,{className:`flex min-w-0 items-center gap-2 rounded border border-border bg-background px-2 py-1.5`,children:[(0,_.jsx)(r,{size:n,className:`shrink-0 text-foreground`,title:e.name}),(0,_.jsxs)(`div`,{className:`min-w-0 leading-tight`,children:[(0,_.jsx)(`div`,{className:`truncate font-mono text-[11px] text-foreground`,children:e.name}),t&&(0,_.jsx)(`div`,{className:`truncate text-[10px] text-muted-foreground`,children:e.source})]})]})}function g({size:e}){return(0,_.jsx)(`div`,{className:`grid gap-2 sm:grid-cols-2 lg:grid-cols-3`,children:Object.entries(l).map(([t,n])=>{let r=n.outline,i=n.filled;return(0,_.jsxs)(`div`,{className:`flex min-w-0 items-center gap-3 rounded border border-border bg-background px-3 py-2`,children:[(0,_.jsxs)(`div`,{className:`flex items-center gap-1 text-foreground`,children:[(0,_.jsx)(r,{size:e,title:`${t} outline`}),i&&(0,_.jsx)(i,{size:e,title:`${t} filled`})]}),(0,_.jsx)(`code`,{className:`truncate text-xs text-muted-foreground`,children:t})]},t)})})}var _,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{o(),_=t(),v={"ui-controls":`UI controls`,navigation:`Navigation`,"layout-dashboard":`Layout & dashboard`,"forms-editing":`Forms & editing`,"health-status":`Health & status`,"approval-review":`Approval & review`,"security-auth":`Security & auth`,severity:`Severity`,insight:`Insight`,"trees-lists-tables":`Trees, lists & tables`,"data-analytics":`Data & analytics`,"playbooks-workflows":`Playbooks & workflows`,"runtime-process":`Runtime & process`,"configs-metadata":`Configs & metadata`,"uir-ast-code":`UIR / AST code`,"uir-sql":`UIR / SQL`,"tracing-observability":`Tracing & observability`,debugging:`Debugging`,messaging:`Messaging`,aop:`AOP`,language:`Languages`,jpa:`JPA`,kubernetes:`Kubernetes`,programming:`Programming`,"files-code":`Files & code`,"git-source-control":`Git & source control`,"dev-tools":`Dev tools`,"ai-ml":`AI & ML`,infrastructure:`Infrastructure`,"actions-tools":`Actions & tools`,"people-orgs":`People & orgs`,time:`Time`,communication:`Communication`,media:`Media`},y=Object.entries(d).filter(e=>f(e[1])).map(([e,t])=>({name:e,component:t,group:t.__group,consumerName:t.__consumerName,source:t.__source})).sort((e,t)=>e.group.localeCompare(t.group)||e.name.localeCompare(t.name)),b=Object.entries(y.reduce((e,t)=>((e[t.group]??=[]).push(t),e),{})).sort(([e],[t])=>e.localeCompare(t)),x={title:`Foundations/Generated Icons`,component:p,args:{group:`all`,query:``,size:18,showSource:!0,showStats:!0,filledOnly:!1,showAliases:!1},argTypes:{group:{control:`select`,options:[`all`,...b.map(([e])=>e)],description:"Filter the gallery to a single semantic group, or `all`.",table:{category:`Filter`}},query:{control:`text`,description:`Case-insensitive substring matched against the component name, consumer name, and source.`,table:{category:`Filter`}},filledOnly:{control:`boolean`,description:"Show only the `*Filled` solid variants.",table:{category:`Filter`}},size:{control:{type:`number`,min:12,max:48,step:1},description:`Pixel size passed to each rendered icon.`,table:{category:`Display`}},showSource:{control:`boolean`,description:`Show the underlying source name under each icon.`,table:{category:`Display`}},showStats:{control:`boolean`,description:`Show the summary counts (components, groups, filled variants).`,table:{category:`Display`}},showAliases:{control:`boolean`,description:`Switch to the change-alias view pairing outline and filled icons by change type.`,table:{category:`Display`}}},parameters:{docs:{description:{component:'Generated React icon components exported from `@flanksource/clicky-ui/icons`.\n\n**What this is**\n- Every icon is a tree-shakeable React component (`UiCheck`, `UiActivity`, …) generated from `icon-selections.json` and grouped by purpose (health, navigation, infra, …).\n- Components carry metadata (`__group`, `__source`, `__consumerName`) used to build this searchable gallery.\n\n**Usage**\n```tsx\nimport { UiCheck, UiActivity } from "@flanksource/clicky-ui/icons";\n\n<UiCheck size={18} className="text-emerald-600" title="healthy" />\n```\n- Prefer the imported component for built-in icons; pass runtime string names only for user-supplied data (handled by a registered fallback provider — see `Data/Icon`).\n- `*Filled` variants are solid; use the **Filled only** control to browse them. **Change aliases** pairs outline/filled icons by change type.\n\nUse the controls panel to filter by **group**, full-text **query**, and adjust **size**.'}}}},S={args:{showAliases:!1}},C={name:`JetBrains catalog`,args:{group:`all`,query:`jb-`,size:20,showSource:!0,showStats:!1,showAliases:!1},parameters:{docs:{description:{story:"IntelliJ Platform SVGs selected from the JetBrains icon catalog and downloaded archives. This gallery filters the generated offline components by their `jb-` source and shows the source identifier under each icon. Downloaded sources marked `jb-download-unverified:` have no embedded Apache header."}}}},w={name:`Programming variants`,args:{group:`programming`,query:``,size:20,showSource:!0,showStats:!1,showAliases:!1},parameters:{docs:{description:{story:"Programming symbols imported from paired light and dark JetBrains SVG downloads. The `Dark` suffix identifies the artwork intended for dark surfaces; the playground groups these exports by concept and variation and marks pairs without an embedded Apache header."}}}},T={args:{showAliases:!0,showStats:!1}},E=[{component:i,name:`Stack trace`,description:`Connected runtime call frames.`},{component:c,name:`CPU profile`,description:`Sampled execution tiers and a narrow hotspot.`},{component:a,name:`Memory profile`,description:`Heap allocations and an available slot.`},{component:n,name:`Audit log`,description:`Chronological entries ending in verification.`},{component:u,name:`Database event stream`,description:`Stored records emitting engine events / SQL XEvents.`}],D={parameters:{controls:{disable:!0},docs:{description:{story:'Five original icons using the blue and gray stroke/fill palette of UiClass and UiNamespace, with a 24×24 viewBox and a 1.5-unit stroke. Each row compares actual 16, 20, and 24px sizes; use the theme toolbar to compare light and dark backgrounds.\n\nImport from `@flanksource/clicky-ui/icons`: `UiStackTrace`, `UiProfiler` (CPU), `UiMemoryProfile`, `UiAuditLog`, and `UiDatabaseEventStream`.\n\n```tsx\nimport { UiMemoryProfile } from "@flanksource/clicky-ui/icons";\n<UiMemoryProfile size={16} title="Memory profile" />\n```\n`size` sets both dimensions and defaults to 1em. `title` supplies the accessible name; omit it when adjacent text already labels the icon. The SVGs carry their blue and gray palette, like the reference icons. The standalone SVGs live in `packages/ui/icons/svg/`.'}}},render:()=>(0,_.jsxs)(`div`,{className:`max-w-2xl space-y-4`,"data-testid":`observability-icons`,children:[(0,_.jsx)(`h2`,{className:`text-lg font-semibold`,children:`Tracing & observability`}),(0,_.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Original icons at 16, 20, and 24px, using the UIR / AST palette.`}),(0,_.jsxs)(`div`,{className:`flex items-center gap-3 text-sm text-muted-foreground`,children:[(0,_.jsx)(`span`,{children:`References:`}),(0,_.jsx)(r,{size:24,title:`UiClass reference`}),(0,_.jsx)(`span`,{children:`UiClass`}),(0,_.jsx)(s,{size:24,title:`UiNamespace reference`}),(0,_.jsx)(`span`,{children:`UiNamespace`})]}),(0,_.jsx)(`div`,{className:`divide-y divide-border rounded border border-border`,children:E.map(({component:e,name:t,description:n})=>(0,_.jsxs)(`div`,{className:`flex items-center gap-6 px-4 py-3`,children:[(0,_.jsx)(`div`,{className:`flex shrink-0 items-center gap-5`,children:[16,20,24].map(n=>(0,_.jsxs)(`div`,{className:`flex w-8 flex-col items-center gap-2`,children:[(0,_.jsx)(`div`,{className:`flex h-8 items-center justify-center`,children:(0,_.jsx)(e,{size:n,title:`${t} at ${n}px`})}),(0,_.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[n,`px`]})]},n))}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{className:`text-sm font-medium`,children:t}),(0,_.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:n})]})]},t))})]})},O=[`Gallery`,`JetBrainsCatalog`,`ProgrammingVariants`,`ChangeAliases`,`Observability`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    showAliases: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "JetBrains catalog",
  args: {
    group: "all",
    query: "jb-",
    size: 20,
    showSource: true,
    showStats: false,
    showAliases: false
  },
  parameters: {
    docs: {
      description: {
        story: "IntelliJ Platform SVGs selected from the JetBrains icon catalog and downloaded archives. This gallery filters the generated offline components by their \`jb-\` source and shows the source identifier under each icon. Downloaded sources marked \`jb-download-unverified:\` have no embedded Apache header."
      }
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Programming variants",
  args: {
    group: "programming",
    query: "",
    size: 20,
    showSource: true,
    showStats: false,
    showAliases: false
  },
  parameters: {
    docs: {
      description: {
        story: "Programming symbols imported from paired light and dark JetBrains SVG downloads. The \`Dark\` suffix identifies the artwork intended for dark surfaces; the playground groups these exports by concept and variation and marks pairs without an embedded Apache header."
      }
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    showAliases: true,
    showStats: false
  }
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    },
    docs: {
      description: {
        story: ["Five original icons using the blue and gray stroke/fill palette of UiClass and UiNamespace, with a 24×24 viewBox and a 1.5-unit stroke. Each row compares actual 16, 20, and 24px sizes; use the theme toolbar to compare light and dark backgrounds.", "", "Import from \`@flanksource/clicky-ui/icons\`: \`UiStackTrace\`, \`UiProfiler\` (CPU), \`UiMemoryProfile\`, \`UiAuditLog\`, and \`UiDatabaseEventStream\`.", "", "\`\`\`tsx", 'import { UiMemoryProfile } from "@flanksource/clicky-ui/icons";', '<UiMemoryProfile size={16} title="Memory profile" />', "\`\`\`", "\`size\` sets both dimensions and defaults to 1em. \`title\` supplies the accessible name; omit it when adjacent text already labels the icon. The SVGs carry their blue and gray palette, like the reference icons. The standalone SVGs live in \`packages/ui/icons/svg/\`."].join("\\n")
      }
    }
  },
  render: () => <div className="max-w-2xl space-y-4" data-testid="observability-icons">
      <h2 className="text-lg font-semibold">Tracing & observability</h2>
      <p className="text-sm text-muted-foreground">
        Original icons at 16, 20, and 24px, using the UIR / AST palette.
      </p>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>References:</span>
        <GeneratedIcons.UiClass size={24} title="UiClass reference" />
        <span>UiClass</span>
        <GeneratedIcons.UiNamespace size={24} title="UiNamespace reference" />
        <span>UiNamespace</span>
      </div>
      <div className="divide-y divide-border rounded border border-border">
        {OBSERVABILITY_ICONS.map(({
        component: Icon,
        name,
        description
      }) => <div key={name} className="flex items-center gap-6 px-4 py-3">
            <div className="flex shrink-0 items-center gap-5">
              {[16, 20, 24].map(size => <div key={size} className="flex w-8 flex-col items-center gap-2">
                  <div className="flex h-8 items-center justify-center">
                    <Icon size={size} title={\`\${name} at \${size}px\`} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {size}px
                  </span>
                </div>)}
            </div>
            <div>
              <div className="text-sm font-medium">{name}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>)}
      </div>
    </div>
}`,...D.parameters?.docs?.source}}}})))()}k();export{T as ChangeAliases,S as Gallery,C as JetBrainsCatalog,D as Observability,w as ProgrammingVariants,O as __namedExportsOrder,x as default};
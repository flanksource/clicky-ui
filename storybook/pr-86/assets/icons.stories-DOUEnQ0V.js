import{j as e,ak as R,d as M,bd as E,be as V,bf as J,bg as q,bh as $,bi as z,bj as Q}from"./iframe-k78te_Hj.js";import"./preload-helper-CcRYDqr-.js";const W={"ui-controls":"UI controls",navigation:"Navigation","layout-dashboard":"Layout & dashboard","forms-editing":"Forms & editing","health-status":"Health & status","approval-review":"Approval & review","security-auth":"Security & auth",severity:"Severity",insight:"Insight","trees-lists-tables":"Trees, lists & tables","data-analytics":"Data & analytics","playbooks-workflows":"Playbooks & workflows","runtime-process":"Runtime & process","configs-metadata":"Configs & metadata","uir-ast-code":"UIR / AST code","uir-sql":"UIR / SQL","tracing-observability":"Tracing & observability",debugging:"Debugging",messaging:"Messaging",aop:"AOP",language:"Languages",jpa:"JPA",kubernetes:"Kubernetes",programming:"Programming","files-code":"Files & code","git-source-control":"Git & source control","dev-tools":"Dev tools","ai-ml":"AI & ML",infrastructure:"Infrastructure","actions-tools":"Actions & tools","people-orgs":"People & orgs",time:"Time",communication:"Communication",media:"Media"};function H(s){return typeof s=="function"&&"__source"in s&&"__group"in s&&"__consumerName"in s}const f=Object.entries(Q).filter(s=>H(s[1])).map(([s,a])=>({name:s,component:a,group:a.__group,consumerName:a.__consumerName,source:a.__source})).sort((s,a)=>s.group.localeCompare(a.group)||s.name.localeCompare(a.name)),x=Object.entries(f.reduce((s,a)=>{var t;return(s[t=a.group]??(s[t]=[])).push(a),s},{})).sort(([s],[a])=>s.localeCompare(a));function Y({group:s,query:a,size:t,showSource:r,showStats:o,filledOnly:G,showAliases:O}){const l=a.trim().toLowerCase(),D=x.map(([n,c])=>[n,c.filter(i=>{const F=s==="all"||i.group===s,L=!G||i.name.endsWith("Filled"),B=l.length===0||i.name.toLowerCase().includes(l)||i.consumerName.toLowerCase().includes(l)||i.source.toLowerCase().includes(l);return F&&L&&B})]).filter(([,n])=>n.length>0);return O?e.jsx(X,{size:t}):e.jsxs("div",{className:"space-y-6",children:[o&&e.jsxs("div",{className:"grid gap-3 sm:grid-cols-2 lg:grid-cols-4",children:[e.jsx(d,{label:"components",value:f.length}),e.jsx(d,{label:"groups",value:x.length}),e.jsx(d,{label:"filled variants",value:f.filter(n=>n.name.endsWith("Filled")).length}),e.jsx(d,{label:"change aliases",value:Object.keys(z).length})]}),D.map(([n,c])=>e.jsxs("section",{className:"space-y-2",children:[e.jsxs("header",{className:"flex items-baseline justify-between gap-3",children:[e.jsx("h2",{className:"text-sm font-semibold",children:W[n]??n}),e.jsx("span",{className:"text-xs text-muted-foreground",children:c.length})]}),e.jsx("div",{className:"grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:c.map(i=>e.jsx(K,{icon:i,showSource:r,size:t},i.name))})]},n))]})}const ae={title:"Foundations/Generated Icons",component:Y,args:{group:"all",query:"",size:18,showSource:!0,showStats:!0,filledOnly:!1,showAliases:!1},argTypes:{group:{control:"select",options:["all",...x.map(([s])=>s)],description:"Filter the gallery to a single semantic group, or `all`.",table:{category:"Filter"}},query:{control:"text",description:"Case-insensitive substring matched against the component name, consumer name, and source.",table:{category:"Filter"}},filledOnly:{control:"boolean",description:"Show only the `*Filled` solid variants.",table:{category:"Filter"}},size:{control:{type:"number",min:12,max:48,step:1},description:"Pixel size passed to each rendered icon.",table:{category:"Display"}},showSource:{control:"boolean",description:"Show the underlying source name under each icon.",table:{category:"Display"}},showStats:{control:"boolean",description:"Show the summary counts (components, groups, filled variants).",table:{category:"Display"}},showAliases:{control:"boolean",description:"Switch to the change-alias view pairing outline and filled icons by change type.",table:{category:"Display"}}},parameters:{docs:{description:{component:["Generated React icon components exported from `@flanksource/clicky-ui/icons`.","","**What this is**","- Every icon is a tree-shakeable React component (`UiCheck`, `UiActivity`, …) generated from `icon-selections.json` and grouped by purpose (health, navigation, infra, …).","- Components carry metadata (`__group`, `__source`, `__consumerName`) used to build this searchable gallery.","","**Usage**","```tsx",'import { UiCheck, UiActivity } from "@flanksource/clicky-ui/icons";',"",'<UiCheck size={18} className="text-emerald-600" title="healthy" />',"```","- Prefer the imported component for built-in icons; pass runtime string names only for user-supplied data (handled by a registered fallback provider — see `Data/Icon`).","- `*Filled` variants are solid; use the **Filled only** control to browse them. **Change aliases** pairs outline/filled icons by change type.","","Use the controls panel to filter by **group**, full-text **query**, and adjust **size**."].join(`
`)}}}};function d({label:s,value:a}){return e.jsxs("div",{className:"rounded border border-border bg-muted/30 p-3",children:[e.jsx("div",{className:"text-2xl font-semibold",children:a}),e.jsx("div",{className:"text-xs text-muted-foreground",children:s})]})}function K({icon:s,showSource:a,size:t}){const r=s.component;return e.jsxs("div",{className:"flex min-w-0 items-center gap-2 rounded border border-border bg-background px-2 py-1.5",children:[e.jsx(r,{size:t,className:"shrink-0 text-foreground",title:s.name}),e.jsxs("div",{className:"min-w-0 leading-tight",children:[e.jsx("div",{className:"truncate font-mono text-[11px] text-foreground",children:s.name}),a&&e.jsx("div",{className:"truncate text-[10px] text-muted-foreground",children:s.source})]})]})}const m={args:{showAliases:!1}},p={name:"JetBrains catalog",args:{group:"all",query:"jb-",size:20,showSource:!0,showStats:!1,showAliases:!1},parameters:{docs:{description:{story:"IntelliJ Platform SVGs selected from the JetBrains icon catalog and downloaded archives. This gallery filters the generated offline components by their `jb-` source and shows the source identifier under each icon. Downloaded sources marked `jb-download-unverified:` have no embedded Apache header."}}}},u={name:"Programming variants",args:{group:"programming",query:"",size:20,showSource:!0,showStats:!1,showAliases:!1},parameters:{docs:{description:{story:"Programming symbols imported from paired light and dark JetBrains SVG downloads. The `Dark` suffix identifies the artwork intended for dark surfaces; the playground groups these exports by concept and variation and marks pairs without an embedded Apache header."}}}};function X({size:s}){return e.jsx("div",{className:"grid gap-2 sm:grid-cols-2 lg:grid-cols-3",children:Object.entries(z).map(([a,t])=>{const r=t.outline,o=t.filled;return e.jsxs("div",{className:"flex min-w-0 items-center gap-3 rounded border border-border bg-background px-3 py-2",children:[e.jsxs("div",{className:"flex items-center gap-1 text-foreground",children:[e.jsx(r,{size:s,title:`${a} outline`}),o&&e.jsx(o,{size:s,title:`${a} filled`})]}),e.jsx("code",{className:"truncate text-xs text-muted-foreground",children:a})]},a)})})}const g={args:{showAliases:!0,showStats:!1}},Z=[{component:E,name:"Stack trace",description:"Connected runtime call frames."},{component:V,name:"CPU profile",description:"Sampled execution tiers and a narrow hotspot."},{component:J,name:"Memory profile",description:"Heap allocations and an available slot."},{component:q,name:"Audit log",description:"Chronological entries ending in verification."},{component:$,name:"Database event stream",description:"Stored records emitting engine events / SQL XEvents."}],h={parameters:{controls:{disable:!0},docs:{description:{story:["Five original icons using the blue and gray stroke/fill palette of UiClass and UiNamespace, with a 24×24 viewBox and a 1.5-unit stroke. Each row compares actual 16, 20, and 24px sizes; use the theme toolbar to compare light and dark backgrounds.","","Import from `@flanksource/clicky-ui/icons`: `UiStackTrace`, `UiProfiler` (CPU), `UiMemoryProfile`, `UiAuditLog`, and `UiDatabaseEventStream`.","","```tsx",'import { UiMemoryProfile } from "@flanksource/clicky-ui/icons";','<UiMemoryProfile size={16} title="Memory profile" />',"```","`size` sets both dimensions and defaults to 1em. `title` supplies the accessible name; omit it when adjacent text already labels the icon. The SVGs carry their blue and gray palette, like the reference icons. The standalone SVGs live in `packages/ui/icons/svg/`."].join(`
`)}}},render:()=>e.jsxs("div",{className:"max-w-2xl space-y-4","data-testid":"observability-icons",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"Tracing & observability"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Original icons at 16, 20, and 24px, using the UIR / AST palette."}),e.jsxs("div",{className:"flex items-center gap-3 text-sm text-muted-foreground",children:[e.jsx("span",{children:"References:"}),e.jsx(R,{size:24,title:"UiClass reference"}),e.jsx("span",{children:"UiClass"}),e.jsx(M,{size:24,title:"UiNamespace reference"}),e.jsx("span",{children:"UiNamespace"})]}),e.jsx("div",{className:"divide-y divide-border rounded border border-border",children:Z.map(({component:s,name:a,description:t})=>e.jsxs("div",{className:"flex items-center gap-6 px-4 py-3",children:[e.jsx("div",{className:"flex shrink-0 items-center gap-5",children:[16,20,24].map(r=>e.jsxs("div",{className:"flex w-8 flex-col items-center gap-2",children:[e.jsx("div",{className:"flex h-8 items-center justify-center",children:e.jsx(s,{size:r,title:`${a} at ${r}px`})}),e.jsxs("span",{className:"text-xs text-muted-foreground",children:[r,"px"]})]},r))}),e.jsxs("div",{children:[e.jsx("div",{className:"text-sm font-medium",children:a}),e.jsx("p",{className:"text-xs text-muted-foreground",children:t})]})]},a))})]})};var b,y,v;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    showAliases: false
  }
}`,...(v=(y=m.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var w,j,k;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(k=(j=p.parameters)==null?void 0:j.docs)==null?void 0:k.source}}};var N,S,U;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(U=(S=u.parameters)==null?void 0:S.docs)==null?void 0:U.source}}};var C,A,I;g.parameters={...g.parameters,docs:{...(C=g.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    showAliases: true,
    showStats: false
  }
}`,...(I=(A=g.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};var P,_,T;h.parameters={...h.parameters,docs:{...(P=h.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(T=(_=h.parameters)==null?void 0:_.docs)==null?void 0:T.source}}};const te=["Gallery","JetBrainsCatalog","ProgrammingVariants","ChangeAliases","Observability"];export{g as ChangeAliases,m as Gallery,p as JetBrainsCatalog,h as Observability,u as ProgrammingVariants,te as __namedExportsOrder,ae as default};

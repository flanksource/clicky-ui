import{r as y,j as e}from"./iframe-gCNtXdWy.js";import{c as r}from"./utils-BLSKlp9E.js";import{I as _}from"./Icon-BKGlD8mw.js";import{S as Z}from"./SplitPane-CYPTswZL.js";import{U as ee,a as ae,b as se,c as te,d as ne}from"./UiUsersThree-Dhm1u9-_.js";import{T as ie}from"./Tabs-Zs7x6qb4.js";import{P as re}from"./Panel-DI5vlUGz.js";import{B as o}from"./button-BKV1MLun.js";import{U as le}from"./UiDatabase-CIJAsI7B.js";import"./preload-helper-C_Fsq_bH.js";import"./TabButton-JJAT3qzF.js";import"./index-1evVQkiP.js";function A(a){return!a||typeof window>"u"?null:window.localStorage.getItem(a)}function d(a){const{brand:s,nav:n,search:t,actions:i,toolbar:x,searchMaxWidth:z="28rem",navSections:c,sidebar:p,sidebarHeader:v,sidebarFooter:N,collapsible:E=!0,defaultCollapsed:H=!1,collapsedStorageKey:m,sidebarWidth:U=240,collapsedWidth:F=56,bodyHeader:k,bodyActions:f,bodySidebar:S,bodySplit:W=24,children:j,className:O,headerClassName:G,toolbarClassName:I,sidebarClassName:M,bodyHeaderClassName:K,contentClassName:w}=a,g=p!==void 0||((c==null?void 0:c.length)??0)>0,[l,Q]=y.useState(()=>A(m)==="true"||A(m)===null&&H);y.useEffect(()=>{m&&typeof window<"u"&&window.localStorage.setItem(m,String(l))},[l,m]);const $=l?F:U,J=!g&&s!==void 0||n!==void 0||t!==void 0||i!==void 0||x!==void 0,X=k!==void 0||f!==void 0;return e.jsxs("div",{className:r("flex h-full min-h-0 w-full bg-background",O),children:[g&&e.jsxs("aside",{style:{width:$},className:r("flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",M),children:[e.jsxs("div",{className:r("flex h-14 shrink-0 items-center border-b border-sidebar-border",l?"justify-center px-2":"justify-between px-density-3"),children:[!l&&s&&e.jsx("div",{className:"flex min-w-0 items-center gap-2",children:s}),E&&e.jsx("button",{type:"button",onClick:()=>Q(Y=>!Y),"aria-label":l?"Expand sidebar":"Collapse sidebar",title:l?"Expand sidebar":"Collapse sidebar",className:"flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",children:e.jsx(_,{icon:ee,className:"h-4 w-4"})})]}),v&&e.jsx("div",{className:"shrink-0 border-b border-sidebar-border px-density-3 py-density-2",children:v}),e.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto py-density-2",children:typeof p=="function"?p(l):p!==void 0?p:c&&e.jsx(oe,{sections:c,collapsed:l})}),N&&e.jsx("div",{className:"mt-auto shrink-0 border-t border-sidebar-border px-density-3 py-density-2",children:N})]}),e.jsxs("div",{className:"flex min-h-0 min-w-0 flex-1 flex-col",children:[J&&e.jsxs("header",{className:"shrink-0 border-b border-border bg-card",children:[e.jsxs("div",{className:r("flex h-14 items-center gap-density-3 px-density-4",G),children:[!g&&s&&e.jsx("div",{className:"flex shrink-0 items-center gap-density-2",children:s}),n&&e.jsx("div",{className:"flex shrink-0 items-center",children:n}),t!==void 0&&e.jsx("div",{className:"flex min-w-0 flex-1 justify-center",children:e.jsx("div",{className:"w-full",style:{maxWidth:z},children:t})}),t===void 0&&e.jsx("div",{className:"flex-1"}),i&&e.jsx("div",{className:"flex shrink-0 items-center gap-density-2",children:i})]}),x&&e.jsx("div",{className:r("flex items-center gap-density-2 border-t border-border bg-muted px-density-4 py-density-2",I),children:x})]}),X&&e.jsxs("div",{className:r("flex shrink-0 items-start justify-between gap-density-3 border-b border-border bg-card px-density-4 py-density-2",K),children:[e.jsx("div",{className:"min-w-0 flex-1",children:k}),f&&e.jsx("div",{className:"flex shrink-0 items-center gap-density-2",children:f})]}),S!==void 0?e.jsx(Z,{className:"min-h-0 flex-1",defaultSplit:W,minLeft:12,minRight:30,left:S,right:e.jsx("div",{className:r("h-full min-w-0",w),children:j}),rightClass:"overflow-y-auto"}):e.jsx("main",{className:r("min-h-0 min-w-0 flex-1 overflow-auto",w),children:j})]})]})}function oe({sections:a,collapsed:s}){return e.jsx("nav",{className:r("flex flex-col gap-0.5",s?"px-2":"px-density-2"),children:a.map((n,t)=>e.jsxs("div",{className:"flex flex-col",children:[n.label&&(s?e.jsx("div",{className:"mx-2 mb-1 mt-3 border-t border-sidebar-border first:mt-1"}):e.jsx("div",{className:"mb-0.5 mt-3 px-density-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55 first:mt-1",children:n.label})),n.items.map(i=>e.jsx(de,{item:i,collapsed:s},i.key))]},n.label??`section-${t}`))})}function de({item:a,collapsed:s}){const n=r("flex w-full items-center gap-2.5 rounded-md px-density-2 py-1.5 text-left text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",s&&"justify-center px-0",a.active&&"bg-sidebar-accent font-medium text-sidebar-primary"),t=e.jsxs(e.Fragment,{children:[a.icon&&e.jsx("span",{className:"flex h-4 w-4 shrink-0 items-center justify-center",children:e.jsx(_,{...typeof a.icon=="string"?{name:a.icon}:{icon:a.icon}})}),!s&&e.jsx("span",{className:"flex-1 truncate",children:a.label}),!s&&a.badge]}),i=s&&typeof a.label=="string"?a.label:void 0;return a.href?e.jsx("a",{href:a.href,className:n,title:i,...a.external?{target:"_blank",rel:"noopener noreferrer"}:{},children:t}):e.jsx("button",{type:"button",onClick:a.onClick,className:n,title:i,children:t})}try{d.displayName="AppShell",d.__docgenInfo={description:"",displayName:"AppShell",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/layout/AppShell.tsx",methods:[],props:{brand:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Brand mark / wordmark. Shown in the rail header when a rail is present, else in the top bar.",name:"brand",required:!1,tags:{},type:{name:"ReactNode"}},nav:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Inline primary nav (e.g. tabs) shown after the brand in the top bar.",name:"nav",required:!1,tags:{},type:{name:"ReactNode"}},search:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Centered search slot; grows to fill and is width-capped.",name:"search",required:!1,tags:{},type:{name:"ReactNode"}},actions:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Right-aligned cluster (icon buttons, settings/org picker, …).",name:"actions",required:!1,tags:{},type:{name:"ReactNode"}},toolbar:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Optional second top-bar row for filters / bulk actions.",name:"toolbar",required:!1,tags:{},type:{name:"ReactNode"}},searchMaxWidth:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Max width of the centered search slot. Defaults to 28rem.",name:"searchMaxWidth",required:!1,tags:{},type:{name:"string | number"}},navSections:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Declarative nav sections rendered into the rail (collapse-aware).",name:"navSections",required:!1,tags:{},type:{name:"AppShellNavSection[]"}},sidebar:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Custom sidebar content; receives the collapsed flag. Overrides navSections.",name:"sidebar",required:!1,tags:{},type:{name:"ReactNode | ((collapsed: boolean) => ReactNode)"}},sidebarHeader:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Pinned below the rail header (e.g. a context switcher).",name:"sidebarHeader",required:!1,tags:{},type:{name:"ReactNode"}},sidebarFooter:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Pinned to the bottom of the rail (version, account).",name:"sidebarFooter",required:!1,tags:{},type:{name:"ReactNode"}},collapsible:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Show the collapse toggle. Defaults to true when a rail is present.",name:"collapsible",required:!1,tags:{},type:{name:"boolean"}},defaultCollapsed:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Initial collapsed state (uncontrolled).",name:"defaultCollapsed",required:!1,tags:{},type:{name:"boolean"}},collapsedStorageKey:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"localStorage key persisting the collapsed state.",name:"collapsedStorageKey",required:!1,tags:{},type:{name:"string"}},sidebarWidth:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Expanded rail width in px. Defaults to 240.",name:"sidebarWidth",required:!1,tags:{},type:{name:"number"}},collapsedWidth:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Collapsed rail width in px. Defaults to 56.",name:"collapsedWidth",required:!1,tags:{},type:{name:"number"}},bodyHeader:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Fixed header row, left side (breadcrumb, title, tabs).",name:"bodyHeader",required:!1,tags:{},type:{name:"ReactNode"}},bodyActions:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Fixed header row, right side (entity actions) — same row as bodyHeader.",name:"bodyActions",required:!1,tags:{},type:{name:"ReactNode"}},bodySidebar:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Optional independent-scroll pane (e.g. a tree). Renders a SplitPane vs body-main.",name:"bodySidebar",required:!1,tags:{},type:{name:"ReactNode"}},bodySplit:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"bodySidebar width as a percent when present. Defaults to 24.",name:"bodySplit",required:!1,tags:{},type:{name:"number"}},children:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"Main content (body-main); fills the remaining space and scrolls.",name:"children",required:!0,tags:{},type:{name:"ReactNode"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}},headerClassName:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"headerClassName",required:!1,tags:{},type:{name:"string"}},toolbarClassName:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"toolbarClassName",required:!1,tags:{},type:{name:"string"}},sidebarClassName:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"sidebarClassName",required:!1,tags:{},type:{name:"string"}},bodyHeaderClassName:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"bodyHeaderClassName",required:!1,tags:{},type:{name:"string"}},contentClassName:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/layout/AppShell.tsx",name:"TypeLiteral"}],description:"",name:"contentClassName",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const ke={title:"Layout/AppShell",component:d,parameters:{layout:"fullscreen",docs:{description:{component:"Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout."}}}},u={render:()=>{const[a,s]=y.useState("prs");return e.jsx("div",{className:"h-[480px]",children:e.jsx(d,{brand:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"g"}),e.jsx("span",{className:"font-bold tracking-tight",children:"gavel"})]}),nav:e.jsx(ie,{tabs:[{id:"prs",label:"Pull requests"},{id:"activity",label:"Activity"}],value:a,onChange:s}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"ghost",size:"sm",children:"Light/Dark"}),e.jsx(o,{size:"sm",children:"New"})]}),toolbar:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Filters go here"}),e.jsx("div",{className:"flex-1"}),e.jsx(o,{variant:"outline",size:"sm",children:"Export"})]}),children:e.jsx("div",{className:"h-full overflow-y-auto p-density-4",children:e.jsx(re,{title:"Content",count:2,children:e.jsx("p",{className:"text-sm",children:"The routed content area scrolls here."})})})})})}},h={render:()=>e.jsx("div",{className:"h-[320px]",children:e.jsx(d,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),actions:e.jsx(o,{size:"sm",children:"Action"}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"No toolbar row."})})})},b={render:()=>{const[a,s]=y.useState("policies"),n=[{label:"Operations",items:[{key:"dashboard",label:"Dashboard",icon:ae},{key:"policies",label:"Policies",icon:se},{key:"clients",label:"Clients",icon:te}].map(t=>({...t,active:t.key===a,onClick:()=>s(t.key)}))},{label:"System",items:[{key:"docs",label:"Docs",icon:ne},{key:"settings",label:"Settings",icon:le}].map(t=>({...t,active:t.key===a,onClick:()=>s(t.key)}))}];return e.jsx("div",{className:"h-[560px]",children:e.jsx(d,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"m"}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search anything…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"ghost",size:"sm",children:"Docs"}),e.jsx(o,{variant:"outline",size:"sm",children:"LAB_DEMO_QA ▾"})]}),navSections:n,collapsedStorageKey:"sb-demo:collapsed",bodyHeader:e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-muted-foreground",children:"Products › Risk Products › Group Life"}),e.jsx("h1",{className:"mt-1 text-lg font-semibold",children:"Group Life"}),e.jsxs("div",{className:"mt-2 flex gap-density-3 text-sm text-muted-foreground",children:[e.jsx("span",{className:"font-medium text-foreground",children:"Overview"}),e.jsx("span",{children:"Transactions"}),e.jsx("span",{children:"Eligibility"})]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"outline",size:"sm",children:"Edit"}),e.jsx(o,{size:"sm",children:"Run"})]}),bodySidebar:e.jsxs("nav",{className:"p-density-2 text-sm",children:[e.jsx("div",{className:"mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Plans (299)"}),Array.from({length:40},(t,i)=>e.jsxs("div",{className:"truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground",children:["Scheme-G",String(36031+i).padStart(7,"0")]},i))]}),children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",a," — body-main scrolls here."]})})})}};var T,C,L;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => {
    const [tab, setTab] = useState("prs");
    return <div className="h-[480px]">
        <AppShell brand={<>
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
                g
              </span>
              <span className="font-bold tracking-tight">gavel</span>
            </>} nav={<Tabs tabs={[{
        id: "prs",
        label: "Pull requests"
      }, {
        id: "activity",
        label: "Activity"
      }]} value={tab} onChange={setTab} />} search={<input aria-label="search" placeholder="Search…" className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none" />} actions={<>
              <Button variant="ghost" size="sm">
                Light/Dark
              </Button>
              <Button size="sm">New</Button>
            </>} toolbar={<>
              <span className="text-sm text-muted-foreground">Filters go here</span>
              <div className="flex-1" />
              <Button variant="outline" size="sm">
                Export
              </Button>
            </>}>
          <div className="h-full overflow-y-auto p-density-4">
            <Panel title="Content" count={2}>
              <p className="text-sm">The routed content area scrolls here.</p>
            </Panel>
          </div>
        </AppShell>
      </div>;
  }
}`,...(L=(C=u.parameters)==null?void 0:C.docs)==null?void 0:L.source}}};var q,V,B;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">No toolbar row.</div>
      </AppShell>
    </div>
}`,...(B=(V=h.parameters)==null?void 0:V.docs)==null?void 0:B.source}}};var R,D,P;b.parameters={...b.parameters,docs:{...(R=b.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState("policies");
    const navSections = [{
      label: "Operations",
      items: [{
        key: "dashboard",
        label: "Dashboard",
        icon: UiGrid
      }, {
        key: "policies",
        label: "Policies",
        icon: UiBox
      }, {
        key: "clients",
        label: "Clients",
        icon: UiUsersThree
      }].map(i => ({
        ...i,
        active: i.key === active,
        onClick: () => setActive(i.key)
      }))
    }, {
      label: "System",
      items: [{
        key: "docs",
        label: "Docs",
        icon: UiHome
      }, {
        key: "settings",
        label: "Settings",
        icon: UiDatabase
      }].map(i => ({
        ...i,
        active: i.key === active,
        onClick: () => setActive(i.key)
      }))
    }];
    return <div className="h-[560px]">
        <AppShell brand={<span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
              m
            </span>} search={<input aria-label="search" placeholder="Search anything…" className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none" />} actions={<>
              <Button variant="ghost" size="sm">
                Docs
              </Button>
              <Button variant="outline" size="sm">
                LAB_DEMO_QA ▾
              </Button>
            </>} navSections={navSections} collapsedStorageKey="sb-demo:collapsed" bodyHeader={<div>
              <div className="text-xs text-muted-foreground">Products › Risk Products › Group Life</div>
              <h1 className="mt-1 text-lg font-semibold">Group Life</h1>
              <div className="mt-2 flex gap-density-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Overview</span>
                <span>Transactions</span>
                <span>Eligibility</span>
              </div>
            </div>} bodyActions={<>
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button size="sm">Run</Button>
            </>} bodySidebar={<nav className="p-density-2 text-sm">
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Plans (299)
              </div>
              {Array.from({
          length: 40
        }, (_, i) => <div key={i} className="truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground">
                  Scheme-G{String(36031 + i).padStart(7, "0")}
                </div>)}
            </nav>}>
          <div className="p-density-4 text-sm">Active: {active} — body-main scrolls here.</div>
        </AppShell>
      </div>;
  }
}`,...(P=(D=b.parameters)==null?void 0:D.docs)==null?void 0:P.source}}};const Se=["Default","NoToolbar","WithSidebar"];export{u as Default,h as NoToolbar,b as WithSidebar,Se as __namedExportsOrder,ke as default};

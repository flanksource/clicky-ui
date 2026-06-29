import{j as e,r as z}from"./iframe-C9yFQwwi.js";import{A as a,R as B}from"./RouterProvider-B4l72N8a.js";import{T as A}from"./Tabs-QcNe0EW7.js";import{P as w}from"./Panel-DD7buZW7.js";import{B as t}from"./button-BUPOCWxe.js";import{u as R,a as T}from"./router-CwvB_xDr.js";import{U as S,a as P,b as E,c as D}from"./UiUsersThree-DqcEHOiA.js";import{U as F}from"./UiDatabase-C3k7oFRb.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-CPfok5dB.js";import"./modalStack-CeDZWai7.js";import"./zIndex-CigQ76av.js";import"./SplitPane-DfyML0lH.js";import"./UiSidebar-BoaS81WM.js";import"./UiMenu-iCGETT9U.js";import"./UiClose-CrCIES2T.js";import"./TabButton-BEYwtdWm.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";const se={title:"Layout/AppShell",component:a,parameters:{layout:"fullscreen",docs:{description:{component:"Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout."}}}},o={render:()=>{const[n,r]=z.useState("prs");return e.jsx("div",{className:"h-[480px]",children:e.jsx(a,{brand:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"g"}),e.jsx("span",{className:"font-bold tracking-tight",children:"gavel"})]}),nav:e.jsx(A,{tabs:[{id:"prs",label:"Pull requests"},{id:"activity",label:"Activity"}],value:n,onChange:r}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{variant:"ghost",size:"sm",children:"Light/Dark"}),e.jsx(t,{size:"sm",children:"New"})]}),toolbar:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Filters go here"}),e.jsx("div",{className:"flex-1"}),e.jsx(t,{variant:"outline",size:"sm",children:"Export"})]}),children:e.jsx("div",{className:"h-full overflow-y-auto p-density-4",children:e.jsx(w,{title:"Content",count:2,children:e.jsx("p",{className:"text-sm",children:"The routed content area scrolls here."})})})})})}},i={render:()=>e.jsx("div",{className:"h-[320px]",children:e.jsx(a,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),actions:e.jsx(t,{size:"sm",children:"Action"}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"No toolbar row."})})})},l={render:()=>e.jsx("div",{className:"h-[420px]",children:e.jsx(a,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),navSections:[{items:[{key:"runs",label:"Runs",icon:S,to:"/runs"}]}],actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{size:"sm",children:"Run capture"}),e.jsx(t,{variant:"outline",size:"sm",children:"Edit target"}),e.jsx(t,{variant:"outline",size:"sm",children:"Workspace with a long name"})]}),mobileActions:e.jsxs(e.Fragment,{children:[e.jsx(t,{size:"sm",children:"Run"}),e.jsx(t,{variant:"outline",size:"sm",children:"More"})]}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster."})})})},d={render:()=>{const n=R("/policies");return e.jsx("div",{className:"h-[560px]",children:e.jsx(B,{adapter:n,children:e.jsx(U,{})})})}};function U(){const{pathname:n}=T(),r=n.replace(/^\//,""),k=[{label:"Operations",items:[{key:"dashboard",label:"Dashboard",icon:S},{key:"policies",label:"Policies",icon:P},{key:"clients",label:"Clients",icon:E}].map(s=>({...s,active:s.key===r,to:`/${s.key}`}))},{label:"System",items:[{key:"docs",label:"Docs",icon:D},{key:"settings",label:"Settings",icon:F}].map(s=>({...s,active:s.key===r,to:`/${s.key}`}))}];return e.jsx(a,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"m"}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search anything…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{variant:"ghost",size:"sm",children:"Docs"}),e.jsx(t,{variant:"outline",size:"sm",children:"LAB_DEMO_QA ▾"})]}),navSections:k,collapsedStorageKey:"sb-demo:collapsed",bodyHeader:e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-muted-foreground",children:"Products › Risk Products › Group Life"}),e.jsx("h1",{className:"mt-1 text-lg font-semibold",children:"Group Life"}),e.jsxs("div",{className:"mt-2 flex gap-density-3 text-sm text-muted-foreground",children:[e.jsx("span",{className:"font-medium text-foreground",children:"Overview"}),e.jsx("span",{children:"Transactions"}),e.jsx("span",{children:"Eligibility"})]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(t,{variant:"outline",size:"sm",children:"Edit"}),e.jsx(t,{size:"sm",children:"Run"})]}),bodySidebar:e.jsxs("nav",{className:"p-density-2 text-sm",children:[e.jsx("div",{className:"mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Plans (299)"}),Array.from({length:40},(s,c)=>e.jsxs("div",{className:"truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground",children:["Scheme-G",String(36031+c).padStart(7,"0")]},c))]}),children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",r," — body-main scrolls here."]})})}var m,p,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
              <span className="text-sm text-muted-foreground">
                Filters go here
              </span>
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
}`,...(u=(p=o.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var h,x,b;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
}`,...(b=(x=i.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var g,v,j;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-[420px]">
      <AppShell brand={<span className="font-bold">gavel</span>} navSections={[{
      items: [{
        key: "runs",
        label: "Runs",
        icon: UiGrid,
        to: "/runs"
      }]
    }]} actions={<>
            <Button size="sm">Run capture</Button>
            <Button variant="outline" size="sm">
              Edit target
            </Button>
            <Button variant="outline" size="sm">
              Workspace with a long name
            </Button>
          </>} mobileActions={<>
            <Button size="sm">Run</Button>
            <Button variant="outline" size="sm">
              More
            </Button>
          </>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          Resize this story to a phone width: the mobile header keeps the primary
          action compact while desktop still renders the full action cluster.
        </div>
      </AppShell>
    </div>
}`,...(j=(v=l.parameters)==null?void 0:v.docs)==null?void 0:j.source}}};var y,f,N;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/policies");
    return <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <WithSidebarBody />
        </RouterProvider>
      </div>;
  }
}`,...(N=(f=d.parameters)==null?void 0:f.docs)==null?void 0:N.source}}};const ne=["Default","NoToolbar","CompactMobileActions","WithSidebar"];export{l as CompactMobileActions,o as Default,i as NoToolbar,d as WithSidebar,ne as __namedExportsOrder,se as default};

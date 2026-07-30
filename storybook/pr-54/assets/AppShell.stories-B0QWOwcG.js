import{j as e,bb as y,r as l,at as w,c as j,bc as _,bd as q}from"./iframe-BLMcgo_c.js";import{Q as Y}from"./queryClient-DfcB1qXz.js";import{Q as J}from"./suspense-C_QNafVG.js";import{A as d,R as H}from"./RouterProvider-BwTJDtyf.js";import{T as Z}from"./Tabs-BDv476iG.js";import{P as ee}from"./Panel--O9CrkVf.js";import{B as n}from"./button-CEv4-a2z.js";import{S as te}from"./Switch-Bk1qL7Lg.js";import{A as ne}from"./Avatar-DdQIx3PQ.js";import{u as I,a as ae}from"./DataTable-PlMOUTHy.js";import{O as se}from"./OperationCatalog-qFThxyy0.js";import{a as oe,F as re}from"./rpc-story.fixtures-D_Y6BK0D.js";import{C as ie,a as le}from"./CommandPaletteTrigger-CiKzWZfn.js";import"./preload-helper-V0wJDdBF.js";import"./utils-CR52uffu.js";import"./Icon-BjbjSuBq.js";import"./modalStack-D_rEmCN1.js";import"./zIndex-CigQ76av.js";import"./SplitPane-Bgi6U75s.js";import"./TabButton-Dyi0SU1j.js";import"./PanelFrame-BPT6Ml26.js";import"./index-0zBpNI7D.js";import"./loading-iB_CRy-d.js";import"./SortableHeader-CSg98qW-.js";import"./Modal-BHR92wmy.js";import"./index-0GhwRIX8.js";import"./index-C6bGw4eq.js";import"./FilterBar-C_H9k_nL.js";import"./floating-ui.react-CNA9gpd9.js";import"./FilterPill-CbSFJXot.js";import"./Combobox-_lDNxkJT.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-C1a9DNKH.js";import"./MultiSelect-BBiKYftZ.js";import"./RangeSlider-Bp62seHz.js";import"./TimeRange-B8e-Z5ZI.js";import"./select-CijM4oyP.js";import"./Timestamp-Cc-tKo2X.js";import"./TagList-D1pD3VSL.js";import"./Badge-iQY0V9yL.js";import"./HoverCard-B_pkxN57.js";import"./Properties-D-5UQf25.js";import"./IconButton-L0ivsM0w.js";import"./DropdownMenu-CQgT7g8D.js";import"./DropdownMenuSubmenu-CA72N--A.js";import"./StatusDot-Ct3IJVj0.js";import"./useQuery-C0FKZRw9.js";import"./Clicky-SiRnPfL0.js";import"./FilterForm-z8THU0XR.js";import"./types-BHfRQr8X.js";import"./Tree-DM9VbXSX.js";import"./TreeNode-DizV2hB8.js";import"./ObjectGraph-B394ijQR.js";import"./ExecutionTree-CRoDmtGM.js";import"./CodeBlock-Bq3gmovv.js";import"./CodeDiff-D0RHEXPA.js";import"./SegmentedControl-BHAvUbO0.js";import"./code-highlight-BFfnWKQ0.js";import"./JsonView-HLu_KbKF.js";import"./RenderedStackTrace-CV5zcOlJ.js";import"./clickyMetadata-DFwyi2hR.js";import"./EndpointList-DqnXt8x9.js";import"./MethodBadge-BH4D079f.js";import"./OperationActionBar-B6pam_4i.js";import"./ExecutionResult-gTOJMb5p.js";import"./CommandOutput-LDH4gOk0.js";import"./public-api-BjCjxHuM.js";import"./JsonSchemaForm-2KXoyNuw.js";import"./json-schema-form-utils-De9hQamh.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./OperationResultView-ClRyStIn.js";import"./rowNavigation-CL3361yD.js";import"./command-form-utils-C0Xv-EwX.js";import"./use-hotkey-DeHrN7O-.js";const{expect:c,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,Et={title:"Layout/AppShell",component:d,parameters:{layout:"fullscreen",docs:{description:{component:"Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout."}}}},u={render:()=>{const[s,o]=l.useState("prs");return e.jsx("div",{className:"h-[480px]",children:e.jsx(d,{brand:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"g"}),e.jsx("span",{className:"font-bold tracking-tight",children:"gavel"})]}),nav:e.jsx(Z,{tabs:[{id:"prs",label:"Pull requests"},{id:"activity",label:"Activity"}],value:s,onChange:o}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"ghost",size:"sm",children:"Light/Dark"}),e.jsx(n,{size:"sm",children:"New"})]}),toolbar:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Filters go here"}),e.jsx("div",{className:"flex-1"}),e.jsx(n,{variant:"outline",size:"sm",children:"Export"})]}),children:e.jsx("div",{className:"h-full overflow-y-auto p-density-4",children:e.jsx(ee,{title:"Content",count:2,children:e.jsx("p",{className:"text-sm",children:"The routed content area scrolls here."})})})})})}},h={render:()=>e.jsx("div",{className:"h-[320px]",children:e.jsx(d,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),actions:e.jsx(n,{size:"sm",children:"Action"}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"No toolbar row."})})})},x={render:()=>e.jsx("div",{className:"h-[420px]",children:e.jsx(d,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),navSections:[{items:[{key:"runs",label:"Runs",icon:y,to:"/runs"}]}],actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{size:"sm",children:"Run capture"}),e.jsx(n,{variant:"outline",size:"sm",children:"Edit target"}),e.jsx(n,{variant:"outline",size:"sm",children:"Workspace with a long name"})]}),mobileActions:e.jsxs(e.Fragment,{children:[e.jsx(n,{size:"sm",children:"Run"}),e.jsx(n,{variant:"outline",size:"sm",children:"More"})]}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster."})})})},b={render:()=>{const s=I("/policies");return e.jsx("div",{className:"h-[560px]",children:e.jsx(H,{adapter:s,children:e.jsx(ce,{})})})}};function ce(){const{pathname:s}=ae(),o=s.replace(/^\//,""),r=[{label:"Operations",items:[{key:"dashboard",label:"Dashboard",icon:y},{key:"policies",label:"Policies",icon:w},{key:"clients",label:"Clients",icon:_}].map(a=>({...a,active:a.key===o,to:`/${a.key}`}))},{label:"System",items:[{key:"docs",label:"Docs",icon:q},{key:"settings",label:"Settings",icon:j}].map(a=>({...a,active:a.key===o,to:`/${a.key}`}))}];return e.jsx(d,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"m"}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search anything…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"ghost",size:"sm",children:"Docs"}),e.jsx(n,{variant:"outline",size:"sm",children:"LAB_DEMO_QA ▾"})]}),navSections:r,collapsedStorageKey:"sb-demo:collapsed",bodyHeader:e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-muted-foreground",children:"Products › Risk Products › Group Life"}),e.jsx("h1",{className:"mt-1 text-lg font-semibold",children:"Group Life"}),e.jsxs("div",{className:"mt-2 flex gap-density-3 text-sm text-muted-foreground",children:[e.jsx("span",{className:"font-medium text-foreground",children:"Overview"}),e.jsx("span",{children:"Transactions"}),e.jsx("span",{children:"Eligibility"})]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"outline",size:"sm",children:"Edit"}),e.jsx(n,{size:"sm",children:"Run"})]}),bodySidebar:e.jsxs("nav",{className:"p-density-2 text-sm",children:[e.jsx("div",{className:"mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Plans (299)"}),Array.from({length:40},(a,t)=>e.jsxs("div",{className:"truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground",children:["Scheme-G",String(36031+t).padStart(7,"0")]},t))]}),children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",o," — body-main scrolls here."]})})}const g={parameters:{docs:{description:{story:"AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`."}}},render:()=>e.jsx(de,{}),play:async({canvasElement:s,step:o})=>{const r=p(s),a=p(document.body);await o("the table pages remotely, keeping the header and footer pinned",async()=>{await r.findByText(/Page 1 of/,void 0,{timeout:5e3});const t=s.querySelector('[data-slot="operation-catalog-results"] .overflow-auto');if(await c(t).not.toBeNull(),t){t.scrollTop=t.scrollHeight;const i=s.querySelector("main");await c((i==null?void 0:i.scrollTop)??0).toBe(0)}await m.click(r.getByRole("button",{name:"Next page"})),await c(await r.findByText(/Page 2 of/)).toBeInTheDocument()}),await o("⌘K opens the palette, filters, and runs a command",async()=>{await m.keyboard("{Meta>}k{/Meta}");const t=await a.findByRole("dialog",{name:"Command palette"});await c(t).toBeInTheDocument(),await m.type(p(t).getByRole("combobox"),"orders"),await m.keyboard("{Enter}"),await c(a.queryByRole("dialog",{name:"Command palette"})).not.toBeInTheDocument();const i=r.getByRole("navigation",{name:"Breadcrumb"});await c(p(i).getByText("Orders")).toBeInTheDocument()})}};function de(){const s=I("/widgets"),o=l.useMemo(()=>new Y({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),[r,a]=l.useState(!1),[t,i]=l.useState("widgets"),[N,U]=l.useState(!1),[G,K]=l.useState(null),[Q,$]=l.useState(null),X=[{label:"Inventory",items:[{key:"widgets",label:"Widgets",icon:w},{key:"orders",label:"Orders",icon:y}]},{label:"Platform",items:[{key:"services",label:"Services",icon:j},{key:"clients",label:"Clients",icon:_}]}].map(B=>({...B,items:B.items.map(f=>({...f,active:f.key===t,to:`/${f.key}`}))})),V=[{id:"navigate",heading:"Navigate",items:[{id:"widgets",label:"Widgets",icon:w,onSelect:()=>i("widgets")},{id:"orders",label:"Orders",icon:y,onSelect:()=>i("orders")},{id:"services",label:"Services",icon:j,onSelect:()=>i("services")}]},{id:"actions",heading:"Actions",items:[{id:"docs",label:"Open documentation",icon:q,shortcut:"⌘D"},{id:"archive",label:"Archive selection",disabled:!0}]}],v=t.charAt(0).toUpperCase()+t.slice(1);return e.jsx("div",{className:"h-full",children:e.jsx(J,{client:o,children:e.jsxs(H,{adapter:s,children:[e.jsx(d,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground",children:"a"}),navSections:X,nav:e.jsxs("nav",{"aria-label":"Breadcrumb",className:"flex items-center gap-1 text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Catalog"}),e.jsx("span",{className:"text-muted-foreground/60",children:"›"}),e.jsx("span",{className:"font-medium text-foreground",children:v})]}),search:e.jsx(ie,{onClick:()=>a(!0),open:r,label:"Search commands…"}),actions:e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:K,className:"flex items-center"}),e.jsx(te,{checked:N,onChange:U,label:e.jsx("span",{className:"text-xs text-muted-foreground",children:"Debug"}),"aria-label":"Outline AppShell slots"}),e.jsx(n,{variant:"outline",size:"sm",children:"acme-prod ▾"}),e.jsx(ne,{alt:"Ada Lovelace",size:"sm",title:"Ada Lovelace"})]}),debugSlots:N,bodyHeader:e.jsxs("div",{className:"min-w-0",children:[e.jsx("h1",{className:"text-lg font-semibold",children:v}),e.jsxs("p",{className:"mt-0.5 text-sm text-muted-foreground",children:["Remote-paged ",t,"."]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"outline",size:"sm",children:"Export"}),e.jsx("div",{ref:$,className:"flex items-center"})]}),contentClassName:"flex min-h-0 flex-col overflow-hidden p-density-4",children:e.jsx(se,{definition:{key:t,title:v,description:`Remote-paged ${t}.`},entities:[t.replace(/s$/,"")],surfaceKey:t,client:re,renderLink:oe,viewToggleContainer:G,actionsContainer:Q},t)}),e.jsx(le,{open:r,onOpenChange:a,groups:V,footer:"↑↓ navigate · ↵ run · esc close"})]})})})}var S,k,T;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(T=(k=u.parameters)==null?void 0:k.docs)==null?void 0:T.source}}};var A,C,R;h.parameters={...h.parameters,docs:{...(A=h.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
}`,...(R=(C=h.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var z,E,O;x.parameters={...x.parameters,docs:{...(z=x.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(O=(E=x.parameters)==null?void 0:E.docs)==null?void 0:O.source}}};var P,D,L;b.parameters={...b.parameters,docs:{...(P=b.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/policies");
    return <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <WithSidebarBody />
        </RouterProvider>
      </div>;
  }
}`,...(L=(D=b.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var M,F,W;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "AppShell hosting an rpc-driven table. \`contentClassName\` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new \`offset\` against the synthetic OperationsApiClient, which slices its row set and reports \`{total, limit, offset}\` exactly as a real backend would via \`X-Total-Count\`."
      }
    }
  },
  render: () => <RpcWorkbenchBody />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("the table pages remotely, keeping the header and footer pinned", async () => {
      await canvas.findByText(/Page 1 of/, undefined, {
        timeout: 5000
      });
      const scroller = canvasElement.querySelector<HTMLElement>('[data-slot="operation-catalog-results"] .overflow-auto');
      await expect(scroller).not.toBeNull();
      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
        // The column header is sticky inside the scroller, so it stays on
        // screen; <main> itself never scrolls because contentClassName makes it
        // overflow-hidden.
        const main = canvasElement.querySelector("main");
        await expect(main?.scrollTop ?? 0).toBe(0);
      }
      await userEvent.click(canvas.getByRole("button", {
        name: "Next page"
      }));
      await expect(await canvas.findByText(/Page 2 of/)).toBeInTheDocument();
    });
    await step("⌘K opens the palette, filters, and runs a command", async () => {
      await userEvent.keyboard("{Meta>}k{/Meta}");
      const dialog = await body.findByRole("dialog", {
        name: "Command palette"
      });
      await expect(dialog).toBeInTheDocument();

      // Scope to the dialog: the table below has its own filter comboboxes.
      await userEvent.type(within(dialog).getByRole("combobox"), "orders");
      await userEvent.keyboard("{Enter}");
      await expect(body.queryByRole("dialog", {
        name: "Command palette"
      })).not.toBeInTheDocument();
      // Assert via the top-bar breadcrumb: the catalog renders its own "Orders"
      // heading too, so a bare text match would be ambiguous.
      const breadcrumb = canvas.getByRole("navigation", {
        name: "Breadcrumb"
      });
      await expect(within(breadcrumb).getByText("Orders")).toBeInTheDocument();
    });
  }
}`,...(W=(F=g.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};const Ot=["Default","NoToolbar","CompactMobileActions","WithSidebar","RpcWorkbench"];export{x as CompactMobileActions,u as Default,h as NoToolbar,g as RpcWorkbench,b as WithSidebar,Ot as __namedExportsOrder,Et as default};

import{j as e,bb as y,r as c,at as w,c as j,bc as _,bd as q}from"./iframe-CO2OWIcl.js";import{Q as X}from"./queryClient-Cy1qTPzc.js";import{Q as Y}from"./suspense-DVgqdN32.js";import{A as d,R as I}from"./RouterProvider-Dbe-w35H.js";import{T as J}from"./Tabs-a4HFhCHc.js";import{P as V}from"./Panel-D10iyGzX.js";import{B as a}from"./button-Bu_B8JVi.js";import{S as Z}from"./Switch-BkKs-bz1.js";import{A as ee}from"./Avatar-Ch0_HuMY.js";import{u as U,a as te}from"./DataTable-BrunOdUo.js";import{O as ae}from"./OperationCatalog-C96FEmJN.js";import{a as ne,F as se}from"./rpc-story.fixtures-D2w_4_4-.js";import{C as oe,a as re}from"./CommandPaletteTrigger-DyEUJH-X.js";import"./preload-helper-DArPGhL4.js";import"./utils-CR52uffu.js";import"./Icon-Ca6C5XSP.js";import"./modalStack-95CCirY1.js";import"./zIndex-CigQ76av.js";import"./SplitPane-7FN8QotX.js";import"./TabButton-fu7cNpkP.js";import"./PanelFrame-DcTSIm01.js";import"./index-0zBpNI7D.js";import"./loading-DwsLYBnU.js";import"./SortableHeader-NKlwzOpW.js";import"./Modal--FwZ0JK0.js";import"./index-AY2VqcVr.js";import"./index-C_7VCUmk.js";import"./FilterBar-DcWg-25O.js";import"./floating-ui.react-ur1ggk9d.js";import"./FilterPill-DzFH1rjp.js";import"./Combobox-Cr1q8vF4.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Dp9pfzk5.js";import"./MultiSelect-Dv3t1vnK.js";import"./RangeSlider-Dy841O8G.js";import"./TimeRange-Cl-gcDPs.js";import"./select-Dbmz5xyR.js";import"./Timestamp-ZNzfkKGT.js";import"./TagList-CFSf4mOC.js";import"./Badge-D-psD5oA.js";import"./HoverCard-QcliMvWD.js";import"./Properties-_5vvA_L7.js";import"./IconButton-DjVQfPc4.js";import"./DropdownMenu-QnXTd0FN.js";import"./DropdownMenuSubmenu-DK7w7Yyk.js";import"./StatusDot-DHs18AaV.js";import"./useQuery-CCDeEIXf.js";import"./Clicky-CCfKVesb.js";import"./FilterForm-CPxyBzyo.js";import"./types-BHfRQr8X.js";import"./Tree-BBPf-Zpr.js";import"./TreeNode-B5bD_jCA.js";import"./ObjectGraph-D1YkdxLG.js";import"./ExecutionTree-CdxlOodA.js";import"./CodeBlock-B-QcEeJq.js";import"./CodeDiff-CMuLnFy2.js";import"./SegmentedControl-D2_CFqN5.js";import"./code-highlight-eGaMz-TS.js";import"./JsonView-BdIcH9Xw.js";import"./RenderedStackTrace-b4QqQsCu.js";import"./clickyMetadata-DFwyi2hR.js";import"./EndpointList-D6XD59_P.js";import"./MethodBadge-vJ4X-wPL.js";import"./OperationActionBar-pTuPh2_Q.js";import"./ExecutionResult-Dfb7o1ea.js";import"./CommandOutput-CWdzhmug.js";import"./public-api-BjCjxHuM.js";import"./JsonSchemaForm-DEsiIoLq.js";import"./json-schema-form-utils-De9hQamh.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./OperationResultView-BmgvtTTG.js";import"./rowNavigation-D5qHVDdZ.js";import"./command-form-utils-C0Xv-EwX.js";import"./use-hotkey-s4QzgwjD.js";const{expect:l,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,Rt={title:"Layout/AppShell",component:d,parameters:{layout:"fullscreen",docs:{description:{component:"Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout."}}}},u={render:()=>{const[s,o]=c.useState("prs");return e.jsx("div",{className:"h-[480px]",children:e.jsx(d,{brand:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"g"}),e.jsx("span",{className:"font-bold tracking-tight",children:"gavel"})]}),nav:e.jsx(J,{tabs:[{id:"prs",label:"Pull requests"},{id:"activity",label:"Activity"}],value:s,onChange:o}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"ghost",size:"sm",children:"Light/Dark"}),e.jsx(a,{size:"sm",children:"New"})]}),toolbar:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Filters go here"}),e.jsx("div",{className:"flex-1"}),e.jsx(a,{variant:"outline",size:"sm",children:"Export"})]}),children:e.jsx("div",{className:"h-full overflow-y-auto p-density-4",children:e.jsx(V,{title:"Content",count:2,children:e.jsx("p",{className:"text-sm",children:"The routed content area scrolls here."})})})})})}},h={render:()=>e.jsx("div",{className:"h-[320px]",children:e.jsx(d,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),actions:e.jsx(a,{size:"sm",children:"Action"}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"No toolbar row."})})})},x={render:()=>e.jsx("div",{className:"h-[420px]",children:e.jsx(d,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),navSections:[{items:[{key:"runs",label:"Runs",icon:y,to:"/runs"}]}],actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{size:"sm",children:"Run capture"}),e.jsx(a,{variant:"outline",size:"sm",children:"Edit target"}),e.jsx(a,{variant:"outline",size:"sm",children:"Workspace with a long name"})]}),mobileActions:e.jsxs(e.Fragment,{children:[e.jsx(a,{size:"sm",children:"Run"}),e.jsx(a,{variant:"outline",size:"sm",children:"More"})]}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster."})})})},b={render:()=>{const s=U("/policies");return e.jsx("div",{className:"h-[560px]",children:e.jsx(I,{adapter:s,children:e.jsx(ie,{})})})}};function ie(){const{pathname:s}=te(),o=s.replace(/^\//,""),r=[{label:"Operations",items:[{key:"dashboard",label:"Dashboard",icon:y},{key:"policies",label:"Policies",icon:w},{key:"clients",label:"Clients",icon:_}].map(n=>({...n,active:n.key===o,to:`/${n.key}`}))},{label:"System",items:[{key:"docs",label:"Docs",icon:q},{key:"settings",label:"Settings",icon:j}].map(n=>({...n,active:n.key===o,to:`/${n.key}`}))}];return e.jsx(d,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"m"}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search anything…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"ghost",size:"sm",children:"Docs"}),e.jsx(a,{variant:"outline",size:"sm",children:"LAB_DEMO_QA ▾"})]}),navSections:r,collapsedStorageKey:"sb-demo:collapsed",bodyHeader:e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-muted-foreground",children:"Products › Risk Products › Group Life"}),e.jsx("h1",{className:"mt-1 text-lg font-semibold",children:"Group Life"}),e.jsxs("div",{className:"mt-2 flex gap-density-3 text-sm text-muted-foreground",children:[e.jsx("span",{className:"font-medium text-foreground",children:"Overview"}),e.jsx("span",{children:"Transactions"}),e.jsx("span",{children:"Eligibility"})]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"outline",size:"sm",children:"Edit"}),e.jsx(a,{size:"sm",children:"Run"})]}),bodySidebar:e.jsxs("nav",{className:"p-density-2 text-sm",children:[e.jsx("div",{className:"mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Plans (299)"}),Array.from({length:40},(n,t)=>e.jsxs("div",{className:"truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground",children:["Scheme-G",String(36031+t).padStart(7,"0")]},t))]}),children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",o," — body-main scrolls here."]})})}const g={parameters:{docs:{description:{story:"AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`."}}},render:()=>e.jsx(le,{}),play:async({canvasElement:s,step:o})=>{const r=p(s),n=p(document.body);await o("the table pages remotely, keeping the header and footer pinned",async()=>{await r.findByText(/Page 1 of/,void 0,{timeout:5e3});const t=s.querySelector('[data-slot="operation-catalog-results"] .overflow-auto');if(await l(t).not.toBeNull(),t){t.scrollTop=t.scrollHeight;const i=s.querySelector("main");await l((i==null?void 0:i.scrollTop)??0).toBe(0)}await m.click(r.getByRole("button",{name:"Next page"})),await l(await r.findByText(/Page 2 of/)).toBeInTheDocument()}),await o("⌘K opens the palette, filters, and runs a command",async()=>{await m.keyboard("{Meta>}k{/Meta}");const t=await n.findByRole("dialog",{name:"Command palette"});await l(t).toBeInTheDocument(),await m.type(p(t).getByRole("combobox"),"orders"),await m.keyboard("{Enter}"),await l(n.queryByRole("dialog",{name:"Command palette"})).not.toBeInTheDocument();const i=r.getByRole("navigation",{name:"Breadcrumb"});await l(p(i).getByText("Orders")).toBeInTheDocument()})}};function le(){const s=U("/widgets"),o=c.useMemo(()=>new X({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),[r,n]=c.useState(!1),[t,i]=c.useState("widgets"),[N,H]=c.useState(!1),[G,K]=c.useState(null),Q=[{label:"Inventory",items:[{key:"widgets",label:"Widgets",icon:w},{key:"orders",label:"Orders",icon:y}]},{label:"Platform",items:[{key:"services",label:"Services",icon:j},{key:"clients",label:"Clients",icon:_}]}].map(B=>({...B,items:B.items.map(f=>({...f,active:f.key===t,to:`/${f.key}`}))})),$=[{id:"navigate",heading:"Navigate",items:[{id:"widgets",label:"Widgets",icon:w,onSelect:()=>i("widgets")},{id:"orders",label:"Orders",icon:y,onSelect:()=>i("orders")},{id:"services",label:"Services",icon:j,onSelect:()=>i("services")}]},{id:"actions",heading:"Actions",items:[{id:"docs",label:"Open documentation",icon:q,shortcut:"⌘D"},{id:"archive",label:"Archive selection",disabled:!0}]}],v=t.charAt(0).toUpperCase()+t.slice(1);return e.jsx("div",{className:"h-full",children:e.jsx(Y,{client:o,children:e.jsxs(I,{adapter:s,children:[e.jsx(d,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground",children:"a"}),navSections:Q,nav:e.jsxs("nav",{"aria-label":"Breadcrumb",className:"flex items-center gap-1 text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Catalog"}),e.jsx("span",{className:"text-muted-foreground/60",children:"›"}),e.jsx("span",{className:"font-medium text-foreground",children:v})]}),search:e.jsx(oe,{onClick:()=>n(!0),open:r,label:"Search commands…"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(Z,{checked:N,onChange:H,label:e.jsx("span",{className:"text-xs text-muted-foreground",children:"Debug"}),"aria-label":"Outline AppShell slots"}),e.jsx(a,{variant:"outline",size:"sm",children:"acme-prod ▾"}),e.jsx(ee,{alt:"Ada Lovelace",size:"sm",title:"Ada Lovelace"})]}),debugSlots:N,bodyHeader:e.jsxs("div",{className:"min-w-0",children:[e.jsx("h1",{className:"text-lg font-semibold",children:v}),e.jsxs("p",{className:"mt-0.5 text-sm text-muted-foreground",children:["Remote-paged ",t,"."]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"outline",size:"sm",children:"Export"}),e.jsx("div",{ref:K,className:"flex items-center"})]}),contentClassName:"flex min-h-0 flex-col overflow-hidden p-density-4",children:e.jsx(ae,{definition:{key:t,title:v,description:`Remote-paged ${t}.`},entities:[t.replace(/s$/,"")],surfaceKey:t,client:se,renderLink:ne,actionsContainer:G},t)}),e.jsx(re,{open:r,onOpenChange:n,groups:$,footer:"↑↓ navigate · ↵ run · esc close"})]})})})}var S,k,T;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(W=(F=g.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};const zt=["Default","NoToolbar","CompactMobileActions","WithSidebar","RpcWorkbench"];export{x as CompactMobileActions,u as Default,h as NoToolbar,g as RpcWorkbench,b as WithSidebar,zt as __namedExportsOrder,Rt as default};

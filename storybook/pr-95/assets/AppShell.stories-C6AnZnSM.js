import{j as e,bo as v,r as d,b as f,aJ as N,bp as G,bq as K}from"./iframe-DknlViNB.js";import{Q as ee}from"./queryClient-D5xIrDde.js";import{Q as te}from"./suspense-CYaLyhBq.js";import{A as c,R as B}from"./RouterProvider-lD-WZlUt.js";import{T as ae}from"./Tabs-Bgw8n6MP.js";import{P as ne}from"./Panel-BDtoPiIZ.js";import{B as r}from"./button-hM0oAGY1.js";import{S as se}from"./Switch-DA9Ut9iD.js";import{A as oe}from"./Avatar-BdJi1JNu.js";import{u as k,a as Q}from"./router-CFd004yJ.js";import{O as re}from"./OperationCatalog-35t394Cn.js";import{a as ie,F as le}from"./rpc-story.fixtures-CtBdrkbK.js";import{C as ce,a as de}from"./CommandPaletteTrigger-JcBuD1nH.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-BHRmh9yr.js";import"./modalStack-BaR_AbUd.js";import"./zIndex-BGbNBNA8.js";import"./SplitPane-BnFJaLLc.js";import"./ContextMenu-C1af2e3t.js";import"./floating-ui.react-CPGroB7w.js";import"./index-BUJq7VBZ.js";import"./index-CIJgeimQ.js";import"./DropdownMenuSubmenu-R1W4qY9F.js";import"./TabButton-CxT8eMOO.js";import"./PanelFrame-DEpVJkwP.js";import"./index-CPURVhFy.js";import"./loading-PcIlwrbj.js";import"./useQuery-D2JfShNX.js";import"./OperationResultView-C_xiqIoz.js";import"./Clicky-De7ETdDr.js";import"./FilterForm-SPv5fGNV.js";import"./FilterBar-CyIfnKZQ.js";import"./FilterPill-g39yZIfN.js";import"./Combobox-CPIWCZ0V.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-B1uWUfxp.js";import"./DateTimePicker-0Xoja836.js";import"./MultiSelect-5_dLzdfE.js";import"./RangeSlider-DSxwZrCQ.js";import"./TimeRange-De7RIHvg.js";import"./select-BLhKUfXD.js";import"./WorkloadPicker-Bg59eYpY.js";import"./NamespacePicker-DjiqICAs.js";import"./index-D84zPWEV.js";import"./formMetadata-QKnrUsCv.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./ErrorDetails-Dyn2k6tg.js";import"./string-Ye519DiV.js";import"./DataTable-BThdWaIM.js";import"./SortableHeader-DQYKvo-_.js";import"./Timestamp-C7lJAFIW.js";import"./TagList-CTMpl2ld.js";import"./Badge-D5az-60y.js";import"./HoverCard-YLwe9yTe.js";import"./Properties-Ca7T3aE-.js";import"./IconButton-BpNQQRny.js";import"./DropdownMenu-BcAr2u9p.js";import"./StatusDot-Dnm2B4ou.js";import"./callout-tones-EFt49BYo.js";import"./Tree-a521gYsD.js";import"./TreeNode-CZhztgZf.js";import"./ObjectGraph-dBPFXf_a.js";import"./ExecutionTree-D5xv-ExU.js";import"./CodeBlock-CP33aCHU.js";import"./CodeDiff-CV_7POg6.js";import"./SegmentedControl-BxAx_Iqi.js";import"./HighlightedTokens-nzdgZDVi.js";import"./JsonView-C7Dguwa1.js";import"./RenderedStackTrace-IqkBJd5M.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Cj9hriwv.js";import"./FrameSourceWindow-B9vdFSdu.js";import"./useDebugAction-BtbwSfUu.js";import"./debugConsoleSignal-B72erEWu.js";import"./ExecutionResult-CArg9n2W.js";import"./CommandOutput-CFHtTHR2.js";import"./rowNavigation-CaIOujob.js";import"./clickyMetadata-BqKwW4N5.js";import"./command-form-utils-C0Xv-EwX.js";import"./EndpointList-D1r0pw6l.js";import"./MethodBadge-BdxZ5z4Z.js";import"./OperationActionBar-CTWSMyLN.js";import"./public-api-BjCjxHuM.js";import"./JsonSchemaForm-DT5aM1QN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./DateField-CfxqunjW.js";import"./DatePicker-CPjPBJAD.js";import"./TreePickerField-Dmvqnzn9.js";import"./AccordionList-RDFsVxN7.js";import"./InputField-w6pAUuma.js";import"./use-hotkey-Cud8uTbq.js";import"./ListMenu-D5O-ARwb.js";import"./Markdown--ifOE9wQ.js";import"./Callout-ZUHlT26s.js";import"./operationLookupFetcher-B_eAJdqQ.js";import"./InlineError-DEcnMro1.js";import"./sessionTypes-BbFOT9zU.js";import"./event-source-BEx6zMK_.js";const{expect:i,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,la={title:"Layout/AppShell",component:c,parameters:{layout:"fullscreen",docs:{description:{component:"Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout."}}}},u={render:()=>{const[s,t]=d.useState("prs");return e.jsx("div",{className:"h-[480px]",children:e.jsx(c,{brand:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"g"}),e.jsx("span",{className:"font-bold tracking-tight",children:"gavel"})]}),nav:e.jsx(ae,{tabs:[{id:"prs",label:"Pull requests"},{id:"activity",label:"Activity"}],value:s,onChange:t}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(r,{variant:"ghost",size:"sm",children:"Light/Dark"}),e.jsx(r,{size:"sm",children:"New"})]}),toolbar:e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Filters go here"}),e.jsx("div",{className:"flex-1"}),e.jsx(r,{variant:"outline",size:"sm",children:"Export"})]}),children:e.jsx("div",{className:"h-full overflow-y-auto p-density-4",children:e.jsx(ne,{title:"Content",count:2,children:e.jsx("p",{className:"text-sm",children:"The routed content area scrolls here."})})})})})}},h={render:()=>e.jsx("div",{className:"h-[320px]",children:e.jsx(c,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),actions:e.jsx(r,{size:"sm",children:"Action"}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"No toolbar row."})})})},g={render:()=>e.jsx("div",{className:"h-[420px]",children:e.jsx(c,{brand:e.jsx("span",{className:"font-bold",children:"gavel"}),navSections:[{items:[{key:"runs",label:"Runs",icon:v,to:"/runs"}]}],actions:e.jsxs(e.Fragment,{children:[e.jsx(r,{size:"sm",children:"Run capture"}),e.jsx(r,{variant:"outline",size:"sm",children:"Edit target"}),e.jsx(r,{variant:"outline",size:"sm",children:"Workspace with a long name"})]}),mobileActions:e.jsxs(e.Fragment,{children:[e.jsx(r,{size:"sm",children:"Run"}),e.jsx(r,{variant:"outline",size:"sm",children:"More"})]}),children:e.jsx("div",{className:"p-density-4 text-sm text-muted-foreground",children:"Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster."})})})},b={render:()=>{const s=k("/policies");return e.jsx("div",{className:"h-[560px]",children:e.jsx(B,{adapter:s,children:e.jsx(me,{})})})}};function me(){const{pathname:s}=Q(),t=s.replace(/^\//,""),o=[{label:"Operations",items:[{key:"dashboard",label:"Dashboard",icon:v},{key:"policies",label:"Policies",icon:N},{key:"clients",label:"Clients",icon:G}].map(n=>({...n,active:n.key===t,to:`/${n.key}`}))},{label:"System",items:[{key:"docs",label:"Docs",icon:K},{key:"settings",label:"Settings",icon:f}].map(n=>({...n,active:n.key===t,to:`/${n.key}`}))}];return e.jsx(c,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"m"}),search:e.jsx("input",{"aria-label":"search",placeholder:"Search anything…",className:"w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(r,{variant:"ghost",size:"sm",children:"Docs"}),e.jsx(r,{variant:"outline",size:"sm",children:"LAB_DEMO_QA ▾"})]}),navSections:o,collapsedStorageKey:"sb-demo:collapsed",bodyHeader:e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-muted-foreground",children:"Products › Risk Products › Group Life"}),e.jsx("h1",{className:"mt-1 text-lg font-semibold",children:"Group Life"}),e.jsxs("div",{className:"mt-2 flex gap-density-3 text-sm text-muted-foreground",children:[e.jsx("span",{className:"font-medium text-foreground",children:"Overview"}),e.jsx("span",{children:"Transactions"}),e.jsx("span",{children:"Eligibility"})]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(r,{variant:"outline",size:"sm",children:"Edit"}),e.jsx(r,{size:"sm",children:"Run"})]}),bodySidebar:e.jsxs("nav",{className:"p-density-2 text-sm",children:[e.jsx("div",{className:"mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Plans (299)"}),Array.from({length:40},(n,a)=>e.jsxs("div",{className:"truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground",children:["Scheme-G",String(36031+a).padStart(7,"0")]},a))]}),children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",t," — body-main scrolls here."]})})}const x={render:()=>{const s=k("/jms-incoming");return e.jsx("div",{className:"h-[560px]",children:e.jsx(B,{adapter:s,children:e.jsx(pe,{})})})},play:async({canvasElement:s})=>{const t=p(s),o=t.getByRole("link",{name:"jms"});await i(o).toHaveAttribute("href","/jms");const n=t.getByRole("button",{name:/Collapse jms$/});await i(o.contains(n)).toBe(!1),await i(t.getByRole("link",{name:"disbursements"})).toBeTruthy(),await m.click(n),await i(t.queryByRole("link",{name:"disbursements"})).toBeNull(),await i(t.getByRole("link",{name:"jms"})).toBeTruthy()}};function pe(){const{pathname:s}=Q(),t=(o,n)=>({key:o,label:n,active:s===`/${o}`,to:`/${o}`});return e.jsx(c,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold",children:"q"}),navSections:[{label:"Profiles",items:[{...t("http","http"),icon:f}],groups:[{key:"jms",label:"jms",item:t("jms","jms"),items:[t("jms-all","all"),t("jms-failed","failed")],groups:[{key:"jms/incoming",label:"incoming",item:t("jms-incoming","incoming"),items:[t("jms-incoming-disbursements","disbursements")]}]},{key:"logs",label:"logs",items:[t("logs-api","api"),t("logs-core","core")]}]}],collapsedStorageKey:"sb-demo:nested-collapsed",groupCollapsedStorageKey:"sb-demo:nested-groups",children:e.jsxs("div",{className:"p-density-4 text-sm",children:["Active: ",s," — the rail nests as deep as the backend declares."]})})}const y={parameters:{docs:{description:{story:"AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`."}}},render:()=>e.jsx(ue,{}),play:async({canvasElement:s,step:t})=>{const o=p(s),n=p(document.body);await t("the table pages remotely, keeping the header and footer pinned",async()=>{await o.findByText(/Page 1 of/,void 0,{timeout:5e3});const a=s.querySelector('[data-slot="operation-catalog-results"] .overflow-auto');if(await i(a).not.toBeNull(),a){a.scrollTop=a.scrollHeight;const l=s.querySelector("main");await i((l==null?void 0:l.scrollTop)??0).toBe(0)}await m.click(o.getByRole("button",{name:"Next page"})),await i(await o.findByText(/Page 2 of/)).toBeInTheDocument()}),await t("⌘K opens the palette, filters, and runs a command",async()=>{await m.keyboard("{Meta>}k{/Meta}");const a=await n.findByRole("dialog",{name:"Command palette"});await i(a).toBeInTheDocument(),await m.type(p(a).getByRole("combobox"),"orders"),await m.keyboard("{Enter}"),await i(n.queryByRole("dialog",{name:"Command palette"})).not.toBeInTheDocument();const l=o.getByRole("navigation",{name:"Breadcrumb"});await i(p(l).getByText("Orders")).toBeInTheDocument()})}};function ue(){const s=k("/widgets"),t=d.useMemo(()=>new ee({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),[o,n]=d.useState(!1),[a,l]=d.useState("widgets"),[S,X]=d.useState(!1),[J,Y]=d.useState(null),V=[{label:"Inventory",items:[{key:"widgets",label:"Widgets",icon:N},{key:"orders",label:"Orders",icon:v}]},{label:"Platform",items:[{key:"services",label:"Services",icon:f},{key:"clients",label:"Clients",icon:G}]}].map(T=>({...T,items:T.items.map(w=>({...w,active:w.key===a,to:`/${w.key}`}))})),Z=[{id:"navigate",heading:"Navigate",items:[{id:"widgets",label:"Widgets",icon:N,onSelect:()=>l("widgets")},{id:"orders",label:"Orders",icon:v,onSelect:()=>l("orders")},{id:"services",label:"Services",icon:f,onSelect:()=>l("services")}]},{id:"actions",heading:"Actions",items:[{id:"docs",label:"Open documentation",icon:K,shortcut:"⌘D"},{id:"archive",label:"Archive selection",disabled:!0}]}],j=a.charAt(0).toUpperCase()+a.slice(1);return e.jsx("div",{className:"h-full",children:e.jsx(te,{client:t,children:e.jsxs(B,{adapter:s,children:[e.jsx(c,{brand:e.jsx("span",{className:"grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground",children:"a"}),navSections:V,nav:e.jsxs("nav",{"aria-label":"Breadcrumb",className:"flex items-center gap-1 text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Catalog"}),e.jsx("span",{className:"text-muted-foreground/60",children:"›"}),e.jsx("span",{className:"font-medium text-foreground",children:j})]}),search:e.jsx(ce,{onClick:()=>n(!0),open:o,label:"Search commands…"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(se,{checked:S,onChange:X,label:e.jsx("span",{className:"text-xs text-muted-foreground",children:"Debug"}),"aria-label":"Outline AppShell slots"}),e.jsx(r,{variant:"outline",size:"sm",children:"acme-prod ▾"}),e.jsx(oe,{alt:"Ada Lovelace",size:"sm",title:"Ada Lovelace"})]}),debugSlots:S,bodyHeader:e.jsxs("div",{className:"min-w-0",children:[e.jsx("h1",{className:"text-lg font-semibold",children:j}),e.jsxs("p",{className:"mt-0.5 text-sm text-muted-foreground",children:["Remote-paged ",a,"."]})]}),bodyActions:e.jsxs(e.Fragment,{children:[e.jsx(r,{variant:"outline",size:"sm",children:"Export"}),e.jsx("div",{ref:Y,className:"flex items-center"})]}),contentClassName:"flex min-h-0 flex-col overflow-hidden p-density-4",children:e.jsx(re,{definition:{key:a,title:j,description:`Remote-paged ${a}.`},entities:[a.replace(/s$/,"")],surfaceKey:a,client:le,renderLink:ie,actionsContainer:J},a)}),e.jsx(de,{open:o,onOpenChange:n,groups:Z,footer:"↑↓ navigate · ↵ run · esc close"})]})})})}var R,A,C;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(C=(A=u.parameters)==null?void 0:A.docs)==null?void 0:C.source}}};var E,z,P;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
}`,...(P=(z=h.parameters)==null?void 0:z.docs)==null?void 0:P.source}}};var O,D,M;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...(M=(D=g.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var q,L,F;b.parameters={...b.parameters,docs:{...(q=b.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/policies");
    return <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <WithSidebarBody />
        </RouterProvider>
      </div>;
  }
}`,...(F=(L=b.parameters)==null?void 0:L.docs)==null?void 0:F.source}}};var W,_,H;x.parameters={...x.parameters,docs:{...(W=x.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/jms-incoming");
    return <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <NestedNavBody />
        </RouterProvider>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // The folder-and-leaf row exposes both affordances, as siblings.
    const jms = canvas.getByRole("link", {
      name: "jms"
    });
    await expect(jms).toHaveAttribute("href", "/jms");
    const caret = canvas.getByRole("button", {
      name: /Collapse jms$/
    });
    await expect(jms.contains(caret)).toBe(false);

    // Depth 3 renders, and collapsing the root takes the whole subtree with it
    // while leaving the root's own destination in place.
    await expect(canvas.getByRole("link", {
      name: "disbursements"
    })).toBeTruthy();
    await userEvent.click(caret);
    await expect(canvas.queryByRole("link", {
      name: "disbursements"
    })).toBeNull();
    await expect(canvas.getByRole("link", {
      name: "jms"
    })).toBeTruthy();
  }
}`,...(H=(_=x.parameters)==null?void 0:_.docs)==null?void 0:H.source}}};var I,U,$;y.parameters={...y.parameters,docs:{...(I=y.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...($=(U=y.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};const ca=["Default","NoToolbar","CompactMobileActions","WithSidebar","NestedNavGroups","RpcWorkbench"];export{g as CompactMobileActions,u as Default,x as NestedNavGroups,h as NoToolbar,y as RpcWorkbench,b as WithSidebar,ca as __namedExportsOrder,la as default};

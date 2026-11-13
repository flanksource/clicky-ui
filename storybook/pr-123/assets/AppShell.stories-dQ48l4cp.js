import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./OperationCatalog-CIwbSZhm.js";import{Cc as a,Nc as o,Qr as s,Tc as c,n as l,yr as u}from"./icons-jF94OYl1.js";import{n as d,t as f}from"./button-ptiHqllF.js";import{n as p,t as m}from"./Tabs-CL4XaR-X.js";import{n as h,t as g}from"./Avatar-D5WVYF27.js";import{i as _,n as v,r as y}from"./router-BBsnAkjj.js";import{n as b,t as ee}from"./Switch-BfLTLIQg.js";import{g as x,h as te}from"./suspense-Bcp9qyqt.js";import{n as S,t as C}from"./queryClient-BlbTeML9.js";import{i as w,n as T,r as E,t as D}from"./RouterProvider-DrT0gp_d.js";import{n as O,t as k}from"./Panel-BB8t7IOW.js";import{i as A,n as j,r as M,t as N}from"./CommandPaletteTrigger-DqZIRCfR.js";import{a as P,o as ne,t as re}from"./rpc-story.fixtures-Cm67zRhY.js";function ie(){let[e,t]=(0,R.useState)(``);return(0,z.jsx)(`div`,{className:`h-[520px] w-[390px] border border-border`,children:(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`font-bold`,children:`gavel`}),navSections:[{items:[{key:`prs`,label:`PRs`,icon:a,to:`/prs`,active:!0}]}],bodySidebar:(0,z.jsx)(`ul`,{className:`divide-y divide-border`,children:q.map(e=>(0,z.jsx)(`li`,{children:(0,z.jsx)(`button`,{type:`button`,className:`min-h-11 w-full px-density-3 text-left text-sm`,onClick:()=>t(e),children:e})},e))}),bodyPane:e?`main`:`sidebar`,onBodyBack:()=>t(``),bodyBackLabel:`Back to pull requests`,children:(0,z.jsx)(`div`,{className:`p-density-4 text-sm`,children:e||`Select a pull request`})})})}function F(){let{pathname:e}=_(),t=e.replace(/^\//,``),n=[{label:`Operations`,items:[{key:`dashboard`,label:`Dashboard`,icon:a},{key:`policies`,label:`Policies`,icon:c},{key:`clients`,label:`Clients`,icon:u}].map(e=>({...e,active:e.key===t,to:`/${e.key}`}))},{label:`System`,items:[{key:`docs`,label:`Docs`,icon:o},{key:`settings`,label:`Settings`,icon:s}].map(e=>({...e,active:e.key===t,to:`/${e.key}`}))}];return(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`m`}),search:(0,z.jsx)(`input`,{"aria-label":`search`,placeholder:`Search anything…`,className:`w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none`}),actions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{variant:`ghost`,size:`sm`,children:`Docs`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`LAB_DEMO_QA ▾`})]}),navSections:n,collapsedStorageKey:`sb-demo:collapsed`,bodyHeader:(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:`Products › Risk Products › Group Life`}),(0,z.jsx)(`h1`,{className:`mt-1 text-lg font-semibold`,children:`Group Life`}),(0,z.jsxs)(`div`,{className:`mt-2 flex gap-density-3 text-sm text-muted-foreground`,children:[(0,z.jsx)(`span`,{className:`font-medium text-foreground`,children:`Overview`}),(0,z.jsx)(`span`,{children:`Transactions`}),(0,z.jsx)(`span`,{children:`Eligibility`})]})]}),bodyActions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`Edit`}),(0,z.jsx)(f,{size:`sm`,children:`Run`})]}),bodySidebar:(0,z.jsxs)(`nav`,{className:`p-density-2 text-sm`,children:[(0,z.jsx)(`div`,{className:`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground`,children:`Plans (299)`}),Array.from({length:40},(e,t)=>(0,z.jsxs)(`div`,{className:`truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground`,children:[`Scheme-G`,String(36031+t).padStart(7,`0`)]},t))]}),children:(0,z.jsxs)(`div`,{className:`p-density-4 text-sm`,children:[`Active: `,t,` — body-main scrolls here.`]})})}function I(){let{pathname:e}=_(),t=(t,n)=>({key:t,label:n,active:e===`/${t}`,to:`/${t}`});return(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`q`}),navSections:[{label:`Profiles`,items:[{...t(`http`,`http`),icon:s}],groups:[{key:`jms`,label:`jms`,item:t(`jms`,`jms`),items:[t(`jms-all`,`all`),t(`jms-failed`,`failed`)],groups:[{key:`jms/incoming`,label:`incoming`,item:t(`jms-incoming`,`incoming`),items:[t(`jms-incoming-disbursements`,`disbursements`)]}]},{key:`logs`,label:`logs`,items:[t(`logs-api`,`api`),t(`logs-core`,`core`)]}]}],collapsedStorageKey:`sb-demo:nested-collapsed`,groupCollapsedStorageKey:`sb-demo:nested-groups`,children:(0,z.jsxs)(`div`,{className:`p-density-4 text-sm`,children:[`Active: `,e,` — the rail nests as deep as the backend declares.`]})})}function L(){let e=y(`/widgets`),t=(0,R.useMemo)(()=>new C({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),[n,r]=(0,R.useState)(!1),[l,d]=(0,R.useState)(`widgets`),[p,m]=(0,R.useState)(!1),[h,_]=(0,R.useState)(null),v=[{label:`Inventory`,items:[{key:`widgets`,label:`Widgets`,icon:c},{key:`orders`,label:`Orders`,icon:a}]},{label:`Platform`,items:[{key:`services`,label:`Services`,icon:s},{key:`clients`,label:`Clients`,icon:u}]}].map(e=>({...e,items:e.items.map(e=>({...e,active:e.key===l,to:`/${e.key}`}))})),b=[{id:`navigate`,heading:`Navigate`,items:[{id:`widgets`,label:`Widgets`,icon:c,onSelect:()=>d(`widgets`)},{id:`orders`,label:`Orders`,icon:a,onSelect:()=>d(`orders`)},{id:`services`,label:`Services`,icon:s,onSelect:()=>d(`services`)}]},{id:`actions`,heading:`Actions`,items:[{id:`docs`,label:`Open documentation`,icon:o,shortcut:`⌘D`},{id:`archive`,label:`Archive selection`,disabled:!0}]}],x=l.charAt(0).toUpperCase()+l.slice(1);return(0,z.jsx)(`div`,{className:`h-full`,children:(0,z.jsx)(te,{client:t,children:(0,z.jsxs)(D,{adapter:e,children:[(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground`,children:`a`}),navSections:v,nav:(0,z.jsxs)(`nav`,{"aria-label":`Breadcrumb`,className:`flex items-center gap-1 text-xs`,children:[(0,z.jsx)(`span`,{className:`text-muted-foreground`,children:`Catalog`}),(0,z.jsx)(`span`,{className:`text-muted-foreground/60`,children:`›`}),(0,z.jsx)(`span`,{className:`font-medium text-foreground`,children:x})]}),search:(0,z.jsx)(N,{onClick:()=>r(!0),open:n,label:`Search commands…`}),actions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(ee,{checked:p,onChange:m,label:(0,z.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Debug`}),"aria-label":`Outline AppShell slots`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`acme-prod ▾`}),(0,z.jsx)(g,{alt:`Ada Lovelace`,size:`sm`,title:`Ada Lovelace`})]}),debugSlots:p,bodyHeader:(0,z.jsxs)(`div`,{className:`min-w-0`,children:[(0,z.jsx)(`h1`,{className:`text-lg font-semibold`,children:x}),(0,z.jsxs)(`p`,{className:`mt-0.5 text-sm text-muted-foreground`,children:[`Remote-paged `,l,`.`]})]}),bodyActions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`Export`}),(0,z.jsx)(`div`,{ref:_,className:`flex items-center`})]}),contentClassName:`flex min-h-0 flex-col overflow-hidden p-density-4`,children:(0,z.jsx)(i,{definition:{key:l,title:x,description:`Remote-paged ${l}.`},entities:[l.replace(/s$/,``)],surfaceKey:l,client:re,renderLink:P,actionsContainer:h},l)}),(0,z.jsx)(M,{open:n,onOpenChange:r,groups:b,footer:`↑↓ navigate · ↵ run · esc close`})]})})})}var R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{R=t(),S(),x(),w(),p(),O(),d(),b(),h(),T(),v(),r(),ne(),A(),j(),l(),z=n(),{expect:B,userEvent:V,within:H}=__STORYBOOK_MODULE_TEST__,U={title:`Layout/AppShell`,component:E,parameters:{layout:`fullscreen`,docs:{description:{component:`Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout.`}}}},W={render:()=>{let[e,t]=(0,R.useState)(`prs`);return(0,z.jsx)(`div`,{className:`h-[480px]`,children:(0,z.jsx)(E,{brand:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`g`}),(0,z.jsx)(`span`,{className:`font-bold tracking-tight`,children:`gavel`})]}),nav:(0,z.jsx)(m,{tabs:[{id:`prs`,label:`Pull requests`},{id:`activity`,label:`Activity`}],value:e,onChange:t}),search:(0,z.jsx)(`input`,{"aria-label":`search`,placeholder:`Search…`,className:`w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none`}),actions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{variant:`ghost`,size:`sm`,children:`Light/Dark`}),(0,z.jsx)(f,{size:`sm`,children:`New`})]}),toolbar:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`span`,{className:`text-sm text-muted-foreground`,children:`Filters go here`}),(0,z.jsx)(`div`,{className:`flex-1`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`Export`})]}),children:(0,z.jsx)(`div`,{className:`h-full overflow-y-auto p-density-4`,children:(0,z.jsx)(k,{title:`Content`,count:2,children:(0,z.jsx)(`p`,{className:`text-sm`,children:`The routed content area scrolls here.`})})})})})}},G={render:()=>(0,z.jsx)(`div`,{className:`h-[320px]`,children:(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`font-bold`,children:`gavel`}),actions:(0,z.jsx)(f,{size:`sm`,children:`Action`}),children:(0,z.jsx)(`div`,{className:`p-density-4 text-sm text-muted-foreground`,children:`No toolbar row.`})})})},K={render:()=>(0,z.jsx)(`div`,{className:`h-[420px]`,children:(0,z.jsx)(E,{brand:(0,z.jsx)(`span`,{className:`font-bold`,children:`gavel`}),navSections:[{items:[{key:`runs`,label:`Runs`,icon:a,to:`/runs`}]}],actions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{size:`sm`,children:`Run capture`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`Edit target`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`Workspace with a long name`})]}),mobileActions:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(f,{size:`sm`,children:`Run`}),(0,z.jsx)(f,{variant:`outline`,size:`sm`,children:`More`})]}),children:(0,z.jsx)(`div`,{className:`p-density-4 text-sm text-muted-foreground`,children:`Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster.`})})})},q=[`Fix parser`,`Add plan heatmap`,`Bump dependencies`],J={name:`Paged list/detail on a phone`,render:()=>(0,z.jsx)(ie,{}),play:async({canvasElement:e})=>{let t=H(e);await V.click(t.getByRole(`button`,{name:`Add plan heatmap`})),await B(t.getByText(`Add plan heatmap`,{selector:`div`})).toBeVisible(),await V.click(t.getByRole(`button`,{name:`Back to pull requests`})),await B(t.getByRole(`button`,{name:`Fix parser`})).toBeVisible()}},Y={render:()=>{let e=y(`/policies`);return(0,z.jsx)(`div`,{className:`h-[560px]`,children:(0,z.jsx)(D,{adapter:e,children:(0,z.jsx)(F,{})})})}},X={render:()=>{let e=y(`/jms-incoming`);return(0,z.jsx)(`div`,{className:`h-[560px]`,children:(0,z.jsx)(D,{adapter:e,children:(0,z.jsx)(I,{})})})},play:async({canvasElement:e})=>{let t=H(e),n=t.getByRole(`link`,{name:`jms`});await B(n).toHaveAttribute(`href`,`/jms`);let r=t.getByRole(`button`,{name:/Collapse jms$/});await B(n.contains(r)).toBe(!1),await B(t.getByRole(`link`,{name:`disbursements`})).toBeTruthy(),await V.click(r),await B(t.queryByRole(`link`,{name:`disbursements`})).toBeNull(),await B(t.getByRole(`link`,{name:`jms`})).toBeTruthy()}},Z={parameters:{docs:{description:{story:"AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`."}}},render:()=>(0,z.jsx)(L,{}),play:async({canvasElement:e,step:t})=>{let n=H(e),r=H(document.body);await t(`the table pages remotely, keeping the header and footer pinned`,async()=>{await n.findByText(/Page 1 of/,void 0,{timeout:5e3});let t=e.querySelector(`[data-slot="operation-catalog-results"] .overflow-auto`);if(await B(t).not.toBeNull(),t){t.scrollTop=t.scrollHeight;let n=e.querySelector(`main`);await B(n?.scrollTop??0).toBe(0)}await V.click(n.getByRole(`button`,{name:`Next page`})),await B(await n.findByText(/Page 2 of/)).toBeInTheDocument()}),await t(`⌘K opens the palette, filters, and runs a command`,async()=>{await V.keyboard(`{Meta>}k{/Meta}`);let e=await r.findByRole(`dialog`,{name:`Command palette`});await B(e).toBeInTheDocument(),await V.type(H(e).getByRole(`combobox`),`orders`),await V.keyboard(`{Enter}`),await B(r.queryByRole(`dialog`,{name:`Command palette`})).not.toBeInTheDocument();let t=n.getByRole(`navigation`,{name:`Breadcrumb`});await B(H(t).getByText(`Orders`)).toBeInTheDocument()})}},Q=[`Default`,`NoToolbar`,`CompactMobileActions`,`PagedListDetail`,`WithSidebar`,`NestedNavGroups`,`RpcWorkbench`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: "Paged list/detail on a phone",
  render: () => <PagedListDetailDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Add plan heatmap"
    }));
    await expect(canvas.getByText("Add plan heatmap", {
      selector: "div"
    })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {
      name: "Back to pull requests"
    }));
    await expect(canvas.getByRole("button", {
      name: "Fix parser"
    })).toBeVisible();
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/policies");
    return <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <WithSidebarBody />
        </RouterProvider>
      </div>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}}})))()}$();export{K as CompactMobileActions,W as Default,X as NestedNavGroups,G as NoToolbar,J as PagedListDetail,Z as RpcWorkbench,Y as WithSidebar,Q as __namedExportsOrder,U as default};
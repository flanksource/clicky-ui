import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./OperationCatalog-B6sQJKiK.js";import{Gr as a,dc as o,hr as s,n as c,pc as l,xc as u}from"./icons-N6BqLuiz.js";import{n as d,t as f}from"./button-DpHOAHuo.js";import{n as p,t as m}from"./Avatar-naQczMz8.js";import{i as h,n as g,r as _}from"./router-BBsnAkjj.js";import{n as v,t as y}from"./Tabs-DtBoGDgi.js";import{n as b,t as x}from"./Switch-C8CMOSD_.js";import{g as S,h as C}from"./suspense-Bcp9qyqt.js";import{n as w,t as T}from"./queryClient-BlbTeML9.js";import{i as E,n as D,r as O,t as k}from"./RouterProvider-CjKqt-S6.js";import{n as A,t as j}from"./Panel-DDCG2HYT.js";import{i as M,n as N,r as P,t as F}from"./CommandPaletteTrigger-CwZpKKTT.js";import{a as ee,o as te,t as I}from"./rpc-story.fixtures-Cm67zRhY.js";function L(){let{pathname:e}=h(),t=e.replace(/^\//,``),n=[{label:`Operations`,items:[{key:`dashboard`,label:`Dashboard`,icon:o},{key:`policies`,label:`Policies`,icon:l},{key:`clients`,label:`Clients`,icon:s}].map(e=>({...e,active:e.key===t,to:`/${e.key}`}))},{label:`System`,items:[{key:`docs`,label:`Docs`,icon:u},{key:`settings`,label:`Settings`,icon:a}].map(e=>({...e,active:e.key===t,to:`/${e.key}`}))}];return(0,V.jsx)(O,{brand:(0,V.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`m`}),search:(0,V.jsx)(`input`,{"aria-label":`search`,placeholder:`Search anything…`,className:`w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none`}),actions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{variant:`ghost`,size:`sm`,children:`Docs`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`LAB_DEMO_QA ▾`})]}),navSections:n,collapsedStorageKey:`sb-demo:collapsed`,bodyHeader:(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:`Products › Risk Products › Group Life`}),(0,V.jsx)(`h1`,{className:`mt-1 text-lg font-semibold`,children:`Group Life`}),(0,V.jsxs)(`div`,{className:`mt-2 flex gap-density-3 text-sm text-muted-foreground`,children:[(0,V.jsx)(`span`,{className:`font-medium text-foreground`,children:`Overview`}),(0,V.jsx)(`span`,{children:`Transactions`}),(0,V.jsx)(`span`,{children:`Eligibility`})]})]}),bodyActions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`Edit`}),(0,V.jsx)(f,{size:`sm`,children:`Run`})]}),bodySidebar:(0,V.jsxs)(`nav`,{className:`p-density-2 text-sm`,children:[(0,V.jsx)(`div`,{className:`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground`,children:`Plans (299)`}),Array.from({length:40},(e,t)=>(0,V.jsxs)(`div`,{className:`truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground`,children:[`Scheme-G`,String(36031+t).padStart(7,`0`)]},t))]}),children:(0,V.jsxs)(`div`,{className:`p-density-4 text-sm`,children:[`Active: `,t,` — body-main scrolls here.`]})})}function R(){let{pathname:e}=h(),t=(t,n)=>({key:t,label:n,active:e===`/${t}`,to:`/${t}`});return(0,V.jsx)(O,{brand:(0,V.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`q`}),navSections:[{label:`Profiles`,items:[{...t(`http`,`http`),icon:a}],groups:[{key:`jms`,label:`jms`,item:t(`jms`,`jms`),items:[t(`jms-all`,`all`),t(`jms-failed`,`failed`)],groups:[{key:`jms/incoming`,label:`incoming`,item:t(`jms-incoming`,`incoming`),items:[t(`jms-incoming-disbursements`,`disbursements`)]}]},{key:`logs`,label:`logs`,items:[t(`logs-api`,`api`),t(`logs-core`,`core`)]}]}],collapsedStorageKey:`sb-demo:nested-collapsed`,groupCollapsedStorageKey:`sb-demo:nested-groups`,children:(0,V.jsxs)(`div`,{className:`p-density-4 text-sm`,children:[`Active: `,e,` — the rail nests as deep as the backend declares.`]})})}function z(){let e=_(`/widgets`),t=(0,B.useMemo)(()=>new T({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]),[n,r]=(0,B.useState)(!1),[c,d]=(0,B.useState)(`widgets`),[p,h]=(0,B.useState)(!1),[g,v]=(0,B.useState)(null),y=[{label:`Inventory`,items:[{key:`widgets`,label:`Widgets`,icon:l},{key:`orders`,label:`Orders`,icon:o}]},{label:`Platform`,items:[{key:`services`,label:`Services`,icon:a},{key:`clients`,label:`Clients`,icon:s}]}].map(e=>({...e,items:e.items.map(e=>({...e,active:e.key===c,to:`/${e.key}`}))})),b=[{id:`navigate`,heading:`Navigate`,items:[{id:`widgets`,label:`Widgets`,icon:l,onSelect:()=>d(`widgets`)},{id:`orders`,label:`Orders`,icon:o,onSelect:()=>d(`orders`)},{id:`services`,label:`Services`,icon:a,onSelect:()=>d(`services`)}]},{id:`actions`,heading:`Actions`,items:[{id:`docs`,label:`Open documentation`,icon:u,shortcut:`⌘D`},{id:`archive`,label:`Archive selection`,disabled:!0}]}],S=c.charAt(0).toUpperCase()+c.slice(1);return(0,V.jsx)(`div`,{className:`h-full`,children:(0,V.jsx)(C,{client:t,children:(0,V.jsxs)(k,{adapter:e,children:[(0,V.jsx)(O,{brand:(0,V.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground`,children:`a`}),navSections:y,nav:(0,V.jsxs)(`nav`,{"aria-label":`Breadcrumb`,className:`flex items-center gap-1 text-xs`,children:[(0,V.jsx)(`span`,{className:`text-muted-foreground`,children:`Catalog`}),(0,V.jsx)(`span`,{className:`text-muted-foreground/60`,children:`›`}),(0,V.jsx)(`span`,{className:`font-medium text-foreground`,children:S})]}),search:(0,V.jsx)(F,{onClick:()=>r(!0),open:n,label:`Search commands…`}),actions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(x,{checked:p,onChange:h,label:(0,V.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Debug`}),"aria-label":`Outline AppShell slots`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`acme-prod ▾`}),(0,V.jsx)(m,{alt:`Ada Lovelace`,size:`sm`,title:`Ada Lovelace`})]}),debugSlots:p,bodyHeader:(0,V.jsxs)(`div`,{className:`min-w-0`,children:[(0,V.jsx)(`h1`,{className:`text-lg font-semibold`,children:S}),(0,V.jsxs)(`p`,{className:`mt-0.5 text-sm text-muted-foreground`,children:[`Remote-paged `,c,`.`]})]}),bodyActions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`Export`}),(0,V.jsx)(`div`,{ref:v,className:`flex items-center`})]}),contentClassName:`flex min-h-0 flex-col overflow-hidden p-density-4`,children:(0,V.jsx)(i,{definition:{key:c,title:S,description:`Remote-paged ${c}.`},entities:[c.replace(/s$/,``)],surfaceKey:c,client:I,renderLink:ee,actionsContainer:g},c)}),(0,V.jsx)(P,{open:n,onOpenChange:r,groups:b,footer:`↑↓ navigate · ↵ run · esc close`})]})})})}var B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{B=t(),w(),S(),E(),v(),A(),d(),b(),p(),D(),g(),r(),te(),M(),N(),c(),V=n(),{expect:H,userEvent:U,within:W}=__STORYBOOK_MODULE_TEST__,G={title:`Layout/AppShell`,component:O,parameters:{layout:`fullscreen`,docs:{description:{component:`Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout.`}}}},K={render:()=>{let[e,t]=(0,B.useState)(`prs`);return(0,V.jsx)(`div`,{className:`h-[480px]`,children:(0,V.jsx)(O,{brand:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`span`,{className:`grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold`,children:`g`}),(0,V.jsx)(`span`,{className:`font-bold tracking-tight`,children:`gavel`})]}),nav:(0,V.jsx)(y,{tabs:[{id:`prs`,label:`Pull requests`},{id:`activity`,label:`Activity`}],value:e,onChange:t}),search:(0,V.jsx)(`input`,{"aria-label":`search`,placeholder:`Search…`,className:`w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none`}),actions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{variant:`ghost`,size:`sm`,children:`Light/Dark`}),(0,V.jsx)(f,{size:`sm`,children:`New`})]}),toolbar:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`span`,{className:`text-sm text-muted-foreground`,children:`Filters go here`}),(0,V.jsx)(`div`,{className:`flex-1`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`Export`})]}),children:(0,V.jsx)(`div`,{className:`h-full overflow-y-auto p-density-4`,children:(0,V.jsx)(j,{title:`Content`,count:2,children:(0,V.jsx)(`p`,{className:`text-sm`,children:`The routed content area scrolls here.`})})})})})}},q={render:()=>(0,V.jsx)(`div`,{className:`h-[320px]`,children:(0,V.jsx)(O,{brand:(0,V.jsx)(`span`,{className:`font-bold`,children:`gavel`}),actions:(0,V.jsx)(f,{size:`sm`,children:`Action`}),children:(0,V.jsx)(`div`,{className:`p-density-4 text-sm text-muted-foreground`,children:`No toolbar row.`})})})},J={render:()=>(0,V.jsx)(`div`,{className:`h-[420px]`,children:(0,V.jsx)(O,{brand:(0,V.jsx)(`span`,{className:`font-bold`,children:`gavel`}),navSections:[{items:[{key:`runs`,label:`Runs`,icon:o,to:`/runs`}]}],actions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{size:`sm`,children:`Run capture`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`Edit target`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`Workspace with a long name`})]}),mobileActions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(f,{size:`sm`,children:`Run`}),(0,V.jsx)(f,{variant:`outline`,size:`sm`,children:`More`})]}),children:(0,V.jsx)(`div`,{className:`p-density-4 text-sm text-muted-foreground`,children:`Resize this story to a phone width: the mobile header keeps the primary action compact while desktop still renders the full action cluster.`})})})},Y={render:()=>{let e=_(`/policies`);return(0,V.jsx)(`div`,{className:`h-[560px]`,children:(0,V.jsx)(k,{adapter:e,children:(0,V.jsx)(L,{})})})}},X={render:()=>{let e=_(`/jms-incoming`);return(0,V.jsx)(`div`,{className:`h-[560px]`,children:(0,V.jsx)(k,{adapter:e,children:(0,V.jsx)(R,{})})})},play:async({canvasElement:e})=>{let t=W(e),n=t.getByRole(`link`,{name:`jms`});await H(n).toHaveAttribute(`href`,`/jms`);let r=t.getByRole(`button`,{name:/Collapse jms$/});await H(n.contains(r)).toBe(!1),await H(t.getByRole(`link`,{name:`disbursements`})).toBeTruthy(),await U.click(r),await H(t.queryByRole(`link`,{name:`disbursements`})).toBeNull(),await H(t.getByRole(`link`,{name:`jms`})).toBeTruthy()}},Z={parameters:{docs:{description:{story:"AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`."}}},render:()=>(0,V.jsx)(z,{}),play:async({canvasElement:e,step:t})=>{let n=W(e),r=W(document.body);await t(`the table pages remotely, keeping the header and footer pinned`,async()=>{await n.findByText(/Page 1 of/,void 0,{timeout:5e3});let t=e.querySelector(`[data-slot="operation-catalog-results"] .overflow-auto`);if(await H(t).not.toBeNull(),t){t.scrollTop=t.scrollHeight;let n=e.querySelector(`main`);await H(n?.scrollTop??0).toBe(0)}await U.click(n.getByRole(`button`,{name:`Next page`})),await H(await n.findByText(/Page 2 of/)).toBeInTheDocument()}),await t(`⌘K opens the palette, filters, and runs a command`,async()=>{await U.keyboard(`{Meta>}k{/Meta}`);let e=await r.findByRole(`dialog`,{name:`Command palette`});await H(e).toBeInTheDocument(),await U.type(W(e).getByRole(`combobox`),`orders`),await U.keyboard(`{Enter}`),await H(r.queryByRole(`dialog`,{name:`Command palette`})).not.toBeInTheDocument();let t=n.getByRole(`navigation`,{name:`Breadcrumb`});await H(W(t).getByText(`Orders`)).toBeInTheDocument()})}},Q=[`Default`,`NoToolbar`,`CompactMobileActions`,`WithSidebar`,`NestedNavGroups`,`RpcWorkbench`],K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[320px]">
      <AppShell brand={<span className="font-bold">gavel</span>} actions={<Button size="sm">Action</Button>}>
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}}})))()}$();export{J as CompactMobileActions,K as Default,X as NestedNavGroups,q as NoToolbar,Z as RpcWorkbench,Y as WithSidebar,Q as __namedExportsOrder,G as default};
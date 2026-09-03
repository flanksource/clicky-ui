import{j as y}from"./iframe-Cco5TqZn.js";import{Q as v,a as T}from"./QueryBrowser-XyKyuPMn.js";import"./preload-helper-CW1BdeJu.js";import"./index-CA7oqwWm.js";import"./button-DNj3-z2W.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./JsonSchemaForm-C8lH8wi3.js";import"./Icon-C6Dn9DLx.js";import"./DropdownMenu-w_RgGUTs.js";import"./floating-ui.react-Dpy7yByO.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-D8KXkP_9.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-C3T75D-C.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-DPrIRjAr.js";import"./FilterPill-BVle6yuL.js";import"./DateField-4aaT9ulH.js";import"./DatePicker-CHly8a8a.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./SegmentedControl-qK3H5opf.js";import"./TreePickerField-CeaptdSL.js";import"./Tree-BRZblghw.js";import"./TreeNode-LqK2sArM.js";import"./InputField-CsJL85KY.js";import"./use-hotkey-DVDdDWa6.js";import"./ListMenu-CLCjJMXE.js";import"./SplitPane-CHk33EZs.js";import"./DataTable-BUdHoCkv.js";import"./SortableHeader-DtCNn_uR.js";import"./router-DHJSI_n5.js";import"./Modal-BfOLI4vX.js";import"./FilterBar-DVdHLQod.js";import"./MultiSelect-CeyhHNCi.js";import"./RangeSlider-Da0vSqmc.js";import"./TimeRange-DlEhKiKb.js";import"./select-DyfR_FV4.js";import"./WorkloadPicker-Y9hi9dEd.js";import"./NamespacePicker-BzzNcGfX.js";import"./index-CBZ8Tip2.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-FGKuMYnS.js";import"./TagList-DUTVq46U.js";import"./Badge-BsNPFd1h.js";import"./Properties-Did90PaB.js";import"./IconButton-BQqpNww-.js";import"./StatusDot-BZGJhrC1.js";import"./ErrorDetails-44GfVE44.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-2WpJUhB3.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var c,m;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const u=String(S[R]??""),p=k.split(",").filter(Boolean),d=p.filter(r=>!r.startsWith("!")),B=p.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(u))&&!B.includes(u)})),s=((c=e.pagination)==null?void 0:c.limit)??4,o=((m=e.pagination)==null?void 0:m.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Fe={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},n={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
FROM service_health
ORDER BY observed_at DESC`,optionsSchema:L,initialOptions:{database:"operations",readOnly:!0},completion:{kind:"sql",dialect:"postgresql",defaultSchema:"public",schemas:[{name:"public",relations:[{name:"service_health",columns:E.map(e=>({name:e.name}))}]}]},execute:P},play:async({canvasElement:e})=>{const t=w(e);await x.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("Checkout API")).resolves.toBeVisible(),await l(t.findByText("Page 1 of 2")).resolves.toBeVisible()}},i={args:{id:"storybook-query-browser-error",title:"Broken query",language:"sql",initialQuery:"SELECT missing_column FROM service_health",execute:async()=>{throw new T("query execution failed",{provider:"postgresql",request:{query:"SELECT missing_column FROM service_health"},response:{details:{code:"42703"}},error:"column missing_column does not exist"})}},play:async({canvasElement:e})=>{const t=w(e);await x.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("query execution failed")).resolves.toBeVisible()}};var g,h,b;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    id: "storybook-query-browser-sql",
    title: "Service health",
    language: "sql",
    queryLabel: "PostgreSQL query",
    initialQuery: "SELECT observed_at, service, status, region, duration_ms\\nFROM service_health\\nORDER BY observed_at DESC",
    optionsSchema,
    initialOptions: {
      database: "operations",
      readOnly: true
    },
    completion: {
      kind: "sql",
      dialect: "postgresql",
      defaultSchema: "public",
      schemas: [{
        name: "public",
        relations: [{
          name: "service_health",
          columns: columns.map(column => ({
            name: column.name
          }))
        }]
      }]
    },
    execute: executeSampleQuery
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(canvas.findByText("Checkout API")).resolves.toBeVisible();
    await expect(canvas.findByText("Page 1 of 2")).resolves.toBeVisible();
  }
}`,...(b=(h=n.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var _,f,q;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    id: "storybook-query-browser-error",
    title: "Broken query",
    language: "sql",
    initialQuery: "SELECT missing_column FROM service_health",
    execute: async () => {
      throw new QueryBrowserExecutionError("query execution failed", {
        provider: "postgresql",
        request: {
          query: "SELECT missing_column FROM service_health"
        },
        response: {
          details: {
            code: "42703"
          }
        },
        error: "column missing_column does not exist"
      });
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(canvas.findByText("query execution failed")).resolves.toBeVisible();
  }
}`,...(q=(f=i.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};const Ve=["SqlResults","ProviderError"];export{i as ProviderError,n as SqlResults,Ve as __namedExportsOrder,Fe as default};

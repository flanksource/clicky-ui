import{j as y}from"./iframe-1nhP4pBA.js";import{Q as g,a as T}from"./QueryBrowser-BuNz54G6.js";import"./preload-helper-C9Uksf5K.js";import"./index-CA7oqwWm.js";import"./button--4D2VPD7.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Ch-5BGAb.js";import"./JsonSchemaForm-DTQ6bTRP.js";import"./Icon-B2d9yic_.js";import"./DropdownMenu-CAJOgHVv.js";import"./floating-ui.react-BFwwEc5i.js";import"./index-BSiZIXYH.js";import"./index-XDodYxLy.js";import"./DropdownMenuSubmenu-BMDGCenv.js";import"./modalStack-DxHx75M7.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-BTWh615-.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-DQH9gQQS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-BCbQu6RQ.js";import"./FilterPill-CXYMNTt5.js";import"./DateField-BaUx2XoV.js";import"./DatePicker-DWJ3hyRf.js";import"./DateTimePicker-D-pa_he-.js";import"./SegmentedControl-BX0icOeA.js";import"./TreePickerField-BzeG3TEh.js";import"./Tree-DkTEIP7m.js";import"./TreeNode-DG0we7Jz.js";import"./SplitPane-DYOIglm7.js";import"./DataTable-Byaaf8H5.js";import"./SortableHeader-DOyv7UJG.js";import"./Modal-BEBsG6op.js";import"./FilterBar-C_3aF3TU.js";import"./MultiSelect-B50Px8dh.js";import"./RangeSlider-4m86cNh6.js";import"./TimeRange-D-87v7d_.js";import"./select-B2pQvorm.js";import"./WorkloadPicker-bAN7wney.js";import"./NamespacePicker-Brgo_DSM.js";import"./index-BVDmj5Ga.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DGhpHWxh.js";import"./TagList-BRJUUHzy.js";import"./Badge-B1noozuz.js";import"./Properties-BMf0F3x3.js";import"./IconButton-ChHOhmH9.js";import"./StatusDot-2IRk4KZC.js";import"./ErrorDetails-CdNsAEg6.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-RywGGJub.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:q,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var c,m;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const u=String(S[R]??""),p=k.split(",").filter(Boolean),d=p.filter(r=>!r.startsWith("!")),B=p.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(u))&&!B.includes(u)})),i=((c=e.pagination)==null?void 0:c.limit)??4,n=((m=e.pagination)==null?void 0:m.offset)??0,a=t.slice(n,n+i);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:i,offset:n,hasMore:n+i<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},...e.debug?{diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}:{}}}const Me={title:"Data/QueryBrowser",component:g,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(g,{...e,className:"h-full min-h-0"})})},o={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
FROM service_health
ORDER BY observed_at DESC`,optionsSchema:L,initialOptions:{database:"operations",readOnly:!0},completion:{kind:"sql",dialect:"postgresql",defaultSchema:"public",schemas:[{name:"public",relations:[{name:"service_health",columns:E.map(e=>({name:e.name}))}]}]},execute:P},play:async({canvasElement:e})=>{const t=w(e);await q.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("Checkout API")).resolves.toBeVisible(),await l(t.findByText("Page 1 of 2")).resolves.toBeVisible()}},s={args:{id:"storybook-query-browser-error",title:"Broken query",language:"sql",initialQuery:"SELECT missing_column FROM service_health",execute:async()=>{throw new T("query execution failed",{provider:"postgresql",request:{query:"SELECT missing_column FROM service_health"},response:{details:{code:"42703"}},error:"column missing_column does not exist"})}},play:async({canvasElement:e})=>{const t=w(e);await q.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("query execution failed")).resolves.toBeVisible()}};var v,h,b;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(b=(h=o.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var _,f,x;s.parameters={...s.parameters,docs:{...(_=s.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(x=(f=s.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};const Ae=["SqlResults","ProviderError"];export{s as ProviderError,o as SqlResults,Ae as __namedExportsOrder,Me as default};

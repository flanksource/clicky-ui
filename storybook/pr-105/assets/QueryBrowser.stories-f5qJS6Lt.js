import{j as y}from"./iframe-Dxfrw1Ky.js";import{Q as v,a as T}from"./QueryBrowser-HCWfCbr9.js";import"./preload-helper-BBRSUrHX.js";import"./index-CA7oqwWm.js";import"./button-Cd-gFBA2.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DdWtU95m.js";import"./JsonSchemaForm-YYY8XkSl.js";import"./Icon-uVU5xHJk.js";import"./DropdownMenu-BrgsovJR.js";import"./floating-ui.react-CnFTnPO5.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./DropdownMenuSubmenu-ngeQOpm6.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./Properties-D97LrD4y.js";import"./IconButton-XTWE7kYN.js";import"./format-2niohfpq.js";import"./JsonView-C0lt5M6a.js";import"./AccordionList-BTYKiV83.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-aB9oNZTO.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BpuwyYbr.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D6Y2Y0Td.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CkPoK2Rk.js";import"./FilterPill-DPJ4_JlW.js";import"./DateField-KAcJR11t.js";import"./DatePicker-DGUoI6us.js";import"./DateTimePicker-Do5gRvQn.js";import"./SegmentedControl-CYXceJe4.js";import"./TreePickerField-D4UScmyb.js";import"./Tree-D-3f6UEm.js";import"./TreeNode-4m2l8kkX.js";import"./InputField-BNaI9pYq.js";import"./use-hotkey-CzAz-0Js.js";import"./ListMenu-Cm6jw3GG.js";import"./Markdown-CKxNRpEU.js";import"./Callout-hw3R6Lvm.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CQnknqX7.js";import"./CodeDiff-BA7bdpa9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-B3JYBooh.js";import"./SplitPane-DIbRMCTN.js";import"./DataTable-BIhpbnpq.js";import"./SortableHeader-Bfd9tbsl.js";import"./router-BkznFUli.js";import"./FilterBar-CRB8Fu3i.js";import"./filter-bar-multi-B5teDMbU.js";import"./MultiSelect-UaYFpP5m.js";import"./RangeSlider-DswKR2c-.js";import"./TimeRange-DViFc0-X.js";import"./select-C8OQW2cZ.js";import"./WorkloadPicker-BMOl_vHV.js";import"./NamespacePicker-Bacf9vZs.js";import"./index-BUwwOD0W.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BdeaaCOh.js";import"./TagList-BlEnFNAp.js";import"./StatusDot-uL2bc0oE.js";import"./ErrorDetails-fD9me7tt.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-ChCzLIlV.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Xe={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
FROM service_health
ORDER BY observed_at DESC`,optionsSchema:L,initialOptions:{database:"operations",readOnly:!0},completion:{kind:"sql",dialect:"postgresql",defaultSchema:"public",schemas:[{name:"public",relations:[{name:"service_health",columns:E.map(e=>({name:e.name}))}]}]},execute:P},play:async({canvasElement:e})=>{const t=w(e);await x.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("Checkout API")).resolves.toBeVisible(),await l(t.findByText("Page 1 of 2")).resolves.toBeVisible()}},n={args:{id:"storybook-query-browser-error",title:"Broken query",language:"sql",initialQuery:"SELECT missing_column FROM service_health",execute:async()=>{throw new T("query execution failed",{provider:"postgresql",request:{query:"SELECT missing_column FROM service_health"},response:{details:{code:"42703"}},error:"column missing_column does not exist"})}},play:async({canvasElement:e})=>{const t=w(e);await x.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("query execution failed")).resolves.toBeVisible()}};var g,h,b;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(b=(h=i.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var _,f,q;n.parameters={...n.parameters,docs:{...(_=n.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(q=(f=n.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};const $e=["SqlResults","ProviderError"];export{n as ProviderError,i as SqlResults,$e as __namedExportsOrder,Xe as default};

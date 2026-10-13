import{j as y}from"./iframe-DP177qYv.js";import{Q as v,a as T}from"./QueryBrowser-NMyQBp8Q.js";import"./preload-helper-BZq7nIkI.js";import"./index-CA7oqwWm.js";import"./button-FbNKbbzk.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./JsonSchemaForm-D6m6mBh8.js";import"./Icon-CVZO3WAG.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./format-2niohfpq.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./HoverCard-k2Xsc41N.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BWAlqUsR.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-gw5c6cQc.js";import"./FilterPill-CB6e5lha.js";import"./DateField-Vz0SUsTh.js";import"./DatePicker-C9FXaiIe.js";import"./DateTimePicker-4Tx0xEVq.js";import"./SegmentedControl-CmQrpni4.js";import"./TreePickerField-BjPB4mTt.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./InputField-DQb9Rhrw.js";import"./use-hotkey-iixTK3zz.js";import"./ListMenu-DaHgzerB.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./SplitPane-DjlfTfT0.js";import"./DataTable-CDHJBsgN.js";import"./SortableHeader-GyTSgVTd.js";import"./router-DMz9daZf.js";import"./FilterBar-W4upSyAa.js";import"./filter-bar-multi-Dhujs7ka.js";import"./MultiSelect-cBIxAEqx.js";import"./RangeSlider-BPH736ua.js";import"./TimeRange-JuQ7yGH5.js";import"./select-DHQIEazy.js";import"./WorkloadPicker-DdJ-TfrN.js";import"./NamespacePicker-Di4Ktcw-.js";import"./index-Kn3cRk9o.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFpXhYiW.js";import"./TagList-Bb9OtQvs.js";import"./StatusDot-B6dTc7Ey.js";import"./ErrorDetails-Cp5tKOq6.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-yrnKA18D.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const He={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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
}`,...(q=(f=n.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};const Xe=["SqlResults","ProviderError"];export{n as ProviderError,i as SqlResults,Xe as __namedExportsOrder,He as default};

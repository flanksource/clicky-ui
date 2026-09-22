import{j as y}from"./iframe-BTxADGbc.js";import{Q as v,a as T}from"./QueryBrowser-CqGm3WF-.js";import"./preload-helper-95TtevsV.js";import"./index-CA7oqwWm.js";import"./button-uOKQbD2U.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ZXW1-FyE.js";import"./JsonSchemaForm-D9H-dCV_.js";import"./Icon-DyQmy9zD.js";import"./DropdownMenu-CfcxM9h_.js";import"./floating-ui.react-s2gbsc2n.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./DropdownMenuSubmenu-WTMYamx5.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./Properties-VVxglCX7.js";import"./IconButton-Df5t7P9x.js";import"./HoverCard-Cms3aoCY.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-C3rdbpG1.js";import"./FilterPill-BtWteifY.js";import"./DateField-C3XXcAms.js";import"./DatePicker-DW0YHUeU.js";import"./DateTimePicker-al_sBZQx.js";import"./SegmentedControl-Cb6p-V2x.js";import"./TreePickerField-DGol3p_M.js";import"./Tree-CITsSa4C.js";import"./TreeNode-BbGDjTv7.js";import"./AccordionList-DcggQmVp.js";import"./InputField-CkPd2Czh.js";import"./use-hotkey-BLpJQFBj.js";import"./ListMenu-DA1Lf5Dy.js";import"./Markdown-C8cp-WZg.js";import"./Callout-DNhpACdz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DralUSHB.js";import"./CodeDiff-Md3mH8qB.js";import"./HighlightedTokens-DoVhJSb4.js";import"./JsonView-CF7nUUT6.js";import"./SplitPane-DHfCr2KC.js";import"./DataTable-CKshF43V.js";import"./SortableHeader-BpG9FLli.js";import"./router-CiqoLGl0.js";import"./Modal-BJSsoZSJ.js";import"./FilterBar-yYKLUgrv.js";import"./MultiSelect-CFdHhfPl.js";import"./RangeSlider-jqxYk1GP.js";import"./TimeRange-CLUngLZP.js";import"./select-XLvWghXg.js";import"./WorkloadPicker-QJPIrp89.js";import"./NamespacePicker-D7Kg-gcT.js";import"./index-CXdr-XwC.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C6MZi5gA.js";import"./TagList-CVxQuAya.js";import"./Badge-8t6xVVQj.js";import"./StatusDot-B4MdnWlu.js";import"./ErrorDetails-BE-ycS1n.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-Uzb-NrBT.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Ue={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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
}`,...(q=(f=n.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};const ze=["SqlResults","ProviderError"];export{n as ProviderError,i as SqlResults,ze as __namedExportsOrder,Ue as default};

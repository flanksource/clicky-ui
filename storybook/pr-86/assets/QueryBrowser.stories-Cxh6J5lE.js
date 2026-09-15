import{j as y}from"./iframe-DeBYCw4x.js";import{Q as v,a as T}from"./QueryBrowser-DCxc1ejY.js";import"./preload-helper-CcRYDqr-.js";import"./index-CA7oqwWm.js";import"./button-DB9m7UYN.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ho48Z2wq.js";import"./JsonSchemaForm-CddA3a7h.js";import"./Icon-CGwyQOB1.js";import"./DropdownMenu-CuKG9hF1.js";import"./floating-ui.react-CJIncd7i.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./DropdownMenuSubmenu-BoEIYSWu.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./Properties-Cm7NvER_.js";import"./IconButton-Jb6_soVo.js";import"./HoverCard-DMwhGn2K.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-Blg1URfg.js";import"./FilterPill-DFY6Z2w0.js";import"./DateField-D-RuUBhs.js";import"./DatePicker-CLelcqU9.js";import"./DateTimePicker-TXnXjNJ7.js";import"./SegmentedControl-x-wxcPhD.js";import"./TreePickerField-Bbb-_TKH.js";import"./Tree-Bd-CblJ-.js";import"./TreeNode-B4k1eimf.js";import"./AccordionList-Dge9CV48.js";import"./InputField-DoB9v3Zf.js";import"./use-hotkey-cYEGbwF4.js";import"./ListMenu-DiPynW8C.js";import"./Markdown-BiknAm-q.js";import"./Callout-DoO2BLrl.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-dTiR47dd.js";import"./CodeDiff-BRl1lE7u.js";import"./HighlightedTokens-Cwnl1Dqa.js";import"./JsonView--QZM-KTF.js";import"./SplitPane-CdAvgdYh.js";import"./DataTable-IYtBl-7_.js";import"./SortableHeader-BZfABJLP.js";import"./router-BS0K7T7L.js";import"./Modal-DKr8ZZ_E.js";import"./FilterBar-mv1uq_Za.js";import"./MultiSelect-BAke_gC4.js";import"./RangeSlider-CY-mpLNd.js";import"./TimeRange-1nQfxhxt.js";import"./select-C_dZVFqX.js";import"./WorkloadPicker-BOLGZqyS.js";import"./NamespacePicker-10mVS6un.js";import"./index-CmecybCa.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-a37Nl5NZ.js";import"./TagList-Rpz24aG6.js";import"./Badge-vEaYC1aM.js";import"./StatusDot-BMvWjruJ.js";import"./ErrorDetails-2EvkPZ_X.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-RL5VQ3ui.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Ue={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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

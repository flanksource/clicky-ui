import{j as y}from"./iframe-DzQtIbNE.js";import{Q as v,a as T}from"./QueryBrowser-C4f9jDIB.js";import"./preload-helper-BCNcasCO.js";import"./index-CA7oqwWm.js";import"./button-BtjJwS_P.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CMaS212t.js";import"./JsonSchemaForm-ChXytsWf.js";import"./Icon-D3avtD1A.js";import"./DropdownMenu-EvEmNcHK.js";import"./floating-ui.react-BiyoKmlr.js";import"./index-BqViEYwi.js";import"./index-CxOWF1GZ.js";import"./DropdownMenuSubmenu-zqd_Qfyb.js";import"./modalStack-CV8pkEDx.js";import"./zIndex-BGbNBNA8.js";import"./Properties-zxUp5x1P.js";import"./IconButton-B4LzdWGk.js";import"./HoverCard-BmMl7y5E.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BvPI2Llq.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DnmK8yIe.js";import"./FilterPill-OKDi7TqT.js";import"./DateField-B4v59BYL.js";import"./DatePicker-DDw49L-k.js";import"./DateTimePicker-B0B7J2o-.js";import"./SegmentedControl-DqjzCbFU.js";import"./TreePickerField-Dx7p8bT5.js";import"./Tree-BDpW0HwT.js";import"./TreeNode-DR60XQDj.js";import"./AccordionList-MuFF2Dlu.js";import"./InputField-DgqwknNe.js";import"./use-hotkey-ChPiyVF2.js";import"./ListMenu-C4QQQWpw.js";import"./Markdown-DqiNf3uz.js";import"./Callout-CSi8gZUg.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BhTC3ydu.js";import"./CodeDiff-MdlLWqCc.js";import"./HighlightedTokens-BJPpGutf.js";import"./JsonView-a3SUPwE1.js";import"./Badge-Caehxr5C.js";import"./SplitPane-2klrCVrB.js";import"./DataTable-p3NpsIhf.js";import"./SortableHeader-B-f9dioh.js";import"./router-M1U0dsjS.js";import"./FilterBar-Bz0gxTiA.js";import"./MultiSelect-ERMV7t7Y.js";import"./RangeSlider-BZ-7aHri.js";import"./TimeRange-De2mzwCs.js";import"./select-CKipRPgT.js";import"./WorkloadPicker-BNqXsBgH.js";import"./NamespacePicker-B-EVUmLL.js";import"./index-JHlX3ULY.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-A23tUInk.js";import"./TagList-DarfaYoB.js";import"./StatusDot-Bd5IVlVP.js";import"./ErrorDetails-DUxasOLJ.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-CInkIZV5.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Je={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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
}`,...(q=(f=n.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};const Ue=["SqlResults","ProviderError"];export{n as ProviderError,i as SqlResults,Ue as __namedExportsOrder,Je as default};

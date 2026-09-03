import{j as y}from"./iframe-CiA63uuc.js";import{Q as v,a as T}from"./QueryBrowser-B2Ghj26U.js";import"./preload-helper-DqldIB3Q.js";import"./index-CA7oqwWm.js";import"./button-ppGJePHl.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-X8NYIprp.js";import"./JsonSchemaForm-CrXnt7KF.js";import"./Icon-ChAy_Zq6.js";import"./DropdownMenu-DEcSbpCu.js";import"./floating-ui.react-BzcB7PEn.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./DropdownMenuSubmenu-DGyluL-z.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-BaejSNIH.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-CfMOxxTQ.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-C-Pmuu7J.js";import"./FilterPill-2pMT1Pki.js";import"./DateField-Bwsxd5SJ.js";import"./DatePicker-DboSvUZ3.js";import"./DateTimePicker-MwGYzabr.js";import"./SegmentedControl-aXRpxQ4b.js";import"./TreePickerField-C6U9ARNI.js";import"./Tree-b58f5oGs.js";import"./TreeNode-Bssf1cx2.js";import"./InputField-CMFMGK2J.js";import"./use-hotkey-BXixP-76.js";import"./ListMenu-D2wyxJMb.js";import"./SplitPane-DDH1XhF2.js";import"./DataTable-Bi0OViGE.js";import"./SortableHeader-DjdVrVVK.js";import"./router-DdDvAp2k.js";import"./Modal-BWkFQvgr.js";import"./FilterBar-C4LglIFa.js";import"./MultiSelect-BEb4QcU1.js";import"./RangeSlider-BF5vIFTr.js";import"./TimeRange-CVxt8508.js";import"./select-SOFw-W8N.js";import"./WorkloadPicker-KNnpqbtg.js";import"./NamespacePicker-CPYiebHw.js";import"./index-CZSejjdY.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-ByIXWA6S.js";import"./TagList-CMlkTEXD.js";import"./Badge-C7FdoOOR.js";import"./Properties-BBtZhA7f.js";import"./IconButton-CHbaJLVA.js";import"./StatusDot-C66wLCQs.js";import"./ErrorDetails-FCPkGK_7.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-BNeKEHMg.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var c,m;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const u=String(S[R]??""),p=k.split(",").filter(Boolean),d=p.filter(r=>!r.startsWith("!")),B=p.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(u))&&!B.includes(u)})),s=((c=e.pagination)==null?void 0:c.limit)??4,o=((m=e.pagination)==null?void 0:m.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Fe={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},n={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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

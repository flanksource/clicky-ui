import{j as y}from"./iframe-DNj_zNZU.js";import{Q as v,a as T}from"./QueryBrowser-CF434OVc.js";import"./preload-helper-LCYGeQwd.js";import"./index-CA7oqwWm.js";import"./button-l9qmO7rt.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./JsonSchemaForm-D6oRy3T9.js";import"./Icon-D173D1Xm.js";import"./DropdownMenu-BZOVBMap.js";import"./floating-ui.react-CUsd8blK.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BT4JKovI.js";import"./IconButton-CofRhqoZ.js";import"./format-2niohfpq.js";import"./JsonView-ABwU1Fjr.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BY9qgMmL.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BTkFnERZ.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BpxNrIrE.js";import"./FilterPill-BCljltSy.js";import"./DateField-CdijMLjn.js";import"./DatePicker-CnzqPqqM.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./SegmentedControl-YJAMHeYo.js";import"./TreePickerField-CSeWXf42.js";import"./Tree-XmGojDQe.js";import"./TreeNode-DFpQ6EqE.js";import"./InputField-CCxG1Wg3.js";import"./use-hotkey-CH50nEFR.js";import"./ListMenu-H251SE9F.js";import"./Markdown-DH53cVwk.js";import"./Callout-Utyt5kOR.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CjM_p02j.js";import"./CodeDiff-V1O_nplA.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-ChvifZ1Q.js";import"./HighlightedTokens-BTcRsF_2.js";import"./SplitPane-DJ3MhDOw.js";import"./DataTable-B1u4gJrS.js";import"./SortableHeader-53lGSQ-u.js";import"./router-Dxczcvdc.js";import"./FilterBar-Cqk7Uv4P.js";import"./filter-bar-multi-wUCtNmvd.js";import"./MultiSelect-mGO55RQY.js";import"./RangeSlider-BSWUgAY4.js";import"./TimeRange-CjsLXTSh.js";import"./select-C4MKv3sD.js";import"./WorkloadPicker-BnsVO9gp.js";import"./NamespacePicker-aUlbk4RW.js";import"./index-BC4x0cR9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-COUnG2EZ.js";import"./TagList-Cfi0XIt5.js";import"./StatusDot-a8NYo4z9.js";import"./ErrorDetails-BVWhACLW.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-B2Op707_.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Xe={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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

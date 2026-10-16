import{j as y}from"./iframe-BUpmsD4_.js";import{Q as v,a as T}from"./QueryBrowser-B1IlIYAj.js";import"./preload-helper-PGaPgbNH.js";import"./index-CA7oqwWm.js";import"./button-C45Fp5VT.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BVCwDMQn.js";import"./JsonSchemaForm-Cy2cExnF.js";import"./Icon-DTAROQQs.js";import"./DropdownMenu-LyJi-wEU.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CzvVSyin.js";import"./IconButton-CdsDTQWb.js";import"./format-2niohfpq.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-CJMlbbGv.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D_AIawBk.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CaQ5ogPs.js";import"./FilterPill-ZhMJAiFw.js";import"./DateField-DxSzqail.js";import"./DatePicker-CLqUxm7x.js";import"./DateTimePicker-B_Xf9fMG.js";import"./SegmentedControl-BzAaXjE5.js";import"./TreePickerField-DQyVpgPa.js";import"./Tree-B-YvG_G5.js";import"./TreeNode-D7MwMn0M.js";import"./InputField-DPfWB3YC.js";import"./use-hotkey-Z_FWVvi0.js";import"./ListMenu-DHPuOHgr.js";import"./Markdown-BokWMc1j.js";import"./Callout-OZ7alDbm.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-8BACWTJZ.js";import"./CodeDiff-B_c0QWKI.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./SplitPane-DKGU1QZo.js";import"./DataTable-D0ZAr8Wn.js";import"./SortableHeader-DzqJplk3.js";import"./router-ivxbOHGV.js";import"./FilterBar-D1B1BCNq.js";import"./filter-bar-multi-EJU47-mi.js";import"./MultiSelect-DOVvlLhk.js";import"./RangeSlider-u6TDUAHA.js";import"./TimeRange-DLbdylta.js";import"./select-CBErET8H.js";import"./WorkloadPicker-BqShn2mb.js";import"./NamespacePicker-BYq-r1wS.js";import"./index-DuJeJ7XF.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Ca1ZM5fk.js";import"./TagList-DnAzIPxU.js";import"./StatusDot-CD9gWk6p.js";import"./ErrorDetails-BvfUfNFo.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";import"./useDebugAction-CQFB2Oc4.js";import"./debugConsoleSignal-B72erEWu.js";const{expect:l,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var m,c;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const p=String(S[R]??""),u=k.split(",").filter(Boolean),d=u.filter(r=>!r.startsWith("!")),B=u.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(p))&&!B.includes(p)})),s=((m=e.pagination)==null?void 0:m.limit)??4,o=((c=e.pagination)==null?void 0:c.offset)??0,a=t.slice(o,o+s);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:s,offset:o,hasMore:o+s<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}}const Xe={title:"Data/QueryBrowser",component:v,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(v,{...e,className:"h-full min-h-0"})})},i={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
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

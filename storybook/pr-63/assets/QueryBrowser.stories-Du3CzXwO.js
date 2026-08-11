import{j as y}from"./iframe-DQ4bl7_4.js";import{Q as g,a as T}from"./QueryBrowser-a8GOU8c2.js";import"./preload-helper-Bz0j3TbD.js";import"./index-CA7oqwWm.js";import"./button-BeRBp0Vq.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-DLaiJr6O.js";import"./JsonSchemaForm-BPY5Hmu-.js";import"./Icon-DnY4_zIX.js";import"./DropdownMenu-CwoDXHYK.js";import"./floating-ui.react-Dv7k8fxD.js";import"./index-COx9F93F.js";import"./index-CSwS8kWJ.js";import"./DropdownMenuSubmenu-DGHn6Q5L.js";import"./modalStack-iZddL8t7.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-rof_d5zl.js";import"./path-tree-DWa9VY15.js";import"./json-schema-form-size-DYVq0lph.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-CyMFz8Gz.js";import"./FilterPill-Dv_PE72E.js";import"./DateTimePicker-DD4D3IeG.js";import"./SegmentedControl-nX18AODg.js";import"./TreePickerField-CJhOSFlG.js";import"./Tree-BqDaXQ4q.js";import"./TreeNode-B3_q2G5T.js";import"./SplitPane-z2QhLzxv.js";import"./DataTable-BIhIWVdv.js";import"./SortableHeader-Bl25FxIR.js";import"./Modal-A8cU230p.js";import"./FilterBar-XaiX_XX5.js";import"./MultiSelect-M2Un-Ynr.js";import"./RangeSlider-DOxPOVM4.js";import"./TimeRange-DPn6r5BI.js";import"./select-Do8XwOIJ.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-C0LdJH7o.js";import"./TagList-CwX7ZRct.js";import"./Badge-BQiYcG35.js";import"./Properties-C41onsKP.js";import"./IconButton-BGaAj_3G.js";import"./StatusDot-C19dgJ6r.js";import"./ErrorDetails-v7hIk6a5.js";import"./index-CG5yj9qB.js";import"./index-CsUxhzUj.js";const{expect:l,userEvent:q,within:w}=__STORYBOOK_MODULE_TEST__,O=[{observed_at:"2026-08-11T08:14:32Z",service:"Checkout API",status:"healthy",region:"eu-west",duration_ms:84},{observed_at:"2026-08-11T08:14:21Z",service:"Ledger Worker",status:"degraded",region:"us-east",duration_ms:413},{observed_at:"2026-08-11T08:13:58Z",service:"Identity API",status:"healthy",region:"eu-west",duration_ms:126},{observed_at:"2026-08-11T08:13:44Z",service:"Reporting API",status:"failed",region:"ap-south",duration_ms:1305},{observed_at:"2026-08-11T08:13:12Z",service:"Checkout API",status:"healthy",region:"us-east",duration_ms:91},{observed_at:"2026-08-11T08:12:47Z",service:"Ledger Worker",status:"healthy",region:"eu-west",duration_ms:204}],E=[{name:"observed_at",label:"Observed",kind:"timestamp"},{name:"service",label:"Service",filterKey:"service",filter:{kind:"terms",options:["Checkout API","Ledger Worker","Identity API","Reporting API"].map(e=>({value:e}))}},{name:"status",label:"Status",kind:"status",filterKey:"status",filter:{kind:"terms",options:["healthy","degraded","failed"].map(e=>({value:e}))}},{name:"region",label:"Region"},{name:"duration_ms",label:"Duration (ms)"}],L={type:"object",properties:{database:{type:"string",title:"Database",enum:["operations","analytics"]},readOnly:{type:"boolean",title:"Read only"}}};async function P(e){var c,u;const t=O.filter(S=>Object.entries(e.filters??{}).every(([R,k])=>{const m=String(S[R]??""),p=k.split(",").filter(Boolean),d=p.filter(r=>!r.startsWith("!")),B=p.filter(r=>r.startsWith("!")).map(r=>r.slice(1));return(d.length===0||d.includes(m))&&!B.includes(m)})),i=((c=e.pagination)==null?void 0:c.limit)??4,n=((u=e.pagination)==null?void 0:u.offset)??0,a=t.slice(n,n+i);return{rows:a,columns:E,durationMs:18,pagination:{mode:"offset",limit:i,offset:n,hasMore:n+i<t.length,total:t.length,totalRelation:"eq",consistency:"snapshot"},...e.debug?{diagnostics:{provider:"postgresql",request:{query:e.query,options:e.options,details:{transaction:"read-only",plan:"Index Scan"}},response:{durationMs:18,returnedRows:a.length,contentType:"application/json",preview:JSON.stringify(a)}}}:{}}}const ke={title:"Data/QueryBrowser",component:g,parameters:{layout:"fullscreen",docs:{description:{component:"A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required."}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>y.jsx("div",{className:"h-full p-density-4",children:y.jsx(g,{...e,className:"h-full min-h-0"})})},s={args:{id:"storybook-query-browser-sql",title:"Service health",language:"sql",queryLabel:"PostgreSQL query",initialQuery:`SELECT observed_at, service, status, region, duration_ms
FROM service_health
ORDER BY observed_at DESC`,optionsSchema:L,initialOptions:{database:"operations",readOnly:!0},completion:{kind:"sql",dialect:"postgresql",defaultSchema:"public",schemas:[{name:"public",relations:[{name:"service_health",columns:E.map(e=>({name:e.name}))}]}]},execute:P},play:async({canvasElement:e})=>{const t=w(e);await q.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("Checkout API")).resolves.toBeVisible(),await l(t.findByText("Page 1 of 2")).resolves.toBeVisible()}},o={args:{id:"storybook-query-browser-error",title:"Broken query",language:"sql",initialQuery:"SELECT missing_column FROM service_health",execute:async()=>{throw new T("query execution failed",{provider:"postgresql",request:{query:"SELECT missing_column FROM service_health"},response:{details:{code:"42703"}},error:"column missing_column does not exist"})}},play:async({canvasElement:e})=>{const t=w(e);await q.click(t.getByRole("button",{name:"Run"})),await l(t.findByText("query execution failed")).resolves.toBeVisible()}};var v,h,b;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(b=(h=s.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var _,f,x;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(x=(f=o.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};const Be=["SqlResults","ProviderError"];export{o as ProviderError,s as SqlResults,Be as __namedExportsOrder,ke as default};

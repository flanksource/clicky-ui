import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{i as n,n as r,r as i,t as a}from"./QueryBrowser-gj4Ny1GR.js";async function o(e){let t=d.filter(t=>Object.entries(e.filters??{}).every(([e,n])=>{let r=String(t[e]??``),i=n.split(`,`).filter(Boolean),a=i.filter(e=>!e.startsWith(`!`)),o=i.filter(e=>e.startsWith(`!`)).map(e=>e.slice(1));return(a.length===0||a.includes(r))&&!o.includes(r)})),n=e.pagination?.limit??4,r=e.pagination?.offset??0,i=t.slice(r,r+n);return{rows:i,columns:f,durationMs:18,pagination:{mode:`offset`,limit:n,offset:r,hasMore:r+n<t.length,total:t.length,totalRelation:`eq`,consistency:`snapshot`},diagnostics:{provider:`postgresql`,request:{query:e.query,options:e.options,details:{transaction:`read-only`,plan:`Index Scan`}},response:{durationMs:18,returnedRows:i.length,contentType:`application/json`,preview:JSON.stringify(i)}}}}var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),n(),s=t(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d=[{observed_at:`2026-08-11T08:14:32Z`,service:`Checkout API`,status:`healthy`,region:`eu-west`,duration_ms:84},{observed_at:`2026-08-11T08:14:21Z`,service:`Ledger Worker`,status:`degraded`,region:`us-east`,duration_ms:413},{observed_at:`2026-08-11T08:13:58Z`,service:`Identity API`,status:`healthy`,region:`eu-west`,duration_ms:126},{observed_at:`2026-08-11T08:13:44Z`,service:`Reporting API`,status:`failed`,region:`ap-south`,duration_ms:1305},{observed_at:`2026-08-11T08:13:12Z`,service:`Checkout API`,status:`healthy`,region:`us-east`,duration_ms:91},{observed_at:`2026-08-11T08:12:47Z`,service:`Ledger Worker`,status:`healthy`,region:`eu-west`,duration_ms:204}],f=[{name:`observed_at`,label:`Observed`,kind:`timestamp`},{name:`service`,label:`Service`,filterKey:`service`,filter:{kind:`terms`,options:[`Checkout API`,`Ledger Worker`,`Identity API`,`Reporting API`].map(e=>({value:e}))}},{name:`status`,label:`Status`,kind:`status`,filterKey:`status`,filter:{kind:`terms`,options:[`healthy`,`degraded`,`failed`].map(e=>({value:e}))}},{name:`region`,label:`Region`},{name:`duration_ms`,label:`Duration (ms)`}],p={type:`object`,properties:{database:{type:`string`,title:`Database`,enum:[`operations`,`analytics`]},readOnly:{type:`boolean`,title:`Read only`}}},m={title:`Data/QueryBrowser`,component:a,parameters:{layout:`fullscreen`,docs:{description:{component:`A provider-neutral query workspace with CodeMirror editing, optional schema-driven options, remembered history, source-described filters, pagination, result details and provider diagnostics. The examples use an in-memory SQL executor, so no backend is required.`}}},argTypes:{execute:{table:{disable:!0}},lookupFilterValues:{table:{disable:!0}},renderResults:{table:{disable:!0}},navigator:{table:{disable:!0}}},render:e=>(0,s.jsx)(`div`,{className:`h-full p-density-4`,children:(0,s.jsx)(a,{...e,className:`h-full min-h-0`})})},h={args:{id:`storybook-query-browser-sql`,title:`Service health`,language:`sql`,queryLabel:`PostgreSQL query`,initialQuery:`SELECT observed_at, service, status, region, duration_ms
FROM service_health
ORDER BY observed_at DESC`,optionsSchema:p,initialOptions:{database:`operations`,readOnly:!0},completion:{kind:`sql`,dialect:`postgresql`,defaultSchema:`public`,schemas:[{name:`public`,relations:[{name:`service_health`,columns:f.map(e=>({name:e.name}))}]}]},execute:o},play:async({canvasElement:e})=>{let t=u(e);await l.click(t.getByRole(`button`,{name:`Run`})),await c(t.findByText(`Checkout API`)).resolves.toBeVisible(),await c(t.findByText(`Page 1 of 2`)).resolves.toBeVisible()}},g={args:{id:`storybook-query-browser-error`,title:`Broken query`,language:`sql`,initialQuery:`SELECT missing_column FROM service_health`,execute:async()=>{throw new i(`query execution failed`,{provider:`postgresql`,request:{query:`SELECT missing_column FROM service_health`},response:{details:{code:`42703`}},error:`column missing_column does not exist`})}},play:async({canvasElement:e})=>{let t=u(e);await l.click(t.getByRole(`button`,{name:`Run`})),await c(t.findByText(`query execution failed`)).resolves.toBeVisible()}},_=[`SqlResults`,`ProviderError`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}}})))()}v();export{g as ProviderError,h as SqlResults,_ as __namedExportsOrder,m as default};
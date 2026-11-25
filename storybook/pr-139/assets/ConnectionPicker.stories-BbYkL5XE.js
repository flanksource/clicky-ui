import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Zl as r,ci as i,n as a}from"./icons-gNlgqXHH.js";import{r as o,t as s}from"./Icon-C19Ihno2.js";import{l as c,n as l,t as u,u as d}from"./JsonSchemaForm-BvAGuYWc.js";import{n as f,r as p}from"./QueryClientProvider-b6YDq6fV.js";import{n as m,t as h}from"./queryClient-lXfmqi15.js";import{i as g,r as _}from"./connections.test-utils-DTuPgzMc.js";function v({options:e,...t}){let[n,r]=(0,b.useState)(``);return(0,x.jsxs)(`div`,{className:`max-w-md space-y-2`,children:[(0,x.jsx)(c,{options:e,value:n,onChange:r,...t}),(0,x.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:n?(0,x.jsx)(`code`,{children:n}):`Nothing selected.`})]})}function y({connectionApiBase:e}){let[t,n]=(0,b.useState)({});return(0,x.jsxs)(`div`,{className:`max-w-xl space-y-2`,children:[(0,x.jsx)(u,{schema:N,value:t,onChange:n,lookupFetcher:P,showPreferencesMenu:!1,...e?{connectionApiBase:e}:{}}),(0,x.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:typeof t.db==`string`?(0,x.jsx)(`code`,{children:t.db}):`Nothing selected.`})]})}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{m(),p(),b=t(),l(),o(),a(),g(),d(),x=n(),{expect:S,userEvent:C,within:w}=__STORYBOOK_MODULE_TEST__,T=`/api/v1`,E=(0,x.jsx)(s,{icon:r}),D=[{value:`connection://pg/main`,label:`main`,group:`Postgres`,icon:E,description:`db.internal:5432 · app`,badges:[{label:`svc`,icon:(0,x.jsx)(s,{icon:i}),tone:`teal`}]},{value:`connection://cache/sessions`,label:`sessions`,group:`Redis`,icon:E,description:`valkey.cache.svc:6379`,badges:[{label:`svc`,icon:(0,x.jsx)(s,{icon:i}),tone:`teal`}]},{value:`connection://pg/warehouse`,label:`warehouse`,group:`Postgres`,icon:E,description:`warehouse.analytics:5432 · orders`,badges:[{label:`proxy`,tone:`violet`}]},{value:`connection://ledger`,label:`ledger`,group:`SQL Server`,icon:E,description:`ledger.finance:1433`,badges:[{label:`via main`,tone:`indigo`}]}],O={title:`Connections/ConnectionPicker`,component:v,args:{options:D},parameters:{docs:{description:{component:'Picks one connection from the options a lookup returned, by its `connection://` ref. Icon, endpoint and badges arrive on each option; the picker holds no connection model. An untyped picker lists rows under a type header, a typed one (`types` with one entry) pins that type\'s icon and lists only matching rows. The "New … connection…" footer appears only when `onCreate` is given.'}}}},k={play:async({canvasElement:e})=>{await C.click(await w(e).findByRole(`combobox`));let t=w(e.ownerDocument.body);await S(await t.findByText(`SQL Server`)).toBeInTheDocument(),await S(t.queryByRole(`button`,{name:/New .*connection/})).toBeNull()}},A={args:{options:D.filter(e=>e.group===`Postgres`),types:[`postgres`],onCreate:()=>{}},play:async({canvasElement:e})=>{await C.click(await w(e).findByRole(`combobox`));let t=w(e.ownerDocument.body);await S(await t.findByRole(`button`,{name:`New Postgres connection…`})).toBeInTheDocument()}},j=async(e,t)=>{let n=(t?.method??`GET`).toUpperCase(),r=String(e),i=(e,t=`application/json`)=>new Response(JSON.stringify(e),{status:200,headers:{"Content-Type":t}});return n===`GET`&&r===`${T}/connection`?i(_,`application/schema+json`):n===`GET`&&r.startsWith(`${T}/connections/contexts`)?i({currentContext:`kind-dev`,contexts:[`kind-dev`]}):n===`GET`&&r.startsWith(`${T}/connections/namespaces`)?i([`analytics`,`default`]):n===`GET`&&r.startsWith(`${T}/connections/secrets`)?i([{name:`db-credentials`,keys:[`username`,`password`]}]):n===`POST`&&r===`${T}/connection`?i({id:`new-1`,...JSON.parse(String(t?.body))}):new Response(`no fake route for ${n} ${r}`,{status:404})},M=e=>{let t=(0,b.useRef)(void 0);globalThis.fetch!==j&&(t.current=globalThis.fetch,globalThis.fetch=j),(0,b.useEffect)(()=>()=>{t.current&&(globalThis.fetch=t.current)},[]);let[n]=(0,b.useState)(()=>new h({defaultOptions:{queries:{retry:!1}}}));return(0,x.jsx)(f,{client:n,children:(0,x.jsx)(e,{})})},N={type:`object`,properties:{db:{type:`string`,title:`Database`,format:`connection`,"x-connection-types":[`postgres`],"x-clicky-lookup":{url:`/api/v1/lookup/t0/db`,filter:`connection`}}}},P=async()=>D.filter(e=>e.group===`Postgres`),F={decorators:[M],render:()=>(0,x.jsx)(y,{connectionApiBase:T}),play:async({canvasElement:e})=>{await C.click(await w(e).findByRole(`combobox`)),await C.click(await w(e.ownerDocument.body).findByRole(`button`,{name:`New Postgres connection…`})),await S(await w(e.ownerDocument.body).findByRole(`dialog`,{name:/New Postgres connection/})).toBeInTheDocument()}},I={render:()=>(0,x.jsx)(y,{})},L=[`UntypedGroupedByType`,`TypedWithCreateFooter`,`InAFormWithInlineCreate`,`InAFormWithoutCreate`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("SQL Server")).toBeInTheDocument();
    await expect(body.queryByRole("button", {
      name: /New .*connection/
    })).toBeNull();
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    options: FLEET.filter(option => option.group === "Postgres"),
    types: ["postgres"],
    onCreate: () => {}
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("button", {
      name: "New Postgres connection…"
    })).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  decorators: [withFakeConnectionsApi],
  render: () => <FormField connectionApiBase={API_BASE} />,
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(await within(canvasElement).findByRole("combobox"));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", {
      name: "New Postgres connection…"
    }));
    await expect(await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: /New Postgres connection/
    })).toBeInTheDocument();
  }
}`,...F.parameters?.docs?.source},description:{story:'A `format: "connection"` field in JsonSchemaForm. Given a `connectionApiBase`\nthe picker\'s footer opens the create dialog; saving POSTs to the service and\nselects the created `connection://` ref.',...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <FormField />
}`,...I.parameters?.docs?.source}}}})))()}R();export{F as InAFormWithInlineCreate,I as InAFormWithoutCreate,A as TypedWithCreateFooter,k as UntypedGroupedByType,L as __namedExportsOrder,O as default};
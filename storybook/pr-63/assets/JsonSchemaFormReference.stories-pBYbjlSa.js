import{j as e,r as I}from"./iframe-Cr-FkDEs.js";import{J as M}from"./JsonSchemaForm-PoqHb0Up.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./Icon-D4-4O73G.js";import"./DropdownMenu-J3cpbvJi.js";import"./floating-ui.react-D2O3t5CC.js";import"./index-CZGmL05H.js";import"./index-DE_cDvZT.js";import"./button-BIMW_edl.js";import"./index-0zBpNI7D.js";import"./loading-CKGAX9p1.js";import"./DropdownMenuSubmenu-FzQnMbXI.js";import"./modalStack-CxrbjVR6.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-CAScCkav.js";import"./path-tree-DWa9VY15.js";import"./json-schema-form-size-DYVq0lph.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-CHlccKiM.js";import"./FilterPill-mf-mv3ck.js";import"./DateTimePicker-C6_EFGUM.js";import"./SegmentedControl-6bGXsPAd.js";import"./TreePickerField-DD6W2h9A.js";import"./Tree-CdW_JhYF.js";import"./TreeNode-DfgtrsAC.js";const{expect:_,userEvent:y,within:r}=__STORYBOOK_MODULE_TEST__;function n({title:i,description:t,schema:s,initialValue:u,lookupFetcher:h}){const[g,V]=I.useState(u);return e.jsxs("article",{className:"mx-auto max-w-7xl space-y-4",children:[e.jsxs("header",{className:"space-y-1",children:[e.jsx("h2",{className:"text-xl font-semibold text-foreground",children:i}),e.jsx("p",{className:"max-w-3xl text-sm text-muted-foreground",children:t})]}),e.jsxs("div",{className:"grid items-start gap-6 xl:grid-cols-2",children:[e.jsxs("section",{className:"min-w-0 space-y-3 rounded-lg border border-border bg-background p-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"Rendered form"}),e.jsx(M,{schema:s,value:g,onChange:V,idPrefix:i.toLowerCase().replace(/[^a-z0-9]+/g,"-"),showPreferencesMenu:!1,...h?{lookupFetcher:h}:{}}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Live value"}),e.jsx("pre",{className:"max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(g,null,2)})]})]}),e.jsxs("section",{className:"min-w-0 space-y-2 rounded-lg border border-border bg-muted/20 p-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"JSON Schema"}),e.jsx("pre",{className:"max-h-[46rem] overflow-auto whitespace-pre rounded-md bg-background p-3 font-mono text-xs",children:JSON.stringify(s,null,2)})]})]})]})}const H={type:"object",required:["name","quantity"],properties:{name:{type:"string",title:"Display name",description:"A required plain string field."},quantity:{type:"integer",title:"Quantity",minimum:1,maximum:100,multipleOf:1},completion:{type:"number",title:"Completion",format:"percent",minimum:0,maximum:100},publishedOn:{type:"string",title:"Published on",format:"date"},runAt:{type:"string",title:"Run at",format:"date-time"},notes:{type:"string",title:"Notes",format:"textarea",description:"Long-form text uses a multiline control."},enabled:{type:"boolean",title:"Enabled"},resourceId:{type:"string",title:"Resource ID",readOnly:!0}}},J={type:"object",properties:{environment:{type:"string",title:"Environment",enum:["dev","staging","prod"],"x-enum-labels":{dev:"Development",staging:"Staging",prod:"Production"}},cadence:{type:"string",title:"Cadence",enum:["manual","scheduled"],"x-enum-display":"radio","x-enum-labels":{manual:"Manual",scheduled:"Scheduled"}},database:{type:"string",title:"Database",enum:["postgres","mysql"],"x-enum-display":"grid","x-enum-labels":{postgres:"PostgreSQL",mysql:"MySQL"},"x-enum-icons":{postgres:"postgres",mysql:"mysql"},"x-enum-descriptions":{postgres:"Feature-rich relational database.",mysql:"Widely deployed relational database."}},strategy:{type:"string",title:"Deployment strategy",enum:["safe","fast"],"x-enum-display":"segmented","x-enum-labels":{safe:"Safe",fast:"Fast"},"x-enum-icons":{safe:"shield",fast:"rocket"},"x-enum-descriptions":{safe:"Require approval before rollout.",fast:"Deploy immediately after checks."}}}},U={type:"object",required:["owner","destination"],properties:{owner:{$ref:"#/$defs/person",title:"Owner"},destination:{type:"string",title:"Destination",description:"An enum branch supplies suggestions while the string branch permits custom values.",anyOf:[{enum:["production","staging"]},{type:"string"}]}},allOf:[{properties:{retries:{type:"integer",title:"Retries",minimum:0,maximum:10,multipleOf:1}}}],$defs:{person:{type:"object",required:["email"],properties:{name:{type:"string",title:"Name"},email:{type:"string",title:"Email"}}}}},Q={type:"object",properties:{frameworks:{type:"array",title:"Test frameworks",description:"An empty array represents all options.","x-array-display":"filter-pills",items:{type:"string",enum:["go test","vitest","playwright"]}},steps:{type:"array",title:"Pipeline steps","x-layout":"table",items:{type:"object",required:["name"],properties:{name:{type:"string",title:"Name"},command:{type:"string",title:"Command"},required:{type:"boolean",title:"Required"}}}},labels:{type:"object",title:"Labels",propertyNames:{enum:["environment","team","tier"]},additionalProperties:{type:"string"}}}},$={type:"object","x-columns":12,"x-order":["endpoint","timeout","budget","mode"],properties:{endpoint:{type:"string",title:"Endpoint","x-col-span":8,"x-input-prefix-icon":"globe","x-help":{section:"Connectivity",body:"Use a host reachable from the selected runtime."}},timeout:{type:"integer",title:"Timeout",minimum:0,multipleOf:1,"x-col-span":4,"x-input-suffix":"ms"},budget:{type:"integer",title:"Token budget",minimum:0,maximum:64e3,multipleOf:1e3,"x-number-display":"slider","x-col-span":12},mode:{type:"string",title:"Mode",enum:["plan","run"],"x-enum-display":"segmented","x-enum-labels":{plan:"Plan",run:"Run"},"x-enum-icons":{plan:"list-dashes",run:"play"},"x-enum-descriptions":{plan:"Inspect and propose changes.",run:"Apply and verify changes."},"x-col-span":12}}},Y={type:"object","x-discriminator":"type",required:["type","name"],properties:{type:{type:"string",title:"Connection type",enum:["postgres","mysql"],"x-enum-display":"grid","x-enum-labels":{postgres:"PostgreSQL",mysql:"MySQL"},"x-enum-icons":{postgres:"postgres",mysql:"mysql"}},name:{type:"string",title:"Connection name"}},allOf:[{if:{properties:{type:{const:"postgres"}},required:["type"]},then:{properties:{host:{type:"string",title:"Host"},sslMode:{type:"string",title:"SSL mode",enum:["disable","prefer","require"]}},required:["host"]}},{if:{properties:{type:{const:"mysql"}},required:["type"]},then:{properties:{socket:{type:"string",title:"Unix socket"},charset:{type:"string",title:"Character set",default:"utf8mb4"}}}}]},je={title:"Components/JsonSchemaForm/Schema Reference",parameters:{layout:"fullscreen",docs:{description:{component:"Runnable JSON Schema reference examples. Every story pairs the exact schema with its rendered `JsonSchemaForm` and live controlled value, so the schema-to-control mapping is visible without opening the source file."}}}},a={render:()=>e.jsx(n,{title:"Standard fields and formats",description:"Required fields, descriptions, numeric constraints, date and date-time formats, percent and textarea controls, booleans, and per-field readOnly behavior.",schema:H,initialValue:{name:"Release candidate",quantity:3,completion:75,publishedOn:"2026-07-11",runAt:"2026-07-11T18:30",notes:"Promote after smoke tests pass.",enabled:!0,resourceId:"release-2026-07-11"}})},o={render:()=>e.jsx(n,{title:"Enum presentations",description:"The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints.",schema:J,initialValue:{environment:"prod",cadence:"scheduled",database:"postgres",strategy:"safe"}})},l={render:()=>e.jsx(n,{title:"Composition, unions, and local references",description:"Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch.",schema:U,initialValue:{owner:{name:"Ada Lovelace",email:"ada@example.com"},destination:"production",retries:2}})},c={render:()=>e.jsx(n,{title:"Collection presentations",description:"Enum arrays can render as filter pills, arrays of objects can render as compact tables, and propertyNames.enum constrains editable map keys.",schema:Q,initialValue:{frameworks:["go test","vitest"],steps:[{name:"Unit tests",command:"pnpm test",required:!0},{name:"Build",command:"pnpm build",required:!0}],labels:{environment:"production",team:"platform"}}})},m={render:()=>e.jsx(n,{title:"Clicky layout and control extensions",description:"A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum.",schema:$,initialValue:{endpoint:"api.example.com",timeout:5e3,budget:16e3,mode:"plan"}})},p={render:()=>e.jsx(n,{title:"Discriminator flow",description:"x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch.",schema:Y,initialValue:{}})},z=["http","jms","jms.all","jms.incoming","jms.incoming.disbursements","logs.api","logs.cycle","remote-debugger.jdbc"],K=async({query:i})=>z.filter(t=>t.toLowerCase().includes(i.toLowerCase())).map(t=>({value:t,label:t})),W={type:"object",properties:{dest:{type:"string",title:"Destination",description:"Single select: committing closes the picker.","x-clicky-lookup":{url:"/api/v1/profiles",filter:"profile",hierarchy:{delimiters:"./"}}},imports:{type:"array",title:"Imports",description:"Multi select: committed values stay as chips.",items:{type:"string"},"x-clicky-lookup":{url:"/api/v1/profiles",filter:"profile",multi:!0,hierarchy:{delimiters:"./"}}}}},d={render:()=>e.jsx(n,{title:"Hierarchical lookups",description:"An x-clicky-lookup whose descriptor declares `hierarchy` browses its options as a tree instead of a flat list. The committed value is always the option's own value — the split is presentation only.",schema:W,initialValue:{imports:["jms"]},lookupFetcher:K}),play:async({canvasElement:i})=>{const t=r(i);await y.click(await t.findByRole("button",{name:/Select/}));const s=await r(document.body).findByRole("tree"),u=r(s).getByText("jms").closest('[role="treeitem"]');await y.click(r(u).getAllByRole("button",{name:/Expand/})[0]),await y.click(r(s).getByText("incoming")),await _(t.getByRole("button",{name:/jms\.incoming/})).toBeInTheDocument()}};var f,x,b;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Standard fields and formats" description="Required fields, descriptions, numeric constraints, date and date-time formats, percent and textarea controls, booleans, and per-field readOnly behavior." schema={standardFieldsSchema} initialValue={{
    name: "Release candidate",
    quantity: 3,
    completion: 75,
    publishedOn: "2026-07-11",
    runAt: "2026-07-11T18:30",
    notes: "Promote after smoke tests pass.",
    enabled: true,
    resourceId: "release-2026-07-11"
  }} />
}`,...(b=(x=a.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var w,v,k;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Enum presentations" description="The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints." schema={enumPresentationsSchema} initialValue={{
    environment: "prod",
    cadence: "scheduled",
    database: "postgres",
    strategy: "safe"
  }} />
}`,...(k=(v=o.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var S,j,E;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Composition, unions, and local references" description="Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch." schema={compositionSchema} initialValue={{
    owner: {
      name: "Ada Lovelace",
      email: "ada@example.com"
    },
    destination: "production",
    retries: 2
  }} />
}`,...(E=(j=l.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var R,q,C;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Collection presentations" description="Enum arrays can render as filter pills, arrays of objects can render as compact tables, and propertyNames.enum constrains editable map keys." schema={collectionPresentationsSchema} initialValue={{
    frameworks: ["go test", "vitest"],
    steps: [{
      name: "Unit tests",
      command: "pnpm test",
      required: true
    }, {
      name: "Build",
      command: "pnpm build",
      required: true
    }],
    labels: {
      environment: "production",
      team: "platform"
    }
  }} />
}`,...(C=(q=c.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var O,L,N;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Clicky layout and control extensions" description="A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum." schema={clickyExtensionsSchema} initialValue={{
    endpoint: "api.example.com",
    timeout: 5000,
    budget: 16000,
    mode: "plan"
  }} />
}`,...(N=(L=m.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var A,T,P;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Discriminator flow" description="x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch." schema={discriminatorSchema} initialValue={{}} />
}`,...(P=(T=p.parameters)==null?void 0:T.docs)==null?void 0:P.source}}};var B,F,D;d.parameters={...d.parameters,docs:{...(B=d.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Hierarchical lookups" description="An x-clicky-lookup whose descriptor declares \`hierarchy\` browses its options as a tree instead of a flat list. The committed value is always the option's own value — the split is presentation only." schema={hierarchicalLookupSchema} initialValue={{
    imports: ["jms"]
  }} lookupFetcher={hierarchicalLookupFetcher} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", {
      name: /Select/
    }));

    // The panel is portaled to the body, so it is queried from the document.
    const panel = await within(document.body).findByRole("tree");

    // A node that is both a folder and a leaf keeps its caret, so its children
    // stay reachable without committing it.
    const jms = within(panel).getByText("jms").closest('[role="treeitem"]')!;
    await userEvent.click(within(jms as HTMLElement).getAllByRole("button", {
      name: /Expand/
    })[0]!);
    await userEvent.click(within(panel).getByText("incoming"));

    // The dotted name is committed whole — "jms/incoming" is only the tree key.
    await expect(canvas.getByRole("button", {
      name: /jms\\.incoming/
    })).toBeInTheDocument();
  }
}`,...(D=(F=d.parameters)==null?void 0:F.docs)==null?void 0:D.source}}};const Ee=["StandardFieldsAndFormats","EnumPresentations","CompositionAndLocalReferences","CollectionPresentations","ClickyLayoutAndControlExtensions","DiscriminatorFlow","HierarchicalLookups"];export{m as ClickyLayoutAndControlExtensions,c as CollectionPresentations,l as CompositionAndLocalReferences,p as DiscriminatorFlow,o as EnumPresentations,d as HierarchicalLookups,a as StandardFieldsAndFormats,Ee as __namedExportsOrder,je as default};

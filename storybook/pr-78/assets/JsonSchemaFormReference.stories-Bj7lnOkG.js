import{j as e,r as Q}from"./iframe-Cco5TqZn.js";import{J as $}from"./JsonSchemaForm-C8lH8wi3.js";import"./preload-helper-CW1BdeJu.js";import"./utils-DW-IJACk.js";import"./Icon-C6Dn9DLx.js";import"./DropdownMenu-w_RgGUTs.js";import"./floating-ui.react-Dpy7yByO.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./button-DNj3-z2W.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-D8KXkP_9.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-C3T75D-C.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-DPrIRjAr.js";import"./FilterPill-BVle6yuL.js";import"./DateField-4aaT9ulH.js";import"./DatePicker-CHly8a8a.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./SegmentedControl-qK3H5opf.js";import"./TreePickerField-CeaptdSL.js";import"./Tree-BRZblghw.js";import"./TreeNode-LqK2sArM.js";import"./InputField-CsJL85KY.js";import"./use-hotkey-DVDdDWa6.js";import"./ListMenu-CLCjJMXE.js";const{expect:g,userEvent:r,within:s}=__STORYBOOK_MODULE_TEST__;function i({title:n,description:t,schema:a,initialValue:y,lookupFetcher:x}){const[f,U]=Q.useState(y);return e.jsxs("article",{className:"mx-auto max-w-7xl space-y-4",children:[e.jsxs("header",{className:"space-y-1",children:[e.jsx("h2",{className:"text-xl font-semibold text-foreground",children:n}),e.jsx("p",{className:"max-w-3xl text-sm text-muted-foreground",children:t})]}),e.jsxs("div",{className:"grid items-start gap-6 xl:grid-cols-2",children:[e.jsxs("section",{className:"min-w-0 space-y-3 rounded-lg border border-border bg-background p-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"Rendered form"}),e.jsx($,{schema:a,value:f,onChange:U,idPrefix:n.toLowerCase().replace(/[^a-z0-9]+/g,"-"),showPreferencesMenu:!1,...x?{lookupFetcher:x}:{}}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Live value"}),e.jsx("pre",{className:"max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(f,null,2)})]})]}),e.jsxs("section",{className:"min-w-0 space-y-2 rounded-lg border border-border bg-muted/20 p-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"JSON Schema"}),e.jsx("pre",{className:"max-h-[46rem] overflow-auto whitespace-pre rounded-md bg-background p-3 font-mono text-xs",children:JSON.stringify(a,null,2)})]})]})]})}const Y={type:"object",required:["name","quantity"],properties:{name:{type:"string",title:"Display name",description:"A required plain string field."},quantity:{type:"integer",title:"Quantity",minimum:1,maximum:100,multipleOf:1},completion:{type:"number",title:"Completion",format:"percent",minimum:0,maximum:100},publishedOn:{type:"string",title:"Published on",format:"date"},runAt:{type:"string",title:"Run at",format:"date-time"},notes:{type:"string",title:"Notes",format:"textarea",description:"Long-form text uses a multiline control."},enabled:{type:"boolean",title:"Enabled"},resourceId:{type:"string",title:"Resource ID",readOnly:!0}}},z={type:"object",properties:{environment:{type:"string",title:"Environment",enum:["dev","staging","prod"],"x-enum-labels":{dev:"Development",staging:"Staging",prod:"Production"}},cadence:{type:"string",title:"Cadence",enum:["manual","scheduled"],"x-enum-display":"radio","x-enum-labels":{manual:"Manual",scheduled:"Scheduled"}},database:{type:"string",title:"Database",enum:["postgres","mysql"],"x-enum-display":"grid","x-enum-labels":{postgres:"PostgreSQL",mysql:"MySQL"},"x-enum-icons":{postgres:"postgres",mysql:"mysql"},"x-enum-descriptions":{postgres:"Feature-rich relational database.",mysql:"Widely deployed relational database."}},strategy:{type:"string",title:"Deployment strategy",enum:["safe","fast"],"x-enum-display":"segmented","x-enum-labels":{safe:"Safe",fast:"Fast"},"x-enum-icons":{safe:"shield",fast:"rocket"},"x-enum-descriptions":{safe:"Require approval before rollout.",fast:"Deploy immediately after checks."}}}},K={type:"object",required:["owner","destination"],properties:{owner:{$ref:"#/$defs/person",title:"Owner"},destination:{type:"string",title:"Destination",description:"An enum branch supplies suggestions while the string branch permits custom values.",anyOf:[{enum:["production","staging"]},{type:"string"}]}},allOf:[{properties:{retries:{type:"integer",title:"Retries",minimum:0,maximum:10,multipleOf:1}}}],$defs:{person:{type:"object",required:["email"],properties:{name:{type:"string",title:"Name"},email:{type:"string",title:"Email"}}}}},W={type:"object",properties:{frameworks:{type:"array",title:"Test frameworks",description:"An empty array represents all options.","x-array-display":"filter-pills",items:{type:"string",enum:["go test","vitest","playwright"]}},steps:{type:"array",title:"Pipeline steps","x-layout":"table",items:{type:"object",required:["name"],properties:{name:{type:"string",title:"Name"},command:{type:"string",title:"Command"},required:{type:"boolean",title:"Required"}}}},labels:{type:"object",title:"Labels",propertyNames:{enum:["environment","team","tier"]},additionalProperties:{type:"string"}}}},G={type:"object","x-columns":12,"x-order":["endpoint","timeout","budget","mode"],properties:{endpoint:{type:"string",title:"Endpoint","x-col-span":8,"x-input-prefix-icon":"globe","x-help":{section:"Connectivity",body:"Use a host reachable from the selected runtime."}},timeout:{type:"integer",title:"Timeout",minimum:0,multipleOf:1,"x-col-span":4,"x-input-suffix":"ms"},budget:{type:"integer",title:"Token budget",minimum:0,maximum:64e3,multipleOf:1e3,"x-number-display":"slider","x-col-span":12},mode:{type:"string",title:"Mode",enum:["plan","run"],"x-enum-display":"segmented","x-enum-labels":{plan:"Plan",run:"Run"},"x-enum-icons":{plan:"list-dashes",run:"play"},"x-enum-descriptions":{plan:"Inspect and propose changes.",run:"Apply and verify changes."},"x-col-span":12}}},X={type:"object","x-discriminator":"type",required:["type","name"],properties:{type:{type:"string",title:"Connection type",enum:["postgres","mysql"],"x-enum-display":"grid","x-enum-labels":{postgres:"PostgreSQL",mysql:"MySQL"},"x-enum-icons":{postgres:"postgres",mysql:"mysql"}},name:{type:"string",title:"Connection name"}},allOf:[{if:{properties:{type:{const:"postgres"}},required:["type"]},then:{properties:{host:{type:"string",title:"Host"},sslMode:{type:"string",title:"SSL mode",enum:["disable","prefer","require"]}},required:["host"]}},{if:{properties:{type:{const:"mysql"}},required:["type"]},then:{properties:{socket:{type:"string",title:"Unix socket"},charset:{type:"string",title:"Character set",default:"utf8mb4"}}}}]},Pe={title:"Components/JsonSchemaForm/Schema Reference",parameters:{layout:"fullscreen",docs:{description:{component:"Runnable JSON Schema reference examples. Every story pairs the exact schema with its rendered `JsonSchemaForm` and live controlled value, so the schema-to-control mapping is visible without opening the source file."}}}},o={render:()=>e.jsx(i,{title:"Standard fields and formats",description:"Required fields, descriptions, numeric constraints, date and date-time formats, percent and textarea controls, booleans, and per-field readOnly behavior.",schema:Y,initialValue:{name:"Release candidate",quantity:3,completion:75,publishedOn:"2026-07-11",runAt:"2026-07-11T18:30",notes:"Promote after smoke tests pass.",enabled:!0,resourceId:"release-2026-07-11"}})},l={render:()=>e.jsx(i,{title:"Enum presentations",description:"The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints.",schema:z,initialValue:{environment:"prod",cadence:"scheduled",database:"postgres",strategy:"safe"}})},c={render:()=>e.jsx(i,{title:"Composition, unions, and local references",description:"Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch.",schema:K,initialValue:{owner:{name:"Ada Lovelace",email:"ada@example.com"},destination:"production",retries:2}})},m={render:()=>e.jsx(i,{title:"Collection presentations",description:"Enum arrays can render as filter pills, arrays of objects can render as compact tables, and propertyNames.enum constrains editable map keys.",schema:W,initialValue:{frameworks:["go test","vitest"],steps:[{name:"Unit tests",command:"pnpm test",required:!0},{name:"Build",command:"pnpm build",required:!0}],labels:{environment:"production",team:"platform"}}})},p={render:()=>e.jsx(i,{title:"Clicky layout and control extensions",description:"A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum.",schema:G,initialValue:{endpoint:"api.example.com",timeout:5e3,budget:16e3,mode:"plan"}})},d={render:()=>e.jsx(i,{title:"Discriminator flow",description:"x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch.",schema:X,initialValue:{}})},Z=["http","jms","jms.all","jms.incoming","jms.incoming.disbursements","logs.api","logs.cycle","remote-debugger.jdbc"],J=async({query:n})=>Z.filter(t=>t.toLowerCase().includes(n.toLowerCase())).map(t=>({value:t,label:t})),ee={type:"object",properties:{dest:{type:"string",title:"Destination",description:"Single select: committing closes the picker.","x-clicky-lookup":{url:"/api/v1/profiles",filter:"profile",hierarchy:{delimiters:"./"}}},imports:{type:"array",title:"Imports",description:"Multi select: committed values stay as chips.",items:{type:"string"},"x-clicky-lookup":{url:"/api/v1/profiles",filter:"profile",multi:!0,hierarchy:{delimiters:"./"}}}}},u={render:()=>e.jsx(i,{title:"Hierarchical lookups",description:"An x-clicky-lookup whose descriptor declares `hierarchy` browses its options as a tree instead of a flat list. The committed value is always the option's own value — the split is presentation only.",schema:ee,initialValue:{imports:["jms"]},lookupFetcher:J}),play:async({canvasElement:n})=>{const t=s(n);await r.click(await t.findByRole("button",{name:/Select/}));const a=await s(document.body).findByRole("tree"),y=s(a).getByText("jms").closest('[role="treeitem"]');await r.click(s(y).getAllByRole("button",{name:/Expand/})[0]),await r.click(s(a).getByText("incoming")),await g(t.getByRole("button",{name:/jms\.incoming/})).toBeInTheDocument()}},te={type:"object",properties:{imports:{type:"array",title:"Imports",description:"Multi select: every committed value stays as a pill.",items:{type:"string"},"x-clicky-lookup":{url:"/api/v1/profiles",filter:"profile",multi:!0}}}},h={render:()=>e.jsx(i,{title:"Multi-value lookup",description:"An x-clicky-lookup with `multi: true` on an array field commits a list, so it renders as one tags combobox: the head set loads when the menu opens and typing searches the server (debounced). Add `hierarchy` to browse the same options as a tree instead — see Hierarchical lookups.",schema:te,initialValue:{imports:["jms"]},lookupFetcher:J}),play:async({canvasElement:n})=>{const t=s(n);await g(t.getByText("jms")).toBeInTheDocument(),await r.click(t.getByRole("combobox"));const a=s(document.body);await r.click(await a.findByRole("option",{name:"logs.api"})),await g(t.getByRole("button",{name:"Remove logs.api"})).toBeInTheDocument()}};var b,w,v;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(v=(w=o.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};var k,j,S;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Enum presentations" description="The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints." schema={enumPresentationsSchema} initialValue={{
    environment: "prod",
    cadence: "scheduled",
    database: "postgres",
    strategy: "safe"
  }} />
}`,...(S=(j=l.parameters)==null?void 0:j.docs)==null?void 0:S.source}}};var R,E,q;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Composition, unions, and local references" description="Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch." schema={compositionSchema} initialValue={{
    owner: {
      name: "Ada Lovelace",
      email: "ada@example.com"
    },
    destination: "production",
    retries: 2
  }} />
}`,...(q=(E=c.parameters)==null?void 0:E.docs)==null?void 0:q.source}}};var L,B,C;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(C=(B=m.parameters)==null?void 0:B.docs)==null?void 0:C.source}}};var O,T,A;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Clicky layout and control extensions" description="A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum." schema={clickyExtensionsSchema} initialValue={{
    endpoint: "api.example.com",
    timeout: 5000,
    budget: 16000,
    mode: "plan"
  }} />
}`,...(A=(T=p.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var N,P,D;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Discriminator flow" description="x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch." schema={discriminatorSchema} initialValue={{}} />
}`,...(D=(P=d.parameters)==null?void 0:P.docs)==null?void 0:D.source}}};var F,V,I;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(I=(V=u.parameters)==null?void 0:V.docs)==null?void 0:I.source}}};var M,H,_;h.parameters={...h.parameters,docs:{...(M=h.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Multi-value lookup" description="An x-clicky-lookup with \`multi: true\` on an array field commits a list, so it renders as one tags combobox: the head set loads when the menu opens and typing searches the server (debounced). Add \`hierarchy\` to browse the same options as a tree instead — see Hierarchical lookups." schema={flatLookupSchema} initialValue={{
    imports: ["jms"]
  }} lookupFetcher={hierarchicalLookupFetcher} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The committed value renders before any option has been fetched.
    await expect(canvas.getByText("jms")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("combobox"));
    const body = within(document.body);
    await userEvent.click(await body.findByRole("option", {
      name: "logs.api"
    }));
    await expect(canvas.getByRole("button", {
      name: "Remove logs.api"
    })).toBeInTheDocument();
  }
}`,...(_=(H=h.parameters)==null?void 0:H.docs)==null?void 0:_.source}}};const De=["StandardFieldsAndFormats","EnumPresentations","CompositionAndLocalReferences","CollectionPresentations","ClickyLayoutAndControlExtensions","DiscriminatorFlow","HierarchicalLookups","MultiValueLookup"];export{p as ClickyLayoutAndControlExtensions,m as CollectionPresentations,c as CompositionAndLocalReferences,d as DiscriminatorFlow,l as EnumPresentations,u as HierarchicalLookups,h as MultiValueLookup,o as StandardFieldsAndFormats,De as __namedExportsOrder,Pe as default};

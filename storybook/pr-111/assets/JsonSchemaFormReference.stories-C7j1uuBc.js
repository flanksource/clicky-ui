import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./JsonSchemaForm-D5ET115i.js";function a({title:e,description:t,schema:n,initialValue:r,lookupFetcher:a}){let[c,l]=(0,o.useState)(r);return(0,s.jsxs)(`article`,{className:`mx-auto max-w-7xl space-y-4`,children:[(0,s.jsxs)(`header`,{className:`space-y-1`,children:[(0,s.jsx)(`h2`,{className:`text-xl font-semibold text-foreground`,children:e}),(0,s.jsx)(`p`,{className:`max-w-3xl text-sm text-muted-foreground`,children:t})]}),(0,s.jsxs)(`div`,{className:`grid items-start gap-6 xl:grid-cols-2`,children:[(0,s.jsxs)(`section`,{className:`min-w-0 space-y-3 rounded-lg border border-border bg-background p-4`,children:[(0,s.jsx)(`h3`,{className:`text-sm font-semibold text-foreground`,children:`Rendered form`}),(0,s.jsx)(i,{schema:n,value:c,onChange:l,idPrefix:e.toLowerCase().replace(/[^a-z0-9]+/g,`-`),showPreferencesMenu:!1,...a?{lookupFetcher:a}:{}}),(0,s.jsxs)(`div`,{className:`space-y-1`,children:[(0,s.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-wide text-muted-foreground`,children:`Live value`}),(0,s.jsx)(`pre`,{className:`max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs`,children:JSON.stringify(c,null,2)})]})]}),(0,s.jsxs)(`section`,{className:`min-w-0 space-y-2 rounded-lg border border-border bg-muted/20 p-4`,children:[(0,s.jsx)(`h3`,{className:`text-sm font-semibold text-foreground`,children:`JSON Schema`}),(0,s.jsx)(`pre`,{className:`max-h-[46rem] overflow-auto whitespace-pre rounded-md bg-background p-3 font-mono text-xs`,children:JSON.stringify(n,null,2)})]})]})]})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={type:`object`,required:[`name`,`quantity`],properties:{name:{type:`string`,title:`Display name`,description:`A required plain string field.`},quantity:{type:`integer`,title:`Quantity`,minimum:1,maximum:100,multipleOf:1},completion:{type:`number`,title:`Completion`,format:`percent`,minimum:0,maximum:100},publishedOn:{type:`string`,title:`Published on`,format:`date`},runAt:{type:`string`,title:`Run at`,format:`date-time`},notes:{type:`string`,title:`Notes`,format:`textarea`,description:`Long-form text uses a multiline control.`},enabled:{type:`boolean`,title:`Enabled`},resourceId:{type:`string`,title:`Resource ID`,readOnly:!0}}},f={type:`object`,properties:{environment:{type:`string`,title:`Environment`,enum:[`dev`,`staging`,`prod`],"x-enum-labels":{dev:`Development`,staging:`Staging`,prod:`Production`}},cadence:{type:`string`,title:`Cadence`,enum:[`manual`,`scheduled`],"x-enum-display":`radio`,"x-enum-labels":{manual:`Manual`,scheduled:`Scheduled`}},database:{type:`string`,title:`Database`,enum:[`postgres`,`mysql`],"x-enum-display":`grid`,"x-enum-labels":{postgres:`PostgreSQL`,mysql:`MySQL`},"x-enum-icons":{postgres:`postgres`,mysql:`mysql`},"x-enum-descriptions":{postgres:`Feature-rich relational database.`,mysql:`Widely deployed relational database.`}},strategy:{type:`string`,title:`Deployment strategy`,enum:[`safe`,`fast`],"x-enum-display":`segmented`,"x-enum-labels":{safe:`Safe`,fast:`Fast`},"x-enum-icons":{safe:`shield`,fast:`rocket`},"x-enum-descriptions":{safe:`Require approval before rollout.`,fast:`Deploy immediately after checks.`}}}},p={type:`object`,required:[`owner`,`destination`],properties:{owner:{$ref:`#/$defs/person`,title:`Owner`},destination:{type:`string`,title:`Destination`,description:`An enum branch supplies suggestions while the string branch permits custom values.`,anyOf:[{enum:[`production`,`staging`]},{type:`string`}]}},allOf:[{properties:{retries:{type:`integer`,title:`Retries`,minimum:0,maximum:10,multipleOf:1}}}],$defs:{person:{type:`object`,required:[`email`],properties:{name:{type:`string`,title:`Name`},email:{type:`string`,title:`Email`}}}}},m={type:`object`,properties:{frameworks:{type:`array`,title:`Test frameworks`,description:`An empty array represents all options.`,"x-array-display":`filter-pills`,items:{type:`string`,enum:[`go test`,`vitest`,`playwright`]}},steps:{type:`array`,title:`Pipeline steps`,"x-layout":`table`,items:{type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`},command:{type:`string`,title:`Command`},required:{type:`boolean`,title:`Required`}}}},labels:{type:`object`,title:`Labels`,propertyNames:{enum:[`environment`,`team`,`tier`]},additionalProperties:{type:`string`}}}},h={type:`object`,"x-columns":12,"x-order":[`endpoint`,`timeout`,`budget`,`mode`],properties:{endpoint:{type:`string`,title:`Endpoint`,"x-col-span":8,"x-input-prefix-icon":`globe`,"x-help":{section:`Connectivity`,body:`Use a host reachable from the selected runtime.`}},timeout:{type:`integer`,title:`Timeout`,minimum:0,multipleOf:1,"x-col-span":4,"x-input-suffix":`ms`},budget:{type:`integer`,title:`Token budget`,minimum:0,maximum:64e3,multipleOf:1e3,"x-number-display":`slider`,"x-col-span":12},mode:{type:`string`,title:`Mode`,enum:[`plan`,`run`],"x-enum-display":`segmented`,"x-enum-labels":{plan:`Plan`,run:`Run`},"x-enum-icons":{plan:`list-dashes`,run:`play`},"x-enum-descriptions":{plan:`Inspect and propose changes.`,run:`Apply and verify changes.`},"x-col-span":12}}},g={type:`object`,"x-discriminator":`type`,required:[`type`,`name`],properties:{type:{type:`string`,title:`Connection type`,enum:[`postgres`,`mysql`],"x-enum-display":`grid`,"x-enum-labels":{postgres:`PostgreSQL`,mysql:`MySQL`},"x-enum-icons":{postgres:`postgres`,mysql:`mysql`}},name:{type:`string`,title:`Connection name`}},allOf:[{if:{properties:{type:{const:`postgres`}},required:[`type`]},then:{properties:{host:{type:`string`,title:`Host`},sslMode:{type:`string`,title:`SSL mode`,enum:[`disable`,`prefer`,`require`]}},required:[`host`]}},{if:{properties:{type:{const:`mysql`}},required:[`type`]},then:{properties:{socket:{type:`string`,title:`Unix socket`},charset:{type:`string`,title:`Character set`,default:`utf8mb4`}}}}]},_={title:`JsonSchemaForm/Schema Reference`,parameters:{layout:`fullscreen`,docs:{description:{component:"Runnable JSON Schema reference examples. Every story pairs the exact schema with its rendered `JsonSchemaForm` and live controlled value, so the schema-to-control mapping is visible without opening the source file."}}}},v={render:()=>(0,s.jsx)(a,{title:`Standard fields and formats`,description:`Required fields, descriptions, numeric constraints, date and date-time formats, percent and textarea controls, booleans, and per-field readOnly behavior.`,schema:d,initialValue:{name:`Release candidate`,quantity:3,completion:75,publishedOn:`2026-07-11`,runAt:`2026-07-11T18:30`,notes:`Promote after smoke tests pass.`,enabled:!0,resourceId:`release-2026-07-11`}})},y={render:()=>(0,s.jsx)(a,{title:`Enum presentations`,description:`The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints.`,schema:f,initialValue:{environment:`prod`,cadence:`scheduled`,database:`postgres`,strategy:`safe`}})},b={render:()=>(0,s.jsx)(a,{title:`Composition, unions, and local references`,description:`Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch.`,schema:p,initialValue:{owner:{name:`Ada Lovelace`,email:`ada@example.com`},destination:`production`,retries:2}})},x={render:()=>(0,s.jsx)(a,{title:`Collection presentations`,description:`Enum arrays can render as filter pills, arrays of objects can render as compact tables, and propertyNames.enum constrains editable map keys.`,schema:m,initialValue:{frameworks:[`go test`,`vitest`],steps:[{name:`Unit tests`,command:`pnpm test`,required:!0},{name:`Build`,command:`pnpm build`,required:!0}],labels:{environment:`production`,team:`platform`}}})},S={render:()=>(0,s.jsx)(a,{title:`Clicky layout and control extensions`,description:`A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum.`,schema:h,initialValue:{endpoint:`api.example.com`,timeout:5e3,budget:16e3,mode:`plan`}})},C={render:()=>(0,s.jsx)(a,{title:`Discriminator flow`,description:`x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch.`,schema:g,initialValue:{}})},w=[`http`,`jms`,`jms.all`,`jms.incoming`,`jms.incoming.disbursements`,`logs.api`,`logs.cycle`,`remote-debugger.jdbc`],T=async({query:e})=>w.filter(t=>t.toLowerCase().includes(e.toLowerCase())).map(e=>({value:e,label:e})),E={type:`object`,properties:{dest:{type:`string`,title:`Destination`,description:`Single select: committing closes the picker.`,"x-clicky-lookup":{url:`/api/v1/profiles`,filter:`profile`,hierarchy:{delimiters:`./`}}},imports:{type:`array`,title:`Imports`,description:`Multi select: committed values stay as chips.`,items:{type:`string`},"x-clicky-lookup":{url:`/api/v1/profiles`,filter:`profile`,multi:!0,hierarchy:{delimiters:`./`}}}}},D={render:()=>(0,s.jsx)(a,{title:`Hierarchical lookups`,description:"An x-clicky-lookup whose descriptor declares `hierarchy` browses its options as a tree instead of a flat list. The committed value is always the option's own value — the split is presentation only.",schema:E,initialValue:{imports:[`jms`]},lookupFetcher:T}),play:async({canvasElement:e})=>{let t=u(e);await l.click(await t.findByRole(`button`,{name:/Select/}));let n=await u(document.body).findByRole(`tree`),r=u(n).getByText(`jms`).closest(`[role="treeitem"]`);await l.click(u(r).getAllByRole(`button`,{name:/Expand/})[0]),await l.click(u(n).getByText(`incoming`)),await c(t.getByRole(`button`,{name:/jms\.incoming/})).toBeInTheDocument()}},O={type:`object`,properties:{imports:{type:`array`,title:`Imports`,description:`Multi select: every committed value stays as a pill.`,items:{type:`string`},"x-clicky-lookup":{url:`/api/v1/profiles`,filter:`profile`,multi:!0}}}},k={render:()=>(0,s.jsx)(a,{title:`Multi-value lookup`,description:"An x-clicky-lookup with `multi: true` on an array field commits a list, so it renders as one tags combobox: the head set loads when the menu opens and typing searches the server (debounced). Add `hierarchy` to browse the same options as a tree instead — see Hierarchical lookups.",schema:O,initialValue:{imports:[`jms`]},lookupFetcher:T}),play:async({canvasElement:e})=>{let t=u(e);await c(t.getByText(`jms`)).toBeInTheDocument(),await l.click(t.getByRole(`combobox`));let n=u(document.body);await l.click(await n.findByRole(`option`,{name:`logs.api`})),await c(t.getByRole(`button`,{name:`Remove logs.api`})).toBeInTheDocument()}},A=[`StandardFieldsAndFormats`,`EnumPresentations`,`CompositionAndLocalReferences`,`CollectionPresentations`,`ClickyLayoutAndControlExtensions`,`DiscriminatorFlow`,`HierarchicalLookups`,`MultiValueLookup`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Enum presentations" description="The same standard enum data rendered as a combobox, radio group, icon grid, and descriptive segmented control using Clicky UI presentation hints." schema={enumPresentationsSchema} initialValue={{
    environment: "prod",
    cadence: "scheduled",
    database: "postgres",
    strategy: "safe"
  }} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Composition, unions, and local references" description="Local #/$defs references are rehydrated, unconditional allOf members contribute fields, and an enum inside anyOf provides suggestions while retaining a free-text branch." schema={compositionSchema} initialValue={{
    owner: {
      name: "Ada Lovelace",
      email: "ada@example.com"
    },
    destination: "production",
    retries: 2
  }} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Clicky layout and control extensions" description="A 12-column grid with explicit order and spans, input adornments, generated helper text, a bounded number slider, and a descriptive segmented enum." schema={clickyExtensionsSchema} initialValue={{
    endpoint: "api.example.com",
    timeout: 5000,
    budget: 16000,
    mode: "plan"
  }} />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <ReferenceExample title="Discriminator flow" description="x-discriminator creates a two-phase picker. Selecting a connection type collapses the picker and reveals the matching if/then branch." schema={discriminatorSchema} initialValue={{}} />
}`,...C.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}}})))()}j();export{S as ClickyLayoutAndControlExtensions,x as CollectionPresentations,b as CompositionAndLocalReferences,C as DiscriminatorFlow,y as EnumPresentations,D as HierarchicalLookups,k as MultiValueLookup,v as StandardFieldsAndFormats,A as __namedExportsOrder,_ as default};
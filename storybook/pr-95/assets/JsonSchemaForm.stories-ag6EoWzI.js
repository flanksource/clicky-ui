import{r as y,j as s,aH as Xt}from"./iframe-yuMqpJhb.js";import{B as Yt}from"./button-FFEDo1GN.js";import{M as te}from"./Modal-CvmmoTwj.js";import{J as Q}from"./JsonSchemaForm-yqpyZCYf.js";import{I as ea}from"./Icon-DbERJsbC.js";import{D as ta}from"./DropdownMenu-DvzMpi7l.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C6QaURdm.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./Properties-PiiQtLrA.js";import"./IconButton-CLZ4GHfp.js";import"./HoverCard-DVGyFeXQ.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BWMTt1c4.js";import"./FilterPill-D01PQpRY.js";import"./DateField-BobMnUJf.js";import"./DatePicker-ysKQlczQ.js";import"./DateTimePicker-D6erpvXq.js";import"./SegmentedControl-CItDZC2L.js";import"./TreePickerField-BO8YtthQ.js";import"./Tree-CNa4Jwo5.js";import"./TreeNode-BiehcMpK.js";import"./AccordionList-C9LiE_I7.js";import"./InputField-CM4m7oZ-.js";import"./use-hotkey-CCZSHshm.js";import"./ListMenu-DAwy1ra2.js";import"./Markdown-S81DzjC-.js";import"./Callout-rnh0q618.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BCbuh5Mz.js";import"./CodeDiff-CdsCzbWc.js";import"./HighlightedTokens-Mt22SU9Y.js";import"./JsonView-Cjjo78UN.js";import"./floating-ui.react-DiVVYB8B.js";import"./DropdownMenuSubmenu-CLNEOxi7.js";function aa(e){return typeof e=="string"?{value:e,label:e}:{value:e.value,label:e.label??e.value}}function na(e,t,a){var l;if(e.kind!=="string"&&e.kind!=="textarea"){e.onChange(a);return}const r=(l=t==null?void 0:t.closest("[data-jsf-control]"))==null?void 0:l.querySelector("input[data-jsf-input]"),o=typeof e.value=="string"?e.value:"";if(!r){e.onChange(a);return}const m=r.selectionStart??o.length,u=r.selectionEnd??o.length;e.onChange(o.slice(0,m)+a+o.slice(u));const p=m+a.length;requestAnimationFrame(()=>{r.focus(),r.setSelectionRange(p,p)})}function ee({field:e,tokens:t,menuLabel:a,header:r,footer:o}){const m=y.useRef(null),[u,p]=y.useState(Array.isArray(t)?t:null),[l,g]=y.useState(!1),f=X=>{if(!X||u!==null||typeof t!="function")return;const h=t();h instanceof Promise?(g(!0),h.then(Y=>{p(Y),g(!1)})):p(h)},Qt=l?[{label:"Loading…",onSelect:()=>{},disabled:!0}]:(u??[]).map(X=>{const{value:h,label:Y}=aa(X);return{label:Y,onSelect:()=>na(e,m.current,h)}});return s.jsx(ta,{align:"left",menuLabel:a,menuClassName:"font-mono text-xs",items:Qt,onOpenChange:f,header:r,footer:o,trigger:s.jsx("button",{ref:m,type:"button","aria-label":a,title:a,className:"flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",children:s.jsx(ea,{icon:Xt})})})}try{ee.displayName="TemplateVarMenu",ee.__docgenInfo={description:"",displayName:"TemplateVarMenu",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",methods:[],props:{field:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"field",required:!0,tags:{},type:{name:"FieldControl"}},tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"tokens",required:!0,tags:{},type:{name:"TemplateValuesLoader"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"menuLabel",required:!0,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}function $(e){const{tokens:t,keys:a,kinds:r=["string","enum"],when:o,menuLabel:m="Insert template value",header:u,footer:p}=e;return(l,g)=>{if(!r.includes(l.kind)||a&&!a.includes(l.key)||o&&!o(l,g))return l;const f={...l,prefix:s.jsx(ee,{field:l,tokens:t,menuLabel:m,header:u,footer:p})};return l.kind==="enum"||l.kind==="number"||l.kind==="date"?{...f,allowCustomValue:!0}:f}}try{$.displayName="templateValuePre",$.__docgenInfo={description:"",displayName:"templateValuePre",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",methods:[],props:{tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"tokens",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!0,tags:{},type:{name:"TemplateValuesLoader"}},keys:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"keys",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string[]"}},kinds:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"kinds",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"readonly FieldControlKind[]"}},when:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"when",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"(field: FieldControl, context: PreExtensionContext) => boolean"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"menuLabel",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"header",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"footer",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}const{expect:n,userEvent:i,waitFor:d,within:c}=__STORYBOOK_MODULE_TEST__,sa=["xs","sm","md","lg","xl"];function zt({schema:e,value:t,wrapperClassName:a="max-w-xl",...r}){const[o,m]=y.useState(t);return s.jsxs("div",{className:`${a} space-y-4`,children:[s.jsx(Q,{schema:e,value:o,onChange:m,...r}),s.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(o,null,2)})]})}const Ut={type:"object",required:["name"],properties:{name:{type:"string",title:"Full name",description:"First and last name."},age:{type:"integer",minimum:0,default:18},active:{type:"boolean",title:"Active"},role:{type:"string",title:"Role",enum:["admin","editor","viewer"]},tags:{type:"array",items:{type:"string"},description:"Press Enter or comma to add."}}},ra={type:"object","x-columns":2,properties:{backend:{type:"string",title:"Runtime",enum:["claude","codex"],"x-enum-labels":{claude:"Claude",codex:"Codex"},"x-enum-icons":{claude:"robot-ai",codex:"columns"},"x-enum-display":"segmented","x-col-span":2},model:{type:"string",title:"Model","x-input-prefix-icon":"sparkles"},temperature:{type:"number",title:"Temperature",minimum:0,maximum:2}},allOf:[{if:{properties:{backend:{const:"claude"}}},then:{properties:{permissionMode:{type:"string",title:"Permission mode",enum:["default","acceptEdits","plan","bypassPermissions"],"x-enum-labels":{default:"Default",acceptEdits:"Accept edits",plan:"Plan",bypassPermissions:"Bypass"},"x-enum-icons":{default:"shield",acceptEdits:"edit",plan:"list-dashes",bypassPermissions:"lock-open"},"x-enum-descriptions":{default:"Prompt for dangerous operations.",acceptEdits:"Auto-accept file edits.",plan:"Planning only — no tool execution.",bypassPermissions:"Skip permission checks."},"x-enum-display":"segmented","x-col-span":2}}}},{if:{properties:{backend:{const:"codex"}}},then:{properties:{sandbox:{type:"string",title:"Sandbox",enum:["read-only","workspace-write","danger-full-access"],"x-enum-labels":{"read-only":"Read only","workspace-write":"Workspace write","danger-full-access":"Full access"},"x-enum-icons":{"read-only":"eye","workspace-write":"folder","danger-full-access":"warning-triangle"},"x-enum-descriptions":{"read-only":"No writes; commands are sandboxed.","workspace-write":"Writes limited to the workspace.","danger-full-access":"Unrestricted host access."},"x-enum-display":"segmented","x-col-span":2},askForApproval:{type:"string",title:"Approval",enum:["untrusted","on-failure","on-request","never"],"x-enum-labels":{untrusted:"Untrusted","on-failure":"On failure","on-request":"On request",never:"Never"},"x-enum-display":"segmented","x-col-span":2}}}}]},yn={title:"JsonSchemaForm/Overview",component:Q,render:e=>s.jsx(zt,{...e}),args:{schema:Ut,value:{name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math","engine"]},readOnly:!1,inline:!1},argTypes:{schema:{control:"object",table:{category:"Schema"}},value:{control:"object",table:{category:"Value"}},readOnly:{control:"boolean",table:{category:"Behavior"}},hideReadOnlyFields:{control:"boolean",description:"Omit schema `readOnly: true` fields entirely instead of showing them as value displays.",table:{category:"Behavior",defaultValue:{summary:"false"}}},hideEmpty:{control:"boolean",description:'Omit fields whose value is empty (`undefined`/`null`/`""`/`[]`/`{}`, and containers whose contents are all empty) at every depth. `false` and `0` are answers and always render.',table:{category:"Behavior",defaultValue:{summary:"false"}}},inline:{control:"boolean",description:"Shorthand for `layout: { mode: 'inline' }` — a two-column label/field layout instead of stacked. Ignored when `layout` is set.",table:{category:"Appearance",defaultValue:{summary:"false"}}},layout:{control:"object",description:"Form-level layout, overrides `inline`. Inline mode caps the label column (`labelMaxWidth`, default `40ch`) and value column (`valueMaxWidth`, default `400px`).",table:{category:"Appearance"}},size:{control:"inline-radio",options:["xs","sm","md","lg","xl"],description:"Scales every input and label form-wide. Defaults to `md`.",table:{category:"Appearance",defaultValue:{summary:"md"}}},idPrefix:{control:"text",description:"Namespaces generated input ids so multiple forms on one page don't collide.",table:{category:"Behavior"}},showPreferencesMenu:{control:"boolean",description:"Show the top-right three-dot display-options menu (size + layout). Controls only this form's appearance, never global density or values.",table:{category:"Appearance",defaultValue:{summary:"true"}}},persistPreferences:{control:"boolean",description:"Persist menu selections to localStorage so they survive remounts.",table:{category:"Behavior",defaultValue:{summary:"true"}}},preferencesStorageKey:{control:"text",description:"localStorage key the display preferences are stored under. Pass a distinct key to isolate a form.",table:{category:"Behavior",defaultValue:{summary:"clicky-ui-json-schema-form-preferences"}}},title:{control:"text",table:{category:"Appearance"}},hiddenKeys:{control:"object",table:{category:"Behavior"}},onChange:{control:!1,table:{category:"Events"}},pre:{control:!1,table:{category:"Extensions"}},post:{control:!1,table:{category:"Extensions"}}},parameters:{docs:{description:{component:["`JsonSchemaForm` turns a JSON-Schema object into an editable form. You give it a","`schema`, the current `value`, and an `onChange` callback; it renders one control per","property and hands you back the next value object on every edit. There is no submit step","and no internal state — it is a controlled component you drive from your own store.","","It is **deliberately domain-agnostic**. The library knows nothing about your app: it infers","a sensible control from each property's schema, resolves `if`/`then` conditionals, and","recurses through arrays and nested objects. Everything beyond that — badges, helper text,","custom-value tolerance, insert buttons, dropping fields — is added by *you* through two","extension hooks (`pre` and `post`), so the same component serves any product.","","### The controlled contract","```tsx","const [value, setValue] = useState<Record<string, unknown>>(initial);","<JsonSchemaForm schema={schema} value={value} onChange={setValue} />;","```","`onChange` always receives a brand-new object (and new nested arrays/objects for deep","edits) — never a mutation of the one you passed in. Validation is **display-only**: a","`Required` / range / unknown-value hint renders under a field but never blocks `onChange`.","","### Control inference","First match wins, top to bottom:","","| Schema | Control |","| --- | --- |","| `enum` (any type) | Combobox (free-text allowed via `allowCustomValue`) |","| `boolean` | checkbox (falls back to text if the value isn't a boolean) |","| `integer` / `number` | numeric text (kept as a string unless it parses cleanly) |","| `array` of plain strings | compact tag input |","| `array` of anything else | per-item recursive list with add / remove / reorder |","| `object` with `additionalProperties` | key/value string-map (+ any known props) |","| `object` with `properties` | **nested sub-form** (recurses) |","| otherwise | text |","","### Recursion","Array items and object/map values are rendered by the *same* pipeline as top-level fields,","to any depth. An array of objects, an object containing an array of objects, a map whose","values are objects — all render structurally, and **your `pre`/`post` extensions apply at","every level**, not just the top.","","### Writing extensions","A **pre-extension** runs after a control is inferred and before it renders. It returns a","transformed `FieldControl` — or `null` to drop the field entirely:","```ts","type FieldControl = {","  key: string;","  kind: 'string'|'number'|'boolean'|'enum'|'array'|'object'|'string-map';","  label: string; required: boolean; value: unknown;","  onChange: (next: unknown) => void;   // mutate the field from an adornment","  options?: { value: string; label: string }[];","  allowCustomValue?: boolean; badge?: string; helper?: string;","  coerceNumber?: boolean; itemSchema?: JsonSchemaProperty;","  objectProperties?: Record<string, JsonSchemaProperty>;","};","","type PreExtension = (","  field: FieldControl,","  ctx: { key: string; prop: JsonSchemaProperty; value: unknown },",") => FieldControl | null;","","// Example: badge + custom-value tolerance for a 'secret' field.","const secretPre: PreExtension = (field) =>","  field.key === 'token'","    ? { ...field, badge: 'Secret', helper: 'Stored encrypted.', allowCustomValue: true }","    : field;","```","A **post-extension** runs at render time. It receives the rendered `label` and `value`","nodes and returns replacements — typically wrapping the value with an adornment that calls","`field.onChange` (carried on the field):","```tsx","type PostExtension = (","  field: FieldControl,","  nodes: { label: ReactNode; value: ReactNode },",") => { label: ReactNode; value: ReactNode };","","const insertTokenPost: PostExtension = (field, nodes) =>","  field.key !== 'token' ? nodes : {","    label: nodes.label,","    value: (",'      <div className="flex items-center gap-2">','        <div className="min-w-0 flex-1">{nodes.value}</div>',`        <button type="button" onClick={() => field.onChange('{{secrets.api_token}}')}>`,"          Insert token","        </button>","      </div>","    ),","  };","","<JsonSchemaForm schema={schema} value={value} onChange={setValue}","  pre={[secretPre]} post={[insertTokenPost]} />;","```","Both stacks are arrays applied in order, and both run at every depth — see the","**NestedExtensions** story for an insert button on a string buried inside an object and an","array item."].join(`
`)}}}},b={parameters:{docs:{description:{story:"A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what `onChange` emits."}}}},v={args:{schema:ra,value:{backend:"claude",model:"claude-sonnet-4-6",temperature:.2,permissionMode:"acceptEdits"},showPreferencesMenu:!1},parameters:{docs:{description:{story:"A consumer-authored 'runtime mode' panel driven entirely by JSON schema. It uses the presentation extensions — `x-enum-display: \"segmented\"` with `x-enum-icons` / `x-enum-descriptions` for the mode cards, `x-columns` + `x-col-span` for the Model/Temperature row, `x-input-prefix-icon` on Model, and an `if/then` const discriminator that swaps the permission fields when you toggle Runtime between Claude and Codex. No domain concepts live in the component."}}}},w={args:{value:{}},parameters:{docs:{description:{story:"The same schema with an empty value. The required `name` field shows its `Required` hint immediately; nothing is pre-filled because the form never invents values you didn't pass."}}}},x={args:{inline:!0,title:"Profile"},parameters:{docs:{description:{story:"`inline` switches each field to a compact two-column label/control layout, and `title` renders a heading above the form. Use this for dense property panels. The label column caps at `40ch` and the value column at `400px` by default."}}}},k={args:{title:"Profile",layout:{mode:"inline",labelMaxWidth:"8rem",valueMaxWidth:"240px"}},parameters:{docs:{description:{story:"Pass an explicit `layout` to override the inline width caps — here a narrower `8rem` label column and a `240px` value column. `layout` takes precedence over the `inline` shorthand."}}}};function oa({size:e}){const[t,a]=y.useState({name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math"]});return s.jsxs("div",{className:"min-w-64 space-y-2",children:[s.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),s.jsx(Q,{schema:Ut,value:t,onChange:a,size:e,idPrefix:e,showPreferencesMenu:!1})]})}const S={render:()=>s.jsx("div",{className:"flex flex-wrap gap-8",children:sa.map(e=>s.jsx(oa,{size:e},e))}),parameters:{docs:{description:{story:"The `size` prop scales every input and label form-wide across `xs`–`xl` (default `md`). Each column is an independent controlled form, so you can compare the full scale side by side — smaller sizes also tighten the vertical gaps between fields, larger sizes cap their spacing at `lg`. The display-options menu is disabled here so a persisted preference doesn't collapse the comparison."}}}},T={args:{title:"Profile",preferencesStorageKey:"storybook-json-schema-form-preferences"},parameters:{docs:{description:{story:"Every form shows a top-right three-dot menu (enabled by default). It carries a live **Filter fields** box (case-insensitive match on each field's label and key) that narrows the top-level fields as you type, plus options for **Size** (`xs`–`xl`), **Layout** (stacked / inline), and **Sort**. The trigger turns primary while a filter is active. Filtering is transient (never persisted); the other selections apply immediately and — with `persistPreferences` (default) — persist to localStorage under `preferencesStorageKey`, so they survive a remount and are shared across forms using the same key. The menu only changes this form's appearance; it never touches global page density or the field values. Pass `showPreferencesMenu={false}` to hide it, or `persistPreferences={false}` to keep changes in-memory only."}}},play:async({canvasElement:e,step:t})=>{const a=c(e),r=c(document.body);await t("Filter the fields down to Role via the menu",async()=>{await i.click(a.getByRole("button",{name:"Form display options"}));const o=await r.findByLabelText("Filter fields");await i.type(o,"role"),await d(()=>n(a.getByText("Role")).toBeInTheDocument()),n(a.queryByText("Full name")).not.toBeInTheDocument()}),await t("Clearing the filter restores every field",async()=>{await i.click(r.getByRole("button",{name:"Clear filter"})),await d(()=>n(a.getByText("Full name")).toBeInTheDocument())})}},ia={type:"object",properties:{action:{type:"string",title:"Member class action",enum:["00","01","02"],"x-icon":"sliders","x-enum-labels":{"00":"-- Please select --","01":"Add","02":"Update"},"x-enum-tones":{"01":"emerald","02":"sky"},"x-enum-display":"radio","x-on-change":[{when:{const:"00"},hide:["currentClass"],else:{require:["currentClass"]}},{when:{const:"01"},set:{classGroup:"Plan:SchemeName"}},{when:{enum:["01","02"]},patch:{classGroup:{title:"Target class group"}},else:{disable:["connection"]}}]},connection:{type:"string",title:"Connection","x-clicky-lookup":{url:"/api/v1/connection",filter:"name",scope:{param:"types",from:"provider.type"}}},classGroup:{type:"string",title:"Current class group",default:"Plan:SchemeName",description:"Options come from the screen's rule SQL.","x-query":{type:"SQL",sql:"Select ClassGroupGUID, ClassGroupName From AsClassGroup"}},currentClass:{type:"string",title:"Current class"},filler:{type:"string",title:"Filler","x-hidden":!0}}},j={args:{schema:ia,value:{action:"00"},preferencesStorageKey:"storybook-json-schema-form-debug"},parameters:{docs:{description:{story:"The three-dot menu's **Debug → Show hidden fields & sources** renders every field the form would hide — `x-hidden`, an `x-on-change` hide, `hideReadOnlyFields`, `hideEmpty`, write-only in a view, or a pre-extension dropping it — dimmed and outlined, with an eye-slash badge whose hover card says why (a listener hide names its listener: `x-on-change on \"action\"`). Every other field gets a bug badge whose card lists its instance path, resolved control and the schema keywords that source it, grouped as Behaviour, Presentation, Opt-in extensions, Consumer extensions (x-* keys the form does not read, e.g. a query) and Schema. Each clicky extension is spelled out in its own terms: listeners as `when → actions`, the `x-enum-*` maps as one option table, `x-clicky-lookup` as the request it makes, `x-item` as its row recipe, icon keys with their glyph. `hiddenKeys` stay hidden: they are the host's layout, not the field's state. Like the other menu choices, Debug persists under `preferencesStorageKey`."}}},play:async({canvasElement:e,step:t})=>{const a=c(e),r=c(document.body);await t("Hidden fields are absent until Debug is on",async()=>{n(a.queryByText("Filler")).not.toBeInTheDocument()}),await t("Turn on Debug: the hidden fields show with their reason",async()=>{await i.click(a.getByRole("button",{name:"Form display options"})),await i.click(await r.findByRole("menuitemcheckbox",{name:/Show hidden fields/})),await d(()=>n(a.getByText("Filler")).toBeInTheDocument()),n(e.querySelector('[data-debug-field="currentClass"]')).toHaveAttribute("data-debug-hidden",'hidden by x-on-change on "action"')})}},la={type:"object",properties:{summary:{type:"string",title:"Summary"},body:{type:"string",format:"md",title:"Body",description:"Markdown source stored as a plain string.","x-md-editor":{admonitions:!0,diffMode:{viewMode:"rich-text",viewModes:["rich-text","source"]},frontmatter:!0,tables:!0}}}},B={render:e=>s.jsx(zt,{...e,wrapperClassName:"max-w-4xl"}),args:{schema:la,value:{summary:"Quarterly notes",body:["# Quarterly notes","","- Revenue review","- Customer follow-up","","1. Draft","2. Review","3. Publish","",":::tip","Use `format: md` to get the MDXEditor field.",":::","","| Metric | Value |","| --- | ---: |","| Incidents | 3 |"].join(`
`)},layout:{mode:"stacked",valueMaxWidth:"56rem"},title:"Report"},parameters:{docs:{description:{story:"`format: md` renders the MDXEditor-backed markdown field. This example uses a wider `layout.valueMaxWidth` and enables a two-way Rich text / Source mode switch with typed `x-md-editor.diffMode` options."}}},play:async({canvasElement:e,step:t})=>{const a=c(e);await t("Render unordered and ordered list markers",async()=>{await d(()=>{n(e.querySelector(".clicky-mdx-editor-content > ul")).not.toBeNull(),n(e.querySelector(".clicky-mdx-editor-content > ol")).not.toBeNull()},{timeout:1e4});const r=e.querySelector(".clicky-mdx-editor-content > ul"),o=e.querySelector(".clicky-mdx-editor-content > ol");n(getComputedStyle(r).listStyleType).toBe("disc"),n(getComputedStyle(r).paddingInlineStart).not.toBe("0px"),n(getComputedStyle(o).listStyleType).toBe("decimal"),n(getComputedStyle(o).paddingInlineStart).not.toBe("0px")}),await t("Switch between rich text and markdown source",async()=>{const r=await a.findByRole("radio",{name:"Rich text"},{timeout:1e4}),o=a.getByRole("radio",{name:"Source mode"});n(r).toBeChecked(),await i.click(o),await d(()=>n(o).toBeChecked()),await i.click(r),await d(()=>n(r).toBeChecked())})}},O={args:{readOnly:!0},parameters:{docs:{description:{story:"`readOnly` disables every control at every depth — including add/remove/reorder on arrays and Add-field on maps — while still rendering the current values for inspection."}}}},Kt={type:"object",required:["FirstName"],properties:{ClientGUID:{type:"string",title:"Client GUID",readOnly:!0},SystemDate:{type:"string",format:"date-time",title:"System date",readOnly:!0},FirstName:{type:"string",title:"First name"},Role:{type:"string",title:"Role",enum:["admin","editor","viewer"]}}},C={args:{schema:Kt,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"}},parameters:{docs:{description:{story:"Fields whose schema declares `readOnly: true` render as static value displays (no input), while the rest stay editable. Dates are formatted human-readably; an empty read-only value shows an em-dash."}}}},E={args:{schema:Kt,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"},hideReadOnlyFields:!0},parameters:{docs:{description:{story:"`hideReadOnlyFields` drops every `readOnly: true` field at every depth, leaving only the editable surface."}}}},ca={type:"object",properties:{reference:{type:"string",title:"Reference"},approved:{type:"boolean",title:"Approved"},attempts:{type:"integer",title:"Attempts"},note:{type:"string",title:"Note"},labels:{type:"array",title:"Labels",items:{type:"string"}},contact:{type:"object",title:"Contact",properties:{email:{type:"string",title:"Email"},phone:{type:"string",title:"Phone"}}},billing:{type:"object",title:"Billing",properties:{vat:{type:"string",title:"VAT number"}}}}},N={args:{schema:ca,value:{reference:"INV-2481",approved:!1,attempts:0,note:"",labels:[],contact:{email:"ada@example.com",phone:""},billing:{vat:""}},readOnly:!0,hideEmpty:!0},parameters:{docs:{description:{story:"`hideEmpty` omits the fields the value says nothing about, at every depth. Here Note, Labels, Contact → Phone and the whole Billing section disappear, because a section whose every field is blank is itself empty. **Approved (`false`) and Attempts (`0`) stay** — they are answers, not blanks. Pair it with `readOnly` for an audit view of a submitted record: a schema wide enough to describe many records leaves most of it blank on any one of them, and the blanks say only that a field existed. Leave it off for an editable form, where a blank field is the question."}}}},P={args:{value:{name:"",age:-5,role:"superuser",tags:[]}},parameters:{docs:{description:{story:"Display-only hints: empty required field, a number below `minimum`, and an enum value outside the option set. None of them block editing."}}}},da={type:"object",properties:{labels:{type:"object",title:"Labels",additionalProperties:{type:"string"},properties:{env:{type:"string",enum:["dev","staging","prod"]}}}}},A={args:{schema:da,value:{labels:{env:"prod",team:"platform"}}},parameters:{docs:{description:{story:"An object with `additionalProperties` renders as editable key/value rows. Known properties (e.g. `env`) get their schema-derived control; extra keys are free-form. Use **Add field** to append a row."}}}},ma={type:"object",properties:{notify:{type:"string",title:"Notify via",enum:["none","email","webhook"]}},allOf:[{if:{properties:{notify:{const:"email"}},required:["notify"]},then:{required:["address"],properties:{address:{type:"string",title:"Email address"}}}},{if:{properties:{notify:{const:"webhook"}},required:["notify"]},then:{required:["url"],properties:{url:{type:"string",title:"Webhook URL"},headers:{type:"object",title:"Headers",additionalProperties:{type:"string"}}}}}]},R={args:{schema:ma,value:{notify:"email",address:"ops@example.com"},title:"Notification"},parameters:{docs:{description:{story:"`if`/`then` clauses reveal extra fields based on the current value. Switch **Notify via** between `email` and `webhook` to see the dependent fields change."}}}},pa=e=>e.key==="token"?{...e,badge:"Secret",helper:"Stored encrypted."}:e,ua=(e,t)=>e.key!=="token"?t:{label:t.label,value:s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("div",{className:"min-w-0 flex-1",children:t.value}),s.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{secrets.api_token}}"),children:"Insert token"})]})},I={args:{schema:{type:"object",properties:{endpoint:{type:"string",title:"Endpoint"},token:{type:"string",title:"API token"}}},value:{endpoint:"https://api.example.com",token:""},title:"Connection",pre:[pa],post:[ua]},parameters:{docs:{description:{story:"A `pre` extension stamps a `Secret` badge and helper text onto the `token` field; a `post` extension adds an **Insert token** button beside its value that mutates the field through `onChange`."}}}},Jt=["{{mock.email}}","{{mock.name}}","{{mock.id}}","{{mock.team}}","{{now}}"],Wt={type:"object",properties:{from:{type:"string",title:"From",enum:["noreply@example.com","alerts@example.com","support@example.com"]},subject:{type:"string",title:"Subject"}}},F={args:{schema:Wt,value:{from:"{{mock.email}}",subject:""},title:"Message",pre:[$({tokens:Jt})]},parameters:{docs:{description:{story:"A `pre` extension hangs a `{ }` **template-value** menu off each field through `FieldControl.prefix`. Clicking it opens a *separate* dropdown of `{{mock.*}}` tokens; picking one splices the token into a text input at the caret, or replaces the value of an enum/combobox field. **From** is an `enum` with `allowCustomValue`, so an inserted token coexists with the preset addresses."}}},play:async({canvasElement:e,step:t})=>{const a=c(e),r=c(document.body);await t("Insert a token into the subject at the caret",async()=>{const o=a.getAllByRole("button",{name:"Insert template value"});await i.click(o[1]),await i.click(await r.findByRole("menuitem",{name:"{{mock.name}}"})),await d(()=>n(e.textContent).toContain('"subject": "{{mock.name}}"'))})}},ya=()=>new Promise(e=>setTimeout(()=>e(["{{mock.email}}","{{mock.name}}","{{mock.id}}",{value:"{{mock.team}}",label:s.jsx("span",{className:"text-primary",children:"Team"})}]),150)),D={render:()=>{const[e,t]=y.useState(!0),[a,r]=y.useState(!1),[o,m]=y.useState({from:"{{mock.email}}",subject:""}),u=[$({tokens:ya,header:s.jsx("span",{className:"text-muted-foreground",children:"Template variables"}),footer:s.jsx("button",{type:"button",className:"text-primary hover:underline",onClick:()=>r(!0),children:"Show more…"})})];return s.jsxs("div",{className:"p-density-4",children:[s.jsx(Yt,{onClick:()=>t(!0),children:"Edit message"}),s.jsx(te,{open:e,onClose:()=>t(!1),title:"Edit message",children:s.jsxs("div",{className:"space-y-4",children:[s.jsx(Q,{schema:Wt,value:o,onChange:m,pre:u}),s.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(o,null,2)})]})}),s.jsx(te,{open:a,onClose:()=>r(!1),title:"All variables",size:"sm",children:s.jsx("ul",{className:"space-y-1 font-mono text-xs",children:Jt.map(p=>s.jsx("li",{children:p},p))})})]})},parameters:{docs:{description:{story:"The same template-value prefix on a form **inside a Modal**. Tokens load lazily via an async loader (a `Loading…` row shows until they resolve), one token uses a rich `ReactNode` label, and the menu carries a `header` plus a **Show more…** `footer` link (here opening a nested dialog). The `{ }` dropdown stacks above the dialog via `useFloatingZIndex`."}}},play:async({step:e})=>{const t=c(document.body);await e("Insert an async-loaded token from inside the dialog",async()=>{const a=t.getAllByRole("button",{name:"Insert template value"});await i.click(a[1]),await i.click(await t.findByRole("menuitem",{name:"{{mock.name}}"})),await d(()=>n(document.body.textContent).toContain('"subject": "{{mock.name}}"'))})}},L={args:{hiddenKeys:["age","tags"],title:"Trimmed"},parameters:{docs:{description:{story:"`hiddenKeys` omits properties from rendering without removing them from the value."}}}},Zt={type:"object",properties:{servers:{type:"array",title:"Servers",items:{type:"object",properties:{name:{type:"string",title:"Name"},port:{type:"integer",title:"Port",minimum:0},tls:{type:"boolean",title:"TLS"}},required:["name"]}}}},M={args:{schema:Zt,value:{servers:[{name:"api",port:8080,tls:!0},{name:"worker",port:0,tls:!1}]},title:"Cluster"},parameters:{docs:{description:{story:"When an array's items are objects, it opens by its visible column count with no schema hint required: up to `x-table-max-columns` (default 4) scalar columns as a grid, wider items as the inline item form, where each item collapses to one summary row and opens on click. The ⋮ menu on the summary line switches between Grid, Stack form and Inline form. The row identifies its item from conventional keys (`title`, `name`, `label`, `id`, `key`), falling back to *Item N*; `x-item` says it explicitly (see **ObjectArrayAccordion**). Plain string arrays still use the compact tag input — see **ScalarArrayTags**, and **ArrayOfObjectsStacked** for the full-sub-form opt-out."}}},play:async({canvasElement:e})=>{const t=c(e);await n(t.getByRole("table")).toBeInTheDocument(),await n(t.getByDisplayValue("api")).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"View options for Servers"})),await i.click(c(document.body).getByRole("menuitem",{name:"Inline form"})),await n(t.queryByLabelText(/^Port/)).toBeNull(),await i.click(t.getByRole("button",{name:/api/,expanded:!1})),await n(t.getByLabelText(/^Port/)).toHaveValue("8080")}},V={args:{schema:{type:"object",properties:{servers:{...Zt.properties.servers,"x-array-display":"stacked"}}},value:{servers:[{name:"api",port:8080,tls:!0},{name:"worker",port:0,tls:!1}]},title:"Cluster"},parameters:{docs:{description:{story:'`x-array-display: "stacked"` opts out of the accordion default: every item renders as its own open sub-form (labelled *Item N*) with add / remove / reorder controls. Worth it for a short list of two- or three-property items, where a collapsed row would hide as much as it saves.'}}}},$t={type:"object",properties:{routes:{type:"array",title:"Routes","x-array-display":"cards","x-item":{title:["path"],fallback:"New route",summary:[{property:"method"},{property:"upstream"}],glyph:"method",flag:"auth",noun:"route",nounPlural:"routes"},items:{type:"object",required:["path"],properties:{path:{type:"string",title:"Path"},method:{type:"string",title:"Method",enum:["GET","POST","DELETE"],"x-enum-tones":{GET:"teal",POST:"violet",DELETE:"rose"},"x-enum-display":"combobox"},upstream:{type:"string",title:"Upstream"},auth:{type:"boolean",title:"Requires auth"}}}}}},q={args:{schema:$t,value:{routes:[{path:"/api/v1/users",method:"GET",upstream:"users-svc:8080",auth:!0},{path:"/api/v1/events",method:"POST",upstream:"events-svc:8080",auth:!1}]},title:"Gateway"},parameters:{docs:{description:{story:'`x-array-display: "cards"` renders object items as a stack of titled cards, each headed by the item\'s own summary (from `x-item`) and edged with the tone its glyph property resolves to. Every item stays open — the everything-visible counterpart to the accordion in **ObjectArrayAccordion**, which reads the same `x-item` but collapses each item to one line.'}}},play:async({canvasElement:e})=>{const t=c(e);await n(t.getByText("/api/v1/users")).toBeInTheDocument(),await n(t.queryByText("Item 1")).not.toBeInTheDocument();const a=t.getAllByLabelText(/^Path/);await n(a).toHaveLength(2),await i.clear(a[1]),await i.type(a[1],"/api/v2/events"),await d(()=>n(t.getByText("/api/v2/events")).toBeInTheDocument()),await i.click(t.getByRole("button",{name:"Add route"})),await d(()=>n(t.getByText("New route")).toBeInTheDocument())}},ha={type:"object",properties:{routes:{...$t.properties.routes,"x-array-display":"accordion"}}},H={args:{schema:ha,value:{routes:[{path:"/api/v1/users",method:"GET",upstream:"users-svc:8080",auth:!0},{path:"/api/v1/events",method:"POST",upstream:"events-svc:8080",auth:!1}]},title:"Gateway"},parameters:{docs:{description:{story:"The accordion an object array uses by default, told how to summarize its items. `x-item` names the property that titles the row (`path`), the ones that trail it, the enum whose `x-enum-tones`/`x-enum-icons` colour the glyph, the boolean that flags it, and the noun the count, **Add route** row and empty state speak in. Without `x-item` the same rows fall back to conventional keys and *Item N* — see **ArrayOfObjects**."}}},play:async({canvasElement:e})=>{const t=c(e);await n(t.getByText("2 routes")).toBeInTheDocument(),await n(t.queryByLabelText(/^Upstream/)).toBeNull(),await i.click(t.getByRole("button",{name:/\/api\/v1\/events/,expanded:!1})),await n(t.getByLabelText(/^Upstream/)).toHaveValue("events-svc:8080")}},ga={type:"object",properties:{name:{type:"string",title:"Service name"},db:{type:"object",title:"Database",properties:{host:{type:"string",title:"Host"},port:{type:"integer",title:"Port"},creds:{type:"object",title:"Credentials",properties:{user:{type:"string",title:"User"},password:{type:"string",title:"Password"}},required:["user"]}},required:["host"]}}},G={args:{schema:ga,value:{name:"billing",db:{host:"db.internal",port:5432,creds:{user:"svc",password:""}}},title:"Service"},parameters:{docs:{description:{story:"Objects with `properties` recurse into nested sub-forms — here two levels deep (`db` → `creds`). Each level keeps its own labels and required markers, and edits rebuild the full object immutably."}}}},fa={type:"object",properties:{services:{type:"array",title:"Services",items:{type:"object",properties:{name:{type:"string",title:"Name"},env:{type:"object",title:"Env",additionalProperties:{type:"string"}},ports:{type:"array",title:"Ports",items:{type:"integer"}}},required:["name"]}}}},_={args:{schema:fa,value:{services:[{name:"web",env:{LOG_LEVEL:"info"},ports:[80,443]},{name:"cache",env:{},ports:[6379]}]},title:"Compose"},parameters:{docs:{description:{story:'Array → object → (map + number array). The renderer follows the schema all the way down: adding a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below. **Ports** is a tag list like any other scalar array, and its `integer` items commit as numbers — `8080`, not `"8080"`.'}}},play:async({canvasElement:e})=>{const t=c(e);await i.click(t.getByRole("button",{name:/web/,expanded:!1}));const a=t.getByRole("combobox");await i.type(a,"8080{Enter}"),await d(()=>n(t.getByRole("button",{name:"Remove 8080"})).toBeInTheDocument()),await n(document.body.textContent).not.toContain('"8080"')}},ba=(e,t)=>e.key!=="host"?t:{label:t.label,value:s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("div",{className:"min-w-0 flex-1",children:t.value}),s.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{discovered.host}}"),children:"Insert host"})]})},va=e=>e.key==="host"?{...e,badge:"Discovered"}:e,wa={type:"object",properties:{primary:{type:"object",title:"Primary",properties:{host:{type:"string",title:"Host"}}},replicas:{type:"array",title:"Replicas",items:{type:"object",properties:{host:{type:"string",title:"Host"}}}}}},z={args:{schema:wa,value:{primary:{host:""},replicas:[{host:""}]},title:"Topology",pre:[va],post:[ba]},parameters:{docs:{description:{story:"The `pre` badge and `post` **Insert host** button target every field whose key is `host` — and they appear on the nested `primary.host` AND on each array item's `host`, because extensions run at every depth. Clicking an insert button mutates exactly that nested field via its own `onChange`."}}}},U={args:{schema:{type:"object",properties:{tags:{type:"array",title:"Tags",items:{type:"string"}}}},value:{tags:["math","engine"]},title:"Labels"},parameters:{docs:{description:{story:"A list of scalars is the compact tag editor: type and press Enter or comma to add, paste a comma- or newline-separated list to add several at once, Backspace on an empty input to remove the last. Same control as **EnumArray** — it just has no options to offer, so typing is the only way in. Numeric items commit numbers (see **DeepRecursion**)."}}}},K={args:{schema:{type:"object",properties:{roles:{type:"array",title:"Roles",items:{type:"string",enum:["admin","editor","viewer"]}}}},value:{roles:["admin","viewer"]},title:"Access"},parameters:{docs:{description:{story:'An array whose items carry an `enum` is a list of *choices*, so it renders as **one** Combobox in the tags variant rather than a stack of them: every committed value is a removable pill and the whole option set is one dropdown away. Unlike **ScalarArrayTags** the values stay constrained — text matching no option is discarded. `x-array-display: "filter-pills"` swaps the field for always-visible toggles; `"stacked"` restores a Combobox per item.'}}},play:async({canvasElement:e})=>{const t=c(e);await n(t.getAllByRole("combobox")).toHaveLength(1),await n(t.queryByRole("button",{name:/add item/i})).toBeNull(),await n(t.getByRole("button",{name:"Remove viewer"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Toggle options"}));const a=c(document.body);await i.click(await a.findByRole("option",{name:"editor"})),await d(()=>n(t.getByRole("button",{name:"Remove editor"})).toBeInTheDocument())}},xa={type:"object",properties:{dwellings:{type:"object",title:"Dwellings",propertyNames:{enum:["House","Apartment"]},additionalProperties:!1,patternProperties:{"^House$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},lotSize:{type:"string",title:"Lot size"},floors:{type:"integer",title:"Floors",minimum:1},hasGarden:{type:"boolean",title:"Has garden"}}},"^Apartment$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},buildingName:{type:"string",title:"Building name"},unit:{type:"string",title:"Unit"},floor:{type:"integer",title:"Floor"}}}}}}},J={args:{schema:xa,value:{dwellings:{House:{line1:"1 Maple St",city:"Mbabane",lotSize:"600m²",floors:2,hasGarden:!0}}},title:"Dwellings"},parameters:{docs:{description:{story:'Two features combined. **(1) Strict key picker:** the map declares `propertyNames.enum`, so the key field is a dropdown limited to those options (no free-text keys) — click **Add field** and pick `House` or `Apartment`; already-used keys are filtered out. **(2) Per-key value form:** `patternProperties` maps each key to its own value schema (`^House$` → lot-size / floors / garden, `^Apartment$` → building / unit / floor), so the form rendered under each entry depends on which key you picked — the standard JSON-Schema way to vary a map value by its key, with no duplicate discriminator field. `x-layout: "stack"` keeps the key and its fields together as one full-width unit.'}}}},ka={type:"object",properties:{roles:{type:"array",title:"Roles","x-layout":"table",items:{type:"object",properties:{clientGuid:{type:"string",title:"Client"},primary:{type:"string",title:"Primary",enum:["Group Scheme","Owner","Insured"]},secondary:{type:"string",title:"Secondary",enum:["Scheme","Member"]}}}}}},W={args:{schema:ka,value:{roles:[{clientGuid:"{{scheme.guid}}",primary:"Group Scheme",secondary:"Scheme"},{clientGuid:"{{clients.Director.guid}}",primary:"Owner",secondary:"Member"}]},title:"Relationships"},parameters:{docs:{description:{story:'`x-layout: "table"` on an array of objects renders it as a table — a header row of the item\'s property names and one compact row per item, with a per-row remove and an **Add item** button. Denser still than the summary rows an object array shows by default (**ArrayOfObjects**), at the cost of a column per property.'}}}},Sa={type:"object",properties:{name:{type:"string",title:"Name"},address:{type:"object",title:"Address","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"}}}}},Z={args:{schema:Sa,value:{name:"Ada Lovelace",address:{line1:"1 Maple St",city:"Mbabane"}},title:"Profile",inline:!0},parameters:{docs:{description:{story:'A per-field `x-layout` overrides the form-level layout for that field\'s subtree. The form is `inline` (two-column), but the `address` object declares `x-layout: "stack"`, so its `line1`/`city` fields render stacked (label above value) while the top-level `name` stays inline. Precedence is: explicit `x-layout` > form-level `layout`/`inline`.'}}}};var ae,ne,se;b.parameters={...b.parameters,docs:{...(ae=b.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what \`onChange\` emits."
      }
    }
  }
}`,...(se=(ne=b.parameters)==null?void 0:ne.docs)==null?void 0:se.source}}};var re,oe,ie;v.parameters={...v.parameters,docs:{...(re=v.parameters)==null?void 0:re.docs,source:{originalSource:`{
  args: {
    schema: runtimeModeSchema,
    value: {
      backend: "claude",
      model: "claude-sonnet-4-6",
      temperature: 0.2,
      permissionMode: "acceptEdits"
    },
    showPreferencesMenu: false
  },
  parameters: {
    docs: {
      description: {
        story: "A consumer-authored 'runtime mode' panel driven entirely by JSON schema. It uses the presentation extensions — \`x-enum-display: \\"segmented\\"\` with \`x-enum-icons\` / \`x-enum-descriptions\` for the mode cards, \`x-columns\` + \`x-col-span\` for the Model/Temperature row, \`x-input-prefix-icon\` on Model, and an \`if/then\` const discriminator that swaps the permission fields when you toggle Runtime between Claude and Codex. No domain concepts live in the component."
      }
    }
  }
}`,...(ie=(oe=v.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};var le,ce,de;w.parameters={...w.parameters,docs:{...(le=w.parameters)==null?void 0:le.docs,source:{originalSource:`{
  args: {
    value: {}
  },
  parameters: {
    docs: {
      description: {
        story: "The same schema with an empty value. The required \`name\` field shows its \`Required\` hint immediately; nothing is pre-filled because the form never invents values you didn't pass."
      }
    }
  }
}`,...(de=(ce=w.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var me,pe,ue;x.parameters={...x.parameters,docs:{...(me=x.parameters)==null?void 0:me.docs,source:{originalSource:`{
  args: {
    inline: true,
    title: "Profile"
  },
  parameters: {
    docs: {
      description: {
        story: "\`inline\` switches each field to a compact two-column label/control layout, and \`title\` renders a heading above the form. Use this for dense property panels. The label column caps at \`40ch\` and the value column at \`400px\` by default."
      }
    }
  }
}`,...(ue=(pe=x.parameters)==null?void 0:pe.docs)==null?void 0:ue.source}}};var ye,he,ge;k.parameters={...k.parameters,docs:{...(ye=k.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  args: {
    title: "Profile",
    layout: {
      mode: "inline",
      labelMaxWidth: "8rem",
      valueMaxWidth: "240px"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Pass an explicit \`layout\` to override the inline width caps — here a narrower \`8rem\` label column and a \`240px\` value column. \`layout\` takes precedence over the \`inline\` shorthand."
      }
    }
  }
}`,...(ge=(he=k.parameters)==null?void 0:he.docs)==null?void 0:ge.source}}};var fe,be,ve;S.parameters={...S.parameters,docs:{...(fe=S.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-8">
      {ALL_SIZES.map(size => <SizeColumn key={size} size={size} />)}
    </div>,
  parameters: {
    docs: {
      description: {
        story: "The \`size\` prop scales every input and label form-wide across \`xs\`–\`xl\` (default \`md\`). Each column is an independent controlled form, so you can compare the full scale side by side — smaller sizes also tighten the vertical gaps between fields, larger sizes cap their spacing at \`lg\`. The display-options menu is disabled here so a persisted preference doesn't collapse the comparison."
      }
    }
  }
}`,...(ve=(be=S.parameters)==null?void 0:be.docs)==null?void 0:ve.source}}};var we,xe,ke;T.parameters={...T.parameters,docs:{...(we=T.parameters)==null?void 0:we.docs,source:{originalSource:`{
  args: {
    title: "Profile",
    preferencesStorageKey: "storybook-json-schema-form-preferences"
  },
  parameters: {
    docs: {
      description: {
        story: "Every form shows a top-right three-dot menu (enabled by default). It carries a live **Filter fields** box (case-insensitive match on each field's label and key) that narrows the top-level fields as you type, plus options for **Size** (\`xs\`–\`xl\`), **Layout** (stacked / inline), and **Sort**. The trigger turns primary while a filter is active. Filtering is transient (never persisted); the other selections apply immediately and — with \`persistPreferences\` (default) — persist to localStorage under \`preferencesStorageKey\`, so they survive a remount and are shared across forms using the same key. The menu only changes this form's appearance; it never touches global page density or the field values. Pass \`showPreferencesMenu={false}\` to hide it, or \`persistPreferences={false}\` to keep changes in-memory only."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("Filter the fields down to Role via the menu", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Form display options"
      }));
      const filter = await body.findByLabelText("Filter fields");
      await userEvent.type(filter, "role");
      await waitFor(() => expect(canvas.getByText("Role")).toBeInTheDocument());
      expect(canvas.queryByText("Full name")).not.toBeInTheDocument();
    });
    await step("Clearing the filter restores every field", async () => {
      await userEvent.click(body.getByRole("button", {
        name: "Clear filter"
      }));
      await waitFor(() => expect(canvas.getByText("Full name")).toBeInTheDocument());
    });
  }
}`,...(ke=(xe=T.parameters)==null?void 0:xe.docs)==null?void 0:ke.source}}};var Se,Te,je;j.parameters={...j.parameters,docs:{...(Se=j.parameters)==null?void 0:Se.docs,source:{originalSource:`{
  args: {
    schema: debugSchema,
    value: {
      action: "00"
    },
    preferencesStorageKey: "storybook-json-schema-form-debug"
  },
  parameters: {
    docs: {
      description: {
        story: "The three-dot menu's **Debug → Show hidden fields & sources** renders every field the form would hide — \`x-hidden\`, an \`x-on-change\` hide, \`hideReadOnlyFields\`, \`hideEmpty\`, write-only in a view, or a pre-extension dropping it — dimmed and outlined, with an eye-slash badge whose hover card says why (a listener hide names its listener: \`x-on-change on \\"action\\"\`). Every other field gets a bug badge whose card lists its instance path, resolved control and the schema keywords that source it, grouped as Behaviour, Presentation, Opt-in extensions, Consumer extensions (x-* keys the form does not read, e.g. a query) and Schema. Each clicky extension is spelled out in its own terms: listeners as \`when → actions\`, the \`x-enum-*\` maps as one option table, \`x-clicky-lookup\` as the request it makes, \`x-item\` as its row recipe, icon keys with their glyph. \`hiddenKeys\` stay hidden: they are the host's layout, not the field's state. Like the other menu choices, Debug persists under \`preferencesStorageKey\`."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("Hidden fields are absent until Debug is on", async () => {
      expect(canvas.queryByText("Filler")).not.toBeInTheDocument();
    });
    await step("Turn on Debug: the hidden fields show with their reason", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Form display options"
      }));
      await userEvent.click(await body.findByRole("menuitemcheckbox", {
        name: /Show hidden fields/
      }));
      await waitFor(() => expect(canvas.getByText("Filler")).toBeInTheDocument());
      expect(canvasElement.querySelector('[data-debug-field="currentClass"]')).toHaveAttribute("data-debug-hidden", 'hidden by x-on-change on "action"');
    });
  }
}`,...(je=(Te=j.parameters)==null?void 0:Te.docs)==null?void 0:je.source}}};var Be,Oe,Ce;B.parameters={...B.parameters,docs:{...(Be=B.parameters)==null?void 0:Be.docs,source:{originalSource:`{
  render: args => <FormHarness {...args} wrapperClassName="max-w-4xl" />,
  args: {
    schema: markdownSchema,
    value: {
      summary: "Quarterly notes",
      body: ["# Quarterly notes", "", "- Revenue review", "- Customer follow-up", "", "1. Draft", "2. Review", "3. Publish", "", ":::tip", "Use \`format: md\` to get the MDXEditor field.", ":::", "", "| Metric | Value |", "| --- | ---: |", "| Incidents | 3 |"].join("\\n")
    },
    layout: {
      mode: "stacked",
      valueMaxWidth: "56rem"
    },
    title: "Report"
  },
  parameters: {
    docs: {
      description: {
        story: "\`format: md\` renders the MDXEditor-backed markdown field. This example uses a wider \`layout.valueMaxWidth\` and enables a two-way Rich text / Source mode switch with typed \`x-md-editor.diffMode\` options."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Render unordered and ordered list markers", async () => {
      await waitFor(() => {
        expect(canvasElement.querySelector(".clicky-mdx-editor-content > ul")).not.toBeNull();
        expect(canvasElement.querySelector(".clicky-mdx-editor-content > ol")).not.toBeNull();
      }, {
        timeout: 10_000
      });
      const unorderedList = canvasElement.querySelector<HTMLUListElement>(".clicky-mdx-editor-content > ul");
      const orderedList = canvasElement.querySelector<HTMLOListElement>(".clicky-mdx-editor-content > ol");
      expect(getComputedStyle(unorderedList!).listStyleType).toBe("disc");
      expect(getComputedStyle(unorderedList!).paddingInlineStart).not.toBe("0px");
      expect(getComputedStyle(orderedList!).listStyleType).toBe("decimal");
      expect(getComputedStyle(orderedList!).paddingInlineStart).not.toBe("0px");
    });
    await step("Switch between rich text and markdown source", async () => {
      const richText = await canvas.findByRole("radio", {
        name: "Rich text"
      }, {
        timeout: 10_000
      });
      const source = canvas.getByRole("radio", {
        name: "Source mode"
      });
      expect(richText).toBeChecked();
      await userEvent.click(source);
      await waitFor(() => expect(source).toBeChecked());
      await userEvent.click(richText);
      await waitFor(() => expect(richText).toBeChecked());
    });
  }
}`,...(Ce=(Oe=B.parameters)==null?void 0:Oe.docs)==null?void 0:Ce.source}}};var Ee,Ne,Pe;O.parameters={...O.parameters,docs:{...(Ee=O.parameters)==null?void 0:Ee.docs,source:{originalSource:`{
  args: {
    readOnly: true
  },
  parameters: {
    docs: {
      description: {
        story: "\`readOnly\` disables every control at every depth — including add/remove/reorder on arrays and Add-field on maps — while still rendering the current values for inspection."
      }
    }
  }
}`,...(Pe=(Ne=O.parameters)==null?void 0:Ne.docs)==null?void 0:Pe.source}}};var Ae,Re,Ie;C.parameters={...C.parameters,docs:{...(Ae=C.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
  args: {
    schema: readOnlyFieldSchema,
    value: {
      ClientGUID: "8f3c-7a21-44de",
      SystemDate: "2026-04-15T12:00:00Z",
      FirstName: "Ada",
      Role: "editor"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Fields whose schema declares \`readOnly: true\` render as static value displays (no input), while the rest stay editable. Dates are formatted human-readably; an empty read-only value shows an em-dash."
      }
    }
  }
}`,...(Ie=(Re=C.parameters)==null?void 0:Re.docs)==null?void 0:Ie.source}}};var Fe,De,Le;E.parameters={...E.parameters,docs:{...(Fe=E.parameters)==null?void 0:Fe.docs,source:{originalSource:`{
  args: {
    schema: readOnlyFieldSchema,
    value: {
      ClientGUID: "8f3c-7a21-44de",
      SystemDate: "2026-04-15T12:00:00Z",
      FirstName: "Ada",
      Role: "editor"
    },
    hideReadOnlyFields: true
  },
  parameters: {
    docs: {
      description: {
        story: "\`hideReadOnlyFields\` drops every \`readOnly: true\` field at every depth, leaving only the editable surface."
      }
    }
  }
}`,...(Le=(De=E.parameters)==null?void 0:De.docs)==null?void 0:Le.source}}};var Me,Ve,qe;N.parameters={...N.parameters,docs:{...(Me=N.parameters)==null?void 0:Me.docs,source:{originalSource:`{
  args: {
    schema: auditSchema,
    value: {
      reference: "INV-2481",
      approved: false,
      attempts: 0,
      note: "",
      labels: [],
      contact: {
        email: "ada@example.com",
        phone: ""
      },
      billing: {
        vat: ""
      }
    },
    readOnly: true,
    hideEmpty: true
  },
  parameters: {
    docs: {
      description: {
        story: "\`hideEmpty\` omits the fields the value says nothing about, at every depth. Here Note, Labels, Contact → Phone and the whole Billing section disappear, because a section whose every field is blank is itself empty. **Approved (\`false\`) and Attempts (\`0\`) stay** — they are answers, not blanks. Pair it with \`readOnly\` for an audit view of a submitted record: a schema wide enough to describe many records leaves most of it blank on any one of them, and the blanks say only that a field existed. Leave it off for an editable form, where a blank field is the question."
      }
    }
  }
}`,...(qe=(Ve=N.parameters)==null?void 0:Ve.docs)==null?void 0:qe.source}}};var He,Ge,_e;P.parameters={...P.parameters,docs:{...(He=P.parameters)==null?void 0:He.docs,source:{originalSource:`{
  args: {
    value: {
      name: "",
      age: -5,
      role: "superuser",
      tags: []
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Display-only hints: empty required field, a number below \`minimum\`, and an enum value outside the option set. None of them block editing."
      }
    }
  }
}`,...(_e=(Ge=P.parameters)==null?void 0:Ge.docs)==null?void 0:_e.source}}};var ze,Ue,Ke;A.parameters={...A.parameters,docs:{...(ze=A.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  args: {
    schema: stringMapSchema,
    value: {
      labels: {
        env: "prod",
        team: "platform"
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: "An object with \`additionalProperties\` renders as editable key/value rows. Known properties (e.g. \`env\`) get their schema-derived control; extra keys are free-form. Use **Add field** to append a row."
      }
    }
  }
}`,...(Ke=(Ue=A.parameters)==null?void 0:Ue.docs)==null?void 0:Ke.source}}};var Je,We,Ze;R.parameters={...R.parameters,docs:{...(Je=R.parameters)==null?void 0:Je.docs,source:{originalSource:`{
  args: {
    schema: conditionalSchema,
    value: {
      notify: "email",
      address: "ops@example.com"
    },
    title: "Notification"
  },
  parameters: {
    docs: {
      description: {
        story: "\`if\`/\`then\` clauses reveal extra fields based on the current value. Switch **Notify via** between \`email\` and \`webhook\` to see the dependent fields change."
      }
    }
  }
}`,...(Ze=(We=R.parameters)==null?void 0:We.docs)==null?void 0:Ze.source}}};var $e,Qe,Xe;I.parameters={...I.parameters,docs:{...($e=I.parameters)==null?void 0:$e.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        endpoint: {
          type: "string",
          title: "Endpoint"
        },
        token: {
          type: "string",
          title: "API token"
        }
      }
    },
    value: {
      endpoint: "https://api.example.com",
      token: ""
    },
    title: "Connection",
    pre: [badgePre],
    post: [insertTokenPost]
  },
  parameters: {
    docs: {
      description: {
        story: "A \`pre\` extension stamps a \`Secret\` badge and helper text onto the \`token\` field; a \`post\` extension adds an **Insert token** button beside its value that mutates the field through \`onChange\`."
      }
    }
  }
}`,...(Xe=(Qe=I.parameters)==null?void 0:Qe.docs)==null?void 0:Xe.source}}};var Ye,et,tt;F.parameters={...F.parameters,docs:{...(Ye=F.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
  args: {
    schema: templateValueSchema,
    value: {
      from: "{{mock.email}}",
      subject: ""
    },
    title: "Message",
    pre: [templateValuePre({
      tokens: TEMPLATE_TOKENS
    })]
  },
  parameters: {
    docs: {
      description: {
        story: "A \`pre\` extension hangs a \`{ }\` **template-value** menu off each field through \`FieldControl.prefix\`. Clicking it opens a *separate* dropdown of \`{{mock.*}}\` tokens; picking one splices the token into a text input at the caret, or replaces the value of an enum/combobox field. **From** is an \`enum\` with \`allowCustomValue\`, so an inserted token coexists with the preset addresses."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("Insert a token into the subject at the caret", async () => {
      const triggers = canvas.getAllByRole("button", {
        name: "Insert template value"
      });
      await userEvent.click(triggers[1]!);
      await userEvent.click(await body.findByRole("menuitem", {
        name: "{{mock.name}}"
      }));
      await waitFor(() => expect(canvasElement.textContent).toContain('"subject": "{{mock.name}}"'));
    });
  }
}`,...(tt=(et=F.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var at,nt,st;D.parameters={...D.parameters,docs:{...(at=D.parameters)==null?void 0:at.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(true);
    const [moreOpen, setMoreOpen] = useState(false);
    const [value, setValue] = useState<Record<string, unknown>>({
      from: "{{mock.email}}",
      subject: ""
    });
    const pre = [templateValuePre({
      tokens: loadTemplateTokens,
      header: <span className="text-muted-foreground">Template variables</span>,
      footer: <button type="button" className="text-primary hover:underline" onClick={() => setMoreOpen(true)}>
            Show more…
          </button>
    })];
    return <div className="p-density-4">
        <Button onClick={() => setOpen(true)}>Edit message</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Edit message">
          <div className="space-y-4">
            <JsonSchemaForm schema={templateValueSchema} value={value} onChange={setValue} pre={pre} />
            <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </Modal>
        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="All variables" size="sm">
          <ul className="space-y-1 font-mono text-xs">
            {TEMPLATE_TOKENS.map(token => <li key={token}>{token}</li>)}
          </ul>
        </Modal>
      </div>;
  },
  parameters: {
    docs: {
      description: {
        story: "The same template-value prefix on a form **inside a Modal**. Tokens load lazily via an async loader (a \`Loading…\` row shows until they resolve), one token uses a rich \`ReactNode\` label, and the menu carries a \`header\` plus a **Show more…** \`footer\` link (here opening a nested dialog). The \`{ }\` dropdown stacks above the dialog via \`useFloatingZIndex\`."
      }
    }
  },
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("Insert an async-loaded token from inside the dialog", async () => {
      const triggers = body.getAllByRole("button", {
        name: "Insert template value"
      });
      await userEvent.click(triggers[1]!);
      await userEvent.click(await body.findByRole("menuitem", {
        name: "{{mock.name}}"
      }));
      await waitFor(() => expect(document.body.textContent).toContain('"subject": "{{mock.name}}"'));
    });
  }
}`,...(st=(nt=D.parameters)==null?void 0:nt.docs)==null?void 0:st.source}}};var rt,ot,it;L.parameters={...L.parameters,docs:{...(rt=L.parameters)==null?void 0:rt.docs,source:{originalSource:`{
  args: {
    hiddenKeys: ["age", "tags"],
    title: "Trimmed"
  },
  parameters: {
    docs: {
      description: {
        story: "\`hiddenKeys\` omits properties from rendering without removing them from the value."
      }
    }
  }
}`,...(it=(ot=L.parameters)==null?void 0:ot.docs)==null?void 0:it.source}}};var lt,ct,dt;M.parameters={...M.parameters,docs:{...(lt=M.parameters)==null?void 0:lt.docs,source:{originalSource:`{
  args: {
    schema: arrayOfObjectsSchema,
    value: {
      servers: [{
        name: "api",
        port: 8080,
        tls: true
      }, {
        name: "worker",
        port: 0,
        tls: false
      }]
    },
    title: "Cluster"
  },
  parameters: {
    docs: {
      description: {
        story: "When an array's items are objects, it opens by its visible column count with no schema hint required: up to \`x-table-max-columns\` (default 4) scalar columns as a grid, wider items as the inline item form, where each item collapses to one summary row and opens on click. The ⋮ menu on the summary line switches between Grid, Stack form and Inline form. The row identifies its item from conventional keys (\`title\`, \`name\`, \`label\`, \`id\`, \`key\`), falling back to *Item N*; \`x-item\` says it explicitly (see **ObjectArrayAccordion**). Plain string arrays still use the compact tag input — see **ScalarArrayTags**, and **ArrayOfObjectsStacked** for the full-sub-form opt-out."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Three scalar columns fit, so the servers open as a grid.
    await expect(canvas.getByRole("table")).toBeInTheDocument();
    await expect(canvas.getByDisplayValue("api")).toBeInTheDocument();
    // The view menu turns the grid into collapsed item rows.
    await userEvent.click(canvas.getByRole("button", {
      name: "View options for Servers"
    }));
    await userEvent.click(within(document.body).getByRole("menuitem", {
      name: "Inline form"
    }));
    await expect(canvas.queryByLabelText(/^Port/)).toBeNull();
    // \`expanded\` picks the disclosure out of the row's reorder/remove buttons,
    // which carry the same item title in their labels.
    await userEvent.click(canvas.getByRole("button", {
      name: /api/,
      expanded: false
    }));
    await expect(canvas.getByLabelText(/^Port/)).toHaveValue("8080");
  }
}`,...(dt=(ct=M.parameters)==null?void 0:ct.docs)==null?void 0:dt.source}}};var mt,pt,ut;V.parameters={...V.parameters,docs:{...(mt=V.parameters)==null?void 0:mt.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        servers: {
          ...arrayOfObjectsSchema.properties!.servers,
          "x-array-display": "stacked"
        }
      }
    } as JsonSchemaObject,
    value: {
      servers: [{
        name: "api",
        port: 8080,
        tls: true
      }, {
        name: "worker",
        port: 0,
        tls: false
      }]
    },
    title: "Cluster"
  },
  parameters: {
    docs: {
      description: {
        story: "\`x-array-display: \\"stacked\\"\` opts out of the accordion default: every item renders as its own open sub-form (labelled *Item N*) with add / remove / reorder controls. Worth it for a short list of two- or three-property items, where a collapsed row would hide as much as it saves."
      }
    }
  }
}`,...(ut=(pt=V.parameters)==null?void 0:pt.docs)==null?void 0:ut.source}}};var yt,ht,gt;q.parameters={...q.parameters,docs:{...(yt=q.parameters)==null?void 0:yt.docs,source:{originalSource:`{
  args: {
    schema: objectArrayCardsSchema,
    value: {
      routes: [{
        path: "/api/v1/users",
        method: "GET",
        upstream: "users-svc:8080",
        auth: true
      }, {
        path: "/api/v1/events",
        method: "POST",
        upstream: "events-svc:8080",
        auth: false
      }]
    },
    title: "Gateway"
  },
  parameters: {
    docs: {
      description: {
        story: "\`x-array-display: \\"cards\\"\` renders object items as a stack of titled cards, each headed by the item's own summary (from \`x-item\`) and edged with the tone its glyph property resolves to. Every item stays open — the everything-visible counterpart to the accordion in **ObjectArrayAccordion**, which reads the same \`x-item\` but collapses each item to one line."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The header identifies the item; "Item 1" never appears.
    await expect(canvas.getByText("/api/v1/users")).toBeInTheDocument();
    await expect(canvas.queryByText("Item 1")).not.toBeInTheDocument();

    // Every card is editable at once, and the header follows the edit.
    // \`path\` is required, so its label reads "Path*" — match the prefix.
    const paths = canvas.getAllByLabelText(/^Path/);
    await expect(paths).toHaveLength(2);
    await userEvent.clear(paths[1]!);
    await userEvent.type(paths[1]!, "/api/v2/events");
    await waitFor(() => expect(canvas.getByText("/api/v2/events")).toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", {
      name: "Add route"
    }));
    await waitFor(() => expect(canvas.getByText("New route")).toBeInTheDocument());
  }
}`,...(gt=(ht=q.parameters)==null?void 0:ht.docs)==null?void 0:gt.source}}};var ft,bt,vt;H.parameters={...H.parameters,docs:{...(ft=H.parameters)==null?void 0:ft.docs,source:{originalSource:`{
  args: {
    schema: objectArrayAccordionSchema,
    value: {
      routes: [{
        path: "/api/v1/users",
        method: "GET",
        upstream: "users-svc:8080",
        auth: true
      }, {
        path: "/api/v1/events",
        method: "POST",
        upstream: "events-svc:8080",
        auth: false
      }]
    },
    title: "Gateway"
  },
  parameters: {
    docs: {
      description: {
        story: "The accordion an object array uses by default, told how to summarize its items. \`x-item\` names the property that titles the row (\`path\`), the ones that trail it, the enum whose \`x-enum-tones\`/\`x-enum-icons\` colour the glyph, the boolean that flags it, and the noun the count, **Add route** row and empty state speak in. Without \`x-item\` the same rows fall back to conventional keys and *Item N* — see **ArrayOfObjects**."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 routes")).toBeInTheDocument();
    // One line per route: the item's own fields wait behind the disclosure.
    await expect(canvas.queryByLabelText(/^Upstream/)).toBeNull();
    await userEvent.click(canvas.getByRole("button", {
      name: /\\/api\\/v1\\/events/,
      expanded: false
    }));
    await expect(canvas.getByLabelText(/^Upstream/)).toHaveValue("events-svc:8080");
  }
}`,...(vt=(bt=H.parameters)==null?void 0:bt.docs)==null?void 0:vt.source}}};var wt,xt,kt;G.parameters={...G.parameters,docs:{...(wt=G.parameters)==null?void 0:wt.docs,source:{originalSource:`{
  args: {
    schema: nestedObjectSchema,
    value: {
      name: "billing",
      db: {
        host: "db.internal",
        port: 5432,
        creds: {
          user: "svc",
          password: ""
        }
      }
    },
    title: "Service"
  },
  parameters: {
    docs: {
      description: {
        story: "Objects with \`properties\` recurse into nested sub-forms — here two levels deep (\`db\` → \`creds\`). Each level keeps its own labels and required markers, and edits rebuild the full object immutably."
      }
    }
  }
}`,...(kt=(xt=G.parameters)==null?void 0:xt.docs)==null?void 0:kt.source}}};var St,Tt,jt;_.parameters={..._.parameters,docs:{...(St=_.parameters)==null?void 0:St.docs,source:{originalSource:`{
  args: {
    schema: deepSchema,
    value: {
      services: [{
        name: "web",
        env: {
          LOG_LEVEL: "info"
        },
        ports: [80, 443]
      }, {
        name: "cache",
        env: {},
        ports: [6379]
      }]
    },
    title: "Compose"
  },
  parameters: {
    docs: {
      description: {
        story: "Array → object → (map + number array). The renderer follows the schema all the way down: adding a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below. **Ports** is a tag list like any other scalar array, and its \`integer\` items commit as numbers — \`8080\`, not \`\\"8080\\"\`."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /web/,
      expanded: false
    }));

    // Ports is one field, and what it commits is typed by the item schema.
    const ports = canvas.getByRole("combobox");
    await userEvent.type(ports, "8080{Enter}");
    await waitFor(() => expect(canvas.getByRole("button", {
      name: "Remove 8080"
    })).toBeInTheDocument());
    // A quoted 8080 in the JSON below would mean the tag list committed text.
    await expect(document.body.textContent).not.toContain('"8080"');
  }
}`,...(jt=(Tt=_.parameters)==null?void 0:Tt.docs)==null?void 0:jt.source}}};var Bt,Ot,Ct;z.parameters={...z.parameters,docs:{...(Bt=z.parameters)==null?void 0:Bt.docs,source:{originalSource:`{
  args: {
    schema: nestedExtSchema,
    value: {
      primary: {
        host: ""
      },
      replicas: [{
        host: ""
      }]
    },
    title: "Topology",
    pre: [hostBadgePre],
    post: [insertHostPost]
  },
  parameters: {
    docs: {
      description: {
        story: "The \`pre\` badge and \`post\` **Insert host** button target every field whose key is \`host\` — and they appear on the nested \`primary.host\` AND on each array item's \`host\`, because extensions run at every depth. Clicking an insert button mutates exactly that nested field via its own \`onChange\`."
      }
    }
  }
}`,...(Ct=(Ot=z.parameters)==null?void 0:Ot.docs)==null?void 0:Ct.source}}};var Et,Nt,Pt;U.parameters={...U.parameters,docs:{...(Et=U.parameters)==null?void 0:Et.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        tags: {
          type: "array",
          title: "Tags",
          items: {
            type: "string"
          }
        }
      }
    },
    value: {
      tags: ["math", "engine"]
    },
    title: "Labels"
  },
  parameters: {
    docs: {
      description: {
        story: "A list of scalars is the compact tag editor: type and press Enter or comma to add, paste a comma- or newline-separated list to add several at once, Backspace on an empty input to remove the last. Same control as **EnumArray** — it just has no options to offer, so typing is the only way in. Numeric items commit numbers (see **DeepRecursion**)."
      }
    }
  }
}`,...(Pt=(Nt=U.parameters)==null?void 0:Nt.docs)==null?void 0:Pt.source}}};var At,Rt,It;K.parameters={...K.parameters,docs:{...(At=K.parameters)==null?void 0:At.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        roles: {
          type: "array",
          title: "Roles",
          items: {
            type: "string",
            enum: ["admin", "editor", "viewer"]
          }
        }
      }
    },
    value: {
      roles: ["admin", "viewer"]
    },
    title: "Access"
  },
  parameters: {
    docs: {
      description: {
        story: "An array whose items carry an \`enum\` is a list of *choices*, so it renders as **one** Combobox in the tags variant rather than a stack of them: every committed value is a removable pill and the whole option set is one dropdown away. Unlike **ScalarArrayTags** the values stay constrained — text matching no option is discarded. \`x-array-display: \\"filter-pills\\"\` swaps the field for always-visible toggles; \`\\"stacked\\"\` restores a Combobox per item."
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // One control for the whole array — no per-item rows, no Add item.
    await expect(canvas.getAllByRole("combobox")).toHaveLength(1);
    await expect(canvas.queryByRole("button", {
      name: /add item/i
    })).toBeNull();
    await expect(canvas.getByRole("button", {
      name: "Remove viewer"
    })).toBeInTheDocument();

    // The option list is portaled to the body, so it is queried from there.
    await userEvent.click(canvas.getByRole("button", {
      name: "Toggle options"
    }));
    const body = within(document.body);
    await userEvent.click(await body.findByRole("option", {
      name: "editor"
    }));
    await waitFor(() => expect(canvas.getByRole("button", {
      name: "Remove editor"
    })).toBeInTheDocument());
  }
}`,...(It=(Rt=K.parameters)==null?void 0:Rt.docs)==null?void 0:It.source}}};var Ft,Dt,Lt;J.parameters={...J.parameters,docs:{...(Ft=J.parameters)==null?void 0:Ft.docs,source:{originalSource:`{
  args: {
    schema: mapKeyPickerSchema,
    value: {
      dwellings: {
        House: {
          line1: "1 Maple St",
          city: "Mbabane",
          lotSize: "600m²",
          floors: 2,
          hasGarden: true
        }
      }
    },
    title: "Dwellings"
  },
  parameters: {
    docs: {
      description: {
        story: "Two features combined. **(1) Strict key picker:** the map declares \`propertyNames.enum\`, so the key field is a dropdown limited to those options (no free-text keys) — click **Add field** and pick \`House\` or \`Apartment\`; already-used keys are filtered out. **(2) Per-key value form:** \`patternProperties\` maps each key to its own value schema (\`^House$\` → lot-size / floors / garden, \`^Apartment$\` → building / unit / floor), so the form rendered under each entry depends on which key you picked — the standard JSON-Schema way to vary a map value by its key, with no duplicate discriminator field. \`x-layout: \\"stack\\"\` keeps the key and its fields together as one full-width unit."
      }
    }
  }
}`,...(Lt=(Dt=J.parameters)==null?void 0:Dt.docs)==null?void 0:Lt.source}}};var Mt,Vt,qt;W.parameters={...W.parameters,docs:{...(Mt=W.parameters)==null?void 0:Mt.docs,source:{originalSource:`{
  args: {
    schema: tableLayoutSchema,
    value: {
      roles: [{
        clientGuid: "{{scheme.guid}}",
        primary: "Group Scheme",
        secondary: "Scheme"
      }, {
        clientGuid: "{{clients.Director.guid}}",
        primary: "Owner",
        secondary: "Member"
      }]
    },
    title: "Relationships"
  },
  parameters: {
    docs: {
      description: {
        story: "\`x-layout: \\"table\\"\` on an array of objects renders it as a table — a header row of the item's property names and one compact row per item, with a per-row remove and an **Add item** button. Denser still than the summary rows an object array shows by default (**ArrayOfObjects**), at the cost of a column per property."
      }
    }
  }
}`,...(qt=(Vt=W.parameters)==null?void 0:Vt.docs)==null?void 0:qt.source}}};var Ht,Gt,_t;Z.parameters={...Z.parameters,docs:{...(Ht=Z.parameters)==null?void 0:Ht.docs,source:{originalSource:`{
  args: {
    schema: stackOverrideSchema,
    value: {
      name: "Ada Lovelace",
      address: {
        line1: "1 Maple St",
        city: "Mbabane"
      }
    },
    title: "Profile",
    inline: true
  },
  parameters: {
    docs: {
      description: {
        story: "A per-field \`x-layout\` overrides the form-level layout for that field's subtree. The form is \`inline\` (two-column), but the \`address\` object declares \`x-layout: \\"stack\\"\`, so its \`line1\`/\`city\` fields render stacked (label above value) while the top-level \`name\` stays inline. Precedence is: explicit \`x-layout\` > form-level \`layout\`/\`inline\`."
      }
    }
  }
}`,...(_t=(Gt=Z.parameters)==null?void 0:Gt.docs)==null?void 0:_t.source}}};const hn=["Default","PresentationExtensions","Empty","Inline","InlineCustomWidths","Sizes","PreferencesMenu","DebugMode","MarkdownField","ReadOnly","PerFieldReadOnly","HideReadOnlyFields","HideEmpty","Validation","StringMap","Conditional","Extensions","TemplateValuePrefix","TemplateValuePrefixInDialog","Hidden","ArrayOfObjects","ArrayOfObjectsStacked","ObjectArrayCards","ObjectArrayAccordion","NestedObject","DeepRecursion","NestedExtensions","ScalarArrayTags","EnumArray","MapKeyPicker","TableLayout","LayoutOverride"];export{M as ArrayOfObjects,V as ArrayOfObjectsStacked,R as Conditional,j as DebugMode,_ as DeepRecursion,b as Default,w as Empty,K as EnumArray,I as Extensions,L as Hidden,N as HideEmpty,E as HideReadOnlyFields,x as Inline,k as InlineCustomWidths,Z as LayoutOverride,J as MapKeyPicker,B as MarkdownField,z as NestedExtensions,G as NestedObject,H as ObjectArrayAccordion,q as ObjectArrayCards,C as PerFieldReadOnly,T as PreferencesMenu,v as PresentationExtensions,O as ReadOnly,U as ScalarArrayTags,S as Sizes,A as StringMap,W as TableLayout,F as TemplateValuePrefix,D as TemplateValuePrefixInDialog,P as Validation,hn as __namedExportsOrder,yn as default};

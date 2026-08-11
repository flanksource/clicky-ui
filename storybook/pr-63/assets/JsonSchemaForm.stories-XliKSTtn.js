import{r as p,j as n,aw as Mt}from"./iframe-CxzpxXnf.js";import{B as Ft}from"./button-Dv1c-HWl.js";import{M as $}from"./Modal-CMDPRFgu.js";import{J}from"./JsonSchemaForm-B6mn7kKc.js";import{I as It}from"./Icon-G_P9Ael4.js";import{D as Lt}from"./DropdownMenu-ClNljnW2.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BWXL-EJN.js";import"./index-znxQrsYw.js";import"./index-BE6eQQjG.js";import"./modalStack-C0ppkTLD.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-D-_YQGqt.js";import"./path-tree-DWa9VY15.js";import"./json-schema-form-size-DYVq0lph.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-YmscG384.js";import"./FilterPill-CAf8OcYI.js";import"./DateTimePicker-9YQZB76C.js";import"./SegmentedControl-OFhKl5o1.js";import"./TreePickerField-TwYpdep8.js";import"./Tree-CYZBTczY.js";import"./TreeNode-C1_k8td9.js";import"./floating-ui.react-DYQK7KlJ.js";import"./DropdownMenuSubmenu-p1eb8qgT.js";function Vt(e){return typeof e=="string"?{value:e,label:e}:{value:e.value,label:e.label??e.value}}function Dt(e,t,a){var h;const r=(h=t==null?void 0:t.closest("[data-jsf-control]"))==null?void 0:h.querySelector("input[data-jsf-input]"),s=typeof e.value=="string"?e.value:"";if(!r){e.onChange(a);return}const c=r.selectionStart??s.length,i=r.selectionEnd??s.length;e.onChange(s.slice(0,c)+a+s.slice(i));const d=c+a.length;requestAnimationFrame(()=>{r.focus(),r.setSelectionRange(d,d)})}function W({field:e,tokens:t,menuLabel:a,header:r,footer:s}){const c=p.useRef(null),[i,d]=p.useState(Array.isArray(t)?t:null),[h,Z]=p.useState(!1),Rt=U=>{if(!U||i!==null||typeof t!="function")return;const y=t();y instanceof Promise?(Z(!0),y.then(K=>{d(K),Z(!1)})):d(y)},Bt=h?[{label:"Loading…",onSelect:()=>{},disabled:!0}]:(i??[]).map(U=>{const{value:y,label:K}=Vt(U);return{label:K,onSelect:()=>Dt(e,c.current,y)}});return n.jsx(Lt,{align:"left",menuLabel:a,menuClassName:"font-mono text-xs",items:Bt,onOpenChange:Rt,header:r,footer:s,trigger:n.jsx("button",{ref:c,type:"button","aria-label":a,title:a,className:"flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",children:n.jsx(It,{icon:Mt})})})}try{W.displayName="TemplateVarMenu",W.__docgenInfo={description:"",displayName:"TemplateVarMenu",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",methods:[],props:{field:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"field",required:!0,tags:{},type:{name:"FieldControl"}},tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"tokens",required:!0,tags:{},type:{name:"TemplateValuesLoader"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"menuLabel",required:!0,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}function H(e){const{tokens:t,keys:a,menuLabel:r="Insert template value",header:s,footer:c}=e;return i=>{if(i.kind!=="string"&&i.kind!=="enum"||a&&!a.includes(i.key))return i;const d={...i,prefix:n.jsx(W,{field:i,tokens:t,menuLabel:r,header:s,footer:c})};return i.kind==="enum"?{...d,allowCustomValue:!0}:d}}try{H.displayName="templateValuePre",H.__docgenInfo={description:"",displayName:"templateValuePre",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",methods:[],props:{tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"tokens",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!0,tags:{},type:{name:"TemplateValuesLoader"}},keys:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"keys",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string[]"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"menuLabel",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"header",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"footer",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}const{expect:o,userEvent:l,waitFor:m,within:u}=__STORYBOOK_MODULE_TEST__,qt=["xs","sm","md","lg","xl"];function Nt({schema:e,value:t,wrapperClassName:a="max-w-xl",...r}){const[s,c]=p.useState(t);return n.jsxs("div",{className:`${a} space-y-4`,children:[n.jsx(J,{schema:e,value:s,onChange:c,...r}),n.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(s,null,2)})]})}const Pt={type:"object",required:["name"],properties:{name:{type:"string",title:"Full name",description:"First and last name."},age:{type:"integer",minimum:0,default:18},active:{type:"boolean",title:"Active"},role:{type:"string",title:"Role",enum:["admin","editor","viewer"]},tags:{type:"array",items:{type:"string"},description:"Press Enter or comma to add."}}},_t={type:"object","x-columns":2,properties:{backend:{type:"string",title:"Runtime",enum:["claude","codex"],"x-enum-labels":{claude:"Claude",codex:"Codex"},"x-enum-icons":{claude:"robot-ai",codex:"columns"},"x-enum-display":"segmented","x-col-span":2},model:{type:"string",title:"Model","x-input-prefix-icon":"sparkles"},temperature:{type:"number",title:"Temperature",minimum:0,maximum:2}},allOf:[{if:{properties:{backend:{const:"claude"}}},then:{properties:{permissionMode:{type:"string",title:"Permission mode",enum:["default","acceptEdits","plan","bypassPermissions"],"x-enum-labels":{default:"Default",acceptEdits:"Accept edits",plan:"Plan",bypassPermissions:"Bypass"},"x-enum-icons":{default:"shield",acceptEdits:"edit",plan:"list-dashes",bypassPermissions:"lock-open"},"x-enum-descriptions":{default:"Prompt for dangerous operations.",acceptEdits:"Auto-accept file edits.",plan:"Planning only — no tool execution.",bypassPermissions:"Skip permission checks."},"x-enum-display":"segmented","x-col-span":2}}}},{if:{properties:{backend:{const:"codex"}}},then:{properties:{sandbox:{type:"string",title:"Sandbox",enum:["read-only","workspace-write","danger-full-access"],"x-enum-labels":{"read-only":"Read only","workspace-write":"Workspace write","danger-full-access":"Full access"},"x-enum-icons":{"read-only":"eye","workspace-write":"folder","danger-full-access":"warning-triangle"},"x-enum-descriptions":{"read-only":"No writes; commands are sandboxed.","workspace-write":"Writes limited to the workspace.","danger-full-access":"Unrestricted host access."},"x-enum-display":"segmented","x-col-span":2},askForApproval:{type:"string",title:"Approval",enum:["untrusted","on-failure","on-request","never"],"x-enum-labels":{untrusted:"Untrusted","on-failure":"On failure","on-request":"On request",never:"Never"},"x-enum-display":"segmented","x-col-span":2}}}}]},Ba={title:"Components/JsonSchemaForm",component:J,render:e=>n.jsx(Nt,{...e}),args:{schema:Pt,value:{name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math","engine"]},readOnly:!1,inline:!1},argTypes:{schema:{control:"object",table:{category:"Schema"}},value:{control:"object",table:{category:"Value"}},readOnly:{control:"boolean",table:{category:"Behavior"}},hideReadOnlyFields:{control:"boolean",description:"Omit schema `readOnly: true` fields entirely instead of showing them as value displays.",table:{category:"Behavior",defaultValue:{summary:"false"}}},inline:{control:"boolean",description:"Shorthand for `layout: { mode: 'inline' }` — a two-column label/field layout instead of stacked. Ignored when `layout` is set.",table:{category:"Appearance",defaultValue:{summary:"false"}}},layout:{control:"object",description:"Form-level layout, overrides `inline`. Inline mode caps the label column (`labelMaxWidth`, default `40ch`) and value column (`valueMaxWidth`, default `400px`).",table:{category:"Appearance"}},size:{control:"inline-radio",options:["xs","sm","md","lg","xl"],description:"Scales every input and label form-wide. Defaults to `md`.",table:{category:"Appearance",defaultValue:{summary:"md"}}},idPrefix:{control:"text",description:"Namespaces generated input ids so multiple forms on one page don't collide.",table:{category:"Behavior"}},showPreferencesMenu:{control:"boolean",description:"Show the top-right three-dot display-options menu (size + layout). Controls only this form's appearance, never global density or values.",table:{category:"Appearance",defaultValue:{summary:"true"}}},persistPreferences:{control:"boolean",description:"Persist menu selections to localStorage so they survive remounts.",table:{category:"Behavior",defaultValue:{summary:"true"}}},preferencesStorageKey:{control:"text",description:"localStorage key the display preferences are stored under. Pass a distinct key to isolate a form.",table:{category:"Behavior",defaultValue:{summary:"clicky-ui-json-schema-form-preferences"}}},title:{control:"text",table:{category:"Appearance"}},hiddenKeys:{control:"object",table:{category:"Behavior"}},onChange:{control:!1,table:{category:"Events"}},pre:{control:!1,table:{category:"Extensions"}},post:{control:!1,table:{category:"Extensions"}}},parameters:{docs:{description:{component:["`JsonSchemaForm` turns a JSON-Schema object into an editable form. You give it a","`schema`, the current `value`, and an `onChange` callback; it renders one control per","property and hands you back the next value object on every edit. There is no submit step","and no internal state — it is a controlled component you drive from your own store.","","It is **deliberately domain-agnostic**. The library knows nothing about your app: it infers","a sensible control from each property's schema, resolves `if`/`then` conditionals, and","recurses through arrays and nested objects. Everything beyond that — badges, helper text,","custom-value tolerance, insert buttons, dropping fields — is added by *you* through two","extension hooks (`pre` and `post`), so the same component serves any product.","","### The controlled contract","```tsx","const [value, setValue] = useState<Record<string, unknown>>(initial);","<JsonSchemaForm schema={schema} value={value} onChange={setValue} />;","```","`onChange` always receives a brand-new object (and new nested arrays/objects for deep","edits) — never a mutation of the one you passed in. Validation is **display-only**: a","`Required` / range / unknown-value hint renders under a field but never blocks `onChange`.","","### Control inference","First match wins, top to bottom:","","| Schema | Control |","| --- | --- |","| `enum` (any type) | Combobox (free-text allowed via `allowCustomValue`) |","| `boolean` | checkbox (falls back to text if the value isn't a boolean) |","| `integer` / `number` | numeric text (kept as a string unless it parses cleanly) |","| `array` of plain strings | compact tag input |","| `array` of anything else | per-item recursive list with add / remove / reorder |","| `object` with `additionalProperties` | key/value string-map (+ any known props) |","| `object` with `properties` | **nested sub-form** (recurses) |","| otherwise | text |","","### Recursion","Array items and object/map values are rendered by the *same* pipeline as top-level fields,","to any depth. An array of objects, an object containing an array of objects, a map whose","values are objects — all render structurally, and **your `pre`/`post` extensions apply at","every level**, not just the top.","","### Writing extensions","A **pre-extension** runs after a control is inferred and before it renders. It returns a","transformed `FieldControl` — or `null` to drop the field entirely:","```ts","type FieldControl = {","  key: string;","  kind: 'string'|'number'|'boolean'|'enum'|'array'|'object'|'string-map';","  label: string; required: boolean; value: unknown;","  onChange: (next: unknown) => void;   // mutate the field from an adornment","  options?: { value: string; label: string }[];","  allowCustomValue?: boolean; badge?: string; helper?: string;","  coerceNumber?: boolean; itemSchema?: JsonSchemaProperty;","  objectProperties?: Record<string, JsonSchemaProperty>;","};","","type PreExtension = (","  field: FieldControl,","  ctx: { key: string; prop: JsonSchemaProperty; value: unknown },",") => FieldControl | null;","","// Example: badge + custom-value tolerance for a 'secret' field.","const secretPre: PreExtension = (field) =>","  field.key === 'token'","    ? { ...field, badge: 'Secret', helper: 'Stored encrypted.', allowCustomValue: true }","    : field;","```","A **post-extension** runs at render time. It receives the rendered `label` and `value`","nodes and returns replacements — typically wrapping the value with an adornment that calls","`field.onChange` (carried on the field):","```tsx","type PostExtension = (","  field: FieldControl,","  nodes: { label: ReactNode; value: ReactNode },",") => { label: ReactNode; value: ReactNode };","","const insertTokenPost: PostExtension = (field, nodes) =>","  field.key !== 'token' ? nodes : {","    label: nodes.label,","    value: (",'      <div className="flex items-center gap-2">','        <div className="min-w-0 flex-1">{nodes.value}</div>',`        <button type="button" onClick={() => field.onChange('{{secrets.api_token}}')}>`,"          Insert token","        </button>","      </div>","    ),","  };","","<JsonSchemaForm schema={schema} value={value} onChange={setValue}","  pre={[secretPre]} post={[insertTokenPost]} />;","```","Both stacks are arrays applied in order, and both run at every depth — see the","**NestedExtensions** story for an insert button on a string buried inside an object and an","array item."].join(`
`)}}}},g={parameters:{docs:{description:{story:"A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what `onChange` emits."}}}},f={args:{schema:_t,value:{backend:"claude",model:"claude-sonnet-4-6",temperature:.2,permissionMode:"acceptEdits"},showPreferencesMenu:!1},parameters:{docs:{description:{story:"A consumer-authored 'runtime mode' panel driven entirely by JSON schema. It uses the presentation extensions — `x-enum-display: \"segmented\"` with `x-enum-icons` / `x-enum-descriptions` for the mode cards, `x-columns` + `x-col-span` for the Model/Temperature row, `x-input-prefix-icon` on Model, and an `if/then` const discriminator that swaps the permission fields when you toggle Runtime between Claude and Codex. No domain concepts live in the component."}}}},b={args:{value:{}},parameters:{docs:{description:{story:"The same schema with an empty value. The required `name` field shows its `Required` hint immediately; nothing is pre-filled because the form never invents values you didn't pass."}}}},v={args:{inline:!0,title:"Profile"},parameters:{docs:{description:{story:"`inline` switches each field to a compact two-column label/control layout, and `title` renders a heading above the form. Use this for dense property panels. The label column caps at `40ch` and the value column at `400px` by default."}}}},x={args:{title:"Profile",layout:{mode:"inline",labelMaxWidth:"8rem",valueMaxWidth:"240px"}},parameters:{docs:{description:{story:"Pass an explicit `layout` to override the inline width caps — here a narrower `8rem` label column and a `240px` value column. `layout` takes precedence over the `inline` shorthand."}}}};function zt({size:e}){const[t,a]=p.useState({name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math"]});return n.jsxs("div",{className:"min-w-64 space-y-2",children:[n.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),n.jsx(J,{schema:Pt,value:t,onChange:a,size:e,idPrefix:e,showPreferencesMenu:!1})]})}const w={render:()=>n.jsx("div",{className:"flex flex-wrap gap-8",children:qt.map(e=>n.jsx(zt,{size:e},e))}),parameters:{docs:{description:{story:"The `size` prop scales every input and label form-wide across `xs`–`xl` (default `md`). Each column is an independent controlled form, so you can compare the full scale side by side — smaller sizes also tighten the vertical gaps between fields, larger sizes cap their spacing at `lg`. The display-options menu is disabled here so a persisted preference doesn't collapse the comparison."}}}},k={args:{title:"Profile",preferencesStorageKey:"storybook-json-schema-form-preferences"},parameters:{docs:{description:{story:"Every form shows a top-right three-dot menu (enabled by default). It carries a live **Filter fields** box (case-insensitive match on each field's label and key) that narrows the top-level fields as you type, plus options for **Size** (`xs`–`xl`), **Layout** (stacked / inline), and **Sort**. The trigger turns primary while a filter is active. Filtering is transient (never persisted); the other selections apply immediately and — with `persistPreferences` (default) — persist to localStorage under `preferencesStorageKey`, so they survive a remount and are shared across forms using the same key. The menu only changes this form's appearance; it never touches global page density or the field values. Pass `showPreferencesMenu={false}` to hide it, or `persistPreferences={false}` to keep changes in-memory only."}}},play:async({canvasElement:e,step:t})=>{const a=u(e),r=u(document.body);await t("Filter the fields down to Role via the menu",async()=>{await l.click(a.getByRole("button",{name:"Form display options"}));const s=await r.findByLabelText("Filter fields");await l.type(s,"role"),await m(()=>o(a.getByText("Role")).toBeInTheDocument()),o(a.queryByText("Full name")).not.toBeInTheDocument()}),await t("Clearing the filter restores every field",async()=>{await l.click(r.getByRole("button",{name:"Clear filter"})),await m(()=>o(a.getByText("Full name")).toBeInTheDocument())})}},Gt={type:"object",properties:{summary:{type:"string",title:"Summary"},body:{type:"string",format:"md",title:"Body",description:"Markdown source stored as a plain string.","x-md-editor":{admonitions:!0,diffMode:{viewMode:"rich-text",viewModes:["rich-text","source"]},frontmatter:!0,tables:!0}}}},S={render:e=>n.jsx(Nt,{...e,wrapperClassName:"max-w-4xl"}),args:{schema:Gt,value:{summary:"Quarterly notes",body:["# Quarterly notes","","- Revenue review","- Customer follow-up","","1. Draft","2. Review","3. Publish","",":::tip","Use `format: md` to get the MDXEditor field.",":::","","| Metric | Value |","| --- | ---: |","| Incidents | 3 |"].join(`
`)},layout:{mode:"stacked",valueMaxWidth:"56rem"},title:"Report"},parameters:{docs:{description:{story:"`format: md` renders the MDXEditor-backed markdown field. This example uses a wider `layout.valueMaxWidth` and enables a two-way Rich text / Source mode switch with typed `x-md-editor.diffMode` options."}}},play:async({canvasElement:e,step:t})=>{const a=u(e);await t("Render unordered and ordered list markers",async()=>{await m(()=>{o(e.querySelector(".clicky-mdx-editor-content > ul")).not.toBeNull(),o(e.querySelector(".clicky-mdx-editor-content > ol")).not.toBeNull()},{timeout:1e4});const r=e.querySelector(".clicky-mdx-editor-content > ul"),s=e.querySelector(".clicky-mdx-editor-content > ol");o(getComputedStyle(r).listStyleType).toBe("disc"),o(getComputedStyle(r).paddingInlineStart).not.toBe("0px"),o(getComputedStyle(s).listStyleType).toBe("decimal"),o(getComputedStyle(s).paddingInlineStart).not.toBe("0px")}),await t("Switch between rich text and markdown source",async()=>{const r=await a.findByRole("radio",{name:"Rich text"},{timeout:1e4}),s=a.getByRole("radio",{name:"Source mode"});o(r).toBeChecked(),await l.click(s),await m(()=>o(s).toBeChecked()),await l.click(r),await m(()=>o(r).toBeChecked())})}},j={args:{readOnly:!0},parameters:{docs:{description:{story:"`readOnly` disables every control at every depth — including add/remove/reorder on arrays and Add-field on maps — while still rendering the current values for inspection."}}}},Ot={type:"object",required:["FirstName"],properties:{ClientGUID:{type:"string",title:"Client GUID",readOnly:!0},SystemDate:{type:"string",format:"date-time",title:"System date",readOnly:!0},FirstName:{type:"string",title:"First name"},Role:{type:"string",title:"Role",enum:["admin","editor","viewer"]}}},T={args:{schema:Ot,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"}},parameters:{docs:{description:{story:"Fields whose schema declares `readOnly: true` render as static value displays (no input), while the rest stay editable. Dates are formatted human-readably; an empty read-only value shows an em-dash."}}}},C={args:{schema:Ot,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"},hideReadOnlyFields:!0},parameters:{docs:{description:{story:"`hideReadOnlyFields` drops every `readOnly: true` field at every depth, leaving only the editable surface."}}}},N={args:{value:{name:"",age:-5,role:"superuser",tags:[]}},parameters:{docs:{description:{story:"Display-only hints: empty required field, a number below `minimum`, and an enum value outside the option set. None of them block editing."}}}},Ht={type:"object",properties:{labels:{type:"object",title:"Labels",additionalProperties:{type:"string"},properties:{env:{type:"string",enum:["dev","staging","prod"]}}}}},P={args:{schema:Ht,value:{labels:{env:"prod",team:"platform"}}},parameters:{docs:{description:{story:"An object with `additionalProperties` renders as editable key/value rows. Known properties (e.g. `env`) get their schema-derived control; extra keys are free-form. Use **Add field** to append a row."}}}},Jt={type:"object",properties:{notify:{type:"string",title:"Notify via",enum:["none","email","webhook"]}},allOf:[{if:{properties:{notify:{const:"email"}},required:["notify"]},then:{required:["address"],properties:{address:{type:"string",title:"Email address"}}}},{if:{properties:{notify:{const:"webhook"}},required:["notify"]},then:{required:["url"],properties:{url:{type:"string",title:"Webhook URL"},headers:{type:"object",title:"Headers",additionalProperties:{type:"string"}}}}}]},O={args:{schema:Jt,value:{notify:"email",address:"ops@example.com"},title:"Notification"},parameters:{docs:{description:{story:"`if`/`then` clauses reveal extra fields based on the current value. Switch **Notify via** between `email` and `webhook` to see the dependent fields change."}}}},Ut=e=>e.key==="token"?{...e,badge:"Secret",helper:"Stored encrypted."}:e,Kt=(e,t)=>e.key!=="token"?t:{label:t.label,value:n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("div",{className:"min-w-0 flex-1",children:t.value}),n.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{secrets.api_token}}"),children:"Insert token"})]})},E={args:{schema:{type:"object",properties:{endpoint:{type:"string",title:"Endpoint"},token:{type:"string",title:"API token"}}},value:{endpoint:"https://api.example.com",token:""},title:"Connection",pre:[Ut],post:[Kt]},parameters:{docs:{description:{story:"A `pre` extension stamps a `Secret` badge and helper text onto the `token` field; a `post` extension adds an **Insert token** button beside its value that mutates the field through `onChange`."}}}},Et=["{{mock.email}}","{{mock.name}}","{{mock.id}}","{{mock.team}}","{{now}}"],At={type:"object",properties:{from:{type:"string",title:"From",enum:["noreply@example.com","alerts@example.com","support@example.com"]},subject:{type:"string",title:"Subject"}}},A={args:{schema:At,value:{from:"{{mock.email}}",subject:""},title:"Message",pre:[H({tokens:Et})]},parameters:{docs:{description:{story:"A `pre` extension hangs a `{ }` **template-value** menu off each field through `FieldControl.prefix`. Clicking it opens a *separate* dropdown of `{{mock.*}}` tokens; picking one splices the token into a text input at the caret, or replaces the value of an enum/combobox field. **From** is an `enum` with `allowCustomValue`, so an inserted token coexists with the preset addresses."}}},play:async({canvasElement:e,step:t})=>{const a=u(e),r=u(document.body);await t("Insert a token into the subject at the caret",async()=>{const s=a.getAllByRole("button",{name:"Insert template value"});await l.click(s[1]),await l.click(await r.findByRole("menuitem",{name:"{{mock.name}}"})),await m(()=>o(e.textContent).toContain('"subject": "{{mock.name}}"'))})}},Wt=()=>new Promise(e=>setTimeout(()=>e(["{{mock.email}}","{{mock.name}}","{{mock.id}}",{value:"{{mock.team}}",label:n.jsx("span",{className:"text-primary",children:"Team"})}]),150)),R={render:()=>{const[e,t]=p.useState(!0),[a,r]=p.useState(!1),[s,c]=p.useState({from:"{{mock.email}}",subject:""}),i=[H({tokens:Wt,header:n.jsx("span",{className:"text-muted-foreground",children:"Template variables"}),footer:n.jsx("button",{type:"button",className:"text-primary hover:underline",onClick:()=>r(!0),children:"Show more…"})})];return n.jsxs("div",{className:"p-density-4",children:[n.jsx(Ft,{onClick:()=>t(!0),children:"Edit message"}),n.jsx($,{open:e,onClose:()=>t(!1),title:"Edit message",children:n.jsxs("div",{className:"space-y-4",children:[n.jsx(J,{schema:At,value:s,onChange:c,pre:i}),n.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(s,null,2)})]})}),n.jsx($,{open:a,onClose:()=>r(!1),title:"All variables",size:"sm",children:n.jsx("ul",{className:"space-y-1 font-mono text-xs",children:Et.map(d=>n.jsx("li",{children:d},d))})})]})},parameters:{docs:{description:{story:"The same template-value prefix on a form **inside a Modal**. Tokens load lazily via an async loader (a `Loading…` row shows until they resolve), one token uses a rich `ReactNode` label, and the menu carries a `header` plus a **Show more…** `footer` link (here opening a nested dialog). The `{ }` dropdown stacks above the dialog via `useFloatingZIndex`."}}},play:async({step:e})=>{const t=u(document.body);await e("Insert an async-loaded token from inside the dialog",async()=>{const a=t.getAllByRole("button",{name:"Insert template value"});await l.click(a[1]),await l.click(await t.findByRole("menuitem",{name:"{{mock.name}}"})),await m(()=>o(document.body.textContent).toContain('"subject": "{{mock.name}}"'))})}},B={args:{hiddenKeys:["age","tags"],title:"Trimmed"},parameters:{docs:{description:{story:"`hiddenKeys` omits properties from rendering without removing them from the value."}}}},Zt={type:"object",properties:{servers:{type:"array",title:"Servers",items:{type:"object",properties:{name:{type:"string",title:"Name"},port:{type:"integer",title:"Port",minimum:0},tls:{type:"boolean",title:"TLS"}},required:["name"]}}}},M={args:{schema:Zt,value:{servers:[{name:"api",port:8080,tls:!0},{name:"worker",port:0,tls:!1}]},title:"Cluster"},parameters:{docs:{description:{story:"When an array's items are objects, each item renders as its own sub-form (labelled *Item N*) with add / remove / reorder controls. Required and range hints apply per item. Plain string arrays still use the compact tag input — see **ScalarArrayTags**."}}}},$t={type:"object",properties:{routes:{type:"array",title:"Routes","x-array-display":"cards","x-item":{title:["path"],fallback:"New route",summary:[{property:"method"},{property:"upstream"}],glyph:"method",flag:"auth",noun:"route",nounPlural:"routes"},items:{type:"object",required:["path"],properties:{path:{type:"string",title:"Path"},method:{type:"string",title:"Method",enum:["GET","POST","DELETE"],"x-enum-tones":{GET:"teal",POST:"violet",DELETE:"rose"},"x-enum-display":"combobox"},upstream:{type:"string",title:"Upstream"},auth:{type:"boolean",title:"Requires auth"}}}}}},F={args:{schema:$t,value:{routes:[{path:"/api/v1/users",method:"GET",upstream:"users-svc:8080",auth:!0},{path:"/api/v1/events",method:"POST",upstream:"events-svc:8080",auth:!1}]},title:"Gateway"},parameters:{docs:{description:{story:'`x-array-display: "cards"` renders object items as a stack of titled cards, each headed by the item\'s own summary (from `x-item`) and edged with the tone its glyph property resolves to. Every item stays open; `x-array-display: "accordion"` reads the same `x-item` but collapses each item to one line and opens them one at a time. Without either, an object array renders as the *Item N* sub-forms in **ArrayOfObjects**.'}}},play:async({canvasElement:e})=>{const t=u(e);await o(t.getByText("/api/v1/users")).toBeInTheDocument(),await o(t.queryByText("Item 1")).not.toBeInTheDocument();const a=t.getAllByLabelText(/^Path/);await o(a).toHaveLength(2),await l.clear(a[1]),await l.type(a[1],"/api/v2/events"),await m(()=>o(t.getByText("/api/v2/events")).toBeInTheDocument()),await l.click(t.getByRole("button",{name:"Add route"})),await m(()=>o(t.getByText("New route")).toBeInTheDocument())}},Qt={type:"object",properties:{name:{type:"string",title:"Service name"},db:{type:"object",title:"Database",properties:{host:{type:"string",title:"Host"},port:{type:"integer",title:"Port"},creds:{type:"object",title:"Credentials",properties:{user:{type:"string",title:"User"},password:{type:"string",title:"Password"}},required:["user"]}},required:["host"]}}},I={args:{schema:Qt,value:{name:"billing",db:{host:"db.internal",port:5432,creds:{user:"svc",password:""}}},title:"Service"},parameters:{docs:{description:{story:"Objects with `properties` recurse into nested sub-forms — here two levels deep (`db` → `creds`). Each level keeps its own labels and required markers, and edits rebuild the full object immutably."}}}},Xt={type:"object",properties:{services:{type:"array",title:"Services",items:{type:"object",properties:{name:{type:"string",title:"Name"},env:{type:"object",title:"Env",additionalProperties:{type:"string"}},ports:{type:"array",title:"Ports",items:{type:"integer"}}},required:["name"]}}}},L={args:{schema:Xt,value:{services:[{name:"web",env:{LOG_LEVEL:"info"},ports:[80,443]},{name:"cache",env:{},ports:[6379]}]},title:"Compose"},parameters:{docs:{description:{story:"Array → object → (map + number array). The renderer follows the schema all the way down: editing a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below."}}}},Yt=(e,t)=>e.key!=="host"?t:{label:t.label,value:n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("div",{className:"min-w-0 flex-1",children:t.value}),n.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{discovered.host}}"),children:"Insert host"})]})},ea=e=>e.key==="host"?{...e,badge:"Discovered"}:e,ta={type:"object",properties:{primary:{type:"object",title:"Primary",properties:{host:{type:"string",title:"Host"}}},replicas:{type:"array",title:"Replicas",items:{type:"object",properties:{host:{type:"string",title:"Host"}}}}}},V={args:{schema:ta,value:{primary:{host:""},replicas:[{host:""}]},title:"Topology",pre:[ea],post:[Yt]},parameters:{docs:{description:{story:"The `pre` badge and `post` **Insert host** button target every field whose key is `host` — and they appear on the nested `primary.host` AND on each array item's `host`, because extensions run at every depth. Clicking an insert button mutates exactly that nested field via its own `onChange`."}}}},D={args:{schema:{type:"object",properties:{tags:{type:"array",title:"Tags",items:{type:"string"}}}},value:{tags:["math","engine"]},title:"Labels"},parameters:{docs:{description:{story:"Plain string arrays keep the compact tag editor: type and press Enter or comma to add, Backspace on an empty input to remove the last. This fast-path is chosen only when the item schema is a bare string."}}}},q={args:{schema:{type:"object",properties:{roles:{type:"array",title:"Roles",items:{type:"string",enum:["admin","editor","viewer"]}}}},value:{roles:["admin","viewer"]},title:"Access"},parameters:{docs:{description:{story:"An array whose items carry an `enum` is NOT a tag list — each item gets its own Combobox so values stay constrained to (and discoverable from) the option set, with the usual add / remove / reorder controls."}}}},aa={type:"object",properties:{dwellings:{type:"object",title:"Dwellings",propertyNames:{enum:["House","Apartment"]},additionalProperties:!1,patternProperties:{"^House$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},lotSize:{type:"string",title:"Lot size"},floors:{type:"integer",title:"Floors",minimum:1},hasGarden:{type:"boolean",title:"Has garden"}}},"^Apartment$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},buildingName:{type:"string",title:"Building name"},unit:{type:"string",title:"Unit"},floor:{type:"integer",title:"Floor"}}}}}}},_={args:{schema:aa,value:{dwellings:{House:{line1:"1 Maple St",city:"Mbabane",lotSize:"600m²",floors:2,hasGarden:!0}}},title:"Dwellings"},parameters:{docs:{description:{story:'Two features combined. **(1) Strict key picker:** the map declares `propertyNames.enum`, so the key field is a dropdown limited to those options (no free-text keys) — click **Add field** and pick `House` or `Apartment`; already-used keys are filtered out. **(2) Per-key value form:** `patternProperties` maps each key to its own value schema (`^House$` → lot-size / floors / garden, `^Apartment$` → building / unit / floor), so the form rendered under each entry depends on which key you picked — the standard JSON-Schema way to vary a map value by its key, with no duplicate discriminator field. `x-layout: "stack"` keeps the key and its fields together as one full-width unit.'}}}},na={type:"object",properties:{roles:{type:"array",title:"Roles","x-layout":"table",items:{type:"object",properties:{clientGuid:{type:"string",title:"Client"},primary:{type:"string",title:"Primary",enum:["Group Scheme","Owner","Insured"]},secondary:{type:"string",title:"Secondary",enum:["Scheme","Member"]}}}}}},z={args:{schema:na,value:{roles:[{clientGuid:"{{scheme.guid}}",primary:"Group Scheme",secondary:"Scheme"},{clientGuid:"{{clients.Director.guid}}",primary:"Owner",secondary:"Member"}]},title:"Relationships"},parameters:{docs:{description:{story:'`x-layout: "table"` on an array of objects renders it as a table — a header row of the item\'s property names and one compact row per item, with a per-row remove and an **Add item** button. Compare with **ArrayOfObjects**, which renders the same data as taller per-item sub-forms. Absent the hint, the stacked form is still the default.'}}}},ra={type:"object",properties:{name:{type:"string",title:"Name"},address:{type:"object",title:"Address","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"}}}}},G={args:{schema:ra,value:{name:"Ada Lovelace",address:{line1:"1 Maple St",city:"Mbabane"}},title:"Profile",inline:!0},parameters:{docs:{description:{story:'A per-field `x-layout` overrides the form-level layout for that field\'s subtree. The form is `inline` (two-column), but the `address` object declares `x-layout: "stack"`, so its `line1`/`city` fields render stacked (label above value) while the top-level `name` stays inline. Precedence is: explicit `x-layout` > form-level `layout`/`inline`.'}}}};var Q,X,Y;g.parameters={...g.parameters,docs:{...(Q=g.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what \`onChange\` emits."
      }
    }
  }
}`,...(Y=(X=g.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var ee,te,ae;f.parameters={...f.parameters,docs:{...(ee=f.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(ae=(te=f.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};var ne,re,se;b.parameters={...b.parameters,docs:{...(ne=b.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(se=(re=b.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var oe,ie,le;v.parameters={...v.parameters,docs:{...(oe=v.parameters)==null?void 0:oe.docs,source:{originalSource:`{
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
}`,...(le=(ie=v.parameters)==null?void 0:ie.docs)==null?void 0:le.source}}};var ce,de,me;x.parameters={...x.parameters,docs:{...(ce=x.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(me=(de=x.parameters)==null?void 0:de.docs)==null?void 0:me.source}}};var pe,ue,ye;w.parameters={...w.parameters,docs:{...(pe=w.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(ye=(ue=w.parameters)==null?void 0:ue.docs)==null?void 0:ye.source}}};var he,ge,fe;k.parameters={...k.parameters,docs:{...(he=k.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(fe=(ge=k.parameters)==null?void 0:ge.docs)==null?void 0:fe.source}}};var be,ve,xe;S.parameters={...S.parameters,docs:{...(be=S.parameters)==null?void 0:be.docs,source:{originalSource:`{
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
}`,...(xe=(ve=S.parameters)==null?void 0:ve.docs)==null?void 0:xe.source}}};var we,ke,Se;j.parameters={...j.parameters,docs:{...(we=j.parameters)==null?void 0:we.docs,source:{originalSource:`{
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
}`,...(Se=(ke=j.parameters)==null?void 0:ke.docs)==null?void 0:Se.source}}};var je,Te,Ce;T.parameters={...T.parameters,docs:{...(je=T.parameters)==null?void 0:je.docs,source:{originalSource:`{
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
}`,...(Ce=(Te=T.parameters)==null?void 0:Te.docs)==null?void 0:Ce.source}}};var Ne,Pe,Oe;C.parameters={...C.parameters,docs:{...(Ne=C.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
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
}`,...(Oe=(Pe=C.parameters)==null?void 0:Pe.docs)==null?void 0:Oe.source}}};var Ee,Ae,Re;N.parameters={...N.parameters,docs:{...(Ee=N.parameters)==null?void 0:Ee.docs,source:{originalSource:`{
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
}`,...(Re=(Ae=N.parameters)==null?void 0:Ae.docs)==null?void 0:Re.source}}};var Be,Me,Fe;P.parameters={...P.parameters,docs:{...(Be=P.parameters)==null?void 0:Be.docs,source:{originalSource:`{
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
}`,...(Fe=(Me=P.parameters)==null?void 0:Me.docs)==null?void 0:Fe.source}}};var Ie,Le,Ve;O.parameters={...O.parameters,docs:{...(Ie=O.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
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
}`,...(Ve=(Le=O.parameters)==null?void 0:Le.docs)==null?void 0:Ve.source}}};var De,qe,_e;E.parameters={...E.parameters,docs:{...(De=E.parameters)==null?void 0:De.docs,source:{originalSource:`{
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
}`,...(_e=(qe=E.parameters)==null?void 0:qe.docs)==null?void 0:_e.source}}};var ze,Ge,He;A.parameters={...A.parameters,docs:{...(ze=A.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(He=(Ge=A.parameters)==null?void 0:Ge.docs)==null?void 0:He.source}}};var Je,Ue,Ke;R.parameters={...R.parameters,docs:{...(Je=R.parameters)==null?void 0:Je.docs,source:{originalSource:`{
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
}`,...(Ke=(Ue=R.parameters)==null?void 0:Ue.docs)==null?void 0:Ke.source}}};var We,Ze,$e;B.parameters={...B.parameters,docs:{...(We=B.parameters)==null?void 0:We.docs,source:{originalSource:`{
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
}`,...($e=(Ze=B.parameters)==null?void 0:Ze.docs)==null?void 0:$e.source}}};var Qe,Xe,Ye;M.parameters={...M.parameters,docs:{...(Qe=M.parameters)==null?void 0:Qe.docs,source:{originalSource:`{
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
        story: "When an array's items are objects, each item renders as its own sub-form (labelled *Item N*) with add / remove / reorder controls. Required and range hints apply per item. Plain string arrays still use the compact tag input — see **ScalarArrayTags**."
      }
    }
  }
}`,...(Ye=(Xe=M.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};var et,tt,at;F.parameters={...F.parameters,docs:{...(et=F.parameters)==null?void 0:et.docs,source:{originalSource:`{
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
        story: "\`x-array-display: \\"cards\\"\` renders object items as a stack of titled cards, each headed by the item's own summary (from \`x-item\`) and edged with the tone its glyph property resolves to. Every item stays open; \`x-array-display: \\"accordion\\"\` reads the same \`x-item\` but collapses each item to one line and opens them one at a time. Without either, an object array renders as the *Item N* sub-forms in **ArrayOfObjects**."
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
}`,...(at=(tt=F.parameters)==null?void 0:tt.docs)==null?void 0:at.source}}};var nt,rt,st;I.parameters={...I.parameters,docs:{...(nt=I.parameters)==null?void 0:nt.docs,source:{originalSource:`{
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
}`,...(st=(rt=I.parameters)==null?void 0:rt.docs)==null?void 0:st.source}}};var ot,it,lt;L.parameters={...L.parameters,docs:{...(ot=L.parameters)==null?void 0:ot.docs,source:{originalSource:`{
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
        story: "Array → object → (map + number array). The renderer follows the schema all the way down: editing a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below."
      }
    }
  }
}`,...(lt=(it=L.parameters)==null?void 0:it.docs)==null?void 0:lt.source}}};var ct,dt,mt;V.parameters={...V.parameters,docs:{...(ct=V.parameters)==null?void 0:ct.docs,source:{originalSource:`{
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
}`,...(mt=(dt=V.parameters)==null?void 0:dt.docs)==null?void 0:mt.source}}};var pt,ut,yt;D.parameters={...D.parameters,docs:{...(pt=D.parameters)==null?void 0:pt.docs,source:{originalSource:`{
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
        story: "Plain string arrays keep the compact tag editor: type and press Enter or comma to add, Backspace on an empty input to remove the last. This fast-path is chosen only when the item schema is a bare string."
      }
    }
  }
}`,...(yt=(ut=D.parameters)==null?void 0:ut.docs)==null?void 0:yt.source}}};var ht,gt,ft;q.parameters={...q.parameters,docs:{...(ht=q.parameters)==null?void 0:ht.docs,source:{originalSource:`{
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
        story: "An array whose items carry an \`enum\` is NOT a tag list — each item gets its own Combobox so values stay constrained to (and discoverable from) the option set, with the usual add / remove / reorder controls."
      }
    }
  }
}`,...(ft=(gt=q.parameters)==null?void 0:gt.docs)==null?void 0:ft.source}}};var bt,vt,xt;_.parameters={..._.parameters,docs:{...(bt=_.parameters)==null?void 0:bt.docs,source:{originalSource:`{
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
}`,...(xt=(vt=_.parameters)==null?void 0:vt.docs)==null?void 0:xt.source}}};var wt,kt,St;z.parameters={...z.parameters,docs:{...(wt=z.parameters)==null?void 0:wt.docs,source:{originalSource:`{
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
        story: "\`x-layout: \\"table\\"\` on an array of objects renders it as a table — a header row of the item's property names and one compact row per item, with a per-row remove and an **Add item** button. Compare with **ArrayOfObjects**, which renders the same data as taller per-item sub-forms. Absent the hint, the stacked form is still the default."
      }
    }
  }
}`,...(St=(kt=z.parameters)==null?void 0:kt.docs)==null?void 0:St.source}}};var jt,Tt,Ct;G.parameters={...G.parameters,docs:{...(jt=G.parameters)==null?void 0:jt.docs,source:{originalSource:`{
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
}`,...(Ct=(Tt=G.parameters)==null?void 0:Tt.docs)==null?void 0:Ct.source}}};const Ma=["Default","PresentationExtensions","Empty","Inline","InlineCustomWidths","Sizes","PreferencesMenu","MarkdownField","ReadOnly","PerFieldReadOnly","HideReadOnlyFields","Validation","StringMap","Conditional","Extensions","TemplateValuePrefix","TemplateValuePrefixInDialog","Hidden","ArrayOfObjects","ObjectArrayCards","NestedObject","DeepRecursion","NestedExtensions","ScalarArrayTags","EnumArray","MapKeyPicker","TableLayout","LayoutOverride"];export{M as ArrayOfObjects,O as Conditional,L as DeepRecursion,g as Default,b as Empty,q as EnumArray,E as Extensions,B as Hidden,C as HideReadOnlyFields,v as Inline,x as InlineCustomWidths,G as LayoutOverride,_ as MapKeyPicker,S as MarkdownField,V as NestedExtensions,I as NestedObject,F as ObjectArrayCards,T as PerFieldReadOnly,k as PreferencesMenu,f as PresentationExtensions,j as ReadOnly,D as ScalarArrayTags,w as Sizes,P as StringMap,z as TableLayout,A as TemplateValuePrefix,R as TemplateValuePrefixInDialog,N as Validation,Ma as __namedExportsOrder,Ba as default};

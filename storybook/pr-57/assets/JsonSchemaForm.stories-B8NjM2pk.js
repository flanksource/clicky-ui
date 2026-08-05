import{r as m,j as a,ax as Et}from"./iframe-DBr7zNeS.js";import{B as Rt}from"./button--5fQhbPU.js";import{M as Z}from"./Modal-BzNkJxbb.js";import{J as H}from"./JsonSchemaForm-DJ4cqSKx.js";import{I as At}from"./Icon-BJt4CZDw.js";import{D as Mt}from"./DropdownMenu-QeSunhD0.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BPm7-hB-.js";import"./index-DBE-7TL_.js";import"./index-C-JF4fJV.js";import"./modalStack-C6iTnFFa.js";import"./zIndex-CigQ76av.js";import"./HoverCard-CZ0fVunH.js";import"./json-schema-form-utils-DmMCMKnP.js";import"./json-schema-form-size-DYVq0lph.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-DTB8HFTN.js";import"./FilterPill-WxwJ1QL9.js";import"./DateTimePicker-qAZFKFT2.js";import"./SegmentedControl-BUfs-Zk7.js";import"./floating-ui.react-BCE0IOJT.js";import"./DropdownMenuSubmenu-XC3IPjqo.js";function Ft(e){return typeof e=="string"?{value:e,label:e}:{value:e.value,label:e.label??e.value}}function Bt(e,t,n){var h;const r=(h=t==null?void 0:t.closest("[data-jsf-control]"))==null?void 0:h.querySelector("input[data-jsf-input]"),s=typeof e.value=="string"?e.value:"";if(!r){e.onChange(n);return}const l=r.selectionStart??s.length,o=r.selectionEnd??s.length;e.onChange(s.slice(0,l)+n+s.slice(o));const c=l+n.length;requestAnimationFrame(()=>{r.focus(),r.setSelectionRange(c,c)})}function G({field:e,tokens:t,menuLabel:n,header:r,footer:s}){const l=m.useRef(null),[o,c]=m.useState(Array.isArray(t)?t:null),[h,W]=m.useState(!1),Pt=K=>{if(!K||o!==null||typeof t!="function")return;const y=t();y instanceof Promise?(W(!0),y.then(U=>{c(U),W(!1)})):c(y)},Ot=h?[{label:"Loading…",onSelect:()=>{},disabled:!0}]:(o??[]).map(K=>{const{value:y,label:U}=Ft(K);return{label:U,onSelect:()=>Bt(e,l.current,y)}});return a.jsx(Mt,{align:"left",menuLabel:n,menuClassName:"font-mono text-xs",items:Ot,onOpenChange:Pt,header:r,footer:s,trigger:a.jsx("button",{ref:l,type:"button","aria-label":n,title:n,className:"flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",children:a.jsx(At,{icon:Et})})})}try{G.displayName="TemplateVarMenu",G.__docgenInfo={description:"",displayName:"TemplateVarMenu",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",methods:[],props:{field:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"field",required:!0,tags:{},type:{name:"FieldControl"}},tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"tokens",required:!0,tags:{},type:{name:"TemplateValuesLoader"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"menuLabel",required:!0,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template-menu.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}function J(e){const{tokens:t,keys:n,menuLabel:r="Insert template value",header:s,footer:l}=e;return o=>{if(o.kind!=="string"&&o.kind!=="enum"||n&&!n.includes(o.key))return o;const c={...o,prefix:a.jsx(G,{field:o,tokens:t,menuLabel:r,header:s,footer:l})};return o.kind==="enum"?{...c,allowCustomValue:!0}:c}}try{J.displayName="templateValuePre",J.__docgenInfo={description:"",displayName:"templateValuePre",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",methods:[],props:{tokens:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"tokens",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!0,tags:{},type:{name:"TemplateValuesLoader"}},keys:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"keys",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string[]"}},menuLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"menuLabel",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"string"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"header",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"}],description:"",name:"footer",parent:{fileName:"clicky-ui/packages/ui/src/components/json-schema-form-template.tsx",name:"TemplateValueOptions"},required:!1,tags:{},type:{name:"ReactNode"}}},tags:{}}}catch{}const{expect:i,userEvent:d,waitFor:p,within:u}=__STORYBOOK_MODULE_TEST__,Vt=["xs","sm","md","lg","xl"];function St({schema:e,value:t,wrapperClassName:n="max-w-xl",...r}){const[s,l]=m.useState(t);return a.jsxs("div",{className:`${n} space-y-4`,children:[a.jsx(H,{schema:e,value:s,onChange:l,...r}),a.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(s,null,2)})]})}const jt={type:"object",required:["name"],properties:{name:{type:"string",title:"Full name",description:"First and last name."},age:{type:"integer",minimum:0,default:18},active:{type:"boolean",title:"Active"},role:{type:"string",title:"Role",enum:["admin","editor","viewer"]},tags:{type:"array",items:{type:"string"},description:"Press Enter or comma to add."}}},Lt={type:"object","x-columns":2,properties:{backend:{type:"string",title:"Runtime",enum:["claude","codex"],"x-enum-labels":{claude:"Claude",codex:"Codex"},"x-enum-icons":{claude:"robot-ai",codex:"columns"},"x-enum-display":"segmented","x-col-span":2},model:{type:"string",title:"Model","x-input-prefix-icon":"sparkles"},temperature:{type:"number",title:"Temperature",minimum:0,maximum:2}},allOf:[{if:{properties:{backend:{const:"claude"}}},then:{properties:{permissionMode:{type:"string",title:"Permission mode",enum:["default","acceptEdits","plan","bypassPermissions"],"x-enum-labels":{default:"Default",acceptEdits:"Accept edits",plan:"Plan",bypassPermissions:"Bypass"},"x-enum-icons":{default:"shield",acceptEdits:"edit",plan:"list-dashes",bypassPermissions:"lock-open"},"x-enum-descriptions":{default:"Prompt for dangerous operations.",acceptEdits:"Auto-accept file edits.",plan:"Planning only — no tool execution.",bypassPermissions:"Skip permission checks."},"x-enum-display":"segmented","x-col-span":2}}}},{if:{properties:{backend:{const:"codex"}}},then:{properties:{sandbox:{type:"string",title:"Sandbox",enum:["read-only","workspace-write","danger-full-access"],"x-enum-labels":{"read-only":"Read only","workspace-write":"Workspace write","danger-full-access":"Full access"},"x-enum-icons":{"read-only":"eye","workspace-write":"folder","danger-full-access":"warning-triangle"},"x-enum-descriptions":{"read-only":"No writes; commands are sandboxed.","workspace-write":"Writes limited to the workspace.","danger-full-access":"Unrestricted host access."},"x-enum-display":"segmented","x-col-span":2},askForApproval:{type:"string",title:"Approval",enum:["untrusted","on-failure","on-request","never"],"x-enum-labels":{untrusted:"Untrusted","on-failure":"On failure","on-request":"On request",never:"Never"},"x-enum-display":"segmented","x-col-span":2}}}}]},Ta={title:"Components/JsonSchemaForm",component:H,render:e=>a.jsx(St,{...e}),args:{schema:jt,value:{name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math","engine"]},readOnly:!1,inline:!1},argTypes:{schema:{control:"object",table:{category:"Schema"}},value:{control:"object",table:{category:"Value"}},readOnly:{control:"boolean",table:{category:"Behavior"}},hideReadOnlyFields:{control:"boolean",description:"Omit schema `readOnly: true` fields entirely instead of showing them as value displays.",table:{category:"Behavior",defaultValue:{summary:"false"}}},inline:{control:"boolean",description:"Shorthand for `layout: { mode: 'inline' }` — a two-column label/field layout instead of stacked. Ignored when `layout` is set.",table:{category:"Appearance",defaultValue:{summary:"false"}}},layout:{control:"object",description:"Form-level layout, overrides `inline`. Inline mode caps the label column (`labelMaxWidth`, default `40ch`) and value column (`valueMaxWidth`, default `400px`).",table:{category:"Appearance"}},size:{control:"inline-radio",options:["xs","sm","md","lg","xl"],description:"Scales every input and label form-wide. Defaults to `md`.",table:{category:"Appearance",defaultValue:{summary:"md"}}},idPrefix:{control:"text",description:"Namespaces generated input ids so multiple forms on one page don't collide.",table:{category:"Behavior"}},showPreferencesMenu:{control:"boolean",description:"Show the top-right three-dot display-options menu (size + layout). Controls only this form's appearance, never global density or values.",table:{category:"Appearance",defaultValue:{summary:"true"}}},persistPreferences:{control:"boolean",description:"Persist menu selections to localStorage so they survive remounts.",table:{category:"Behavior",defaultValue:{summary:"true"}}},preferencesStorageKey:{control:"text",description:"localStorage key the display preferences are stored under. Pass a distinct key to isolate a form.",table:{category:"Behavior",defaultValue:{summary:"clicky-ui-json-schema-form-preferences"}}},title:{control:"text",table:{category:"Appearance"}},hiddenKeys:{control:"object",table:{category:"Behavior"}},onChange:{control:!1,table:{category:"Events"}},pre:{control:!1,table:{category:"Extensions"}},post:{control:!1,table:{category:"Extensions"}}},parameters:{docs:{description:{component:["`JsonSchemaForm` turns a JSON-Schema object into an editable form. You give it a","`schema`, the current `value`, and an `onChange` callback; it renders one control per","property and hands you back the next value object on every edit. There is no submit step","and no internal state — it is a controlled component you drive from your own store.","","It is **deliberately domain-agnostic**. The library knows nothing about your app: it infers","a sensible control from each property's schema, resolves `if`/`then` conditionals, and","recurses through arrays and nested objects. Everything beyond that — badges, helper text,","custom-value tolerance, insert buttons, dropping fields — is added by *you* through two","extension hooks (`pre` and `post`), so the same component serves any product.","","### The controlled contract","```tsx","const [value, setValue] = useState<Record<string, unknown>>(initial);","<JsonSchemaForm schema={schema} value={value} onChange={setValue} />;","```","`onChange` always receives a brand-new object (and new nested arrays/objects for deep","edits) — never a mutation of the one you passed in. Validation is **display-only**: a","`Required` / range / unknown-value hint renders under a field but never blocks `onChange`.","","### Control inference","First match wins, top to bottom:","","| Schema | Control |","| --- | --- |","| `enum` (any type) | Combobox (free-text allowed via `allowCustomValue`) |","| `boolean` | checkbox (falls back to text if the value isn't a boolean) |","| `integer` / `number` | numeric text (kept as a string unless it parses cleanly) |","| `array` of plain strings | compact tag input |","| `array` of anything else | per-item recursive list with add / remove / reorder |","| `object` with `additionalProperties` | key/value string-map (+ any known props) |","| `object` with `properties` | **nested sub-form** (recurses) |","| otherwise | text |","","### Recursion","Array items and object/map values are rendered by the *same* pipeline as top-level fields,","to any depth. An array of objects, an object containing an array of objects, a map whose","values are objects — all render structurally, and **your `pre`/`post` extensions apply at","every level**, not just the top.","","### Writing extensions","A **pre-extension** runs after a control is inferred and before it renders. It returns a","transformed `FieldControl` — or `null` to drop the field entirely:","```ts","type FieldControl = {","  key: string;","  kind: 'string'|'number'|'boolean'|'enum'|'array'|'object'|'string-map';","  label: string; required: boolean; value: unknown;","  onChange: (next: unknown) => void;   // mutate the field from an adornment","  options?: { value: string; label: string }[];","  allowCustomValue?: boolean; badge?: string; helper?: string;","  coerceNumber?: boolean; itemSchema?: JsonSchemaProperty;","  objectProperties?: Record<string, JsonSchemaProperty>;","};","","type PreExtension = (","  field: FieldControl,","  ctx: { key: string; prop: JsonSchemaProperty; value: unknown },",") => FieldControl | null;","","// Example: badge + custom-value tolerance for a 'secret' field.","const secretPre: PreExtension = (field) =>","  field.key === 'token'","    ? { ...field, badge: 'Secret', helper: 'Stored encrypted.', allowCustomValue: true }","    : field;","```","A **post-extension** runs at render time. It receives the rendered `label` and `value`","nodes and returns replacements — typically wrapping the value with an adornment that calls","`field.onChange` (carried on the field):","```tsx","type PostExtension = (","  field: FieldControl,","  nodes: { label: ReactNode; value: ReactNode },",") => { label: ReactNode; value: ReactNode };","","const insertTokenPost: PostExtension = (field, nodes) =>","  field.key !== 'token' ? nodes : {","    label: nodes.label,","    value: (",'      <div className="flex items-center gap-2">','        <div className="min-w-0 flex-1">{nodes.value}</div>',`        <button type="button" onClick={() => field.onChange('{{secrets.api_token}}')}>`,"          Insert token","        </button>","      </div>","    ),","  };","","<JsonSchemaForm schema={schema} value={value} onChange={setValue}","  pre={[secretPre]} post={[insertTokenPost]} />;","```","Both stacks are arrays applied in order, and both run at every depth — see the","**NestedExtensions** story for an insert button on a string buried inside an object and an","array item."].join(`
`)}}}},g={parameters:{docs:{description:{story:"A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what `onChange` emits."}}}},f={args:{schema:Lt,value:{backend:"claude",model:"claude-sonnet-4-6",temperature:.2,permissionMode:"acceptEdits"},showPreferencesMenu:!1},parameters:{docs:{description:{story:"A consumer-authored 'runtime mode' panel driven entirely by JSON schema. It uses the presentation extensions — `x-enum-display: \"segmented\"` with `x-enum-icons` / `x-enum-descriptions` for the mode cards, `x-columns` + `x-col-span` for the Model/Temperature row, `x-input-prefix-icon` on Model, and an `if/then` const discriminator that swaps the permission fields when you toggle Runtime between Claude and Codex. No domain concepts live in the component."}}}},b={args:{value:{}},parameters:{docs:{description:{story:"The same schema with an empty value. The required `name` field shows its `Required` hint immediately; nothing is pre-filled because the form never invents values you didn't pass."}}}},v={args:{inline:!0,title:"Profile"},parameters:{docs:{description:{story:"`inline` switches each field to a compact two-column label/control layout, and `title` renders a heading above the form. Use this for dense property panels. The label column caps at `40ch` and the value column at `400px` by default."}}}},x={args:{title:"Profile",layout:{mode:"inline",labelMaxWidth:"8rem",valueMaxWidth:"240px"}},parameters:{docs:{description:{story:"Pass an explicit `layout` to override the inline width caps — here a narrower `8rem` label column and a `240px` value column. `layout` takes precedence over the `inline` shorthand."}}}};function It({size:e}){const[t,n]=m.useState({name:"Ada Lovelace",age:36,active:!0,role:"editor",tags:["math"]});return a.jsxs("div",{className:"min-w-64 space-y-2",children:[a.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),a.jsx(H,{schema:jt,value:t,onChange:n,size:e,idPrefix:e,showPreferencesMenu:!1})]})}const w={render:()=>a.jsx("div",{className:"flex flex-wrap gap-8",children:Vt.map(e=>a.jsx(It,{size:e},e))}),parameters:{docs:{description:{story:"The `size` prop scales every input and label form-wide across `xs`–`xl` (default `md`). Each column is an independent controlled form, so you can compare the full scale side by side — smaller sizes also tighten the vertical gaps between fields, larger sizes cap their spacing at `lg`. The display-options menu is disabled here so a persisted preference doesn't collapse the comparison."}}}},k={args:{title:"Profile",preferencesStorageKey:"storybook-json-schema-form-preferences"},parameters:{docs:{description:{story:"Every form shows a top-right three-dot menu (enabled by default). It carries a live **Filter fields** box (case-insensitive match on each field's label and key) that narrows the top-level fields as you type, plus options for **Size** (`xs`–`xl`), **Layout** (stacked / inline), and **Sort**. The trigger turns primary while a filter is active. Filtering is transient (never persisted); the other selections apply immediately and — with `persistPreferences` (default) — persist to localStorage under `preferencesStorageKey`, so they survive a remount and are shared across forms using the same key. The menu only changes this form's appearance; it never touches global page density or the field values. Pass `showPreferencesMenu={false}` to hide it, or `persistPreferences={false}` to keep changes in-memory only."}}},play:async({canvasElement:e,step:t})=>{const n=u(e),r=u(document.body);await t("Filter the fields down to Role via the menu",async()=>{await d.click(n.getByRole("button",{name:"Form display options"}));const s=await r.findByLabelText("Filter fields");await d.type(s,"role"),await p(()=>i(n.getByText("Role")).toBeInTheDocument()),i(n.queryByText("Full name")).not.toBeInTheDocument()}),await t("Clearing the filter restores every field",async()=>{await d.click(r.getByRole("button",{name:"Clear filter"})),await p(()=>i(n.getByText("Full name")).toBeInTheDocument())})}},qt={type:"object",properties:{summary:{type:"string",title:"Summary"},body:{type:"string",format:"md",title:"Body",description:"Markdown source stored as a plain string.","x-md-editor":{admonitions:!0,diffMode:{viewMode:"rich-text",viewModes:["rich-text","source"]},frontmatter:!0,tables:!0}}}},S={render:e=>a.jsx(St,{...e,wrapperClassName:"max-w-4xl"}),args:{schema:qt,value:{summary:"Quarterly notes",body:["# Quarterly notes","","- Revenue review","- Customer follow-up","","1. Draft","2. Review","3. Publish","",":::tip","Use `format: md` to get the MDXEditor field.",":::","","| Metric | Value |","| --- | ---: |","| Incidents | 3 |"].join(`
`)},layout:{mode:"stacked",valueMaxWidth:"56rem"},title:"Report"},parameters:{docs:{description:{story:"`format: md` renders the MDXEditor-backed markdown field. This example uses a wider `layout.valueMaxWidth` and enables a two-way Rich text / Source mode switch with typed `x-md-editor.diffMode` options."}}},play:async({canvasElement:e,step:t})=>{const n=u(e);await t("Render unordered and ordered list markers",async()=>{await p(()=>{i(e.querySelector(".clicky-mdx-editor-content > ul")).not.toBeNull(),i(e.querySelector(".clicky-mdx-editor-content > ol")).not.toBeNull()},{timeout:1e4});const r=e.querySelector(".clicky-mdx-editor-content > ul"),s=e.querySelector(".clicky-mdx-editor-content > ol");i(getComputedStyle(r).listStyleType).toBe("disc"),i(getComputedStyle(r).paddingInlineStart).not.toBe("0px"),i(getComputedStyle(s).listStyleType).toBe("decimal"),i(getComputedStyle(s).paddingInlineStart).not.toBe("0px")}),await t("Switch between rich text and markdown source",async()=>{const r=await n.findByRole("radio",{name:"Rich text"},{timeout:1e4}),s=n.getByRole("radio",{name:"Source mode"});i(r).toBeChecked(),await d.click(s),await p(()=>i(s).toBeChecked()),await d.click(r),await p(()=>i(r).toBeChecked())})}},j={args:{readOnly:!0},parameters:{docs:{description:{story:"`readOnly` disables every control at every depth — including add/remove/reorder on arrays and Add-field on maps — while still rendering the current values for inspection."}}}},Tt={type:"object",required:["FirstName"],properties:{ClientGUID:{type:"string",title:"Client GUID",readOnly:!0},SystemDate:{type:"string",format:"date-time",title:"System date",readOnly:!0},FirstName:{type:"string",title:"First name"},Role:{type:"string",title:"Role",enum:["admin","editor","viewer"]}}},T={args:{schema:Tt,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"}},parameters:{docs:{description:{story:"Fields whose schema declares `readOnly: true` render as static value displays (no input), while the rest stay editable. Dates are formatted human-readably; an empty read-only value shows an em-dash."}}}},C={args:{schema:Tt,value:{ClientGUID:"8f3c-7a21-44de",SystemDate:"2026-04-15T12:00:00Z",FirstName:"Ada",Role:"editor"},hideReadOnlyFields:!0},parameters:{docs:{description:{story:"`hideReadOnlyFields` drops every `readOnly: true` field at every depth, leaving only the editable surface."}}}},N={args:{value:{name:"",age:-5,role:"superuser",tags:[]}},parameters:{docs:{description:{story:"Display-only hints: empty required field, a number below `minimum`, and an enum value outside the option set. None of them block editing."}}}},Dt={type:"object",properties:{labels:{type:"object",title:"Labels",additionalProperties:{type:"string"},properties:{env:{type:"string",enum:["dev","staging","prod"]}}}}},P={args:{schema:Dt,value:{labels:{env:"prod",team:"platform"}}},parameters:{docs:{description:{story:"An object with `additionalProperties` renders as editable key/value rows. Known properties (e.g. `env`) get their schema-derived control; extra keys are free-form. Use **Add field** to append a row."}}}},_t={type:"object",properties:{notify:{type:"string",title:"Notify via",enum:["none","email","webhook"]}},allOf:[{if:{properties:{notify:{const:"email"}},required:["notify"]},then:{required:["address"],properties:{address:{type:"string",title:"Email address"}}}},{if:{properties:{notify:{const:"webhook"}},required:["notify"]},then:{required:["url"],properties:{url:{type:"string",title:"Webhook URL"},headers:{type:"object",title:"Headers",additionalProperties:{type:"string"}}}}}]},O={args:{schema:_t,value:{notify:"email",address:"ops@example.com"},title:"Notification"},parameters:{docs:{description:{story:"`if`/`then` clauses reveal extra fields based on the current value. Switch **Notify via** between `email` and `webhook` to see the dependent fields change."}}}},zt=e=>e.key==="token"?{...e,badge:"Secret",helper:"Stored encrypted."}:e,Jt=(e,t)=>e.key!=="token"?t:{label:t.label,value:a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("div",{className:"min-w-0 flex-1",children:t.value}),a.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{secrets.api_token}}"),children:"Insert token"})]})},E={args:{schema:{type:"object",properties:{endpoint:{type:"string",title:"Endpoint"},token:{type:"string",title:"API token"}}},value:{endpoint:"https://api.example.com",token:""},title:"Connection",pre:[zt],post:[Jt]},parameters:{docs:{description:{story:"A `pre` extension stamps a `Secret` badge and helper text onto the `token` field; a `post` extension adds an **Insert token** button beside its value that mutates the field through `onChange`."}}}},Ct=["{{mock.email}}","{{mock.name}}","{{mock.id}}","{{mock.team}}","{{now}}"],Nt={type:"object",properties:{from:{type:"string",title:"From",enum:["noreply@example.com","alerts@example.com","support@example.com"]},subject:{type:"string",title:"Subject"}}},R={args:{schema:Nt,value:{from:"{{mock.email}}",subject:""},title:"Message",pre:[J({tokens:Ct})]},parameters:{docs:{description:{story:"A `pre` extension hangs a `{ }` **template-value** menu off each field through `FieldControl.prefix`. Clicking it opens a *separate* dropdown of `{{mock.*}}` tokens; picking one splices the token into a text input at the caret, or replaces the value of an enum/combobox field. **From** is an `enum` with `allowCustomValue`, so an inserted token coexists with the preset addresses."}}},play:async({canvasElement:e,step:t})=>{const n=u(e),r=u(document.body);await t("Insert a token into the subject at the caret",async()=>{const s=n.getAllByRole("button",{name:"Insert template value"});await d.click(s[1]),await d.click(await r.findByRole("menuitem",{name:"{{mock.name}}"})),await p(()=>i(e.textContent).toContain('"subject": "{{mock.name}}"'))})}},Ht=()=>new Promise(e=>setTimeout(()=>e(["{{mock.email}}","{{mock.name}}","{{mock.id}}",{value:"{{mock.team}}",label:a.jsx("span",{className:"text-primary",children:"Team"})}]),150)),A={render:()=>{const[e,t]=m.useState(!0),[n,r]=m.useState(!1),[s,l]=m.useState({from:"{{mock.email}}",subject:""}),o=[J({tokens:Ht,header:a.jsx("span",{className:"text-muted-foreground",children:"Template variables"}),footer:a.jsx("button",{type:"button",className:"text-primary hover:underline",onClick:()=>r(!0),children:"Show more…"})})];return a.jsxs("div",{className:"p-density-4",children:[a.jsx(Rt,{onClick:()=>t(!0),children:"Edit message"}),a.jsx(Z,{open:e,onClose:()=>t(!1),title:"Edit message",children:a.jsxs("div",{className:"space-y-4",children:[a.jsx(H,{schema:Nt,value:s,onChange:l,pre:o}),a.jsx("pre",{className:"overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:JSON.stringify(s,null,2)})]})}),a.jsx(Z,{open:n,onClose:()=>r(!1),title:"All variables",size:"sm",children:a.jsx("ul",{className:"space-y-1 font-mono text-xs",children:Ct.map(c=>a.jsx("li",{children:c},c))})})]})},parameters:{docs:{description:{story:"The same template-value prefix on a form **inside a Modal**. Tokens load lazily via an async loader (a `Loading…` row shows until they resolve), one token uses a rich `ReactNode` label, and the menu carries a `header` plus a **Show more…** `footer` link (here opening a nested dialog). The `{ }` dropdown stacks above the dialog via `useFloatingZIndex`."}}},play:async({step:e})=>{const t=u(document.body);await e("Insert an async-loaded token from inside the dialog",async()=>{const n=t.getAllByRole("button",{name:"Insert template value"});await d.click(n[1]),await d.click(await t.findByRole("menuitem",{name:"{{mock.name}}"})),await p(()=>i(document.body.textContent).toContain('"subject": "{{mock.name}}"'))})}},M={args:{hiddenKeys:["age","tags"],title:"Trimmed"},parameters:{docs:{description:{story:"`hiddenKeys` omits properties from rendering without removing them from the value."}}}},Kt={type:"object",properties:{servers:{type:"array",title:"Servers",items:{type:"object",properties:{name:{type:"string",title:"Name"},port:{type:"integer",title:"Port",minimum:0},tls:{type:"boolean",title:"TLS"}},required:["name"]}}}},F={args:{schema:Kt,value:{servers:[{name:"api",port:8080,tls:!0},{name:"worker",port:0,tls:!1}]},title:"Cluster"},parameters:{docs:{description:{story:"When an array's items are objects, each item renders as its own sub-form (labelled *Item N*) with add / remove / reorder controls. Required and range hints apply per item. Plain string arrays still use the compact tag input — see **ScalarArrayTags**."}}}},Ut={type:"object",properties:{name:{type:"string",title:"Service name"},db:{type:"object",title:"Database",properties:{host:{type:"string",title:"Host"},port:{type:"integer",title:"Port"},creds:{type:"object",title:"Credentials",properties:{user:{type:"string",title:"User"},password:{type:"string",title:"Password"}},required:["user"]}},required:["host"]}}},B={args:{schema:Ut,value:{name:"billing",db:{host:"db.internal",port:5432,creds:{user:"svc",password:""}}},title:"Service"},parameters:{docs:{description:{story:"Objects with `properties` recurse into nested sub-forms — here two levels deep (`db` → `creds`). Each level keeps its own labels and required markers, and edits rebuild the full object immutably."}}}},Gt={type:"object",properties:{services:{type:"array",title:"Services",items:{type:"object",properties:{name:{type:"string",title:"Name"},env:{type:"object",title:"Env",additionalProperties:{type:"string"}},ports:{type:"array",title:"Ports",items:{type:"integer"}}},required:["name"]}}}},V={args:{schema:Gt,value:{services:[{name:"web",env:{LOG_LEVEL:"info"},ports:[80,443]},{name:"cache",env:{},ports:[6379]}]},title:"Compose"},parameters:{docs:{description:{story:"Array → object → (map + number array). The renderer follows the schema all the way down: editing a port two levels deep, adding an env key, or reordering a service all round-trip through the live JSON below."}}}},Wt=(e,t)=>e.key!=="host"?t:{label:t.label,value:a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("div",{className:"min-w-0 flex-1",children:t.value}),a.jsx("button",{type:"button",className:"shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",onClick:()=>e.onChange("{{discovered.host}}"),children:"Insert host"})]})},Zt=e=>e.key==="host"?{...e,badge:"Discovered"}:e,$t={type:"object",properties:{primary:{type:"object",title:"Primary",properties:{host:{type:"string",title:"Host"}}},replicas:{type:"array",title:"Replicas",items:{type:"object",properties:{host:{type:"string",title:"Host"}}}}}},L={args:{schema:$t,value:{primary:{host:""},replicas:[{host:""}]},title:"Topology",pre:[Zt],post:[Wt]},parameters:{docs:{description:{story:"The `pre` badge and `post` **Insert host** button target every field whose key is `host` — and they appear on the nested `primary.host` AND on each array item's `host`, because extensions run at every depth. Clicking an insert button mutates exactly that nested field via its own `onChange`."}}}},I={args:{schema:{type:"object",properties:{tags:{type:"array",title:"Tags",items:{type:"string"}}}},value:{tags:["math","engine"]},title:"Labels"},parameters:{docs:{description:{story:"Plain string arrays keep the compact tag editor: type and press Enter or comma to add, Backspace on an empty input to remove the last. This fast-path is chosen only when the item schema is a bare string."}}}},q={args:{schema:{type:"object",properties:{roles:{type:"array",title:"Roles",items:{type:"string",enum:["admin","editor","viewer"]}}}},value:{roles:["admin","viewer"]},title:"Access"},parameters:{docs:{description:{story:"An array whose items carry an `enum` is NOT a tag list — each item gets its own Combobox so values stay constrained to (and discoverable from) the option set, with the usual add / remove / reorder controls."}}}},Qt={type:"object",properties:{dwellings:{type:"object",title:"Dwellings",propertyNames:{enum:["House","Apartment"]},additionalProperties:!1,patternProperties:{"^House$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},lotSize:{type:"string",title:"Lot size"},floors:{type:"integer",title:"Floors",minimum:1},hasGarden:{type:"boolean",title:"Has garden"}}},"^Apartment$":{type:"object","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"},buildingName:{type:"string",title:"Building name"},unit:{type:"string",title:"Unit"},floor:{type:"integer",title:"Floor"}}}}}}},D={args:{schema:Qt,value:{dwellings:{House:{line1:"1 Maple St",city:"Mbabane",lotSize:"600m²",floors:2,hasGarden:!0}}},title:"Dwellings"},parameters:{docs:{description:{story:'Two features combined. **(1) Strict key picker:** the map declares `propertyNames.enum`, so the key field is a dropdown limited to those options (no free-text keys) — click **Add field** and pick `House` or `Apartment`; already-used keys are filtered out. **(2) Per-key value form:** `patternProperties` maps each key to its own value schema (`^House$` → lot-size / floors / garden, `^Apartment$` → building / unit / floor), so the form rendered under each entry depends on which key you picked — the standard JSON-Schema way to vary a map value by its key, with no duplicate discriminator field. `x-layout: "stack"` keeps the key and its fields together as one full-width unit.'}}}},Xt={type:"object",properties:{roles:{type:"array",title:"Roles","x-layout":"table",items:{type:"object",properties:{clientGuid:{type:"string",title:"Client"},primary:{type:"string",title:"Primary",enum:["Group Scheme","Owner","Insured"]},secondary:{type:"string",title:"Secondary",enum:["Scheme","Member"]}}}}}},_={args:{schema:Xt,value:{roles:[{clientGuid:"{{scheme.guid}}",primary:"Group Scheme",secondary:"Scheme"},{clientGuid:"{{clients.Director.guid}}",primary:"Owner",secondary:"Member"}]},title:"Relationships"},parameters:{docs:{description:{story:'`x-layout: "table"` on an array of objects renders it as a table — a header row of the item\'s property names and one compact row per item, with a per-row remove and an **Add item** button. Compare with **ArrayOfObjects**, which renders the same data as taller per-item sub-forms. Absent the hint, the stacked form is still the default.'}}}},Yt={type:"object",properties:{name:{type:"string",title:"Name"},address:{type:"object",title:"Address","x-layout":"stack",properties:{line1:{type:"string",title:"Line 1"},city:{type:"string",title:"City"}}}}},z={args:{schema:Yt,value:{name:"Ada Lovelace",address:{line1:"1 Maple St",city:"Mbabane"}},title:"Profile",inline:!0},parameters:{docs:{description:{story:'A per-field `x-layout` overrides the form-level layout for that field\'s subtree. The form is `inline` (two-column), but the `address` object declares `x-layout: "stack"`, so its `line1`/`city` fields render stacked (label above value) while the top-level `name` stays inline. Precedence is: explicit `x-layout` > form-level `layout`/`inline`.'}}}};var $,Q,X;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A scalar object: a required text field, a numeric field with a default, a boolean, an enum, and a string array. Edit any control and watch the live JSON below update — that JSON is exactly what \`onChange\` emits."
      }
    }
  }
}`,...(X=(Q=g.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};var Y,ee,te;f.parameters={...f.parameters,docs:{...(Y=f.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(te=(ee=f.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ae,ne,re;b.parameters={...b.parameters,docs:{...(ae=b.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
}`,...(re=(ne=b.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var se,oe,ie;v.parameters={...v.parameters,docs:{...(se=v.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ie=(oe=v.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};var le,ce,de;x.parameters={...x.parameters,docs:{...(le=x.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(de=(ce=x.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var me,pe,ue;w.parameters={...w.parameters,docs:{...(me=w.parameters)==null?void 0:me.docs,source:{originalSource:`{
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
}`,...(ue=(pe=w.parameters)==null?void 0:pe.docs)==null?void 0:ue.source}}};var ye,he,ge;k.parameters={...k.parameters,docs:{...(ye=k.parameters)==null?void 0:ye.docs,source:{originalSource:`{
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
}`,...(ge=(he=k.parameters)==null?void 0:he.docs)==null?void 0:ge.source}}};var fe,be,ve;S.parameters={...S.parameters,docs:{...(fe=S.parameters)==null?void 0:fe.docs,source:{originalSource:`{
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
}`,...(ve=(be=S.parameters)==null?void 0:be.docs)==null?void 0:ve.source}}};var xe,we,ke;j.parameters={...j.parameters,docs:{...(xe=j.parameters)==null?void 0:xe.docs,source:{originalSource:`{
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
}`,...(ke=(we=j.parameters)==null?void 0:we.docs)==null?void 0:ke.source}}};var Se,je,Te;T.parameters={...T.parameters,docs:{...(Se=T.parameters)==null?void 0:Se.docs,source:{originalSource:`{
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
}`,...(Te=(je=T.parameters)==null?void 0:je.docs)==null?void 0:Te.source}}};var Ce,Ne,Pe;C.parameters={...C.parameters,docs:{...(Ce=C.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
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
}`,...(Pe=(Ne=C.parameters)==null?void 0:Ne.docs)==null?void 0:Pe.source}}};var Oe,Ee,Re;N.parameters={...N.parameters,docs:{...(Oe=N.parameters)==null?void 0:Oe.docs,source:{originalSource:`{
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
}`,...(Re=(Ee=N.parameters)==null?void 0:Ee.docs)==null?void 0:Re.source}}};var Ae,Me,Fe;P.parameters={...P.parameters,docs:{...(Ae=P.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
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
}`,...(Fe=(Me=P.parameters)==null?void 0:Me.docs)==null?void 0:Fe.source}}};var Be,Ve,Le;O.parameters={...O.parameters,docs:{...(Be=O.parameters)==null?void 0:Be.docs,source:{originalSource:`{
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
}`,...(Le=(Ve=O.parameters)==null?void 0:Ve.docs)==null?void 0:Le.source}}};var Ie,qe,De;E.parameters={...E.parameters,docs:{...(Ie=E.parameters)==null?void 0:Ie.docs,source:{originalSource:`{
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
}`,...(De=(qe=E.parameters)==null?void 0:qe.docs)==null?void 0:De.source}}};var _e,ze,Je;R.parameters={...R.parameters,docs:{...(_e=R.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(Je=(ze=R.parameters)==null?void 0:ze.docs)==null?void 0:Je.source}}};var He,Ke,Ue;A.parameters={...A.parameters,docs:{...(He=A.parameters)==null?void 0:He.docs,source:{originalSource:`{
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
}`,...(Ue=(Ke=A.parameters)==null?void 0:Ke.docs)==null?void 0:Ue.source}}};var Ge,We,Ze;M.parameters={...M.parameters,docs:{...(Ge=M.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
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
}`,...(Ze=(We=M.parameters)==null?void 0:We.docs)==null?void 0:Ze.source}}};var $e,Qe,Xe;F.parameters={...F.parameters,docs:{...($e=F.parameters)==null?void 0:$e.docs,source:{originalSource:`{
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
}`,...(Xe=(Qe=F.parameters)==null?void 0:Qe.docs)==null?void 0:Xe.source}}};var Ye,et,tt;B.parameters={...B.parameters,docs:{...(Ye=B.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...(tt=(et=B.parameters)==null?void 0:et.docs)==null?void 0:tt.source}}};var at,nt,rt;V.parameters={...V.parameters,docs:{...(at=V.parameters)==null?void 0:at.docs,source:{originalSource:`{
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
}`,...(rt=(nt=V.parameters)==null?void 0:nt.docs)==null?void 0:rt.source}}};var st,ot,it;L.parameters={...L.parameters,docs:{...(st=L.parameters)==null?void 0:st.docs,source:{originalSource:`{
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
}`,...(it=(ot=L.parameters)==null?void 0:ot.docs)==null?void 0:it.source}}};var lt,ct,dt;I.parameters={...I.parameters,docs:{...(lt=I.parameters)==null?void 0:lt.docs,source:{originalSource:`{
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
}`,...(dt=(ct=I.parameters)==null?void 0:ct.docs)==null?void 0:dt.source}}};var mt,pt,ut;q.parameters={...q.parameters,docs:{...(mt=q.parameters)==null?void 0:mt.docs,source:{originalSource:`{
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
}`,...(ut=(pt=q.parameters)==null?void 0:pt.docs)==null?void 0:ut.source}}};var yt,ht,gt;D.parameters={...D.parameters,docs:{...(yt=D.parameters)==null?void 0:yt.docs,source:{originalSource:`{
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
}`,...(gt=(ht=D.parameters)==null?void 0:ht.docs)==null?void 0:gt.source}}};var ft,bt,vt;_.parameters={..._.parameters,docs:{...(ft=_.parameters)==null?void 0:ft.docs,source:{originalSource:`{
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
}`,...(vt=(bt=_.parameters)==null?void 0:bt.docs)==null?void 0:vt.source}}};var xt,wt,kt;z.parameters={...z.parameters,docs:{...(xt=z.parameters)==null?void 0:xt.docs,source:{originalSource:`{
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
}`,...(kt=(wt=z.parameters)==null?void 0:wt.docs)==null?void 0:kt.source}}};const Ca=["Default","PresentationExtensions","Empty","Inline","InlineCustomWidths","Sizes","PreferencesMenu","MarkdownField","ReadOnly","PerFieldReadOnly","HideReadOnlyFields","Validation","StringMap","Conditional","Extensions","TemplateValuePrefix","TemplateValuePrefixInDialog","Hidden","ArrayOfObjects","NestedObject","DeepRecursion","NestedExtensions","ScalarArrayTags","EnumArray","MapKeyPicker","TableLayout","LayoutOverride"];export{F as ArrayOfObjects,O as Conditional,V as DeepRecursion,g as Default,b as Empty,q as EnumArray,E as Extensions,M as Hidden,C as HideReadOnlyFields,v as Inline,x as InlineCustomWidths,z as LayoutOverride,D as MapKeyPicker,S as MarkdownField,L as NestedExtensions,B as NestedObject,T as PerFieldReadOnly,k as PreferencesMenu,f as PresentationExtensions,j as ReadOnly,I as ScalarArrayTags,w as Sizes,P as StringMap,_ as TableLayout,R as TemplateValuePrefix,A as TemplateValuePrefixInDialog,N as Validation,Ca as __namedExportsOrder,Ta as default};

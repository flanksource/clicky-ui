import{r as l,j as t}from"./iframe-DdgNogAy.js";import{J as c}from"./JsonSchemaForm-DARI-nkF.js";import{B as Me}from"./button-CzjW30CI.js";import"./preload-helper-BvsCWBK3.js";import"./utils-DW-IJACk.js";import"./Icon-Cj3ZeRuU.js";import"./DropdownMenu-D2g063jE.js";import"./floating-ui.react-Dbg33d5m.js";import"./index-B6mQjjqS.js";import"./index-Sl_STJ6n.js";import"./DropdownMenuSubmenu-BYLlZJBu.js";import"./modalStack-DWC2-Zws.js";import"./zIndex-BGbNBNA8.js";import"./Properties-gNwlSA00.js";import"./IconButton-B9kFZJ2L.js";import"./HoverCard-jnz4TehU.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-B2gvGDu0.js";import"./FilterPill-D2w9E3G0.js";import"./DateField-VfCqTrL3.js";import"./DatePicker-CZZY3psr.js";import"./DateTimePicker-CViqF8Rs.js";import"./SegmentedControl-Bv_vn1Rv.js";import"./TreePickerField-BudUZrqt.js";import"./Tree-Dj3zr1Vr.js";import"./TreeNode-Db4ZmAqC.js";import"./AccordionList-t2Y7kcib.js";import"./InputField-CHA1FFOf.js";import"./use-hotkey-BxWu26v8.js";import"./ListMenu-BbyATQkY.js";import"./Markdown-DuCvMZLJ.js";import"./Callout-D0_z7fbN.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B51oKzRt.js";import"./CodeDiff-0j-Ub4yH.js";import"./HighlightedTokens-AVP7rVb3.js";import"./JsonView-xlYTqv5C.js";import"./index-CPURVhFy.js";import"./loading-wD2sCDq3.js";const Ae={type:"object","x-columns":2,"x-order":["name","environment","endpoint","tags"],properties:{name:{type:"string",title:"Name"},environment:{type:"string",title:"Environment",enum:["development","staging"]},endpoint:{type:"string",title:"Endpoint"},tags:{type:"array",title:"Tags",items:{type:"string"}}}},p={type:"array",items:Ae,"x-item":{title:["name"],badge:"environment",summary:["endpoint"],noun:"service",nounPlural:"services"}},T={properties:{table:{...p,title:"Table","x-layout":"table"},accordion:{...p,title:"Summary rows","x-array-display":"accordion"},cards:{...p,title:"Cards","x-array-display":"cards"},stacked:{...p,title:"Stacked items","x-array-display":"stacked"},list:{type:"array",title:"Compact list","x-array-display":"list",items:{type:"string"}},map:{type:"object",title:"Parameters",additionalProperties:{type:"string"}},endpoints:{type:"object",title:"Endpoint groups",propertyNames:{title:"Role",enum:["primary","secondary"],"x-enum-labels":{primary:"Primary endpoint",secondary:"Secondary endpoint"}},additionalProperties:{type:"object","x-layout":"stack","x-columns":2,properties:{host:{type:"string",title:"Host"},port:{type:"integer",title:"Port"}}}}}},d=[{name:"Gateway",environment:"staging",endpoint:"https://gateway.example.com",tags:["public","api"]},{name:"Worker",environment:"development",endpoint:"https://worker.example.com",tags:["internal"]}],M={table:d,accordion:d,cards:d,stacked:d,list:["Validate configuration","Preview changes","Apply and verify"],map:{owner:"platform",region:"local"},endpoints:{primary:{host:"gateway.example.com",port:443},secondary:{host:"worker.example.com",port:8443}}},ze={type:"object",required:["name"],properties:{name:{type:"string",title:"Name"},connection:{type:"object",title:"Connection",properties:{host:{type:"string",title:"Host"},retries:{type:"integer",title:"Retries",minimum:0}}},tags:{type:"array",title:"Tags",items:{type:"string"}},notes:{type:"string",title:"Notes",format:"md"}}},Re={name:"",connection:{host:"localhost",retries:-1},tags:["internal","legacy"],notes:"**Review required** before enabling this service."},z=[{instancePath:"",message:"The service could not be saved. Review the highlighted fields."},{instancePath:"/connection/host",message:"This host is already assigned to another service."},{instancePath:"/connection/host",message:"Choose a host in the selected environment."},{instancePath:"/tags/1",message:"The legacy tag is no longer allowed."},{instancePath:"/notes",message:"Add an owner to the release notes."}],V={text:{type:"string",title:"Text",description:"A required single-line value."},password:{type:"string",title:"Password",format:"password"},textarea:{type:"string",title:"Textarea",format:"textarea"},markdown:{type:"string",title:"Markdown",format:"md","x-md-editor":{tables:!0,diffMode:{viewMode:"rich-text",viewModes:["rich-text","source"]}}},integer:{type:"integer",title:"Integer",minimum:0,multipleOf:1},number:{type:"number",title:"Decimal",multipleOf:.25},percent:{type:"number",title:"Percent",format:"percent",minimum:0,maximum:100},slider:{type:"number",title:"Slider",minimum:0,maximum:100,"x-number-display":"slider"},boolean:{type:"boolean",title:"Boolean"},date:{type:"string",title:"Date",format:"date"},dateTime:{type:"string",title:"Date and time",format:"date-time"},nullable:{type:["string","null"],title:"Nullable text",description:"Starts empty; click to enter a value."}},Ce={text:"Example service",password:"example-password",textarea:`First line
Second line`,markdown:`## Release notes

A **small** update with a [reference](https://example.com).

- Preview changes
- Save or cancel`,integer:3,number:1.25,percent:75,slider:40,boolean:!0,date:"2026-09-05",dateTime:"2026-09-05T10:30:00Z",nullable:null},i={type:"string",enum:["small","medium","large"]},C={url:"/example/options",filter:"name"},Te={combobox:{...i,title:"Enum combobox"},radio:{...i,title:"Enum radio","x-enum-display":"radio"},grid:{...i,title:"Enum grid","x-enum-display":"grid"},segmented:{...i,title:"Enum segments","x-enum-display":"segmented","x-enum-descriptions":{small:"A single worker",medium:"A small team",large:"A full department"}},union:{title:"Union enum",anyOf:[{type:"string",enum:["auto","manual"]},{type:"string"}]},lookup:{type:"string",title:"Lookup","x-clicky-lookup":C},multiLookup:{type:"array",title:"Multiple lookup",items:{type:"string"},"x-clicky-lookup":{...C,multi:!0}},treeLookup:{type:"string",title:"Tree lookup","x-clicky-lookup":{...C,hierarchy:{delimiters:"/"}}}},Ve={combobox:"medium",radio:"small",grid:"large",segmented:"medium",union:"auto",lookup:"engineering/api",multiLookup:["engineering/api"],treeLookup:"engineering/ui"},qe=async({descriptor:r,query:e})=>{if(r.url!==C.url)throw new Error(`Unexpected example lookup: ${r.url}`);return["engineering/api","engineering/ui","operations/support"].filter(a=>a.toLowerCase().includes(e.toLowerCase())).map(a=>({value:a,label:a}))},De={type:"object",required:["name"],properties:{name:{type:"string",title:"Name"},enabled:{type:"boolean",title:"Enabled"}}},m={type:"array",items:De,"x-item":{title:["name"],noun:"service"}},F={strings:{type:"array",title:"String tags",items:{type:"string"}},integers:{type:"array",title:"Integer tags",items:{type:"integer"}},numbers:{type:"array",title:"Decimal tags",items:{type:"number"}},choices:{type:"array",title:"Enum tags",items:i},pills:{type:"array",title:"Filter pills",items:i,"x-array-display":"filter-pills"},list:{type:"array",title:"Compact list",items:{type:"string"},"x-array-display":"list"},booleans:{type:"array",title:"Boolean array",items:{type:"boolean"}},accordion:{...m,title:"Object accordion","x-array-display":"accordion"},cards:{...m,title:"Object cards","x-array-display":"cards"},stacked:{...m,title:"Stacked objects","x-array-display":"stacked"},table:{...m,title:"Object table","x-layout":"table"},map:{type:"object",title:"String map",additionalProperties:{type:"string"}},typedMap:{type:"object",title:"Typed map",additionalProperties:{type:"number"}},keyPicker:{type:"object",title:"Map key picker",propertyNames:{enum:["primary","secondary"]},additionalProperties:{type:"string"}},nested:{type:"object",title:"Nested object",properties:{host:{type:"string",title:"Host"},credentials:{type:"object",title:"Credentials",properties:{username:{type:"string",title:"Username"}}}}}},A={strings:["api","internal"],integers:[2,4],numbers:[1.25,2.5],choices:["small","large"],pills:["small"],list:["Check configuration","Verify output"],booleans:[!0,!1],accordion:[{name:"API",enabled:!0}],cards:[{name:"Worker",enabled:!0}],stacked:[{name:"Scheduler",enabled:!1}],table:[{name:"Gateway",enabled:!0}],map:{owner:"platform",region:"local"},typedMap:{retries:3,timeout:30},keyPicker:{primary:"localhost"},nested:{host:"localhost",credentials:{username:"demo"}}},Fe={heading:{title:"Display heading","x-example-display":"heading"},info:{title:"Display text",description:"Static display fields and links do not enter edit mode.","x-example-display":"text"},divider:{title:"Divider","x-example-display":"divider"},spacer:{title:"Spacer","x-example-display":"spacer"},link:{type:"string",title:"Reference link","x-example-link":!0},readOnly:{type:"string",title:"Read-only text",readOnly:!0},readOnlyNumber:{type:"number",title:"Read-only number",readOnly:!0},readOnlyDate:{type:"string",title:"Read-only date",format:"date",readOnly:!0},readOnlyPassword:{type:"string",title:"Read-only password",format:"password",readOnly:!0}},Oe={link:"https://example.com",readOnly:"service-01",readOnlyNumber:42,readOnlyDate:"2026-09-05",readOnlyPassword:"example-secret"},Ie=r=>{const e=r.schema["x-example-display"];return e==="heading"||e==="text"||e==="divider"||e==="spacer"?{...r,kind:"display",displayVariant:e}:r.schema["x-example-link"]===!0?{...r,kind:"link"}:r},O={type:"object",properties:{scalars:{type:"object",title:"Scalar fields",properties:V,required:["text"]},choices:{type:"object",title:"Choices and lookups",properties:Te},collections:{type:"object",title:"Objects and collections",properties:F},presentation:{type:"object",title:"Presentation and read-only fields",properties:Fe}}},L={scalars:Ce,choices:Ve,collections:A,presentation:Oe},Ue={type:"object",required:["name"],properties:{name:{type:"string",title:"Name",description:"A readable service name."},enabled:{type:"boolean",title:"Enabled"},connection:{type:"object",title:"Connection",properties:{host:{type:"string",title:"Host"},retries:{type:"integer",title:"Retries",minimum:0},credentials:{type:"object",title:"Credentials",properties:{username:{type:"string",title:"Username"},password:{type:"string",title:"Password",format:"password"}}}}},environment:{type:"string",title:"Environment",enum:["development","staging"]},tags:{type:"array",title:"Tags",items:{type:"string"}},identifier:{type:"string",title:"Identifier",readOnly:!0}}},Ot={title:"JsonSchemaForm/Properties",component:c,parameters:{layout:"padded",docs:{description:{component:'Use layout={{ mode: "properties" }} for a property table with indented labels and aligned values. Previews render content only: selected tags and labels, rendered Markdown, collection contents, and extensions (post-extensions receive readOnly: true), without input borders, carets, or resize handles. Click a value to open its schema control. The inline check saves changes through onChange; cancel discards the draft. Leaving a field parks an unsaved edit on the row rather than discarding it — see the PendingEdit story — unless autoSave is set, which commits on the way out instead. Sizes XS–XL scale cell padding independently; XL matches the original Medium cell height. Read-only values cannot be edited.'}}},argTypes:{autoSave:{control:"boolean",description:"Drop the per-field confirm step: blur and Enter commit through `onChange` and no check/cancel is rendered. Escape still reverts. Only meaningful in the properties layout.",table:{category:"Behavior",defaultValue:{summary:"false"}}}},args:{schema:Ue,layout:{mode:"properties"},persistPreferences:!1}},u={render:r=>{const[e,a]=l.useState({name:"Example service",enabled:!0,connection:{host:"localhost",retries:3,credentials:{username:"demo",password:"example-password"}},environment:"development",tags:["api","internal"],identifier:"service-01"});return t.jsx("div",{className:"max-w-4xl",children:t.jsx(c,{...r,value:e,onChange:a})})}};function s(r){const[e,a]=l.useState(r.value);return t.jsxs("div",{className:"max-w-5xl space-y-4",children:[t.jsx("p",{className:"text-sm text-muted-foreground",children:"Click or Tab to an editable value. Enter saves and opens the next field, skipping action buttons. The inline check saves in place; Escape or cancel discards the draft. Leaving the editor parks an unsaved change instead: the row returns to presentation showing the pending value, and the check and cancel stay until you decide. The inline check and cancel appear only while the draft differs from the saved value. Open pickers handle their own keys first; Shift+Enter inserts a newline. The committed value below changes only when saved."}),t.jsx(c,{...r,value:e,onChange:a,lookupFetcher:qe,pre:[Ie]}),t.jsxs("details",{className:"rounded-md border border-border p-3",children:[t.jsx("summary",{className:"cursor-pointer text-sm font-medium",children:"Committed value"}),t.jsx("pre",{className:"mt-2 overflow-auto whitespace-pre-wrap text-xs",children:JSON.stringify(e,null,2)})]})]})}const y={render:s,args:{schema:O,value:L},parameters:{docs:{description:{story:"Every supported control kind, grouped by purpose. Includes enum and array display variants, locally supplied lookup choices, nested objects, typed maps, and display/link controls supplied through a pre-extension."}}}},h={render:s,args:{schema:{type:"object",properties:V,required:["text"]},value:Ce}},g={render:s,args:{schema:{type:"object",properties:Te},value:Ve}},x={render:s,args:{schema:{type:"object",properties:F},value:A}},v={render:s,args:{schema:T,value:M},parameters:{docs:{description:{story:"Collection previews reuse the editing layouts: ordered table columns, identity-rich summary rows, card headers and field grids, and compact lists. Maps nest like objects: keys occupy the label column and values remain aligned. Click a map key to rename or remove it; click a value to edit just that entry."}}}},b={render:s,args:{schema:{properties:{map:F.map,typedMap:F.typedMap,endpoints:T.properties.endpoints}},value:{...A,endpoints:M.endpoints}}},f={render:r=>t.jsx("div",{className:"grid max-w-7xl gap-6 lg:grid-cols-2",children:["xs","sm","md","lg","xl"].map(e=>t.jsxs("section",{className:"min-w-0 space-y-2",children:[t.jsx("h2",{className:"text-sm font-semibold uppercase",children:e}),t.jsx(s,{...r,size:e,idPrefix:`collection-${e}`,showPreferencesMenu:!1})]},e))}),args:{schema:{properties:{table:T.properties.table,accordion:T.properties.accordion}},value:M}},w={render:s,args:{schema:{type:"object",properties:Fe},value:Oe}},k={render:r=>t.jsx("div",{className:"grid max-w-7xl gap-6 lg:grid-cols-2",children:["xs","sm","md","lg","xl"].map(e=>t.jsxs("section",{className:"min-w-0 space-y-2",children:[t.jsx("h2",{className:"text-sm font-semibold uppercase",children:e}),t.jsx($e,{...r,size:e})]},e))})},S={render:Le,parameters:{docs:{description:{story:"Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them."}}}},j={render:r=>t.jsx("div",{className:"grid max-w-7xl gap-6 lg:grid-cols-2",children:["xs","sm","md","lg","xl"].map(e=>t.jsxs("section",{className:"min-w-0 space-y-2",children:[t.jsx("h2",{className:"text-sm font-semibold uppercase",children:e}),t.jsx(Le,{...r,size:e,idPrefix:`errors-${e}`})]},e))})},P={render:s,args:{schema:O,value:L,showFilter:!0},parameters:{docs:{description:{story:"Search service, internal, localhost, false, or 75. Searches keys, titles, committed scalar values, tags, and nested values without changing the form data. A nested match retains its containing group. Password contents are not searchable; Clear filter restores the complete form."}}}},E={render:s,args:{schema:O,value:L},parameters:{docs:{description:{story:"Edit a value and then click or Tab straight to another row without confirming. The edit is **parked**, not lost: the row returns to its presentation rendering but shows the pending value, and the check and cancel stay beside it. Click the value again to reopen the control on the draft, the check to commit it, or the cancel to put the saved value back. The Committed value below moves only when you commit — leaving a field never calls `onChange`."}}}},N={render:s,args:{schema:O,value:L,autoSave:!0},parameters:{docs:{description:{story:"The same form with `autoSave`. There is no check or cancel at all: leaving a field or pressing Enter commits it, so the Committed value below tracks every edit as you move through the form. Escape still abandons the field you are in. Use this where the form already sits behind a save of its own and confirming each field twice buys nothing."}}}};function Le(r){const[e,a]=l.useState(Re),[n,o]=l.useState(z);return t.jsxs("div",{className:"max-w-4xl space-y-3",children:[t.jsx("p",{className:"text-xs text-muted-foreground",children:"Fix Name and Retries with the inline check. Server errors remain until cleared below. Search “internal” to see hidden-field errors in the summary."}),t.jsx(c,{...r,schema:ze,value:e,onChange:a,errors:n,showFilter:!0}),t.jsx(Me,{size:"sm",onClick:()=>o(n.length?[]:z),children:n.length?"Clear server errors":"Restore server errors"})]})}function $e(r){const[e,a]=l.useState({name:"Example service",tags:["api","internal"],percent:75,markdown:`**Release notes**

- Preview changes
- Save or cancel`});return t.jsx(c,{...r,idPrefix:`properties-${r.size}`,value:e,onChange:a,showPreferencesMenu:!1,schema:{properties:{name:{type:"string",title:"Name"},tags:{type:"array",title:"Tags",items:{type:"string"}},percent:V.percent,markdown:V.markdown}},pre:[n=>n.key==="percent"?{...n,prefix:t.jsx("span",{className:"text-xs text-muted-foreground",children:"Quota"})}:n],post:[(n,o)=>n.key==="name"?{...o,value:t.jsxs("div",{className:"flex min-w-0 items-center gap-2",children:[t.jsx("div",{className:"min-w-0 flex-1",children:o.value}),t.jsx("span",{className:"rounded bg-muted px-1.5 py-0.5 text-xs",children:"Verified"})]})}:o]})}var R,q,D;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<Record<string, unknown>>({
      name: "Example service",
      enabled: true,
      connection: {
        host: "localhost",
        retries: 3,
        credentials: {
          username: "demo",
          password: "example-password"
        }
      },
      environment: "development",
      tags: ["api", "internal"],
      identifier: "service-01"
    });
    return <div className="max-w-4xl">
        <JsonSchemaForm {...args} value={value} onChange={setValue} />
      </div>;
  }
}`,...(D=(q=u.parameters)==null?void 0:q.docs)==null?void 0:D.source}}};var I,U,$;y.parameters={...y.parameters,docs:{...(I=y.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: allPropertiesSchema,
    value: allPropertiesValues
  },
  parameters: {
    docs: {
      description: {
        story: "Every supported control kind, grouped by purpose. Includes enum and array display variants, locally supplied lookup choices, nested objects, typed maps, and display/link controls supplied through a pre-extension."
      }
    }
  }
}`,...($=(U=y.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};var B,J,H;h.parameters={...h.parameters,docs:{...(B=h.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: scalarProperties,
      required: ["text"]
    },
    value: scalarValues
  }
}`,...(H=(J=h.parameters)==null?void 0:J.docs)==null?void 0:H.source}}};var W,X,G;g.parameters={...g.parameters,docs:{...(W=g.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: choiceProperties
    },
    value: choiceValues
  }
}`,...(G=(X=g.parameters)==null?void 0:X.docs)==null?void 0:G.source}}};var _,Q,Z;x.parameters={...x.parameters,docs:{...(_=x.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: collectionProperties
    },
    value: collectionValues
  }
}`,...(Z=(Q=x.parameters)==null?void 0:Q.docs)==null?void 0:Z.source}}};var K,Y,ee;v.parameters={...v.parameters,docs:{...(K=v.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: collectionLayoutsSchema,
    value: collectionLayoutsValue
  },
  parameters: {
    docs: {
      description: {
        story: "Collection previews reuse the editing layouts: ordered table columns, identity-rich summary rows, card headers and field grids, and compact lists. Maps nest like objects: keys occupy the label column and values remain aligned. Click a map key to rename or remove it; click a value to edit just that entry."
      }
    }
  }
}`,...(ee=(Y=v.parameters)==null?void 0:Y.docs)==null?void 0:ee.source}}};var te,re,ae;b.parameters={...b.parameters,docs:{...(te=b.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      properties: {
        map: collectionProperties.map!,
        typedMap: collectionProperties.typedMap!,
        endpoints: collectionLayoutsSchema.properties!.endpoints!
      }
    },
    value: {
      ...collectionValues,
      endpoints: collectionLayoutsValue.endpoints
    }
  }
}`,...(ae=(re=b.parameters)==null?void 0:re.docs)==null?void 0:ae.source}}};var se,ne,ie;f.parameters={...f.parameters,docs:{...(se=f.parameters)==null?void 0:se.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <FieldTypesExample {...args} size={size} idPrefix={\`collection-\${size}\`} showPreferencesMenu={false} />
        </section>)}
    </div>,
  args: {
    schema: {
      properties: {
        table: collectionLayoutsSchema.properties!.table!,
        accordion: collectionLayoutsSchema.properties!.accordion!
      }
    },
    value: collectionLayoutsValue
  }
}`,...(ie=(ne=f.parameters)==null?void 0:ne.docs)==null?void 0:ie.source}}};var oe,le,ce;w.parameters={...w.parameters,docs:{...(oe=w.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: presentationProperties
    },
    value: presentationValues
  }
}`,...(ce=(le=w.parameters)==null?void 0:le.docs)==null?void 0:ce.source}}};var pe,de,me;k.parameters={...k.parameters,docs:{...(pe=k.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <SizeExample {...args} size={size} />
        </section>)}
    </div>
}`,...(me=(de=k.parameters)==null?void 0:de.docs)==null?void 0:me.source}}};var ue,ye,he;S.parameters={...S.parameters,docs:{...(ue=S.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: ErrorExample,
  parameters: {
    docs: {
      description: {
        story: "Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them."
      }
    }
  }
}`,...(he=(ye=S.parameters)==null?void 0:ye.docs)==null?void 0:he.source}}};var ge,xe,ve;j.parameters={...j.parameters,docs:{...(ge=j.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <ErrorExample {...args} size={size} idPrefix={\`errors-\${size}\`} />
        </section>)}
    </div>
}`,...(ve=(xe=j.parameters)==null?void 0:xe.docs)==null?void 0:ve.source}}};var be,fe,we;P.parameters={...P.parameters,docs:{...(be=P.parameters)==null?void 0:be.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: allPropertiesSchema,
    value: allPropertiesValues,
    showFilter: true
  },
  parameters: {
    docs: {
      description: {
        story: "Search service, internal, localhost, false, or 75. Searches keys, titles, committed scalar values, tags, and nested values without changing the form data. A nested match retains its containing group. Password contents are not searchable; Clear filter restores the complete form."
      }
    }
  }
}`,...(we=(fe=P.parameters)==null?void 0:fe.docs)==null?void 0:we.source}}};var ke,Se,je;E.parameters={...E.parameters,docs:{...(ke=E.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: allPropertiesSchema,
    value: allPropertiesValues
  },
  parameters: {
    docs: {
      description: {
        story: "Edit a value and then click or Tab straight to another row without confirming. The edit is **parked**, not lost: the row returns to its presentation rendering but shows the pending value, and the check and cancel stay beside it. Click the value again to reopen the control on the draft, the check to commit it, or the cancel to put the saved value back. The Committed value below moves only when you commit — leaving a field never calls \`onChange\`."
      }
    }
  }
}`,...(je=(Se=E.parameters)==null?void 0:Se.docs)==null?void 0:je.source}}};var Pe,Ee,Ne;N.parameters={...N.parameters,docs:{...(Pe=N.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: allPropertiesSchema,
    value: allPropertiesValues,
    autoSave: true
  },
  parameters: {
    docs: {
      description: {
        story: "The same form with \`autoSave\`. There is no check or cancel at all: leaving a field or pressing Enter commits it, so the Committed value below tracks every edit as you move through the form. Escape still abandons the field you are in. Use this where the form already sits behind a save of its own and confirming each field twice buys nothing."
      }
    }
  }
}`,...(Ne=(Ee=N.parameters)==null?void 0:Ee.docs)==null?void 0:Ne.source}}};const Lt=["Editable","AllFieldTypes","ScalarFields","ChoicesAndLookups","ObjectsAndCollections","CollectionLayouts","NestedMaps","CollectionSizes","PresentationAndReadOnly","PreviewSizes","WithErrors","ErrorSizes","FilteringValues","PendingEdit","AutoSave"];export{y as AllFieldTypes,N as AutoSave,g as ChoicesAndLookups,v as CollectionLayouts,f as CollectionSizes,u as Editable,j as ErrorSizes,P as FilteringValues,b as NestedMaps,x as ObjectsAndCollections,E as PendingEdit,w as PresentationAndReadOnly,k as PreviewSizes,h as ScalarFields,S as WithErrors,Lt as __namedExportsOrder,Ot as default};

import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as ee}from"./button-DWTXPYSk.js";import{n as i,t as a}from"./JsonSchemaForm-DVJtWK8h.js";var o,s,c,l;function u(){return(u=e((()=>{o={type:`array`,items:{type:`object`,"x-columns":2,"x-order":[`name`,`environment`,`endpoint`,`tags`],properties:{name:{type:`string`,title:`Name`},environment:{type:`string`,title:`Environment`,enum:[`development`,`staging`]},endpoint:{type:`string`,title:`Endpoint`},tags:{type:`array`,title:`Tags`,items:{type:`string`}}}},"x-item":{title:[`name`],badge:`environment`,summary:[`endpoint`],noun:`service`,nounPlural:`services`}},s={properties:{table:{...o,title:`Table`,"x-layout":`table`},accordion:{...o,title:`Summary rows`,"x-array-display":`accordion`},cards:{...o,title:`Cards`,"x-array-display":`cards`},stacked:{...o,title:`Stacked items`,"x-array-display":`stacked`},list:{type:`array`,title:`Compact list`,"x-array-display":`list`,items:{type:`string`}},map:{type:`object`,title:`Parameters`,additionalProperties:{type:`string`}},endpoints:{type:`object`,title:`Endpoint groups`,propertyNames:{title:`Role`,enum:[`primary`,`secondary`],"x-enum-labels":{primary:`Primary endpoint`,secondary:`Secondary endpoint`}},additionalProperties:{type:`object`,"x-layout":`stack`,"x-columns":2,properties:{host:{type:`string`,title:`Host`},port:{type:`integer`,title:`Port`}}}}}},c=[{name:`Gateway`,environment:`staging`,endpoint:`https://gateway.example.com`,tags:[`public`,`api`]},{name:`Worker`,environment:`development`,endpoint:`https://worker.example.com`,tags:[`internal`]}],l={table:c,accordion:c,cards:c,stacked:c,list:[`Validate configuration`,`Preview changes`,`Apply and verify`],map:{owner:`platform`,region:`local`},endpoints:{primary:{host:`gateway.example.com`,port:443},secondary:{host:`worker.example.com`,port:8443}}}})))()}var d,f,p;function m(){return(m=e((()=>{d={type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`},connection:{type:`object`,title:`Connection`,properties:{host:{type:`string`,title:`Host`},retries:{type:`integer`,title:`Retries`,minimum:0}}},tags:{type:`array`,title:`Tags`,items:{type:`string`}},notes:{type:`string`,title:`Notes`,format:`md`}}},f={name:``,connection:{host:`localhost`,retries:-1},tags:[`internal`,`legacy`],notes:`**Review required** before enabling this service.`},p=[{instancePath:``,message:`The service could not be saved. Review the highlighted fields.`},{instancePath:`/connection/host`,message:`This host is already assigned to another service.`},{instancePath:`/connection/host`,message:`Choose a host in the selected environment.`},{instancePath:`/tags/1`,message:`The legacy tag is no longer allowed.`},{instancePath:`/notes`,message:`Add an owner to the release notes.`}]})))()}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{h={text:{type:`string`,title:`Text`,description:`A required single-line value.`},password:{type:`string`,title:`Password`,format:`password`},textarea:{type:`string`,title:`Textarea`,format:`textarea`},markdown:{type:`string`,title:`Markdown`,format:`md`,"x-md-editor":{tables:!0,diffMode:{viewMode:`rich-text`,viewModes:[`rich-text`,`source`]}}},integer:{type:`integer`,title:`Integer`,minimum:0,multipleOf:1},number:{type:`number`,title:`Decimal`,multipleOf:.25},percent:{type:`number`,title:`Percent`,format:`percent`,minimum:0,maximum:100},slider:{type:`number`,title:`Slider`,minimum:0,maximum:100,"x-number-display":`slider`},boolean:{type:`boolean`,title:`Boolean`},date:{type:`string`,title:`Date`,format:`date`},dateTime:{type:`string`,title:`Date and time`,format:`date-time`},nullable:{type:[`string`,`null`],title:`Nullable text`,description:`Starts empty; click to enter a value.`}},g={text:`Example service`,password:`example-password`,textarea:`First line
Second line`,markdown:`## Release notes

A **small** update with a [reference](https://example.com).

- Preview changes
- Save or cancel`,integer:3,number:1.25,percent:75,slider:40,boolean:!0,date:`2026-09-05`,dateTime:`2026-09-05T10:30:00Z`,nullable:null},_={type:`string`,enum:[`small`,`medium`,`large`]},v={url:`/example/options`,filter:`name`},y={combobox:{..._,title:`Enum combobox`},radio:{..._,title:`Enum radio`,"x-enum-display":`radio`},grid:{..._,title:`Enum grid`,"x-enum-display":`grid`},segmented:{..._,title:`Enum segments`,"x-enum-display":`segmented`,"x-enum-descriptions":{small:`A single worker`,medium:`A small team`,large:`A full department`}},union:{title:`Union enum`,anyOf:[{type:`string`,enum:[`auto`,`manual`]},{type:`string`}]},lookup:{type:`string`,title:`Lookup`,"x-clicky-lookup":v},multiLookup:{type:`array`,title:`Multiple lookup`,items:{type:`string`},"x-clicky-lookup":{...v,multi:!0}},treeLookup:{type:`string`,title:`Tree lookup`,"x-clicky-lookup":{...v,hierarchy:{delimiters:`/`}}}},b={combobox:`medium`,radio:`small`,grid:`large`,segmented:`medium`,union:`auto`,lookup:`engineering/api`,multiLookup:[`engineering/api`],treeLookup:`engineering/ui`},x=async({descriptor:e,query:t})=>{if(e.url!==v.url)throw Error(`Unexpected example lookup: ${e.url}`);return[`engineering/api`,`engineering/ui`,`operations/support`].filter(e=>e.toLowerCase().includes(t.toLowerCase())).map(e=>({value:e,label:e}))},S={type:`array`,items:{type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`},enabled:{type:`boolean`,title:`Enabled`}}},"x-item":{title:[`name`],noun:`service`}},C={strings:{type:`array`,title:`String tags`,items:{type:`string`}},integers:{type:`array`,title:`Integer tags`,items:{type:`integer`}},numbers:{type:`array`,title:`Decimal tags`,items:{type:`number`}},choices:{type:`array`,title:`Enum tags`,items:_},pills:{type:`array`,title:`Filter pills`,items:_,"x-array-display":`filter-pills`},list:{type:`array`,title:`Compact list`,items:{type:`string`},"x-array-display":`list`},booleans:{type:`array`,title:`Boolean array`,items:{type:`boolean`}},accordion:{...S,title:`Object accordion`,"x-array-display":`accordion`},cards:{...S,title:`Object cards`,"x-array-display":`cards`},stacked:{...S,title:`Stacked objects`,"x-array-display":`stacked`},table:{...S,title:`Object table`,"x-layout":`table`},map:{type:`object`,title:`String map`,additionalProperties:{type:`string`}},typedMap:{type:`object`,title:`Typed map`,additionalProperties:{type:`number`}},keyPicker:{type:`object`,title:`Map key picker`,propertyNames:{enum:[`primary`,`secondary`]},additionalProperties:{type:`string`}},nested:{type:`object`,title:`Nested object`,properties:{host:{type:`string`,title:`Host`},credentials:{type:`object`,title:`Credentials`,properties:{username:{type:`string`,title:`Username`}}}}}},w={strings:[`api`,`internal`],integers:[2,4],numbers:[1.25,2.5],choices:[`small`,`large`],pills:[`small`],list:[`Check configuration`,`Verify output`],booleans:[!0,!1],accordion:[{name:`API`,enabled:!0}],cards:[{name:`Worker`,enabled:!0}],stacked:[{name:`Scheduler`,enabled:!1}],table:[{name:`Gateway`,enabled:!0}],map:{owner:`platform`,region:`local`},typedMap:{retries:3,timeout:30},keyPicker:{primary:`localhost`},nested:{host:`localhost`,credentials:{username:`demo`}}},T={heading:{title:`Display heading`,"x-example-display":`heading`},info:{title:`Display text`,description:`Static display fields and links do not enter edit mode.`,"x-example-display":`text`},divider:{title:`Divider`,"x-example-display":`divider`},spacer:{title:`Spacer`,"x-example-display":`spacer`},link:{type:`string`,title:`Reference link`,"x-example-link":!0},readOnly:{type:`string`,title:`Read-only text`,readOnly:!0},readOnlyNumber:{type:`number`,title:`Read-only number`,readOnly:!0},readOnlyDate:{type:`string`,title:`Read-only date`,format:`date`,readOnly:!0},readOnlyPassword:{type:`string`,title:`Read-only password`,format:`password`,readOnly:!0}},E={link:`https://example.com`,readOnly:`service-01`,readOnlyNumber:42,readOnlyDate:`2026-09-05`,readOnlyPassword:`example-secret`},D=e=>{let t=e.schema[`x-example-display`];return t===`heading`||t===`text`||t===`divider`||t===`spacer`?{...e,kind:`display`,displayVariant:t}:e.schema[`x-example-link`]===!0?{...e,kind:`link`}:e},O={type:`object`,properties:{scalars:{type:`object`,title:`Scalar fields`,properties:h,required:[`text`]},choices:{type:`object`,title:`Choices and lookups`,properties:y},collections:{type:`object`,title:`Objects and collections`,properties:C},presentation:{type:`object`,title:`Presentation and read-only fields`,properties:T}}},k={scalars:g,choices:b,collections:w,presentation:E}})))()}function j(e){let[t,n]=(0,P.useState)(e.value);return(0,F.jsxs)(`div`,{className:`max-w-5xl space-y-4`,children:[(0,F.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Click or Tab to an editable value. Enter saves and opens the next field, skipping action buttons. The inline check saves in place; Escape or cancel discards the draft. Leaving the editor parks an unsaved change instead: the row returns to presentation showing the pending value, and the check and cancel stay until you decide. The inline check and cancel appear only while the draft differs from the saved value. Open pickers handle their own keys first; Shift+Enter inserts a newline. The committed value below changes only when saved.`}),(0,F.jsx)(a,{...e,value:t,onChange:n,lookupFetcher:x,pre:[D]}),(0,F.jsxs)(`details`,{className:`rounded-md border border-border p-3`,children:[(0,F.jsx)(`summary`,{className:`cursor-pointer text-sm font-medium`,children:`Committed value`}),(0,F.jsx)(`pre`,{className:`mt-2 overflow-auto whitespace-pre-wrap text-xs`,children:JSON.stringify(t,null,2)})]})]})}function M(e){let[t,n]=(0,P.useState)(f),[r,i]=(0,P.useState)(p);return(0,F.jsxs)(`div`,{className:`max-w-4xl space-y-3`,children:[(0,F.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Fix Name and Retries with the inline check. Server errors remain until cleared below. Search “internal” to see hidden-field errors in the summary.`}),(0,F.jsx)(a,{...e,schema:d,value:t,onChange:n,errors:r,showFilter:!0}),(0,F.jsx)(ee,{size:`sm`,onClick:()=>i(r.length?[]:p),children:r.length?`Clear server errors`:`Restore server errors`})]})}function N(e){let[t,n]=(0,P.useState)({name:`Example service`,tags:[`api`,`internal`],percent:75,markdown:`**Release notes**

- Preview changes
- Save or cancel`});return(0,F.jsx)(a,{...e,idPrefix:`properties-${e.size}`,value:t,onChange:n,showPreferencesMenu:!1,schema:{properties:{name:{type:`string`,title:`Name`},tags:{type:`array`,title:`Tags`,items:{type:`string`}},percent:h.percent,markdown:h.markdown}},pre:[e=>e.key===`percent`?{...e,prefix:(0,F.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Quota`})}:e],post:[(e,t)=>e.key===`name`?{...t,value:(0,F.jsxs)(`div`,{className:`flex min-w-0 items-center gap-2`,children:[(0,F.jsx)(`div`,{className:`min-w-0 flex-1`,children:t.value}),(0,F.jsx)(`span`,{className:`rounded bg-muted px-1.5 py-0.5 text-xs`,children:`Verified`})]})}:t]})}var P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{P=t(),i(),r(),u(),m(),A(),F=n(),I={title:`JsonSchemaForm/Properties`,component:a,parameters:{layout:`padded`,docs:{description:{component:`Use layout={{ mode: "properties" }} for a property table with indented labels and aligned values. Previews render content only: selected tags and labels, rendered Markdown, collection contents, and extensions (post-extensions receive readOnly: true), without input borders, carets, or resize handles. Click a value to open its schema control. The inline check saves changes through onChange; cancel discards the draft. Leaving a field parks an unsaved edit on the row rather than discarding it — see the PendingEdit story — unless autoSave is set, which commits on the way out instead. Sizes XS–XL scale cell padding independently; XL matches the original Medium cell height. Read-only values cannot be edited.`}}},argTypes:{autoSave:{control:`boolean`,description:"Drop the per-field confirm step: blur and Enter commit through `onChange` and no check/cancel is rendered. Escape still reverts. Only meaningful in the properties layout.",table:{category:`Behavior`,defaultValue:{summary:`false`}}}},args:{schema:{type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`,description:`A readable service name.`},enabled:{type:`boolean`,title:`Enabled`},connection:{type:`object`,title:`Connection`,properties:{host:{type:`string`,title:`Host`},retries:{type:`integer`,title:`Retries`,minimum:0},credentials:{type:`object`,title:`Credentials`,properties:{username:{type:`string`,title:`Username`},password:{type:`string`,title:`Password`,format:`password`}}}}},environment:{type:`string`,title:`Environment`,enum:[`development`,`staging`]},tags:{type:`array`,title:`Tags`,items:{type:`string`}},identifier:{type:`string`,title:`Identifier`,readOnly:!0}}},layout:{mode:`properties`},persistPreferences:!1}},L={render:e=>{let[t,n]=(0,P.useState)({name:`Example service`,enabled:!0,connection:{host:`localhost`,retries:3,credentials:{username:`demo`,password:`example-password`}},environment:`development`,tags:[`api`,`internal`],identifier:`service-01`});return(0,F.jsx)(`div`,{className:`max-w-4xl`,children:(0,F.jsx)(a,{...e,value:t,onChange:n})})}},R={render:j,args:{schema:O,value:k},parameters:{docs:{description:{story:`Every supported control kind, grouped by purpose. Includes enum and array display variants, locally supplied lookup choices, nested objects, typed maps, and display/link controls supplied through a pre-extension.`}}}},z={render:j,args:{schema:{type:`object`,properties:h,required:[`text`]},value:g}},B={render:j,args:{schema:{type:`object`,properties:y},value:b}},V={render:j,args:{schema:{type:`object`,properties:C},value:w}},H={render:j,args:{schema:s,value:l},parameters:{docs:{description:{story:`Collection previews reuse the editing layouts: ordered table columns, identity-rich summary rows, card headers and field grids, and compact lists. Maps nest like objects: keys occupy the label column and values remain aligned. Click a map key to rename or remove it; click a value to edit just that entry.`}}}},U={render:j,args:{schema:{properties:{map:C.map,typedMap:C.typedMap,endpoints:s.properties.endpoints}},value:{...w,endpoints:l.endpoints}}},W={render:e=>(0,F.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,F.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,F.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,F.jsx)(j,{...e,size:t,idPrefix:`collection-${t}`,showPreferencesMenu:!1})]},t))}),args:{schema:{properties:{table:s.properties.table,accordion:s.properties.accordion}},value:l}},G={render:j,args:{schema:{type:`object`,properties:T},value:E}},K={render:e=>(0,F.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,F.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,F.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,F.jsx)(N,{...e,size:t})]},t))})},q={render:M,parameters:{docs:{description:{story:`Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them.`}}}},J={render:e=>(0,F.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,F.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,F.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,F.jsx)(M,{...e,size:t,idPrefix:`errors-${t}`})]},t))})},Y={render:j,args:{schema:O,value:k,showFilter:!0},parameters:{docs:{description:{story:`Search service, internal, localhost, false, or 75. Searches keys, titles, committed scalar values, tags, and nested values without changing the form data. A nested match retains its containing group. Password contents are not searchable; Clear filter restores the complete form.`}}}},X={render:j,args:{schema:O,value:k},parameters:{docs:{description:{story:"Edit a value and then click or Tab straight to another row without confirming. The edit is **parked**, not lost: the row returns to its presentation rendering but shows the pending value, and the check and cancel stay beside it. Click the value again to reopen the control on the draft, the check to commit it, or the cancel to put the saved value back. The Committed value below moves only when you commit — leaving a field never calls `onChange`."}}}},Z={render:j,args:{schema:O,value:k,autoSave:!0},parameters:{docs:{description:{story:"The same form with `autoSave`. There is no check or cancel at all: leaving a field or pressing Enter commits it, so the Committed value below tracks every edit as you move through the form. Escape still abandons the field you are in. Use this where the form already sits behind a save of its own and confirming each field twice buys nothing."}}}},Q=[`Editable`,`AllFieldTypes`,`ScalarFields`,`ChoicesAndLookups`,`ObjectsAndCollections`,`CollectionLayouts`,`NestedMaps`,`CollectionSizes`,`PresentationAndReadOnly`,`PreviewSizes`,`WithErrors`,`ErrorSizes`,`FilteringValues`,`PendingEdit`,`AutoSave`],L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: scalarProperties,
      required: ["text"]
    },
    value: scalarValues
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: choiceProperties
    },
    value: choiceValues
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: collectionProperties
    },
    value: collectionValues
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: presentationProperties
    },
    value: presentationValues
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <SizeExample {...args} size={size} />
        </section>)}
    </div>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: ErrorExample,
  parameters: {
    docs: {
      description: {
        story: "Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them."
      }
    }
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <ErrorExample {...args} size={size} idPrefix={\`errors-\${size}\`} />
        </section>)}
    </div>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}}})))()}$();export{R as AllFieldTypes,Z as AutoSave,B as ChoicesAndLookups,H as CollectionLayouts,W as CollectionSizes,L as Editable,J as ErrorSizes,Y as FilteringValues,U as NestedMaps,V as ObjectsAndCollections,X as PendingEdit,G as PresentationAndReadOnly,K as PreviewSizes,z as ScalarFields,q as WithErrors,Q as __namedExportsOrder,I as default};
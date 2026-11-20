import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./button-CLtlb14M.js";import{n as a,t as o}from"./JsonSchemaForm-CfZuoOr8.js";import{a as s,c,d as l,f as u,i as d,l as f,n as p,o as m,p as h,r as g,s as _,t as v,u as y}from"./json-schema-form-properties.fixtures-CHU9IEbx.js";var b,x,S,C;function w(){return(w=e((()=>{b={type:`array`,items:{type:`object`,"x-columns":2,"x-order":[`name`,`environment`,`endpoint`,`tags`],properties:{name:{type:`string`,title:`Name`},environment:{type:`string`,title:`Environment`,enum:[`development`,`staging`]},endpoint:{type:`string`,title:`Endpoint`},tags:{type:`array`,title:`Tags`,items:{type:`string`}}}},"x-item":{title:[`name`],badge:`environment`,summary:[`endpoint`],noun:`service`,nounPlural:`services`}},x={properties:{table:{...b,title:`Table`,"x-layout":`table`},accordion:{...b,title:`Summary rows`,"x-array-display":`accordion`},cards:{...b,title:`Cards`,"x-array-display":`cards`},stacked:{...b,title:`Stacked items`,"x-array-display":`stacked`},list:{type:`array`,title:`Compact list`,"x-array-display":`list`,items:{type:`string`}},map:{type:`object`,title:`Parameters`,additionalProperties:{type:`string`}},endpoints:{type:`object`,title:`Endpoint groups`,propertyNames:{title:`Role`,enum:[`primary`,`secondary`],"x-enum-labels":{primary:`Primary endpoint`,secondary:`Secondary endpoint`}},additionalProperties:{type:`object`,"x-layout":`stack`,"x-columns":2,properties:{host:{type:`string`,title:`Host`},port:{type:`integer`,title:`Port`}}}}}},S=[{name:`Gateway`,environment:`staging`,endpoint:`https://gateway.example.com`,tags:[`public`,`api`]},{name:`Worker`,environment:`development`,endpoint:`https://worker.example.com`,tags:[`internal`]}],C={table:S,accordion:S,cards:S,stacked:S,list:[`Validate configuration`,`Preview changes`,`Apply and verify`],map:{owner:`platform`,region:`local`},endpoints:{primary:{host:`gateway.example.com`,port:443},secondary:{host:`worker.example.com`,port:8443}}}})))()}var T,E,D;function O(){return(O=e((()=>{T={type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`},connection:{type:`object`,title:`Connection`,properties:{host:{type:`string`,title:`Host`},retries:{type:`integer`,title:`Retries`,minimum:0}}},tags:{type:`array`,title:`Tags`,items:{type:`string`}},notes:{type:`string`,title:`Notes`,format:`md`}}},E={name:``,connection:{host:`localhost`,retries:-1},tags:[`internal`,`legacy`],notes:`**Review required** before enabling this service.`},D=[{instancePath:``,message:`The service could not be saved. Review the highlighted fields.`},{instancePath:`/connection/host`,message:`This host is already assigned to another service.`},{instancePath:`/connection/host`,message:`Choose a host in the selected environment.`},{instancePath:`/tags/1`,message:`The legacy tag is no longer allowed.`},{instancePath:`/notes`,message:`Add an owner to the release notes.`}]})))()}function k(e){let[t,n]=(0,M.useState)(e.value);return(0,N.jsxs)(`div`,{className:`max-w-5xl space-y-4`,children:[(0,N.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Click or Tab to an editable value. Enter saves and opens the next field, skipping action buttons. The inline check saves in place; Escape or cancel discards the draft. Leaving the editor parks an unsaved change instead: the row returns to presentation showing the pending value, and the check and cancel stay until you decide. The inline check and cancel appear only while the draft differs from the saved value. Open pickers handle their own keys first; Shift+Enter inserts a newline. The committed value below changes only when saved.`}),(0,N.jsx)(o,{...e,value:t,onChange:n,lookupFetcher:y,pre:[l]}),(0,N.jsxs)(`details`,{className:`rounded-md border border-border p-3`,children:[(0,N.jsx)(`summary`,{className:`cursor-pointer text-sm font-medium`,children:`Committed value`}),(0,N.jsx)(`pre`,{className:`mt-2 overflow-auto whitespace-pre-wrap text-xs`,children:JSON.stringify(t,null,2)})]})]})}function A(e){let[t,n]=(0,M.useState)(E),[r,a]=(0,M.useState)(D);return(0,N.jsxs)(`div`,{className:`max-w-4xl space-y-3`,children:[(0,N.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Fix Name and Retries with the inline check. Server errors remain until cleared below. Search “internal” to see hidden-field errors in the summary.`}),(0,N.jsx)(o,{...e,schema:T,value:t,onChange:n,errors:r,showFilter:!0}),(0,N.jsx)(i,{size:`sm`,onClick:()=>a(r.length?[]:D),children:r.length?`Clear server errors`:`Restore server errors`})]})}function j(e){let[t,n]=(0,M.useState)({name:`Example service`,tags:[`api`,`internal`],percent:75,markdown:`**Release notes**

- Preview changes
- Save or cancel`});return(0,N.jsx)(o,{...e,idPrefix:`properties-${e.size}`,value:t,onChange:n,showPreferencesMenu:!1,schema:{properties:{name:{type:`string`,title:`Name`},tags:{type:`array`,title:`Tags`,items:{type:`string`}},percent:u.percent,markdown:u.markdown}},pre:[e=>e.key===`percent`?{...e,prefix:(0,N.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Quota`})}:e],post:[(e,t)=>e.key===`name`?{...t,value:(0,N.jsxs)(`div`,{className:`flex min-w-0 items-center gap-2`,children:[(0,N.jsx)(`div`,{className:`min-w-0 flex-1`,children:t.value}),(0,N.jsx)(`span`,{className:`rounded bg-muted px-1.5 py-0.5 text-xs`,children:`Verified`})]})}:t]})}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{M=t(),a(),r(),w(),O(),_(),N=n(),P={title:`JsonSchemaForm/Properties`,component:o,parameters:{layout:`padded`,docs:{description:{component:`Use layout={{ mode: "properties" }} for a property table with indented labels and aligned values. Previews render content only: selected tags and labels, rendered Markdown, collection contents, and extensions (post-extensions receive readOnly: true), without input borders, carets, or resize handles. Click a value to open its schema control. The inline check saves changes through onChange; cancel discards the draft. Leaving a field parks an unsaved edit on the row rather than discarding it — see the PendingEdit story — unless autoSave is set, which commits on the way out instead. Sizes XS–XL scale cell padding independently; XL matches the original Medium cell height. Read-only values cannot be edited.`}}},argTypes:{autoSave:{control:`boolean`,description:"Drop the per-field confirm step: blur and Enter commit through `onChange` and no check/cancel is rendered. Escape still reverts. Only meaningful in the properties layout.",table:{category:`Behavior`,defaultValue:{summary:`false`}}}},args:{schema:{type:`object`,required:[`name`],properties:{name:{type:`string`,title:`Name`,description:`A readable service name.`},enabled:{type:`boolean`,title:`Enabled`},connection:{type:`object`,title:`Connection`,properties:{host:{type:`string`,title:`Host`},retries:{type:`integer`,title:`Retries`,minimum:0},credentials:{type:`object`,title:`Credentials`,properties:{username:{type:`string`,title:`Username`},password:{type:`string`,title:`Password`,format:`password`}}}}},environment:{type:`string`,title:`Environment`,enum:[`development`,`staging`]},tags:{type:`array`,title:`Tags`,items:{type:`string`}},identifier:{type:`string`,title:`Identifier`,readOnly:!0}}},layout:{mode:`properties`},persistPreferences:!1}},F={render:e=>{let[t,n]=(0,M.useState)({name:`Example service`,enabled:!0,connection:{host:`localhost`,retries:3,credentials:{username:`demo`,password:`example-password`}},environment:`development`,tags:[`api`,`internal`],identifier:`service-01`});return(0,N.jsx)(`div`,{className:`max-w-4xl`,children:(0,N.jsx)(o,{...e,value:t,onChange:n})})}},I={render:k,args:{schema:v,value:p},parameters:{docs:{description:{story:`Every supported control kind, grouped by purpose. Includes enum and array display variants, locally supplied lookup choices, nested objects, typed maps, and display/link controls supplied through a pre-extension.`}}}},L={render:k,args:{schema:{type:`object`,properties:u,required:[`text`]},value:h}},R={render:k,args:{schema:{type:`object`,properties:g},value:d}},z={render:k,args:{schema:{type:`object`,properties:s},value:m}},B={render:k,args:{schema:x,value:C},parameters:{docs:{description:{story:`Collection previews reuse the editing layouts: ordered table columns, identity-rich summary rows, card headers and field grids, and compact lists. Maps nest like objects: keys occupy the label column and values remain aligned. Click a map key to rename or remove it; click a value to edit just that entry.`}}}},V={render:k,args:{schema:{properties:{map:s.map,typedMap:s.typedMap,endpoints:x.properties.endpoints}},value:{...m,endpoints:C.endpoints}}},H={render:e=>(0,N.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,N.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,N.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,N.jsx)(k,{...e,size:t,idPrefix:`collection-${t}`,showPreferencesMenu:!1})]},t))}),args:{schema:{properties:{table:x.properties.table,accordion:x.properties.accordion}},value:C}},U={render:k,args:{schema:{type:`object`,properties:c},value:f}},W={render:e=>(0,N.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,N.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,N.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,N.jsx)(j,{...e,size:t})]},t))})},G={render:A,parameters:{docs:{description:{story:`Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them.`}}}},K={render:e=>(0,N.jsx)(`div`,{className:`grid max-w-7xl gap-6 lg:grid-cols-2`,children:[`xs`,`sm`,`md`,`lg`,`xl`].map(t=>(0,N.jsxs)(`section`,{className:`min-w-0 space-y-2`,children:[(0,N.jsx)(`h2`,{className:`text-sm font-semibold uppercase`,children:t}),(0,N.jsx)(A,{...e,size:t,idPrefix:`errors-${t}`})]},t))})},q={render:k,args:{schema:v,value:p,showFilter:!0},parameters:{docs:{description:{story:`Search service, internal, localhost, false, or 75. Searches keys, titles, committed scalar values, tags, and nested values without changing the form data. A nested match retains its containing group. Password contents are not searchable; Clear filter restores the complete form.`}}}},J={render:k,args:{schema:v,value:p},parameters:{docs:{description:{story:"Edit a value and then click or Tab straight to another row without confirming. The edit is **parked**, not lost: the row returns to its presentation rendering but shows the pending value, and the check and cancel stay beside it. Click the value again to reopen the control on the draft, the check to commit it, or the cancel to put the saved value back. The Committed value below moves only when you commit — leaving a field never calls `onChange`."}}}},Y={render:k,args:{schema:v,value:p,autoSave:!0},parameters:{docs:{description:{story:"The same form with `autoSave`. There is no check or cancel at all: leaving a field or pressing Enter commits it, so the Committed value below tracks every edit as you move through the form. Escape still abandons the field you are in. Use this where the form already sits behind a save of its own and confirming each field twice buys nothing."}}}},X=[`Editable`,`AllFieldTypes`,`ScalarFields`,`ChoicesAndLookups`,`ObjectsAndCollections`,`CollectionLayouts`,`NestedMaps`,`CollectionSizes`,`PresentationAndReadOnly`,`PreviewSizes`,`WithErrors`,`ErrorSizes`,`FilteringValues`,`PendingEdit`,`AutoSave`],F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: scalarProperties,
      required: ["text"]
    },
    value: scalarValues
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: choiceProperties
    },
    value: choiceValues
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: collectionProperties
    },
    value: collectionValues
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: FieldTypesExample,
  args: {
    schema: {
      type: "object",
      properties: presentationProperties
    },
    value: presentationValues
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <SizeExample {...args} size={size} />
        </section>)}
    </div>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: ErrorExample,
  parameters: {
    docs: {
      description: {
        story: "Required and minimum-value hints alongside host-supplied errors on nested fields, Markdown, array items, and the form itself. Filter by internal or localhost: errors on hidden fields remain in the summary. Save commits a value; server errors remain until the host clears them."
      }
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
      {(["xs", "sm", "md", "lg", "xl"] as const).map(size => <section key={size} className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold uppercase">{size}</h2>
          <ErrorExample {...args} size={size} idPrefix={\`errors-\${size}\`} />
        </section>)}
    </div>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}}})))()}Z();export{I as AllFieldTypes,Y as AutoSave,R as ChoicesAndLookups,B as CollectionLayouts,H as CollectionSizes,F as Editable,K as ErrorSizes,q as FilteringValues,V as NestedMaps,z as ObjectsAndCollections,J as PendingEdit,U as PresentationAndReadOnly,W as PreviewSizes,L as ScalarFields,G as WithErrors,X as __namedExportsOrder,P as default};
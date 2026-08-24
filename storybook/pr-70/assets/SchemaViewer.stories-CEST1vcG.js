import{S as c}from"./SchemaViewer-Br7IV6mO.js";import"./iframe-1nhP4pBA.js";import"./preload-helper-C9Uksf5K.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./utils-DW-IJACk.js";import"./CodeBlock-svEp_1B4.js";import"./Icon-B2d9yic_.js";import"./CodeDiff-BWpF67Jd.js";import"./SegmentedControl-BX0icOeA.js";import"./HighlightedTokens-BrlLwXpa.js";import"./JsonView-CAfD8K_m.js";import"./Tree-DkTEIP7m.js";import"./TreeNode-DG0we7Jz.js";const m="then",a=["x-oi","pa-"].join(""),y=["@oi","pa-"].join(""),d=`${a}type`,l=`${a}ascode`,u=`${y}query`,E={type:"object",properties:{setup:{type:"object",properties:{scheme:{type:"object",properties:{fields:{type:"object",properties:{ProductCode:{type:"string",[d]:"Text",[l]:"Product",description:`Product code ${u} SQL SELECT Code, LongDescription FROM AsCode`,enum:["LIFE","ANNUITY","SAVINGS"],"x-enum-labels":{LIFE:"Life",ANNUITY:"Annuity",SAVINGS:"Savings"}},Premium:{type:"number",format:"currency"}}}}}}},steps:{type:"array",items:{type:"object",oneOf:[{required:["client"],properties:{client:{type:"object",required:["activity"],properties:{activity:{type:"string",enum:["CreateClient","UpdateClient"]},input:{type:"object"},expect:{type:"object",additionalProperties:{type:"string"}}},allOf:[{if:{properties:{activity:{const:"CreateClient"}}},[m]:{properties:{input:{type:"object",properties:{FirstName:{type:"string",description:"Given name"},LastName:{type:"string",description:"Family name"}}}}}}]}}}]}},plan:{type:"string"}}},L={title:"Data/SchemaViewer",component:c,args:{schema:E,showControls:!0},parameters:{docs:{description:{component:"Read-only JSON Schema tree viewer copied from the platform TestRunner schema inspector and adapted for shared clicky-ui use."}}}},e={},t={args:{schema:{type:"object",properties:{name:{type:"string",description:"Display name"},labels:{type:"object",additionalProperties:{type:"string"}},endpoints:{type:"array",items:{type:"object",properties:{url:{type:"string",format:"uri"},method:{type:"string",enum:["GET","POST","PUT","DELETE"]}}}}}}}};var r,n,o;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:"{}",...(o=(n=e.parameters)==null?void 0:n.docs)==null?void 0:o.source}}};var i,p,s;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Display name"
        },
        labels: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        },
        endpoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: {
                type: "string",
                format: "uri"
              },
              method: {
                type: "string",
                enum: ["GET", "POST", "PUT", "DELETE"]
              }
            }
          }
        }
      }
    }
  }
}`,...(s=(p=t.parameters)==null?void 0:p.docs)==null?void 0:s.source}}};const R=["TestPlanSchema","PlainSchema"];export{t as PlainSchema,e as TestPlanSchema,R as __namedExportsOrder,L as default};

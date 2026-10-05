import{S as c}from"./SchemaViewer-DmB9W3ze.js";import"./iframe-DW9dAhLx.js";import"./preload-helper-Bcd_tUTe.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./utils-DW-IJACk.js";import"./CodeBlock-CjVUlwYp.js";import"./Icon-DoAlPc9w.js";import"./CodeDiff-CEMXqTRo.js";import"./SegmentedControl-CrfNu512.js";import"./HighlightedTokens-DH2GJFTr.js";import"./JsonView-B_IDkh71.js";import"./button-CfAeUDeP.js";import"./index-CPURVhFy.js";import"./loading-Bax3wqdJ.js";import"./AccordionList-lICbzCbb.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-NamFkPhe.js";import"./Tree-CD_mN7D4.js";import"./TreeNode-9NrhBGqV.js";const m="then",a=["x-oi","pa-"].join(""),y=["@oi","pa-"].join(""),d=`${a}type`,l=`${a}ascode`,u=`${y}query`,E={type:"object",properties:{setup:{type:"object",properties:{scheme:{type:"object",properties:{fields:{type:"object",properties:{ProductCode:{type:"string",[d]:"Text",[l]:"Product",description:`Product code ${u} SQL SELECT Code, LongDescription FROM AsCode`,enum:["LIFE","ANNUITY","SAVINGS"],"x-enum-labels":{LIFE:"Life",ANNUITY:"Annuity",SAVINGS:"Savings"}},Premium:{type:"number",format:"currency"}}}}}}},steps:{type:"array",items:{type:"object",oneOf:[{required:["client"],properties:{client:{type:"object",required:["activity"],properties:{activity:{type:"string",enum:["CreateClient","UpdateClient"]},input:{type:"object"},expect:{type:"object",additionalProperties:{type:"string"}}},allOf:[{if:{properties:{activity:{const:"CreateClient"}}},[m]:{properties:{input:{type:"object",properties:{FirstName:{type:"string",description:"Given name"},LastName:{type:"string",description:"Family name"}}}}}}]}}}]}},plan:{type:"string"}}},U={title:"Data/SchemaViewer",component:c,args:{schema:E,showControls:!0},parameters:{docs:{description:{component:"Read-only JSON Schema tree viewer copied from the platform TestRunner schema inspector and adapted for shared clicky-ui use."}}}},e={},t={args:{schema:{type:"object",properties:{name:{type:"string",description:"Display name"},labels:{type:"object",additionalProperties:{type:"string"}},endpoints:{type:"array",items:{type:"object",properties:{url:{type:"string",format:"uri"},method:{type:"string",enum:["GET","POST","PUT","DELETE"]}}}}}}}};var r,o,i;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:"{}",...(i=(o=e.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};var n,p,s;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
}`,...(s=(p=t.parameters)==null?void 0:p.docs)==null?void 0:s.source}}};const V=["TestPlanSchema","PlainSchema"];export{t as PlainSchema,e as TestPlanSchema,V as __namedExportsOrder,U as default};

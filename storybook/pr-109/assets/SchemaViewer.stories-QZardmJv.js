import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./SchemaViewer-DSrZQWCi.js";var r,i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),r=`then`,i=`x-oipa-`,a=`@oipa-`,o=`${i}type`,s=`${i}ascode`,c=`${a}query`,l={type:`object`,properties:{setup:{type:`object`,properties:{scheme:{type:`object`,properties:{fields:{type:`object`,properties:{ProductCode:{type:`string`,[o]:`Text`,[s]:`Product`,description:`Product code ${c} SQL SELECT Code, LongDescription FROM AsCode`,enum:[`LIFE`,`ANNUITY`,`SAVINGS`],"x-enum-labels":{LIFE:`Life`,ANNUITY:`Annuity`,SAVINGS:`Savings`}},Premium:{type:`number`,format:`currency`}}}}}}},steps:{type:`array`,items:{type:`object`,oneOf:[{required:[`client`],properties:{client:{type:`object`,required:[`activity`],properties:{activity:{type:`string`,enum:[`CreateClient`,`UpdateClient`]},input:{type:`object`},expect:{type:`object`,additionalProperties:{type:`string`}}},allOf:[{if:{properties:{activity:{const:`CreateClient`}}},[r]:{properties:{input:{type:`object`,properties:{FirstName:{type:`string`,description:`Given name`},LastName:{type:`string`,description:`Family name`}}}}}}]}}}]}},plan:{type:`string`}}},u={title:`Data/SchemaViewer`,component:n,args:{schema:l,showControls:!0},parameters:{docs:{description:{component:`Read-only JSON Schema tree viewer copied from the platform TestRunner schema inspector and adapted for shared clicky-ui use.`}}}},d={},f={args:{schema:{type:`object`,properties:{name:{type:`string`,description:`Display name`},labels:{type:`object`,additionalProperties:{type:`string`}},endpoints:{type:`array`,items:{type:`object`,properties:{url:{type:`string`,format:`uri`},method:{type:`string`,enum:[`GET`,`POST`,`PUT`,`DELETE`]}}}}}}}},p=[`TestPlanSchema`,`PlainSchema`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}}})))()}m();export{f as PlainSchema,d as TestPlanSchema,p as __namedExportsOrder,u as default};
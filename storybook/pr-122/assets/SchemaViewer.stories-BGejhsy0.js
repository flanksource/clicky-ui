import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./SchemaViewer-BGc0rM6l.js";var r,i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),r=`then`,i=`x-oipa-`,a=`@oipa-`,o=`${i}type`,s=`${i}ascode`,c=`${a}query`,l={type:`object`,properties:{setup:{type:`object`,properties:{scheme:{type:`object`,properties:{fields:{type:`object`,properties:{ProductCode:{type:`string`,[o]:`Text`,[s]:`Product`,description:`Product code ${c} SQL SELECT Code, LongDescription FROM AsCode`,enum:[`LIFE`,`ANNUITY`,`SAVINGS`],"x-enum-labels":{LIFE:`Life`,ANNUITY:`Annuity`,SAVINGS:`Savings`}},Premium:{type:`number`,format:`currency`}}}}}}},steps:{type:`array`,items:{type:`object`,oneOf:[{required:[`client`],properties:{client:{type:`object`,required:[`activity`],properties:{activity:{type:`string`,enum:[`CreateClient`,`UpdateClient`]},input:{type:`object`},expect:{type:`object`,additionalProperties:{type:`string`}}},allOf:[{if:{properties:{activity:{const:`CreateClient`}}},[r]:{properties:{input:{type:`object`,properties:{FirstName:{type:`string`,description:`Given name`},LastName:{type:`string`,description:`Family name`}}}}}}]}}}]}},plan:{type:`string`}}},u={title:`Data/SchemaViewer`,component:n,args:{schema:l,showControls:!0},parameters:{docs:{description:{component:`Read-only JSON Schema viewer with ordered field sections, tree and table views, type icons, and expandable metadata.`}}}},d={},f={args:{schema:{type:`object`,properties:{name:{type:`string`,description:`Display name`},labels:{type:`object`,additionalProperties:{type:`string`}},endpoints:{type:`array`,items:{type:`object`,properties:{url:{type:`string`,format:`uri`},method:{type:`string`,enum:[`GET`,`POST`,`PUT`,`DELETE`]}}}}}}}},p={args:{schema:{type:`object`,properties:{id:{type:`string`,description:`Unique step identifier.`},timeout:{type:`string`,format:`duration`,default:`30s`},exec:{type:`string`,description:`Executable to run.`},args:{type:`array`,items:{type:`string`}},env:{type:`object`,additionalProperties:{type:`string`}}}},sections:[{id:`global`,title:`Global fields`,select:[`timeout`,`id`],order:[`id`,`timeout`]},{id:`kind`,title:`Command fields`,select:`*`,order:[`exec`,`args`,`env`]}]}},m={args:{...p.args,defaultView:`table`}},h=[`TestPlanSchema`,`PlainSchema`,`SectionedReference`,`TableReference`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique step identifier."
        },
        timeout: {
          type: "string",
          format: "duration",
          default: "30s"
        },
        exec: {
          type: "string",
          description: "Executable to run."
        },
        args: {
          type: "array",
          items: {
            type: "string"
          }
        },
        env: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        }
      }
    },
    sections: [{
      id: "global",
      title: "Global fields",
      select: ["timeout", "id"],
      order: ["id", "timeout"]
    }, {
      id: "kind",
      title: "Command fields",
      select: "*",
      order: ["exec", "args", "env"]
    }]
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...SectionedReference.args,
    defaultView: "table"
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{f as PlainSchema,p as SectionedReference,m as TableReference,d as TestPlanSchema,h as __namedExportsOrder,u as default};
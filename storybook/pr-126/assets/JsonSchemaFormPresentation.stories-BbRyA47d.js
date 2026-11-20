import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./JsonSchemaForm-CfZuoOr8.js";import{d as a,f as o,i as s,n as c,p as l,r as u,s as d,t as f,u as p}from"./json-schema-form-properties.fixtures-CHU9IEbx.js";var m,h,g;function _(){return(_=e((()=>{d(),m=Object.fromEntries(Object.entries({...o,...u}).filter(([,e])=>!e.readOnly).map(([e,t])=>[e,{title:t.title,anyOf:[t,{type:`null`}]}])),h={...f,properties:{...f.properties,additional:{type:`object`,title:`Additional controls and states`,properties:{color:{type:[`string`,`null`],title:`Color`,format:`color`},stepper:{type:[`number`,`null`],title:`Decimal stepper`,multipleOf:.25,minimum:0,"x-number-display":`stepper`},json:{title:`JSON`,format:`json`},dateOrText:{title:`Date or text`,anyOf:[{type:`string`,title:`Date`,format:`date`},{type:`string`,title:`Text`},{type:`null`}]},patternMap:{type:`object`,title:`Pattern map`,patternProperties:{"^count":{type:`integer`}},additionalProperties:{type:`string`}},disabled:{type:`string`,title:`Disabled`,"x-disabled":!0},secret:{type:`string`,title:`Write only`,writeOnly:!0,format:`password`},required:{type:`string`,title:`Required empty field`},hover:{type:`string`,title:`Hover help`,description:`Help available on focus and hover.`,"x-help-display":`hover`}},required:[`required`]},nullable:{type:`object`,title:`Nullable controls`,properties:m},nullableCollections:{type:`object`,title:`Nullable collections`,properties:{object:{title:`Nullable object`,anyOf:[{type:`object`,properties:{name:{type:`string`,title:`Name`}}},{type:`null`}]},array:{title:`Nullable array`,type:[`array`,`null`],items:{type:`string`}},json:{title:`Nullable JSON`,type:[`object`,`null`],format:`json`}}}}},g={...c,additional:{color:`#336699`,stepper:1.25,json:{enabled:!0,values:[0,!1,null]},dateOrText:`2026-11-07`,patternMap:{countWorkers:3,region:`local`},disabled:`Locked`,secret:`example`,required:``,hover:`Example`},nullable:{...l,...s,boolean:!1,integer:0},nullableCollections:{object:{name:`Example`},array:[`api`],json:{enabled:!0}}}})))()}function v(){let[e,t]=(0,b.useState)({name:`Example`,date:`2026-11-07`,scheduled:null,enabled:!1,amount:0,mode:`auto`,settings:{retries:3}});return(0,x.jsxs)(`div`,{className:`p-4`,children:[(0,x.jsx)(i,{schema:S,value:e,onChange:t,inline:!0,size:`sm`,requiredFirst:!0,showTypeIcons:!0,objectDisplay:`accordion`,applyDefaults:!1,persistPreferences:!1}),(0,x.jsx)(`pre`,{className:`mt-4 overflow-auto text-xs`,children:JSON.stringify(e,null,2)})]})}function y(e){let[t,n]=(0,b.useState)(g);return(0,x.jsxs)(`div`,{className:`p-4`,children:[(0,x.jsx)(i,{...e,schema:h,value:t,onChange:n,pre:[a],lookupFetcher:p,applyDefaults:!1,persistPreferences:!1}),(0,x.jsx)(`pre`,{className:`mt-4 overflow-auto text-xs`,children:JSON.stringify(t,null,2)})]})}var b,x,S,C,w,T,E;function D(){return(D=e((()=>{b=t(),r(),_(),d(),x=n(),S={type:`object`,properties:{name:{type:[`string`,`null`],title:`Name`},date:{anyOf:[{type:`string`,format:`date`},{type:`null`}],title:`Date`},scheduled:{type:[`string`,`null`],format:`date-time`,title:`Scheduled at`},enabled:{type:[`boolean`,`null`],title:`Enabled`},amount:{type:[`number`,`null`],title:`Amount`,minimum:0},mode:{anyOf:[{type:`string`,enum:[`auto`,`manual`]},{type:`null`}],title:`Mode`},settings:{type:`object`,title:`Settings`,properties:{retries:{type:`integer`,title:`Retries`}}}},required:[`name`]},C={title:`Forms/JsonSchemaForm/Presentation`,component:i,parameters:{layout:`fullscreen`}},w={render:()=>(0,x.jsx)(v,{})},T={args:{size:`sm`,inline:!0,requiredFirst:!0,showTypeIcons:!0,objectDisplay:`accordion`,readOnly:!1},argTypes:{size:{control:`select`,options:[`xs`,`sm`,`md`,`lg`,`xl`]},objectDisplay:{control:`select`,options:[`flat`,`accordion`]},inline:{control:`boolean`},readOnly:{control:`boolean`},showTypeIcons:{control:`boolean`},requiredFirst:{control:`boolean`}},render:e=>(0,x.jsx)(y,{...e})},E=[`Compact`,`AllFieldTypes`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Example />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm",
    inline: true,
    requiredFirst: true,
    showTypeIcons: true,
    objectDisplay: "accordion",
    readOnly: false
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"]
    },
    objectDisplay: {
      control: "select",
      options: ["flat", "accordion"]
    },
    inline: {
      control: "boolean"
    },
    readOnly: {
      control: "boolean"
    },
    showTypeIcons: {
      control: "boolean"
    },
    requiredFirst: {
      control: "boolean"
    }
  },
  render: args => <FieldCatalog {...args} />
}`,...T.parameters?.docs?.source}}}})))()}D();export{T as AllFieldTypes,w as Compact,E as __namedExportsOrder,C as default};
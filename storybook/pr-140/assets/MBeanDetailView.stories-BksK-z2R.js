import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{i as r,n as i,t as a}from"./MBeanDetailView-DEhEovW1.js";import{a as o,n as s,t as c}from"./mbeans-BNNQVku9.js";function l({canWrite:e,view:t}){let[n,i]=(0,u.useState)(t);return(0,d.jsx)(`div`,{className:`max-w-3xl p-4`,children:(0,d.jsx)(a,{info:c,attributes:r(c,s),view:n,onViewChange:i,canWrite:e,onWriteAttribute:f(async()=>{}),onInvoke:f(async()=>`order 42`),extraTabs:[{id:`host`,label:`Host tab`,content:(0,d.jsx)(`p`,{className:`text-sm`,children:`Host-supplied content for this MBean.`})}]})})}var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{u=t(),o(),i(),d=n(),{fn:f}=__STORYBOOK_MODULE_TEST__,p={title:`JVM/MBeanDetailView`,component:l,args:{canWrite:!0,view:`attributes`}},m={},h={args:{canWrite:!1}},g={args:{view:`operations`}},_={args:{view:`notifications`}},v=[`Writable`,`ReadOnly`,`Operations`,`Notifications`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    canWrite: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    view: "operations"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    view: "notifications"
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{_ as Notifications,g as Operations,h as ReadOnly,m as Writable,v as __namedExportsOrder,p as default};
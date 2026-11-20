import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{a as r,r as i}from"./mbeans-BNNQVku9.js";import{n as a,t as o}from"./MBeanBrowser-DyRZshBq.js";function s({initialFilter:e,initialSelected:t}){let[n,r]=(0,c.useState)(e),[a,s]=(0,c.useState)(t);return(0,l.jsx)(`div`,{className:`h-[480px] w-80 border border-border p-2`,children:(0,l.jsx)(o,{names:i,filter:n,onFilterChange:r,selected:a,onSelect:s})})}var c,l,u,d,f,p,m;function h(){return(h=e((()=>{c=t(),r(),a(),l=n(),u={title:`JVM/MBeanBrowser`,component:s,args:{initialFilter:``,initialSelected:``}},d={},f={args:{initialFilter:`Catalina`}},p={args:{initialSelected:`java.lang:name=G1 Young Generation,type=GarbageCollector`}},m=[`All`,`Filtered`,`RevealSelection`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    initialFilter: "Catalina"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    initialSelected: "java.lang:name=G1 Young Generation,type=GarbageCollector"
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{d as All,f as Filtered,p as RevealSelection,m as __namedExportsOrder,u as default};
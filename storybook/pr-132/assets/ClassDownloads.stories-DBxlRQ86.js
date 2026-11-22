import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./ClassDownloads-rJigAsZs.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),{expect:r,within:i}=__STORYBOOK_MODULE_TEST__,a={title:`JVM/ClassDownloads`,component:n,args:{qualifiedName:`com.example.orders.OrderService`,source:`package com.example.orders;

public class OrderService {}
`,loadBytecode:async()=>`yv66vgAAAEEAEQ==`}},o={},s={args:{qualifiedName:``,source:void 0},play:async({canvasElement:e})=>{await r(i(e).getByRole(`button`,{name:`Download .class`})).toBeDisabled()}},c=[`Ready`,`NoClass`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    qualifiedName: "",
    source: undefined
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("button", {
      name: "Download .class"
    })).toBeDisabled();
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{s as NoClass,o as Ready,c as __namedExportsOrder,a as default};
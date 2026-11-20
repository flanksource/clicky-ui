import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BeUaZMhY.js";import{n as r,t as i}from"./GcSummary-CjHG52bl.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/GcSummary`,component:i,args:{collectors:t.garbageCollectors}},c={play:async({canvasElement:e})=>{await a(o(e).getByText(`1842 · 21.3 s`)).toBeInTheDocument()}},l={args:{collectors:[]}},u=[`Collectors`,`None`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("1842 · 21.3 s")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    collectors: []
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as Collectors,l as None,u as __namedExportsOrder,s as default};
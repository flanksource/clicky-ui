import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BeUaZMhY.js";import{n as r,t as i}from"./PoolMetricsTable-CmBYNylG.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/PoolMetricsTable`,component:i,args:{label:`Server connectors`,pools:t.connectors}},c={play:async({canvasElement:e})=>{await a(o(e).getByText(`37`)).toBeInTheDocument()}},l={args:{label:`Data sources`,pools:t.dataSources}},u=[`Connectors`,`DataSources`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("37")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Data sources",
    pools: METRICS.dataSources
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as Connectors,l as DataSources,u as __namedExportsOrder,s as default};
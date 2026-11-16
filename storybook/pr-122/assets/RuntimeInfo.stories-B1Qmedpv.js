import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BeUaZMhY.js";import{n as r,t as i}from"./RuntimeInfo-BeOyt_ZJ.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/RuntimeInfo`,component:i,args:{runtime:t.runtime}},c={play:async({canvasElement:e})=>{await a(o(e).getByText(`21.0.5`)).toBeInTheDocument()}},l={args:{runtime:{...t.runtime,systemLoadAverage:-1}}},u=[`Info`,`LoadUnavailable`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("21.0.5")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    runtime: {
      ...METRICS.runtime,
      systemLoadAverage: -1
    }
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as Info,l as LoadUnavailable,u as __namedExportsOrder,s as default};
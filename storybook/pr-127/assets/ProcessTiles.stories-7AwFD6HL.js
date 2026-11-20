import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BeUaZMhY.js";import{n as r,t as i}from"./ProcessTiles-CeQ31Ef3.js";var a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/ProcessTiles`,component:i,args:{metrics:t}},c={play:async({canvasElement:e})=>{await a(o(e).getByText(`37.5%`)).toBeInTheDocument()}},l={args:{metrics:{...t,processCpuPercent:96,runtime:{...t.runtime,systemLoadAverage:9}}}},u={args:{metrics:{...t,processCpuPercent:null,runtime:{...t.runtime,systemLoadAverage:-1}}}},d=[`Normal`,`Saturated`,`Unavailable`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("37.5%")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: {
      ...METRICS,
      processCpuPercent: 96,
      runtime: {
        ...METRICS.runtime,
        systemLoadAverage: 9
      }
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: {
      ...METRICS,
      processCpuPercent: null,
      runtime: {
        ...METRICS.runtime,
        systemLoadAverage: -1
      }
    }
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{c as Normal,l as Saturated,u as Unavailable,d as __namedExportsOrder,s as default};
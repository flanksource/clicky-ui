import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BeUaZMhY.js";import{n as r,t as i}from"./MemoryPools-Bmaacg7r.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/MemoryPools`,component:i,parameters:{layout:`padded`},args:{memory:t.memory}},c={play:async({canvasElement:e})=>{await a(o(e).getByText(`182 MB / 256 MB committed · no max`)).toBeInTheDocument()}},l={args:{memory:{heap:[{name:`G1 Old Gen`,type:`HEAP`,used:1027604480,committed:1073741824,max:1073741824}],nonHeap:[],buffer:[]}}},u=[`Pools`,`NearlyFull`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("182 MB / 256 MB committed · no max")).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    memory: {
      heap: [{
        name: "G1 Old Gen",
        type: "HEAP",
        used: 980 * 1024 * 1024,
        committed: 1024 * 1024 * 1024,
        max: 1024 * 1024 * 1024
      }],
      nonHeap: [],
      buffer: []
    }
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{l as NearlyFull,c as Pools,u as __namedExportsOrder,s as default};
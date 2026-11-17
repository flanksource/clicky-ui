import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./RegisterSummary-B3nClsyb.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),{expect:r,within:i}=__STORYBOOK_MODULE_TEST__,a={title:`JVM/RegisterSummary`,component:n,args:{summary:{patched:3,stale:2,unleased:1}}},o={play:async({canvasElement:e})=>{await r(i(e).getByText(`1 without a lease`)).toBeInTheDocument()}},s={args:{summary:{patched:1,stale:0,unleased:0}}},c=[`NeedsAttention`,`Clean`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("1 without a lease")).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    summary: {
      patched: 1,
      stale: 0,
      unleased: 0
    }
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{s as Clean,o as NeedsAttention,c as __namedExportsOrder,a as default};
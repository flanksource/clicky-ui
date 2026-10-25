import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./fixtures-DQ4-m9zu.js";import{n as i,t as a}from"./TraceHarView-Oi0gIN9k.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{r(),i(),o=t(),{expect:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`Data/Traces/TraceHarView`,component:a,parameters:{docs:{description:{component:"`http` / `http_proxy` trace records rendered by the shared HarPanel. JSON bodies the store parsed into structure are shown as JSON, a transport error renders as ERR, and a tunnelled CONNECT shows the bytes that crossed it where a body would be."}}}},u={render:()=>(0,o.jsx)(`div`,{className:`h-[480px] rounded-md border border-border`,children:(0,o.jsx)(a,{rows:n})}),play:async({canvasElement:e})=>{let t=c(e);await s(await t.findByText(`registry.example.com:443`)).toBeInTheDocument(),await s(t.getByText(`ERR`)).toBeInTheDocument()}},d={render:()=>(0,o.jsx)(a,{rows:[]})},f=[`Exchanges`,`Empty`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[480px] rounded-md border border-border">
      <TraceHarView rows={httpExchangeRows} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("registry.example.com:443")).toBeInTheDocument();
    await expect(canvas.getByText("ERR")).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <TraceHarView rows={[]} />
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as Empty,u as Exchanges,f as __namedExportsOrder,l as default};
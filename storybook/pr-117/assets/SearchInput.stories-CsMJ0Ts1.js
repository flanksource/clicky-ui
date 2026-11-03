import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./SearchInput-mnDqsDHB.js";function a(e){let[t,n]=(0,o.useState)(``);return(0,s.jsx)(`div`,{style:{width:440},children:(0,s.jsx)(i,{value:t,onChange:n,placeholder:e.placeholder??`Search pull requests, branches, #id…`,shortcut:e.shortcut})})}var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Components/SearchInput`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"Search field with a leading magnifier and an optional trailing `⌘K` keyboard hint (the Gavel app-bar search). Controlled."}}}},f={render:()=>(0,s.jsx)(a,{})},p={render:()=>(0,s.jsx)(a,{shortcut:null})},m={render:()=>(0,s.jsx)(a,{}),play:async({canvasElement:e,step:t})=>{let n=u(e).getByRole(`searchbox`);await t(`typing updates the controlled value`,async()=>{await l.type(n,`faro`),await c(n).toHaveValue(`faro`)})}},h=[`Default`,`NoShortcut`,`Typing`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Demo shortcut={null} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox");
    await step("typing updates the controlled value", async () => {
      await userEvent.type(input, "faro");
      await expect(input).toHaveValue("faro");
    });
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{f as Default,p as NoShortcut,m as Typing,h as __namedExportsOrder,d as default};
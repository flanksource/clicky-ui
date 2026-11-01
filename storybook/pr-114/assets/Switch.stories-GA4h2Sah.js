import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Switch-C8CMOSD_.js";function a({label:e}){let[t,n]=(0,o.useState)(!1);return(0,s.jsx)(i,{checked:t,onChange:n,label:e,"aria-label":e?void 0:`Toggle`})}var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Components/Switch`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:'On/off toggle switch (`role="switch"`). Density-aware — the track and knob scale with the active density.'}}}},f={render:()=>(0,s.jsx)(a,{})},p={render:()=>(0,s.jsx)(a,{label:`Dark mode`})},m={render:()=>(0,s.jsx)(i,{checked:!0,onChange:()=>{},disabled:!0,"aria-label":`Locked`})},h={render:()=>(0,s.jsx)(a,{label:`Notifications`}),play:async({canvasElement:e,step:t})=>{let n=u(e).getByRole(`switch`);await t(`starts off`,async()=>{await c(n).toHaveAttribute(`aria-checked`,`false`)}),await t(`clicking flips it on`,async()=>{await l.click(n),await c(n).toHaveAttribute(`aria-checked`,`true`)})}},g=[`Default`,`WithLabel`,`Disabled`,`Toggles`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Demo label="Dark mode" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Switch checked onChange={() => {}} disabled aria-label="Locked" />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Demo label="Notifications" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await step("starts off", async () => {
      await expect(sw).toHaveAttribute("aria-checked", "false");
    });
    await step("clicking flips it on", async () => {
      await userEvent.click(sw);
      await expect(sw).toHaveAttribute("aria-checked", "true");
    });
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{f as Default,m as Disabled,h as Toggles,p as WithLabel,g as __namedExportsOrder,d as default};
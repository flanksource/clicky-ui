import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Checkbox-B0tSclZj.js";function a({label:e}){let[t,n]=(0,o.useState)(!1);return(0,s.jsx)(i,{checked:t,onChange:n,...e?{label:e}:{"aria-label":`Select item`}})}var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Components/Checkbox`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"Native, accessible checkbox styled like `ListMenu`'s row checkboxes. Controlled: `checked` + `onChange(next)`. Name it with a visible `label` or `aria-label`."}}}},f={args:{checked:!1,onChange:()=>{}},render:()=>(0,s.jsx)(a,{})},p={args:{checked:!1,onChange:()=>{}},render:()=>(0,s.jsx)(a,{label:`Include drafts`})},m={args:{checked:!0,onChange:()=>{},disabled:!0,"aria-label":`Locked`}},h={args:{checked:!1,onChange:()=>{}},render:()=>(0,s.jsx)(a,{label:`Notify me`}),play:async({canvasElement:e,step:t})=>{let n=u(e).getByRole(`checkbox`,{name:`Notify me`});await t(`starts unchecked`,async()=>{await c(n).not.toBeChecked()}),await t(`clicking the label checks it`,async()=>{await l.click(u(e).getByText(`Notify me`)),await c(n).toBeChecked()})}},g=[`Default`,`WithLabel`,`Disabled`,`Toggles`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    onChange: () => {}
  },
  render: () => <Demo />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    onChange: () => {}
  },
  render: () => <Demo label="Include drafts" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    checked: true,
    onChange: () => {},
    disabled: true,
    "aria-label": "Locked"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    onChange: () => {}
  },
  render: () => <Demo label="Notify me" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const box = within(canvasElement).getByRole("checkbox", {
      name: "Notify me"
    });
    await step("starts unchecked", async () => {
      await expect(box).not.toBeChecked();
    });
    await step("clicking the label checks it", async () => {
      await userEvent.click(within(canvasElement).getByText("Notify me"));
      await expect(box).toBeChecked();
    });
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{f as Default,m as Disabled,h as Toggles,p as WithLabel,g as __namedExportsOrder,d as default};
import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,ni as i}from"./icons-Dd_HwYAK.js";import{n as a,t as o}from"./SegmentedControl-CiAptJef.js";function s({size:e}){let[t,n]=(0,c.useState)(`all`);return(0,l.jsx)(o,{"aria-label":`Scope`,value:t,onChange:n,options:m,size:e})}var c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{c=t(),a(),r(),l=n(),{expect:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p={title:`Components/SegmentedControl`,component:o,tags:[`autodocs`],parameters:{docs:{description:{component:"Single-select toggle group (the Gavel `Segmented` Mine / All / Bots pattern). Built on clicky density + theme tokens; keyboard-navigable with arrow keys."}}}},m=[{id:`me`,label:`Mine`},{id:`all`,label:`All`},{id:`bots`,label:`Bots`,icon:i}],h={render:()=>(0,l.jsx)(s,{})},g={render:()=>(0,l.jsx)(s,{size:`sm`})},_={render:()=>{let[e,t]=(0,c.useState)(`day`);return(0,l.jsx)(o,{"aria-label":`Range`,value:e,onChange:t,options:[{id:`hour`,label:`Hour`},{id:`day`,label:`Day`},{id:`week`,label:`Week`,disabled:!0}]})}},v={render:()=>(0,l.jsx)(s,{}),play:async({canvasElement:e,step:t})=>{let n=f(e),r=n.getByRole(`radio`,{name:`All`}),i=n.getByRole(`radio`,{name:`Mine`});await t(`default selection is reflected via aria-checked`,async()=>{await u(r).toHaveAttribute(`aria-checked`,`true`),await u(i).toHaveAttribute(`aria-checked`,`false`)}),await t(`clicking a segment selects it`,async()=>{await d.click(i),await u(i).toHaveAttribute(`aria-checked`,`true`),await u(r).toHaveAttribute(`aria-checked`,`false`)}),await t(`arrow key moves the selection`,async()=>{i.focus(),await d.keyboard(`{ArrowRight}`),await u(r).toHaveAttribute(`aria-checked`,`true`)})}},y=[`Default`,`Small`,`WithDisabledOption`,`SelectAndKeyboard`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Demo size="sm" />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("day");
    return <SegmentedControl aria-label="Range" value={value} onChange={setValue} options={[{
      id: "hour",
      label: "Hour"
    }, {
      id: "day",
      label: "Day"
    }, {
      id: "week",
      label: "Week",
      disabled: true
    }]} />;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("radio", {
      name: "All"
    });
    const mine = canvas.getByRole("radio", {
      name: "Mine"
    });
    await step("default selection is reflected via aria-checked", async () => {
      await expect(all).toHaveAttribute("aria-checked", "true");
      await expect(mine).toHaveAttribute("aria-checked", "false");
    });
    await step("clicking a segment selects it", async () => {
      await userEvent.click(mine);
      await expect(mine).toHaveAttribute("aria-checked", "true");
      await expect(all).toHaveAttribute("aria-checked", "false");
    });
    await step("arrow key moves the selection", async () => {
      mine.focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect(all).toHaveAttribute("aria-checked", "true");
    });
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{h as Default,v as SelectAndKeyboard,g as Small,_ as WithDisabledOption,y as __namedExportsOrder,p as default};
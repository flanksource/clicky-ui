import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./SplitButton-BwO_Bt7e.js";var r,i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Components/SplitButton`,component:n,tags:[`autodocs`],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:`Visual treatment forwarded to both halves.`,control:`select`,options:[`default`,`destructive`,`outline`,`secondary`,`ghost`,`link`]},size:{description:`Size preset forwarded to both halves.`,control:`select`,options:[`default`,`sm`,`lg`]},loading:{description:`Spinner on the primary half.`,control:`boolean`},disabled:{description:`Disable both halves.`,control:`boolean`},primaryDisabled:{description:`Disable only the primary action, leaving the menu reachable.`,control:`boolean`}},args:{label:`Save`,onClick:i(),items:[{label:`Save and close`,onSelect:i()},{label:`Save as draft`,onSelect:i()},{label:`Discard`,onSelect:i()}]}},c={},l={args:{variant:`outline`}},u={args:{loading:!0}},d={args:{primaryDisabled:!0},play:async({args:e,canvasElement:t,step:n})=>{let i=o(t.ownerDocument.body);await n(`the primary half is unavailable`,async()=>{await r(i.getByRole(`button`,{name:`Save`})).toBeDisabled()}),await n(`the menu still opens and its items still fire`,async()=>{await a.click(i.getByRole(`button`,{name:`Open menu`})),await a.click(i.getByRole(`menuitem`,{name:`Save as draft`})),await r(e.items[1].onSelect).toHaveBeenCalledTimes(1)})}},f={play:async({args:e,canvasElement:t,step:n})=>{let i=o(t.ownerDocument.body);await n(`primary click fires the primary handler`,async()=>{await a.click(i.getByRole(`button`,{name:`Save`})),await r(e.onClick).toHaveBeenCalledTimes(1)}),await n(`chevron opens the menu and selection fires the item handler`,async()=>{await a.click(i.getByRole(`button`,{name:`Open menu`})),await a.click(i.getByRole(`menuitem`,{name:`Save and close`})),await r(e.items[0].onSelect).toHaveBeenCalledTimes(1)})}},p=[`Default`,`Outline`,`Loading`,`PrimaryDisabled`,`MenuInteraction`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    primaryDisabled: true
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await step("the primary half is unavailable", async () => {
      await expect(canvas.getByRole("button", {
        name: "Save"
      })).toBeDisabled();
    });
    await step("the menu still opens and its items still fire", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open menu"
      }));
      await userEvent.click(canvas.getByRole("menuitem", {
        name: "Save as draft"
      }));
      await expect(args.items[1].onSelect).toHaveBeenCalledTimes(1);
    });
  }
}`,...d.parameters?.docs?.source},description:{story:`The default action does not apply right now, but the secondary ones still do.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
    await step("primary click fires the primary handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Save"
      }));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    await step("chevron opens the menu and selection fires the item handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open menu"
      }));
      await userEvent.click(canvas.getByRole("menuitem", {
        name: "Save and close"
      }));
      await expect(args.items[0].onSelect).toHaveBeenCalledTimes(1);
    });
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{c as Default,u as Loading,f as MenuInteraction,l as Outline,d as PrimaryDisabled,p as __namedExportsOrder,s as default};
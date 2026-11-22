import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./SplitButton-DPAnX906.js";var r,i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Components/SplitButton`,component:n,tags:[`autodocs`],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:`Visual treatment forwarded to both halves.`,control:`select`,options:[`default`,`destructive`,`outline`,`secondary`,`ghost`,`link`]},size:{description:`Size preset forwarded to both halves.`,control:`select`,options:[`default`,`xs`,`sm`,`lg`]},loading:{description:`Spinner on the primary half.`,control:`boolean`},disabled:{description:`Disable both halves.`,control:`boolean`},primaryDisabled:{description:`Disable only the primary action, leaving the menu reachable.`,control:`boolean`}},args:{label:`Save`,onClick:i(),items:[{label:`Save and close`,onSelect:i()},{label:`Save as draft`,onSelect:i()},{label:`Discard`,onSelect:i()}]}},c={},l={args:{size:`xs`},parameters:{docs:{description:{story:`The 24px compact preset keeps the primary action and chevron aligned in dense toolbars. Use size="xs" rather than applying height or padding to the wrapper.`}}}},u={args:{variant:`outline`}},d={args:{loading:!0}},f={args:{primaryDisabled:!0},play:async({args:e,canvasElement:t,step:n})=>{let i=o(t.ownerDocument.body);await n(`the primary half is unavailable`,async()=>{await r(i.getByRole(`button`,{name:`Save`})).toBeDisabled()}),await n(`the menu still opens and its items still fire`,async()=>{await a.click(i.getByRole(`button`,{name:`Open menu`})),await a.click(i.getByRole(`menuitem`,{name:`Save as draft`})),await r(e.items[1].onSelect).toHaveBeenCalledTimes(1)})}},p={play:async({args:e,canvasElement:t,step:n})=>{let i=o(t.ownerDocument.body);await n(`primary click fires the primary handler`,async()=>{await a.click(i.getByRole(`button`,{name:`Save`})),await r(e.onClick).toHaveBeenCalledTimes(1)}),await n(`chevron opens the menu and selection fires the item handler`,async()=>{await a.click(i.getByRole(`button`,{name:`Open menu`})),await a.click(i.getByRole(`menuitem`,{name:`Save and close`})),await r(e.items[0].onSelect).toHaveBeenCalledTimes(1)})}},m=[`Default`,`Compact`,`Outline`,`Loading`,`PrimaryDisabled`,`MenuInteraction`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "xs"
  },
  parameters: {
    docs: {
      description: {
        story: 'The 24px compact preset keeps the primary action and chevron aligned in dense toolbars. Use size="xs" rather than applying height or padding to the wrapper.'
      }
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`The default action does not apply right now, but the secondary ones still do.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}}})))()}h();export{l as Compact,c as Default,d as Loading,p as MenuInteraction,u as Outline,f as PrimaryDisabled,m as __namedExportsOrder,s as default};
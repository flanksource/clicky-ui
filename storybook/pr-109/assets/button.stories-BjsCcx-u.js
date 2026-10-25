import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./button-DpHOAHuo.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{n(),i=t(),{expect:a,fn:o,userEvent:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`Components/Button`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Primary command button with Clicky density tokens, shadcn-style variants, optional loading state, and Radix Slot support via `asChild`."}}},argTypes:{variant:{description:`Visual treatment for the command.`,control:`select`,options:[`default`,`destructive`,`outline`,`secondary`,`ghost`,`link`]},size:{description:"Button size preset. `icon` creates a square icon-only button.",control:`select`,options:[`default`,`sm`,`lg`,`icon`]},disabled:{description:`Disable pointer and keyboard activation.`,control:`boolean`},loading:{description:`Show spinner and disable the button while pending.`,control:`boolean`},loadingLabel:{description:"Content shown while loading; defaults to `children`."},asChild:{description:`Render styles onto the child element with Radix Slot.`},onClick:{description:`Click handler.`,action:`click`}},args:{children:`Button`,onClick:o()}},u={},d={args:{variant:`destructive`}},f={args:{variant:`outline`}},p={args:{variant:`secondary`}},m={args:{variant:`ghost`}},h={args:{variant:`link`}},g={render:e=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,alignItems:`center`},children:[(0,i.jsx)(r,{...e,size:`sm`,children:`Small`}),(0,i.jsx)(r,{...e,size:`default`,children:`Default`}),(0,i.jsx)(r,{...e,size:`lg`,children:`Large`})]})},_={args:{disabled:!0}},v={args:{loading:!0,children:`Saving`}},y={args:{children:`Click me`},play:async({args:e,canvasElement:t,step:n})=>{let r=c(t).getByRole(`button`,{name:/click me/i});await n(`button is focusable via keyboard`,async()=>{r.focus(),await a(r).toHaveFocus()}),await n(`click fires the handler`,async()=>{await s.click(r),await a(e.onClick).toHaveBeenCalledTimes(1)})}},b=[`Default`,`Destructive`,`Outline`,`Secondary`,`Ghost`,`Link`,`Sizes`,`Disabled`,`Loading`,`ClickInteraction`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ghost"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "link"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: "flex",
    gap: "0.5rem",
    alignItems: "center"
  }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: "Saving"
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Click me"
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", {
      name: /click me/i
    });
    await step("button is focusable via keyboard", async () => {
      btn.focus();
      await expect(btn).toHaveFocus();
    });
    await step("click fires the handler", async () => {
      await userEvent.click(btn);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{y as ClickInteraction,u as Default,d as Destructive,_ as Disabled,m as Ghost,h as Link,v as Loading,f as Outline,p as Secondary,g as Sizes,b as __namedExportsOrder,l as default};
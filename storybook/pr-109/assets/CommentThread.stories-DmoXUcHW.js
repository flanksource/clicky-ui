import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{i as n,n as r,r as i,t as a}from"./comment-fixtures-SFhthxx6.js";import{n as o,t as s}from"./CommentThread-BZcI_r7m.js";function c({autoFocusComposer:e=!1}){let{comments:t,callbacks:a}=n(r);return(0,l.jsx)(`div`,{className:`max-w-xl`,children:(0,l.jsx)(s,{comments:t,config:i,autoFocusComposer:e,...a})})}var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{o(),a(),l=t(),{expect:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p={title:`Comments/CommentThread`,component:s,parameters:{layout:`padded`},tags:[`autodocs`]},m={render:()=>(0,l.jsx)(c,{})},h={render:()=>(0,l.jsx)(c,{autoFocusComposer:!0}),play:async({canvasElement:e})=>{let t=await f(e).findByTestId(`comment-compose-input`);await d.click(t),await d.type(t,`Looks good @cl`);let n=await f(document.body).findByTestId(`mention-popover`);await u(n).toBeInTheDocument();let r=await f(n).findByRole(`option`,{name:/claude/});await d.click(r),await u(t.value).toContain(`@claude`)}},g=[`Default`,`WithMentionAutocomplete`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Demo autoFocusComposer />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("comment-compose-input");
    await userEvent.click(input);
    await userEvent.type(input, "Looks good @cl");
    // The mention popover is portaled to document.body.
    const popover = await within(document.body).findByTestId("mention-popover");
    await expect(popover).toBeInTheDocument();
    const option = await within(popover).findByRole("option", {
      name: /claude/
    });
    await userEvent.click(option);
    await expect((input as HTMLTextAreaElement).value).toContain("@claude");
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Default,h as WithMentionAutocomplete,g as __namedExportsOrder,p as default};
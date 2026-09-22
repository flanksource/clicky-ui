import{j as n}from"./iframe-BTxADGbc.js";import{C as f}from"./CommentThread-DuxnVQvM.js";import{u as T,a as h,s as C}from"./comment-fixtures-CHGUtEb7.js";import"./preload-helper-95TtevsV.js";import"./utils-DW-IJACk.js";import"./Icon-DyQmy9zD.js";import"./DropdownMenu-CfcxM9h_.js";import"./floating-ui.react-s2gbsc2n.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./button-uOKQbD2U.js";import"./index-CPURVhFy.js";import"./loading-ZXW1-FyE.js";import"./DropdownMenuSubmenu-WTMYamx5.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-qKwEzh9R.js";import"./clipboard-Bsp9EznU.js";import"./Markdown-C8cp-WZg.js";import"./Callout-DNhpACdz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DralUSHB.js";import"./CodeDiff-Md3mH8qB.js";import"./SegmentedControl-Cb6p-V2x.js";import"./HighlightedTokens-DoVhJSb4.js";import"./JsonView-CF7nUUT6.js";import"./Tabs-DRh6B_nu.js";import"./TabButton-UcJujHLP.js";import"./Modal-BJSsoZSJ.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BW1MjSH_.js";import"./HoverCard-Cms3aoCY.js";import"./Badge-8t6xVVQj.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...(d=(u=t.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var l,w,v;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const eo=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,eo as __namedExportsOrder,to as default};

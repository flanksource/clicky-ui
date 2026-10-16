import{j as n}from"./iframe-BUpmsD4_.js";import{C as f}from"./CommentThread-DwkMrvaE.js";import{u as T,a as h,s as C}from"./comment-fixtures-CTwnsr9Q.js";import"./preload-helper-PGaPgbNH.js";import"./utils-DW-IJACk.js";import"./Icon-DTAROQQs.js";import"./DropdownMenu-LyJi-wEU.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./loading-BVCwDMQn.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-D0uNB6Wn.js";import"./clipboard-CryKTeQj.js";import"./Markdown-BokWMc1j.js";import"./Callout-OZ7alDbm.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-8BACWTJZ.js";import"./CodeDiff-B_c0QWKI.js";import"./SegmentedControl-BzAaXjE5.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-COW0RLrn.js";import"./TabButton-DQklQpgZ.js";import"./Modal-D_AIawBk.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BUN3vvjX.js";import"./HoverCard-CJMlbbGv.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,mo={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const po=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,po as __namedExportsOrder,mo as default};

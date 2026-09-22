import{j as n}from"./iframe-DyL4RmGG.js";import{C as f}from"./CommentThread-B0dhctg8.js";import{u as T,a as h,s as C}from"./comment-fixtures-jfIKvZlB.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-COVZwsWL.js";import"./DropdownMenu-BUAttuFQ.js";import"./floating-ui.react-D_VnvmSA.js";import"./index-MomY5yw3.js";import"./index-BKFNVha0.js";import"./button-BTOItCTV.js";import"./index-CPURVhFy.js";import"./loading-BIPMexql.js";import"./DropdownMenuSubmenu-D9QpaiqI.js";import"./modalStack-CzjsIGEp.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-ovAaxTR8.js";import"./clipboard-CWSx5JJa.js";import"./Markdown-Ct3ryw68.js";import"./Callout-DOO0SxYQ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-D4_Ksmg1.js";import"./CodeDiff-1daKgTMf.js";import"./SegmentedControl-CkXrgfJk.js";import"./HighlightedTokens-H9zsTVBN.js";import"./JsonView-DhsCquBn.js";import"./Tabs-Bbs9i_ES.js";import"./TabButton-BtHflRDJ.js";import"./Modal-D7h-gNLF.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-D-lpbN2V.js";import"./HoverCard-BfwUXTN4.js";import"./Badge-CuymrnrW.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

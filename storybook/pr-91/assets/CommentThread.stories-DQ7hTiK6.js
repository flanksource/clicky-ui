import{j as n}from"./iframe-DxH86FBA.js";import{C as f}from"./CommentThread-BzAJ0Sx3.js";import{u as T,a as h,s as C}from"./comment-fixtures-s3c6xxVH.js";import"./preload-helper-CwXsRPHT.js";import"./utils-DW-IJACk.js";import"./Icon-w2YOVKhv.js";import"./DropdownMenu-D1hlo_Nj.js";import"./floating-ui.react-DSfQFonv.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./DropdownMenuSubmenu-t2kTmtnY.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BX9zdOPN.js";import"./clipboard-CPebNZZE.js";import"./Markdown-DN46MpBL.js";import"./Callout-BCbp8nOy.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DPXYBExk.js";import"./CodeDiff-D61IJrGu.js";import"./SegmentedControl-DLtJY0HA.js";import"./HighlightedTokens-DNniJjSO.js";import"./JsonView-GcXUgX4X.js";import"./Tabs-vMUl7RKt.js";import"./TabButton-SH496z5C.js";import"./Modal-i45K_l92.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Dwne1lIh.js";import"./HoverCard-BGftSBK_.js";import"./Badge-ul0vb2Pp.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

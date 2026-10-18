import{j as n}from"./iframe-CKgGkAV6.js";import{C as f}from"./CommentThread-6bZ2o9-3.js";import{u as T,a as h,s as C}from"./comment-fixtures-CkBQ03tG.js";import"./preload-helper-D6IOlyYr.js";import"./utils-DW-IJACk.js";import"./Icon-zT9BHEU_.js";import"./DropdownMenu-BmZ28lfR.js";import"./floating-ui.react-DvrmiGRg.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./loading-CVVM6inm.js";import"./DropdownMenuSubmenu-j0TnzvxK.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-C4yosIsq.js";import"./clipboard-CgM_kuFe.js";import"./Markdown-quaQmCoJ.js";import"./Callout-CoJdVJX9.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BLqJHOcq.js";import"./CodeDiff-CUQ4nb-v.js";import"./SegmentedControl-DpwJjHzq.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BWRQ-hT_.js";import"./HighlightedTokens-Dei84GlG.js";import"./JsonView-CkPnotjI.js";import"./AccordionList-5bOCqJVe.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DNVG-Ar4.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-lpdPBOYL.js";import"./TabButton-DxdiiDJK.js";import"./Modal-CyMxnyK7.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-i1Or3hqr.js";import"./HoverCard-D6AhenUg.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,mo={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

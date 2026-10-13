import{j as n}from"./iframe-BItsxAjD.js";import{C as f}from"./CommentThread-CMUWFAtm.js";import{u as T,a as h,s as C}from"./comment-fixtures-DJhv_iu0.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-Dq8eEpLP.js";import"./DropdownMenu-D3oVIRg_.js";import"./floating-ui.react-CNVnZXsN.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./button-25dF40vQ.js";import"./index-CPURVhFy.js";import"./loading-BOeFbzh-.js";import"./DropdownMenuSubmenu-C4lOloCs.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Dl9lvO_k.js";import"./clipboard-CvmOL5Gm.js";import"./Markdown-DLCNs_K4.js";import"./Callout-CV_TgMao.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BiU00fp_.js";import"./CodeDiff-DMKkLlC0.js";import"./SegmentedControl-B1BHyTOC.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-kfpOc-CU.js";import"./JsonView-CWGyot2w.js";import"./AccordionList-B60ONwgr.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-B4WuduE9.js";import"./Tabs-CWWZajIQ.js";import"./TabButton-L-L03UjT.js";import"./Modal-D259elha.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-KG0T8Eml.js";import"./HoverCard-BRPRrgTD.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ro={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const mo=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,mo as __namedExportsOrder,ro as default};

import{j as n}from"./iframe-BpsZ2AnK.js";import{C as f}from"./CommentThread-D6hIbHi0.js";import{u as T,a as h,s as C}from"./comment-fixtures-C96oTejA.js";import"./preload-helper-MsDOuF3K.js";import"./utils-DW-IJACk.js";import"./Icon-nPi6h081.js";import"./DropdownMenu-BbLBG52q.js";import"./floating-ui.react-B4WvYE6p.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./DropdownMenuSubmenu-bIAIsBPN.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Dr4cWoAr.js";import"./clipboard-Biao7_zQ.js";import"./Markdown-CMko-UvP.js";import"./Callout-DkPg7bHY.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CrYxM6ZO.js";import"./CodeDiff-BGrQjjUl.js";import"./SegmentedControl-BUwYYoDm.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-CTIWcVCe.js";import"./HighlightedTokens-DtZaJN20.js";import"./JsonView-Bc5NK7ov.js";import"./AccordionList-C_UQ-gQM.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-BhgW6CWk.js";import"./TabButton-B6Oftv0m.js";import"./Modal--V1JkUP_.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CSjM9Vp7.js";import"./HoverCard-BgdB6aXQ.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,mo={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

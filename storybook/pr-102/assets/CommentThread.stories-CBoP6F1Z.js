import{j as n}from"./iframe-DP177qYv.js";import{C as f}from"./CommentThread-CjWRVjYD.js";import{u as T,a as h,s as C}from"./comment-fixtures-CmrWxn44.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-CVZO3WAG.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-dWeT0rMI.js";import"./clipboard-D4jVhxkO.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./SegmentedControl-CmQrpni4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./Tabs-Cm3rZY0N.js";import"./TabButton-Dz7JW7p1.js";import"./Modal-BWAlqUsR.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-6KVshXmP.js";import"./HoverCard-k2Xsc41N.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ro={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-DeBYCw4x.js";import{C as f}from"./CommentThread-vwhSVo8x.js";import{u as T,a as h,s as C}from"./comment-fixtures-DCOivi4Z.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-CGwyQOB1.js";import"./DropdownMenu-CuKG9hF1.js";import"./floating-ui.react-CJIncd7i.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./button-DB9m7UYN.js";import"./index-CPURVhFy.js";import"./loading-ho48Z2wq.js";import"./DropdownMenuSubmenu-BoEIYSWu.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-C8wLb59A.js";import"./clipboard-BK64mKRW.js";import"./Markdown-BiknAm-q.js";import"./Callout-DoO2BLrl.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-dTiR47dd.js";import"./CodeDiff-BRl1lE7u.js";import"./SegmentedControl-x-wxcPhD.js";import"./HighlightedTokens-Cwnl1Dqa.js";import"./JsonView--QZM-KTF.js";import"./Tabs-BF6qMCjm.js";import"./TabButton-hbgiyllR.js";import"./Modal-DKr8ZZ_E.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-D0xSpa_e.js";import"./HoverCard-DMwhGn2K.js";import"./Badge-vEaYC1aM.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

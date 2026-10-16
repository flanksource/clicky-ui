import{j as n}from"./iframe-bSdY4VSM.js";import{C as f}from"./CommentThread-BFq5urrR.js";import{u as T,a as h,s as C}from"./comment-fixtures-B9bvl8qs.js";import"./preload-helper-BBRSUrHX.js";import"./utils-DW-IJACk.js";import"./Icon-a8_JJTRy.js";import"./DropdownMenu-B1tJ_OJ0.js";import"./floating-ui.react-BVimmY-p.js";import"./index-qiGgzLbL.js";import"./index-C1RppemT.js";import"./button-Cxa_VEHI.js";import"./index-CPURVhFy.js";import"./loading-DatIFuv1.js";import"./DropdownMenuSubmenu-CPJ_qk78.js";import"./modalStack-BcOP8sXO.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B5hA2sOX.js";import"./clipboard-CI8bid4t.js";import"./Markdown-Dz87PD38.js";import"./Callout-CqyXcc2g.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-D39N8RJm.js";import"./CodeDiff-UlAbHhaJ.js";import"./SegmentedControl-DCXKfMBz.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-DuEWhsUM.js";import"./JsonView-8YTA5m7Q.js";import"./AccordionList-DWjw4rR4.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-Bxewb1oq.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-BP30CeUX.js";import"./TabButton-DsdoleWj.js";import"./Modal-j0TiIO3T.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-P9zBYHrP.js";import"./HoverCard-ByHwbgrO.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,mo={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

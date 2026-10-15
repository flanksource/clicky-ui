import{j as n}from"./iframe-DgmZMBKH.js";import{C as f}from"./CommentThread-DtrHVZAx.js";import{u as T,a as h,s as C}from"./comment-fixtures-DkPzoEzr.js";import"./preload-helper-BBRSUrHX.js";import"./utils-DW-IJACk.js";import"./Icon-COMQMXZj.js";import"./DropdownMenu-gsWLznB7.js";import"./floating-ui.react-C3ET48Mi.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-DSsiDBz_.js";import"./clipboard-A05mO3vL.js";import"./Markdown-wrI770uP.js";import"./Callout-ohERSZFi.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-C3Pf8vEa.js";import"./CodeDiff-BTioSQ_u.js";import"./SegmentedControl-5L49tJPa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-C-qCgi-g.js";import"./JsonView-PTiSkJw0.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-B_eL45v7.js";import"./TabButton-1FqKlgPf.js";import"./Modal-CHXTJS63.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-C_zRoyim.js";import"./HoverCard-D9JAxC3e.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,mo={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

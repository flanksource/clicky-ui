import{j as n}from"./iframe-Cxdv9pi7.js";import{C as f}from"./CommentThread-BrIcmLOi.js";import{u as T,a as h,s as C}from"./comment-fixtures-CzNCBdKD.js";import"./preload-helper-DU1Q6aPJ.js";import"./utils-DW-IJACk.js";import"./Icon-TQmWXc2S.js";import"./DropdownMenu-Cqi-ljGX.js";import"./floating-ui.react-mjp4aH0C.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./button-CDUpBuy9.js";import"./index-CPURVhFy.js";import"./loading-BfmDh766.js";import"./DropdownMenuSubmenu-P1llKkBa.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-JjqrqL86.js";import"./clipboard-6JOHC6jD.js";import"./Markdown-CNfEuncx.js";import"./Callout-BNlgjsvn.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-COdx_xEw.js";import"./CodeDiff-B_kUey21.js";import"./SegmentedControl-hhBGtqdI.js";import"./HighlightedTokens-DBaNk6YB.js";import"./JsonView-Ds_lvjLt.js";import"./Tabs-DofXiJ7e.js";import"./TabButton-Bss_KibQ.js";import"./Modal-Kx8XoI2v.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DJ5J1sDv.js";import"./HoverCard-89Zdu8CL.js";import"./Badge-DvE9OLG-.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

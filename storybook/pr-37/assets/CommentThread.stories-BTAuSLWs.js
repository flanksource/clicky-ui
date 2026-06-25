import{j as n}from"./iframe-BZbOQtFx.js";import{C as f}from"./CommentThread-DBq0MoaL.js";import{u as T,a as h,s as C}from"./comment-fixtures-uMogW2oN.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-rviauDIl.js";import"./DropdownMenu-Z8JXEYiP.js";import"./floating-ui.react-o04l4swZ.js";import"./index-DqaOm_H7.js";import"./index-C9I8SpvD.js";import"./button-w4wxkRvZ.js";import"./index-1evVQkiP.js";import"./loading-CHO2ZS0P.js";import"./modalStack-DmLqMJfC.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-H5W8lwGu.js";import"./UiClose-LtPFrzPQ.js";import"./UiArrowUp-Bd4hZ0OO.js";import"./CommentThreadList-MSRJeLTQ.js";import"./Badge-DfotIX-n.js";import"./Modal-DQGbUUH1.js";import"./UiFullscreen-DJfWjxJ6.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CZDpiDaa.js";import"./HoverCard-BWu1QYLQ.js";import"./UiRobotAi-CX6eEYAo.js";import"./UiDotsVertical-CU0Pr_aW.js";import"./UiTrash-wqVyNAaH.js";import"./UiCircleOutline-DYmfx-Ck.js";import"./UiCheck-C1P9WR7d.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const $=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,$ as __namedExportsOrder,Z as default};

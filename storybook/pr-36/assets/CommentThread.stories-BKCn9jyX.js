import{j as n}from"./iframe-tozGD2Qm.js";import{C as f}from"./CommentThread-DIQMqyw2.js";import{u as T,a as h,s as C}from"./comment-fixtures-CygL5Zit.js";import"./preload-helper-DMBmwiZ1.js";import"./utils-BLSKlp9E.js";import"./Icon-DV6apHHG.js";import"./DropdownMenu-CMDmvoY8.js";import"./floating-ui.react-Cr0Yg90Q.js";import"./index-DpZMNVsH.js";import"./index-CoipAafu.js";import"./button-BYIHgtoG.js";import"./index-1evVQkiP.js";import"./loading-B_J6UqsB.js";import"./modalStack-Bh_XSQ11.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-CG_aM3Ba.js";import"./UiClose-DbbVB4Tg.js";import"./UiArrowUp-C3CUh5-6.js";import"./CommentThreadList-CCpXqUe4.js";import"./Badge-Bd6WN4rF.js";import"./Modal-D40HVwtV.js";import"./UiFullscreen-CA0cvJo9.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CHUNXk_l.js";import"./HoverCard-ClY83-uE.js";import"./UiRobotAi-DZ_kI1dv.js";import"./UiDotsVertical-CeDoUjNN.js";import"./UiTrash-DWIr6D-V.js";import"./UiCircleOutline-BTlFuWB4.js";import"./UiCheck-C56O4kNi.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

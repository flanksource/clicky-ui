import{j as n}from"./iframe-Ch1BYoLl.js";import{C as f}from"./CommentThread-DsKC46S0.js";import{u as T,a as h,s as C}from"./comment-fixtures-ByUW1jX9.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-CajlMFHd.js";import"./DropdownMenu-CVrdv7Cu.js";import"./floating-ui.react-rRvTefo0.js";import"./index-DWuQH2px.js";import"./index-D4kBRSRx.js";import"./button-C_7HN6uA.js";import"./index-1evVQkiP.js";import"./loading-D4VpgK2W.js";import"./modalStack-CXz3gd3A.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-Cr-fH5xI.js";import"./UiClose-B7EVqjbt.js";import"./UiArrowUp-BRff4kio.js";import"./CommentThreadList-BogWlV9R.js";import"./Badge-QUh22FK_.js";import"./Modal-BVXjZwCi.js";import"./UiFullscreen-BsRjY68n.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-YxWdSJEu.js";import"./HoverCard-DbBpdw4N.js";import"./UiRobotAi-CEDQq643.js";import"./UiDotsVertical-1XrUpQPM.js";import"./UiTrash-D8VQ_Zhc.js";import"./UiCircleOutline-DQwwza9M.js";import"./UiCheck-D5P45Pjn.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

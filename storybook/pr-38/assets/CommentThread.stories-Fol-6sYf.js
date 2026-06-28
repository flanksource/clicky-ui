import{j as n}from"./iframe-BxLPOr6M.js";import{C as f}from"./CommentThread-CqBziTD4.js";import{u as T,a as h,s as C}from"./comment-fixtures-uYre21k5.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-DGql8Ler.js";import"./DropdownMenu-FJ4Wd-x2.js";import"./floating-ui.react-DuikDt8B.js";import"./index-DOlc9q0f.js";import"./index-CXpH9Yf8.js";import"./button-CcdgmEp6.js";import"./index-0zBpNI7D.js";import"./loading-C28S_Ccf.js";import"./modalStack-BJc3ZvRY.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-BxzZdAmx.js";import"./UiClose-BkgTCVec.js";import"./UiArrowUp-BaOuidWw.js";import"./CommentThreadList-C5U1Gvyn.js";import"./Badge-CMVsmLhG.js";import"./Modal-DKhra3sX.js";import"./UiFullscreen-Dp4xHc-2.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BcxIpHVj.js";import"./HoverCard-BHwQ2VLC.js";import"./UiRobotAi-Cr0XjhxP.js";import"./UiDotsVertical-r5NbHd0h.js";import"./UiTrash-BNhSVlun.js";import"./UiCircleOutline-6qOjEOE4.js";import"./UiCheck-DcO0ZANr.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

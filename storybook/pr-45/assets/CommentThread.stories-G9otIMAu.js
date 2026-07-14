import{j as n}from"./iframe-0bc176G1.js";import{C as f}from"./CommentThread-Cg143zNI.js";import{u as T,a as h,s as C}from"./comment-fixtures-ClsNtNlx.js";import"./preload-helper-D-2WW-AN.js";import"./utils-CR52uffu.js";import"./Icon-LDnLk-Ec.js";import"./DropdownMenu-DBbVJsez.js";import"./floating-ui.react-DUyav7Mf.js";import"./index-C5YvwvsX.js";import"./index-Ms4dS0uC.js";import"./button-CYgJK2Rk.js";import"./index-0zBpNI7D.js";import"./loading-CJdteYdy.js";import"./modalStack-Cr8uIIEn.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-BuIn1m3V.js";import"./UiClose--pfy67_V.js";import"./UiArrowUp-ncxwJLOr.js";import"./CommentThreadList-Z3fP5D8G.js";import"./Badge-Dhw-Uqqx.js";import"./Modal-cVEgSouU.js";import"./UiFullscreen-D-0oWftq.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DQcIceRT.js";import"./HoverCard-BwI7dmSE.js";import"./UiRobotAi-C_-SYgn3.js";import"./UiDotsVertical-mvmpJyRn.js";import"./UiTrash-zUUyWtIE.js";import"./UiCircleOutline-DGHilfTD.js";import"./UiCheck-B-D4Byul.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

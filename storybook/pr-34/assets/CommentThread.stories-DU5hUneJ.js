import{j as n}from"./iframe-B-R1GM9F.js";import{C as f}from"./CommentThread-DfMXYlTh.js";import{u as T,a as h,s as C}from"./comment-fixtures-pUtdgNdk.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-GOgSuK4c.js";import"./DropdownMenu-DC62P_r0.js";import"./floating-ui.react-DPNvzpty.js";import"./index-DJve4rSX.js";import"./index-BWgeyKN8.js";import"./button-BuoaacKd.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";import"./modalStack-DOuKvvHi.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-7vVXchWm.js";import"./UiClose-CK_Ztmv-.js";import"./UiArrowUp-Cvy02KbY.js";import"./CommentThreadList-Bi9wLrC6.js";import"./Badge-CK8uPcJn.js";import"./Modal-BBnmngDy.js";import"./UiFullscreen-DRoUwqMZ.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CRsNT7HI.js";import"./HoverCard-Z0LuUJti.js";import"./UiRobotAi-C_zWnipl.js";import"./UiDotsVertical-mnlZgoAF.js";import"./UiTrash-C8CVmS3j.js";import"./UiCircleOutline-CLUoU8BD.js";import"./UiCheck-BThsfaV8.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

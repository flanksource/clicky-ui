import{j as n}from"./iframe-C96xZIdp.js";import{C as f}from"./CommentThread-C7adJxva.js";import{u as T,a as h,s as C}from"./comment-fixtures-D22R0sI5.js";import"./preload-helper-Bg6xcDEu.js";import"./utils-CR52uffu.js";import"./Icon-DVJMtl2F.js";import"./DropdownMenu-BBC-3QeD.js";import"./floating-ui.react-CKpawvp6.js";import"./index-Dpw8D6A4.js";import"./index-DiVyEuZt.js";import"./button-CQ2Ni0n1.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./modalStack-DCQR24ar.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-C4iQdycK.js";import"./UiClose-BGwIaMb7.js";import"./UiArrowUp-B6qAOK1F.js";import"./CommentThreadList-D-KClwVS.js";import"./Badge-xx5knzsP.js";import"./Modal-zDTRg6Jm.js";import"./UiFullscreen-Dw4GSQtd.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BzdE1-uO.js";import"./HoverCard-BSvuiu55.js";import"./UiRobotAi-DMYWiASx.js";import"./UiDotsVertical-UaPkcxe4.js";import"./UiTrash-Wcy1ivlm.js";import"./UiCircleOutline-DnuF5nWL.js";import"./UiCheck-CIVB-pM_.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

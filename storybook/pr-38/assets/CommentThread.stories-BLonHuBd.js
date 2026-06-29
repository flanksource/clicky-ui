import{j as n}from"./iframe-C9yFQwwi.js";import{C as f}from"./CommentThread-Drh-X--S.js";import{u as T,a as h,s as C}from"./comment-fixtures-CvXDXLlY.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-CPfok5dB.js";import"./DropdownMenu-BjiCAKp6.js";import"./floating-ui.react-BGqIqlo6.js";import"./index-DV4EKk1L.js";import"./index-DNnTLrC-.js";import"./button-BUPOCWxe.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";import"./modalStack-CeDZWai7.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-BF9Z2jpX.js";import"./UiClose-CrCIES2T.js";import"./UiArrowUp-D4G8YSfv.js";import"./CommentThreadList-CQ5XJXpr.js";import"./Badge-DTkM_ah4.js";import"./Modal-DfeEiwDA.js";import"./UiFullscreen-C2nfMBhc.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-a_QgJPOx.js";import"./HoverCard-DY5hSNgU.js";import"./UiRobotAi-B5rLtVeK.js";import"./UiDotsVertical-CH-hoUgU.js";import"./UiTrash-B3H366BU.js";import"./UiCircleOutline-ejiP5sf_.js";import"./UiCheck-CqtlcYfS.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

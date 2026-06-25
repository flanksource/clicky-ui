import{j as n}from"./iframe-BO3XiECZ.js";import{C as f}from"./CommentThread-D7Wz-vJA.js";import{u as T,a as h,s as C}from"./comment-fixtures-Bi7fw56G.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-GruNqjyl.js";import"./DropdownMenu-AoZVwYhh.js";import"./floating-ui.react-B_2LfBkg.js";import"./index-D_v1HQsH.js";import"./index-OHfE5VLg.js";import"./button-D09c44qg.js";import"./index-1evVQkiP.js";import"./loading-DKpQqMGf.js";import"./modalStack-yDe9UqJq.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-CmLEZyD7.js";import"./UiClose-C-MNSUX4.js";import"./UiArrowUp-B4PHuTeq.js";import"./CommentThreadList-BEIWD9UT.js";import"./Badge-3P21JFl2.js";import"./Modal-Cw1CJA-_.js";import"./UiFullscreen-BjP1kzRt.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DioZJ612.js";import"./HoverCard-Dy6uWYdg.js";import"./UiRobotAi-PnWq3D36.js";import"./UiDotsVertical-BFmvD-AR.js";import"./UiTrash-D5Od_UEB.js";import"./UiCircleOutline-C58hwlV-.js";import"./UiCheck-ODqHhldT.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

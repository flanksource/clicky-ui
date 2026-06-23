import{j as n}from"./iframe-BbITQAD0.js";import{C as f}from"./CommentThread-Dpmz7B-k.js";import{u as T,a as h,s as C}from"./comment-fixtures-BCLJPjSS.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";import"./Icon-BV_HrUof.js";import"./DropdownMenu-CfjRKuRR.js";import"./floating-ui.react-CvnH8rJ_.js";import"./index-DTeCgtpZ.js";import"./index-KB5QQAds.js";import"./button-Tq_nwknb.js";import"./index-1evVQkiP.js";import"./loading-3eAvRO6U.js";import"./modalStack-B9-B99Xv.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-B6dH09FW.js";import"./UiClose-ChsFmnC8.js";import"./UiArrowUp-DHDybV2A.js";import"./CommentThreadList-D3V4u3_W.js";import"./Badge-0VTPnFgW.js";import"./Modal-CeEpv3W_.js";import"./UiFullscreen-DZWM2Cir.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Dy1F3TxQ.js";import"./HoverCard-D12YyofN.js";import"./UiRobotAi-rkGkd76m.js";import"./UiDotsVertical-wk_RIwCU.js";import"./UiTrash-BU3-4vwy.js";import"./UiCircleOutline-Dv394kG0.js";import"./UiCheck-Dc-rEWul.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

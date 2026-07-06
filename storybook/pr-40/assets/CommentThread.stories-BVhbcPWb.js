import{j as n}from"./iframe-BUI_RHnX.js";import{C as f}from"./CommentThread-CuhjtacG.js";import{u as T,a as h,s as C}from"./comment-fixtures-BP1zbtMn.js";import"./preload-helper-DweeuSg3.js";import"./utils-CR52uffu.js";import"./Icon-B3tLlLKZ.js";import"./DropdownMenu-CqlIOVxP.js";import"./floating-ui.react-jckvp_6U.js";import"./index-BpOIPT8A.js";import"./index-oRNCBTNd.js";import"./button-COWLJ6pg.js";import"./index-0zBpNI7D.js";import"./loading-Do60Rp8m.js";import"./modalStack-CnH0yp5t.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-BOFx2Z4i.js";import"./UiClose-DUkoab9r.js";import"./UiArrowUp-C2F5LCPn.js";import"./CommentThreadList-CJ_CQ67s.js";import"./Badge-BNmIFR_P.js";import"./Modal-UtoJSdsx.js";import"./UiFullscreen-BmBeKdsk.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Dd1Kg_pb.js";import"./HoverCard-dMfQoMwj.js";import"./UiRobotAi-DtAIOECC.js";import"./UiDotsVertical-GSr2qkmy.js";import"./UiTrash-BSVc1q2Y.js";import"./UiCircleOutline-35F7fNmB.js";import"./UiCheck-DhYKpnrE.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

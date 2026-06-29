import{j as n}from"./iframe-Ck5OBNy_.js";import{C as f}from"./CommentThread-BLXomWbe.js";import{u as T,a as h,s as C}from"./comment-fixtures-D2QbWQ8T.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-BzT4mhZP.js";import"./DropdownMenu-CCoepdY4.js";import"./floating-ui.react--Dqofk4r.js";import"./index-Dkbn_kvr.js";import"./index-BAA7PKOe.js";import"./button-xP_Jm0t5.js";import"./index-0zBpNI7D.js";import"./loading-D5ySMDtv.js";import"./modalStack-CJY7IwIQ.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-CirG0okf.js";import"./UiClose-DqLdg852.js";import"./UiArrowUp-HGHzL39M.js";import"./CommentThreadList-Dg0AQAcT.js";import"./Badge-D3j3jk-m.js";import"./Modal-DBs0n7Za.js";import"./UiFullscreen-D2hBhWaD.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Cnd-ZYFP.js";import"./HoverCard-CuRTg0Wr.js";import"./UiRobotAi-cD4SmXL3.js";import"./UiDotsVertical-DWnMPtb8.js";import"./UiTrash-BTsN3uKg.js";import"./UiCircleOutline-CKAFI-7S.js";import"./UiCheck-Dr2gRPmf.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

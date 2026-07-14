import{j as n}from"./iframe-Os6uNPQC.js";import{C as f}from"./CommentThread-CkSAaxGf.js";import{u as T,a as h,s as C}from"./comment-fixtures-6lO3bQ3I.js";import"./preload-helper-BdQ0w_Fr.js";import"./utils-CR52uffu.js";import"./Icon-BfCTzQnw.js";import"./DropdownMenu-DxeEIHXe.js";import"./floating-ui.react-BARPZRj3.js";import"./index-DVWt2iB4.js";import"./index-BtvTaee3.js";import"./button-x6drXcnT.js";import"./index-0zBpNI7D.js";import"./loading-Bqgzd3q4.js";import"./modalStack--4BGdmKr.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-GtYCoqnB.js";import"./UiClose-CZ0WrT1Q.js";import"./UiArrowUp-Bma_RPnY.js";import"./CommentThreadList-C0WnDbOV.js";import"./Badge-BmSeyNU3.js";import"./Modal-4koDLjEl.js";import"./UiFullscreen-CsQ5Ahs9.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BKy67hVW.js";import"./HoverCard-BWIDBXgb.js";import"./UiRobotAi-CHB4_aR7.js";import"./UiDotsVertical-COPn3AzH.js";import"./UiTrash-ccOivyck.js";import"./UiCircleOutline-CTUW82oG.js";import"./UiCheck-CTFp6-nW.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

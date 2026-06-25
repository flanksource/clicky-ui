import{j as n}from"./iframe-DQ9XXhpn.js";import{C as f}from"./CommentThread-BHADdIJo.js";import{u as T,a as h,s as C}from"./comment-fixtures-hCdiyfGf.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-OSD6-FvK.js";import"./DropdownMenu-CgZUSL6X.js";import"./floating-ui.react-DaZkj6wF.js";import"./index-BDYInp2-.js";import"./index-C6GOQB4V.js";import"./button-CE3xxuNF.js";import"./index-1evVQkiP.js";import"./loading-ORxmrxml.js";import"./modalStack-BT1YNoec.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-B2K9Ka4v.js";import"./UiClose-D-7AUFZ5.js";import"./UiArrowUp-CJX2-aLo.js";import"./CommentThreadList-DqK__soF.js";import"./Badge--_EEummt.js";import"./Modal-BFn-lGk6.js";import"./UiFullscreen-Jviq6Ujl.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-COlKbKmI.js";import"./HoverCard-nZZP1fzj.js";import"./UiRobotAi-BLkxmAl8.js";import"./UiDotsVertical-BHOKT8Zv.js";import"./UiTrash-BgxFTR_p.js";import"./UiCircleOutline-FXfjediE.js";import"./UiCheck-BSaE0h4R.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,Z={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

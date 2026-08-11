import{j as n}from"./iframe-DQ4bl7_4.js";import{C as f}from"./CommentThread-Ceo-ch0a.js";import{u as T,a as h,s as C}from"./comment-fixtures-B4UUVGHV.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./Icon-DnY4_zIX.js";import"./DropdownMenu-CwoDXHYK.js";import"./floating-ui.react-Dv7k8fxD.js";import"./index-COx9F93F.js";import"./index-CSwS8kWJ.js";import"./button-BeRBp0Vq.js";import"./index-0zBpNI7D.js";import"./loading-DLaiJr6O.js";import"./DropdownMenuSubmenu-DGHn6Q5L.js";import"./modalStack-iZddL8t7.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-DYq3EBQb.js";import"./Badge-BQiYcG35.js";import"./Modal-A8cU230p.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-8-gMmcyF.js";import"./HoverCard-rof_d5zl.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const z=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,z as __namedExportsOrder,q as default};

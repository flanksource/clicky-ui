import{j as n}from"./iframe-D7GyV4pJ.js";import{C as f}from"./CommentThread-B3QyNE2D.js";import{u as T,a as h,s as C}from"./comment-fixtures-CFbRXULl.js";import"./preload-helper-B_Vm21o9.js";import"./utils-DW-IJACk.js";import"./Icon-CjYo4K-K.js";import"./DropdownMenu-CbjgQkAk.js";import"./floating-ui.react-0HlP6Bgn.js";import"./index-vBVdkF1K.js";import"./index-CBRh9JwW.js";import"./button-DGCXgUzH.js";import"./index-CPURVhFy.js";import"./loading-l0OT6FT8.js";import"./DropdownMenuSubmenu-B7tV7pQZ.js";import"./modalStack-j79ynlPx.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BBaGKq2k.js";import"./Modal-DeNB64-i.js";import"./Badge-PT16GLtd.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-Bh93aGw3.js";import"./HoverCard-D4LSpSfM.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

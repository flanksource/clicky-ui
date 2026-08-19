import{j as n}from"./iframe-DdBTgIYo.js";import{C as f}from"./CommentThread-DVFd_ZIb.js";import{u as T,a as h,s as C}from"./comment-fixtures-CHa9FQb_.js";import"./preload-helper-BAJsONWX.js";import"./utils-DW-IJACk.js";import"./Icon-DVutFXv6.js";import"./DropdownMenu-DtqJruug.js";import"./floating-ui.react-BKPEba8r.js";import"./index-C-GJeFIY.js";import"./index-BPZKakeu.js";import"./button-Csh7yOII.js";import"./index-CPURVhFy.js";import"./loading-BHoHZ-Ia.js";import"./DropdownMenuSubmenu-CauiYosP.js";import"./modalStack-z0EYZXej.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-DE5ML3eg.js";import"./Badge-DJyQ-bFB.js";import"./Modal-t7pClsp8.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-BhMyvn6g.js";import"./HoverCard-CIwH93z_.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

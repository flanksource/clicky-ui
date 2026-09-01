import{j as n}from"./iframe-9kVTKmJ0.js";import{C as f}from"./CommentThread-DE3Li-WX.js";import{u as T,a as h,s as C}from"./comment-fixtures-DXwug_62.js";import"./preload-helper-95TtevsV.js";import"./utils-DW-IJACk.js";import"./Icon-CvI4mGjv.js";import"./DropdownMenu-BNM_4WBn.js";import"./floating-ui.react-BUMPLM4a.js";import"./index-Cr37FOZC.js";import"./index-BTeDEC8L.js";import"./button-BPQ9SyIv.js";import"./index-CPURVhFy.js";import"./loading-MkmNbgtg.js";import"./DropdownMenuSubmenu-YGHNpTO4.js";import"./modalStack-CNqfYGm3.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-C8vtzJmv.js";import"./Modal-BbLdbhrq.js";import"./Badge-BcfKC88e.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-CRlHO8bI.js";import"./HoverCard-CPC5ZKyE.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

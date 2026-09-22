import{j as n}from"./iframe-Ds09J1dT.js";import{C as f}from"./CommentThread-CXf6_Ekw.js";import{u as T,a as h,s as C}from"./comment-fixtures-Yij2NIJh.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-CjZb5Sv7.js";import"./DropdownMenu-BzWciQ6u.js";import"./floating-ui.react-CgcPjn0G.js";import"./index-FPTpXdcx.js";import"./index-CF4fvYH8.js";import"./button-BqYgRAWV.js";import"./index-CPURVhFy.js";import"./loading-qMao84VB.js";import"./DropdownMenuSubmenu-3ngMhyLq.js";import"./modalStack-CthqJ_T7.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BjkK_fVl.js";import"./clipboard-WBaKzsDs.js";import"./Markdown-DbUry-Ba.js";import"./Callout-CiLJI5RG.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-V_xRb2SR.js";import"./CodeDiff-D-JoSWgL.js";import"./SegmentedControl-DeGdd1Jg.js";import"./HighlightedTokens-qyGyaI1E.js";import"./JsonView-CU07Cie5.js";import"./Tabs-DuqrcKp5.js";import"./TabButton-Q-1E5VFZ.js";import"./Modal-CAEMgpU8.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BLiPc1C0.js";import"./HoverCard-trfKQKGq.js";import"./Badge-fcSLrmh7.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const eo=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,eo as __namedExportsOrder,to as default};

import{j as n}from"./iframe-lrV_tcxP.js";import{C as f}from"./CommentThread-B31EKuK4.js";import{u as T,a as h,s as C}from"./comment-fixtures-CKZPeqQ_.js";import"./preload-helper-C6Lb07j8.js";import"./utils-DW-IJACk.js";import"./Icon-CgtLhDD0.js";import"./DropdownMenu-C3985j7f.js";import"./floating-ui.react-BjmYh6Tq.js";import"./index-BxMM_6lR.js";import"./index-7ZhegYQ4.js";import"./button-BU3MdbYZ.js";import"./index-CPURVhFy.js";import"./loading-CtyMrwzj.js";import"./DropdownMenuSubmenu-cIJcHKET.js";import"./modalStack-CuObymKB.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CTy0ee5x.js";import"./clipboard-DE8ysAVc.js";import"./Markdown-BDtrFfjm.js";import"./Callout-DHazD12T.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-SsjEYIsY.js";import"./CodeDiff-DafLqdNk.js";import"./SegmentedControl-BXjzjuqN.js";import"./HighlightedTokens-2g2fPKpS.js";import"./JsonView-BAT_M2es.js";import"./Tabs-C5hdacFO.js";import"./TabButton-CuBzwdkb.js";import"./Modal-d3Ocuae-.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-2pkMmi8Z.js";import"./HoverCard-BPKJuZIK.js";import"./Badge-CwI3nE3C.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-CRAMrqdr.js";import{C as f}from"./CommentThread-BOw-vcO6.js";import{u as T,a as h,s as C}from"./comment-fixtures-BkIcno73.js";import"./preload-helper-BpddQVpQ.js";import"./utils-DW-IJACk.js";import"./Icon-BMbq9_zN.js";import"./DropdownMenu-DfpWvqFK.js";import"./floating-ui.react-CfpWOLb9.js";import"./index-OBWOC1jm.js";import"./index-Dhhf_61s.js";import"./button-DMzgHLRl.js";import"./index-CPURVhFy.js";import"./loading-C6pXG8vv.js";import"./DropdownMenuSubmenu-Cfi5dRDD.js";import"./modalStack-CwY5BXIM.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BqlNmBtE.js";import"./clipboard-xjI7YKAI.js";import"./Markdown-BPO4YHt_.js";import"./Callout-CkNgMlmU.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BvQviV8T.js";import"./CodeDiff-Dn7im8_m.js";import"./SegmentedControl-Cl1OXQjv.js";import"./HighlightedTokens-XtgKphvB.js";import"./JsonView-lIQuAVJ4.js";import"./Tabs-9moBAYrL.js";import"./TabButton-96FXcghn.js";import"./Modal-oPG10GDr.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-C8vQyaUt.js";import"./HoverCard-Bb-2z-j6.js";import"./Badge-D_cUJGQB.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

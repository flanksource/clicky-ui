import{j as n}from"./iframe-DdgNogAy.js";import{C as f}from"./CommentThread-CWvNJTgI.js";import{u as T,a as h,s as C}from"./comment-fixtures-Je5GfDgr.js";import"./preload-helper-BvsCWBK3.js";import"./utils-DW-IJACk.js";import"./Icon-Cj3ZeRuU.js";import"./DropdownMenu-D2g063jE.js";import"./floating-ui.react-Dbg33d5m.js";import"./index-B6mQjjqS.js";import"./index-Sl_STJ6n.js";import"./button-CzjW30CI.js";import"./index-CPURVhFy.js";import"./loading-wD2sCDq3.js";import"./DropdownMenuSubmenu-BYLlZJBu.js";import"./modalStack-DWC2-Zws.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B9FmyuWz.js";import"./clipboard-CseXKLjv.js";import"./Markdown-DuCvMZLJ.js";import"./Callout-D0_z7fbN.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B51oKzRt.js";import"./CodeDiff-0j-Ub4yH.js";import"./SegmentedControl-Bv_vn1Rv.js";import"./HighlightedTokens-AVP7rVb3.js";import"./JsonView-xlYTqv5C.js";import"./Tabs-Cr1b6e71.js";import"./TabButton-B1-84eDG.js";import"./Modal-3z7NTFVw.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Cph5m3mB.js";import"./HoverCard-jnz4TehU.js";import"./Badge-Cx54087I.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-CiA63uuc.js";import{C as f}from"./CommentThread-DeDKvDok.js";import{u as T,a as h,s as C}from"./comment-fixtures-D1jWwB1l.js";import"./preload-helper-DqldIB3Q.js";import"./utils-DW-IJACk.js";import"./Icon-ChAy_Zq6.js";import"./DropdownMenu-DEcSbpCu.js";import"./floating-ui.react-BzcB7PEn.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./button-ppGJePHl.js";import"./index-CPURVhFy.js";import"./loading-X8NYIprp.js";import"./DropdownMenuSubmenu-DGyluL-z.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Ccyr4A9Q.js";import"./clipboard-C2lIN30Y.js";import"./Markdown-D1xj6YhK.js";import"./Callout-u4IWX5Rk.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-D6-FWHVb.js";import"./CodeDiff-BpeI9I83.js";import"./SegmentedControl-aXRpxQ4b.js";import"./HighlightedTokens-CbIDuBkT.js";import"./JsonView-CuM0h6Lr.js";import"./Tabs-Dvlvxk30.js";import"./TabButton-vlnMqy6g.js";import"./Modal-BWkFQvgr.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-qJIqD45I.js";import"./HoverCard-BaejSNIH.js";import"./Badge-C7FdoOOR.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

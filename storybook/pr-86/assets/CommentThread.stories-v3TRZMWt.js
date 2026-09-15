import{j as n}from"./iframe-DXjk5r-a.js";import{C as f}from"./CommentThread-B1YfgjO5.js";import{u as T,a as h,s as C}from"./comment-fixtures-CsStqUBG.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-DC7PbjMy.js";import"./DropdownMenu-BFy8-TKA.js";import"./floating-ui.react-DFDYvl7a.js";import"./index-BXQtcMly.js";import"./index-DcGoyOOZ.js";import"./button-BoSQcAdS.js";import"./index-CPURVhFy.js";import"./loading-BGtnCp6V.js";import"./DropdownMenuSubmenu-Bghn0JQN.js";import"./modalStack-tAQFSeFw.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BqzzqfCz.js";import"./clipboard-72nTqOMh.js";import"./Markdown-B57mXxqo.js";import"./Callout-CMgkO-y6.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-8h7eJ8il.js";import"./CodeDiff-Bf4QUU4a.js";import"./SegmentedControl-Ch-FYi_O.js";import"./HighlightedTokens-BBAz76nG.js";import"./JsonView-DH-PlnAk.js";import"./Tabs-rQqTsWnm.js";import"./TabButton-CSFMgSMH.js";import"./Modal-Bq-6F7LO.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CUE0Gn92.js";import"./HoverCard-Cz1NFyc2.js";import"./Badge-qnkM4cgH.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

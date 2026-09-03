import{j as n}from"./iframe-Cco5TqZn.js";import{C as f}from"./CommentThread-CLILCfTW.js";import{u as T,a as h,s as C}from"./comment-fixtures-HhR8Ikm2.js";import"./preload-helper-CW1BdeJu.js";import"./utils-DW-IJACk.js";import"./Icon-C6Dn9DLx.js";import"./DropdownMenu-w_RgGUTs.js";import"./floating-ui.react-Dpy7yByO.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./button-DNj3-z2W.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BBVYscn0.js";import"./clipboard-oUl6E-m6.js";import"./Markdown-DxgOkfSH.js";import"./Callout-BJXiqTYd.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BYcrzBK4.js";import"./CodeDiff-BKgy3UT_.js";import"./SegmentedControl-qK3H5opf.js";import"./HighlightedTokens-DbGRJ7uL.js";import"./JsonView-BazgrdGA.js";import"./Tabs-B7ZjoCl_.js";import"./TabButton-DG6HQtyJ.js";import"./Modal-BfOLI4vX.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-BhDiNVac.js";import"./HoverCard-D8KXkP_9.js";import"./Badge-BsNPFd1h.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

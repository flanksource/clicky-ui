import{j as n}from"./iframe-DAGeDdmW.js";import{C as f}from"./CommentThread-CPioIm_2.js";import{u as T,a as h,s as C}from"./comment-fixtures-DemWTt8k.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-IzT7REGK.js";import"./DropdownMenu-JxGWd7zY.js";import"./floating-ui.react-BkCnCGeJ.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./button-B7rSq3cQ.js";import"./index-CPURVhFy.js";import"./loading-bJuzykOR.js";import"./DropdownMenuSubmenu-YmOPmNs-.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B_52gC1n.js";import"./clipboard-BEfv3Hh9.js";import"./Markdown-BYALqHHY.js";import"./Callout-CBHNV6Pc.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B6Z1SYpv.js";import"./CodeDiff-DIxTmBMR.js";import"./SegmentedControl-Cbj_nPje.js";import"./HighlightedTokens-CQRR7KfC.js";import"./JsonView-CndWyCj7.js";import"./Tabs-DMc6D7mf.js";import"./TabButton-DDdThiur.js";import"./Modal-D6taPS5_.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DLGI38-e.js";import"./HoverCard-BVfeNivj.js";import"./Badge-W8TfuLL4.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

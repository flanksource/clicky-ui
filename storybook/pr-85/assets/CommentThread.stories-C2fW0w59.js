import{j as n}from"./iframe-BNefQpor.js";import{C as f}from"./CommentThread-DJQy-IAJ.js";import{u as T,a as h,s as C}from"./comment-fixtures-D9O11T8F.js";import"./preload-helper-BvsCWBK3.js";import"./utils-DW-IJACk.js";import"./Icon-Wyal3cEo.js";import"./DropdownMenu-CC-C7gGw.js";import"./floating-ui.react-CAaUf1g-.js";import"./index-DPbJXMEv.js";import"./index-C0j4VFB1.js";import"./button-DzbDFHiG.js";import"./index-CPURVhFy.js";import"./loading-C39MVSz-.js";import"./DropdownMenuSubmenu-DHHN9TUM.js";import"./modalStack-Ex--0n26.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CISJ1Rsn.js";import"./clipboard-CbsacFoq.js";import"./Markdown-3UsW7Lcy.js";import"./Callout-UDl0mx9v.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-cPHBUwLq.js";import"./CodeDiff-CutDbvTd.js";import"./SegmentedControl-DFDUwH_x.js";import"./HighlightedTokens-CkaeK1Qo.js";import"./JsonView-DvOBxzDj.js";import"./Tabs-CVEJZsOI.js";import"./TabButton-BgXBHLp_.js";import"./Modal-0C9g1z3t.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CLFMZ0je.js";import"./HoverCard-BT2elvub.js";import"./Badge-8CVShKQz.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

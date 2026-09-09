import{j as n}from"./iframe-DFIXOaVS.js";import{C as f}from"./CommentThread-C7Jq-tse.js";import{u as T,a as h,s as C}from"./comment-fixtures-Z5KEW-P-.js";import"./preload-helper-BDLXYeas.js";import"./utils-DW-IJACk.js";import"./Icon-hb4cd-6v.js";import"./DropdownMenu-DAPEMyBH.js";import"./floating-ui.react-BezqsR5e.js";import"./index-CMlS72mc.js";import"./index-CdL49atw.js";import"./button-yXFyyoCV.js";import"./index-CPURVhFy.js";import"./loading-CZSR_umZ.js";import"./DropdownMenuSubmenu-q_knwM8l.js";import"./modalStack-Cozz4jw4.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Wa9n6Bmg.js";import"./clipboard-CcFoXpy0.js";import"./Markdown-CaMOFpMM.js";import"./Callout-DdSMKINu.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DZkDKY5L.js";import"./CodeDiff-BIi2VwnF.js";import"./SegmentedControl-D6HJ0JLN.js";import"./HighlightedTokens-B3f0PYmL.js";import"./JsonView-CeIsKIBx.js";import"./Tabs-CmjSdlTh.js";import"./TabButton-DjRM81De.js";import"./Modal-7Bguwvl8.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Cte3Bmg_.js";import"./HoverCard-DxWmZ8ds.js";import"./Badge-O6dyEcpn.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

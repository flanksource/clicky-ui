import{j as n}from"./iframe-DFqoVmES.js";import{C as f}from"./CommentThread-hmXDNqLz.js";import{u as T,a as h,s as C}from"./comment-fixtures-BTGDNbeR.js";import"./preload-helper-Btgbu5YQ.js";import"./utils-DW-IJACk.js";import"./Icon-C2VnWBhA.js";import"./DropdownMenu-0zQ_bkuC.js";import"./floating-ui.react-F5U4WUZ1.js";import"./index-SNQUh-rf.js";import"./index-aojGc9A7.js";import"./button-CousEx7c.js";import"./index-CPURVhFy.js";import"./loading-a0chOUxC.js";import"./DropdownMenuSubmenu-D8TwUdJ9.js";import"./modalStack-D8oWGv-3.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Bu0N_CpF.js";import"./clipboard-CyR_AzLX.js";import"./Markdown-B3_05bTo.js";import"./Callout-BDTtnOmC.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B9ujCA73.js";import"./CodeDiff-D39VjvBJ.js";import"./SegmentedControl-CHoriPdF.js";import"./HighlightedTokens-DcHvhSPu.js";import"./JsonView-BwRJ4HFa.js";import"./Tabs-DUAnL66_.js";import"./TabButton-BPfvzrqQ.js";import"./Modal-DyLthMq_.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-gAP-vVAI.js";import"./HoverCard-BR1rDq5O.js";import"./Badge-CuaFn_de.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-ODiXRaeD.js";import{C as f}from"./CommentThread-xTc6nvzw.js";import{u as T,a as h,s as C}from"./comment-fixtures-CVpSGI6c.js";import"./preload-helper-DUVrmzNZ.js";import"./utils-DW-IJACk.js";import"./Icon-CulP8OOJ.js";import"./DropdownMenu-Cnc4cnjr.js";import"./floating-ui.react-DXashjmJ.js";import"./index-DoPuVbTh.js";import"./index-DUxqcZ0I.js";import"./button-vfp9rbvl.js";import"./index-CPURVhFy.js";import"./loading-BGUot--s.js";import"./DropdownMenuSubmenu-CAYBYAzj.js";import"./modalStack-CqgS2p7j.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-D75XWFm4.js";import"./clipboard-Ds7fr-Cq.js";import"./Markdown-CQCDv5RV.js";import"./Callout-DmKyhSqT.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-0JMXL0li.js";import"./CodeDiff-BBTi1off.js";import"./SegmentedControl-Bv1pVWWz.js";import"./HighlightedTokens-ByVXtaAr.js";import"./JsonView-CY5kuzeJ.js";import"./Tabs-DFsIfroG.js";import"./TabButton-BWR0jlcf.js";import"./Modal-LKsOOO6Y.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BCfnX9G9.js";import"./HoverCard-BdexRlW3.js";import"./Badge-2T1VklgA.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

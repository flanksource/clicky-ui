import{j as n}from"./iframe-Bu8__SiW.js";import{C as f}from"./CommentThread-CWOHMt7Z.js";import{u as T,a as h,s as C}from"./comment-fixtures-3g6CBdox.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-Cn9xrMzj.js";import"./DropdownMenu-Cc3rFJXx.js";import"./floating-ui.react-Dnwi4P86.js";import"./index-BjG998sX.js";import"./index-ZA4_G-zD.js";import"./button-IQY09Old.js";import"./index-CPURVhFy.js";import"./loading-G9JgtjzI.js";import"./DropdownMenuSubmenu-Bin6sHLc.js";import"./modalStack-DAEU9LH6.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-p3QrxNTb.js";import"./clipboard-CqQQX5Dq.js";import"./Markdown-Di7HeoGv.js";import"./Callout-CAPoqzX9.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BBmT3lSS.js";import"./CodeDiff-Cp3irI7w.js";import"./SegmentedControl-BvvnSULS.js";import"./HighlightedTokens-DkxPDs2d.js";import"./JsonView-DQo_bBJV.js";import"./Tabs-BE9xH1H6.js";import"./TabButton-DTaWnWF9.js";import"./Modal-D3Yozp4q.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Cr9CH8lb.js";import"./HoverCard-C7tqGV4c.js";import"./Badge-rBPqgJ-m.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-BsAqiW63.js";import{C as f}from"./CommentThread-BcMJIkWF.js";import{u as T,a as h,s as C}from"./comment-fixtures-Cfy9NXmb.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";import"./Icon-Dyy6aaqa.js";import"./DropdownMenu-CRLAXTiF.js";import"./floating-ui.react-C__wji9y.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Db9UqY7j.js";import"./clipboard-Q2DnJGH7.js";import"./Markdown-DuzdQE_P.js";import"./ConfirmDialog-Dy2NjZjp.js";import"./Callout-DsXXS4Pz.js";import"./callout-tones-EFt49BYo.js";import"./Modal-qlF4Wnfg.js";import"./router-BgYu87PQ.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./SegmentedControl-CKXvowSa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./Tabs-DS-db7XK.js";import"./TabButton-BZA9_rW6.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-dN8p10RC.js";import"./HoverCard-DFfEldqR.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,so={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const co=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,co as __namedExportsOrder,so as default};

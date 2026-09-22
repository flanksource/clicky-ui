import{j as n}from"./iframe-CyxCReIN.js";import{C as f}from"./CommentThread-Bmt_Lp9U.js";import{u as T,a as h,s as C}from"./comment-fixtures-Dw0uuWzV.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-DjRCcNb6.js";import"./DropdownMenu-CIAQcaUe.js";import"./floating-ui.react-CRn3EQ6Q.js";import"./index-B_nLbyow.js";import"./index-D2DBLvBJ.js";import"./button-DJHVQAtF.js";import"./index-CPURVhFy.js";import"./loading-BjMuVtzF.js";import"./DropdownMenuSubmenu-D16MVwd1.js";import"./modalStack-CVif_cxP.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CnyLMOLm.js";import"./clipboard-C1hvN9W7.js";import"./Markdown-CBw2mQVT.js";import"./Callout-eapK3kss.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DMHMhI42.js";import"./CodeDiff-XfVf50oY.js";import"./SegmentedControl-CEjKH6ZW.js";import"./HighlightedTokens-D-xYBr9j.js";import"./JsonView-4QSG-iiA.js";import"./Tabs-CBy3WvcR.js";import"./TabButton-DGV2Ae0c.js";import"./Modal-DmP5tSFH.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-EtAcS5vp.js";import"./HoverCard-BMGnmMzi.js";import"./Badge-DUYXoHnk.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

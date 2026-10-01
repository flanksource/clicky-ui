import{j as n}from"./iframe-Cz62D_iz.js";import{C as f}from"./CommentThread-yJNUefrz.js";import{u as T,a as h,s as C}from"./comment-fixtures-BariB9Cc.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-DkXLnjJN.js";import"./DropdownMenu-CSiL2JEe.js";import"./floating-ui.react-B3VArII0.js";import"./index-CwDukIsd.js";import"./index-D1QWHGI5.js";import"./button-Da_C00l5.js";import"./index-CPURVhFy.js";import"./loading-CpNJyOux.js";import"./DropdownMenuSubmenu-DbLMIeXR.js";import"./modalStack-BS9FGIbV.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-H9Yxt1um.js";import"./clipboard-BoINIE70.js";import"./Markdown-CnTdsY9m.js";import"./Callout-kqNFF0Oz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-IdrdyxjQ.js";import"./CodeDiff-CWL3DUpA.js";import"./SegmentedControl-1VLDNc0s.js";import"./HighlightedTokens-DQPWohiH.js";import"./JsonView-MYgqOyIx.js";import"./Tabs-gH2Dv3LG.js";import"./TabButton-BRFJqFXC.js";import"./Modal-CvxqKJ19.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-SJKL4uX7.js";import"./HoverCard-BugDtYi2.js";import"./Badge--9k5yrUM.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

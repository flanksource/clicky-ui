import{j as n}from"./iframe-DknlViNB.js";import{C as f}from"./CommentThread-UuilwECe.js";import{u as T,a as h,s as C}from"./comment-fixtures-COm-H2f4.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-BHRmh9yr.js";import"./DropdownMenu-BcAr2u9p.js";import"./floating-ui.react-CPGroB7w.js";import"./index-BUJq7VBZ.js";import"./index-CIJgeimQ.js";import"./button-hM0oAGY1.js";import"./index-CPURVhFy.js";import"./loading-PcIlwrbj.js";import"./DropdownMenuSubmenu-R1W4qY9F.js";import"./modalStack-BaR_AbUd.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-lLk1y6QT.js";import"./clipboard-CbqmtVgN.js";import"./Markdown--ifOE9wQ.js";import"./Callout-ZUHlT26s.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CP33aCHU.js";import"./CodeDiff-CV_7POg6.js";import"./SegmentedControl-BxAx_Iqi.js";import"./HighlightedTokens-nzdgZDVi.js";import"./JsonView-C7Dguwa1.js";import"./Tabs-Bgw8n6MP.js";import"./TabButton-CxT8eMOO.js";import"./Modal-B1uWUfxp.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BdJi1JNu.js";import"./HoverCard-YLwe9yTe.js";import"./Badge-D5az-60y.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

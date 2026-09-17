import{j as n}from"./iframe-k78te_Hj.js";import{C as f}from"./CommentThread-DGVtpZsm.js";import{u as T,a as h,s as C}from"./comment-fixtures-Tixmr-rF.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-BxFpjwAC.js";import"./DropdownMenu-BAtbfmxv.js";import"./floating-ui.react-CBq0PPGN.js";import"./index-BT2sJ_Ky.js";import"./index-BYV-uwhj.js";import"./button-DOHlwBT1.js";import"./index-CPURVhFy.js";import"./loading-J2lUy0bP.js";import"./DropdownMenuSubmenu-Bs7Mqmth.js";import"./modalStack-gX0DzNXp.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BQEkC8h_.js";import"./clipboard-C3wBgsVt.js";import"./Markdown-D0CVTTPy.js";import"./Callout-I_WySpwf.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CUyjypF7.js";import"./CodeDiff-DRhurKgi.js";import"./SegmentedControl-C2zkwnpb.js";import"./HighlightedTokens-DWLn5OT3.js";import"./JsonView-DnkIY1t2.js";import"./Tabs-DzaPc-Fy.js";import"./TabButton-DyNiJvus.js";import"./Modal-C9UBUNoB.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-B-Km5FjE.js";import"./HoverCard-BBWMBTKn.js";import"./Badge-BFnEZb7M.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

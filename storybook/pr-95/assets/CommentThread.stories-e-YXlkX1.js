import{j as n}from"./iframe-DXCHqMT7.js";import{C as f}from"./CommentThread-2_paOhbv.js";import{u as T,a as h,s as C}from"./comment-fixtures-DKm4Nl77.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-CzqsX9Zi.js";import"./DropdownMenu-CajicWca.js";import"./floating-ui.react-BFoHRFAR.js";import"./index-nXD4GtBn.js";import"./index-h3UUAFeB.js";import"./button-tbjJwnTf.js";import"./index-CPURVhFy.js";import"./loading-CFBgJ_my.js";import"./DropdownMenuSubmenu-CG6RB2PG.js";import"./modalStack-ZxYyB433.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CoBZ-5q6.js";import"./clipboard-Dv8R_5tT.js";import"./Markdown-c_ISz9C-.js";import"./Callout-IH8aFM9X.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DfLdBRTj.js";import"./CodeDiff-D96T_Lqc.js";import"./SegmentedControl-CPSYGN3s.js";import"./HighlightedTokens-BwAjdB1B.js";import"./JsonView-B6IE9BVn.js";import"./Tabs-DOz5vzC1.js";import"./TabButton-BbeG3Lvi.js";import"./Modal-DuOJllmE.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DT8mH3pV.js";import"./HoverCard-Lk0Lira2.js";import"./Badge-CxYDrKcj.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

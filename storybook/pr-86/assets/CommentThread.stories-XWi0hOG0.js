import{j as n}from"./iframe-3q0eS6ZH.js";import{C as f}from"./CommentThread-CXwLOA7R.js";import{u as T,a as h,s as C}from"./comment-fixtures-Do80PYMC.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-CT7GZEqx.js";import"./DropdownMenu-BNbBQXTz.js";import"./floating-ui.react-CG8cv30D.js";import"./index-Egog0RqP.js";import"./index-CiPsLEp7.js";import"./button-DHxo9U3A.js";import"./index-CPURVhFy.js";import"./loading-gEVgRnUM.js";import"./DropdownMenuSubmenu-CixrY1Rf.js";import"./modalStack-CW-tpCu1.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Dk7cYo_a.js";import"./clipboard-2JMCt61L.js";import"./Markdown-DfnrvfFQ.js";import"./Callout-KkLU15FA.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BoBZ9fk7.js";import"./CodeDiff-Ck1vMpg0.js";import"./SegmentedControl-DNqVRP3z.js";import"./HighlightedTokens-CV0T2ZUG.js";import"./JsonView-BR2t-zou.js";import"./Tabs-XS6FYlxM.js";import"./TabButton-Cs6rMuv4.js";import"./Modal-COLLltVY.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Cb8AFbWk.js";import"./HoverCard-D1K6Mo-k.js";import"./Badge-85OJYi09.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

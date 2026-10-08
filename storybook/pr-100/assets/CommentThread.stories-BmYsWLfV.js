import{j as n}from"./iframe-PIqemlGB.js";import{C as f}from"./CommentThread-ctQIHbex.js";import{u as T,a as h,s as C}from"./comment-fixtures-VicW--0H.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Icon-BnoLxMF1.js";import"./DropdownMenu-BJXir522.js";import"./floating-ui.react-xo2j_cLW.js";import"./index-32mlo6to.js";import"./index-DewUnPhR.js";import"./button-Cpqh3UK7.js";import"./index-CPURVhFy.js";import"./loading-CckofzUs.js";import"./DropdownMenuSubmenu-B4D0dxHv.js";import"./modalStack-CRXEK55e.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BlDA8Cm2.js";import"./clipboard-C91Voyq7.js";import"./Markdown-Dh60rE2A.js";import"./Callout-Dvt7aLtY.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-j2E1n8ER.js";import"./CodeDiff-Dg5qylaS.js";import"./SegmentedControl-BPtmGqZE.js";import"./HighlightedTokens-B_4xh0bQ.js";import"./JsonView-r0_NeGqp.js";import"./AccordionList-wX34OlLO.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DB04oQsn.js";import"./Tabs-D4tINL9H.js";import"./TabButton-McWPnlib.js";import"./Modal-CZcXzZ1_.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-qAtr0HKB.js";import"./HoverCard-B7Vt-bLX.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ao={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const io=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,io as __namedExportsOrder,ao as default};

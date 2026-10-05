import{j as n}from"./iframe-DW9dAhLx.js";import{C as f}from"./CommentThread-BpUaqgZ1.js";import{u as T,a as h,s as C}from"./comment-fixtures-CBQZqqKs.js";import"./preload-helper-Bcd_tUTe.js";import"./utils-DW-IJACk.js";import"./Icon-DoAlPc9w.js";import"./DropdownMenu-CsIU3qeo.js";import"./floating-ui.react-FGKoCoTL.js";import"./index-DiWddUzE.js";import"./index-Cs0vdkxh.js";import"./button-CfAeUDeP.js";import"./index-CPURVhFy.js";import"./loading-Bax3wqdJ.js";import"./DropdownMenuSubmenu-BadwR1Tm.js";import"./modalStack-D91MpMqq.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-J9IFw9BU.js";import"./clipboard-yKsQfTMn.js";import"./Markdown-Dn8P8Ljn.js";import"./Callout-yh49Z4PH.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CjVUlwYp.js";import"./CodeDiff-CEMXqTRo.js";import"./SegmentedControl-CrfNu512.js";import"./HighlightedTokens-DH2GJFTr.js";import"./JsonView-B_IDkh71.js";import"./AccordionList-lICbzCbb.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-NamFkPhe.js";import"./Tabs-xqvpkPG8.js";import"./TabButton-Bg7t6i4L.js";import"./Modal-C6agGzel.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-thnvfzUh.js";import"./HoverCard-CHmcbby2.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ao={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

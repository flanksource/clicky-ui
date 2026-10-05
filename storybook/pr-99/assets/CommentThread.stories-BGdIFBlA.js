import{j as n}from"./iframe-3PyLJ2TM.js";import{C as f}from"./CommentThread-ZrScYNm9.js";import{u as T,a as h,s as C}from"./comment-fixtures-BF6Ve7Z5.js";import"./preload-helper-BCNcasCO.js";import"./utils-DW-IJACk.js";import"./Icon-BZD3ke3N.js";import"./DropdownMenu-8DmwIAK4.js";import"./floating-ui.react-oWH__shU.js";import"./index-CgLXIHcd.js";import"./index-qqzrnE86.js";import"./button-DwXbKSmw.js";import"./index-CPURVhFy.js";import"./loading-CSw9PWsW.js";import"./DropdownMenuSubmenu-CGWZ46fu.js";import"./modalStack-D5gAHSM-.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-HXE0D8cm.js";import"./clipboard-DNb_2N38.js";import"./Markdown-B6BG5aoN.js";import"./Callout-Cmq7j9Pv.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DVeBJfyW.js";import"./CodeDiff-BYp5iPYE.js";import"./SegmentedControl-BXINvaq-.js";import"./HighlightedTokens-0iEUn_qc.js";import"./JsonView-B5WpSyQF.js";import"./AccordionList-B0Y1Qj5k.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DlFZ3fZf.js";import"./Tabs-gLmjojF0.js";import"./TabButton-DIPp8wRQ.js";import"./Modal-CgHCFO42.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DCd51ujo.js";import"./HoverCard-C9nOd3IV.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ao={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

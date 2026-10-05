import{j as n}from"./iframe-DzQtIbNE.js";import{C as f}from"./CommentThread-rkTFJKFh.js";import{u as T,a as h,s as C}from"./comment-fixtures-qTrDZ8Kr.js";import"./preload-helper-BCNcasCO.js";import"./utils-DW-IJACk.js";import"./Icon-D3avtD1A.js";import"./DropdownMenu-EvEmNcHK.js";import"./floating-ui.react-BiyoKmlr.js";import"./index-BqViEYwi.js";import"./index-CxOWF1GZ.js";import"./button-BtjJwS_P.js";import"./index-CPURVhFy.js";import"./loading-CMaS212t.js";import"./DropdownMenuSubmenu-zqd_Qfyb.js";import"./modalStack-CV8pkEDx.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-geU96qYs.js";import"./clipboard-D8walV-w.js";import"./Markdown-DqiNf3uz.js";import"./Callout-CSi8gZUg.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BhTC3ydu.js";import"./CodeDiff-MdlLWqCc.js";import"./SegmentedControl-DqjzCbFU.js";import"./HighlightedTokens-BJPpGutf.js";import"./JsonView-a3SUPwE1.js";import"./AccordionList-MuFF2Dlu.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-Caehxr5C.js";import"./Tabs-DLwqjgsI.js";import"./TabButton-C_FiNdfI.js";import"./Modal-BvPI2Llq.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CwzuTuoJ.js";import"./HoverCard-BmMl7y5E.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ao={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

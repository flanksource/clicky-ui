import{j as n}from"./iframe-i4NO8c1E.js";import{C as f}from"./CommentThread-LCEOfy9T.js";import{u as T,a as h,s as C}from"./comment-fixtures-C2TM5Zrn.js";import"./preload-helper-BlVIKJwt.js";import"./utils-DW-IJACk.js";import"./Icon-0OQ-QiFy.js";import"./DropdownMenu-D0XmeiBD.js";import"./floating-ui.react-CZe8-7HK.js";import"./index-DWciXVe1.js";import"./index-DEkhUzMm.js";import"./button-IkBZAOc5.js";import"./index-CPURVhFy.js";import"./loading-DnEu1w-x.js";import"./DropdownMenuSubmenu-DDvaJL7u.js";import"./modalStack-BYsD3NGk.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B96gaCV7.js";import"./clipboard-XSfXkzSq.js";import"./Markdown-T9MgalT6.js";import"./Callout-B72S23hh.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BGsGTuKI.js";import"./CodeDiff-B_gaadla.js";import"./SegmentedControl-BZS04MJf.js";import"./HighlightedTokens-CQy1Ma1d.js";import"./JsonView-Dj4e_qpk.js";import"./Tabs-1046vJod.js";import"./TabButton-DgSuTMAc.js";import"./Modal-Dd2S2-_M.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-Dc_cDq8b.js";import"./HoverCard-RVi8pXL2.js";import"./Badge-B6MJiOJm.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

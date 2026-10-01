import{j as n}from"./iframe-DuizKdUp.js";import{C as f}from"./CommentThread-BwfUEwJG.js";import{u as T,a as h,s as C}from"./comment-fixtures-DNUuumkM.js";import"./preload-helper-DmsBQNJi.js";import"./utils-DW-IJACk.js";import"./Icon-B5qN7-mW.js";import"./DropdownMenu-B204fkhG.js";import"./floating-ui.react-BJgrq0bL.js";import"./index-CWqaA8lc.js";import"./index-I9h17460.js";import"./button-EYN6PCXm.js";import"./index-CPURVhFy.js";import"./loading-C8ciqA58.js";import"./DropdownMenuSubmenu-BpKij5uD.js";import"./modalStack-CICKsGRF.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CbPd3kNP.js";import"./clipboard-DjOpdJpC.js";import"./Markdown-DxgH4Izd.js";import"./Callout-CIg8rdU-.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DqVnhkGz.js";import"./CodeDiff-Cm6WB7Oq.js";import"./SegmentedControl-7RGGGxjd.js";import"./HighlightedTokens-DhTsa_oz.js";import"./JsonView-DH4kfpVK.js";import"./Tabs-BE2QI28Q.js";import"./TabButton-C2-dUb4i.js";import"./Modal-DntpEIq8.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BX8-_MkX.js";import"./HoverCard-C3A1tRJ0.js";import"./Badge-CahpJAg3.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

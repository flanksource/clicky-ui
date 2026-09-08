import{j as n}from"./iframe-D7AEzmiZ.js";import{C as f}from"./CommentThread-Bna4wE9r.js";import{u as T,a as h,s as C}from"./comment-fixtures-CKKHeHCX.js";import"./preload-helper-hq9vNfsk.js";import"./utils-DW-IJACk.js";import"./Icon-BHlfVGs3.js";import"./DropdownMenu-Bs5Osu-C.js";import"./floating-ui.react-r1UfLjHW.js";import"./index-DOqUsOzE.js";import"./index-ChecR3Pf.js";import"./button-qcdX8b7r.js";import"./index-CPURVhFy.js";import"./loading-Cul39Clz.js";import"./DropdownMenuSubmenu-znATrmj7.js";import"./modalStack-BBzzK_XK.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Bv3kvEK-.js";import"./clipboard-DckDwBhc.js";import"./Markdown-KVUZpP7_.js";import"./Callout-BY-6BVcJ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B58cdzam.js";import"./CodeDiff-CanoRRN2.js";import"./SegmentedControl-BOXrsTFe.js";import"./HighlightedTokens-CqqQi_AL.js";import"./JsonView-DUzBdQDr.js";import"./Tabs-DGchpE-7.js";import"./TabButton-DpQjb1J9.js";import"./Modal-D4dCfCM0.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-u5RW0KK-.js";import"./HoverCard-D6mUI4fG.js";import"./Badge-Bdn1ojcv.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

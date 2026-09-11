import{j as n}from"./iframe-CFT3PPR7.js";import{C as f}from"./CommentThread-BxX8XsI5.js";import{u as T,a as h,s as C}from"./comment-fixtures-DV1ADy6e.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-BtbnjFB3.js";import"./DropdownMenu-BWzAonWM.js";import"./floating-ui.react-BIMNxrra.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./button-DVB_uS1L.js";import"./index-CPURVhFy.js";import"./loading-CZrrBIDI.js";import"./DropdownMenuSubmenu-CqV515YL.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BCSfLq1K.js";import"./clipboard-8ziqOpHM.js";import"./Markdown-DFnWOWZ4.js";import"./Callout-BVpd4aqO.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DxvH5hIX.js";import"./CodeDiff-CbE20wkz.js";import"./SegmentedControl-DhvSlB-L.js";import"./HighlightedTokens-C9CWsjZW.js";import"./JsonView-mYXqMmJi.js";import"./Tabs-Dz3pfaIs.js";import"./TabButton-Bb_deJay.js";import"./Modal-q-Oedu08.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar--sP3Z0sW.js";import"./HoverCard-emUxSVBc.js";import"./Badge-_cJrrU_8.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

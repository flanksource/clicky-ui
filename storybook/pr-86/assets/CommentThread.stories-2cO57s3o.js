import{j as n}from"./iframe-9fOldjr2.js";import{C as f}from"./CommentThread-BnQTdvS4.js";import{u as T,a as h,s as C}from"./comment-fixtures-CmVxA3i5.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-BkUgp3wm.js";import"./DropdownMenu-kAL-O-YL.js";import"./floating-ui.react-CNbHq_-f.js";import"./index-C34MHfKY.js";import"./index-Bi8EVZEl.js";import"./button-DHo1DwEi.js";import"./index-CPURVhFy.js";import"./loading-CEI-SvW7.js";import"./DropdownMenuSubmenu-KZosVDwz.js";import"./modalStack-C6PZaG8M.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-C0GmtTXm.js";import"./clipboard-DPyxlL9O.js";import"./Markdown-B-xDMMMn.js";import"./Callout-B5s2bFb0.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DgVzoKze.js";import"./CodeDiff-D64NQ070.js";import"./SegmentedControl-B5VHoHdT.js";import"./HighlightedTokens-BePCfC_h.js";import"./JsonView-DgqDpvMS.js";import"./Tabs-DEdPoTbD.js";import"./TabButton-DVlQQZma.js";import"./Modal-DUXQNAPs.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-C1cdo3Pd.js";import"./HoverCard-CDbRR8TA.js";import"./Badge-aYQWjHd1.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

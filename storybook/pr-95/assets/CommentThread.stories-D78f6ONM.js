import{j as n}from"./iframe-yuMqpJhb.js";import{C as f}from"./CommentThread-Ayxu8v8K.js";import{u as T,a as h,s as C}from"./comment-fixtures-CfWsoFVk.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Icon-DbERJsbC.js";import"./DropdownMenu-DvzMpi7l.js";import"./floating-ui.react-DiVVYB8B.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./button-FFEDo1GN.js";import"./index-CPURVhFy.js";import"./loading-C6QaURdm.js";import"./DropdownMenuSubmenu-CLNEOxi7.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CVr-VMtf.js";import"./clipboard-C2xHyLA0.js";import"./Markdown-S81DzjC-.js";import"./Callout-rnh0q618.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BCbuh5Mz.js";import"./CodeDiff-CdsCzbWc.js";import"./SegmentedControl-CItDZC2L.js";import"./HighlightedTokens-Mt22SU9Y.js";import"./JsonView-Cjjo78UN.js";import"./Tabs-CsHq-BwK.js";import"./TabButton-CCzxMUU1.js";import"./Modal-CvmmoTwj.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DQPNoLTv.js";import"./HoverCard-DVGyFeXQ.js";import"./Badge-BxnYNHl7.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-Bh7XXvys.js";import{C as f}from"./CommentThread-B8ha6gvf.js";import{u as T,a as h,s as C}from"./comment-fixtures-BtE4AMZD.js";import"./preload-helper-DzyrSNK7.js";import"./utils-DW-IJACk.js";import"./Icon-HQuVCsfR.js";import"./DropdownMenu-ZUX5bVZ1.js";import"./floating-ui.react-Xu8Hg7vD.js";import"./index-C-nyn1b0.js";import"./index-C0HwEZFo.js";import"./button-1zr2H7Tt.js";import"./index-CPURVhFy.js";import"./loading-BeWAmKFr.js";import"./DropdownMenuSubmenu-DuIW7Os6.js";import"./modalStack-DDawoPWy.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Dhj6IOrJ.js";import"./clipboard-BwnVneA-.js";import"./Markdown-DI2qKUgw.js";import"./Callout-CFDGF_2w.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CNdaE9kq.js";import"./CodeDiff-h0y6egaP.js";import"./SegmentedControl-MRt2Qwr_.js";import"./HighlightedTokens-DT3JqQgF.js";import"./JsonView-BMDAgC3Z.js";import"./Tabs-ChG5JYmQ.js";import"./TabButton-C9_TP7uQ.js";import"./Modal-VGGZ0I7U.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DO-SIeW0.js";import"./HoverCard-iVElIAfc.js";import"./Badge-CLQjTA0o.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

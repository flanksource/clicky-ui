import{j as n}from"./iframe-Cvtq5r5o.js";import{C as f}from"./CommentThread-CvuxG-ak.js";import{u as T,a as h,s as C}from"./comment-fixtures-ySNFSY6z.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Icon-AK-L3art.js";import"./DropdownMenu-CpW9tjic.js";import"./floating-ui.react-Cvq7eJTv.js";import"./index-ClajA7XS.js";import"./index-kUH0lmcJ.js";import"./button-D_f9KbYW.js";import"./index-CPURVhFy.js";import"./loading-DKOjjMZb.js";import"./DropdownMenuSubmenu-BdylLhlN.js";import"./modalStack-Br6WXpFW.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B_GMwT6T.js";import"./clipboard-DSCX79XO.js";import"./Markdown-BMJ3OLZx.js";import"./Callout-DX0CZmH_.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DO3W0pdQ.js";import"./CodeDiff-_RtAmjv0.js";import"./SegmentedControl-f6EmF-nP.js";import"./HighlightedTokens-Ct2ZVa0K.js";import"./JsonView-DJPIgKT4.js";import"./Tabs-CdznXGlv.js";import"./TabButton-CgNYvDzl.js";import"./Modal-B2iT9EIZ.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-BA3oh7dv.js";import"./HoverCard-DLH-UG-1.js";import"./Badge-BzeiO1Yp.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

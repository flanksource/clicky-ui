import{j as n}from"./iframe-DjmnUs_s.js";import{C as f}from"./CommentThread-Bn2lxP53.js";import{u as T,a as h,s as C}from"./comment-fixtures-CfOKbW6R.js";import"./preload-helper-BlVIKJwt.js";import"./utils-DW-IJACk.js";import"./Icon-CWJyCkxy.js";import"./DropdownMenu-BzgZIIYx.js";import"./floating-ui.react-DWJ6pxmL.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./button-DfMIapuu.js";import"./index-CPURVhFy.js";import"./loading-jlJ4TQvy.js";import"./DropdownMenuSubmenu-CYFI-0pu.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-CmdsIa3O.js";import"./clipboard-B_0f2RyG.js";import"./Markdown-Ct8gYZjV.js";import"./Callout-BEELvTOR.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BKY-n_kB.js";import"./CodeDiff-CvJ1rh3J.js";import"./SegmentedControl-C3smeAq4.js";import"./HighlightedTokens-CwICtm63.js";import"./JsonView-0809oQhO.js";import"./Tabs-BLeZnaKq.js";import"./TabButton-CoqXHxdt.js";import"./Modal-DJ5NvytA.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-0S5oksD-.js";import"./HoverCard-dWtrhYr9.js";import"./Badge-DRzP6dli.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

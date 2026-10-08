import{j as n}from"./iframe-49i2VeV0.js";import{C as f}from"./CommentThread-DM8VdZFy.js";import{u as T,a as h,s as C}from"./comment-fixtures-Bj31WE_O.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Icon-CQyVAhLN.js";import"./DropdownMenu-zKmQ3di2.js";import"./floating-ui.react-D9st_Ili.js";import"./index-BmfiYcQm.js";import"./index-COeekDrS.js";import"./button-BGdRDUEK.js";import"./index-CPURVhFy.js";import"./loading-ivhQ-8Oz.js";import"./DropdownMenuSubmenu-DjDp9DGD.js";import"./modalStack-DtPrVreh.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Dm6t185l.js";import"./clipboard-CGzctRdR.js";import"./Markdown-DGRLI0EC.js";import"./Callout-NqoBpdJp.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DanP_04g.js";import"./CodeDiff-BoZLkBEw.js";import"./SegmentedControl-DQyG9Uij.js";import"./HighlightedTokens-BQjA9qCL.js";import"./JsonView-CZgQJ4VW.js";import"./AccordionList-DKmKrDqZ.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DmOWNVI_.js";import"./Tabs-DqMFugCo.js";import"./TabButton-XUErfeSn.js";import"./Modal-C0PiPlai.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-CoL1m-FG.js";import"./HoverCard-Nv6W7Mzd.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,ao={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

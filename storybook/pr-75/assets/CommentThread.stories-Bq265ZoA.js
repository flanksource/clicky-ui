import{j as n}from"./iframe-RmXz6z0S.js";import{C as f}from"./CommentThread-C7sFzwfv.js";import{u as T,a as h,s as C}from"./comment-fixtures-C0XglBko.js";import"./preload-helper-CoNDIDFR.js";import"./utils-DW-IJACk.js";import"./Icon-C5PBASJ5.js";import"./DropdownMenu-CnJq5_O0.js";import"./floating-ui.react-CS_5YbfH.js";import"./index-Dcplh2pp.js";import"./index-B9HoHPg8.js";import"./button-CGTHhixy.js";import"./index-CPURVhFy.js";import"./loading-BitfFYjk.js";import"./DropdownMenuSubmenu-_lJsyYNk.js";import"./modalStack-BrOZVbb2.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-_IcWNS_T.js";import"./Modal-BFAiABMN.js";import"./Badge-CdYIPEjV.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-B3syv6eh.js";import"./HoverCard-DfO4Rl00.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(v=(w=e.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const z=["Default","WithMentionAutocomplete"];export{t as Default,e as WithMentionAutocomplete,z as __namedExportsOrder,q as default};

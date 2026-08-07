import{j as n}from"./iframe-BMFBCv_6.js";import{C as f}from"./CommentThread-DCX3Pcx0.js";import{u as T,a as h,s as C}from"./comment-fixtures-tmdVnD2t.js";import"./preload-helper-XHXHPdWU.js";import"./utils-CR52uffu.js";import"./Icon-rDmXslRI.js";import"./DropdownMenu-TalBA55R.js";import"./floating-ui.react-iWwRdKWF.js";import"./index-Dbcmk1Ba.js";import"./index-C0LRYh99.js";import"./button-DdAX4yWv.js";import"./index-0zBpNI7D.js";import"./loading-6hDWTPbr.js";import"./DropdownMenuSubmenu-YgknNbsv.js";import"./modalStack-vzTQsCJ3.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-BdS6Z4kT.js";import"./Badge--gSTK7-C.js";import"./Modal-C2tSaU6I.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-B3rQicPA.js";import"./HoverCard-CfIJkTvI.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

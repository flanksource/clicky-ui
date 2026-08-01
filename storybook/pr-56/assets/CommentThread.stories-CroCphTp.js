import{j as n}from"./iframe-DbCl_ZTc.js";import{C as f}from"./CommentThread-BGexupk6.js";import{u as T,a as h,s as C}from"./comment-fixtures-BEjY-bE2.js";import"./preload-helper-DArPGhL4.js";import"./utils-CR52uffu.js";import"./Icon-BLEFF23r.js";import"./DropdownMenu-Bxittvr2.js";import"./floating-ui.react-313NX-TC.js";import"./index-urVF_qKJ.js";import"./index-Bq5CuWor.js";import"./button-BvGBn064.js";import"./index-0zBpNI7D.js";import"./loading-BASxxKF3.js";import"./DropdownMenuSubmenu-Btp3LiIs.js";import"./modalStack-B2V66lx-.js";import"./zIndex-CigQ76av.js";import"./CommentThreadList-BqOQJcA3.js";import"./Badge-nvGMoKaP.js";import"./Modal-3wB0or_4.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-B4D1UcFT.js";import"./HoverCard-BpHpCleG.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-Cui5-lWu.js";import{C as f}from"./CommentThread-JzoSpmf7.js";import{u as T,a as h,s as C}from"./comment-fixtures-BgNCibF7.js";import"./preload-helper-C9Uksf5K.js";import"./utils-DW-IJACk.js";import"./Icon-DK_SiWhj.js";import"./DropdownMenu-1sKun-B3.js";import"./floating-ui.react-CERrJHOI.js";import"./index-EXwF3-1q.js";import"./index-Cd5L4RPL.js";import"./button-B1GBh7k-.js";import"./index-CPURVhFy.js";import"./loading-Dsn8OLUr.js";import"./DropdownMenuSubmenu-BZtutcE9.js";import"./modalStack-BWOZdhrQ.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-Cv2qogJv.js";import"./Badge-Nh1zFh-t.js";import"./Modal-BDeNABtC.js";import"./timestamp-format-CIXhO4AH.js";import"./Avatar-dALHSkH3.js";import"./HoverCard-BsCmg4MU.js";const{expect:p,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,q={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:s,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:s,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const m=await r(document.body).findByTestId("mention-popover");await p(m).toBeInTheDocument();const x=await r(m).findByRole("option",{name:/claude/});await i.click(x),await p(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{j as n}from"./iframe-psk4-kN7.js";import{C as f}from"./CommentThread-DwoQBPsZ.js";import{u as T,a as h,s as C}from"./comment-fixtures-9GOro4fN.js";import"./preload-helper-DUVrmzNZ.js";import"./utils-DW-IJACk.js";import"./Icon-CGpuyfCp.js";import"./DropdownMenu-BV9KNdAW.js";import"./floating-ui.react-BIHz11iz.js";import"./index-DdkbI2pk.js";import"./index-Q2ctqHt2.js";import"./button-CPGxxxwO.js";import"./index-CPURVhFy.js";import"./loading-D0L0VhvC.js";import"./DropdownMenuSubmenu-CB5wmKqJ.js";import"./modalStack-BlX58fkl.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-zAZ4Cvz0.js";import"./clipboard-Bb1ErbfT.js";import"./Markdown-BKM7-IWn.js";import"./Callout-BB-1hbfd.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-ahqySRwc.js";import"./CodeDiff-HhQN2est.js";import"./SegmentedControl-CdMMoXut.js";import"./HighlightedTokens-aqA6-bm6.js";import"./JsonView-Dd4DfbVp.js";import"./Tabs-D5kmDdKf.js";import"./TabButton-CBw4x2oL.js";import"./Modal-DAN5RH3G.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-DRQEbk4e.js";import"./HoverCard-BWPHO9Mj.js";import"./Badge-C2sQY84x.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

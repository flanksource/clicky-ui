import{j as n}from"./iframe-DfHdXEmJ.js";import{C as f}from"./CommentThread-Bn_qQWHO.js";import{u as T,a as h,s as C}from"./comment-fixtures-C1rmMwuc.js";import"./preload-helper-CGPPAlEp.js";import"./utils-DW-IJACk.js";import"./Icon-B-z_boLM.js";import"./DropdownMenu-BvDvkP9V.js";import"./floating-ui.react-2Kyn_0pS.js";import"./index-E_kflO6L.js";import"./index-BA0XQxfj.js";import"./button-C-BhJjDF.js";import"./index-CPURVhFy.js";import"./loading-tTKTeWsM.js";import"./DropdownMenuSubmenu-DV6WMXuO.js";import"./modalStack-D7AkghjI.js";import"./zIndex-BGbNBNA8.js";import"./CommentThreadList-B22qXOIM.js";import"./clipboard-Bfjhc9Vb.js";import"./Markdown-bOFYYtYG.js";import"./Callout-BoYD9d5h.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-TWTbgwri.js";import"./CodeDiff-VG1WirI8.js";import"./SegmentedControl-D_5S0mj5.js";import"./HighlightedTokens-COXT88ay.js";import"./JsonView-DVoZPTSY.js";import"./Tabs-UpzefEK4.js";import"./TabButton-Bv5BJ5fC.js";import"./Modal-DNcElLvB.js";import"./timestamp-format-DJzkpO9P.js";import"./Avatar-chaM3kJu.js";import"./HoverCard-fbYchBHc.js";import"./Badge-DnRkYqSO.js";const{expect:s,userEvent:i,within:r}=__STORYBOOK_MODULE_TEST__,to={title:"Comments/CommentThread",component:f,parameters:{layout:"padded"},tags:["autodocs"]};function y({autoFocusComposer:a=!1}){const{comments:m,callbacks:o}=T(C);return n.jsx("div",{className:"max-w-xl",children:n.jsx(f,{comments:m,config:h,autoFocusComposer:a,...o})})}const t={render:()=>n.jsx(y,{})},e={render:()=>n.jsx(y,{autoFocusComposer:!0}),play:async({canvasElement:a})=>{const o=await r(a).findByTestId("comment-compose-input");await i.click(o),await i.type(o,"Looks good @cl");const p=await r(document.body).findByTestId("mention-popover");await s(p).toBeInTheDocument();const x=await r(p).findByRole("option",{name:/claude/});await i.click(x),await s(o.value).toContain("@claude")}};var c,u,d;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

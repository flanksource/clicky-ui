import{j as r,r as l}from"./iframe-DFIXOaVS.js";import{P as u}from"./index-Dc5YNE3O.js";import"./preload-helper-BDLXYeas.js";import"./button-yXFyyoCV.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CZSR_umZ.js";import"./Modal-7Bguwvl8.js";import"./index-CMlS72mc.js";import"./index-CdL49atw.js";import"./Icon-hb4cd-6v.js";import"./modalStack-Cozz4jw4.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-gu_TL_EI.js";import"./Attachment-In4DS18P.js";import"./RuntimeBar-ppyNc5-t.js";import"./runtime-mode-BX90g_br.js";import"./SegmentedControl-D6HJ0JLN.js";import"./DropdownMenu-DAPEMyBH.js";import"./floating-ui.react-BezqsR5e.js";import"./DropdownMenuSubmenu-q_knwM8l.js";import"./InputField-Rk1JrPIp.js";import"./use-hotkey-C9D8QXTF.js";import"./index-D9eiz9Dn.js";import"./JsonSchemaForm-C9SjIJZc.js";import"./Properties-CGvN7b2k.js";import"./IconButton-DgfDWcdE.js";import"./HoverCard-DxWmZ8ds.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-B177YxYp.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-D8F_flpq.js";import"./FilterPill-CyAoVXgo.js";import"./DateField-rAnBkGTA.js";import"./DatePicker-7ftIhiS4.js";import"./DateTimePicker-CaC5t6jx.js";import"./TreePickerField-Bsu1OMNG.js";import"./Tree-BhjglWE5.js";import"./TreeNode-d28evm8T.js";import"./ListMenu-xzNKtxeQ.js";import"./Markdown-CaMOFpMM.js";import"./Callout-DdSMKINu.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DZkDKY5L.js";import"./CodeDiff-BIi2VwnF.js";import"./HighlightedTokens-B3f0PYmL.js";import"./JsonView-CeIsKIBx.js";import"./Switch-2VJ5qiHb.js";import"./SecretKeySelector-Cy-7MbBx.js";import"./index-DQyeb5uK.js";import"./icon-menu-picker-Z8GjEcBE.js";import"./ProviderStatusPanel-oOpP_jzE.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-DtVvGcuJ.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-BrEtrSyA.js";import"./FixtureEditor-Dn0aEcTG.js";import"./MdxEditorField-B1s6t8pz.js";import"./public-api-BjCjxHuM.js";import"./Badge-O6dyEcpn.js";import"./Field-D2Ae4KhN.js";import"./MultiSelect-BI4QkDuZ.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const Dt={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <CanonicalRequestStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", {
      name: "Runtime 1"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();

    // A comparison row seeds from the first row's backend and becomes
    // removable, so both rows carry their own controls.
    await userEvent.click(canvas.getByRole("button", {
      name: "Add runtime"
    }));
    const second = await canvas.findByRole("group", {
      name: "Runtime 2"
    });
    await expect(within(second).getByRole("group", {
      name: "Runtime 2 controls"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Remove runtime 2"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove runtime 2"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(c=(p=o.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const ft=["CanonicalRequest"];export{o as CanonicalRequest,ft as __namedExportsOrder,Dt as default};

import{j as r,r as l}from"./iframe-DAGeDdmW.js";import{P as u}from"./index-C2kgJJFR.js";import"./preload-helper-CcRYDqr-.js";import"./button-B7rSq3cQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-bJuzykOR.js";import"./Modal-D6taPS5_.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./Icon-IzT7REGK.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-c6eabZaZ.js";import"./Attachment-BbBX1jLc.js";import"./RuntimeBar-CDuKfnbi.js";import"./runtime-mode-D8JK8RDW.js";import"./SegmentedControl-Cbj_nPje.js";import"./DropdownMenu-JxGWd7zY.js";import"./floating-ui.react-BkCnCGeJ.js";import"./DropdownMenuSubmenu-YmOPmNs-.js";import"./InputField-BtoOCCX_.js";import"./use-hotkey-DFuX1p0d.js";import"./index-rQO_JsZT.js";import"./JsonSchemaForm-DS6x3TJI.js";import"./Properties-DcW2ye_v.js";import"./IconButton-Cr79YAU0.js";import"./HoverCard-BVfeNivj.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-HGgQ0fO7.js";import"./FilterPill-DV-iQbbS.js";import"./DateField-DKHhbfVj.js";import"./DatePicker-COd_80o4.js";import"./DateTimePicker-Bwg-aphn.js";import"./TreePickerField-BFLdKeen.js";import"./Tree-Bl2ptou_.js";import"./TreeNode-BRKxvKVJ.js";import"./AccordionList-dE_xnsfz.js";import"./ListMenu-Yo-nkfof.js";import"./Markdown-BYALqHHY.js";import"./Callout-CBHNV6Pc.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B6Z1SYpv.js";import"./CodeDiff-DIxTmBMR.js";import"./HighlightedTokens-CQRR7KfC.js";import"./JsonView-CndWyCj7.js";import"./Switch-CyhDsEiB.js";import"./SecretKeySelector-BrM6NlyA.js";import"./index-WFHNvFaJ.js";import"./icon-menu-picker-CsA87quO.js";import"./ProviderStatusPanel-Axl3g2P6.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-CErbwjcz.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-BkNWrWmJ.js";import"./FixtureEditor-DoKH4co_.js";import"./MdxEditorField-CK3GcF60.js";import"./public-api-BjCjxHuM.js";import"./Badge-W8TfuLL4.js";import"./Field-BJaBMPnv.js";import"./MultiSelect-BlqhYQ5i.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const ft={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(c=(p=o.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const It=["CanonicalRequest"];export{o as CanonicalRequest,It as __namedExportsOrder,ft as default};

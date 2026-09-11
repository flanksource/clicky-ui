import{j as r,r as l}from"./iframe-CFT3PPR7.js";import{P as u}from"./index-wxLvFd65.js";import"./preload-helper-CcRYDqr-.js";import"./button-DVB_uS1L.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CZrrBIDI.js";import"./Modal-q-Oedu08.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./Icon-BtbnjFB3.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CVdbDcc6.js";import"./Attachment-DdRC3OUa.js";import"./RuntimeBar-Bmxh0gLK.js";import"./runtime-mode-Dhq3og3a.js";import"./SegmentedControl-DhvSlB-L.js";import"./DropdownMenu-BWzAonWM.js";import"./floating-ui.react-BIMNxrra.js";import"./DropdownMenuSubmenu-CqV515YL.js";import"./InputField-CbwEKg9Y.js";import"./use-hotkey-D-Zkbmvo.js";import"./index-CLJPZXmO.js";import"./JsonSchemaForm-DHNltyVS.js";import"./Properties-C4f_yUo4.js";import"./IconButton-nSFQuYkv.js";import"./HoverCard-emUxSVBc.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-JcCkqfEl.js";import"./FilterPill-aZ9lMIbE.js";import"./DateField-B1aYDo2a.js";import"./DatePicker-XZnrCr23.js";import"./DateTimePicker-BvZoFhZz.js";import"./TreePickerField-BBNZt-wq.js";import"./Tree-BG8yCHo2.js";import"./TreeNode-CaLChSXB.js";import"./AccordionList-BCCxK_wQ.js";import"./ListMenu-CuVqbN-t.js";import"./Markdown-DFnWOWZ4.js";import"./Callout-BVpd4aqO.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DxvH5hIX.js";import"./CodeDiff-CbE20wkz.js";import"./HighlightedTokens-C9CWsjZW.js";import"./JsonView-mYXqMmJi.js";import"./Switch-B0Q5juTu.js";import"./SecretKeySelector-QIk4cP6B.js";import"./index-U8fu4Fjz.js";import"./icon-menu-picker-BU8uFih9.js";import"./ProviderStatusPanel-BqpbQRRk.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-CsjSCLod.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-JkmA92Jb.js";import"./FixtureEditor-BaRyCar6.js";import"./MdxEditorField-zw2dE54u.js";import"./public-api-BjCjxHuM.js";import"./Badge-_cJrrU_8.js";import"./Field-DKm9ygT-.js";import"./MultiSelect-BA9DLaOZ.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const ft={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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

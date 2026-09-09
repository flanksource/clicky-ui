import{j as r,r as l}from"./iframe-BNefQpor.js";import{P as u}from"./index-DWTP_B6a.js";import"./preload-helper-BvsCWBK3.js";import"./button-DzbDFHiG.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C39MVSz-.js";import"./Modal-0C9g1z3t.js";import"./index-DPbJXMEv.js";import"./index-C0j4VFB1.js";import"./Icon-Wyal3cEo.js";import"./modalStack-Ex--0n26.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BN1AOue_.js";import"./Attachment-CV4IiUHn.js";import"./RuntimeBar-c3w8iDvo.js";import"./runtime-mode-D5NYbmXs.js";import"./SegmentedControl-DFDUwH_x.js";import"./DropdownMenu-CC-C7gGw.js";import"./floating-ui.react-CAaUf1g-.js";import"./DropdownMenuSubmenu-DHHN9TUM.js";import"./InputField-CnUXxoKM.js";import"./use-hotkey-Dgm7tbhs.js";import"./index-BqfKj-_X.js";import"./JsonSchemaForm-B0Ay_x0b.js";import"./Properties-DtWRSIUU.js";import"./IconButton-B46C5Nql.js";import"./HoverCard-BT2elvub.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-C53uLMSE.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DQBzXAlP.js";import"./FilterPill-B-I7OT5q.js";import"./DateField-D-C4B61z.js";import"./DatePicker-C73OXVPF.js";import"./DateTimePicker-m-mQGuIY.js";import"./TreePickerField-DVOcjYW8.js";import"./Tree-DW8edlsO.js";import"./TreeNode-DBuNdeiV.js";import"./ListMenu-B5m-fv8m.js";import"./Markdown-3UsW7Lcy.js";import"./Callout-UDl0mx9v.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-cPHBUwLq.js";import"./CodeDiff-CutDbvTd.js";import"./HighlightedTokens-CkaeK1Qo.js";import"./JsonView-DvOBxzDj.js";import"./Switch-Br77-RsA.js";import"./SecretKeySelector-hKUnz1He.js";import"./index-DA3YuafW.js";import"./icon-menu-picker-Cj4Uf-pU.js";import"./ProviderStatusPanel-DJwf5CpC.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-K3lJ_t0F.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-37tBAoJG.js";import"./FixtureEditor-DLvUejoG.js";import"./MdxEditorField--01lngPo.js";import"./public-api-BjCjxHuM.js";import"./Badge-8CVShKQz.js";import"./Field-cTHvB-SN.js";import"./MultiSelect-Bu2fQyw8.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const Dt={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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

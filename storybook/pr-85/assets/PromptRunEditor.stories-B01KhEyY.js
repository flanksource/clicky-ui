import{j as r,r as l}from"./iframe-DdgNogAy.js";import{P as u}from"./index-Dl0-CUye.js";import"./preload-helper-BvsCWBK3.js";import"./button-CzjW30CI.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-wD2sCDq3.js";import"./Modal-3z7NTFVw.js";import"./index-B6mQjjqS.js";import"./index-Sl_STJ6n.js";import"./Icon-Cj3ZeRuU.js";import"./modalStack-DWC2-Zws.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-rX80vYDB.js";import"./Attachment-DW6jck3U.js";import"./RuntimeBar-BxDVr3ZR.js";import"./runtime-mode-DSWkWcEr.js";import"./SegmentedControl-Bv_vn1Rv.js";import"./DropdownMenu-D2g063jE.js";import"./floating-ui.react-Dbg33d5m.js";import"./DropdownMenuSubmenu-BYLlZJBu.js";import"./InputField-CHA1FFOf.js";import"./use-hotkey-BxWu26v8.js";import"./index-DXoxloph.js";import"./JsonSchemaForm-DARI-nkF.js";import"./Properties-gNwlSA00.js";import"./IconButton-B9kFZJ2L.js";import"./HoverCard-jnz4TehU.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-B2gvGDu0.js";import"./FilterPill-D2w9E3G0.js";import"./DateField-VfCqTrL3.js";import"./DatePicker-CZZY3psr.js";import"./DateTimePicker-CViqF8Rs.js";import"./TreePickerField-BudUZrqt.js";import"./Tree-Dj3zr1Vr.js";import"./TreeNode-Db4ZmAqC.js";import"./AccordionList-t2Y7kcib.js";import"./ListMenu-BbyATQkY.js";import"./Markdown-DuCvMZLJ.js";import"./Callout-D0_z7fbN.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B51oKzRt.js";import"./CodeDiff-0j-Ub4yH.js";import"./HighlightedTokens-AVP7rVb3.js";import"./JsonView-xlYTqv5C.js";import"./Switch-DkD8BFns.js";import"./SecretKeySelector-Ccv5Xm9e.js";import"./index-Ba8kPy08.js";import"./icon-menu-picker-BffQeMlJ.js";import"./ProviderStatusPanel-CvRFd6P6.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-mF5SXl1r.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-DNtLnsaG.js";import"./FixtureEditor-JmbA3M2-.js";import"./MdxEditorField-DcUAS1wk.js";import"./public-api-BjCjxHuM.js";import"./Badge-Cx54087I.js";import"./Field-DNqXAllk.js";import"./MultiSelect-CohJxBry.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const ft={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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

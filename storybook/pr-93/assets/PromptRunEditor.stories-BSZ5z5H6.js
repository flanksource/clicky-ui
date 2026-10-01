import{j as a,r as g}from"./iframe-DuizKdUp.js";import{P as c}from"./index-DFvpzAxJ.js";import{S as w}from"./index-vuq1SsHr.js";import"./preload-helper-DmsBQNJi.js";import"./SegmentedControl-7RGGGxjd.js";import"./utils-DW-IJACk.js";import"./Icon-B5qN7-mW.js";import"./Modal-DntpEIq8.js";import"./index-CWqaA8lc.js";import"./index-I9h17460.js";import"./button-EYN6PCXm.js";import"./index-CPURVhFy.js";import"./loading-C8ciqA58.js";import"./modalStack-CICKsGRF.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-A4fXHvly.js";import"./runtime-mode-_5wpENoX.js";import"./runtime-spec-fields-uwXP87bP.js";import"./InputField-WT5w7twt.js";import"./use-hotkey-BTef5fds.js";import"./RuntimeBar-BjqXhgwz.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-B204fkhG.js";import"./floating-ui.react-BJgrq0bL.js";import"./DropdownMenuSubmenu-BpKij5uD.js";import"./Combobox-B_sNXcFv.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-zpYFv9g6.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-BaIKyXeA.js";import"./agent-action-icons-DpNNemYt.js";import"./permissions-model-CnKtREWB.js";import"./tool-policy-D90x3NRy.js";import"./types-B4ZMggem.js";import"./Attachment-DmQDBqMS.js";import"./JsonSchemaForm-BlPxefUM.js";import"./Properties-BzSgKCLH.js";import"./IconButton-52triCwN.js";import"./HoverCard-C3A1tRJ0.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CCT7Ld0Q.js";import"./DatePicker-sFw0tXPj.js";import"./DateTimePicker-Dk93s1OM.js";import"./TreePickerField-B9HKAygI.js";import"./Tree-B9okr9re.js";import"./TreeNode-CKkPOh9J.js";import"./AccordionList-Dj0uxSzR.js";import"./ListMenu-iHcY27ui.js";import"./Markdown-DxgH4Izd.js";import"./Callout-CIg8rdU-.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DqVnhkGz.js";import"./CodeDiff-Cm6WB7Oq.js";import"./HighlightedTokens-DhTsa_oz.js";import"./JsonView-DH4kfpVK.js";import"./use-runtime-preset-menu-DdGn16MU.js";import"./MultiSelect-CNmQbm4f.js";import"./Field-BDdoV-9V.js";import"./Switch-DvPGFcJi.js";import"./SecretKeySelector-CqHExvYT.js";import"./index-D7c_i4BZ.js";import"./icon-menu-picker-D7t_6UMd.js";import"./ProviderStatusPanel-D6wpG592.js";import"./SandboxCreateWizard-DnteOgU6.js";import"./Tabs-BE2QI28Q.js";import"./TabButton-C2-dUb4i.js";import"./FixtureEditor-Mfxvfx5D.js";import"./public-api-BjCjxHuM.js";import"./Badge-CahpJAg3.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Le={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

    // Multi-model seeds a comparison row from the first row's mode; rows only
    // become removable past the two a comparison needs.
    await userEvent.click(canvas.getByRole("radio", {
      name: "Multi-model"
    }));
    const second = await canvas.findByRole("group", {
      name: "Runtime 2"
    });
    await expect(within(second).getByRole("group", {
      name: "Runtime 2 controls"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Add runtime"
    }));
    await userEvent.click(await canvas.findByRole("button", {
      name: "Remove runtime 3"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 3"
    })).not.toBeInTheDocument();

    // Permissions and Advanced belong to the spec, so comparison rows share one
    // actions section rather than repeating it per row.
    await expect(canvas.getAllByTitle("Runtime options")).toHaveLength(1);
    await userEvent.click(canvas.getByRole("radio", {
      name: "Single model"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(l=(s=r.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};var u,d,y;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <TabbedSpecStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByTitle("Runtime options")).not.toBeInTheDocument();
    await userEvent.click(within(canvas.getByRole("list", {
      name: "Recently used runtimes"
    })).getByRole("button"));
    await expect(within(canvas.getByRole("group", {
      name: "Runtime 1 controls"
    })).getByTitle("Model — gpt-5.5")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", {
      name: "System Prompt"
    }));
    await expect(canvas.getByLabelText("System")).toHaveValue("Be precise");
    await userEvent.click(canvas.getByRole("tab", {
      name: "Model"
    }));
    await expect(canvas.getByRole("region", {
      name: "Model"
    })).toHaveTextContent("Max tokens");
  }
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const Oe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Oe as __namedExportsOrder,Le as default};

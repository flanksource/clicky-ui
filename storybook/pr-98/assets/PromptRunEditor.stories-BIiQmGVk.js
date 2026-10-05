import{j as i,r as w}from"./iframe-CRAMrqdr.js";import{P as p}from"./index-y_Koes6-.js";import{S as v}from"./index-CXNvnm0h.js";import"./preload-helper-BpddQVpQ.js";import"./SegmentedControl-Cl1OXQjv.js";import"./utils-DW-IJACk.js";import"./Icon-BMbq9_zN.js";import"./Modal-oPG10GDr.js";import"./index-OBWOC1jm.js";import"./index-Dhhf_61s.js";import"./button-DMzgHLRl.js";import"./index-CPURVhFy.js";import"./loading-C6pXG8vv.js";import"./modalStack-CwY5BXIM.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-oP5kHoIV.js";import"./runtime-mode-k9nzSHUy.js";import"./runtime-spec-fields-Csw0wxZC.js";import"./InputField-CLH5FRh9.js";import"./use-hotkey-BTKM6kwI.js";import"./RuntimeBar-CPchiI3f.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-DfpWvqFK.js";import"./floating-ui.react-CfpWOLb9.js";import"./DropdownMenuSubmenu-Cfi5dRDD.js";import"./Combobox-BlOvR2S7.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-D2dqjYSS.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DSTPR6a4.js";import"./agent-action-icons-C5p3RLha.js";import"./permissions-model-DjmQFLIu.js";import"./tool-policy-D90x3NRy.js";import"./types-B4ZMggem.js";import"./Attachment-s5Axw7Bh.js";import"./JsonSchemaForm-DdOPa_UN.js";import"./Properties-CLxSZpPj.js";import"./IconButton-Dgyjf8-C.js";import"./HoverCard-Bb-2z-j6.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CT1CiZBD.js";import"./DatePicker-XjIRKG5L.js";import"./DateTimePicker-Qn5q0z3i.js";import"./TreePickerField-DEXQ-MOJ.js";import"./Tree-C3hD7EzX.js";import"./TreeNode-DbKuTGej.js";import"./AccordionList-mGiHjwh1.js";import"./ListMenu-Be4kQWAO.js";import"./Markdown-BPO4YHt_.js";import"./Callout-CkNgMlmU.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BvQviV8T.js";import"./CodeDiff-Dn7im8_m.js";import"./HighlightedTokens-XtgKphvB.js";import"./JsonView-lIQuAVJ4.js";import"./use-runtime-preset-menu-BZ3yYojQ.js";import"./MultiSelect-Djvz-tMb.js";import"./Field-BmmeqYhr.js";import"./Switch-C3HlhJTO.js";import"./SecretKeySelector-B8ZJBobV.js";import"./icon-menu-picker-CJzfKB8X.js";import"./ProviderStatusPanel-Cuu-egbO.js";import"./SandboxCreateWizard-B8cs6Dkr.js";import"./Tabs-9moBAYrL.js";import"./TabButton-96FXcghn.js";import"./FixtureEditor-jAAzrS2y.js";import"./public-api-BjCjxHuM.js";import"./Badge-D_cUJGQB.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Le={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
    // actions section rather than repeating it per row. Each row keeps its own
    // ⋮ menu for runtime settings such as effort.
    await expect(canvas.getAllByTitle("Runtime options").filter(trigger => !trigger.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1);
    await userEvent.click(canvas.getByRole("radio", {
      name: "Single model"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(d=(u=r.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var y,g,R;m.parameters={...m.parameters,docs:{...(y=m.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <TabbedSpecStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const controls = canvas.getByRole("group", {
      name: "Runtime 1 controls"
    });
    await userEvent.click(within(controls).getByTitle("Runtime options"));
    const options = await within(document.body).findByRole("menu", {
      name: "Runtime options"
    });
    await expect(within(options).queryByRole("menuitem", {
      name: "Advanced"
    })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Oe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Oe as __namedExportsOrder,Le as default};

import{j as a,r as g}from"./iframe-Ds09J1dT.js";import{P as c}from"./index-uNZeP9rO.js";import{S as w}from"./index-fs57mHEx.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-DeGdd1Jg.js";import"./utils-DW-IJACk.js";import"./Icon-CjZb5Sv7.js";import"./Modal-CAEMgpU8.js";import"./index-FPTpXdcx.js";import"./index-CF4fvYH8.js";import"./button-BqYgRAWV.js";import"./index-CPURVhFy.js";import"./loading-qMao84VB.js";import"./modalStack-CthqJ_T7.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-fZmM3zsk.js";import"./runtime-mode-B_b5fqbr.js";import"./IconButton-D6jNoLlm.js";import"./MultiSelect-Dx1CrEXI.js";import"./floating-ui.react-CgcPjn0G.js";import"./collections-CoHfwOze.js";import"./Attachment-S93A4kHF.js";import"./RuntimeBar-Erswdsyg.js";import"./InputField-Bn56kgk_.js";import"./use-hotkey-DKa9IzvG.js";import"./DropdownMenu-BzWciQ6u.js";import"./DropdownMenuSubmenu-3ngMhyLq.js";import"./Combobox-Duu-Ek4U.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DgRXGxvV.js";import"./JsonSchemaForm-DtET68ad.js";import"./Properties-D-Z2zNfa.js";import"./HoverCard-trfKQKGq.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-Cs4y1xQq.js";import"./DatePicker-C-r8Fdgu.js";import"./DateTimePicker-B390JZZP.js";import"./TreePickerField-C9ZlAzp_.js";import"./Tree-CfXYPUwg.js";import"./TreeNode-DllXDjN3.js";import"./AccordionList-DEAIUmwo.js";import"./ListMenu-34sXqApw.js";import"./Markdown-DbUry-Ba.js";import"./Callout-CiLJI5RG.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-V_xRb2SR.js";import"./CodeDiff-D-JoSWgL.js";import"./HighlightedTokens-qyGyaI1E.js";import"./JsonView-CU07Cie5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DHx6bw5U.js";import"./agent-action-icons-mArJvXKp.js";import"./RuntimeBarActions-B0jixisp.js";import"./Switch-D-Qu3AAI.js";import"./SecretKeySelector-BFaiFepK.js";import"./index-Ds33FuJz.js";import"./icon-menu-picker-BHidd-TP.js";import"./ProviderStatusPanel-BEGxa8q0.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-CL0UhvNp.js";import"./Tabs-DuqrcKp5.js";import"./TabButton-Q-1E5VFZ.js";import"./FixtureEditor-CaUsRYDe.js";import"./MdxEditorField-Bv0Nf8z1.js";import"./public-api-BjCjxHuM.js";import"./Badge-fcSLrmh7.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var s,p,l;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var u,d,y;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const Pe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Pe as __namedExportsOrder,je as default};

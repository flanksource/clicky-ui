import{j as a,r as g}from"./iframe-Dm9WDfFk.js";import{P as c}from"./index-BpOk7J9z.js";import{S as w}from"./index-DoO1tiHd.js";import"./preload-helper-C0z-shBz.js";import"./SegmentedControl-DaA1qzu_.js";import"./utils-DW-IJACk.js";import"./Icon-C0Xeje0M.js";import"./Modal-PsjUms9d.js";import"./index-Bx4ElzK1.js";import"./index-Dgu1a0Qq.js";import"./button-CENLUU5j.js";import"./index-CPURVhFy.js";import"./loading-CJ6V0nN9.js";import"./modalStack-CvvHbawO.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BfJNuKc4.js";import"./runtime-mode-BQ66h75Y.js";import"./IconButton-CjT-t9Vt.js";import"./MultiSelect-BTw-vIYs.js";import"./floating-ui.react-DeWqyg5S.js";import"./collections-CoHfwOze.js";import"./Attachment-B67KskgH.js";import"./RuntimeBar-ChEiZ5o0.js";import"./duration-BuesBvhN.js";import"./InputField-D8BJc-O5.js";import"./use-hotkey-BBqhoW5z.js";import"./DropdownMenu-DymU7aS1.js";import"./DropdownMenuSubmenu-BWkoW6LP.js";import"./Combobox-B6cKgKZT.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DLi3O7KQ.js";import"./JsonSchemaForm-DgOXt-2e.js";import"./Properties-Di6szT3e.js";import"./HoverCard-BSW2cf0b.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CoW1k3wl.js";import"./DatePicker-B-Unk9QS.js";import"./DateTimePicker-DdbNDnim.js";import"./TreePickerField-DQ253aIj.js";import"./Tree-BxNUFOEw.js";import"./TreeNode-BNtJUGlp.js";import"./AccordionList-BilkKqSM.js";import"./ListMenu-DM8yLBr4.js";import"./Markdown-BlWd-DKg.js";import"./Callout-COIy-KvZ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-4dLkcMVd.js";import"./CodeDiff-CgCKqRcG.js";import"./HighlightedTokens-BzzDcGha.js";import"./JsonView-CTnjgbsl.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DzX2-gyk.js";import"./agent-action-icons-BPJFvGot.js";import"./RuntimeBarActions-1pcjT0Ed.js";import"./Switch-CGPFVbsv.js";import"./SecretKeySelector-Jsny2A3E.js";import"./index-DeTidxWH.js";import"./icon-menu-picker-SpxFp5Be.js";import"./ProviderStatusPanel-iEnO2FGL.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-Crsp0x2J.js";import"./Tabs-DmmSsYKL.js";import"./TabButton-CKUc_3bC.js";import"./FixtureEditor-CvCjhcLD.js";import"./MdxEditorField-BvhlF1KN.js";import"./public-api-BjCjxHuM.js";import"./Badge-yGc8mW4C.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const He=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,He as __namedExportsOrder,Pe as default};

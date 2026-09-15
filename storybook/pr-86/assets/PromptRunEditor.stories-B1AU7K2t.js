import{j as a,r as R}from"./iframe-9fOldjr2.js";import{P as c}from"./index-CZcKdIU9.js";import{S as w}from"./index-CaqFdxjr.js";import"./preload-helper-CcRYDqr-.js";import"./button-DHo1DwEi.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CEI-SvW7.js";import"./SegmentedControl-B5VHoHdT.js";import"./Icon-BkUgp3wm.js";import"./Modal-DUXQNAPs.js";import"./index-C34MHfKY.js";import"./index-Bi8EVZEl.js";import"./modalStack-C6PZaG8M.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BQk1zGVE.js";import"./runtime-mode-DIFwvkyT.js";import"./IconButton-DGapLpij.js";import"./MultiSelect-BUfYPvta.js";import"./floating-ui.react-CNbHq_-f.js";import"./collections-CoHfwOze.js";import"./Attachment-DSDlKH4I.js";import"./RuntimeBar-Ppma73CR.js";import"./DropdownMenu-kAL-O-YL.js";import"./DropdownMenuSubmenu-KZosVDwz.js";import"./InputField-Cwl_hZbw.js";import"./use-hotkey-C1Ml39U9.js";import"./JsonSchemaForm-BproGHIV.js";import"./Properties-DtC8xiyA.js";import"./HoverCard-CDbRR8TA.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-Cdlj5MHl.js";import"./FilterPill-CHM0Kb7W.js";import"./DateField-CWzudzQX.js";import"./DatePicker-Dpsa50Ql.js";import"./DateTimePicker-BzPCAMNs.js";import"./TreePickerField-Beeoe910.js";import"./Tree-DwHYUdy_.js";import"./TreeNode-DO9UNtIs.js";import"./AccordionList-C5P9QYen.js";import"./ListMenu-CpkhJUac.js";import"./Markdown-B-xDMMMn.js";import"./Callout-B5s2bFb0.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DgVzoKze.js";import"./CodeDiff-D64NQ070.js";import"./HighlightedTokens-BePCfC_h.js";import"./JsonView-DgqDpvMS.js";import"./Switch-CAkvYbgl.js";import"./SecretKeySelector-7vbx1OhZ.js";import"./index-DPG4NjsX.js";import"./icon-menu-picker-4zOnA8cv.js";import"./ProviderStatusPanel-D83FEjQK.js";import"./types-B4ZMggem.js";import"./session-tones-DErC6cAM.js";import"./SandboxCreateWizard-CYj9mFu2.js";import"./permission-mode-visuals-nLflDo5-.js";import"./agent-action-icons-DRS5L0WY.js";import"./Tabs-DEdPoTbD.js";import"./TabButton-DVlQQZma.js";import"./FixtureEditor-C7f2KCry.js";import"./MdxEditorField-SGGm85Ob.js";import"./public-api-BjCjxHuM.js";import"./Badge-aYQWjHd1.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,g=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g})})}function h(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByRole("button",{name:"Edit spec"})).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
    await expect(canvas.queryByRole("button", {
      name: "Edit spec"
    })).not.toBeInTheDocument();
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

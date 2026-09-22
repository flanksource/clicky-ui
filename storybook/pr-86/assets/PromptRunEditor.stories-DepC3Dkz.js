import{j as a,r as g}from"./iframe-3q0eS6ZH.js";import{P as c}from"./index-BA42zPXE.js";import{S as w}from"./index-CpMYdzNu.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-DNqVRP3z.js";import"./utils-DW-IJACk.js";import"./Icon-CT7GZEqx.js";import"./Modal-COLLltVY.js";import"./index-Egog0RqP.js";import"./index-CiPsLEp7.js";import"./button-DHxo9U3A.js";import"./index-CPURVhFy.js";import"./loading-gEVgRnUM.js";import"./modalStack-CW-tpCu1.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-Dry7lUJC.js";import"./runtime-mode-U0E4WdSq.js";import"./IconButton-BToFVWxm.js";import"./MultiSelect-BFnXCmPi.js";import"./floating-ui.react-CG8cv30D.js";import"./collections-CoHfwOze.js";import"./Attachment-B_r5VzGA.js";import"./RuntimeBar-BlIeIQ1s.js";import"./InputField-Bw8DGtVJ.js";import"./use-hotkey-Dr5ZYpX6.js";import"./DropdownMenu-BNbBQXTz.js";import"./DropdownMenuSubmenu-CixrY1Rf.js";import"./Combobox-Drlj6fxl.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Buz30ZM7.js";import"./JsonSchemaForm-BAUVTJyI.js";import"./Properties-m66d-gjd.js";import"./HoverCard-D1K6Mo-k.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CX4nnWeB.js";import"./DatePicker-C3rLofYg.js";import"./DateTimePicker-CBjgGBDE.js";import"./TreePickerField-BHVz7FWE.js";import"./Tree-BFrjzZYb.js";import"./TreeNode-CduPTIl4.js";import"./AccordionList-DHpdmHBZ.js";import"./ListMenu-Cr46fYkG.js";import"./Markdown-DfnrvfFQ.js";import"./Callout-KkLU15FA.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BoBZ9fk7.js";import"./CodeDiff-Ck1vMpg0.js";import"./HighlightedTokens-CV0T2ZUG.js";import"./JsonView-BR2t-zou.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CWLlD8ZS.js";import"./agent-action-icons-CaVTjr_G.js";import"./RuntimeBarActions-B-vRBs6D.js";import"./Switch-Bh866-9-.js";import"./SecretKeySelector-w3OdROST.js";import"./index-21HwTrJv.js";import"./icon-menu-picker-Lx0cfVk2.js";import"./ProviderStatusPanel-DEnCT8Bo.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-64m-G86T.js";import"./Tabs-XS6FYlxM.js";import"./TabButton-Cs6rMuv4.js";import"./FixtureEditor-B1OtLO2G.js";import"./MdxEditorField-B4ZQYexa.js";import"./public-api-BjCjxHuM.js";import"./Badge-85OJYi09.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var s,p,l;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
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

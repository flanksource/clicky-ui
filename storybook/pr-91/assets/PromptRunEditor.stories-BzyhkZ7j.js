import{j as a,r as g}from"./iframe-DxH86FBA.js";import{P as c}from"./index-DsC5DTio.js";import{S as w}from"./index-CZ2ECo_d.js";import"./preload-helper-CwXsRPHT.js";import"./SegmentedControl-DLtJY0HA.js";import"./utils-DW-IJACk.js";import"./Icon-w2YOVKhv.js";import"./Modal-i45K_l92.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-DZMlFi7f.js";import"./runtime-mode-DQxxJ4sp.js";import"./IconButton-C9GSHWpU.js";import"./MultiSelect-D5Q4hKOt.js";import"./floating-ui.react-DSfQFonv.js";import"./collections-CoHfwOze.js";import"./Attachment-DRKy_V2e.js";import"./RuntimeBar-nSVJD14U.js";import"./duration-BuesBvhN.js";import"./InputField-GC6L0KAW.js";import"./use-hotkey-_x9Fkqnd.js";import"./DropdownMenu-D1hlo_Nj.js";import"./DropdownMenuSubmenu-t2kTmtnY.js";import"./Combobox-THEiNRgN.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Df2C1Mtk.js";import"./JsonSchemaForm-CQNmWJv1.js";import"./Properties-DN4TjyBB.js";import"./HoverCard-BGftSBK_.js";import"./json-schema-form-utils-DXLI5rc1.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CevG5Bnl.js";import"./DatePicker-CC8lYb-q.js";import"./DateTimePicker-Bohm6PVx.js";import"./path-tree-cspfj8J9.js";import"./TreePickerField-RIb89bNl.js";import"./Tree-DYj4yj7v.js";import"./TreeNode-0_t9gltg.js";import"./AccordionList-CD0seW3U.js";import"./ListMenu-BHcfpHFX.js";import"./Markdown-DN46MpBL.js";import"./Callout-BCbp8nOy.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DPXYBExk.js";import"./CodeDiff-D61IJrGu.js";import"./HighlightedTokens-DNniJjSO.js";import"./JsonView-GcXUgX4X.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CJ6NeqI9.js";import"./agent-action-icons-DEOIA4m5.js";import"./RuntimeBarActions-ClhpwdpA.js";import"./Switch-DXWGqTj2.js";import"./SecretKeySelector-BRaGBwLI.js";import"./index-DWlcCXij.js";import"./icon-menu-picker-CuzNsmnV.js";import"./ProviderStatusPanel-n5ofIxD-.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-ExJnGf6I.js";import"./Tabs-vMUl7RKt.js";import"./TabButton-SH496z5C.js";import"./FixtureEditor-D6z9DEc6.js";import"./public-api-BjCjxHuM.js";import"./Badge-ul0vb2Pp.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

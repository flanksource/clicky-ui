import{j as a,r as g}from"./iframe-BTxADGbc.js";import{P as c}from"./index-rYeGzJAg.js";import{S as w}from"./index-CDDTmTRs.js";import"./preload-helper-95TtevsV.js";import"./SegmentedControl-Cb6p-V2x.js";import"./utils-DW-IJACk.js";import"./Icon-DyQmy9zD.js";import"./Modal-BJSsoZSJ.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./button-uOKQbD2U.js";import"./index-CPURVhFy.js";import"./loading-ZXW1-FyE.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CazQSrPw.js";import"./runtime-mode-SvL8vOtR.js";import"./IconButton-Df5t7P9x.js";import"./MultiSelect-CFdHhfPl.js";import"./floating-ui.react-s2gbsc2n.js";import"./collections-CoHfwOze.js";import"./Attachment-n3E04NE3.js";import"./RuntimeBar-C2rVn6xz.js";import"./duration-BuesBvhN.js";import"./InputField-CkPd2Czh.js";import"./use-hotkey-BLpJQFBj.js";import"./DropdownMenu-CfcxM9h_.js";import"./DropdownMenuSubmenu-WTMYamx5.js";import"./Combobox-C3rdbpG1.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-BtWteifY.js";import"./JsonSchemaForm-D9H-dCV_.js";import"./Properties-VVxglCX7.js";import"./HoverCard-Cms3aoCY.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-C3XXcAms.js";import"./DatePicker-DW0YHUeU.js";import"./DateTimePicker-al_sBZQx.js";import"./TreePickerField-DGol3p_M.js";import"./Tree-CITsSa4C.js";import"./TreeNode-BbGDjTv7.js";import"./AccordionList-DcggQmVp.js";import"./ListMenu-DA1Lf5Dy.js";import"./Markdown-C8cp-WZg.js";import"./Callout-DNhpACdz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DralUSHB.js";import"./CodeDiff-Md3mH8qB.js";import"./HighlightedTokens-DoVhJSb4.js";import"./JsonView-CF7nUUT6.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-BwIRGR9F.js";import"./agent-action-icons-4FiHHze5.js";import"./RuntimeBarActions-DiUlP79j.js";import"./Switch-DQzn7jrm.js";import"./SecretKeySelector-D-t-bILC.js";import"./index-CXdr-XwC.js";import"./icon-menu-picker-BK-7tXft.js";import"./ProviderStatusPanel-D2xz_feT.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-DEmBaoHo.js";import"./Tabs-DRh6B_nu.js";import"./TabButton-UcJujHLP.js";import"./FixtureEditor-B1-T6qCQ.js";import"./MdxEditorField-DExkiDUS.js";import"./public-api-BjCjxHuM.js";import"./Badge-8t6xVVQj.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

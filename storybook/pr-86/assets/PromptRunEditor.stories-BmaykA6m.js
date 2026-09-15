import{j as a,r as R}from"./iframe-v660Eh3J.js";import{P as c}from"./index-DUdUa8EL.js";import{S as w}from"./index-DucBZBzt.js";import"./preload-helper-CcRYDqr-.js";import"./button-DaO-3A-f.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CqVpLPQc.js";import"./SegmentedControl-DvkOonxf.js";import"./Icon-pN7oW891.js";import"./Modal-WyKeqA_t.js";import"./index-BTij907j.js";import"./index-De58Dh1Z.js";import"./modalStack-SZlRUvIz.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-C-n8b4oA.js";import"./runtime-mode-Dg41tnhY.js";import"./IconButton-fv4G9gOe.js";import"./MultiSelect-Cc2T2Q1u.js";import"./floating-ui.react-BcxH6J4B.js";import"./collections-CoHfwOze.js";import"./Attachment-CMIJbJ3S.js";import"./RuntimeBar-DoUV52Eq.js";import"./DropdownMenu-Dz35ZXNZ.js";import"./DropdownMenuSubmenu-BteaieKF.js";import"./InputField-CLMejZn6.js";import"./use-hotkey-BzoS-M3B.js";import"./JsonSchemaForm-CCuwAvjG.js";import"./Properties-DLeySl2o.js";import"./HoverCard-CcTwKp93.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BgwtTUVx.js";import"./FilterPill-CUDEkpMK.js";import"./DateField-CB1_yYIa.js";import"./DatePicker-Dn9QJ4Jw.js";import"./DateTimePicker-BRXVyUZU.js";import"./TreePickerField-CGiE5E9l.js";import"./Tree-DaKsVOci.js";import"./TreeNode-B-l1kSGR.js";import"./AccordionList-D6vmqoCs.js";import"./ListMenu-nyOIV26D.js";import"./Markdown-CZzreRaf.js";import"./Callout-B6Yosfh0.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-PAr_fJTK.js";import"./CodeDiff-BN-IqNGY.js";import"./HighlightedTokens-Cu2gk4yr.js";import"./JsonView-3s3g6ujc.js";import"./Switch-BRpnuVxZ.js";import"./SecretKeySelector-D-Tyn_UY.js";import"./index-Db5hPqrJ.js";import"./icon-menu-picker-CN7_6LVh.js";import"./ProviderStatusPanel-B1IXwfEX.js";import"./types-B4ZMggem.js";import"./session-tones-DErC6cAM.js";import"./SandboxCreateWizard-C0H0DhdO.js";import"./permission-mode-visuals-c0ugUllz.js";import"./agent-action-icons-Dw_cQ9l6.js";import"./Tabs-B9CXHyKe.js";import"./TabButton-DeI-6eZc.js";import"./FixtureEditor-CoZaTz46.js";import"./MdxEditorField-CzJvl1mC.js";import"./public-api-BjCjxHuM.js";import"./Badge-B3waKE4p.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,g=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g})})}function h(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByRole("button",{name:"Edit spec"})).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

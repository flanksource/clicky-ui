import{j as a,r as g}from"./iframe-DjmnUs_s.js";import{P as c}from"./index-D9_hlUxL.js";import{S as w}from"./index-CSZfUTx5.js";import"./preload-helper-BlVIKJwt.js";import"./SegmentedControl-C3smeAq4.js";import"./utils-DW-IJACk.js";import"./Icon-CWJyCkxy.js";import"./Modal-DJ5NvytA.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./button-DfMIapuu.js";import"./index-CPURVhFy.js";import"./loading-jlJ4TQvy.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-WMF41mBt.js";import"./runtime-mode-DrXAr8Ax.js";import"./IconButton-CPXwZoyZ.js";import"./MultiSelect-DFFpOHWp.js";import"./floating-ui.react-DWJ6pxmL.js";import"./collections-CoHfwOze.js";import"./Attachment-CbV9v6J8.js";import"./RuntimeBar-YmkvJm28.js";import"./duration-BuesBvhN.js";import"./InputField-DyzkwbE-.js";import"./use-hotkey-C1YB6QnR.js";import"./DropdownMenu-BzgZIIYx.js";import"./DropdownMenuSubmenu-CYFI-0pu.js";import"./Combobox-FRHPTizX.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill--WlUWj89.js";import"./JsonSchemaForm-BGJwoYZy.js";import"./Properties-B63-iTbR.js";import"./HoverCard-dWtrhYr9.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CyRbuYYH.js";import"./DatePicker-CIbaW7a_.js";import"./DateTimePicker-9a9vmkUi.js";import"./TreePickerField-CH38PFDN.js";import"./Tree-fCJ2E4k3.js";import"./TreeNode-DyyyypDE.js";import"./AccordionList-hktinABI.js";import"./ListMenu-vlkT6Zj8.js";import"./Markdown-Ct8gYZjV.js";import"./Callout-BEELvTOR.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BKY-n_kB.js";import"./CodeDiff-CvJ1rh3J.js";import"./HighlightedTokens-CwICtm63.js";import"./JsonView-0809oQhO.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-ui0XrdTt.js";import"./agent-action-icons-BKqy7Pjn.js";import"./RuntimeBarActions-I_xIbvRy.js";import"./Switch-RI_AgvDC.js";import"./SecretKeySelector-1Hramrvg.js";import"./index-BGRDfamw.js";import"./icon-menu-picker-69H8GfVS.js";import"./ProviderStatusPanel-Cskft6Qi.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-D_B86Eh_.js";import"./Tabs-BLeZnaKq.js";import"./TabButton-CoqXHxdt.js";import"./FixtureEditor-CojRZJHq.js";import"./MdxEditorField-Wido5zHy.js";import"./public-api-BjCjxHuM.js";import"./Badge-DRzP6dli.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

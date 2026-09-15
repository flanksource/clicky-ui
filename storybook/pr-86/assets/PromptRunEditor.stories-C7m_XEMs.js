import{j as a,r as R}from"./iframe-DXjk5r-a.js";import{P as c}from"./index-ssUrcix5.js";import{S as w}from"./index-4wI1hXTm.js";import"./preload-helper-CcRYDqr-.js";import"./button-BoSQcAdS.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BGtnCp6V.js";import"./SegmentedControl-Ch-FYi_O.js";import"./Icon-DC7PbjMy.js";import"./Modal-Bq-6F7LO.js";import"./index-BXQtcMly.js";import"./index-DcGoyOOZ.js";import"./modalStack-tAQFSeFw.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-Dl-9HfSv.js";import"./runtime-mode-GAY9Z09E.js";import"./IconButton-B59a0ru2.js";import"./MultiSelect-DMD8O2sG.js";import"./floating-ui.react-DFDYvl7a.js";import"./collections-CoHfwOze.js";import"./Attachment-BsNeX9FC.js";import"./RuntimeBar-B9t3D1iL.js";import"./DropdownMenu-BFy8-TKA.js";import"./DropdownMenuSubmenu-Bghn0JQN.js";import"./InputField-DXDU6sNM.js";import"./use-hotkey-CwjSq31y.js";import"./JsonSchemaForm-BPM6tsy-.js";import"./Properties-CEZabCUC.js";import"./HoverCard-Cz1NFyc2.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DTKDJYLQ.js";import"./FilterPill-C1-hwJnr.js";import"./DateField-V0QEQimg.js";import"./DatePicker-0ZseOAj7.js";import"./DateTimePicker-CTflUDHL.js";import"./TreePickerField-BDbAKouT.js";import"./Tree-3SWyyCR3.js";import"./TreeNode-BOQeque-.js";import"./AccordionList-vESpuB-Z.js";import"./ListMenu-0pJ4mhQ5.js";import"./Markdown-B57mXxqo.js";import"./Callout-CMgkO-y6.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-8h7eJ8il.js";import"./CodeDiff-Bf4QUU4a.js";import"./HighlightedTokens-BBAz76nG.js";import"./JsonView-DH-PlnAk.js";import"./Switch-C1vPkR0s.js";import"./SecretKeySelector-CSxmKCHI.js";import"./index-D-rj_gHz.js";import"./icon-menu-picker-BA-WfoXb.js";import"./ProviderStatusPanel-B2GpGKqh.js";import"./types-B4ZMggem.js";import"./session-tones-DErC6cAM.js";import"./permission-mode-visuals-D9wz5Uws.js";import"./agent-action-icons-Dp0IcyPZ.js";import"./SandboxCreateWizard-DHTeCK4z.js";import"./Tabs-rQqTsWnm.js";import"./TabButton-CSFMgSMH.js";import"./FixtureEditor-DAHM9uOm.js";import"./MdxEditorField-fMdosdMY.js";import"./public-api-BjCjxHuM.js";import"./Badge-qnkM4cgH.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,g=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g})})}function h(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByRole("button",{name:"Edit spec"})).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

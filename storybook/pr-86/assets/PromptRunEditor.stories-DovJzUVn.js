import{j as a,r as g}from"./iframe-Cvtq5r5o.js";import{P as c}from"./index-g-Pk0Sn4.js";import{S as w}from"./index-D_9GILSB.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-f6EmF-nP.js";import"./utils-DW-IJACk.js";import"./Icon-AK-L3art.js";import"./Modal-B2iT9EIZ.js";import"./index-ClajA7XS.js";import"./index-kUH0lmcJ.js";import"./button-D_f9KbYW.js";import"./index-CPURVhFy.js";import"./loading-DKOjjMZb.js";import"./modalStack-Br6WXpFW.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-Cy5Jdddo.js";import"./runtime-mode-B2XQ9ynX.js";import"./IconButton-ivpc4D5G.js";import"./MultiSelect-DcdrjFJ7.js";import"./floating-ui.react-Cvq7eJTv.js";import"./collections-CoHfwOze.js";import"./Attachment-DfJBL6f_.js";import"./RuntimeBar-CftNfpnP.js";import"./InputField-CDkE2mw4.js";import"./use-hotkey-CQLHr3VW.js";import"./DropdownMenu-CpW9tjic.js";import"./DropdownMenuSubmenu-BdylLhlN.js";import"./Combobox-DmcYmCM1.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CiLj5-dG.js";import"./JsonSchemaForm-BKNsXLWl.js";import"./Properties-BORP7nVE.js";import"./HoverCard-DLH-UG-1.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-sB0eaV2V.js";import"./DatePicker--IntCE1-.js";import"./DateTimePicker-OpVNRO9P.js";import"./TreePickerField-BLAvb4Ye.js";import"./Tree-BQH8cTxt.js";import"./TreeNode-D1_gaJB-.js";import"./AccordionList-PJ7Xnjpw.js";import"./ListMenu-CNTmtfEt.js";import"./Markdown-BMJ3OLZx.js";import"./Callout-DX0CZmH_.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DO3W0pdQ.js";import"./CodeDiff-_RtAmjv0.js";import"./HighlightedTokens-Ct2ZVa0K.js";import"./JsonView-DJPIgKT4.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-Bu01ZdfC.js";import"./agent-action-icons-Bn1SxclT.js";import"./RuntimeBarActions-DJVK1GlU.js";import"./Switch-C7UOhQPy.js";import"./SecretKeySelector-CUm6OGqa.js";import"./index-CEHxgROo.js";import"./icon-menu-picker-Cv3U4d78.js";import"./ProviderStatusPanel-MdaoODM_.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-CR_nM8be.js";import"./Tabs-CdznXGlv.js";import"./TabButton-CgNYvDzl.js";import"./FixtureEditor-YHtSP6G2.js";import"./MdxEditorField-CKcqs-wl.js";import"./public-api-BjCjxHuM.js";import"./Badge-BzeiO1Yp.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var s,p,l;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
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

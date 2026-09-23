import{j as a,r as g}from"./iframe-i4NO8c1E.js";import{P as c}from"./index-BCDa4aoO.js";import{S as w}from"./index-riTtg9jM.js";import"./preload-helper-BlVIKJwt.js";import"./SegmentedControl-BZS04MJf.js";import"./utils-DW-IJACk.js";import"./Icon-0OQ-QiFy.js";import"./Modal-Dd2S2-_M.js";import"./index-DWciXVe1.js";import"./index-DEkhUzMm.js";import"./button-IkBZAOc5.js";import"./index-CPURVhFy.js";import"./loading-DnEu1w-x.js";import"./modalStack-BYsD3NGk.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-C_y3P-97.js";import"./runtime-mode-BgFO5qis.js";import"./IconButton-yDMtv4_j.js";import"./MultiSelect-BYUdv49T.js";import"./floating-ui.react-CZe8-7HK.js";import"./collections-CoHfwOze.js";import"./Attachment-CROUoV7X.js";import"./RuntimeBar-DPf8jgCw.js";import"./duration-BuesBvhN.js";import"./InputField-CT3NCAh6.js";import"./use-hotkey-B9ms88pk.js";import"./DropdownMenu-D0XmeiBD.js";import"./DropdownMenuSubmenu-DDvaJL7u.js";import"./Combobox-B2mxizyE.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-C80r3osm.js";import"./JsonSchemaForm-D2cnXR2g.js";import"./Properties-CJdGVwGL.js";import"./HoverCard-RVi8pXL2.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-BLxzYeBf.js";import"./DatePicker-CGrgOpuA.js";import"./DateTimePicker-DdyCgkg3.js";import"./TreePickerField-BTGzv9QW.js";import"./Tree-BNwzUv5X.js";import"./TreeNode-DPzcDfl8.js";import"./AccordionList-FxNBM0t1.js";import"./ListMenu-DroME745.js";import"./Markdown-T9MgalT6.js";import"./Callout-B72S23hh.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BGsGTuKI.js";import"./CodeDiff-B_gaadla.js";import"./HighlightedTokens-CQy1Ma1d.js";import"./JsonView-Dj4e_qpk.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-MgFD13yc.js";import"./agent-action-icons-BZArwYfR.js";import"./RuntimeBarActions-Z-SWrCj3.js";import"./Switch-BIbmZliS.js";import"./SecretKeySelector-C6EoQR5y.js";import"./index-FGRaKX4A.js";import"./icon-menu-picker-CVpbbatV.js";import"./ProviderStatusPanel-pFvkNbCS.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-BBD4RmDe.js";import"./Tabs-1046vJod.js";import"./TabButton-DgSuTMAc.js";import"./FixtureEditor-DssHyzn1.js";import"./MdxEditorField-D-hpAsny.js";import"./public-api-BjCjxHuM.js";import"./Badge-B6MJiOJm.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

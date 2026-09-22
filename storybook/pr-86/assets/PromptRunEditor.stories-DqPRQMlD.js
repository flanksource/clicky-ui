import{j as a,r as g}from"./iframe-DyL4RmGG.js";import{P as c}from"./index-I_VrvKia.js";import{S as w}from"./index-DXLe4erD.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-CkXrgfJk.js";import"./utils-DW-IJACk.js";import"./Icon-COVZwsWL.js";import"./Modal-D7h-gNLF.js";import"./index-MomY5yw3.js";import"./index-BKFNVha0.js";import"./button-BTOItCTV.js";import"./index-CPURVhFy.js";import"./loading-BIPMexql.js";import"./modalStack-CzjsIGEp.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-Ulh3Tp94.js";import"./runtime-mode-CxpBURmX.js";import"./IconButton-C8c2Bsu4.js";import"./MultiSelect-DUX4HHkw.js";import"./floating-ui.react-D_VnvmSA.js";import"./collections-CoHfwOze.js";import"./Attachment-Die52OS3.js";import"./RuntimeBar-pI1Pd1kf.js";import"./duration-BuesBvhN.js";import"./InputField-CVvNnlSw.js";import"./use-hotkey-DEfMuJu_.js";import"./DropdownMenu-BUAttuFQ.js";import"./DropdownMenuSubmenu-D9QpaiqI.js";import"./Combobox-BG0Xf9lH.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Dc-XIIV5.js";import"./JsonSchemaForm-cebw0gQ0.js";import"./Properties-haC5AlD6.js";import"./HoverCard-BfwUXTN4.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-tuk8KCrl.js";import"./DatePicker-CGg6kXBJ.js";import"./DateTimePicker-BYL8bwfW.js";import"./TreePickerField-B9BJNbLQ.js";import"./Tree-DbKiRmyq.js";import"./TreeNode-C5L9qvxU.js";import"./AccordionList-DxQrxDea.js";import"./ListMenu-DHVFyQMS.js";import"./Markdown-Ct3ryw68.js";import"./Callout-DOO0SxYQ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-D4_Ksmg1.js";import"./CodeDiff-1daKgTMf.js";import"./HighlightedTokens-H9zsTVBN.js";import"./JsonView-DhsCquBn.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DXR3kaYD.js";import"./agent-action-icons-Di8scCUe.js";import"./RuntimeBarActions-B2zqJz4i.js";import"./Switch-DtKqcX4E.js";import"./SecretKeySelector-DWf3VO3I.js";import"./index-CZuWoAov.js";import"./icon-menu-picker-DzPFG1Rf.js";import"./ProviderStatusPanel-DbZckdTD.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-BPOXEuc1.js";import"./Tabs-Bbs9i_ES.js";import"./TabButton-BtHflRDJ.js";import"./FixtureEditor-CbzKiQEX.js";import"./MdxEditorField-BQYjAD8N.js";import"./public-api-BjCjxHuM.js";import"./Badge-CuymrnrW.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

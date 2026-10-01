import{j as a,r as g}from"./iframe-CLXtWVmt.js";import{P as c}from"./index-C_vbGwFf.js";import{S as w}from"./index-BPMY9met.js";import"./preload-helper-DmsBQNJi.js";import"./SegmentedControl-Dg191Kku.js";import"./utils-DW-IJACk.js";import"./Icon-CpZ1luCu.js";import"./Modal-BJ4XmsSf.js";import"./index-cL1Er3Pi.js";import"./index-99h8sS2h.js";import"./button-C8mx3enX.js";import"./index-CPURVhFy.js";import"./loading-B0OjGzLE.js";import"./modalStack-gt8ROY-G.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BtjNu03f.js";import"./runtime-mode-COfkooO-.js";import"./runtime-spec-fields-CQPWRduL.js";import"./InputField-VmQoEzD9.js";import"./use-hotkey-0-_8lVll.js";import"./RuntimeBar-B0nniTwE.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-BfTU1-5e.js";import"./floating-ui.react-BEe3PkFT.js";import"./DropdownMenuSubmenu-DJ3OnS11.js";import"./Combobox-BjmBMG3b.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CM5YOpR7.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-v5iQrJHV.js";import"./agent-action-icons-17WlWWUd.js";import"./permissions-model-APfiHFtM.js";import"./tool-policy-D90x3NRy.js";import"./types-B4ZMggem.js";import"./Attachment-DP5P-iOB.js";import"./JsonSchemaForm-BLo94cmK.js";import"./Properties-BFYUqXPk.js";import"./IconButton-Diyo__bS.js";import"./HoverCard-DRjWtDYf.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-DuQ14mtG.js";import"./DatePicker-BWt51Z9R.js";import"./DateTimePicker-D0HzU81W.js";import"./TreePickerField-4-ix3axk.js";import"./Tree-CnzDD2rQ.js";import"./TreeNode-5m61ijv1.js";import"./AccordionList-syEv9AV1.js";import"./ListMenu-DS3Imowd.js";import"./Markdown-D95aR_fc.js";import"./Callout-Bl1ILe5K.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DOQ2p1GO.js";import"./CodeDiff-DDSLPz_c.js";import"./HighlightedTokens-l_kw19vr.js";import"./JsonView-D5gKhrYL.js";import"./use-runtime-preset-menu-CqxTahxA.js";import"./MultiSelect-DPAp-DQX.js";import"./Field-B1eQtZr5.js";import"./Switch-BGtVX4hr.js";import"./SecretKeySelector-B2yWirN-.js";import"./index-D_IVmfEW.js";import"./icon-menu-picker-DL3Bl_4z.js";import"./ProviderStatusPanel-CEoGIx9g.js";import"./SandboxCreateWizard-Bua9WeIH.js";import"./Tabs-BWge8Hta.js";import"./TabButton-DTD6DRp7.js";import"./FixtureEditor-ctKPl-5q.js";import"./public-api-BjCjxHuM.js";import"./Badge-BeC-BgyT.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Le={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const Oe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Oe as __namedExportsOrder,Le as default};

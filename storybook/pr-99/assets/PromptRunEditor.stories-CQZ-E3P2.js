import{j as i,r as w}from"./iframe-DzQtIbNE.js";import{P as p}from"./index-DgaS-kQq.js";import{S as v}from"./index-sMqSRsuO.js";import"./preload-helper-BCNcasCO.js";import"./SegmentedControl-DqjzCbFU.js";import"./utils-DW-IJACk.js";import"./Icon-D3avtD1A.js";import"./Modal-BvPI2Llq.js";import"./index-BqViEYwi.js";import"./index-CxOWF1GZ.js";import"./button-BtjJwS_P.js";import"./index-CPURVhFy.js";import"./loading-CMaS212t.js";import"./modalStack-CV8pkEDx.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-B-IclJbU.js";import"./runtime-mode-LvIjBZQb.js";import"./runtime-spec-fields-DTLLdzZE.js";import"./InputField-DgqwknNe.js";import"./use-hotkey-ChPiyVF2.js";import"./RuntimeBar-CnME4y5t.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-EvEmNcHK.js";import"./floating-ui.react-BiyoKmlr.js";import"./DropdownMenuSubmenu-zqd_Qfyb.js";import"./Combobox-DnmK8yIe.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-OKDi7TqT.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-Dawf6fra.js";import"./agent-action-icons-Ckw56EoT.js";import"./permissions-model-CJ6MRF1x.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-DLlfVuCG.js";import"./JsonSchemaForm-ChXytsWf.js";import"./Properties-zxUp5x1P.js";import"./IconButton-B4LzdWGk.js";import"./HoverCard-BmMl7y5E.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-B4v59BYL.js";import"./DatePicker-DDw49L-k.js";import"./DateTimePicker-B0B7J2o-.js";import"./TreePickerField-Dx7p8bT5.js";import"./Tree-BDpW0HwT.js";import"./TreeNode-DR60XQDj.js";import"./AccordionList-MuFF2Dlu.js";import"./ListMenu-C4QQQWpw.js";import"./Markdown-DqiNf3uz.js";import"./Callout-CSi8gZUg.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BhTC3ydu.js";import"./CodeDiff-MdlLWqCc.js";import"./HighlightedTokens-BJPpGutf.js";import"./JsonView-a3SUPwE1.js";import"./Badge-Caehxr5C.js";import"./use-runtime-preset-menu-BHHEIld8.js";import"./MultiSelect-ERMV7t7Y.js";import"./Field-BSq5rmDH.js";import"./Switch-DLRQCpzr.js";import"./SecretKeySelector-CcuqUNn6.js";import"./index-JHlX3ULY.js";import"./icon-menu-picker-CxTQ-Tuf.js";import"./SandboxCreateWizard-D84r6Omo.js";import"./Tabs-DLwqjgsI.js";import"./TabButton-C_FiNdfI.js";import"./FixtureEditor-BPgGgJX7.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const He={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
    // actions section rather than repeating it per row. Each row keeps its own
    // ⋮ menu for runtime settings such as effort.
    await expect(canvas.getAllByTitle("Runtime options").filter(trigger => !trigger.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1);
    await userEvent.click(canvas.getByRole("radio", {
      name: "Single model"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(d=(u=r.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var y,g,R;m.parameters={...m.parameters,docs:{...(y=m.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <TabbedSpecStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const controls = canvas.getByRole("group", {
      name: "Runtime 1 controls"
    });
    await userEvent.click(within(controls).getByTitle("Runtime options"));
    const options = await within(document.body).findByRole("menu", {
      name: "Runtime options"
    });
    await expect(within(options).queryByRole("menuitem", {
      name: "Advanced"
    })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Le=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Le as __namedExportsOrder,He as default};

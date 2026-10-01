import{j as i,r as w}from"./iframe-Cz62D_iz.js";import{P as p}from"./index-CznoW4yi.js";import{S as v}from"./index-COBxXs94.js";import"./preload-helper-DxStcPpW.js";import"./SegmentedControl-1VLDNc0s.js";import"./utils-DW-IJACk.js";import"./Icon-DkXLnjJN.js";import"./Modal-CvxqKJ19.js";import"./index-CwDukIsd.js";import"./index-D1QWHGI5.js";import"./button-Da_C00l5.js";import"./index-CPURVhFy.js";import"./loading-CpNJyOux.js";import"./modalStack-BS9FGIbV.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-D9IyAdGv.js";import"./runtime-mode-CuL_F51h.js";import"./runtime-spec-fields-C6pKdjr4.js";import"./InputField-DauBAM0d.js";import"./use-hotkey-D6jmYKfm.js";import"./RuntimeBar-44yhJgqt.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-CSiL2JEe.js";import"./floating-ui.react-B3VArII0.js";import"./DropdownMenuSubmenu-DbLMIeXR.js";import"./Combobox-CNDOvUSy.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DTfRv4Z5.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-8H_F2OqI.js";import"./agent-action-icons-CXNpvipv.js";import"./permissions-model-DBEXPdot.js";import"./tool-policy-JmK7D4h2.js";import"./types-B4ZMggem.js";import"./Attachment-DGO2oUsK.js";import"./JsonSchemaForm-CbGXSkOr.js";import"./Properties-B1Ulbj5-.js";import"./IconButton-BRduhpjC.js";import"./HoverCard-BugDtYi2.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-BncnpdDR.js";import"./DatePicker-BOTtv-NE.js";import"./DateTimePicker-CJvLUyFc.js";import"./TreePickerField-B8wI19f_.js";import"./Tree-Bay9xJbM.js";import"./TreeNode-BYnedoGr.js";import"./AccordionList-BIoJbx8c.js";import"./ListMenu-DVyCN53q.js";import"./Markdown-CnTdsY9m.js";import"./Callout-kqNFF0Oz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-IdrdyxjQ.js";import"./CodeDiff-CWL3DUpA.js";import"./HighlightedTokens-DQPWohiH.js";import"./JsonView-MYgqOyIx.js";import"./use-runtime-preset-menu-CMTxfcQQ.js";import"./MultiSelect-_rtunsUy.js";import"./Field-NbYNtctZ.js";import"./Switch-C1WQZnhE.js";import"./SecretKeySelector-DGhHm5YV.js";import"./index-BrLPCfc1.js";import"./icon-menu-picker-DVI3RTBi.js";import"./SandboxCreateWizard-5TG7A0r2.js";import"./Tabs-gH2Dv3LG.js";import"./TabButton-BRFJqFXC.js";import"./FixtureEditor-CIrEm19b.js";import"./public-api-BjCjxHuM.js";import"./Badge--9k5yrUM.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Le={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Oe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Oe as __namedExportsOrder,Le as default};

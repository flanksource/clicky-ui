import{j as i,r as w}from"./iframe-49i2VeV0.js";import{P as p}from"./index-DeBENtY7.js";import{S as v}from"./index-DtcwABcT.js";import"./preload-helper-CLP1olNy.js";import"./SegmentedControl-DQyG9Uij.js";import"./utils-DW-IJACk.js";import"./Icon-CQyVAhLN.js";import"./Modal-C0PiPlai.js";import"./index-BmfiYcQm.js";import"./index-COeekDrS.js";import"./button-BGdRDUEK.js";import"./index-CPURVhFy.js";import"./loading-ivhQ-8Oz.js";import"./modalStack-DtPrVreh.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CFY19F4f.js";import"./runtime-mode-Bz7vkXBA.js";import"./runtime-spec-fields-DQD4GA9x.js";import"./InputField-BoPdo2um.js";import"./use-hotkey-CM9WEqg-.js";import"./RuntimeBar-BYimQJ_F.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-zKmQ3di2.js";import"./floating-ui.react-D9st_Ili.js";import"./DropdownMenuSubmenu-DjDp9DGD.js";import"./Combobox-BPv-GTrS.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CJM8CCUD.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-D066-sqT.js";import"./agent-action-icons-Cm3M82a6.js";import"./permissions-model-z_qQ9Sd9.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-Bnc27WVc.js";import"./JsonSchemaForm-Jujk7bhf.js";import"./Properties-BgtFJszi.js";import"./IconButton-ByEpJOjF.js";import"./HoverCard-Nv6W7Mzd.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-DmYw5TzX.js";import"./DatePicker-DRCVITp-.js";import"./DateTimePicker-CQSx9Faf.js";import"./TreePickerField-BxAE0WIj.js";import"./Tree-BFkscNw0.js";import"./TreeNode-BGl04jkk.js";import"./AccordionList-DKmKrDqZ.js";import"./ListMenu-BpM9Q3TK.js";import"./Markdown-DGRLI0EC.js";import"./Callout-NqoBpdJp.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DanP_04g.js";import"./CodeDiff-BoZLkBEw.js";import"./HighlightedTokens-BQjA9qCL.js";import"./JsonView-CZgQJ4VW.js";import"./Badge-DmOWNVI_.js";import"./use-runtime-preset-menu-CBW0PNBw.js";import"./MultiSelect-CspOQKqu.js";import"./Field-C_H3qBuC.js";import"./Switch-Ceg8jQ-7.js";import"./SecretKeySelector-BGj2LbbG.js";import"./index-CN4yxxmJ.js";import"./icon-menu-picker-DJB7ez70.js";import"./SandboxCreateWizard-BooCRsEh.js";import"./Tabs-DqMFugCo.js";import"./TabButton-XUErfeSn.js";import"./FixtureEditor-I9vK32gA.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const He={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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

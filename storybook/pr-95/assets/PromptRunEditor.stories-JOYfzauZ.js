import{j as i,r as w}from"./iframe-Bu8__SiW.js";import{P as p}from"./index-CaItBcyU.js";import{S as v}from"./index-CSg7zMMc.js";import"./preload-helper-DxStcPpW.js";import"./SegmentedControl-BvvnSULS.js";import"./utils-DW-IJACk.js";import"./Icon-Cn9xrMzj.js";import"./Modal-D3Yozp4q.js";import"./index-BjG998sX.js";import"./index-ZA4_G-zD.js";import"./button-IQY09Old.js";import"./index-CPURVhFy.js";import"./loading-G9JgtjzI.js";import"./modalStack-DAEU9LH6.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-B1EtaKUV.js";import"./runtime-mode-CinmaIvt.js";import"./runtime-spec-fields-D8qyOGju.js";import"./InputField-Dq4Hgi92.js";import"./use-hotkey-DFLsp-_D.js";import"./RuntimeBar-Bd1lyFcs.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-Cc3rFJXx.js";import"./floating-ui.react-Dnwi4P86.js";import"./DropdownMenuSubmenu-Bin6sHLc.js";import"./Combobox-C94DycZI.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-B_GFjO3W.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DY0-OnoF.js";import"./agent-action-icons-EsCmuU34.js";import"./permissions-model-CMmiUf03.js";import"./tool-policy-JmK7D4h2.js";import"./types-B4ZMggem.js";import"./Attachment-xlA2J4u_.js";import"./JsonSchemaForm-BBiP9Kc1.js";import"./Properties-BHhdn87j.js";import"./IconButton-C39yw7zm.js";import"./HoverCard-C7tqGV4c.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-BKvKPcBk.js";import"./DatePicker-BRN9i89E.js";import"./DateTimePicker-DZDr_Uy7.js";import"./TreePickerField-BWzaLrlG.js";import"./Tree-1VMmZ1mH.js";import"./TreeNode-DZ7CtkKh.js";import"./AccordionList-BHyytELf.js";import"./ListMenu-CK6TumbS.js";import"./Markdown-Di7HeoGv.js";import"./Callout-CAPoqzX9.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BBmT3lSS.js";import"./CodeDiff-Cp3irI7w.js";import"./HighlightedTokens-DkxPDs2d.js";import"./JsonView-DQo_bBJV.js";import"./use-runtime-preset-menu-CShbme5e.js";import"./MultiSelect-Dq18RfF4.js";import"./Field-D3DXRDn8.js";import"./Switch-CRw0InCG.js";import"./SecretKeySelector-Ex1aHXgT.js";import"./index-CLaO61pG.js";import"./icon-menu-picker-mz0kRvCJ.js";import"./SandboxCreateWizard-CT2S4j9o.js";import"./Tabs-BE9xH1H6.js";import"./TabButton-DTaWnWF9.js";import"./FixtureEditor-iw8SZ7-t.js";import"./public-api-BjCjxHuM.js";import"./Badge-rBPqgJ-m.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Le={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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

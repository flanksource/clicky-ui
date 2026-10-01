import{j as i,r as w}from"./iframe-CBNX-dQr.js";import{P as p}from"./index-D013sT7I.js";import{S as v}from"./index-Dh4INxSi.js";import"./preload-helper-DmsBQNJi.js";import"./SegmentedControl-kW-qzHsZ.js";import"./utils-DW-IJACk.js";import"./Icon-Bl13VMM_.js";import"./Modal-DSvZqgbd.js";import"./index-DwHWx2SL.js";import"./index-DwW3fdnJ.js";import"./button-66Jqw29m.js";import"./index-CPURVhFy.js";import"./loading-I_MdTxAY.js";import"./modalStack-B758Y7Je.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CZjDpPCo.js";import"./runtime-mode-B-91Rimv.js";import"./runtime-spec-fields-DXiGKEfH.js";import"./InputField-DLd-KN5R.js";import"./use-hotkey-Br5lNyjq.js";import"./RuntimeBar-BGwfa0dB.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-D2VkYe4-.js";import"./floating-ui.react-DfgK1207.js";import"./DropdownMenuSubmenu-vwNEYm-T.js";import"./Combobox-ivMDoGSw.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CC2kjuRK.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CvIKg4vd.js";import"./agent-action-icons-kxjlNMQ8.js";import"./permissions-model-6HlW-NSM.js";import"./tool-policy-D90x3NRy.js";import"./types-B4ZMggem.js";import"./Attachment-CThWTJ-m.js";import"./JsonSchemaForm-ard0a1Sn.js";import"./Properties-OIdD6ezx.js";import"./IconButton-BveIQQyE.js";import"./HoverCard-OVmLfFL1.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-acM6sVYL.js";import"./DatePicker-nzTzZHVU.js";import"./DateTimePicker-BFylyvG4.js";import"./TreePickerField-C-WIa1dg.js";import"./Tree-8UkTkEpb.js";import"./TreeNode-CBEsYbJ1.js";import"./AccordionList-Bz7WO0Et.js";import"./ListMenu-C81gT6ff.js";import"./Markdown-CHm7qM_U.js";import"./Callout-BAJCNOie.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-zlDOGlq6.js";import"./CodeDiff-DC7UNH_q.js";import"./HighlightedTokens-y1sDqrp8.js";import"./JsonView-D-lo88BL.js";import"./use-runtime-preset-menu-n5bw9RQ8.js";import"./MultiSelect-_MLhRryG.js";import"./Field-CyYGDWUj.js";import"./Switch-Bez6i6hn.js";import"./SecretKeySelector-DfG8NWtu.js";import"./index-B1gmceDA.js";import"./icon-menu-picker-9AaUlnub.js";import"./ProviderStatusPanel-BBSCKgjS.js";import"./SandboxCreateWizard-CJJVsexK.js";import"./Tabs-kaTsWUqT.js";import"./TabButton-l_JTlQtd.js";import"./FixtureEditor-CIZ-f6sX.js";import"./public-api-BjCjxHuM.js";import"./Badge-CIPnqeY-.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Oe={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Ve=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Ve as __namedExportsOrder,Oe as default};

import{j as i,r as w}from"./iframe-Dxfrw1Ky.js";import{P as p}from"./index-p4tcut9i.js";import{S as v}from"./index-m-ds7GnH.js";import"./preload-helper-BBRSUrHX.js";import"./SegmentedControl-CYXceJe4.js";import"./utils-DW-IJACk.js";import"./Icon-uVU5xHJk.js";import"./Modal-D6Y2Y0Td.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./button-Cd-gFBA2.js";import"./index-CPURVhFy.js";import"./loading-DdWtU95m.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-DSwgv5BY.js";import"./runtime-mode-CuLRvUmM.js";import"./runtime-spec-fields-Bf-PAPFl.js";import"./InputField-BNaI9pYq.js";import"./use-hotkey-CzAz-0Js.js";import"./RuntimeBar-Cbh9eYZP.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-BrgsovJR.js";import"./floating-ui.react-CnFTnPO5.js";import"./DropdownMenuSubmenu-ngeQOpm6.js";import"./Combobox-CkPoK2Rk.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DPJ4_JlW.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-xggB4W0Y.js";import"./agent-action-icons-Be1cg7T7.js";import"./permissions-model-A0yueJh0.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-BIE71-18.js";import"./JsonSchemaForm-YYY8XkSl.js";import"./Properties-D97LrD4y.js";import"./IconButton-XTWE7kYN.js";import"./format-2niohfpq.js";import"./JsonView-C0lt5M6a.js";import"./AccordionList-BTYKiV83.js";import"./Badge-aB9oNZTO.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BpuwyYbr.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-KAcJR11t.js";import"./DatePicker-DGUoI6us.js";import"./DateTimePicker-Do5gRvQn.js";import"./TreePickerField-D4UScmyb.js";import"./Tree-D-3f6UEm.js";import"./TreeNode-4m2l8kkX.js";import"./ListMenu-Cm6jw3GG.js";import"./Markdown-CKxNRpEU.js";import"./Callout-hw3R6Lvm.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CQnknqX7.js";import"./CodeDiff-BA7bdpa9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-B3JYBooh.js";import"./use-container-width-DJEi4pg0.js";import"./use-runtime-preset-menu-CGWuF9ET.js";import"./MultiSelect-UaYFpP5m.js";import"./Field-BdF60jvp.js";import"./Switch-VSgOo0y2.js";import"./SecretKeySelector-B0SwC2Nt.js";import"./index-BUwwOD0W.js";import"./icon-menu-picker-paN7vrgs.js";import"./SandboxCreateWizard-BFFzPzCr.js";import"./Tabs-CRXb-NLl.js";import"./TabButton-ASicmSPv.js";import"./FixtureEditor-B0p33C8A.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ue={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const $e=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,$e as __namedExportsOrder,Ue as default};

import{j as i,r as w}from"./iframe-BsAqiW63.js";import{P as p}from"./index-Cm-K5DUj.js";import{S as v}from"./index-BnBdQ5A6.js";import"./preload-helper-Drww7zV3.js";import"./SegmentedControl-CKXvowSa.js";import"./utils-DW-IJACk.js";import"./Icon-Dyy6aaqa.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-C6WF7EEi.js";import"./runtime-mode-1rGgXNMP.js";import"./runtime-spec-fields-PQGmswh4.js";import"./InputField-DDv98Cn3.js";import"./use-hotkey-BcWYTy9O.js";import"./RuntimeBar-BRjPgjab.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-CRLAXTiF.js";import"./floating-ui.react-C__wji9y.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Bzw0s4Xn.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DsCr1afp.js";import"./agent-action-icons-C8NJZ9-3.js";import"./permissions-model-DYnEvOGP.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-BqC_TVhp.js";import"./JsonSchemaForm-BLiMJNcQ.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./format-2niohfpq.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-CgvwTfO5.js";import"./DatePicker-DrZpenEB.js";import"./DateTimePicker-Bx8fiptj.js";import"./TreePickerField-DK9uVoie.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./ListMenu-ojNBp5xm.js";import"./Markdown-DuzdQE_P.js";import"./ConfirmDialog-Dy2NjZjp.js";import"./Callout-DsXXS4Pz.js";import"./callout-tones-EFt49BYo.js";import"./router-BgYu87PQ.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./use-container-width-D74LxAAv.js";import"./use-runtime-preset-menu-Qlp9uB9J.js";import"./MultiSelect-C8zfQc50.js";import"./Field-D8IwP3_T.js";import"./Switch-EcEvbvOl.js";import"./SecretKeySelector-BYApwRil.js";import"./index-CMSqFLvx.js";import"./icon-menu-picker-GLsDgy5G.js";import"./SandboxCreateWizard-DcLNEhjN.js";import"./Tabs-DS-db7XK.js";import"./TabButton-BZA9_rW6.js";import"./FixtureEditor-Ds1yQ7TK.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ge={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Ke=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Ke as __namedExportsOrder,Ge as default};

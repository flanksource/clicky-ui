import{j as i,r as w}from"./iframe-BpsZ2AnK.js";import{P as p}from"./index-zUun0SbG.js";import{S as v}from"./index-CnLD4PwF.js";import"./preload-helper-MsDOuF3K.js";import"./SegmentedControl-BUwYYoDm.js";import"./utils-DW-IJACk.js";import"./Icon-nPi6h081.js";import"./Modal--V1JkUP_.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-Bf0XPwy0.js";import"./runtime-mode-D9UvtFVC.js";import"./runtime-spec-fields-CEv0DHFE.js";import"./InputField-DdCxFHzx.js";import"./use-hotkey-G0QJTQ9v.js";import"./RuntimeBar-DpQ6oasa.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-BbLBG52q.js";import"./floating-ui.react-B4WvYE6p.js";import"./DropdownMenuSubmenu-bIAIsBPN.js";import"./Combobox-C062J8HP.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-D1QT-mQn.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-2nOxGEnL.js";import"./agent-action-icons-DbNGPyKn.js";import"./permissions-model-rlEl2Ljw.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-DJjUhDGS.js";import"./JsonSchemaForm-CGkbw0RQ.js";import"./Properties-DDW0uDBy.js";import"./IconButton-D62I1GKu.js";import"./format-2niohfpq.js";import"./JsonView-Bc5NK7ov.js";import"./AccordionList-C_UQ-gQM.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BgdB6aXQ.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-BzRIn2MK.js";import"./DatePicker-BwdIDaNb.js";import"./DateTimePicker-DXF5Age6.js";import"./TreePickerField-BfOuYY1G.js";import"./Tree-CpaciHai.js";import"./TreeNode-CGkFCcsE.js";import"./ListMenu-BjFagQg6.js";import"./Markdown-CMko-UvP.js";import"./Callout-DkPg7bHY.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CrYxM6ZO.js";import"./CodeDiff-BGrQjjUl.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-CTIWcVCe.js";import"./HighlightedTokens-DtZaJN20.js";import"./use-container-width-BECRZpSr.js";import"./use-runtime-preset-menu-CxzcyQm1.js";import"./MultiSelect-GZgKEjD2.js";import"./Field-CSZGGPxl.js";import"./Switch-41O_-6Zx.js";import"./SecretKeySelector-Cfwctx9T.js";import"./index-CwCz_U_4.js";import"./icon-menu-picker-0Wj7NRkh.js";import"./SandboxCreateWizard-4OwIUHza.js";import"./Tabs-BhgW6CWk.js";import"./TabButton-B6Oftv0m.js";import"./FixtureEditor-FLGNffVF.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ue={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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

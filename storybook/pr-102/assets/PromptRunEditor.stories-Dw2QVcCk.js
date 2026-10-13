import{j as i,r as w}from"./iframe-DP177qYv.js";import{P as p}from"./index-CYxPwV7u.js";import{S as v}from"./index-Bjzd6lGa.js";import"./preload-helper-BZq7nIkI.js";import"./SegmentedControl-CmQrpni4.js";import"./utils-DW-IJACk.js";import"./Icon-CVZO3WAG.js";import"./Modal-BWAlqUsR.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BAvx-beq.js";import"./runtime-mode-B-sR2l2q.js";import"./runtime-spec-fields-CL-iBVw-.js";import"./InputField-DQb9Rhrw.js";import"./use-hotkey-iixTK3zz.js";import"./RuntimeBar-CKfXszy7.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./Combobox-gw5c6cQc.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CB6e5lha.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-QDfBXISc.js";import"./agent-action-icons-7KpVwAJf.js";import"./permissions-model-Dj7eowoA.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-D5pUMWS6.js";import"./JsonSchemaForm-D6m6mBh8.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./format-2niohfpq.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./Badge-DkHitohI.js";import"./HoverCard-k2Xsc41N.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-Vz0SUsTh.js";import"./DatePicker-C9FXaiIe.js";import"./DateTimePicker-4Tx0xEVq.js";import"./TreePickerField-BjPB4mTt.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./ListMenu-DaHgzerB.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./use-container-width-BjRC-52t.js";import"./use-runtime-preset-menu-C2z2T2T7.js";import"./MultiSelect-cBIxAEqx.js";import"./Field-CC59x4jG.js";import"./Switch-CEQZSUBH.js";import"./SecretKeySelector-CC_MH9-m.js";import"./index-Kn3cRk9o.js";import"./icon-menu-picker-BssrgbjL.js";import"./SandboxCreateWizard-DMz_dmSR.js";import"./Tabs-Cm3rZY0N.js";import"./TabButton-Dz7JW7p1.js";import"./FixtureEditor-BxqfCpc4.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ne={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(R=(g=m.parameters)==null?void 0:g.docs)==null?void 0:R.source}}};const Ue=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Ue as __namedExportsOrder,Ne as default};

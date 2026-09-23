import{j as a,r as g}from"./iframe-Cxdv9pi7.js";import{P as c}from"./index-DMdEB2Jx.js";import{S as w}from"./index-DQHpwE9n.js";import"./preload-helper-DU1Q6aPJ.js";import"./SegmentedControl-hhBGtqdI.js";import"./utils-DW-IJACk.js";import"./Icon-TQmWXc2S.js";import"./Modal-Kx8XoI2v.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./button-CDUpBuy9.js";import"./index-CPURVhFy.js";import"./loading-BfmDh766.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-BzPwm5YY.js";import"./runtime-mode-D62tngBZ.js";import"./IconButton-eNA5Ynby.js";import"./MultiSelect-CFMQ6ZtD.js";import"./floating-ui.react-mjp4aH0C.js";import"./collections-CoHfwOze.js";import"./Attachment-CK7v-KkM.js";import"./RuntimeBar-jZXyUQiE.js";import"./duration-BuesBvhN.js";import"./InputField-B_j7RwED.js";import"./use-hotkey-CSUXaqCI.js";import"./DropdownMenu-Cqi-ljGX.js";import"./DropdownMenuSubmenu-P1llKkBa.js";import"./Combobox-B0h9NCBj.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-4MdiEeIE.js";import"./JsonSchemaForm-D_TuFL6Q.js";import"./Properties-DLVUf3n9.js";import"./HoverCard-89Zdu8CL.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-rQJK1df4.js";import"./DatePicker-CCKEKnk4.js";import"./DateTimePicker-BPSia-hN.js";import"./TreePickerField-CePiEepO.js";import"./Tree-BkNuhnkb.js";import"./TreeNode-B1D0wvGU.js";import"./AccordionList-C507nh1a.js";import"./ListMenu-B5H0e9NV.js";import"./Markdown-CNfEuncx.js";import"./Callout-BNlgjsvn.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-COdx_xEw.js";import"./CodeDiff-B_kUey21.js";import"./HighlightedTokens-DBaNk6YB.js";import"./JsonView-Ds_lvjLt.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-D0CvFEX_.js";import"./agent-action-icons-DMIrM5fm.js";import"./RuntimeBarActions-wuj_H1ci.js";import"./Switch-DwHJZktg.js";import"./SecretKeySelector-BD5gzo4O.js";import"./index-BqC3x6pn.js";import"./icon-menu-picker-CYGhlhoj.js";import"./ProviderStatusPanel-CKYWqxW6.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-C7iVctZW.js";import"./Tabs-DofXiJ7e.js";import"./TabButton-Bss_KibQ.js";import"./FixtureEditor-Bs9ui1IE.js";import"./MdxEditorField-BRTt7Kix.js";import"./public-api-BjCjxHuM.js";import"./Badge-DvE9OLG-.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const He=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,He as __namedExportsOrder,Pe as default};

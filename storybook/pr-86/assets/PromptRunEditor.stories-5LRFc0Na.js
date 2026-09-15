import{j as a,r as R}from"./iframe-DjmuE4jL.js";import{P as c}from"./index-oYHgznq0.js";import{S as w}from"./index-syWOwXO5.js";import"./preload-helper-CcRYDqr-.js";import"./button-CwDkfInQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CIXZB-Vg.js";import"./SegmentedControl-DVl7a-nW.js";import"./Icon-C3mJVtxE.js";import"./Modal-DPVG7uwk.js";import"./index-DZmA724K.js";import"./index-Bf_L3Tie.js";import"./modalStack-gNmWCtk4.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-DmBSsnzZ.js";import"./runtime-mode-D2J7HOpo.js";import"./IconButton-CJNKOjat.js";import"./MultiSelect-h7Bnf5jm.js";import"./floating-ui.react-zKcHaoGq.js";import"./collections-CoHfwOze.js";import"./Attachment-D_Nu813X.js";import"./RuntimeBar-zgzvy31j.js";import"./DropdownMenu-CgWHxY8D.js";import"./DropdownMenuSubmenu-nj4uXUjm.js";import"./InputField-BCrLEGk-.js";import"./use-hotkey-B5ngD_5C.js";import"./JsonSchemaForm-BbdbgneT.js";import"./Properties-CLacWsQP.js";import"./HoverCard-CCoesVvM.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DRIkcNZT.js";import"./FilterPill-CDqCSexL.js";import"./DateField-Blhq8XE6.js";import"./DatePicker-fLU7r2uP.js";import"./DateTimePicker-bL30AuWP.js";import"./TreePickerField-pIlsZMHP.js";import"./Tree-CQDzfY0D.js";import"./TreeNode-BJNMFR3B.js";import"./AccordionList-C5BMbWSK.js";import"./ListMenu-C4hHtWCQ.js";import"./Markdown-DAOZb6n2.js";import"./Callout-CeX1vSRb.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-_1YuNjJd.js";import"./CodeDiff-C1quLkfP.js";import"./HighlightedTokens-Y7Ki5_Ub.js";import"./JsonView-B0Mwcaam.js";import"./Switch-B97CJMIK.js";import"./SecretKeySelector-3u-2pjMS.js";import"./index-Ity8I7Gl.js";import"./icon-menu-picker-o1v10DkV.js";import"./ProviderStatusPanel-DjWMIpwh.js";import"./types-B4ZMggem.js";import"./session-tones-DErC6cAM.js";import"./SandboxCreateWizard-CB4qhGFc.js";import"./permission-mode-visuals-CaMIOas7.js";import"./agent-action-icons-rPY0Z7-a.js";import"./Tabs-DMwVCtIY.js";import"./TabButton-Bgf08-nu.js";import"./FixtureEditor-B_J_9leg.js";import"./MdxEditorField-DeKt08zM.js";import"./public-api-BjCjxHuM.js";import"./Badge-_r0umWW7.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,g=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g})})}function h(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByRole("button",{name:"Edit spec"})).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
    await expect(canvas.queryByRole("button", {
      name: "Edit spec"
    })).not.toBeInTheDocument();
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const Pe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Pe as __namedExportsOrder,je as default};

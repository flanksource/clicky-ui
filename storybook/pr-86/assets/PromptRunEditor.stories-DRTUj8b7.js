import{j as a,r as R}from"./iframe-DeBYCw4x.js";import{P as c}from"./index-CmFNK5w1.js";import{S as w}from"./index-L9JrY4YQ.js";import"./preload-helper-CcRYDqr-.js";import"./button-DB9m7UYN.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ho48Z2wq.js";import"./SegmentedControl-x-wxcPhD.js";import"./Icon-CGwyQOB1.js";import"./Modal-DKr8ZZ_E.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-DCHQJMzA.js";import"./runtime-mode-BlwYrZZ7.js";import"./IconButton-Jb6_soVo.js";import"./MultiSelect-BAke_gC4.js";import"./floating-ui.react-CJIncd7i.js";import"./collections-CoHfwOze.js";import"./Attachment-DEDAg6BR.js";import"./RuntimeBar-C6tzmjR0.js";import"./DropdownMenu-CuKG9hF1.js";import"./DropdownMenuSubmenu-BoEIYSWu.js";import"./InputField-DoB9v3Zf.js";import"./use-hotkey-cYEGbwF4.js";import"./JsonSchemaForm-CddA3a7h.js";import"./Properties-Cm7NvER_.js";import"./HoverCard-DMwhGn2K.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-Blg1URfg.js";import"./FilterPill-DFY6Z2w0.js";import"./DateField-D-RuUBhs.js";import"./DatePicker-CLelcqU9.js";import"./DateTimePicker-TXnXjNJ7.js";import"./TreePickerField-Bbb-_TKH.js";import"./Tree-Bd-CblJ-.js";import"./TreeNode-B4k1eimf.js";import"./AccordionList-Dge9CV48.js";import"./ListMenu-DiPynW8C.js";import"./Markdown-BiknAm-q.js";import"./Callout-DoO2BLrl.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-dTiR47dd.js";import"./CodeDiff-BRl1lE7u.js";import"./HighlightedTokens-Cwnl1Dqa.js";import"./JsonView--QZM-KTF.js";import"./Switch-DSfqy1Zd.js";import"./SecretKeySelector-DONnV-2H.js";import"./index-CmecybCa.js";import"./icon-menu-picker-CH5MSBXU.js";import"./ProviderStatusPanel-xBkPJ9A8.js";import"./types-B4ZMggem.js";import"./session-tones-DErC6cAM.js";import"./SandboxCreateWizard-BIftTjYR.js";import"./permission-mode-visuals-BuHxU5ir.js";import"./agent-action-icons-Dtuelbpv.js";import"./Tabs-BF6qMCjm.js";import"./TabButton-hbgiyllR.js";import"./FixtureEditor-Do1jEFQD.js";import"./MdxEditorField-C79dD5xi.js";import"./public-api-BjCjxHuM.js";import"./Badge-vEaYC1aM.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,g=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g})})}function h(){const[o,e]=R.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:g,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByRole("button",{name:"Edit spec"})).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

import{j as a,r as g}from"./iframe-k78te_Hj.js";import{P as c}from"./index-CVLuCTig.js";import{S as w}from"./index-CRX0DG6T.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-C2zkwnpb.js";import"./utils-DW-IJACk.js";import"./Icon-BxFpjwAC.js";import"./Modal-C9UBUNoB.js";import"./index-BT2sJ_Ky.js";import"./index-BYV-uwhj.js";import"./button-DOHlwBT1.js";import"./index-CPURVhFy.js";import"./loading-J2lUy0bP.js";import"./modalStack-gX0DzNXp.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CUFKIHnQ.js";import"./runtime-mode-D3OVTX8Z.js";import"./IconButton-E1lHpWwS.js";import"./MultiSelect-BgJflaJt.js";import"./floating-ui.react-CBq0PPGN.js";import"./collections-CoHfwOze.js";import"./Attachment-BQKca0E_.js";import"./RuntimeBar-BJ3L1PwZ.js";import"./DropdownMenu-BAtbfmxv.js";import"./DropdownMenuSubmenu-Bs7Mqmth.js";import"./InputField-Bv-3RSA1.js";import"./use-hotkey-BEWjsXan.js";import"./JsonSchemaForm-DMTwNFLG.js";import"./Properties-Cd89NYZQ.js";import"./HoverCard-BBWMBTKn.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-81j1jr0e.js";import"./FilterPill-Bm-1wg7m.js";import"./DateField-aOWa4qOd.js";import"./DatePicker-Bz0wnTRB.js";import"./DateTimePicker-EQnd0KSf.js";import"./TreePickerField-C5zW3vnw.js";import"./Tree-bapT1jHo.js";import"./TreeNode-CFijCCa0.js";import"./AccordionList-C39Tf6gw.js";import"./ListMenu-EHYBE9QB.js";import"./Markdown-D0CVTTPy.js";import"./Callout-I_WySpwf.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CUyjypF7.js";import"./CodeDiff-DRhurKgi.js";import"./HighlightedTokens-DWLn5OT3.js";import"./JsonView-DnkIY1t2.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DlF3zFWa.js";import"./agent-action-icons-DU4vm9QI.js";import"./RuntimeBarActions-D6HWfbIA.js";import"./Switch-coefuduJ.js";import"./SecretKeySelector-D98LiSoX.js";import"./index-D1FPM4Jg.js";import"./icon-menu-picker-CFF56ZjE.js";import"./ProviderStatusPanel-Bz0W7r4G.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-D9xwJJ8Y.js";import"./Tabs-DzaPc-Fy.js";import"./TabButton-DyNiJvus.js";import"./FixtureEditor-hEk5OnV6.js";import"./MdxEditorField-XtPMM-YF.js";import"./public-api-BjCjxHuM.js";import"./Badge-BFnEZb7M.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const je={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var s,p,l;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var u,d,y;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(y=(d=m.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const Pe=["CanonicalRequest","TabbedSpec"];export{r as CanonicalRequest,m as TabbedSpec,Pe as __namedExportsOrder,je as default};

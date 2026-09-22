import{j as a,r as g}from"./iframe-CyxCReIN.js";import{P as c}from"./index-IrvMtYvT.js";import{S as w}from"./index-Bn2heVxK.js";import"./preload-helper-CcRYDqr-.js";import"./SegmentedControl-CEjKH6ZW.js";import"./utils-DW-IJACk.js";import"./Icon-DjRCcNb6.js";import"./Modal-DmP5tSFH.js";import"./index-B_nLbyow.js";import"./index-D2DBLvBJ.js";import"./button-DJHVQAtF.js";import"./index-CPURVhFy.js";import"./loading-BjMuVtzF.js";import"./modalStack-CVif_cxP.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-nqvSIB_8.js";import"./runtime-mode-nJW7XUBX.js";import"./IconButton-BbI_yPN9.js";import"./MultiSelect-XYzUrmey.js";import"./floating-ui.react-CRn3EQ6Q.js";import"./collections-CoHfwOze.js";import"./Attachment-B9Vor8Jd.js";import"./RuntimeBar-CfwZL-WZ.js";import"./duration-BuesBvhN.js";import"./InputField-SDmWjGqG.js";import"./use-hotkey-4KtlQsH0.js";import"./DropdownMenu-CIAQcaUe.js";import"./DropdownMenuSubmenu-D16MVwd1.js";import"./Combobox-BuZoOMU4.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Wl0EfThz.js";import"./JsonSchemaForm-53ClX2Cw.js";import"./Properties-ThDeoCbc.js";import"./HoverCard-BMGnmMzi.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-DhiM4m2E.js";import"./DatePicker-ByJevppe.js";import"./DateTimePicker-RJRT6Aov.js";import"./TreePickerField-DEJVBfMe.js";import"./Tree-6fLNNFra.js";import"./TreeNode-BFVNqgXr.js";import"./AccordionList-CQzPdzWb.js";import"./ListMenu-2skHUX7o.js";import"./Markdown-CBw2mQVT.js";import"./Callout-eapK3kss.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DMHMhI42.js";import"./CodeDiff-XfVf50oY.js";import"./HighlightedTokens-D-xYBr9j.js";import"./JsonView-4QSG-iiA.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-DUTJ8yw-.js";import"./agent-action-icons-CyQan0QK.js";import"./RuntimeBarActions-GcilTn6v.js";import"./Switch-DNNT--iJ.js";import"./SecretKeySelector-BrvAB7IC.js";import"./index-oOn8ZiEy.js";import"./icon-menu-picker-CN9gm_X4.js";import"./ProviderStatusPanel-5xL5KvI1.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-Ba7KMawA.js";import"./Tabs-CBy3WvcR.js";import"./TabButton-DGV2Ae0c.js";import"./FixtureEditor-BxzW7xej.js";import"./MdxEditorField-i9KNAlz3.js";import"./public-api-BjCjxHuM.js";import"./Badge-DUYXoHnk.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

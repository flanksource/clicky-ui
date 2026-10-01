import{j as a,r as g}from"./iframe-DfHdXEmJ.js";import{P as c}from"./index-BKKDyd88.js";import{S as w}from"./index-CFjlioq_.js";import"./preload-helper-CGPPAlEp.js";import"./SegmentedControl-D_5S0mj5.js";import"./utils-DW-IJACk.js";import"./Icon-B-z_boLM.js";import"./Modal-DNcElLvB.js";import"./index-E_kflO6L.js";import"./index-BA0XQxfj.js";import"./button-C-BhJjDF.js";import"./index-CPURVhFy.js";import"./loading-tTKTeWsM.js";import"./modalStack-D7AkghjI.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CYgCIxEL.js";import"./runtime-mode-DmPz58IQ.js";import"./IconButton-z0qUntbJ.js";import"./MultiSelect-DtOt2ra3.js";import"./floating-ui.react-2Kyn_0pS.js";import"./collections-CoHfwOze.js";import"./Attachment-DoPXhhvb.js";import"./RuntimeBar-C3_Gi6tg.js";import"./duration-BuesBvhN.js";import"./InputField-BWcbPUKz.js";import"./use-hotkey-DrR45Dcb.js";import"./DropdownMenu-BvDvkP9V.js";import"./DropdownMenuSubmenu-DV6WMXuO.js";import"./Combobox-BmWRDzCm.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DXILgODl.js";import"./JsonSchemaForm-YVhIYujq.js";import"./Properties-hsS23AQC.js";import"./HoverCard-fbYchBHc.js";import"./json-schema-form-utils-DXLI5rc1.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-BmPwNJTi.js";import"./DatePicker-3YDvmV1A.js";import"./DateTimePicker-BmufCekC.js";import"./path-tree-cspfj8J9.js";import"./TreePickerField-CDji-M2g.js";import"./Tree-CHm5rM1y.js";import"./TreeNode-CUxYj0FD.js";import"./AccordionList-CiB-AHQR.js";import"./ListMenu-DxtDlaox.js";import"./Markdown-bOFYYtYG.js";import"./Callout-BoYD9d5h.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-TWTbgwri.js";import"./CodeDiff-VG1WirI8.js";import"./HighlightedTokens-COXT88ay.js";import"./JsonView-DVoZPTSY.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-uaGbkgHH.js";import"./agent-action-icons-Bal8FG3L.js";import"./RuntimeBarActions-BC7-vMDv.js";import"./Switch-CQWIaC5M.js";import"./SecretKeySelector-D1Qd8mbG.js";import"./index-OZHjcUKL.js";import"./icon-menu-picker-BWQMUbog.js";import"./ProviderStatusPanel-B4hVGC_a.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-DFgp5EIt.js";import"./Tabs-UpzefEK4.js";import"./TabButton-Bv5BJ5fC.js";import"./FixtureEditor-DUQdoyyk.js";import"./public-api-BjCjxHuM.js";import"./Badge-DnRkYqSO.js";const{expect:t,userEvent:n,within:i}=__STORYBOOK_MODULE_TEST__,R=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function v(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R})})}function h(){const[o,e]=g.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return a.jsx("div",{className:"max-w-3xl p-density-4",children:a.jsx(c,{value:o,onChange:e,models:R,specTabs:w,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Pe={title:"AI/PromptRunEditor",component:c,parameters:{layout:"fullscreen"}},r={render:()=>a.jsx(v,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await n.click(e.getByRole("radio",{name:"Multi-model"}));const B=await e.findByRole("group",{name:"Runtime 2"});await t(i(B).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await n.click(e.getByRole("button",{name:"Add runtime"})),await n.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options")).toHaveLength(1),await n.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>a.jsx(h,{}),play:async({canvasElement:o})=>{const e=i(o);await t(e.queryByTitle("Runtime options")).not.toBeInTheDocument(),await n.click(i(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(i(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await n.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await n.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var p,s,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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

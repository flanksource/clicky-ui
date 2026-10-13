import{j as i,r as w}from"./iframe-BItsxAjD.js";import{P as p}from"./index-ChTnz27n.js";import{S as v}from"./index-C2XovUzj.js";import"./preload-helper-BZq7nIkI.js";import"./SegmentedControl-B1BHyTOC.js";import"./utils-DW-IJACk.js";import"./Icon-Dq8eEpLP.js";import"./Modal-D259elha.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./button-25dF40vQ.js";import"./index-CPURVhFy.js";import"./loading-BOeFbzh-.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-CVrDJX6O.js";import"./runtime-mode-BRmodi5Q.js";import"./runtime-spec-fields-DKLb4W2E.js";import"./InputField-DxvVJi1V.js";import"./use-hotkey-D5NVnhcw.js";import"./RuntimeBar-CZkvJ5SW.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-D3oVIRg_.js";import"./floating-ui.react-CNVnZXsN.js";import"./DropdownMenuSubmenu-C4lOloCs.js";import"./Combobox-D5npeKNx.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DOPLjimn.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-BJj6ommd.js";import"./agent-action-icons-DwXdPL2K.js";import"./permissions-model-CvzEIPaY.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-DanVUdhV.js";import"./JsonSchemaForm-Cwr3SdCP.js";import"./Properties-CqKyb_jW.js";import"./IconButton-DN_Y5FZs.js";import"./format-2niohfpq.js";import"./JsonView-CWGyot2w.js";import"./AccordionList-B60ONwgr.js";import"./Badge-B4WuduE9.js";import"./HoverCard-BRPRrgTD.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-DdYJXrf6.js";import"./DatePicker-Ad9nckK8.js";import"./DateTimePicker-DCNe0ZvV.js";import"./TreePickerField-D0W1wXQJ.js";import"./Tree-Cfrvkts8.js";import"./TreeNode-DRwHEDi3.js";import"./ListMenu-BvBoDFKm.js";import"./Markdown-DLCNs_K4.js";import"./Callout-CV_TgMao.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BiU00fp_.js";import"./CodeDiff-DMKkLlC0.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-kfpOc-CU.js";import"./use-container-width-1_6ydqQ8.js";import"./use-runtime-preset-menu-BRMOGE_a.js";import"./MultiSelect-23Lsfwm4.js";import"./Field-B-NjisVd.js";import"./Switch-iIepFihW.js";import"./SecretKeySelector-DIug7VBS.js";import"./index-JQhHWXK7.js";import"./icon-menu-picker-BUj8WGkQ.js";import"./SandboxCreateWizard-CzBmvWnc.js";import"./Tabs-CWWZajIQ.js";import"./TabButton-L-L03UjT.js";import"./FixtureEditor-C85L2jvG.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ne={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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

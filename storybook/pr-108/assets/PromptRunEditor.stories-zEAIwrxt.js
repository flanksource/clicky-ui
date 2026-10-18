import{j as i,r as w}from"./iframe-CKgGkAV6.js";import{P as p}from"./index-Ca5epTOP.js";import{S as v}from"./index-Bm3L_Rom.js";import"./preload-helper-D6IOlyYr.js";import"./SegmentedControl-DpwJjHzq.js";import"./utils-DW-IJACk.js";import"./Icon-zT9BHEU_.js";import"./Modal-CyMxnyK7.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./loading-CVVM6inm.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-bR_uZE_q.js";import"./runtime-mode-D3x5TNI3.js";import"./runtime-spec-fields-C6C3t_eP.js";import"./InputField-BPx4Bf0c.js";import"./use-hotkey-y07G-_jp.js";import"./RuntimeBar-BfxjwOD5.js";import"./duration-BuesBvhN.js";import"./DropdownMenu-BmZ28lfR.js";import"./floating-ui.react-DvrmiGRg.js";import"./DropdownMenuSubmenu-j0TnzvxK.js";import"./Combobox-Ce8evdZR.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CvKT4WAZ.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-POg1kEFf.js";import"./agent-action-icons-D8vXzKKq.js";import"./permissions-model-BJQ04wVD.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";import"./Attachment-BoupqDbs.js";import"./JsonSchemaForm-BvWBwxWf.js";import"./Properties-aB4NtyEt.js";import"./IconButton-_EDmsPTs.js";import"./format-2niohfpq.js";import"./JsonView-CkPnotjI.js";import"./AccordionList-5bOCqJVe.js";import"./Badge-DNVG-Ar4.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D6AhenUg.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./DateField-DJknf3AZ.js";import"./DatePicker-tDjjKlaW.js";import"./DateTimePicker-BbQkUMe4.js";import"./TreePickerField-CANyZnzt.js";import"./Tree-BUJ8DGY7.js";import"./TreeNode-Dj6_Ccy_.js";import"./ListMenu-C2M43MNt.js";import"./Markdown-quaQmCoJ.js";import"./Callout-CoJdVJX9.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BLqJHOcq.js";import"./CodeDiff-CUQ4nb-v.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BWRQ-hT_.js";import"./HighlightedTokens-Dei84GlG.js";import"./use-container-width-CKjq-JgA.js";import"./use-runtime-preset-menu-5xhf72an.js";import"./MultiSelect-C-Y1qLAG.js";import"./Field-C0P0CZjB.js";import"./Switch-B5rsbBcI.js";import"./SecretKeySelector-ChsJB15v.js";import"./index-UgZ8RgH0.js";import"./icon-menu-picker-eS1jjM-h.js";import"./SandboxCreateWizard-DFAGNXuz.js";import"./Tabs-lpdPBOYL.js";import"./TabButton-DxdiiDJK.js";import"./FixtureEditor-DS9CJHry.js";const{expect:t,userEvent:o,within:n}=__STORYBOOK_MODULE_TEST__,B=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function h(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B})})}function b(){const[a,e]=w.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",prompt:{user:"Review {{company}}",system:"Be precise"},budget:{maxTokens:8e3}}});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(p,{value:a,onChange:e,models:B,specTabs:v,recentRuntimes:[{model:"gpt-5.5",id:"openai/gpt-5.5",mode:"agent",effort:"high"}]})})}const Ue={title:"AI/PromptRunEditor",component:p,parameters:{layout:"fullscreen"}},r={render:()=>i.jsx(h,{}),play:async({canvasElement:a})=>{const e=n(a);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Multi-model"}));const c=await e.findByRole("group",{name:"Runtime 2"});await t(n(c).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Add runtime"})),await o.click(await e.findByRole("button",{name:"Remove runtime 3"})),await t(e.queryByRole("group",{name:"Runtime 3"})).not.toBeInTheDocument(),await t(e.getAllByTitle("Runtime options").filter(s=>!s.closest('[role="group"][aria-label$=" controls"]'))).toHaveLength(1),await o.click(e.getByRole("radio",{name:"Single model"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}},m={render:()=>i.jsx(b,{}),play:async({canvasElement:a})=>{const e=n(a),c=e.getByRole("group",{name:"Runtime 1 controls"});await o.click(n(c).getByTitle("Runtime options"));const s=await n(document.body).findByRole("menu",{name:"Runtime options"});await t(n(s).queryByRole("menuitem",{name:"Advanced"})).not.toBeInTheDocument(),await o.keyboard("{Escape}"),await o.click(n(e.getByRole("list",{name:"Recently used runtimes"})).getByRole("button")),await t(n(e.getByRole("group",{name:"Runtime 1 controls"})).getByTitle("Model — gpt-5.5")).toBeInTheDocument(),await o.click(e.getByRole("tab",{name:"System Prompt"})),await t(e.getByLabelText("System")).toHaveValue("Be precise"),await o.click(e.getByRole("tab",{name:"Model"})),await t(e.getByRole("region",{name:"Model"})).toHaveTextContent("Max tokens")}};var l,u,d;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
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

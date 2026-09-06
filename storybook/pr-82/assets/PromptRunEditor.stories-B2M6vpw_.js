import{j as r,r as l}from"./iframe-psk4-kN7.js";import{P as u}from"./index-CGpKWY6Y.js";import"./preload-helper-DUVrmzNZ.js";import"./button-CPGxxxwO.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-D0L0VhvC.js";import"./Modal-DAN5RH3G.js";import"./index-DdkbI2pk.js";import"./index-Q2ctqHt2.js";import"./Icon-CGpuyfCp.js";import"./modalStack-BlX58fkl.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-DCF11JGg.js";import"./Attachment-CIbzLdjh.js";import"./RuntimeBar-BG22ybFZ.js";import"./runtime-mode-B3nrroGy.js";import"./SegmentedControl-CdMMoXut.js";import"./DropdownMenu-BV9KNdAW.js";import"./floating-ui.react-BIHz11iz.js";import"./DropdownMenuSubmenu-CB5wmKqJ.js";import"./InputField-RF4iSQz-.js";import"./use-hotkey-CygUvHd8.js";import"./index-BvYemOxO.js";import"./JsonSchemaForm-u2Qrk_z6.js";import"./HoverCard-BWPHO9Mj.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-Bf0_JPsW.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CcosoLNL.js";import"./FilterPill-VYWKOgBB.js";import"./DateField-BC91gAgQ.js";import"./DatePicker-Du8kNm7o.js";import"./DateTimePicker-Bjum2p3t.js";import"./TreePickerField-DYtyxy5e.js";import"./Tree-DCzr_VP2.js";import"./TreeNode-DLTYW6H6.js";import"./ListMenu-Cn1umlTt.js";import"./Switch-4ZyZlSyA.js";import"./SecretKeySelector-B6GNJtb4.js";import"./index-DPRIgtOH.js";import"./icon-menu-picker-DaXj6Dro.js";import"./IconButton-D4hqm9l7.js";import"./ProviderStatusPanel-Bv5glgt9.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-C6GjRlYh.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-BiK_PMFN.js";import"./FixtureEditor-ZySZb5C5.js";import"./MdxEditorField-Bcj8uor3.js";import"./Callout-BB-1hbfd.js";import"./callout-tones-EFt49BYo.js";import"./public-api-BjCjxHuM.js";import"./Badge-C2sQY84x.js";import"./Field-DYxtvACb.js";import"./MultiSelect-DS9XvU5V.js";const{expect:t,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,e]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:e,models:d})})}const ve={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const e=a(n);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(e.getByRole("button",{name:"Add runtime"}));const s=await e.findByRole("group",{name:"Runtime 2"});await t(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await t(e.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(e.getByRole("button",{name:"Remove runtime 2"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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

    // A comparison row seeds from the first row's backend and becomes
    // removable, so both rows carry their own controls.
    await userEvent.click(canvas.getByRole("button", {
      name: "Add runtime"
    }));
    const second = await canvas.findByRole("group", {
      name: "Runtime 2"
    });
    await expect(within(second).getByRole("group", {
      name: "Runtime 2 controls"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Remove runtime 2"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove runtime 2"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(c=(p=o.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const we=["CanonicalRequest"];export{o as CanonicalRequest,we as __namedExportsOrder,ve as default};

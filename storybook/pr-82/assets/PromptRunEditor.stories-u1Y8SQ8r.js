import{j as r,r as l}from"./iframe-ODiXRaeD.js";import{P as u}from"./index-B8X8kWRO.js";import"./preload-helper-DUVrmzNZ.js";import"./button-vfp9rbvl.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BGUot--s.js";import"./Modal-LKsOOO6Y.js";import"./index-DoPuVbTh.js";import"./index-DUxqcZ0I.js";import"./Icon-CulP8OOJ.js";import"./modalStack-CqgS2p7j.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-l2ow3oX4.js";import"./Attachment-yvhQcPJn.js";import"./RuntimeBar-CcKzaJi9.js";import"./runtime-mode-SX_RX29l.js";import"./SegmentedControl-Bv1pVWWz.js";import"./DropdownMenu-Cnc4cnjr.js";import"./floating-ui.react-DXashjmJ.js";import"./DropdownMenuSubmenu-CAYBYAzj.js";import"./InputField-BjEyEyjO.js";import"./use-hotkey-Cb1BBnhW.js";import"./index-Cn97fYqS.js";import"./JsonSchemaForm-D-u3fA1J.js";import"./HoverCard-BdexRlW3.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-CYKlTfDz.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-bl4stDBW.js";import"./FilterPill-DCe4YYsD.js";import"./DateField-BdEQy3_r.js";import"./DatePicker-D2p20ZAG.js";import"./DateTimePicker-fMg4dziS.js";import"./TreePickerField-Cl8ygdFX.js";import"./Tree-Do7CmvPC.js";import"./TreeNode-DzGpQWEW.js";import"./ListMenu-DTqcq7aK.js";import"./Switch-BTiDK4IO.js";import"./SecretKeySelector-N8hR79Aw.js";import"./index-7xTk_PNV.js";import"./icon-menu-picker-YM8GqOcQ.js";import"./IconButton-Dhr37kem.js";import"./ProviderStatusPanel-DFe7x1EL.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-DdkRL6lf.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-ChQvyAiG.js";import"./FixtureEditor-BBgI8bYD.js";import"./MdxEditorField-BoiKNNXU.js";import"./Callout-DmKyhSqT.js";import"./callout-tones-EFt49BYo.js";import"./public-api-BjCjxHuM.js";import"./Badge-2T1VklgA.js";import"./Field-BRM7hFB-.js";import"./MultiSelect-Dqzi9BW_.js";const{expect:t,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,e]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:e,models:d})})}const ve={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const e=a(n);await t(e.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(e.getByRole("button",{name:"Add runtime"}));const s=await e.findByRole("group",{name:"Runtime 2"});await t(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await t(e.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(e.getByRole("button",{name:"Remove runtime 2"})),await t(e.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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

import{j as r,r as l}from"./iframe-D7AEzmiZ.js";import{P as u}from"./index-BNNnMZDk.js";import"./preload-helper-hq9vNfsk.js";import"./button-qcdX8b7r.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Cul39Clz.js";import"./Modal-D4dCfCM0.js";import"./index-DOqUsOzE.js";import"./index-ChecR3Pf.js";import"./Icon-BHlfVGs3.js";import"./modalStack-BBzzK_XK.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-HX7m8UV9.js";import"./Attachment-Bu7YThMo.js";import"./RuntimeBar-DRV4g-dd.js";import"./runtime-mode-pconlZVy.js";import"./SegmentedControl-BOXrsTFe.js";import"./DropdownMenu-Bs5Osu-C.js";import"./floating-ui.react-r1UfLjHW.js";import"./DropdownMenuSubmenu-znATrmj7.js";import"./InputField-DjUeen2C.js";import"./use-hotkey-DKT0Jf49.js";import"./index-vMoqeZnW.js";import"./JsonSchemaForm-DgrJPSkT.js";import"./Properties-DNVUS-57.js";import"./IconButton-CETqdsAT.js";import"./HoverCard-D6mUI4fG.js";import"./path-tree-u-M5tJ4w.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-DTH7dKdr.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-D00TCDOF.js";import"./FilterPill-D4gg9Vsw.js";import"./DateField-DG39xyNS.js";import"./DatePicker-CwsGR4zl.js";import"./DateTimePicker-DDhBpBxg.js";import"./TreePickerField-hNopphh3.js";import"./Tree-B-7Aw9OS.js";import"./TreeNode-CSZW85Dj.js";import"./ListMenu-Gncplpv7.js";import"./Markdown-KVUZpP7_.js";import"./Callout-BY-6BVcJ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B58cdzam.js";import"./CodeDiff-CanoRRN2.js";import"./HighlightedTokens-CqqQi_AL.js";import"./JsonView-DUzBdQDr.js";import"./Switch-BkWa6slJ.js";import"./SecretKeySelector-N-BpL8PP.js";import"./index-BfV7-unC.js";import"./icon-menu-picker-uD-dg4Rx.js";import"./ProviderStatusPanel-Bn_hDLGL.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-CKfGQ39J.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-kN2wgwaQ.js";import"./FixtureEditor-BEp1HeqB.js";import"./MdxEditorField-BfE3WNNu.js";import"./public-api-BjCjxHuM.js";import"./Badge-Bdn1ojcv.js";import"./Field-DeHJTnjI.js";import"./MultiSelect-BqAvyQ3l.js";const{expect:e,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function R(){const[n,t]=l.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return r.jsx("div",{className:"max-w-3xl p-density-4",children:r.jsx(u,{value:n,onChange:t,models:d})})}const Dt={title:"AI/PromptRunEditor",component:u,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx(R,{}),play:async({canvasElement:n})=>{const t=a(n);await e(t.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Add runtime"}));const s=await t.findByRole("group",{name:"Runtime 2"});await e(a(s).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await e(t.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await i.click(t.getByRole("button",{name:"Remove runtime 2"})),await e(t.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var m,p,c;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(c=(p=o.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const ft=["CanonicalRequest"];export{o as CanonicalRequest,ft as __namedExportsOrder,Dt as default};

import{j as l}from"./iframe-DuxeFE6n.js";import{T as r}from"./ToolCall-CXrKIxd2.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./button-DFfwSoCK.js";import"./index-0zBpNI7D.js";import"./loading-DDRbwKIs.js";import"./Icon-xkfjMf_e.js";import"./types-B1SOX9si.js";import"./CodeBlock-CozmWCQs.js";import"./CodeDiff-Bz4ANvib.js";import"./SegmentedControl-Cc5KEiB0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-DddqulwK.js";import"./KeyValueList-Bdoj9wlV.js";import"./DataTable-BkIvI7hy.js";import"./SortableHeader-BhsK1IKi.js";import"./Modal-sB55LhdE.js";import"./index-B9gwVplk.js";import"./index-D3frbI1a.js";import"./modalStack-CIISi3gp.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CQ-m2fhr.js";import"./floating-ui.react-Ci4YBj6F.js";import"./FilterPill-CG8H2m7X.js";import"./Combobox-9g_A6MkL.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DxXwFRzS.js";import"./MultiSelect-CkZbioWA.js";import"./RangeSlider-CFl0p9I5.js";import"./TimeRange-s1i7R8mc.js";import"./select-DTEylNDD.js";import"./Timestamp-NpNHq9Lp.js";import"./TagList-BsrG1RlY.js";import"./Badge-TRQq4Kin.js";import"./HoverCard-De6_pK-Q.js";import"./Properties-gm_XsF1U.js";import"./IconButton-_OyxH9XU.js";import"./DropdownMenu-C_LZD4ok.js";import"./DropdownMenuSubmenu-xv77J2eN.js";import"./StatusDot-CA2lF7iJ.js";const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,u={type:"dynamic-tool",toolName:"Edit",toolCallId:"call-edit-collapsed",state:"output-available",input:{file_path:"src/config.ts",old_string:"export const enabled = false;",new_string:"export const enabled = true;"},output:"Updated src/config.ts"},y=[{type:"dynamic-tool",toolName:"Bash",toolCallId:"call-shell",state:"output-available",input:{command:"pnpm test",timeout:12e4},output:`3 tests passed
exit 0`},{type:"dynamic-tool",toolName:"Read",toolCallId:"call-read",state:"output-available",input:{file_path:"src/config.ts"},output:"export const enabled = true;"},u,{type:"dynamic-tool",toolName:"update_plan",toolCallId:"call-plan",state:"output-available",input:{explanation:"Implementation plan",plan:[{step:"Trace the renderer",status:"completed"},{step:"Add known tools",status:"in_progress"}]},output:"Plan updated"},{type:"dynamic-tool",toolName:"AskUserQuestion",toolCallId:"call-question",state:"output-available",input:{questions:[{header:"Scope",question:"Which environment?",options:[{label:"Local",description:"Use local fixtures"},{label:"Staging"}]}]},output:"Local"}],lt={title:"Chat/ToolCall/Known Tools",component:r,args:{part:u},parameters:{layout:"padded"}},o={render:t=>l.jsx("div",{className:"max-w-3xl",children:l.jsx(r,{...t})}),play:async({canvasElement:t})=>{const n=x(t).getByTestId("tool-call-args");await e(n).toHaveTextContent("file_path: src/config.ts"),await e(n).toHaveTextContent("old_string: export const enabled = false;")}},a={render:()=>l.jsx("div",{className:"max-w-4xl space-y-4",children:y.map(t=>l.jsx(r,{defaultOpen:!0,part:t},t.toolCallId))}),play:async({canvasElement:t})=>{await e(t.querySelector('[data-slot="tool-render-shell-input"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-file-read"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-file-edit"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-plan"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-question"]')).not.toBeNull()}};var s,p,i;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <ToolCall {...args} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const args = within(canvasElement).getByTestId("tool-call-args");
    await expect(args).toHaveTextContent("file_path: src/config.ts");
    await expect(args).toHaveTextContent("old_string: export const enabled = false;");
  }
}`,...(i=(p=o.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};var d,c,m;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div className="max-w-4xl space-y-4">
      {KNOWN_TOOL_PARTS.map(part => <ToolCall key={part.toolCallId} defaultOpen part={part} />)}
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.querySelector('[data-slot="tool-render-shell-input"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="tool-render-file-read"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="tool-render-file-edit"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="tool-render-plan"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="tool-render-question"]')).not.toBeNull();
  }
}`,...(m=(c=a.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const rt=["CollapsedArguments","StandardRenderers"];export{o as CollapsedArguments,a as StandardRenderers,rt as __namedExportsOrder,lt as default};

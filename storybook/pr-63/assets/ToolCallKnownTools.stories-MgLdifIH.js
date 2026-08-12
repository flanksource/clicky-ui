import{j as l}from"./iframe-DIGBtUIu.js";import{T as r}from"./ToolCall--LEIFiCm.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./button-BhKCLqoA.js";import"./index-0zBpNI7D.js";import"./loading-D2cuqAxD.js";import"./Icon-Ckp6RE90.js";import"./types-B1SOX9si.js";import"./CodeBlock-qb2M-WhO.js";import"./CodeDiff-DyOqFPkh.js";import"./SegmentedControl-CoaMDtpF.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-CIcBiLEe.js";import"./KeyValueList-DBmzKskq.js";import"./DataTable-CjiYOErP.js";import"./SortableHeader-DeCdyOuq.js";import"./Modal-BFrt9RBg.js";import"./index-CXQUnhiw.js";import"./index-evrdMFRC.js";import"./modalStack-C-EkQo6g.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DKEM-yVt.js";import"./floating-ui.react-CxgHPOfO.js";import"./FilterPill-DbdXEpGC.js";import"./Combobox-BgSWV58v.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DMZ4d6C6.js";import"./MultiSelect-DkVf6nxu.js";import"./RangeSlider-BP_bF84e.js";import"./TimeRange-BV4OpJTO.js";import"./select-DECEq3dq.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-CAeQnq5s.js";import"./TagList-ChUpvwJX.js";import"./Badge-CeO7XmU6.js";import"./HoverCard-DlH6gDP1.js";import"./Properties-CsbDH91a.js";import"./IconButton-CAaA5K_1.js";import"./DropdownMenu-CVD-ABeT.js";import"./DropdownMenuSubmenu-BK5dfo9E.js";import"./StatusDot-CWR5z1ge.js";const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,u={type:"dynamic-tool",toolName:"Edit",toolCallId:"call-edit-collapsed",state:"output-available",input:{file_path:"src/config.ts",old_string:"export const enabled = false;",new_string:"export const enabled = true;"},output:"Updated src/config.ts"},y=[{type:"dynamic-tool",toolName:"Bash",toolCallId:"call-shell",state:"output-available",input:{command:"pnpm test",timeout:12e4},output:`3 tests passed
exit 0`},{type:"dynamic-tool",toolName:"Read",toolCallId:"call-read",state:"output-available",input:{file_path:"src/config.ts"},output:"export const enabled = true;"},u,{type:"dynamic-tool",toolName:"update_plan",toolCallId:"call-plan",state:"output-available",input:{explanation:"Implementation plan",plan:[{step:"Trace the renderer",status:"completed"},{step:"Add known tools",status:"in_progress"}]},output:"Plan updated"},{type:"dynamic-tool",toolName:"AskUserQuestion",toolCallId:"call-question",state:"output-available",input:{questions:[{header:"Scope",question:"Which environment?",options:[{label:"Local",description:"Use local fixtures"},{label:"Staging"}]}]},output:"Local"}],rt={title:"Chat/ToolCall/Known Tools",component:r,args:{part:u},parameters:{layout:"padded"}},o={render:t=>l.jsx("div",{className:"max-w-3xl",children:l.jsx(r,{...t})}),play:async({canvasElement:t})=>{const n=x(t).getByTestId("tool-call-args");await e(n).toHaveTextContent("file_path: src/config.ts"),await e(n).toHaveTextContent("old_string: export const enabled = false;")}},a={render:()=>l.jsx("div",{className:"max-w-4xl space-y-4",children:y.map(t=>l.jsx(r,{defaultOpen:!0,part:t},t.toolCallId))}),play:async({canvasElement:t})=>{await e(t.querySelector('[data-slot="tool-render-shell-input"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-file-read"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-file-edit"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-plan"]')).not.toBeNull(),await e(t.querySelector('[data-slot="tool-render-question"]')).not.toBeNull()}};var s,p,i;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(m=(c=a.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const nt=["CollapsedArguments","StandardRenderers"];export{o as CollapsedArguments,a as StandardRenderers,nt as __namedExportsOrder,rt as default};

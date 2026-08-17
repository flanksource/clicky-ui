import{j as l}from"./iframe-BOqGPkjA.js";import{T as r}from"./ToolCall-D1R_MyTj.js";import"./preload-helper-BHaa9cja.js";import"./utils-CR52uffu.js";import"./button-o3q0Bgz-.js";import"./index-0zBpNI7D.js";import"./loading-CuZVbQUO.js";import"./Icon-DmMP-gqZ.js";import"./types-B1SOX9si.js";import"./CodeBlock-cDQjXAbc.js";import"./CodeDiff-Dr2JPWcF.js";import"./SegmentedControl-ScLmdy_r.js";import"./code-highlight-D4J1xWXq.js";import"./JsonView-CJ3P6BgG.js";import"./KeyValueList-DZFTXZec.js";import"./DataTable-wM0sVjW5.js";import"./SortableHeader-xn-Qu8dX.js";import"./Modal-Zny1UyQh.js";import"./index-4azl-_NY.js";import"./index-B9J3eB3Z.js";import"./modalStack-Cy5N7MXo.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Bob4q9Oe.js";import"./floating-ui.react-D9PnPcwb.js";import"./FilterPill-BSzTJgOd.js";import"./Combobox-Y357Wu3y.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CCYJVd9b.js";import"./MultiSelect-EhuEcndF.js";import"./RangeSlider-BvOybwIk.js";import"./TimeRange-DXbk3lMx.js";import"./select-DB_eefDo.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-MJoZSODF.js";import"./TagList-N6ebrBYM.js";import"./Badge-BL3PsgIi.js";import"./HoverCard-BUGj1vWM.js";import"./Properties-BF8PQ8nO.js";import"./IconButton-5qvDvOGg.js";import"./DropdownMenu-C-0fap_8.js";import"./DropdownMenuSubmenu-ByYdjx3z.js";import"./StatusDot-sZA9BY2q.js";const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,u={type:"dynamic-tool",toolName:"Edit",toolCallId:"call-edit-collapsed",state:"output-available",input:{file_path:"src/config.ts",old_string:"export const enabled = false;",new_string:"export const enabled = true;"},output:"Updated src/config.ts"},y=[{type:"dynamic-tool",toolName:"Bash",toolCallId:"call-shell",state:"output-available",input:{command:"pnpm test",timeout:12e4},output:`3 tests passed
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

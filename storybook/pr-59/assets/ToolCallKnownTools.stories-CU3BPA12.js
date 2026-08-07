import{j as l}from"./iframe-BW12FETW.js";import{T as r}from"./ToolCall-1X0HSsFv.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";import"./button-C1MH17Zc.js";import"./index-0zBpNI7D.js";import"./loading-Dbw8cjcb.js";import"./Icon-hksqPAe3.js";import"./types-B1SOX9si.js";import"./CodeBlock-CADMdYrZ.js";import"./CodeDiff-CBLDd1IQ.js";import"./SegmentedControl-BbV1j_MF.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-BsWn6jlo.js";import"./KeyValueList-DaUK5Xnn.js";import"./DataTable-BIyKT2jy.js";import"./SortableHeader-B-Dlosao.js";import"./Modal-wCkM4yzI.js";import"./index-D-nQD73E.js";import"./index-9NU1mlqD.js";import"./modalStack-M98G4Zz7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-bG1WS0u1.js";import"./floating-ui.react-DmmqB0te.js";import"./FilterPill-Dv7xoXaX.js";import"./Combobox-ZYnGyNSg.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DajyfDhj.js";import"./MultiSelect-DKILBgj5.js";import"./RangeSlider-DXo4a9IS.js";import"./TimeRange-UGOJtU8h.js";import"./select-Dq3oow6c.js";import"./Timestamp-CMbIlKnE.js";import"./TagList-Grm9sVQM.js";import"./Badge-CvknhbZU.js";import"./HoverCard-1h0LYB4r.js";import"./Properties-Bq7G0PgT.js";import"./IconButton-DO-nC4dq.js";import"./DropdownMenu-CPl8kDYM.js";import"./DropdownMenuSubmenu-B6JHjlBN.js";import"./StatusDot-BWRIHMXy.js";const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,u={type:"dynamic-tool",toolName:"Edit",toolCallId:"call-edit-collapsed",state:"output-available",input:{file_path:"src/config.ts",old_string:"export const enabled = false;",new_string:"export const enabled = true;"},output:"Updated src/config.ts"},y=[{type:"dynamic-tool",toolName:"Bash",toolCallId:"call-shell",state:"output-available",input:{command:"pnpm test",timeout:12e4},output:`3 tests passed
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

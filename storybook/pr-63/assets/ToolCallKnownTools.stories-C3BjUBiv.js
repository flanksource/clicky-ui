import{j as l}from"./iframe-Cr-FkDEs.js";import{T as r}from"./ToolCall-DTM7MRe5.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./button-BIMW_edl.js";import"./index-0zBpNI7D.js";import"./loading-CKGAX9p1.js";import"./Icon-D4-4O73G.js";import"./types-B1SOX9si.js";import"./CodeBlock-DG47LY8m.js";import"./CodeDiff-C-sZi4pl.js";import"./SegmentedControl-6bGXsPAd.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-BzbndhAs.js";import"./KeyValueList-C__g8m5E.js";import"./DataTable-Coqas7Cp.js";import"./SortableHeader-ByDB-Fck.js";import"./Modal-DAxtETs9.js";import"./index-CZGmL05H.js";import"./index-DE_cDvZT.js";import"./modalStack-CxrbjVR6.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CHwCqwBI.js";import"./floating-ui.react-D2O3t5CC.js";import"./FilterPill-mf-mv3ck.js";import"./Combobox-CHlccKiM.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-C6_EFGUM.js";import"./MultiSelect-CVk_HtHp.js";import"./RangeSlider-QpHMxvzT.js";import"./TimeRange-4864UDs-.js";import"./select-D6Nf1EHd.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-DJfGAyrQ.js";import"./TagList-k2BN3yd3.js";import"./Badge-Zm2scJNv.js";import"./HoverCard-CAScCkav.js";import"./Properties-2H-YgSMb.js";import"./IconButton-DnG7YAiT.js";import"./DropdownMenu-J3cpbvJi.js";import"./DropdownMenuSubmenu-FzQnMbXI.js";import"./StatusDot-_mX0yOq3.js";const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,u={type:"dynamic-tool",toolName:"Edit",toolCallId:"call-edit-collapsed",state:"output-available",input:{file_path:"src/config.ts",old_string:"export const enabled = false;",new_string:"export const enabled = true;"},output:"Updated src/config.ts"},y=[{type:"dynamic-tool",toolName:"Bash",toolCallId:"call-shell",state:"output-available",input:{command:"pnpm test",timeout:12e4},output:`3 tests passed
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

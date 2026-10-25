import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./ToolCall-DtXAC4cV.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),i=t(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={type:`dynamic-tool`,toolName:`Edit`,toolCallId:`call-edit-collapsed`,state:`output-available`,input:{file_path:`src/config.ts`,old_string:`export const enabled = false;`,new_string:`export const enabled = true;`},output:`Updated src/config.ts`},c=[{type:`dynamic-tool`,toolName:`Bash`,toolCallId:`call-shell`,state:`output-available`,input:{command:`pnpm test`,timeout:12e4},output:`3 tests passed
exit 0`},{type:`dynamic-tool`,toolName:`Read`,toolCallId:`call-read`,state:`output-available`,input:{file_path:`src/config.ts`},output:`export const enabled = true;`},s,{type:`dynamic-tool`,toolName:`update_plan`,toolCallId:`call-plan`,state:`output-available`,input:{explanation:`Implementation plan`,plan:[{step:`Trace the renderer`,status:`completed`},{step:`Add known tools`,status:`in_progress`}]},output:`Plan updated`},{type:`dynamic-tool`,toolName:`AskUserQuestion`,toolCallId:`call-question`,state:`output-available`,input:{questions:[{header:`Scope`,question:`Which environment?`,options:[{label:`Local`,description:`Use local fixtures`},{label:`Staging`}]}]},output:`Local`}],l={title:`Chat/ToolCall/Known Tools`,component:r,args:{part:s},parameters:{layout:`padded`}},u={render:e=>(0,i.jsx)(`div`,{className:`max-w-3xl`,children:(0,i.jsx)(r,{...e})}),play:async({canvasElement:e})=>{let t=o(e).getByTestId(`tool-call-args`);await a(t).toHaveTextContent(`file_path: src/config.ts`),await a(t).toHaveTextContent(`old_string: export const enabled = false;`)}},d={render:()=>(0,i.jsx)(`div`,{className:`max-w-4xl space-y-4`,children:c.map(e=>(0,i.jsx)(r,{defaultOpen:!0,part:e},e.toolCallId))}),play:async({canvasElement:e})=>{await a(e.querySelector(`[data-slot="tool-render-shell-input"]`)).not.toBeNull(),await a(e.querySelector(`[data-slot="tool-render-file-read"]`)).not.toBeNull(),await a(e.querySelector(`[data-slot="tool-render-file-edit"]`)).not.toBeNull(),await a(e.querySelector(`[data-slot="tool-render-plan"]`)).not.toBeNull(),await a(e.querySelector(`[data-slot="tool-render-question"]`)).not.toBeNull()}},f=[`CollapsedArguments`,`StandardRenderers`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}}})))()}p();export{u as CollapsedArguments,d as StandardRenderers,f as __namedExportsOrder,l as default};
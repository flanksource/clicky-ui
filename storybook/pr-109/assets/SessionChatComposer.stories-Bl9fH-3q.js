import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./SessionChatComposer-bnf67yF7.js";function a(){let[e,t]=(0,o.useState)(`default`);return(0,s.jsxs)(`div`,{className:`max-w-xl space-y-2`,children:[(0,s.jsxs)(`p`,{className:`text-xs text-muted-foreground`,children:[`Current mode:`,` `,(0,s.jsx)(`span`,{className:`font-mono`,"data-testid":`current-mode`,children:e})]}),(0,s.jsx)(i,{status:`idle`,capabilities:f,onSubmit:l(),permissionMode:e,permissionModes:p,onPermissionModeChange:t})]})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{o=t(),r(),s=n(),{expect:c,fn:l,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,f={interrupt:!0,steer:!1,followUp:!0,resume:!0,setPermissionMode:!0},p=[`default`,`acceptEdits`,`plan`,`auto`],m={title:`AI/SessionChatComposer`,component:i,tags:[`autodocs`],args:{status:`idle`,capabilities:f,onSubmit:l()},parameters:{docs:{description:{component:"The follow-up composer shown under a session transcript. When the host supplies `permissionMode`/`permissionModes`, it renders a compact permission-mode picker in the prompt toolbar, ahead of any host-supplied toolbar content."}}}},h={},g={args:{disabledReason:`Loading session…`},play:async({canvasElement:e})=>{let t=d(e).getByPlaceholderText(`Loading session…`);await c(t).toBeDisabled()}},_={render:()=>(0,s.jsx)(a,{}),play:async({canvasElement:e})=>{let t=d(e),n=t.getByRole(`combobox`,{name:`Permission mode`});await c(n).toHaveValue(`default`),await u.selectOptions(n,`auto`),await c(n).toHaveValue(`auto`),await c(t.getByTestId(`current-mode`)).toHaveTextContent(`auto`)}},v={args:{permissionMode:`acceptEdits`,permissionModes:p},play:async({canvasElement:e})=>{let t=d(e).getByRole(`combobox`,{name:`Permission mode`});await c(t).toBeDisabled(),await c(t).toHaveValue(`acceptEdits`)}},y={args:{permissionMode:`plan`,permissionModes:p,onPermissionModeChange:l(),toolbar:(0,s.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Claude Sonnet`})},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByRole(`combobox`,{name:`Permission mode`})).toBeInTheDocument(),await c(t.getByText(`Claude Sonnet`)).toBeInTheDocument()}},b=[`Default`,`DisabledWithReason`,`WithPermissionModePicker`,`ReadOnlyPicker`,`PickerAlongsideHostToolbar`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabledReason: "Loading session…"
  },
  play: async ({
    canvasElement
  }) => {
    const textbox = within(canvasElement).getByPlaceholderText("Loading session…");
    await expect(textbox).toBeDisabled();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <InteractivePickerStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const picker = canvas.getByRole("combobox", {
      name: "Permission mode"
    });
    await expect(picker).toHaveValue("default");
    await userEvent.selectOptions(picker, "auto");
    await expect(picker).toHaveValue("auto");
    await expect(canvas.getByTestId("current-mode")).toHaveTextContent("auto");
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    permissionMode: "acceptEdits",
    permissionModes: PERMISSION_MODES
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const picker = canvas.getByRole("combobox", {
      name: "Permission mode"
    });
    await expect(picker).toBeDisabled();
    await expect(picker).toHaveValue("acceptEdits");
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    permissionMode: "plan",
    permissionModes: PERMISSION_MODES,
    onPermissionModeChange: fn(),
    toolbar: <span className="text-xs text-muted-foreground">Claude Sonnet</span>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("combobox", {
      name: "Permission mode"
    })).toBeInTheDocument();
    await expect(canvas.getByText("Claude Sonnet")).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{h as Default,g as DisabledWithReason,y as PickerAlongsideHostToolbar,v as ReadOnlyPicker,_ as WithPermissionModePicker,b as __namedExportsOrder,m as default};
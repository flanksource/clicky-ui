import{j as a,r as R}from"./iframe-DNj_zNZU.js";import{S as k}from"./SessionChatComposer-DK2mC8lx.js";import"./preload-helper-LCYGeQwd.js";import"./PromptInput-DPHbBT0I.js";import"./utils-DW-IJACk.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./Icon-D173D1Xm.js";import"./Attachment-DV3X6xd9.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CVPTN7g5.js";import"./agent-action-icons-CKSmu47z.js";import"./effort-icons-DrB6agg7.js";import"./select-C4MKv3sD.js";const{expect:s,fn:d,userEvent:D,within:p}=__STORYBOOK_MODULE_TEST__,I={interrupt:!0,steer:!1,followUp:!0,resume:!0,setPermissionMode:!0},l=["default","acceptEdits","plan","auto"];function C(){const[e,o]=R.useState("default");return a.jsxs("div",{className:"max-w-xl space-y-2",children:[a.jsxs("p",{className:"text-xs text-muted-foreground",children:["Current mode:"," ",a.jsx("span",{className:"font-mono","data-testid":"current-mode",children:e})]}),a.jsx(k,{status:"idle",capabilities:I,onSubmit:d(),permissionMode:e,permissionModes:l,onPermissionModeChange:o})]})}const J={title:"AI/SessionChatComposer",component:k,tags:["autodocs"],args:{status:"idle",capabilities:I,onSubmit:d()},parameters:{docs:{description:{component:"The follow-up composer shown under a session transcript. When the host supplies `permissionMode`/`permissionModes`, it renders a compact permission-mode picker in the prompt toolbar, ahead of any host-supplied toolbar content."}}}},n={},r={args:{disabledReason:"Loading session…"},play:async({canvasElement:e})=>{const o=p(e).getByPlaceholderText("Loading session…");await s(o).toBeDisabled()}},i={render:()=>a.jsx(C,{}),play:async({canvasElement:e})=>{const o=p(e),t=o.getByRole("combobox",{name:"Permission mode"});await s(t).toHaveValue("default"),await D.selectOptions(t,"auto"),await s(t).toHaveValue("auto"),await s(o.getByTestId("current-mode")).toHaveTextContent("auto")}},c={args:{permissionMode:"acceptEdits",permissionModes:l},play:async({canvasElement:e})=>{const t=p(e).getByRole("combobox",{name:"Permission mode"});await s(t).toBeDisabled(),await s(t).toHaveValue("acceptEdits")}},m={args:{permissionMode:"plan",permissionModes:l,onPermissionModeChange:d(),toolbar:a.jsx("span",{className:"text-xs text-muted-foreground",children:"Claude Sonnet"})},play:async({canvasElement:e})=>{const o=p(e);await s(o.getByRole("combobox",{name:"Permission mode"})).toBeInTheDocument(),await s(o.getByText("Claude Sonnet")).toBeInTheDocument()}};var u,x,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(g=(x=n.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var y,b,v;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    disabledReason: "Loading session…"
  },
  play: async ({
    canvasElement
  }) => {
    const textbox = within(canvasElement).getByPlaceholderText("Loading session…");
    await expect(textbox).toBeDisabled();
  }
}`,...(v=(b=r.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var h,S,w;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=(S=i.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var E,P,M;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(M=(P=c.parameters)==null?void 0:P.docs)==null?void 0:M.source}}};var B,f,T;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(T=(f=m.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};const Q=["Default","DisabledWithReason","WithPermissionModePicker","ReadOnlyPicker","PickerAlongsideHostToolbar"];export{n as Default,r as DisabledWithReason,m as PickerAlongsideHostToolbar,c as ReadOnlyPicker,i as WithPermissionModePicker,Q as __namedExportsOrder,J as default};

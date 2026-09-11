import{j as e}from"./iframe-CFT3PPR7.js";import{C as t}from"./Chat-CBKbjLnq.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-DJithRQk.js";import"./Icon-BtbnjFB3.js";import"./Message-D63copeL.js";import"./Markdown-DFnWOWZ4.js";import"./Callout-BVpd4aqO.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DxvH5hIX.js";import"./CodeDiff-CbE20wkz.js";import"./SegmentedControl-DhvSlB-L.js";import"./HighlightedTokens-C9CWsjZW.js";import"./JsonView-mYXqMmJi.js";import"./ToolCall-DlTtDF3P.js";import"./button-DVB_uS1L.js";import"./index-CPURVhFy.js";import"./loading-CZrrBIDI.js";import"./types-B4ZMggem.js";import"./KeyValueList-C4t1Kd64.js";import"./DataTable-jg-aZ-G_.js";import"./SortableHeader-C15D8izr.js";import"./router-bgDXBgyR.js";import"./Modal-q-Oedu08.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CW1EPL40.js";import"./floating-ui.react-BIMNxrra.js";import"./FilterPill-aZ9lMIbE.js";import"./Combobox-JcCkqfEl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BvZoFhZz.js";import"./MultiSelect-BA9DLaOZ.js";import"./RangeSlider-BAKm_4gN.js";import"./TimeRange-B1lx3b3C.js";import"./select-fgB8vsMD.js";import"./WorkloadPicker-4yZgarkk.js";import"./NamespacePicker-BHwStTgj.js";import"./index-U8fu4Fjz.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BXOQhDRg.js";import"./TagList-DpuLQomw.js";import"./Badge-_cJrrU_8.js";import"./HoverCard-emUxSVBc.js";import"./Properties-C4f_yUo4.js";import"./IconButton-nSFQuYkv.js";import"./DropdownMenu-BWzAonWM.js";import"./DropdownMenuSubmenu-CqV515YL.js";import"./StatusDot-DcVv8O7y.js";import"./MessageActions-DYFORclw.js";import"./Reasoning-o_dnoKWP.js";import"./PromptInput-CaEP3Ucl.js";import"./Attachment-DdRC3OUa.js";import"./Suggestion-nGcTHVWD.js";import"./effort-icons-CVdbDcc6.js";import"./RuntimeBar-Bmxh0gLK.js";import"./runtime-mode-Dhq3og3a.js";import"./InputField-CbwEKg9Y.js";import"./use-hotkey-D-Zkbmvo.js";import"./ContextMeter-Cruogkco.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} suggestions={["List all pods", "Show failing checks", {
      label: "Restart api",
      prompt: "Restart the api service"
    }]} emptyState={<div className="space-y-1">
            <h3 className="font-medium text-sm">Ask about your app</h3>
            <p className="text-muted-foreground text-sm">
              Type a question — the assistant can call your app&apos;s operations.
            </p>
          </div>} />
    </div>
}`,...(y=(b=a.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var g,x,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(v=(x=s.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var S,T,M;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute("aria-label", "Runtime controls");
    await expect(body.getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
  }
}`,...(M=(T=n.parameters)==null?void 0:T.docs)==null?void 0:M.source}}};var R,A,E;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(A=i.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};var B,f,w;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Qe=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Qe as __namedExportsOrder,Je as default};

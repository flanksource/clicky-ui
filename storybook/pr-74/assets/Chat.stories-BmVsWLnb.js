import{j as e}from"./iframe-D7GyV4pJ.js";import{C as t}from"./Chat-9ViQ9-zi.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-B_Vm21o9.js";import"./utils-DW-IJACk.js";import"./Conversation-DusfJd5W.js";import"./Icon-CjYo4K-K.js";import"./Message-BMKRbjk7.js";import"./Markdown-BJTLRXVu.js";import"./Callout-DNQflFbc.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-dzbHc6Ak.js";import"./CodeDiff-D9kzF7_t.js";import"./SegmentedControl-C-FDjv1C.js";import"./HighlightedTokens-BQznFNiM.js";import"./JsonView-C02c1Msy.js";import"./ToolCall-BhlClAxA.js";import"./button-DGCXgUzH.js";import"./index-CPURVhFy.js";import"./loading-l0OT6FT8.js";import"./types-B4ZMggem.js";import"./KeyValueList-DuQbIYU0.js";import"./DataTable-JJOFbpPY.js";import"./SortableHeader-959B4lnm.js";import"./router-BVhxUUUy.js";import"./Modal-DeNB64-i.js";import"./index-vBVdkF1K.js";import"./index-CBRh9JwW.js";import"./modalStack-j79ynlPx.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-M7hkXB8v.js";import"./floating-ui.react-0HlP6Bgn.js";import"./FilterPill-BWoIl1NP.js";import"./Combobox-C64Z6EDs.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Bn9BjCAe.js";import"./MultiSelect-DkyPso9n.js";import"./RangeSlider-D7XowFPM.js";import"./TimeRange-CNngFNbj.js";import"./select-D_lEekK7.js";import"./WorkloadPicker-BMqXJ_A5.js";import"./NamespacePicker-D0FCM0FR.js";import"./index-y8FDIv-9.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CpGwC8MO.js";import"./TagList-D8G382Fk.js";import"./Badge-PT16GLtd.js";import"./HoverCard-D4LSpSfM.js";import"./Properties-DpeNCHMK.js";import"./IconButton-CZUZzE64.js";import"./DropdownMenu-CbjgQkAk.js";import"./DropdownMenuSubmenu-B7tV7pQZ.js";import"./StatusDot-DPQCXgnL.js";import"./MessageActions-BvTpsMJE.js";import"./Reasoning-5mqWR2H9.js";import"./PromptInput-BjHKBant.js";import"./Attachment-Dz-31hC8.js";import"./Suggestion-CsEVEllA.js";import"./effort-icons-hjHJwx8p.js";import"./RuntimeBar-B4N56BQZ.js";import"./runtime-mode-DLgbrK-n.js";import"./InputField-DCcfOLGV.js";import"./use-hotkey-BYM_BnU0.js";import"./ContextMeter-D5MbOT2Y.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

import{j as e}from"./iframe-9fOldjr2.js";import{C as t}from"./Chat-CF7mJceh.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-CCiFJBVC.js";import"./Icon-BkUgp3wm.js";import"./Message-BOkR9FYn.js";import"./Markdown-B-xDMMMn.js";import"./Callout-B5s2bFb0.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DgVzoKze.js";import"./CodeDiff-D64NQ070.js";import"./SegmentedControl-B5VHoHdT.js";import"./HighlightedTokens-BePCfC_h.js";import"./JsonView-DgqDpvMS.js";import"./ToolCall-r_P9Batp.js";import"./button-DHo1DwEi.js";import"./index-CPURVhFy.js";import"./loading-CEI-SvW7.js";import"./types-B4ZMggem.js";import"./KeyValueList-pX2unJh8.js";import"./DataTable-1i3iGrv9.js";import"./SortableHeader-DAqfmNib.js";import"./router-Bj-enKmb.js";import"./Modal-DUXQNAPs.js";import"./index-C34MHfKY.js";import"./index-Bi8EVZEl.js";import"./modalStack-C6PZaG8M.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C3h1BYM5.js";import"./floating-ui.react-CNbHq_-f.js";import"./FilterPill-CHM0Kb7W.js";import"./Combobox-Cdlj5MHl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BzPCAMNs.js";import"./MultiSelect-BUfYPvta.js";import"./RangeSlider-gX8ppj-P.js";import"./TimeRange-M3RpSG5G.js";import"./select-Wy56f_jX.js";import"./WorkloadPicker-BNvFs__t.js";import"./NamespacePicker-BTHp2RPE.js";import"./index-DPG4NjsX.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CfaLxd-H.js";import"./TagList-BXfzI3QT.js";import"./Badge-aYQWjHd1.js";import"./HoverCard-CDbRR8TA.js";import"./Properties-DtC8xiyA.js";import"./IconButton-DGapLpij.js";import"./DropdownMenu-kAL-O-YL.js";import"./DropdownMenuSubmenu-KZosVDwz.js";import"./StatusDot-BGFiPq91.js";import"./MessageActions-DUBrLo4w.js";import"./Reasoning-CcMNILdn.js";import"./MessageFilePart-DnuK3jQ2.js";import"./PromptInput-Drr_PEGx.js";import"./Attachment-DSDlKH4I.js";import"./Suggestion-tMkAKKZw.js";import"./effort-icons-BQk1zGVE.js";import"./RuntimeBar-Ppma73CR.js";import"./runtime-mode-DIFwvkyT.js";import"./InputField-Cwl_hZbw.js";import"./use-hotkey-C1Ml39U9.js";import"./ContextMeter-BOi6o85n.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Xe=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Xe as __namedExportsOrder,Qe as default};

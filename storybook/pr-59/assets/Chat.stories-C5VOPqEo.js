import{j as e}from"./iframe-Bfqmb9is.js";import{C as t}from"./Chat-CXKFbFFI.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-B2LPdJL4.js";import"./utils-DW-IJACk.js";import"./Conversation-DGksISdk.js";import"./Icon-CIXlnKq1.js";import"./Message-BwGDp0Xn.js";import"./Markdown-COCibmSP.js";import"./Callout-0Yi0TgRz.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-C2O3aeL9.js";import"./CodeDiff-NpNuPjHT.js";import"./SegmentedControl-CA_ysDTk.js";import"./HighlightedTokens-BZpO2Voi.js";import"./JsonView-D11UJCK0.js";import"./ToolCall-BZJtB12O.js";import"./button-DnQ0YN3u.js";import"./index-CPURVhFy.js";import"./loading-fzmQI4xp.js";import"./types-B1SOX9si.js";import"./KeyValueList-EhCWfxzD.js";import"./DataTable-z5HAeWdy.js";import"./SortableHeader-D6uyLbqw.js";import"./Modal-Ij3jRwS_.js";import"./index-C-v_fhIh.js";import"./index-CJnhqCAt.js";import"./modalStack-C5GZLWHZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BM3ZdkSP.js";import"./floating-ui.react-DVsWwasi.js";import"./FilterPill-CqkGiVIF.js";import"./Combobox-RKis7mk3.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DpM556qb.js";import"./MultiSelect-Bkir6wmV.js";import"./RangeSlider-BT91M6o2.js";import"./TimeRange-MscDrASO.js";import"./select-2vUPU0qA.js";import"./WorkloadPicker-tli5gWqm.js";import"./NamespacePicker-B_vEGaSn.js";import"./index-g2mC4pdU.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DTj6PXDh.js";import"./TagList-BuiWsNdS.js";import"./Badge-ZzdJCCmU.js";import"./HoverCard-JZtZSXyK.js";import"./Properties-Dc8gkttr.js";import"./IconButton-BI2w7Aye.js";import"./DropdownMenu-DURoOFZK.js";import"./DropdownMenuSubmenu-BI4NbaSx.js";import"./StatusDot-BQQRUu5K.js";import"./MessageActions-D88mAwW4.js";import"./Reasoning-zdrlQJZu.js";import"./PromptInput-XSSO_-kq.js";import"./Attachment-DSApa31T.js";import"./Suggestion-BhSkCMSt.js";import"./effort-icons-Bh1GaBcd.js";import"./RuntimeBar-yMXjijZf.js";import"./runtime-mode-RFDXmK-C.js";import"./InputField-DySpbN4u.js";import"./use-hotkey-fidT0h22.js";import"./ContextMeter-LUnK8Whd.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,g;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=(b=a.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,y,v;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(v=(y=s.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var S,T,A;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute("aria-label", "Runtime controls");
    await expect(body.getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
  }
}`,...(A=(T=n.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var M,R,E;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(R=i.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};var B,f,w;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Je=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Je as __namedExportsOrder,ze as default};

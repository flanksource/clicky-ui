import{j as e}from"./iframe-Cco5TqZn.js";import{C as t}from"./Chat-DrZIoQNF.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CW1BdeJu.js";import"./utils-DW-IJACk.js";import"./Conversation-BN8Zv7kc.js";import"./Icon-C6Dn9DLx.js";import"./Message-CTxI4sMD.js";import"./Markdown-DxgOkfSH.js";import"./Callout-BJXiqTYd.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BYcrzBK4.js";import"./CodeDiff-BKgy3UT_.js";import"./SegmentedControl-qK3H5opf.js";import"./HighlightedTokens-DbGRJ7uL.js";import"./JsonView-BazgrdGA.js";import"./ToolCall-CnGRPUpf.js";import"./button-DNj3-z2W.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./types-B4ZMggem.js";import"./KeyValueList-CBrZ1334.js";import"./DataTable-BUdHoCkv.js";import"./SortableHeader-DtCNn_uR.js";import"./router-DHJSI_n5.js";import"./Modal-BfOLI4vX.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DVdHLQod.js";import"./floating-ui.react-Dpy7yByO.js";import"./FilterPill-BVle6yuL.js";import"./Combobox-DPrIRjAr.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./MultiSelect-CeyhHNCi.js";import"./RangeSlider-Da0vSqmc.js";import"./TimeRange-DlEhKiKb.js";import"./select-DyfR_FV4.js";import"./WorkloadPicker-Y9hi9dEd.js";import"./NamespacePicker-BzzNcGfX.js";import"./index-CBZ8Tip2.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-FGKuMYnS.js";import"./TagList-DUTVq46U.js";import"./Badge-BsNPFd1h.js";import"./HoverCard-D8KXkP_9.js";import"./Properties-Did90PaB.js";import"./IconButton-BQqpNww-.js";import"./DropdownMenu-w_RgGUTs.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./StatusDot-BZGJhrC1.js";import"./MessageActions-Bbf2qD0q.js";import"./Reasoning-DTsWWKdj.js";import"./PromptInput-Bxr8c3EO.js";import"./Attachment-CTVl0jJV.js";import"./Suggestion-SFOqWDCn.js";import"./effort-icons-CX-Prjd9.js";import"./RuntimeBar-CrsxnSzC.js";import"./runtime-mode-CA0YMU_d.js";import"./InputField-CsJL85KY.js";import"./use-hotkey-DVDdDWa6.js";import"./ContextMeter-D3vsF9KI.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

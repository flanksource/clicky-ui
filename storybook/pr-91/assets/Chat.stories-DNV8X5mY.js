import{j as e}from"./iframe-DxH86FBA.js";import{C as t}from"./Chat-9nhPubBP.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CwXsRPHT.js";import"./utils-DW-IJACk.js";import"./Conversation-C7l4xpjs.js";import"./Icon-w2YOVKhv.js";import"./Message-BhvH_O8B.js";import"./Markdown-DN46MpBL.js";import"./Callout-BCbp8nOy.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DPXYBExk.js";import"./CodeDiff-D61IJrGu.js";import"./SegmentedControl-DLtJY0HA.js";import"./HighlightedTokens-DNniJjSO.js";import"./JsonView-GcXUgX4X.js";import"./ToolCall-Cp6SC-BW.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./types-B4ZMggem.js";import"./KeyValueList-DpTMUIyq.js";import"./DataTable-Dea7G-99.js";import"./SortableHeader-DjHmFvj-.js";import"./router-BWt9CQWg.js";import"./Modal-i45K_l92.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DvhEU1sY.js";import"./floating-ui.react-DSfQFonv.js";import"./FilterPill-Df2C1Mtk.js";import"./Combobox-THEiNRgN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bohm6PVx.js";import"./MultiSelect-D5Q4hKOt.js";import"./RangeSlider-L3xi1L8_.js";import"./TimeRange-DL8fsPh4.js";import"./select-D5Eidm6d.js";import"./WorkloadPicker-BYkdP8oF.js";import"./NamespacePicker-IG95wyrx.js";import"./index-DWlcCXij.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BEF7w3Cd.js";import"./TagList-DGZniD0r.js";import"./Badge-ul0vb2Pp.js";import"./HoverCard-BGftSBK_.js";import"./Properties-DN4TjyBB.js";import"./IconButton-C9GSHWpU.js";import"./DropdownMenu-D1hlo_Nj.js";import"./DropdownMenuSubmenu-t2kTmtnY.js";import"./StatusDot-Bk9YGGtj.js";import"./MessageActions-0eDGmz0J.js";import"./Reasoning-CjHYC34t.js";import"./MessageFilePart-spgDEJCg.js";import"./PromptInput-CLgNZMUe.js";import"./Attachment-DRKy_V2e.js";import"./Suggestion-BSiowCxj.js";import"./effort-icons-DZMlFi7f.js";import"./RuntimeBar-nSVJD14U.js";import"./runtime-mode-DQxxJ4sp.js";import"./InputField-GC6L0KAW.js";import"./use-hotkey-_x9Fkqnd.js";import"./ContextMeter-BoR8_iZ0.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

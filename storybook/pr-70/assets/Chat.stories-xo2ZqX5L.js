import{j as e}from"./iframe-CiHj_drq.js";import{C as t}from"./Chat-CeiHGd9Y.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-C9Uksf5K.js";import"./utils-DW-IJACk.js";import"./Conversation-jnvMiAYK.js";import"./Icon-B8CHvJLE.js";import"./Message-CwP00DD0.js";import"./Markdown-DINg6q9P.js";import"./Callout-DtIJoTnw.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-DGXNpTk9.js";import"./CodeDiff-D0i-M3bf.js";import"./SegmentedControl-46VZUa35.js";import"./HighlightedTokens-BKwT3Lug.js";import"./JsonView-BHVT7TW6.js";import"./ToolCall-BaksqmLC.js";import"./button-CF8Oad92.js";import"./index-CPURVhFy.js";import"./loading-CvQxXIfs.js";import"./types-B4ZMggem.js";import"./KeyValueList-DKTvZpS4.js";import"./DataTable-DDfDt-sz.js";import"./SortableHeader-loDSAR1A.js";import"./Modal-CiRTtmCj.js";import"./index-D-c_5Z52.js";import"./index-BTP8oBdU.js";import"./modalStack-BxawZIg3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DGHJFTaL.js";import"./floating-ui.react-CdsFUqBP.js";import"./FilterPill-Cd01icRX.js";import"./Combobox-BeG22V1s.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BLABB2Ii.js";import"./MultiSelect-bpx4mBh0.js";import"./RangeSlider-Cyidobpc.js";import"./TimeRange-KTlWidEX.js";import"./select-BS0Fe7RG.js";import"./WorkloadPicker-CyS_JrPw.js";import"./NamespacePicker-XKgMl5_i.js";import"./index-JYe4JoQ1.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Bquiqu9t.js";import"./TagList-DQ0BBwqx.js";import"./Badge-ap7M4ZBa.js";import"./HoverCard-BD4fAzxG.js";import"./Properties-CWtEUSYZ.js";import"./IconButton-CduQ6f0Q.js";import"./DropdownMenu-DKU5huRk.js";import"./DropdownMenuSubmenu-BhgkJeya.js";import"./StatusDot-DCaLEXDq.js";import"./MessageActions-CbxuT8si.js";import"./Reasoning-uLUtk4EP.js";import"./PromptInput-C0Pfmsem.js";import"./Attachment-BPwDhhCV.js";import"./Suggestion-D190Z7vx.js";import"./effort-icons-BVCJvYV7.js";import"./RuntimeBar-DekRUMbi.js";import"./runtime-mode-CG7tshgc.js";import"./InputField-BtK-uyCB.js";import"./use-hotkey-BxIDO_1W.js";import"./ContextMeter-DvcjLT4u.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(v=(x=s.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var S,T,A;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
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

import{j as e}from"./iframe-1nhP4pBA.js";import{C as t}from"./Chat-BE9lrLJO.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-C9Uksf5K.js";import"./utils-DW-IJACk.js";import"./Conversation-B5Kjfntx.js";import"./Icon-B2d9yic_.js";import"./Message-Bpv3-lND.js";import"./Markdown-s9Q1jiS9.js";import"./Callout-BTW8I4e2.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-svEp_1B4.js";import"./CodeDiff-BWpF67Jd.js";import"./SegmentedControl-BX0icOeA.js";import"./HighlightedTokens-BrlLwXpa.js";import"./JsonView-CAfD8K_m.js";import"./ToolCall-Dug4eDES.js";import"./button--4D2VPD7.js";import"./index-CPURVhFy.js";import"./loading-Ch-5BGAb.js";import"./types-B4ZMggem.js";import"./KeyValueList-C9PdNUPY.js";import"./DataTable-Byaaf8H5.js";import"./SortableHeader-DOyv7UJG.js";import"./Modal-BEBsG6op.js";import"./index-BSiZIXYH.js";import"./index-XDodYxLy.js";import"./modalStack-DxHx75M7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C_3aF3TU.js";import"./floating-ui.react-BFwwEc5i.js";import"./FilterPill-CXYMNTt5.js";import"./Combobox-BCbQu6RQ.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D-pa_he-.js";import"./MultiSelect-B50Px8dh.js";import"./RangeSlider-4m86cNh6.js";import"./TimeRange-D-87v7d_.js";import"./select-B2pQvorm.js";import"./WorkloadPicker-bAN7wney.js";import"./NamespacePicker-Brgo_DSM.js";import"./index-BVDmj5Ga.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DGhpHWxh.js";import"./TagList-BRJUUHzy.js";import"./Badge-B1noozuz.js";import"./HoverCard-BTWh615-.js";import"./Properties-BMf0F3x3.js";import"./IconButton-ChHOhmH9.js";import"./DropdownMenu-CAJOgHVv.js";import"./DropdownMenuSubmenu-BMDGCenv.js";import"./StatusDot-2IRk4KZC.js";import"./MessageActions-DVXUG209.js";import"./Reasoning-Bs1ftBGI.js";import"./PromptInput-BWmfC50i.js";import"./Attachment-Ds22ZHHF.js";import"./Suggestion-sxwNaN3t.js";import"./effort-icons-B5OBgJI8.js";import"./RuntimeBar-D0peHAuj.js";import"./runtime-mode-CpsySldj.js";import"./InputField-CIPv0D56.js";import"./use-hotkey-KfWNDG9O.js";import"./ContextMeter-ttbmwlM7.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

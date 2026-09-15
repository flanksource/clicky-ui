import{j as e}from"./iframe-DeBYCw4x.js";import{C as t}from"./Chat-DrIQQv-6.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-BcUQ4qJ4.js";import"./Icon-CGwyQOB1.js";import"./Message-7ksZm9Wd.js";import"./Markdown-BiknAm-q.js";import"./Callout-DoO2BLrl.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-dTiR47dd.js";import"./CodeDiff-BRl1lE7u.js";import"./SegmentedControl-x-wxcPhD.js";import"./HighlightedTokens-Cwnl1Dqa.js";import"./JsonView--QZM-KTF.js";import"./ToolCall-DXL6x1CU.js";import"./button-DB9m7UYN.js";import"./index-CPURVhFy.js";import"./loading-ho48Z2wq.js";import"./types-B4ZMggem.js";import"./KeyValueList-B6W9Zxp0.js";import"./DataTable-IYtBl-7_.js";import"./SortableHeader-BZfABJLP.js";import"./router-BS0K7T7L.js";import"./Modal-DKr8ZZ_E.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-mv1uq_Za.js";import"./floating-ui.react-CJIncd7i.js";import"./FilterPill-DFY6Z2w0.js";import"./Combobox-Blg1URfg.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-TXnXjNJ7.js";import"./MultiSelect-BAke_gC4.js";import"./RangeSlider-CY-mpLNd.js";import"./TimeRange-1nQfxhxt.js";import"./select-C_dZVFqX.js";import"./WorkloadPicker-BOLGZqyS.js";import"./NamespacePicker-10mVS6un.js";import"./index-CmecybCa.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-a37Nl5NZ.js";import"./TagList-Rpz24aG6.js";import"./Badge-vEaYC1aM.js";import"./HoverCard-DMwhGn2K.js";import"./Properties-Cm7NvER_.js";import"./IconButton-Jb6_soVo.js";import"./DropdownMenu-CuKG9hF1.js";import"./DropdownMenuSubmenu-BoEIYSWu.js";import"./StatusDot-BMvWjruJ.js";import"./MessageActions-ClfLKW4n.js";import"./Reasoning-l19dDTi0.js";import"./MessageFilePart-RJMXDFbE.js";import"./PromptInput-BlTvwc4w.js";import"./Attachment-DEDAg6BR.js";import"./Suggestion-D_pb-NTL.js";import"./effort-icons-DCHQJMzA.js";import"./RuntimeBar-C6tzmjR0.js";import"./runtime-mode-BlwYrZZ7.js";import"./InputField-DoB9v3Zf.js";import"./use-hotkey-cYEGbwF4.js";import"./ContextMeter-CJIS4aCF.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

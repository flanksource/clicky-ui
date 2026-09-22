import{j as e}from"./iframe-Cvtq5r5o.js";import{C as t}from"./Chat-C62ZWa_g.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-B_5WAd1z.js";import"./Icon-AK-L3art.js";import"./Message-Cx_HQEHp.js";import"./Markdown-BMJ3OLZx.js";import"./Callout-DX0CZmH_.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DO3W0pdQ.js";import"./CodeDiff-_RtAmjv0.js";import"./SegmentedControl-f6EmF-nP.js";import"./HighlightedTokens-Ct2ZVa0K.js";import"./JsonView-DJPIgKT4.js";import"./ToolCall-D2Yjgc9t.js";import"./button-D_f9KbYW.js";import"./index-CPURVhFy.js";import"./loading-DKOjjMZb.js";import"./types-B4ZMggem.js";import"./KeyValueList-BIcH8d0m.js";import"./DataTable-6umEL7s5.js";import"./SortableHeader-BOhP5e0I.js";import"./router-CnKgVooF.js";import"./Modal-B2iT9EIZ.js";import"./index-ClajA7XS.js";import"./index-kUH0lmcJ.js";import"./modalStack-Br6WXpFW.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CYMayfG9.js";import"./floating-ui.react-Cvq7eJTv.js";import"./FilterPill-CiLj5-dG.js";import"./Combobox-DmcYmCM1.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-OpVNRO9P.js";import"./MultiSelect-DcdrjFJ7.js";import"./RangeSlider-CjNa1mqr.js";import"./TimeRange-2UMh_tst.js";import"./select-Dj5LQxng.js";import"./WorkloadPicker-B6PIQp81.js";import"./NamespacePicker-BqHwlbCZ.js";import"./index-CEHxgROo.js";import"./data-table-filter-values-B85q5-NK.js";import"./Timestamp-BOykg1TB.js";import"./TagList-Dcwau9uV.js";import"./Badge-BzeiO1Yp.js";import"./HoverCard-DLH-UG-1.js";import"./Properties-BORP7nVE.js";import"./IconButton-ivpc4D5G.js";import"./DropdownMenu-CpW9tjic.js";import"./DropdownMenuSubmenu-BdylLhlN.js";import"./StatusDot-PzezozPO.js";import"./MessageActions-CkofcDLq.js";import"./Reasoning-BR4_VxSI.js";import"./MessageFilePart-CjjAu96i.js";import"./PromptInput-sVf4W_lt.js";import"./Attachment-DfJBL6f_.js";import"./Suggestion-BlZyTIJT.js";import"./effort-icons-Cy5Jdddo.js";import"./RuntimeBar-CftNfpnP.js";import"./runtime-mode-B2XQ9ynX.js";import"./InputField-CDkE2mw4.js";import"./use-hotkey-CQLHr3VW.js";import"./ContextMeter-CLNhkVIg.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

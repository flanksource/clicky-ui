import{j as e}from"./iframe-i4NO8c1E.js";import{C as t}from"./Chat-TIp63I8h.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-BlVIKJwt.js";import"./utils-DW-IJACk.js";import"./Conversation-DOFqZ6NI.js";import"./Icon-0OQ-QiFy.js";import"./Message-Bm7cfYjg.js";import"./Markdown-T9MgalT6.js";import"./Callout-B72S23hh.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BGsGTuKI.js";import"./CodeDiff-B_gaadla.js";import"./SegmentedControl-BZS04MJf.js";import"./HighlightedTokens-CQy1Ma1d.js";import"./JsonView-Dj4e_qpk.js";import"./ToolCall-CbojORiy.js";import"./button-IkBZAOc5.js";import"./index-CPURVhFy.js";import"./loading-DnEu1w-x.js";import"./types-B4ZMggem.js";import"./KeyValueList-BB8OJZcD.js";import"./DataTable-Db_MymIm.js";import"./SortableHeader-Q2D_vpwD.js";import"./router-BMuzg1Ev.js";import"./Modal-Dd2S2-_M.js";import"./index-DWciXVe1.js";import"./index-DEkhUzMm.js";import"./modalStack-BYsD3NGk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D_oX65V9.js";import"./floating-ui.react-CZe8-7HK.js";import"./FilterPill-C80r3osm.js";import"./Combobox-B2mxizyE.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DdyCgkg3.js";import"./MultiSelect-BYUdv49T.js";import"./RangeSlider-Br7-UQ1q.js";import"./TimeRange-qiPHz8BS.js";import"./select-BckbOhrF.js";import"./WorkloadPicker-C71l4ptm.js";import"./NamespacePicker-CLlX85sq.js";import"./index-FGRaKX4A.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BCNJiiiv.js";import"./TagList-pvI1Pj0j.js";import"./Badge-B6MJiOJm.js";import"./HoverCard-RVi8pXL2.js";import"./Properties-CJdGVwGL.js";import"./IconButton-yDMtv4_j.js";import"./DropdownMenu-D0XmeiBD.js";import"./DropdownMenuSubmenu-DDvaJL7u.js";import"./StatusDot-DbYUeTyl.js";import"./MessageActions-C7VLDL5v.js";import"./Reasoning-D_xO4gcf.js";import"./MessageFilePart-CuZ2mNx7.js";import"./PromptInput-QIYE4XrG.js";import"./Attachment-CROUoV7X.js";import"./Suggestion-BeniM8nC.js";import"./effort-icons-C_y3P-97.js";import"./RuntimeBar-DPf8jgCw.js";import"./runtime-mode-BgFO5qis.js";import"./InputField-CT3NCAh6.js";import"./use-hotkey-B9ms88pk.js";import"./ContextMeter-Dud3gR6A.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

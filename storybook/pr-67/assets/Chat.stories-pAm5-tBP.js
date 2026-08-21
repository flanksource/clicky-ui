import{j as e}from"./iframe-scM6jv7l.js";import{C as t}from"./Chat-T3XgJkMg.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-BZ6gUoWu.js";import"./utils-DW-IJACk.js";import"./Conversation-CklaOtAR.js";import"./Icon-D1Qa4F67.js";import"./Message-D_aW8WzS.js";import"./Markdown-BgAWAzqT.js";import"./Callout-DJcf9YlB.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-BuI3trH-.js";import"./CodeDiff-1j-oPl0B.js";import"./SegmentedControl-DsWujpoS.js";import"./HighlightedTokens-DXe1pHlS.js";import"./JsonView-B5S_U7gP.js";import"./ToolCall-BdiqfeFP.js";import"./button-DaoW-x1g.js";import"./index-CPURVhFy.js";import"./loading-CoSFZPt_.js";import"./types-B1SOX9si.js";import"./KeyValueList-B8cy4HkS.js";import"./DataTable-CDa7TLw-.js";import"./SortableHeader-aQ4v7HNn.js";import"./Modal-BsIAmpjA.js";import"./index-Dg88cS0S.js";import"./index-BHYuFw_a.js";import"./modalStack-Brf0cgOc.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DBFAcwAO.js";import"./floating-ui.react-CtGrG4Ss.js";import"./FilterPill-CvQmW-YX.js";import"./Combobox-CoXsdk2a.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CN7LoCYr.js";import"./MultiSelect-3Fct0_Kv.js";import"./RangeSlider-k7UQ7Nfq.js";import"./TimeRange-Z1HTj6vd.js";import"./select-sc2EPqZV.js";import"./WorkloadPicker-DqZ87tEj.js";import"./NamespacePicker-PAQ0Nv3-.js";import"./index-CUnqFJI_.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BW6UrTA9.js";import"./TagList-CyQjKAHQ.js";import"./Badge-CxWP8_R4.js";import"./HoverCard-v5Ub5wgF.js";import"./Properties-BTdq2sKW.js";import"./IconButton-B3_VSIbb.js";import"./DropdownMenu-DHMrPqIU.js";import"./DropdownMenuSubmenu-BADt-LvZ.js";import"./StatusDot-wHVO6RD_.js";import"./MessageActions-Rck9H7wV.js";import"./Reasoning-W95A1B36.js";import"./PromptInput-DZx4p8QV.js";import"./Attachment-CAvoaAqe.js";import"./Suggestion-C_X7bEXN.js";import"./effort-icons-DTeCuzGf.js";import"./RuntimeBar-pFsPsCSc.js";import"./runtime-mode-9tALKHsj.js";import"./InputField-D3VYFQ2L.js";import"./use-hotkey-BjU9ibCX.js";import"./ContextMeter-DeythLYf.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,g;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

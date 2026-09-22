import{j as e}from"./iframe-Ds09J1dT.js";import{C as t}from"./Chat-CsoHCsZ3.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-DYqHtRs6.js";import"./Icon-CjZb5Sv7.js";import"./Message-CrscCmPJ.js";import"./Markdown-DbUry-Ba.js";import"./Callout-CiLJI5RG.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-V_xRb2SR.js";import"./CodeDiff-D-JoSWgL.js";import"./SegmentedControl-DeGdd1Jg.js";import"./HighlightedTokens-qyGyaI1E.js";import"./JsonView-CU07Cie5.js";import"./ToolCall-CaAKxyqm.js";import"./button-BqYgRAWV.js";import"./index-CPURVhFy.js";import"./loading-qMao84VB.js";import"./types-B4ZMggem.js";import"./KeyValueList-CpD8jtrM.js";import"./DataTable-BoKkTd-e.js";import"./SortableHeader-gS-w5Rr5.js";import"./router-CZJ4EQKa.js";import"./Modal-CAEMgpU8.js";import"./index-FPTpXdcx.js";import"./index-CF4fvYH8.js";import"./modalStack-CthqJ_T7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BcZetDVh.js";import"./floating-ui.react-CgcPjn0G.js";import"./FilterPill-DgRXGxvV.js";import"./Combobox-Duu-Ek4U.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B390JZZP.js";import"./MultiSelect-Dx1CrEXI.js";import"./RangeSlider-C0wNxNRM.js";import"./TimeRange-CRrUHGK5.js";import"./select-jpD87SnG.js";import"./WorkloadPicker-cf1urnzI.js";import"./NamespacePicker-EeYAegtK.js";import"./index-Ds33FuJz.js";import"./data-table-filter-values-B85q5-NK.js";import"./Timestamp-BLjVGSz9.js";import"./TagList-C3w8be63.js";import"./Badge-fcSLrmh7.js";import"./HoverCard-trfKQKGq.js";import"./Properties-D-Z2zNfa.js";import"./IconButton-D6jNoLlm.js";import"./DropdownMenu-BzWciQ6u.js";import"./DropdownMenuSubmenu-3ngMhyLq.js";import"./StatusDot-Bu0eKata.js";import"./MessageActions-DuaV8Yqn.js";import"./Reasoning-C-MnsA60.js";import"./MessageFilePart-D5VMFszc.js";import"./PromptInput-B2ixstoj.js";import"./Attachment-S93A4kHF.js";import"./Suggestion-DEyJtoxE.js";import"./effort-icons-fZmM3zsk.js";import"./RuntimeBar-Erswdsyg.js";import"./runtime-mode-B_b5fqbr.js";import"./InputField-Bn56kgk_.js";import"./use-hotkey-DKa9IzvG.js";import"./ContextMeter-y8grL4vU.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

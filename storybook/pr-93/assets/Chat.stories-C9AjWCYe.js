import{j as e}from"./iframe-CNJi-CEN.js";import{C as t}from"./Chat-CJEpHsqX.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-DmsBQNJi.js";import"./utils-DW-IJACk.js";import"./Conversation-S48moqR6.js";import"./Icon-Bv4kfyO8.js";import"./Message-2IAgLNzq.js";import"./Markdown-BDkxSZ8_.js";import"./Callout-Cd9B6DBh.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CkUrwbis.js";import"./CodeDiff-xdcZSl7O.js";import"./SegmentedControl-DGLHJbk9.js";import"./HighlightedTokens-ChkAIihG.js";import"./JsonView-DhDkWXlE.js";import"./ToolCall-CZDUs38n.js";import"./button-DO1UR7aw.js";import"./index-CPURVhFy.js";import"./loading-CMRhZ8P1.js";import"./types-B4ZMggem.js";import"./KeyValueList-C22CGMcd.js";import"./DataTable-Dl1abIKG.js";import"./SortableHeader-CWi1YU8b.js";import"./router-CdwHWAAE.js";import"./Modal-D0weZIS9.js";import"./index-C5jqvT-L.js";import"./index-BXovTO2l.js";import"./modalStack-CMRaiiqk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cz5ZKs0h.js";import"./floating-ui.react-Bzi9C0oq.js";import"./FilterPill-CAbk9lWN.js";import"./Combobox-QDnxkUXx.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BesfIaOc.js";import"./MultiSelect-CRmFg68w.js";import"./RangeSlider-O3RumkcL.js";import"./TimeRange-Dx90ONOZ.js";import"./select-C6D2hC6T.js";import"./WorkloadPicker-4hu0dNEp.js";import"./NamespacePicker-CCjeQklL.js";import"./index-fGcEWGBL.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DE1ig2c6.js";import"./TagList-CUtdBx_p.js";import"./Badge-DVOjqw7_.js";import"./HoverCard-CIION0R9.js";import"./Properties-DAsa40E7.js";import"./IconButton-DVSTCvmg.js";import"./DropdownMenu-DHFuy7UT.js";import"./DropdownMenuSubmenu-Q6cAR_ds.js";import"./StatusDot-DBX2OLtJ.js";import"./MessageActions-B9Ijo4-S.js";import"./Reasoning-D_EKrab5.js";import"./MessageFilePart-Cwo7mz1q.js";import"./PromptInput-BLa1LZn3.js";import"./Attachment-CXUjFLzq.js";import"./Suggestion-CwTlZ5LV.js";import"./effort-icons-B2gzqWAP.js";import"./RuntimeBar-KJ427cME.js";import"./runtime-mode-6i_aNbRM.js";import"./InputField-rMRnAIqm.js";import"./use-hotkey-DrRtkMD5.js";import"./ContextMeter-Yewk6aG1.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

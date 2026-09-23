import{j as e}from"./iframe-Cxdv9pi7.js";import{C as t}from"./Chat-C3304VvB.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-DU1Q6aPJ.js";import"./utils-DW-IJACk.js";import"./Conversation-udGpyiXO.js";import"./Icon-TQmWXc2S.js";import"./Message-0JSl7dcq.js";import"./Markdown-CNfEuncx.js";import"./Callout-BNlgjsvn.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-COdx_xEw.js";import"./CodeDiff-B_kUey21.js";import"./SegmentedControl-hhBGtqdI.js";import"./HighlightedTokens-DBaNk6YB.js";import"./JsonView-Ds_lvjLt.js";import"./ToolCall-Dr266Dj3.js";import"./button-CDUpBuy9.js";import"./index-CPURVhFy.js";import"./loading-BfmDh766.js";import"./types-B4ZMggem.js";import"./KeyValueList-CKRGIp2I.js";import"./DataTable-D8-94cTt.js";import"./SortableHeader-B4oPcjSS.js";import"./router-DdBNp8gn.js";import"./Modal-Kx8XoI2v.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cvmpirj_.js";import"./floating-ui.react-mjp4aH0C.js";import"./FilterPill-4MdiEeIE.js";import"./Combobox-B0h9NCBj.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BPSia-hN.js";import"./MultiSelect-CFMQ6ZtD.js";import"./RangeSlider-CVjotkm5.js";import"./TimeRange-CWALHETR.js";import"./select-DKBCBXRK.js";import"./WorkloadPicker-DC8WWEPi.js";import"./NamespacePicker-C_VymA-J.js";import"./index-BqC3x6pn.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-eT6bGImm.js";import"./TagList-CZry1hBB.js";import"./Badge-DvE9OLG-.js";import"./HoverCard-89Zdu8CL.js";import"./Properties-DLVUf3n9.js";import"./IconButton-eNA5Ynby.js";import"./DropdownMenu-Cqi-ljGX.js";import"./DropdownMenuSubmenu-P1llKkBa.js";import"./StatusDot-Dg9mat1A.js";import"./MessageActions-DOpIP8x0.js";import"./Reasoning-xhkKlNhV.js";import"./MessageFilePart-Bss87vkO.js";import"./PromptInput-BFI66yaD.js";import"./Attachment-CK7v-KkM.js";import"./Suggestion-r2MzD7kE.js";import"./effort-icons-BzPwm5YY.js";import"./RuntimeBar-jZXyUQiE.js";import"./runtime-mode-D62tngBZ.js";import"./InputField-B_j7RwED.js";import"./use-hotkey-CSUXaqCI.js";import"./ContextMeter-CMp28dEf.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

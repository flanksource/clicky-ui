import{j as e}from"./iframe-CLXtWVmt.js";import{C as t}from"./Chat-xtMJalmn.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-DmsBQNJi.js";import"./utils-DW-IJACk.js";import"./Conversation-CS_Jj2_4.js";import"./Icon-CpZ1luCu.js";import"./Message-CmM_6tvJ.js";import"./Markdown-D95aR_fc.js";import"./Callout-Bl1ILe5K.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DOQ2p1GO.js";import"./CodeDiff-DDSLPz_c.js";import"./SegmentedControl-Dg191Kku.js";import"./HighlightedTokens-l_kw19vr.js";import"./JsonView-D5gKhrYL.js";import"./ToolCall-CTmlqp9i.js";import"./button-C8mx3enX.js";import"./index-CPURVhFy.js";import"./loading-B0OjGzLE.js";import"./types-B4ZMggem.js";import"./KeyValueList-BP4iRw1C.js";import"./DataTable-BOj40Wo3.js";import"./SortableHeader-BfeSh8iX.js";import"./router-cLtf9KDa.js";import"./Modal-BJ4XmsSf.js";import"./index-cL1Er3Pi.js";import"./index-99h8sS2h.js";import"./modalStack-gt8ROY-G.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C2Q-Devo.js";import"./floating-ui.react-BEe3PkFT.js";import"./FilterPill-CM5YOpR7.js";import"./Combobox-BjmBMG3b.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-D0HzU81W.js";import"./MultiSelect-DPAp-DQX.js";import"./RangeSlider-CGfMpttY.js";import"./TimeRange-DVrCohNJ.js";import"./select-DRgcxFlV.js";import"./WorkloadPicker-BTu9Qda9.js";import"./NamespacePicker-Cmgc-Ss4.js";import"./index-D_IVmfEW.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Z2d1lWrF.js";import"./TagList-D195dBA2.js";import"./Badge-BeC-BgyT.js";import"./HoverCard-DRjWtDYf.js";import"./Properties-BFYUqXPk.js";import"./IconButton-Diyo__bS.js";import"./DropdownMenu-BfTU1-5e.js";import"./DropdownMenuSubmenu-DJ3OnS11.js";import"./StatusDot-CjkeL4mB.js";import"./MessageActions-Ci3hmnk4.js";import"./Reasoning-B1EP9-j7.js";import"./MessageFilePart-BAvDlugG.js";import"./PromptInput-DBFlEL85.js";import"./Attachment-DP5P-iOB.js";import"./Suggestion-Bnybsw-V.js";import"./effort-icons-BtjNu03f.js";import"./RuntimeBar-B0nniTwE.js";import"./runtime-mode-COfkooO-.js";import"./InputField-VmQoEzD9.js";import"./use-hotkey-0-_8lVll.js";import"./ContextMeter-CqeYttOW.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

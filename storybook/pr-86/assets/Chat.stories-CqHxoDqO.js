import{j as e}from"./iframe-3q0eS6ZH.js";import{C as t}from"./Chat-D3jADJab.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./Conversation-BGJfOjyU.js";import"./Icon-CT7GZEqx.js";import"./Message-B8Dkb1o7.js";import"./Markdown-DfnrvfFQ.js";import"./Callout-KkLU15FA.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BoBZ9fk7.js";import"./CodeDiff-Ck1vMpg0.js";import"./SegmentedControl-DNqVRP3z.js";import"./HighlightedTokens-CV0T2ZUG.js";import"./JsonView-BR2t-zou.js";import"./ToolCall-CmDv2aK1.js";import"./button-DHxo9U3A.js";import"./index-CPURVhFy.js";import"./loading-gEVgRnUM.js";import"./types-B4ZMggem.js";import"./KeyValueList-B_tQol9p.js";import"./DataTable-ZMYAnqkx.js";import"./SortableHeader-19v44Dxc.js";import"./router-CPwMIJY7.js";import"./Modal-COLLltVY.js";import"./index-Egog0RqP.js";import"./index-CiPsLEp7.js";import"./modalStack-CW-tpCu1.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-r2C4EPnh.js";import"./floating-ui.react-CG8cv30D.js";import"./FilterPill-Buz30ZM7.js";import"./Combobox-Drlj6fxl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CBjgGBDE.js";import"./MultiSelect-BFnXCmPi.js";import"./RangeSlider-jgvL7cG5.js";import"./TimeRange-BlYgpnwQ.js";import"./select-FPmIGvxj.js";import"./WorkloadPicker-j1YhB5_z.js";import"./NamespacePicker-DNi2hhrW.js";import"./index-21HwTrJv.js";import"./data-table-filter-values-CSqhQ9CN.js";import"./Timestamp-CpCqRpzB.js";import"./TagList-DK0qDIo1.js";import"./Badge-85OJYi09.js";import"./HoverCard-D1K6Mo-k.js";import"./Properties-m66d-gjd.js";import"./IconButton-BToFVWxm.js";import"./DropdownMenu-BNbBQXTz.js";import"./DropdownMenuSubmenu-CixrY1Rf.js";import"./StatusDot-CpXdSCdY.js";import"./MessageActions-CvuXIlD4.js";import"./Reasoning-__Ru5mgk.js";import"./MessageFilePart-ClfGGoLI.js";import"./PromptInput-Cu9uFm-a.js";import"./Attachment-B_r5VzGA.js";import"./Suggestion-DqjV97q3.js";import"./effort-icons-Dry7lUJC.js";import"./RuntimeBar-BlIeIQ1s.js";import"./runtime-mode-U0E4WdSq.js";import"./InputField-Bw8DGtVJ.js";import"./use-hotkey-Dr5ZYpX6.js";import"./ContextMeter-BEKCm15w.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Je={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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

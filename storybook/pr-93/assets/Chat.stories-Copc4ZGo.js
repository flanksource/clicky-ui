import{j as e}from"./iframe-DuizKdUp.js";import{C as t}from"./Chat-36JrYGob.js";import{m as u,S as p,a as N,b as j,M as I}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-DmsBQNJi.js";import"./utils-DW-IJACk.js";import"./Conversation-DM82OC0H.js";import"./Icon-B5qN7-mW.js";import"./Message-BHx6P9QT.js";import"./Markdown-DxgH4Izd.js";import"./Callout-CIg8rdU-.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DqVnhkGz.js";import"./CodeDiff-Cm6WB7Oq.js";import"./SegmentedControl-7RGGGxjd.js";import"./HighlightedTokens-DhTsa_oz.js";import"./JsonView-DH4kfpVK.js";import"./ToolCall-DUfLJ_B9.js";import"./button-EYN6PCXm.js";import"./index-CPURVhFy.js";import"./loading-C8ciqA58.js";import"./types-B4ZMggem.js";import"./KeyValueList-CeugNHfM.js";import"./DataTable-TGDZ1XFb.js";import"./SortableHeader-rlVzJjzX.js";import"./router-DNKcLdyR.js";import"./Modal-DntpEIq8.js";import"./index-CWqaA8lc.js";import"./index-I9h17460.js";import"./modalStack-CICKsGRF.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dq8bM008.js";import"./floating-ui.react-BJgrq0bL.js";import"./FilterPill-zpYFv9g6.js";import"./Combobox-B_sNXcFv.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Dk93s1OM.js";import"./MultiSelect-CNmQbm4f.js";import"./RangeSlider-90JJ9Ykc.js";import"./TimeRange-CW0wp00K.js";import"./select-ZjgKcU-R.js";import"./WorkloadPicker-VWRr1sA4.js";import"./NamespacePicker-BHcTPBss.js";import"./index-D7c_i4BZ.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-CGvQMUfa.js";import"./TagList-BQ5YVmwg.js";import"./Badge-CahpJAg3.js";import"./HoverCard-C3A1tRJ0.js";import"./Properties-BzSgKCLH.js";import"./IconButton-52triCwN.js";import"./DropdownMenu-B204fkhG.js";import"./DropdownMenuSubmenu-BpKij5uD.js";import"./StatusDot-DzvLmox8.js";import"./MessageActions-Db-3OKtH.js";import"./Reasoning-ClvZk6ZN.js";import"./MessageFilePart-BUG3Twfp.js";import"./PromptInput-B74t5OhK.js";import"./Attachment-DmQDBqMS.js";import"./Suggestion-UmSg6m4v.js";import"./effort-icons-A4fXHvly.js";import"./RuntimeBar-BjqXhgwz.js";import"./runtime-mode-_5wpENoX.js";import"./InputField-WT5w7twt.js";import"./use-hotkey-BTef5fds.js";import"./ContextMeter-D3ySP_Dk.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:l,waitFor:D,within:r}=__STORYBOOK_MODULE_TEST__,Ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})}),play:async({canvasElement:k})=>{const h=r(k),c=r(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await o(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await o(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context 0% used");await l.hover(O);const d=r(document.body);await D(()=>o(d.getByRole("tooltip")).toBeInTheDocument()),await o(r(d.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await l.click(_);const L=await d.findByRole("menu",{name:"Runtime mode"});await o(r(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}")}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:N(),initialMessages:p,placeholder:"Ask anything"})})},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:j(),initialMessages:p,placeholder:"Try: restart the api service"})})};var y,b,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(g=(b=a.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,v,S;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(S=(v=n.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var T,R,E;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = within(canvas.getByRole("group", {
      name: "Runtime"
    }));
    const mode = runtime.getByTitle("Runtime mode — API");
    await expect(runtime.getByRole("combobox", {
      name: "Model"
    })).toHaveTextContent("Claude Sonnet 4.5");
    await expect(runtime.getByTitle("Reasoning effort")).toHaveTextContent("Medium");
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
    await userEvent.click(mode);
    const menu = await body.findByRole("menu", {
      name: "Runtime mode"
    });
    await expect(within(menu).getByRole("menuitem", {
      name: "API"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  }
}`,...(E=(R=s.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};var M,w,B;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(B=(w=i.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var A,f,C;m.parameters={...m.parameters,docs:{...(A=m.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(C=(f=m.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const $e=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,n as Streaming,m as ToolApproval,s as WithRuntimeBar,$e as __namedExportsOrder,Ze as default};

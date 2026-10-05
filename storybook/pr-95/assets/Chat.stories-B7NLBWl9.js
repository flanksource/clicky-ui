import{j as e}from"./iframe-yuMqpJhb.js";import{C as t}from"./Chat-DQhR55Ff.js";import{m as u,S as p,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Conversation-DHOJ_bmx.js";import"./Icon-DbERJsbC.js";import"./Message-gSrWsbwZ.js";import"./Markdown-S81DzjC-.js";import"./Callout-rnh0q618.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BCbuh5Mz.js";import"./CodeDiff-CdsCzbWc.js";import"./SegmentedControl-CItDZC2L.js";import"./HighlightedTokens-Mt22SU9Y.js";import"./JsonView-Cjjo78UN.js";import"./button-FFEDo1GN.js";import"./index-CPURVhFy.js";import"./loading-C6QaURdm.js";import"./ToolCall-A7mcg37g.js";import"./types-DnFuV5L5.js";import"./KeyValueList-DhQbeMwd.js";import"./DataTable-bLf9wGKl.js";import"./SortableHeader-DqaG3Pw4.js";import"./router-Db0OnKk4.js";import"./Modal-CvmmoTwj.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C0zU87ot.js";import"./floating-ui.react-DiVVYB8B.js";import"./FilterPill-D01PQpRY.js";import"./Combobox-BWMTt1c4.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-D6erpvXq.js";import"./MultiSelect-CWHNK50W.js";import"./RangeSlider-iJULwvbw.js";import"./TimeRange-Cahel21p.js";import"./select-C6IyLzeu.js";import"./WorkloadPicker-B77oOyGf.js";import"./NamespacePicker-BCrELL6P.js";import"./index-DZYJBkUd.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DvBl9sa0.js";import"./TagList-xE5NHcug.js";import"./Badge-BxnYNHl7.js";import"./HoverCard-DVGyFeXQ.js";import"./Properties-PiiQtLrA.js";import"./IconButton-CLZ4GHfp.js";import"./DropdownMenu-DvzMpi7l.js";import"./DropdownMenuSubmenu-CLNEOxi7.js";import"./StatusDot-liH0cyV8.js";import"./MessageActions-BwEfNrGR.js";import"./Reasoning-CWZdXzpy.js";import"./MessageFilePart-B_kkA5o4.js";import"./PromptInput-CQEBklYm.js";import"./Attachment-DPohZKIC.js";import"./Suggestion-CA0AfyLU.js";import"./effort-icons-Beht5qYy.js";import"./RuntimeBar-D_3rCpx-.js";import"./runtime-mode-DowHBjpH.js";import"./InputField-CM4m7oZ-.js";import"./use-hotkey-CCZSHshm.js";import"./ContextMeter-DRuRHTMD.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:l,waitFor:D,within:r}=__STORYBOOK_MODULE_TEST__,Ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})}),play:async({canvasElement:k})=>{const h=r(k),c=r(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await o(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await o(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context 0% used");await l.hover(O);const d=r(document.body);await D(()=>o(d.getByRole("tooltip")).toBeInTheDocument()),await o(r(d.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await l.click(_);const L=await d.findByRole("menu",{name:"Runtime mode"});await o(r(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}")}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:N(),initialMessages:p,placeholder:"Ask anything"})})},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:j(),initialMessages:p,placeholder:"Try: restart the api service"})})};var y,b,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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

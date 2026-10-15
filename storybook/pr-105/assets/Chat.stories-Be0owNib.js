import{j as e}from"./iframe-DgmZMBKH.js";import{C as r}from"./Chat-zf02tu5R.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-BBRSUrHX.js";import"./utils-DW-IJACk.js";import"./Conversation-CbK1JdQE.js";import"./Icon-COMQMXZj.js";import"./Message-BNVwvQd_.js";import"./Markdown-wrI770uP.js";import"./Callout-ohERSZFi.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-C3Pf8vEa.js";import"./CodeDiff-BTioSQ_u.js";import"./SegmentedControl-5L49tJPa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-C-qCgi-g.js";import"./JsonView-PTiSkJw0.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./ToolCall-CyghsYl-.js";import"./types-DnFuV5L5.js";import"./KeyValueList-CmmP9cMI.js";import"./DataTable-DLM3RoiO.js";import"./SortableHeader-CvK-UD5r.js";import"./router-ewoeQE3l.js";import"./Modal-CHXTJS63.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CiW2zgXq.js";import"./floating-ui.react-C3ET48Mi.js";import"./FilterPill-BT8q1R31.js";import"./filter-bar-multi-Bq0a6khQ.js";import"./Combobox-BPdyRRYK.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-O9lN17EE.js";import"./MultiSelect-D80CYoeK.js";import"./RangeSlider-Dxbvtwh2.js";import"./TimeRange-D56Kt8WY.js";import"./select-Dxhm9jtK.js";import"./WorkloadPicker-p6PpGnQi.js";import"./NamespacePicker-DrrQVfeY.js";import"./index-BU-kuIbr.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFKKOWaG.js";import"./TagList-BR07zvWf.js";import"./HoverCard-D9JAxC3e.js";import"./Properties-Bdq0MR4F.js";import"./IconButton-DuZ8w2HQ.js";import"./DropdownMenu-gsWLznB7.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./format-2niohfpq.js";import"./StatusDot-zGBvK3uz.js";import"./MessageActions-Ce1OJdZY.js";import"./Reasoning-BRejxyZH.js";import"./MessageFilePart-06lHhRvl.js";import"./PromptInput-Df7fhIva.js";import"./Attachment-C-AG9-sM.js";import"./Suggestion-Df_Dj1_g.js";import"./effort-icons-BIuF64X0.js";import"./RuntimeBar-D0OzFQWw.js";import"./runtime-mode-BtbzGa5Y.js";import"./InputField-BJbuDc6j.js";import"./use-hotkey-CpXOlTbi.js";import"./ContextMeter-DM1KG_7m.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,nt={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(g=(b=n.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,v,T;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(T=(v=s.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};var S,B,R;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
    const meter = canvas.getByLabelText("Context unavailable");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0);
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
}`,...(R=(B=i.parameters)==null?void 0:B.docs)==null?void 0:R.source}}};var w,E,M;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(M=(E=m.parameters)==null?void 0:E.docs)==null?void 0:M.source}}};var A,f,C;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(C=(f=p.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const st=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{n as Empty,m as Reasoning,s as Streaming,p as ToolApproval,i as WithRuntimeBar,st as __namedExportsOrder,nt as default};

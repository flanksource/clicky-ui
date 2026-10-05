import{j as e}from"./iframe-DXCHqMT7.js";import{C as t}from"./Chat-BgOUoJKi.js";import{m as u,S as p,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./Conversation-CLzmZzAC.js";import"./Icon-CzqsX9Zi.js";import"./Message-D3M4TyJB.js";import"./Markdown-c_ISz9C-.js";import"./Callout-IH8aFM9X.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DfLdBRTj.js";import"./CodeDiff-D96T_Lqc.js";import"./SegmentedControl-CPSYGN3s.js";import"./HighlightedTokens-BwAjdB1B.js";import"./JsonView-B6IE9BVn.js";import"./button-tbjJwnTf.js";import"./index-CPURVhFy.js";import"./loading-CFBgJ_my.js";import"./ToolCall-DxkbFMDm.js";import"./types-DnFuV5L5.js";import"./KeyValueList-DN8u_5BM.js";import"./DataTable-C9vdgrje.js";import"./SortableHeader-p1ELe-TS.js";import"./router-BummLNfq.js";import"./Modal-DuOJllmE.js";import"./index-nXD4GtBn.js";import"./index-h3UUAFeB.js";import"./modalStack-ZxYyB433.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C0qdRizE.js";import"./floating-ui.react-BFoHRFAR.js";import"./FilterPill-kd8dcFZz.js";import"./Combobox-DftKas2V.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CaIRSwlz.js";import"./MultiSelect-HKrSw_53.js";import"./RangeSlider-B8q2faFd.js";import"./TimeRange-D0EjkUCW.js";import"./select-CUXTJRVv.js";import"./WorkloadPicker-S3aLZAFo.js";import"./NamespacePicker-DATdNae9.js";import"./index-Br80NOr9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-B9u6m3Jx.js";import"./TagList-DT6fFCMe.js";import"./Badge-CxYDrKcj.js";import"./HoverCard-Lk0Lira2.js";import"./Properties-DVIMzZsy.js";import"./IconButton-DJ_I_ndq.js";import"./DropdownMenu-CajicWca.js";import"./DropdownMenuSubmenu-CG6RB2PG.js";import"./StatusDot-jH57yqnf.js";import"./MessageActions-C0JuLyOM.js";import"./Reasoning-yvgXGtRG.js";import"./MessageFilePart-UO1-MOVt.js";import"./PromptInput-DiFUTIU0.js";import"./Attachment-wgYO71gR.js";import"./Suggestion-Biu-uMuA.js";import"./effort-icons-Cl2ar2w6.js";import"./RuntimeBar-CK88ByR5.js";import"./runtime-mode-aGBCJXlX.js";import"./InputField-jEcdLDZw.js";import"./use-hotkey-BfOMz2Ky.js";import"./ContextMeter-9UGr-7fb.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:l,waitFor:D,within:r}=__STORYBOOK_MODULE_TEST__,Ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})}),play:async({canvasElement:k})=>{const h=r(k),c=r(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await o(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await o(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context 0% used");await l.hover(O);const d=r(document.body);await D(()=>o(d.getByRole("tooltip")).toBeInTheDocument()),await o(r(d.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await l.click(_);const L=await d.findByRole("menu",{name:"Runtime mode"});await o(r(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}")}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:N(),initialMessages:p,placeholder:"Ask anything"})})},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:j(),initialMessages:p,placeholder:"Try: restart the api service"})})};var y,b,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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

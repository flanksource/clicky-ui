import{j as e}from"./iframe-PIqemlGB.js";import{C as r}from"./Chat-Bx7l45-6.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Conversation-CDHU4D93.js";import"./Icon-BnoLxMF1.js";import"./Message-Bd1xlvX3.js";import"./Markdown-Dh60rE2A.js";import"./Callout-Dvt7aLtY.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-j2E1n8ER.js";import"./CodeDiff-Dg5qylaS.js";import"./SegmentedControl-BPtmGqZE.js";import"./HighlightedTokens-B_4xh0bQ.js";import"./JsonView-r0_NeGqp.js";import"./button-Cpqh3UK7.js";import"./index-CPURVhFy.js";import"./loading-CckofzUs.js";import"./AccordionList-wX34OlLO.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DB04oQsn.js";import"./ToolCall-Bs_Avig1.js";import"./types-DnFuV5L5.js";import"./KeyValueList-D8ekaAyU.js";import"./DataTable-BB1Wfh0H.js";import"./SortableHeader-YxMsDA6S.js";import"./router-BKvyW-mx.js";import"./Modal-CZcXzZ1_.js";import"./index-32mlo6to.js";import"./index-DewUnPhR.js";import"./modalStack-CRXEK55e.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DwRdQ7VZ.js";import"./floating-ui.react-xo2j_cLW.js";import"./FilterPill-D7eYNNGY.js";import"./Combobox-Cq5Cwgai.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CDhMiyrN.js";import"./MultiSelect-yxv-lAiu.js";import"./RangeSlider-BG7N4rt4.js";import"./TimeRange-CSrBIew_.js";import"./select-C7X0Y6pI.js";import"./WorkloadPicker-LYXB4GXR.js";import"./NamespacePicker-oPgmu1Tq.js";import"./index-CAmlEtzE.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-H6K8rOUp.js";import"./TagList-CKxPl2C0.js";import"./HoverCard-B7Vt-bLX.js";import"./Properties-CGJRTav9.js";import"./IconButton-gbin6MpU.js";import"./DropdownMenu-BJXir522.js";import"./DropdownMenuSubmenu-B4D0dxHv.js";import"./StatusDot-7d-SCqTg.js";import"./MessageActions-DnFXgC4J.js";import"./Reasoning-Bpmd-huP.js";import"./MessageFilePart-YVnA0NT4.js";import"./PromptInput-gvFhsj0G.js";import"./Attachment-C3GbeMw1.js";import"./Suggestion-CyempGbQ.js";import"./effort-icons-BBgJ2M1U.js";import"./RuntimeBar-BReeVkNT.js";import"./runtime-mode-BGX_CLVq.js";import"./InputField-DVPzOYmc.js";import"./use-hotkey-DGgIMwGV.js";import"./ContextMeter-CCcEkCd4.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,et={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(C=(f=p.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const tt=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{n as Empty,m as Reasoning,s as Streaming,p as ToolApproval,i as WithRuntimeBar,tt as __namedExportsOrder,et as default};

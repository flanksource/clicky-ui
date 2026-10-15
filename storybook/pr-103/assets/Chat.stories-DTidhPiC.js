import{j as e}from"./iframe-DNj_zNZU.js";import{C as r}from"./Chat-CmGdpN2E.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-LCYGeQwd.js";import"./utils-DW-IJACk.js";import"./Conversation-8QyUTeFm.js";import"./Icon-D173D1Xm.js";import"./Message-CZ-BApJH.js";import"./Markdown-DH53cVwk.js";import"./Callout-Utyt5kOR.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CjM_p02j.js";import"./CodeDiff-V1O_nplA.js";import"./SegmentedControl-YJAMHeYo.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-ChvifZ1Q.js";import"./HighlightedTokens-BTcRsF_2.js";import"./JsonView-ABwU1Fjr.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./ToolCall-VH1LBIF1.js";import"./types-DnFuV5L5.js";import"./KeyValueList-BdpFHeiP.js";import"./DataTable-B1u4gJrS.js";import"./SortableHeader-53lGSQ-u.js";import"./router-Dxczcvdc.js";import"./Modal-BTkFnERZ.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cqk7Uv4P.js";import"./floating-ui.react-CUsd8blK.js";import"./FilterPill-BCljltSy.js";import"./filter-bar-multi-wUCtNmvd.js";import"./Combobox-BpxNrIrE.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./MultiSelect-mGO55RQY.js";import"./RangeSlider-BSWUgAY4.js";import"./TimeRange-CjsLXTSh.js";import"./select-C4MKv3sD.js";import"./WorkloadPicker-BnsVO9gp.js";import"./NamespacePicker-aUlbk4RW.js";import"./index-BC4x0cR9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-COUnG2EZ.js";import"./TagList-Cfi0XIt5.js";import"./HoverCard-BY9qgMmL.js";import"./Properties-BT4JKovI.js";import"./IconButton-CofRhqoZ.js";import"./DropdownMenu-BZOVBMap.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./format-2niohfpq.js";import"./StatusDot-a8NYo4z9.js";import"./MessageActions-BbgnjjQC.js";import"./Reasoning-CaPSic2y.js";import"./MessageFilePart-C5lbLzS3.js";import"./PromptInput-DPHbBT0I.js";import"./Attachment-DV3X6xd9.js";import"./Suggestion-SICtxdUW.js";import"./effort-icons-DrB6agg7.js";import"./RuntimeBar-CZrQ7rIJ.js";import"./runtime-mode-CsMfXeiy.js";import"./InputField-CCxG1Wg3.js";import"./use-hotkey-CH50nEFR.js";import"./ContextMeter-BeRsFodQ.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,nt={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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

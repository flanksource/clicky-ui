import{j as e}from"./iframe-49i2VeV0.js";import{C as r}from"./Chat-C1-k1sKR.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Conversation-CSCKAGLt.js";import"./Icon-CQyVAhLN.js";import"./Message-DOAR8y3I.js";import"./Markdown-DGRLI0EC.js";import"./Callout-NqoBpdJp.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DanP_04g.js";import"./CodeDiff-BoZLkBEw.js";import"./SegmentedControl-DQyG9Uij.js";import"./HighlightedTokens-BQjA9qCL.js";import"./JsonView-CZgQJ4VW.js";import"./button-BGdRDUEK.js";import"./index-CPURVhFy.js";import"./loading-ivhQ-8Oz.js";import"./AccordionList-DKmKrDqZ.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DmOWNVI_.js";import"./ToolCall-umXub8Wm.js";import"./types-DnFuV5L5.js";import"./KeyValueList-DPsE39cz.js";import"./DataTable-Dh0Rp8ah.js";import"./SortableHeader-z43roO1E.js";import"./router-Dxk10Q8I.js";import"./Modal-C0PiPlai.js";import"./index-BmfiYcQm.js";import"./index-COeekDrS.js";import"./modalStack-DtPrVreh.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-B60gax3e.js";import"./floating-ui.react-D9st_Ili.js";import"./FilterPill-CJM8CCUD.js";import"./Combobox-BPv-GTrS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CQSx9Faf.js";import"./MultiSelect-CspOQKqu.js";import"./RangeSlider-NzgrqzdX.js";import"./TimeRange-ChfshZs_.js";import"./select-488pM7Zz.js";import"./WorkloadPicker-BhTiB8sI.js";import"./NamespacePicker-BLppQHd6.js";import"./index-CN4yxxmJ.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BhvAsRA0.js";import"./TagList-Cat-I6sO.js";import"./HoverCard-Nv6W7Mzd.js";import"./Properties-BgtFJszi.js";import"./IconButton-ByEpJOjF.js";import"./DropdownMenu-zKmQ3di2.js";import"./DropdownMenuSubmenu-DjDp9DGD.js";import"./StatusDot-BV2_Fh2V.js";import"./MessageActions-DjMEshjN.js";import"./Reasoning-BhGnAUo1.js";import"./MessageFilePart-DLC1xsdF.js";import"./PromptInput-BAb7a-tQ.js";import"./Attachment-Bnc27WVc.js";import"./Suggestion-CfsOXw0E.js";import"./effort-icons-CFY19F4f.js";import"./RuntimeBar-BYimQJ_F.js";import"./runtime-mode-Bz7vkXBA.js";import"./InputField-BoPdo2um.js";import"./use-hotkey-CM9WEqg-.js";import"./ContextMeter-CUuJFNsJ.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,et={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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

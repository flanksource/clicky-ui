import{j as e}from"./iframe-BsAqiW63.js";import{C as r}from"./Chat-Cdtc3KOs.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";import"./Conversation-DIUtGkrC.js";import"./Icon-Dyy6aaqa.js";import"./Message-C24X_eU9.js";import"./Markdown-DuzdQE_P.js";import"./ConfirmDialog-Dy2NjZjp.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./Callout-DsXXS4Pz.js";import"./callout-tones-EFt49BYo.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./router-BgYu87PQ.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./SegmentedControl-CKXvowSa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./ToolCall-CnyuYrPI.js";import"./types-DnFuV5L5.js";import"./KeyValueList-BNEUsYS3.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./format-2niohfpq.js";import"./StatusDot-CrwAY-qs.js";import"./MessageActions-BvJQHzo7.js";import"./Reasoning-NI0EHHZZ.js";import"./MessageFilePart-7x_zlnTE.js";import"./PromptInput-DHEGUpyA.js";import"./Attachment-BqC_TVhp.js";import"./Suggestion-D-fX_qkE.js";import"./effort-icons-C6WF7EEi.js";import"./RuntimeBar-BRjPgjab.js";import"./runtime-mode-1rGgXNMP.js";import"./InputField-DDv98Cn3.js";import"./use-hotkey-BcWYTy9O.js";import"./ContextMeter-DtWNqgas.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,st={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(C=(f=p.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const it=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{n as Empty,m as Reasoning,s as Streaming,p as ToolApproval,i as WithRuntimeBar,it as __namedExportsOrder,st as default};

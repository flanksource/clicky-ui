import{j as e}from"./iframe-CcPM-cPW.js";import{C as r}from"./Chat-BK7ZRsVh.js";import{m as u,S as l,a as N,b as j,M as I}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Conversation-D5eK1Lqc.js";import"./Icon-D84fH81s.js";import"./Message-Civjz-Po.js";import"./Markdown-B35E3XI8.js";import"./Callout-CNqQHHz_.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DBgncu36.js";import"./CodeDiff-CzMvQzR6.js";import"./SegmentedControl-C1m4tpZ9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BJmABRuJ.js";import"./JsonView-BXn53cW-.js";import"./button-DdaTwSNy.js";import"./index-CPURVhFy.js";import"./loading-pjmE4eTk.js";import"./AccordionList-ClKkjR3g.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-nx-gzT-b.js";import"./ToolCall-C6CCKwip.js";import"./types-DnFuV5L5.js";import"./KeyValueList-QIvImbhT.js";import"./DataTable-CkEynxph.js";import"./SortableHeader-BKZ7YSeR.js";import"./router-CpR4FexT.js";import"./Modal-DrkQQzUz.js";import"./index-xfq7uwHx.js";import"./index-BVhCjt6c.js";import"./modalStack-C4aKQWQ1.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-ghwHc7D0.js";import"./floating-ui.react-GwnkJcwj.js";import"./FilterPill-D8pQ_BuF.js";import"./filter-bar-multi-CvK92PIL.js";import"./Combobox-C_e4HsYa.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BMsoOg_C.js";import"./MultiSelect-LzxeXiya.js";import"./RangeSlider-CpPYdDgK.js";import"./TimeRange-B6CsjMiq.js";import"./select-BnIy5PYa.js";import"./WorkloadPicker-BVtLwdzA.js";import"./NamespacePicker-A0D_Lg32.js";import"./index-BBGaLmv4.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Dj0jfJ1t.js";import"./TagList-B4szgliU.js";import"./HoverCard-BIoavLKo.js";import"./Properties-DGpFuxwE.js";import"./IconButton-C1RFRrox.js";import"./DropdownMenu-HxHzTLAX.js";import"./DropdownMenuSubmenu-0DvJxnuF.js";import"./format-2niohfpq.js";import"./StatusDot-B-CXPWhE.js";import"./MessageActions-Bs4atNtu.js";import"./Reasoning-BIcr8_5R.js";import"./MessageFilePart-BCn4s1Ya.js";import"./PromptInput-80D6x5wc.js";import"./Attachment-Caxhd_VO.js";import"./Suggestion-atTOQZrV.js";import"./effort-icons-BVawcDeQ.js";import"./RuntimeBar-Cyrq4inI.js";import"./runtime-mode-Do7Z14-U.js";import"./InputField-CchQivy0.js";import"./use-hotkey-BFuqgySf.js";import"./ContextMeter-Br1fJ8zN.js";import"./tokens-5o2CVjOb.js";const{expect:t,userEvent:d,waitFor:D,within:o}=__STORYBOOK_MODULE_TEST__,at={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(200),initialMessages:l,placeholder:"Try: list pods"})})},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:l})}),play:async({canvasElement:k})=>{const h=o(k),c=o(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await t(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await t(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context unavailable");await d.hover(O);const a=o(document.body);await D(()=>t(a.getByRole("tooltip")).toBeInTheDocument()),await t(o(a.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0),await t(o(a.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await d.click(_);const L=await a.findByRole("menu",{name:"Runtime mode"});await t(o(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}")}},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:N(),initialMessages:l,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:j(),initialMessages:l,placeholder:"Try: restart the api service"})})};var y,b,g;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(C=(f=p.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const nt=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{n as Empty,m as Reasoning,s as Streaming,p as ToolApproval,i as WithRuntimeBar,nt as __namedExportsOrder,at as default};

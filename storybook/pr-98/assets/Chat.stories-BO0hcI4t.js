import{j as e}from"./iframe-Bk9swcUR.js";import{C as t}from"./Chat-BLPqpBpd.js";import{m as u,S as p,a as N,b as j,M as I}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-BpddQVpQ.js";import"./utils-DW-IJACk.js";import"./Conversation-Bw31nsie.js";import"./Icon-CT2tkhoJ.js";import"./Message-D4d-16oH.js";import"./Markdown-CB0w-uJe.js";import"./Callout-DPYeFu4m.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-ZaGV8WpW.js";import"./CodeDiff-CQZu6CxO.js";import"./SegmentedControl-GIOpFwGu.js";import"./HighlightedTokens-DCZYa5In.js";import"./JsonView-CPcCIR-n.js";import"./ToolCall-C19eYa4V.js";import"./button-BwQwEt7k.js";import"./index-CPURVhFy.js";import"./loading-CDKfpJbq.js";import"./types-B4ZMggem.js";import"./KeyValueList-B459uQSq.js";import"./DataTable-CWDLplT2.js";import"./SortableHeader-CNy8zCPY.js";import"./router-D3XO_z-F.js";import"./Modal-C5IY1XlS.js";import"./index-CLDbtA8-.js";import"./index-B8STd8gT.js";import"./modalStack-CaNd2wxr.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-EmtL7p92.js";import"./floating-ui.react-6IB_hdLH.js";import"./FilterPill-CVfnxEYE.js";import"./Combobox-FqMST2xS.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B8Somcyq.js";import"./MultiSelect-C0fLbA24.js";import"./RangeSlider-tdtmcZfs.js";import"./TimeRange-CGJEfSXy.js";import"./select-N3OZpg7E.js";import"./WorkloadPicker-dWfhUWSm.js";import"./NamespacePicker-CKLL9-TX.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BAd48HDa.js";import"./TagList-BCa_fqYa.js";import"./Badge-CMQ3mwrx.js";import"./HoverCard-B8M4ULNJ.js";import"./Properties-D-ofUfhJ.js";import"./IconButton-BVA8dYdd.js";import"./DropdownMenu-20164xk8.js";import"./DropdownMenuSubmenu-CBBihWZH.js";import"./StatusDot-1wwk9z-3.js";import"./MessageActions-BY_b2wtZ.js";import"./Reasoning-UN6__x4D.js";import"./MessageFilePart-D8SDkxRA.js";import"./PromptInput-CsKK9zm5.js";import"./Attachment-CgkESHIB.js";import"./Suggestion-CLdLGvKw.js";import"./effort-icons-CJj7vQcB.js";import"./RuntimeBar-B8ai2xwL.js";import"./runtime-mode-CJZ7DW6c.js";import"./InputField-1qL-jkdJ.js";import"./use-hotkey-DWAtpYMx.js";import"./ContextMeter-bhqGUcl4.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:l,waitFor:D,within:r}=__STORYBOOK_MODULE_TEST__,Xe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})}),play:async({canvasElement:k})=>{const h=r(k),c=r(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await o(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await o(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context 0% used");await l.hover(O);const d=r(document.body);await D(()=>o(d.getByRole("tooltip")).toBeInTheDocument()),await o(r(d.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await l.click(_);const L=await d.findByRole("menu",{name:"Runtime mode"});await o(r(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}")}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:N(),initialMessages:p,placeholder:"Ask anything"})})},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:j(),initialMessages:p,placeholder:"Try: restart the api service"})})};var y,b,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(C=(f=m.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};const Ze=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,n as Streaming,m as ToolApproval,s as WithRuntimeBar,Ze as __namedExportsOrder,Xe as default};

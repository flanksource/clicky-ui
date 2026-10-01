import{j as e}from"./iframe-DFqoVmES.js";import{C as t}from"./Chat-_eS6JKmv.js";import{m as u,S as p,a as N,b as j,M as I}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-Btgbu5YQ.js";import"./utils-DW-IJACk.js";import"./Conversation-CdO_yoRK.js";import"./Icon-C2VnWBhA.js";import"./Message-0PoT1CFE.js";import"./Markdown-B3_05bTo.js";import"./Callout-BDTtnOmC.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-B9ujCA73.js";import"./CodeDiff-D39VjvBJ.js";import"./SegmentedControl-CHoriPdF.js";import"./HighlightedTokens-DcHvhSPu.js";import"./JsonView-BwRJ4HFa.js";import"./ToolCall-CShKHSG0.js";import"./button-CousEx7c.js";import"./index-CPURVhFy.js";import"./loading-a0chOUxC.js";import"./types-B4ZMggem.js";import"./KeyValueList-CMyheDPN.js";import"./DataTable-lb_tY3DO.js";import"./SortableHeader-gDhxuFH6.js";import"./router-mq6bNbaH.js";import"./Modal-DyLthMq_.js";import"./index-SNQUh-rf.js";import"./index-aojGc9A7.js";import"./modalStack-D8oWGv-3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BdW58AUV.js";import"./floating-ui.react-F5U4WUZ1.js";import"./FilterPill-ZHEqr9b-.js";import"./Combobox-DOasJ9T3.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B7P2O0KF.js";import"./MultiSelect-DhqxlvOC.js";import"./RangeSlider-CwKZMA91.js";import"./TimeRange-CiUP6QBK.js";import"./select-DLCEgKD7.js";import"./WorkloadPicker-9tlmfqwQ.js";import"./NamespacePicker-D6_hq0Rq.js";import"./index-f-QiBoYb.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C8idDDd2.js";import"./TagList-DGjO1rdc.js";import"./Badge-CuaFn_de.js";import"./HoverCard-BR1rDq5O.js";import"./Properties-DvJU1Mna.js";import"./IconButton-Rdjt8MPB.js";import"./DropdownMenu-0zQ_bkuC.js";import"./DropdownMenuSubmenu-D8TwUdJ9.js";import"./StatusDot-CVeeXoK_.js";import"./MessageActions-BSUAdmlL.js";import"./Reasoning-_kkm_FNo.js";import"./MessageFilePart-CEkwFAjq.js";import"./PromptInput-C-J26JzB.js";import"./Attachment-CAldx6zn.js";import"./Suggestion-t5_UsIFS.js";import"./effort-icons-qTXQs_Pe.js";import"./RuntimeBar-Rg2Qf8GL.js";import"./runtime-mode-D9_RRLvx.js";import"./InputField-B9UlJ5Z0.js";import"./use-hotkey-Bdn0o2pp.js";import"./ContextMeter-nhGKNpGc.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:l,waitFor:D,within:r}=__STORYBOOK_MODULE_TEST__,Ze={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:u(),models:I,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})}),play:async({canvasElement:k})=>{const h=r(k),c=r(h.getByRole("group",{name:"Runtime"})),_=c.getByTitle("Runtime mode — API");await o(c.getByRole("combobox",{name:"Model"})).toHaveTextContent("Claude Sonnet 4.5"),await o(c.getByTitle("Reasoning effort")).toHaveTextContent("Medium");const O=h.getByLabelText("Context 0% used");await l.hover(O);const d=r(document.body);await D(()=>o(d.getByRole("tooltip")).toBeInTheDocument()),await o(r(d.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await l.click(_);const L=await d.findByRole("menu",{name:"Runtime mode"});await o(r(L).getByRole("menuitem",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}")}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:N(),initialMessages:p,placeholder:"Ask anything"})})},m={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:j(),initialMessages:p,placeholder:"Try: restart the api service"})})};var y,b,g;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
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

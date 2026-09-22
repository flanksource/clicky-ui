import{j as e}from"./iframe-BTxADGbc.js";import{C as t}from"./Chat-DWlXpGTK.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-95TtevsV.js";import"./utils-DW-IJACk.js";import"./Conversation-Do_3EZPs.js";import"./Icon-DyQmy9zD.js";import"./Message-BukZph2U.js";import"./Markdown-C8cp-WZg.js";import"./Callout-DNhpACdz.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DralUSHB.js";import"./CodeDiff-Md3mH8qB.js";import"./SegmentedControl-Cb6p-V2x.js";import"./HighlightedTokens-DoVhJSb4.js";import"./JsonView-CF7nUUT6.js";import"./ToolCall-BBMY4ihp.js";import"./button-uOKQbD2U.js";import"./index-CPURVhFy.js";import"./loading-ZXW1-FyE.js";import"./types-B4ZMggem.js";import"./KeyValueList-CZYR6BQZ.js";import"./DataTable-CKshF43V.js";import"./SortableHeader-BpG9FLli.js";import"./router-CiqoLGl0.js";import"./Modal-BJSsoZSJ.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-yYKLUgrv.js";import"./floating-ui.react-s2gbsc2n.js";import"./FilterPill-BtWteifY.js";import"./Combobox-C3rdbpG1.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-al_sBZQx.js";import"./MultiSelect-CFdHhfPl.js";import"./RangeSlider-jqxYk1GP.js";import"./TimeRange-CLUngLZP.js";import"./select-XLvWghXg.js";import"./WorkloadPicker-QJPIrp89.js";import"./NamespacePicker-D7Kg-gcT.js";import"./index-CXdr-XwC.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C6MZi5gA.js";import"./TagList-CVxQuAya.js";import"./Badge-8t6xVVQj.js";import"./HoverCard-Cms3aoCY.js";import"./Properties-VVxglCX7.js";import"./IconButton-Df5t7P9x.js";import"./DropdownMenu-CfcxM9h_.js";import"./DropdownMenuSubmenu-WTMYamx5.js";import"./StatusDot-B4MdnWlu.js";import"./MessageActions-BpNL3BL1.js";import"./Reasoning-CzFcJm1h.js";import"./MessageFilePart-C2oH3XeT.js";import"./PromptInput-ODc0ACMW.js";import"./Attachment-n3E04NE3.js";import"./Suggestion-Cu_81KXI.js";import"./effort-icons-CazQSrPw.js";import"./RuntimeBar-C2rVn6xz.js";import"./runtime-mode-SvL8vOtR.js";import"./InputField-CkPd2Czh.js";import"./use-hotkey-BLpJQFBj.js";import"./ContextMeter-GQGwuYjd.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(y=(b=a.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var g,x,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(v=(x=s.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var S,T,M;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute("aria-label", "Runtime controls");
    await expect(body.getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
  }
}`,...(M=(T=n.parameters)==null?void 0:T.docs)==null?void 0:M.source}}};var R,A,E;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(A=i.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};var B,f,w;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Xe=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Xe as __namedExportsOrder,Qe as default};

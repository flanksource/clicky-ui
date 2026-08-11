import{j as e}from"./iframe-DQ4bl7_4.js";import{C as t}from"./Chat-Bqqp8npW.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./Conversation-C5xCHcw-.js";import"./Icon-DnY4_zIX.js";import"./Message-SZE0lUN9.js";import"./Markdown-DDApsYiE.js";import"./CodeBlock-DmsWW9nz.js";import"./CodeDiff-B_zFeLLt.js";import"./SegmentedControl-nX18AODg.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-BHIpvIaJ.js";import"./ToolCall-BIay5jMI.js";import"./button-BeRBp0Vq.js";import"./index-0zBpNI7D.js";import"./loading-DLaiJr6O.js";import"./types-B1SOX9si.js";import"./KeyValueList-B1n40_8s.js";import"./DataTable-BIhIWVdv.js";import"./SortableHeader-Bl25FxIR.js";import"./Modal-A8cU230p.js";import"./index-COx9F93F.js";import"./index-CSwS8kWJ.js";import"./modalStack-iZddL8t7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-XaiX_XX5.js";import"./floating-ui.react-Dv7k8fxD.js";import"./FilterPill-Dv_PE72E.js";import"./Combobox-CyMFz8Gz.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DD4D3IeG.js";import"./MultiSelect-M2Un-Ynr.js";import"./RangeSlider-DOxPOVM4.js";import"./TimeRange-DPn6r5BI.js";import"./select-Do8XwOIJ.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-C0LdJH7o.js";import"./TagList-CwX7ZRct.js";import"./Badge-BQiYcG35.js";import"./HoverCard-rof_d5zl.js";import"./Properties-C41onsKP.js";import"./IconButton-BGaAj_3G.js";import"./DropdownMenu-CwoDXHYK.js";import"./DropdownMenuSubmenu-DGHn6Q5L.js";import"./StatusDot-C19dgJ6r.js";import"./MessageActions-J4FGNK5o.js";import"./Reasoning-ho2lOV6P.js";import"./PromptInput-INPoCaYC.js";import"./Attachment-8k9mm-mE.js";import"./Suggestion-xdqdu0t1.js";import"./effort-icons-SF8pXI0W.js";import"./RuntimeBar-B0DRX_RV.js";import"./runtime-mode-DAV7xe0p.js";import"./InputField-CtvBG5zW.js";import"./use-hotkey-iBCf_owG.js";import"./ContextMeter-PXcVPkfW.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Fe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,g;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=(b=a.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,y,v;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(v=(y=s.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var S,T,A;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute("aria-label", "Runtime controls");
    await expect(body.getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
  }
}`,...(A=(T=n.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var M,R,E;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(R=i.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};var B,f,w;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const He=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,He as __namedExportsOrder,Fe as default};

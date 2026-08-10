import{j as e}from"./iframe-Dd752MYf.js";import{C as t}from"./Chat-DL3E1Ov2.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";import"./Conversation-4YDPWfPX.js";import"./Icon-9CMiNgil.js";import"./Message-BodnwYdR.js";import"./Markdown-BnV_nlGW.js";import"./CodeBlock-DJn6wlWo.js";import"./CodeDiff-uian-6aN.js";import"./SegmentedControl-BKbAH4_-.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-DIJ3Gg6E.js";import"./ToolCall-Dyf9Mpaw.js";import"./button-oBk_H1Zb.js";import"./index-0zBpNI7D.js";import"./loading-Cf-BAp-_.js";import"./types-B1SOX9si.js";import"./KeyValueList-CZweGGiT.js";import"./DataTable-BZKk4EL7.js";import"./SortableHeader-gr8hzJGg.js";import"./Modal-BSuZsloP.js";import"./index-DIEIIbJ9.js";import"./index-DUsaV9HH.js";import"./modalStack-Bx1u-msU.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-fOx97ty3.js";import"./floating-ui.react-BkDfFHxo.js";import"./FilterPill-BW2EVU2l.js";import"./Combobox-DkmILrX4.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-69bNTbeH.js";import"./MultiSelect-DnpVH0A0.js";import"./RangeSlider-D_8GqZjC.js";import"./TimeRange-ChFkp1Al.js";import"./select-Ddx3qY70.js";import"./Timestamp-CcW3ak_D.js";import"./TagList-D3gW21JY.js";import"./Badge-B3qsnIIF.js";import"./HoverCard-Crti9dY4.js";import"./Properties-BDD0BLQa.js";import"./IconButton-C1pNAZbT.js";import"./DropdownMenu-ERsj2HNy.js";import"./DropdownMenuSubmenu-U-7b-fg3.js";import"./StatusDot-CcgQ-eNO.js";import"./MessageActions-DGiO_CBx.js";import"./Reasoning-DkOwsQ3R.js";import"./PromptInput-DaqASOuv.js";import"./Attachment-B9AAfvwt.js";import"./Suggestion-BZ_osmZ3.js";import"./effort-icons-HpOlpzt-.js";import"./RuntimeBar-D7AuBvZO.js";import"./runtime-mode-Dix7z6fa.js";import"./InputField-MNbI36FY.js";import"./use-hotkey-CgmwguwZ.js";import"./ContextMeter-BZOrxgh4.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:k})=>{const l=c(k),C=l.getByRole("button",{name:"Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument(),await u.click(C),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,g;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Fe=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Fe as __namedExportsOrder,qe as default};

import{j as e}from"./iframe-BxSHt6am.js";import{C as r}from"./Chat-CNA-3mla.js";import{m as c,S as i,a as C,b as w,M as L}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CMdjLrOk.js";import"./utils-CR52uffu.js";import"./Conversation-pOacf8YH.js";import"./Icon-69Sjv527.js";import"./Message-C6_zYKGY.js";import"./Markdown-DS5DF2ab.js";import"./CodeBlock-Cc5F0wvm.js";import"./CodeDiff-CRooDBGu.js";import"./SegmentedControl-CJn_8XKa.js";import"./code-highlight-DoRYE0Aj.js";import"./JsonView-lGaX26s-.js";import"./ToolCall-B_vINB5I.js";import"./button-BQC6J4zs.js";import"./index-0zBpNI7D.js";import"./loading-BVbt5uSK.js";import"./types-B1SOX9si.js";import"./MessageActions-D90x0W1h.js";import"./Reasoning-Clb0LmPS.js";import"./PromptInput-8Pz4BmSV.js";import"./Attachment-nOwZ2u5_.js";import"./Suggestion-l6OZFVlw.js";import"./ModelSelector-TeMHUIPU.js";import"./Combobox-BMngNnPG.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-Btv7ibBQ.js";import"./zIndex-CigQ76av.js";import"./index-C7qnLePO.js";import"./index-BfNp2C0W.js";import"./FilterPill-BXAtaj_U.js";import"./effort-icons-C331W06i.js";import"./ContextMeter-mi86Ka9l.js";import"./HoverCard-gBAMqwCn.js";const{expect:m,userEvent:N,waitFor:j,within:p}=__STORYBOOK_MODULE_TEST__,xe={title:"Data/Chat",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a strict model picker (with provider brand icons), a strict reasoning-effort picker, and a context gauge that appears as soon as session or model metadata resolves, then fills as usage arrives. The backend owns model selection + tool execution; these stories drive a mock transport."}}}},t={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:c(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},o={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:c(200),initialMessages:i,placeholder:"Try: list pods"})})},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:c(),models:L,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:i})}),play:async({canvasElement:O})=>{const f=p(O).getByLabelText("Context 0% used");await N.hover(f);const d=p(document.body);await j(()=>m(d.getByRole("tooltip")).toBeInTheDocument()),await m(p(d.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument()}},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:C(),initialMessages:i,placeholder:"Ask anything"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(r,{transport:w(),initialMessages:i,placeholder:"Try: restart the api service"})})};var l,h,u;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=(h=t.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var b,x,S;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(S=(x=o.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var g,v,y;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).getByText("Claude Sonnet 4.5")).toBeInTheDocument();
  }
}`,...(y=(v=a.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var T,M,E;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(M=s.parameters)==null?void 0:M.docs)==null?void 0:E.source}}};var A,k,_;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(_=(k=n.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};const Se=["Empty","Streaming","WithModelSelector","Reasoning","ToolApproval"];export{t as Empty,s as Reasoning,o as Streaming,n as ToolApproval,a as WithModelSelector,Se as __namedExportsOrder,xe as default};

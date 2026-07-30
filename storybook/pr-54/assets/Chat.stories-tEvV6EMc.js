import{j as r}from"./iframe-BLMcgo_c.js";import{C as e}from"./Chat-DZKUyPH-.js";import{m as p,S as n,a as y,b as E,M as f}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-V0wJDdBF.js";import"./utils-CR52uffu.js";import"./Conversation-B-Tiv35D.js";import"./Icon-BjbjSuBq.js";import"./Message-B2kkNdI6.js";import"./Markdown-BzuaMgq_.js";import"./CodeBlock-Bq3gmovv.js";import"./CodeDiff-D0RHEXPA.js";import"./SegmentedControl-BHAvUbO0.js";import"./code-highlight-BFfnWKQ0.js";import"./JsonView-HLu_KbKF.js";import"./ToolCall-AygqbyKl.js";import"./button-CEv4-a2z.js";import"./index-0zBpNI7D.js";import"./loading-iB_CRy-d.js";import"./types-B1SOX9si.js";import"./MessageActions-hcDiZG-d.js";import"./Reasoning-BxEYAWT2.js";import"./PromptInput-mhlc15eQ.js";import"./Attachment-BgAvPCmP.js";import"./Suggestion-DGQAtaxu.js";import"./ModelSelector-CRecuMY3.js";import"./Combobox-_lDNxkJT.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-D_rEmCN1.js";import"./zIndex-CigQ76av.js";import"./index-0GhwRIX8.js";import"./index-C6bGw4eq.js";import"./FilterPill-CbSFJXot.js";import"./effort-icons-CR1cFjWZ.js";import"./ContextMeter-BJ_NjsP6.js";import"./HoverCard-B_pkxN57.js";const pr={title:"Data/Chat",component:e,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a strict model picker (with provider brand icons), a strict reasoning-effort picker, and a token/cost gauge that appears once the first reply lands. The backend owns model selection + tool execution; these stories drive a mock transport."}}}},s={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:p(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:r.jsxs("div",{className:"space-y-1",children:[r.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),r.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},o={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:p(200),initialMessages:n,placeholder:"Try: list pods"})})},a={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:p(),models:f,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:n})})},t={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:y(),initialMessages:n,placeholder:"Ask anything"})})},i={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:E(),initialMessages:n,placeholder:"Try: restart the api service"})})};var d,c,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var l,h,u;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(u=(h=o.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var b,S,g;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>
}`,...(g=(S=a.parameters)==null?void 0:S.docs)==null?void 0:g.source}}};var x,v,M;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(M=(v=t.parameters)==null?void 0:v.docs)==null?void 0:M.source}}};var A,T,k;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(k=(T=i.parameters)==null?void 0:T.docs)==null?void 0:k.source}}};const dr=["Empty","Streaming","WithModelSelector","Reasoning","ToolApproval"];export{s as Empty,t as Reasoning,o as Streaming,i as ToolApproval,a as WithModelSelector,dr as __namedExportsOrder,pr as default};

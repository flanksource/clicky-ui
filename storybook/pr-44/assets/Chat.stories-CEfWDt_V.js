import{j as r}from"./iframe-BK7fwFVO.js";import{C as e}from"./Chat-cb79_AAS.js";import{m as n,S as p,a as y,b as E,M as f}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CLp6iKya.js";import"./Attachment-DlzupIJy.js";import"./utils-CR52uffu.js";import"./Icon-Cpi1U54P.js";import"./button-DS4U28PS.js";import"./index-0zBpNI7D.js";import"./loading-BztHiUUa.js";import"./Conversation-B6y-0kw1.js";import"./Message-BN4zuS4v.js";import"./Markdown-DN8P1a80.js";import"./CodeBlock-uBm2JK41.js";import"./CodeDiff-CVe5jhFr.js";import"./SegmentedControl-B4nMRczM.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-D2jKV3Rg.js";import"./ToolCall-D9KV13WC.js";import"./types-B1SOX9si.js";import"./MessageActions-DX4sY8xS.js";import"./Reasoning-DtTiTf-Y.js";import"./PromptInput-XDmdw042.js";import"./Suggestion-CqO93sfy.js";import"./ModelSelector-DKaEc6Wj.js";import"./Combobox-DCYTyLTI.js";import"./index-V9FlwRvu.js";import"./index-DVBV8i_H.js";import"./FilterPill-B5hPcLLg.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-CjOkifgI.js";import"./zIndex-CigQ76av.js";import"./effort-icons-C0MTbkTz.js";import"./ContextMeter-DlPakxyo.js";import"./HoverCard-CDlOtfM7.js";const nr={title:"Data/Chat",component:e,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a strict model picker (with provider brand icons), a strict reasoning-effort picker, and a token/cost gauge that appears once the first reply lands. The backend owns model selection + tool execution; these stories drive a mock transport."}}}},o={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:r.jsxs("div",{className:"space-y-1",children:[r.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),r.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},a={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),models:f,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})})},t={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:y(),initialMessages:p,placeholder:"Ask anything"})})},i={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:E(),initialMessages:p,toolApproval:"manual",placeholder:"Try: restart the api service"})})};var d,m,c;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(c=(m=o.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var l,h,u;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(u=(h=a.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};var b,S,g;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>
}`,...(g=(S=s.parameters)==null?void 0:S.docs)==null?void 0:g.source}}};var x,v,M;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(M=(v=t.parameters)==null?void 0:v.docs)==null?void 0:M.source}}};var A,T,k;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} toolApproval="manual" placeholder="Try: restart the api service" />
    </div>
}`,...(k=(T=i.parameters)==null?void 0:T.docs)==null?void 0:k.source}}};const dr=["Empty","Streaming","WithModelSelector","Reasoning","ToolApproval"];export{o as Empty,t as Reasoning,a as Streaming,i as ToolApproval,s as WithModelSelector,dr as __namedExportsOrder,nr as default};

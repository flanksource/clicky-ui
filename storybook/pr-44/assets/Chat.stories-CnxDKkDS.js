import{j as r}from"./iframe-QA7Jz26Z.js";import{C as e}from"./Chat-DtISFgSJ.js";import{m as n,S as p,a as y,b as E,M as f}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CLp6iKya.js";import"./Attachment-BCX289Ly.js";import"./utils-CR52uffu.js";import"./Icon-BlQl19kd.js";import"./button-DWVdGjlr.js";import"./index-0zBpNI7D.js";import"./loading-B2I4S6H9.js";import"./Conversation-hdSWXgko.js";import"./Message-DWM6mD6w.js";import"./Markdown-EpPh8LTy.js";import"./CodeBlock-BxM9OG9H.js";import"./CodeDiff-1HW7T_KG.js";import"./SegmentedControl-DE5sxb3k.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-BgGtl1T4.js";import"./ToolCall-DN7vGpWO.js";import"./types-B1SOX9si.js";import"./MessageActions-ClAKMHAW.js";import"./Reasoning-NeVQaOLu.js";import"./PromptInput-BHu4s-tf.js";import"./Suggestion-CK5dkubs.js";import"./ModelSelector-m1CuNoGu.js";import"./Combobox-DqAIyX98.js";import"./index-CD6l-YRN.js";import"./index-Dr8BpMir.js";import"./FilterPill-D0RcJ0T0.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-DcYdjS_E.js";import"./zIndex-CigQ76av.js";import"./effort-icons-CySX7-NJ.js";import"./ContextMeter-CRp5jAeT.js";import"./HoverCard-D6ndIhoW.js";const nr={title:"Data/Chat",component:e,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a strict model picker (with provider brand icons), a strict reasoning-effort picker, and a token/cost gauge that appears once the first reply lands. The backend owns model selection + tool execution; these stories drive a mock transport."}}}},o={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:r.jsxs("div",{className:"space-y-1",children:[r.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),r.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},a={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),models:f,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})})},t={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:y(),initialMessages:p,placeholder:"Ask anything"})})},i={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:E(),initialMessages:p,toolApproval:"manual",placeholder:"Try: restart the api service"})})};var d,m,c;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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

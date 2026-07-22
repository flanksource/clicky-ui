import{j as r}from"./iframe-BNCeWgcu.js";import{C as e}from"./Chat-D2tSR2Ma.js";import{m as n,S as p,a as y,b as E,M as f}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-bXXPlA_x.js";import"./Attachment-CjrDU2YZ.js";import"./utils-CR52uffu.js";import"./Icon-BG-3MSKK.js";import"./button-D5bd58An.js";import"./index-0zBpNI7D.js";import"./loading-rjHsK5dJ.js";import"./Conversation-DCb3jud2.js";import"./Message-BVEFECqS.js";import"./Markdown-Boy8cDlS.js";import"./CodeBlock-DqUnA8Xg.js";import"./CodeDiff-CfCsFqZz.js";import"./SegmentedControl-CtpPh8Tw.js";import"./code-highlight-CMJcRcOY.js";import"./JsonView-B1OjRm7w.js";import"./ToolCall-Cu_6Qe4f.js";import"./types-B1SOX9si.js";import"./MessageActions-vla5LVeP.js";import"./Reasoning-tEgZH3gE.js";import"./PromptInput-B7Px3z_7.js";import"./Suggestion-BVj_ZFy2.js";import"./ModelSelector-DM2cBkZE.js";import"./Combobox-CSVSwpKH.js";import"./index-BXGXqK8-.js";import"./index-CNjQCV-Z.js";import"./FilterPill-BobDGnvZ.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-ShjS88M0.js";import"./zIndex-CigQ76av.js";import"./effort-icons-CFSxC7Dy.js";import"./ContextMeter-DWgX5gGu.js";import"./HoverCard-BWeK8Dks.js";const nr={title:"Data/Chat",component:e,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a strict model picker (with provider brand icons), a strict reasoning-effort picker, and a token/cost gauge that appears once the first reply lands. The backend owns model selection + tool execution; these stories drive a mock transport."}}}},o={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:r.jsxs("div",{className:"space-y-1",children:[r.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),r.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},a={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(200),initialMessages:p,placeholder:"Try: list pods"})})},s={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:n(),models:f,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:p})})},t={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:y(),initialMessages:p,placeholder:"Ask anything"})})},i={render:()=>r.jsx("div",{className:"h-[600px] border border-border",children:r.jsx(e,{transport:E(),initialMessages:p,toolApproval:"manual",placeholder:"Try: restart the api service"})})};var d,m,c;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
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

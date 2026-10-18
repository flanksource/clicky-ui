import{r as x,j as t,aq as z,bh as G}from"./iframe-CKgGkAV6.js";import{u as W,i as H,E as U}from"./SessionInspector.remote-CxG-lG9i.js";import{c as V}from"./utils-DW-IJACk.js";import{I as w}from"./Icon-zT9BHEU_.js";import{s as $,c as M,C as X}from"./session-categories-DFAUS33t.js";import{n as Y}from"./SessionViewer.model-CePezmt5.js";import"./preload-helper-D6IOlyYr.js";import"./event-source-Bj8Tjah6.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BWRQ-hT_.js";import"./string-XSKS3ZaR.js";import"./agent-action-icons-D8vXzKKq.js";import"./effort-icons-bR_uZE_q.js";const J=20;function K(e){return e.findLast(s=>s.kind==="tool"||s.kind==="assistant"&&!!s.text)}function Z({event:e}){const s=e.tool??"",a=$(s,e.toolInput,e.cwd),r=M(s,e.toolInput);return t.jsxs("span",{"data-testid":"session-tail-tool",title:a?`${s} ${a}`:s,className:"flex min-w-0 items-center gap-1.5",children:[t.jsx(w,{icon:X[r],className:"size-3.5 shrink-0"}),t.jsx("span",{className:"shrink-0 font-medium text-foreground",children:s}),a&&t.jsx("span",{className:"min-w-0 truncate font-mono",children:a})]})}function Q({text:e}){return t.jsxs("span",{className:"flex min-w-0 items-center gap-1.5",children:[t.jsx(w,{icon:G,className:"size-3.5 shrink-0"}),t.jsx("span",{"data-testid":"session-tail-text",title:e,className:"min-w-0 truncate",children:e})]})}function T({src:e,follow:s=!0,className:a,emptyLabel:r}){const{session:o,error:g}=W(e,{follow:s,pageSize:J}),n=x.useMemo(()=>o?K(Y(o.messages??[])):void 0,[o]),A=s&&!H(o==null?void 0:o.lifecycleStatus);return t.jsxs("div",{"data-session-tail":!0,className:V("flex min-w-0 items-center gap-2 text-xs text-muted-foreground",a),children:[t.jsx("div",{className:"min-w-0 flex-1",children:g!==void 0?t.jsx("span",{role:"alert",title:g,className:"block truncate text-destructive",children:g}):(n==null?void 0:n.kind)==="tool"?t.jsx(Z,{event:n}):n!=null&&n.text?t.jsx(Q,{text:n.text}):r!==void 0&&t.jsx("span",{className:"block truncate",children:r})}),A&&t.jsx("span",{role:"status","aria-label":"Following session",className:"shrink-0",children:t.jsx(w,{icon:z,className:"size-3.5 animate-spin"})})]})}try{T.displayName="SessionTail",T.__docgenInfo={description:`One line showing only the newest entry of a captain session: the latest
assistant text or the latest tool call, with a spinner while following.`,displayName:"SessionTail",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",methods:[],props:{src:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"}],description:"Captain session URL, e.g. `/api/captain/sessions/{id}`.",name:"src",parent:{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"},required:!0,tags:{},type:{name:"string"}},follow:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"}],description:`Follow the live stream (default true). When false the session is read
once and no spinner is shown.`,name:"follow",parent:{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"},required:!1,tags:{},type:{name:"boolean"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"}],description:"",name:"className",parent:{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"},required:!1,tags:{},type:{name:"string"}},emptyLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"}],description:"Shown until the session has a text message or tool call.",name:"emptyLabel",parent:{fileName:"clicky-ui/packages/ui/src/data/ai/SessionTail.tsx",name:"SessionTailProps"},required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:i,waitFor:v,within:h}=__STORYBOOK_MODULE_TEST__,y=(e,s)=>({id:e,role:"assistant",parts:[{type:"text",text:s}],provenance:{sessionId:"tail",cwd:"/work/repo"}}),f=(e,s,a)=>({id:e,role:"assistant",parts:[{type:"dynamic-tool",toolName:s,toolCallId:`${e}-call`,input:a}],provenance:{sessionId:"tail",cwd:"/work/repo"}}),c=e=>({id:"tail",provider:"anthropic",model:"claude-sonnet-5",revision:1,lifecycleStatus:"running",messages:e}),q="I traced the flaky retry to the backoff timer in the scheduler: the timer is re-armed on every heartbeat, so a slow heartbeat starves the retry and the task is reported as stalled even though it is still making progress.",ee={"/stories/captain/sessions/tool":c([y("m1","Checking the scheduler"),f("m2","Read",{file_path:"/work/repo/pkg/scheduler/backoff.go"})]),"/stories/captain/sessions/bash":c([y("m1","Running the focused tests"),f("m2","Bash",{command:"go test ./pkg/scheduler/... -run TestBackoff -count=1"})]),"/stories/captain/sessions/text":c([f("m1","Grep",{pattern:"rearm",path:"pkg"}),y("m2",q)]),"/stories/captain/sessions/empty":c([])},S=async e=>{const s=String(e).split("?")[0]??"",a=ee[s];return new Response(JSON.stringify(a??{error:`session ${s} not found`}),{status:a?200:404,headers:{"Content-Type":"application/json"}})},se=e=>({url:e,readyState:1,onopen:null,onmessage:null,onerror:null,addEventListener:()=>{},removeEventListener:()=>{},close:()=>{}}),te=e=>{const s=x.useRef(void 0);return globalThis.fetch!==S&&(s.current=globalThis.fetch,globalThis.fetch=S),x.useEffect(()=>()=>{s.current&&(globalThis.fetch=s.current)},[]),t.jsx(U,{value:se,children:t.jsx("div",{className:"w-96 max-w-full rounded-md border border-border p-density-2",children:t.jsx(e,{})})})},ye={title:"AI/SessionTail",component:T,tags:["autodocs"],decorators:[te],parameters:{docs:{description:{component:"A one-line view of a live captain session: only the newest assistant text or tool call (icon, tool name and input summary), with a spinner while following. Full text is in the hover title. Loads and follows `src` through the same remote-session hook as `SessionInspector`."}}},argTypes:{src:{control:"text"},follow:{control:"boolean"},emptyLabel:{control:"text"},className:{table:{disable:!0}}}},l={args:{src:"/stories/captain/sessions/tool"},play:async({canvasElement:e})=>{const s=h(e);await v(()=>i(s.getByTestId("session-tail-tool")).toHaveTextContent("Read")),await i(s.getByRole("status",{name:"Following session"})).toBeInTheDocument()}},m={args:{src:"/stories/captain/sessions/bash"}},p={args:{src:"/stories/captain/sessions/text"},play:async({canvasElement:e})=>{const s=h(e);await v(()=>i(s.getByTestId("session-tail-text")).toHaveAttribute("title",q))}},d={args:{src:"/stories/captain/sessions/text",follow:!1},play:async({canvasElement:e})=>{const s=h(e);await v(()=>i(s.getByTestId("session-tail-text")).toBeInTheDocument()),await i(s.queryByRole("status")).not.toBeInTheDocument()}},u={args:{src:"/stories/captain/sessions/empty",emptyLabel:"Waiting for the agent to start"},play:async({canvasElement:e})=>{const s=h(e);await i(s.getByText("Waiting for the agent to start")).toBeInTheDocument()}};var k,N,I;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/tool"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-tool")).toHaveTextContent("Read"));
    await expect(canvas.getByRole("status", {
      name: "Following session"
    })).toBeInTheDocument();
  }
}`,...(I=(N=l.parameters)==null?void 0:N.docs)==null?void 0:I.source}}};var b,E,B;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/bash"
  }
}`,...(B=(E=m.parameters)==null?void 0:E.docs)==null?void 0:B.source}}};var L,_,j;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/text"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toHaveAttribute("title", LONG_TEXT));
  }
}`,...(j=(_=p.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};var C,R,F;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/text",
    follow: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toBeInTheDocument());
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  }
}`,...(F=(R=d.parameters)==null?void 0:R.docs)==null?void 0:F.source}}};var O,P,D;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/empty",
    emptyLabel: "Waiting for the agent to start"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Waiting for the agent to start")).toBeInTheDocument();
  }
}`,...(D=(P=u.parameters)==null?void 0:P.docs)==null?void 0:D.source}}};const fe=["LatestToolCall","LatestBashCommand","LatestTextClamped","NotFollowing","EmptyBeforeFirstEntry"];export{u as EmptyBeforeFirstEntry,m as LatestBashCommand,p as LatestTextClamped,l as LatestToolCall,d as NotFollowing,fe as __namedExportsOrder,ye as default};

import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{a as r,c as i,n as a,s as o,t as s}from"./SessionInspector.remote-5Vt7rO4u.js";import{n as c,oi as l,ws as u}from"./icons-N6BqLuiz.js";import{n as d,t as f}from"./utils-CEDXhWC6.js";import{r as p,t as m}from"./Icon-DcCtHtj8.js";import{i as h,r as g}from"./SessionViewer.model-CQWmc6_b.js";import{a as _,c as v,f as y,r as b,t as x}from"./session-categories-DkVmKt45.js";function S(e){return e.findLast(e=>e.kind===`tool`||e.kind===`assistant`&&!!e.text)}function C({event:e}){let t=e.tool??``,n=y(t,e.toolInput,e.cwd),r=b(t,e.toolInput);return(0,D.jsxs)(`span`,{"data-testid":`session-tail-tool`,title:n?`${t} ${n}`:t,className:`flex min-w-0 items-center gap-1.5`,children:[(0,D.jsx)(m,{icon:x[r],className:`size-3.5 shrink-0`}),(0,D.jsx)(`span`,{className:`shrink-0 font-medium text-foreground`,children:t}),n&&(0,D.jsx)(`span`,{className:`min-w-0 truncate font-mono`,children:n})]})}function w({text:e}){return(0,D.jsxs)(`span`,{className:`flex min-w-0 items-center gap-1.5`,children:[(0,D.jsx)(m,{icon:l,className:`size-3.5 shrink-0`}),(0,D.jsx)(`span`,{"data-testid":`session-tail-text`,title:e,className:`min-w-0 truncate`,children:e})]})}function T({src:e,follow:t=!0,className:n,emptyLabel:i}){let{session:o,error:s}=r(e,{follow:t,pageSize:O}),c=(0,E.useMemo)(()=>o?S(h(o.messages??[])):void 0,[o]),l=t&&!a(o?.lifecycleStatus);return(0,D.jsxs)(`div`,{"data-session-tail":!0,className:f(`flex min-w-0 items-center gap-2 text-xs text-muted-foreground`,n),children:[(0,D.jsx)(`div`,{className:`min-w-0 flex-1`,children:s===void 0?c?.kind===`tool`?(0,D.jsx)(C,{event:c}):c?.text?(0,D.jsx)(w,{text:c.text}):i!==void 0&&(0,D.jsx)(`span`,{className:`block truncate`,children:i}):(0,D.jsx)(`span`,{role:`alert`,title:s,className:`block truncate text-destructive`,children:s})}),l&&(0,D.jsx)(`span`,{role:`status`,"aria-label":`Following session`,className:`shrink-0`,children:(0,D.jsx)(m,{icon:u,className:`size-3.5 animate-spin`})})]})}var E,D,O;function k(){return(k=e((()=>{E=t(),d(),p(),c(),_(),s(),g(),v(),D=n(),O=20;try{T.displayName=`SessionTail`,T.__docgenInfo={description:`One line showing only the newest entry of a captain session: the latest
assistant text or the latest tool call, with a spinner while following.`,displayName:`SessionTail`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,methods:[],props:{src:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:"Captain session URL, e.g. `/api/captain/sessions/{id}`.",name:`src`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!0,tags:{},type:{name:`string`}},follow:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Follow the live stream (default true). When false the session is read
once and no spinner is shown.`,name:`follow`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`boolean`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:``,name:`className`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}},emptyLabel:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Shown until the session has a text message or tool call.`,name:`emptyLabel`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{A=t(),i(),k(),j=n(),{expect:M,waitFor:N,within:P}=__STORYBOOK_MODULE_TEST__,F=(e,t)=>({id:e,role:`assistant`,parts:[{type:`text`,text:t}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),I=(e,t,n)=>({id:e,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:t,toolCallId:`${e}-call`,input:n}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),L=e=>({id:`tail`,provider:`anthropic`,model:`claude-sonnet-5`,revision:1,lifecycleStatus:`running`,messages:e}),R=`I traced the flaky retry to the backoff timer in the scheduler: the timer is re-armed on every heartbeat, so a slow heartbeat starves the retry and the task is reported as stalled even though it is still making progress.`,z={"/stories/captain/sessions/tool":L([F(`m1`,`Checking the scheduler`),I(`m2`,`Read`,{file_path:`/work/repo/pkg/scheduler/backoff.go`})]),"/stories/captain/sessions/bash":L([F(`m1`,`Running the focused tests`),I(`m2`,`Bash`,{command:`go test ./pkg/scheduler/... -run TestBackoff -count=1`})]),"/stories/captain/sessions/text":L([I(`m1`,`Grep`,{pattern:`rearm`,path:`pkg`}),F(`m2`,R)]),"/stories/captain/sessions/empty":L([])},B=async e=>{let t=String(e).split(`?`)[0]??``,n=z[t];return new Response(JSON.stringify(n??{error:`session ${t} not found`}),{status:n?200:404,headers:{"Content-Type":`application/json`}})},V=e=>({url:e,readyState:1,onopen:null,onmessage:null,onerror:null,addEventListener:()=>void 0,removeEventListener:()=>void 0,close:()=>void 0}),H=e=>{let t=(0,A.useRef)(void 0);return globalThis.fetch!==B&&(t.current=globalThis.fetch,globalThis.fetch=B),(0,A.useEffect)(()=>()=>{t.current&&(globalThis.fetch=t.current)},[]),(0,j.jsx)(o,{value:V,children:(0,j.jsx)(`div`,{className:`w-96 max-w-full rounded-md border border-border p-density-2`,children:(0,j.jsx)(e,{})})})},U={title:`AI/SessionTail`,component:T,tags:[`autodocs`],decorators:[H],parameters:{docs:{description:{component:"A one-line view of a live captain session: only the newest assistant text or tool call (icon, tool name and input summary), with a spinner while following. Full text is in the hover title. Loads and follows `src` through the same remote-session hook as `SessionInspector`."}}},argTypes:{src:{control:`text`},follow:{control:`boolean`},emptyLabel:{control:`text`},className:{table:{disable:!0}}}},W={args:{src:`/stories/captain/sessions/tool`},play:async({canvasElement:e})=>{let t=P(e);await N(()=>M(t.getByTestId(`session-tail-tool`)).toHaveTextContent(`Read`)),await M(t.getByRole(`status`,{name:`Following session`})).toBeInTheDocument()}},G={args:{src:`/stories/captain/sessions/bash`}},K={args:{src:`/stories/captain/sessions/text`},play:async({canvasElement:e})=>{let t=P(e);await N(()=>M(t.getByTestId(`session-tail-text`)).toHaveAttribute(`title`,R))}},q={args:{src:`/stories/captain/sessions/text`,follow:!1},play:async({canvasElement:e})=>{let t=P(e);await N(()=>M(t.getByTestId(`session-tail-text`)).toBeInTheDocument()),await M(t.queryByRole(`status`)).not.toBeInTheDocument()}},J={args:{src:`/stories/captain/sessions/empty`,emptyLabel:`Waiting for the agent to start`},play:async({canvasElement:e})=>{let t=P(e);await M(t.getByText(`Waiting for the agent to start`)).toBeInTheDocument()}},Y=[`LatestToolCall`,`LatestBashCommand`,`LatestTextClamped`,`NotFollowing`,`EmptyBeforeFirstEntry`],W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/bash"
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/text"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toHaveAttribute("title", LONG_TEXT));
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}}})))()}X();export{J as EmptyBeforeFirstEntry,G as LatestBashCommand,K as LatestTextClamped,W as LatestToolCall,q as NotFollowing,Y as __namedExportsOrder,U as default};
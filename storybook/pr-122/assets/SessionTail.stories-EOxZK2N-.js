import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./event-source-provider-BZJpd1_z.js";import{$s as a,n as o}from"./icons-B1p709Ad.js";import{n as s,t as c}from"./utils-DLaO06-s.js";import{r as l,t as u}from"./Icon-Cz-5aDyR.js";import{i as d,r as f}from"./SessionViewer.model-BPjFpZR2.js";import{a as p,c as m,f as h,r as g}from"./session-categories-hp2FHNDy.js";import{a as _,n as v,t as y}from"./SessionInspector.remote-D0kAO0Vi.js";import{n as b,t as x}from"./SessionTail.line-BUsyfP78.js";function S(e){let t=e.findLast(e=>e.kind===`tool`||e.kind===`assistant`&&!!e.text);if(!t)return;if(t.kind!==`tool`)return{kind:`text`,text:t.text??``};let n=t.tool??``;return{kind:`tool`,tool:n,text:h(n,t.toolInput,t.cwd),category:g(n,t.toolInput)}}function C(e){return(0,w.useMemo)(()=>e?S(d(e.messages??[])):void 0,[e])}var w;function T(){return(T=e((()=>{w=t(),p(),m(),f()})))()}function E({src:e,follow:t=!0,className:n,emptyLabel:r}){let{session:i,error:o}=_(e,{follow:t,pageSize:20}),s=C(i),l=t&&!v(i?.lifecycleStatus);return(0,D.jsxs)(`div`,{"data-session-tail":!0,className:c(`flex min-w-0 items-center gap-2 text-xs text-muted-foreground`,n),children:[(0,D.jsx)(`div`,{className:`min-w-0 flex-1`,children:(0,D.jsx)(x,{latest:s,error:o,emptyLabel:r})}),l&&(0,D.jsx)(`span`,{role:`status`,"aria-label":`Following session`,className:`shrink-0`,children:(0,D.jsx)(u,{icon:a,className:`size-3.5 animate-spin`})})]})}var D;function O(){return(O=e((()=>{s(),l(),o(),y(),b(),T(),D=n();try{E.displayName=`SessionTail`,E.__docgenInfo={description:`One line showing only the newest entry of a captain session: the latest
assistant text or the latest tool call, with a spinner while following.`,displayName:`SessionTail`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,methods:[],props:{src:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:"Captain session URL, e.g. `/api/captain/sessions/{id}`.",name:`src`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!0,tags:{},type:{name:`string`}},follow:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Follow the live stream (default true). When false the session is read
once and no spinner is shown.`,name:`follow`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`boolean`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:``,name:`className`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}},emptyLabel:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Shown until the session has a text message or tool call.`,name:`emptyLabel`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{k=t(),r(),O(),A=n(),{expect:j,waitFor:M,within:N}=__STORYBOOK_MODULE_TEST__,P=(e,t)=>({id:e,role:`assistant`,parts:[{type:`text`,text:t}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),F=(e,t,n)=>({id:e,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:t,toolCallId:`${e}-call`,input:n}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),I=e=>({id:`tail`,provider:`anthropic`,model:`claude-sonnet-5`,revision:1,lifecycleStatus:`running`,messages:e}),L=`I traced the flaky retry to the backoff timer in the scheduler: the timer is re-armed on every heartbeat, so a slow heartbeat starves the retry and the task is reported as stalled even though it is still making progress.`,R={"/stories/captain/sessions/tool":I([P(`m1`,`Checking the scheduler`),F(`m2`,`Read`,{file_path:`/work/repo/pkg/scheduler/backoff.go`})]),"/stories/captain/sessions/bash":I([P(`m1`,`Running the focused tests`),F(`m2`,`Bash`,{command:`go test ./pkg/scheduler/... -run TestBackoff -count=1`})]),"/stories/captain/sessions/text":I([F(`m1`,`Grep`,{pattern:`rearm`,path:`pkg`}),P(`m2`,L)]),"/stories/captain/sessions/empty":I([])},z=async e=>{let t=String(e).split(`?`)[0]??``,n=R[t];return new Response(JSON.stringify(n??{error:`session ${t} not found`}),{status:n?200:404,headers:{"Content-Type":`application/json`}})},B=e=>({url:e,readyState:1,onopen:null,onmessage:null,onerror:null,addEventListener:()=>void 0,removeEventListener:()=>void 0,close:()=>void 0}),V=e=>{let t=(0,k.useRef)(void 0);return globalThis.fetch!==z&&(t.current=globalThis.fetch,globalThis.fetch=z),(0,k.useEffect)(()=>()=>{t.current&&(globalThis.fetch=t.current)},[]),(0,A.jsx)(i,{value:B,children:(0,A.jsx)(`div`,{className:`w-96 max-w-full rounded-md border border-border p-density-2`,children:(0,A.jsx)(e,{})})})},H={title:`AI/SessionTail`,component:E,tags:[`autodocs`],decorators:[V],parameters:{docs:{description:{component:"A one-line view of a live captain session: only the newest assistant text or tool call (icon, tool name and input summary), with a spinner while following. Full text is in the hover title. Loads and follows `src` through the same remote-session hook as `SessionInspector`."}}},argTypes:{src:{control:`text`},follow:{control:`boolean`},emptyLabel:{control:`text`},className:{table:{disable:!0}}}},U={args:{src:`/stories/captain/sessions/tool`},play:async({canvasElement:e})=>{let t=N(e);await M(()=>j(t.getByTestId(`session-tail-tool`)).toHaveTextContent(`Read`)),await j(t.getByRole(`status`,{name:`Following session`})).toBeInTheDocument()}},W={args:{src:`/stories/captain/sessions/bash`}},G={args:{src:`/stories/captain/sessions/text`},play:async({canvasElement:e})=>{let t=N(e);await M(()=>j(t.getByTestId(`session-tail-text`)).toHaveAttribute(`title`,L))}},K={args:{src:`/stories/captain/sessions/text`,follow:!1},play:async({canvasElement:e})=>{let t=N(e);await M(()=>j(t.getByTestId(`session-tail-text`)).toBeInTheDocument()),await j(t.queryByRole(`status`)).not.toBeInTheDocument()}},q={args:{src:`/stories/captain/sessions/empty`,emptyLabel:`Waiting for the agent to start`},play:async({canvasElement:e})=>{let t=N(e);await j(t.getByText(`Waiting for the agent to start`)).toBeInTheDocument()}},J=[`LatestToolCall`,`LatestBashCommand`,`LatestTextClamped`,`NotFollowing`,`EmptyBeforeFirstEntry`],U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/bash"
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/text"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toHaveAttribute("title", LONG_TEXT));
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}}})))()}Y();export{q as EmptyBeforeFirstEntry,W as LatestBashCommand,G as LatestTextClamped,U as LatestToolCall,K as NotFollowing,J as __namedExportsOrder,H as default};
import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./event-source-provider-BZJpd1_z.js";import{n as a,tc as o}from"./icons-ClABX2sF.js";import{n as s,t as c}from"./utils-DLaO06-s.js";import{r as l,t as u}from"./Icon-C19Ihno2.js";import{n as d,t as f}from"./AgentIdentity-CdEiArgC.js";import{i as p,r as m}from"./SessionViewer.model-B5NhHT-V.js";import{a as h,g,l as _,r as v}from"./session-categories-C8SPiBn1.js";import{a as y,n as b,t as x}from"./SessionInspector.remote-DISmem_7.js";import{n as S,t as C}from"./SessionTail.line-DdUOBT5I.js";function w(e){let t=e.findLast(e=>e.kind===`tool`||e.kind===`assistant`&&!!e.text);if(!t)return;if(t.kind!==`tool`)return{kind:`text`,text:t.text??``};let n=t.tool??``;return{kind:`tool`,tool:n,text:g(n,t.toolInput,t.cwd),category:v(n,t.toolInput)}}function T(e){return(0,E.useMemo)(()=>e?w(p(e.messages??[])):void 0,[e])}var E;function D(){return(D=e((()=>{E=t(),h(),_(),m()})))()}function O({src:e,follow:t=!0,className:n,emptyLabel:r}){let{session:i,error:a}=y(e,{follow:t,pageSize:20}),s=T(i),l=t&&!b(i?.lifecycleStatus);return(0,k.jsxs)(`div`,{"data-session-tail":!0,className:c(`flex min-w-0 items-center gap-2 text-xs text-muted-foreground`,n),children:[(i?.provider||i?.model)&&(0,k.jsx)(f,{iconOnly:!0,className:`shrink-0`,...i.provider?{provider:i.provider}:{},...i.model?{model:i.model}:{}}),(0,k.jsx)(`div`,{className:`min-w-0 flex-1`,children:(0,k.jsx)(C,{latest:s,error:a,emptyLabel:r})}),l&&(0,k.jsx)(`span`,{role:`status`,"aria-label":`Following session`,className:`shrink-0`,children:(0,k.jsx)(u,{icon:o,className:`size-3.5 animate-spin`})})]})}var k;function A(){return(A=e((()=>{s(),l(),a(),d(),x(),S(),D(),k=n();try{O.displayName=`SessionTail`,O.__docgenInfo={description:`One line showing only the newest entry of a captain session: the latest
assistant text or the latest tool call, with a spinner while following.`,displayName:`SessionTail`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,methods:[],props:{src:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:"Captain session URL, e.g. `/api/captain/sessions/{id}`.",name:`src`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!0,tags:{},type:{name:`string`}},follow:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Follow the live stream (default true). When false the session is read
once and no spinner is shown.`,name:`follow`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`boolean`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:``,name:`className`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}},emptyLabel:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`}],description:`Shown until the session has a text message or tool call.`,name:`emptyLabel`,parent:{fileName:`clicky-ui/packages/ui/src/data/ai/SessionTail.tsx`,name:`SessionTailProps`},required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{j=t(),r(),A(),M=n(),{expect:N,waitFor:P,within:F}=__STORYBOOK_MODULE_TEST__,I=(e,t)=>({id:e,role:`assistant`,parts:[{type:`text`,text:t}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),L=(e,t,n)=>({id:e,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:t,toolCallId:`${e}-call`,input:n}],provenance:{sessionId:`tail`,cwd:`/work/repo`}}),R=e=>({id:`tail`,provider:`anthropic`,model:`claude-sonnet-5`,revision:1,lifecycleStatus:`running`,messages:e}),z=`I traced the flaky retry to the backoff timer in the scheduler: the timer is re-armed on every heartbeat, so a slow heartbeat starves the retry and the task is reported as stalled even though it is still making progress.`,B={"/stories/captain/sessions/tool":R([I(`m1`,`Checking the scheduler`),L(`m2`,`Read`,{file_path:`/work/repo/pkg/scheduler/backoff.go`})]),"/stories/captain/sessions/bash":R([I(`m1`,`Running the focused tests`),L(`m2`,`Bash`,{command:`go test ./pkg/scheduler/... -run TestBackoff -count=1`})]),"/stories/captain/sessions/text":R([L(`m1`,`Grep`,{pattern:`rearm`,path:`pkg`}),I(`m2`,z)]),"/stories/captain/sessions/empty":R([])},V=async e=>{let t=String(e).split(`?`)[0]??``,n=B[t];return new Response(JSON.stringify(n??{error:`session ${t} not found`}),{status:n?200:404,headers:{"Content-Type":`application/json`}})},H=e=>({url:e,readyState:1,onopen:null,onmessage:null,onerror:null,addEventListener:()=>void 0,removeEventListener:()=>void 0,close:()=>void 0}),U=e=>{let t=(0,j.useRef)(void 0);return globalThis.fetch!==V&&(t.current=globalThis.fetch,globalThis.fetch=V),(0,j.useEffect)(()=>()=>{t.current&&(globalThis.fetch=t.current)},[]),(0,M.jsx)(i,{value:H,children:(0,M.jsx)(`div`,{className:`w-96 max-w-full rounded-md border border-border p-density-2`,children:(0,M.jsx)(e,{})})})},W={title:`AI/SessionTail`,component:O,tags:[`autodocs`],decorators:[U],parameters:{docs:{description:{component:"A one-line view of a live captain session: only the newest assistant text or tool call (icon, tool name and input summary), with a spinner while following. Full text is in the hover title. Loads and follows `src` through the same remote-session hook as `SessionInspector`."}}},argTypes:{src:{control:`text`},follow:{control:`boolean`},emptyLabel:{control:`text`},className:{table:{disable:!0}}}},G={args:{src:`/stories/captain/sessions/tool`},play:async({canvasElement:e})=>{let t=F(e);await P(()=>N(t.getByTestId(`session-tail-tool`)).toHaveTextContent(`Read`)),await N(t.getByRole(`status`,{name:`Following session`})).toBeInTheDocument()}},K={args:{src:`/stories/captain/sessions/bash`}},q={args:{src:`/stories/captain/sessions/text`},play:async({canvasElement:e})=>{let t=F(e);await P(()=>N(t.getByTestId(`session-tail-text`)).toHaveAttribute(`title`,z))}},J={args:{src:`/stories/captain/sessions/text`,follow:!1},play:async({canvasElement:e})=>{let t=F(e);await P(()=>N(t.getByTestId(`session-tail-text`)).toBeInTheDocument()),await N(t.queryByRole(`status`)).not.toBeInTheDocument()}},Y={args:{src:`/stories/captain/sessions/empty`,emptyLabel:`Waiting for the agent to start`},play:async({canvasElement:e})=>{let t=F(e);await N(t.getByText(`Waiting for the agent to start`)).toBeInTheDocument()}},X=[`LatestToolCall`,`LatestBashCommand`,`LatestTextClamped`,`NotFollowing`,`EmptyBeforeFirstEntry`],G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/bash"
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/stories/captain/sessions/text"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toHaveAttribute("title", LONG_TEXT));
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}}})))()}Z();export{Y as EmptyBeforeFirstEntry,K as LatestBashCommand,q as LatestTextClamped,G as LatestToolCall,J as NotFollowing,X as __namedExportsOrder,W as default};
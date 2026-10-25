import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{c as r,s as i}from"./SessionInspector.remote-5Vt7rO4u.js";import{n as a,t as o}from"./SessionChatComposer-bnf67yF7.js";import{n as s,t as c}from"./SessionInspector-7Uxk0t5p.js";import{r as l,t as u}from"./SessionViewer.fixtures-CirnqNbw.js";function d(e){return(0,h.jsx)(o,{status:`idle`,capabilities:b,onSubmit:_(),...e?{disabledReason:e}:{}})}async function f(e,t){let n=y(e).getByPlaceholderText(t);await v(()=>{g(n.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight),g(document.scrollingElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)})}function p(e){return t=>{let n=(0,m.useRef)(void 0);return n.current===void 0&&(n.current=globalThis.fetch),globalThis.fetch=()=>e(),(0,m.useEffect)(()=>()=>{n.current&&(globalThis.fetch=n.current)},[]),(0,h.jsx)(i,{value:()=>{throw Error(`the follow stream must not open in this story`)},children:(0,h.jsx)(t,{})})}}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{m=t(),r(),a(),s(),l(),h=n(),{expect:g,fn:_,waitFor:v,within:y}=__STORYBOOK_MODULE_TEST__,b={interrupt:!0,steer:!1,followUp:!0,resume:!0},x={...u,messages:Array.from({length:40},(e,t)=>({id:`message-${t}`,role:t%2?`user`:`assistant`,parts:[{type:`text`,text:`Transcript message ${t+1}\n\nEnough text to make the transcript taller than a phone screen.`}]}))},S={title:`AI/SessionInspector/Pinned composer`,component:c,tags:[`autodocs`],parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{description:{component:"The `composer` slot is always pinned to the bottom of the inspector and never scrolls with the transcript. It renders in every load state (loading, error, ready) in both layouts, so a host can show it disabled with the reason instead of hiding it."}}},argTypes:{session:{table:{disable:!0}},composer:{table:{disable:!0}}},render:e=>(0,h.jsx)(`div`,{className:`h-dvh overflow-hidden`,children:(0,h.jsx)(c,{...e})})},C=`/stories/captain/sessions/pinned`,w={args:{src:C,follow:!1,layout:`compact`,composer:d(`Loading session…`)},decorators:[p(()=>new Promise(()=>{}))],play:async({canvasElement:e})=>{let t=y(e).getByPlaceholderText(`Loading session…`);await g(t).toBeDisabled(),await f(e,`Loading session…`)}},T={args:{src:C,follow:!1,layout:`compact`,composer:d(`This session cannot be read`)},decorators:[p(async()=>new Response(JSON.stringify({error:`session pinned not found`}),{status:404,headers:{"Content-Type":`application/json`}}))],play:async({canvasElement:e})=>{let t=y(e);await g(await t.findByRole(`alert`)).toHaveTextContent(`session pinned not found`),await g(t.getByPlaceholderText(`This session cannot be read`)).toBeDisabled(),await f(e,`This session cannot be read`)}},E={args:{session:x,layout:`compact`,composer:d()},play:async({canvasElement:e})=>{await f(e,`Continue this session…`)}},D={args:{session:x,composer:d()},play:async({canvasElement:e})=>{await f(e,`Continue this session…`)}},O=[`LoadingDisabledWithReason`,`ErrorDisabledWithReason`,`ReadyCompact`,`ReadyDefaultLayout`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    src: SRC,
    follow: false,
    layout: "compact",
    composer: composer("Loading session…")
  },
  decorators: [withSessionFetch(() => new Promise<Response>(() => {}))],
  play: async ({
    canvasElement
  }) => {
    const textbox = within(canvasElement).getByPlaceholderText("Loading session…");
    await expect(textbox).toBeDisabled();
    await expectComposerPinned(canvasElement, "Loading session…");
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    src: SRC,
    follow: false,
    layout: "compact",
    composer: composer("This session cannot be read")
  },
  decorators: [withSessionFetch(async () => new Response(JSON.stringify({
    error: "session pinned not found"
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json"
    }
  }))],
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("session pinned not found");
    await expect(canvas.getByPlaceholderText("This session cannot be read")).toBeDisabled();
    await expectComposerPinned(canvasElement, "This session cannot be read");
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    session: LONG_SESSION,
    layout: "compact",
    composer: composer()
  },
  play: async ({
    canvasElement
  }) => {
    await expectComposerPinned(canvasElement, "Continue this session…");
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    session: LONG_SESSION,
    composer: composer()
  },
  play: async ({
    canvasElement
  }) => {
    await expectComposerPinned(canvasElement, "Continue this session…");
  }
}`,...D.parameters?.docs?.source}}}})))()}k();export{T as ErrorDisabledWithReason,w as LoadingDisabledWithReason,E as ReadyCompact,D as ReadyDefaultLayout,O as __namedExportsOrder,S as default};
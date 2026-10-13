import{j as s,r as d}from"./iframe-DP177qYv.js";import{E as B}from"./SessionInspector.remote-HD-UDmCr.js";import{S as P}from"./SessionChatComposer-C5sHmiW7.js";import{S as u}from"./SessionInspector-CI9zN1zY.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BZq7nIkI.js";import"./event-source-BF2GW_Lm.js";import"./PromptInput-DZw-wRVZ.js";import"./utils-DW-IJACk.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./Icon-CVZO3WAG.js";import"./Attachment-D5pUMWS6.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-QDfBXISc.js";import"./agent-action-icons-7KpVwAJf.js";import"./effort-icons-BAvx-beq.js";import"./select-DHQIEazy.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./SegmentedControl-CmQrpni4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./KeyValueList-BM252NEW.js";import"./SessionViewer-BhQuYnrO.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./SessionViewer.model-IU-5443N.js";import"./session-categories-IWz0lbqA.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-D6m6mBh8.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./format-2niohfpq.js";import"./HoverCard-k2Xsc41N.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BWAlqUsR.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-gw5c6cQc.js";import"./FilterPill-CB6e5lha.js";import"./DateField-Vz0SUsTh.js";import"./DatePicker-C9FXaiIe.js";import"./DateTimePicker-4Tx0xEVq.js";import"./TreePickerField-BjPB4mTt.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./InputField-DQb9Rhrw.js";import"./use-hotkey-iixTK3zz.js";import"./ListMenu-DaHgzerB.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-BD2LnsWK.js";import"./ContextMeter-DFTuG8Qg.js";import"./runtime-mode-B-sR2l2q.js";import"./SessionInspector.approvals-DK7vAYYO.js";import"./ToolCall-BtiP3vgx.js";import"./DataTable-CDHJBsgN.js";import"./SortableHeader-GyTSgVTd.js";import"./router-DMz9daZf.js";import"./FilterBar-W4upSyAa.js";import"./filter-bar-multi-Dhujs7ka.js";import"./MultiSelect-cBIxAEqx.js";import"./RangeSlider-BPH736ua.js";import"./TimeRange-JuQ7yGH5.js";import"./WorkloadPicker-DdJ-TfrN.js";import"./NamespacePicker-Di4Ktcw-.js";import"./index-Kn3cRk9o.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFpXhYiW.js";import"./TagList-Bb9OtQvs.js";import"./StatusDot-B6dTc7Ey.js";import"./VerificationResults-BNBtK5TF.js";import"./TestFailureDetail-Cw9CcJ2q.js";import"./LogViewer-N33AkwdI.js";import"./AnsiHtml-DWrTy8GG.js";import"./status-kHMr9duR.js";import"./MarkIcons-BhqyEx7Y.js";import"./context-icKzFhEL.js";import"./TestRunner-BlP6f2Ep.js";import"./SplitPane-DjlfTfT0.js";import"./use-container-width-BjRC-52t.js";import"./TestTree-BujWqyXh.js";import"./TestTreeNode-BHKxuBpW.js";import"./TestDetailPanel-TTI1zh80.js";import"./SplitButton-BhrvOd24.js";import"./clipboard-D4jVhxkO.js";import"./TabButton-Dz7JW7p1.js";import"./TestRunSummary-CmE5Kqdq.js";import"./ProgressBar-pcgTeEti.js";import"./TestFilterBar-C84wPLDL.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

Enough text to make the transcript taller than a phone screen.`}]}))},Nt={title:"AI/SessionInspector/Pinned composer",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",viewport:{defaultViewport:"mobile1"},docs:{description:{component:"The `composer` slot is always pinned to the bottom of the inspector and never scrolls with the transcript. It renders in every load state (loading, error, ready) in both layouts, so a host can show it disabled with the reason instead of hiding it."}}},argTypes:{session:{table:{disable:!0}},composer:{table:{disable:!0}}},render:o=>s.jsx("div",{className:"h-dvh overflow-hidden",children:s.jsx(u,{...o})})};function m(o){return s.jsx(P,{status:"idle",capabilities:N,onSubmit:_(),...o?{disabledReason:o}:{}})}async function c(o,t){const e=l(o).getByPlaceholderText(t);await D(()=>{r(e.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight),r(document.scrollingElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)})}const L="/stories/captain/sessions/pinned";function O(o){return t=>{const e=d.useRef(void 0);return e.current===void 0&&(e.current=globalThis.fetch),globalThis.fetch=(()=>o()),d.useEffect(()=>()=>{e.current&&(globalThis.fetch=e.current)},[]),s.jsx(B,{value:()=>{throw new Error("the follow stream must not open in this story")},children:s.jsx(t,{})})}}const n={args:{src:L,follow:!1,layout:"compact",composer:m("Loading session…")},decorators:[O(()=>new Promise(()=>{}))],play:async({canvasElement:o})=>{const t=l(o).getByPlaceholderText("Loading session…");await r(t).toBeDisabled(),await c(o,"Loading session…")}},i={args:{src:L,follow:!1,layout:"compact",composer:m("This session cannot be read")},decorators:[O(async()=>new Response(JSON.stringify({error:"session pinned not found"}),{status:404,headers:{"Content-Type":"application/json"}}))],play:async({canvasElement:o})=>{const t=l(o);await r(await t.findByRole("alert")).toHaveTextContent("session pinned not found"),await r(t.getByPlaceholderText("This session cannot be read")).toBeDisabled(),await c(o,"This session cannot be read")}},a={args:{session:R,layout:"compact",composer:m()},play:async({canvasElement:o})=>{await c(o,"Continue this session…")}},p={args:{session:R,composer:m()},play:async({canvasElement:o})=>{await c(o,"Continue this session…")}};var h,y,w;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=(y=n.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var g,f,x;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(x=(f=i.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var S,b,E;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(E=(b=a.parameters)==null?void 0:b.docs)==null?void 0:E.source}}};var T,v,C;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    session: LONG_SESSION,
    composer: composer()
  },
  play: async ({
    canvasElement
  }) => {
    await expectComposerPinned(canvasElement, "Continue this session…");
  }
}`,...(C=(v=p.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};const jt=["LoadingDisabledWithReason","ErrorDisabledWithReason","ReadyCompact","ReadyDefaultLayout"];export{i as ErrorDisabledWithReason,n as LoadingDisabledWithReason,a as ReadyCompact,p as ReadyDefaultLayout,jt as __namedExportsOrder,Nt as default};

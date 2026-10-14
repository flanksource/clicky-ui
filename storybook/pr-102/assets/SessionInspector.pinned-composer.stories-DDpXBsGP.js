import{j as s,r as d}from"./iframe-CcPM-cPW.js";import{E as B}from"./SessionInspector.remote-uGNSDgkl.js";import{S as P}from"./SessionChatComposer-q9RddDCX.js";import{S as u}from"./SessionInspector-CeuNJr6Z.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BZq7nIkI.js";import"./event-source-DTYya2b0.js";import"./PromptInput-80D6x5wc.js";import"./utils-DW-IJACk.js";import"./button-DdaTwSNy.js";import"./index-CPURVhFy.js";import"./loading-pjmE4eTk.js";import"./Icon-D84fH81s.js";import"./Attachment-Caxhd_VO.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CJSJMPKN.js";import"./agent-action-icons-DeCSoQ2g.js";import"./effort-icons-BVawcDeQ.js";import"./select-BnIy5PYa.js";import"./CodeBlock-DBgncu36.js";import"./CodeDiff-CzMvQzR6.js";import"./SegmentedControl-C1m4tpZ9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BJmABRuJ.js";import"./JsonView-BXn53cW-.js";import"./AccordionList-ClKkjR3g.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-nx-gzT-b.js";import"./KeyValueList-QIvImbhT.js";import"./SessionViewer-CmxLuwDt.js";import"./index-xfq7uwHx.js";import"./index-BVhCjt6c.js";import"./SessionViewer.model-DUbXUpMD.js";import"./session-categories-CA6GPCgq.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-VWtWGSaC.js";import"./DropdownMenu-HxHzTLAX.js";import"./floating-ui.react-GwnkJcwj.js";import"./DropdownMenuSubmenu-0DvJxnuF.js";import"./modalStack-C4aKQWQ1.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DGpFuxwE.js";import"./IconButton-C1RFRrox.js";import"./format-2niohfpq.js";import"./HoverCard-BIoavLKo.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-DrkQQzUz.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-C_e4HsYa.js";import"./FilterPill-D8pQ_BuF.js";import"./DateField-yuESPGAs.js";import"./DatePicker-C-Znur6C.js";import"./DateTimePicker-BMsoOg_C.js";import"./TreePickerField-BPGd8ZRI.js";import"./Tree-0MNtHW4W.js";import"./TreeNode-CVevEcMY.js";import"./InputField-CchQivy0.js";import"./use-hotkey-BFuqgySf.js";import"./ListMenu-Cb8iiDvX.js";import"./Markdown-B35E3XI8.js";import"./Callout-CNqQHHz_.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-BCn4s1Ya.js";import"./ContextMeter-Br1fJ8zN.js";import"./runtime-mode-Do7Z14-U.js";import"./SessionInspector.approvals-Bv_lyC8z.js";import"./ToolCall-C6CCKwip.js";import"./DataTable-CkEynxph.js";import"./SortableHeader-BKZ7YSeR.js";import"./router-CpR4FexT.js";import"./FilterBar-ghwHc7D0.js";import"./filter-bar-multi-CvK92PIL.js";import"./MultiSelect-LzxeXiya.js";import"./RangeSlider-CpPYdDgK.js";import"./TimeRange-B6CsjMiq.js";import"./WorkloadPicker-BVtLwdzA.js";import"./NamespacePicker-A0D_Lg32.js";import"./index-BBGaLmv4.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Dj0jfJ1t.js";import"./TagList-B4szgliU.js";import"./StatusDot-B-CXPWhE.js";import"./VerificationResults-CJmX5_AN.js";import"./TestFailureDetail-B360XiS5.js";import"./LogViewer-BQtmVTxc.js";import"./AnsiHtml-Cmzdc-lE.js";import"./status-kHMr9duR.js";import"./MarkIcons-B-r7Rj7R.js";import"./context-BCdtL8vh.js";import"./TestRunner-CJjhvPE3.js";import"./SplitPane-CnT9hSmL.js";import"./use-container-width-CA7g12Na.js";import"./TestTree-f0gNR_GE.js";import"./TestTreeNode-1rgZXkbN.js";import"./TestDetailPanel-DWk6AIcp.js";import"./SplitButton-Bu0RJGeP.js";import"./clipboard-aAxdu3rw.js";import"./TabButton-BOVqlvfL.js";import"./TestRunSummary-C5onKiIp.js";import"./ProgressBar-Co3yrC_Y.js";import"./TestFilterBar-DOwaONCX.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

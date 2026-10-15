import{j as s,r as d}from"./iframe-BpsZ2AnK.js";import{E as B}from"./SessionInspector.remote-BeLbY_ar.js";import{S as P}from"./SessionChatComposer-DsdyVbOc.js";import{S as u}from"./SessionInspector-BkUa3kFJ.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-MsDOuF3K.js";import"./event-source-D1nzW_fy.js";import"./PromptInput-BN_DD1Um.js";import"./utils-DW-IJACk.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./Icon-nPi6h081.js";import"./Attachment-DJjUhDGS.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-2nOxGEnL.js";import"./agent-action-icons-DbNGPyKn.js";import"./effort-icons-Bf0XPwy0.js";import"./select-DmfR8ats.js";import"./CodeBlock-CrYxM6ZO.js";import"./CodeDiff-BGrQjjUl.js";import"./SegmentedControl-BUwYYoDm.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-CTIWcVCe.js";import"./HighlightedTokens-DtZaJN20.js";import"./JsonView-Bc5NK7ov.js";import"./AccordionList-C_UQ-gQM.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-bKZO5iv9.js";import"./SessionViewer-ClLUVGDJ.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./SessionViewer.model-Blf4C8pf.js";import"./session-categories-4pnwlCgv.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-CGkbw0RQ.js";import"./DropdownMenu-BbLBG52q.js";import"./floating-ui.react-B4WvYE6p.js";import"./DropdownMenuSubmenu-bIAIsBPN.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DDW0uDBy.js";import"./IconButton-D62I1GKu.js";import"./format-2niohfpq.js";import"./HoverCard-BgdB6aXQ.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal--V1JkUP_.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-C062J8HP.js";import"./FilterPill-D1QT-mQn.js";import"./DateField-BzRIn2MK.js";import"./DatePicker-BwdIDaNb.js";import"./DateTimePicker-DXF5Age6.js";import"./TreePickerField-BfOuYY1G.js";import"./Tree-CpaciHai.js";import"./TreeNode-CGkFCcsE.js";import"./InputField-DdCxFHzx.js";import"./use-hotkey-G0QJTQ9v.js";import"./ListMenu-BjFagQg6.js";import"./Markdown-CMko-UvP.js";import"./Callout-DkPg7bHY.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-CFNTlUYG.js";import"./ContextMeter-BaCQTkxl.js";import"./runtime-mode-D9UvtFVC.js";import"./SessionInspector.approvals-Ynut9G1j.js";import"./ToolCall-CoVwNFA-.js";import"./DataTable-CPkzPLEv.js";import"./SortableHeader-CdO7PAmn.js";import"./router-D1DUL_L1.js";import"./FilterBar-DTePjmny.js";import"./filter-bar-multi-CZ5GAuNj.js";import"./MultiSelect-GZgKEjD2.js";import"./RangeSlider-9quJMnq0.js";import"./TimeRange-DaklAFvp.js";import"./WorkloadPicker-KCxpU1_j.js";import"./NamespacePicker-BgJ3RleN.js";import"./index-CwCz_U_4.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Chjjtz-D.js";import"./TagList-Sfb7TRSR.js";import"./StatusDot-NaMDlRGc.js";import"./VerificationResults-D2X8-972.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-D-gKKF74.js";import"./LogViewer-BOJUjsSA.js";import"./AnsiHtml-DwUi97A2.js";import"./MarkIcons-CNtmcNEk.js";import"./context-CqLxKUJH.js";import"./TestRunner-oNz4dWo7.js";import"./SplitPane-DprImfge.js";import"./use-container-width-BECRZpSr.js";import"./TestTree-PQXYvP6Z.js";import"./TestTreeNode-CxihrtzF.js";import"./TestDetailPanel-Cr5opjcf.js";import"./SplitButton-Bzdou-Jh.js";import"./clipboard-Biao7_zQ.js";import"./TabButton-B6Oftv0m.js";import"./TestRunSummary-BR4aIDqh.js";import"./ProgressBar-B7dlvag5.js";import"./TestFilterBar-CTtPk80d.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

Enough text to make the transcript taller than a phone screen.`}]}))},jt={title:"AI/SessionInspector/Pinned composer",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",viewport:{defaultViewport:"mobile1"},docs:{description:{component:"The `composer` slot is always pinned to the bottom of the inspector and never scrolls with the transcript. It renders in every load state (loading, error, ready) in both layouts, so a host can show it disabled with the reason instead of hiding it."}}},argTypes:{session:{table:{disable:!0}},composer:{table:{disable:!0}}},render:o=>s.jsx("div",{className:"h-dvh overflow-hidden",children:s.jsx(u,{...o})})};function m(o){return s.jsx(P,{status:"idle",capabilities:N,onSubmit:_(),...o?{disabledReason:o}:{}})}async function c(o,t){const e=l(o).getByPlaceholderText(t);await D(()=>{r(e.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight),r(document.scrollingElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)})}const L="/stories/captain/sessions/pinned";function O(o){return t=>{const e=d.useRef(void 0);return e.current===void 0&&(e.current=globalThis.fetch),globalThis.fetch=(()=>o()),d.useEffect(()=>()=>{e.current&&(globalThis.fetch=e.current)},[]),s.jsx(B,{value:()=>{throw new Error("the follow stream must not open in this story")},children:s.jsx(t,{})})}}const n={args:{src:L,follow:!1,layout:"compact",composer:m("Loading session…")},decorators:[O(()=>new Promise(()=>{}))],play:async({canvasElement:o})=>{const t=l(o).getByPlaceholderText("Loading session…");await r(t).toBeDisabled(),await c(o,"Loading session…")}},i={args:{src:L,follow:!1,layout:"compact",composer:m("This session cannot be read")},decorators:[O(async()=>new Response(JSON.stringify({error:"session pinned not found"}),{status:404,headers:{"Content-Type":"application/json"}}))],play:async({canvasElement:o})=>{const t=l(o);await r(await t.findByRole("alert")).toHaveTextContent("session pinned not found"),await r(t.getByPlaceholderText("This session cannot be read")).toBeDisabled(),await c(o,"This session cannot be read")}},a={args:{session:R,layout:"compact",composer:m()},play:async({canvasElement:o})=>{await c(o,"Continue this session…")}},p={args:{session:R,composer:m()},play:async({canvasElement:o})=>{await c(o,"Continue this session…")}};var h,y,w;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(C=(v=p.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};const Ht=["LoadingDisabledWithReason","ErrorDisabledWithReason","ReadyCompact","ReadyDefaultLayout"];export{i as ErrorDisabledWithReason,n as LoadingDisabledWithReason,a as ReadyCompact,p as ReadyDefaultLayout,Ht as __namedExportsOrder,jt as default};

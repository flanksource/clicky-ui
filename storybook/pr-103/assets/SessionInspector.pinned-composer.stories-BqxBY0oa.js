import{j as s,r as d}from"./iframe-DNj_zNZU.js";import{E as B}from"./SessionInspector.remote-LR7siFXI.js";import{S as P}from"./SessionChatComposer-DK2mC8lx.js";import{S as u}from"./SessionInspector-CZN1Z0P5.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-LCYGeQwd.js";import"./event-source-BQRECGOi.js";import"./PromptInput-DPHbBT0I.js";import"./utils-DW-IJACk.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./Icon-D173D1Xm.js";import"./Attachment-DV3X6xd9.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CVPTN7g5.js";import"./agent-action-icons-CKSmu47z.js";import"./effort-icons-DrB6agg7.js";import"./select-C4MKv3sD.js";import"./CodeBlock-CjM_p02j.js";import"./CodeDiff-V1O_nplA.js";import"./SegmentedControl-YJAMHeYo.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-ChvifZ1Q.js";import"./HighlightedTokens-BTcRsF_2.js";import"./JsonView-ABwU1Fjr.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-BdpFHeiP.js";import"./SessionViewer-DSviuA_U.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./SessionViewer.model-C7Vg56jT.js";import"./session-categories-DVzimY8l.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-D6oRy3T9.js";import"./DropdownMenu-BZOVBMap.js";import"./floating-ui.react-CUsd8blK.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BT4JKovI.js";import"./IconButton-CofRhqoZ.js";import"./format-2niohfpq.js";import"./HoverCard-BY9qgMmL.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BTkFnERZ.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BpxNrIrE.js";import"./FilterPill-BCljltSy.js";import"./DateField-CdijMLjn.js";import"./DatePicker-CnzqPqqM.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./TreePickerField-CSeWXf42.js";import"./Tree-XmGojDQe.js";import"./TreeNode-DFpQ6EqE.js";import"./InputField-CCxG1Wg3.js";import"./use-hotkey-CH50nEFR.js";import"./ListMenu-H251SE9F.js";import"./Markdown-DH53cVwk.js";import"./Callout-Utyt5kOR.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-C5lbLzS3.js";import"./ContextMeter-BeRsFodQ.js";import"./runtime-mode-CsMfXeiy.js";import"./SessionInspector.approvals-DU6i-ZXY.js";import"./ToolCall-VH1LBIF1.js";import"./DataTable-B1u4gJrS.js";import"./SortableHeader-53lGSQ-u.js";import"./router-Dxczcvdc.js";import"./FilterBar-Cqk7Uv4P.js";import"./filter-bar-multi-wUCtNmvd.js";import"./MultiSelect-mGO55RQY.js";import"./RangeSlider-BSWUgAY4.js";import"./TimeRange-CjsLXTSh.js";import"./WorkloadPicker-BnsVO9gp.js";import"./NamespacePicker-aUlbk4RW.js";import"./index-BC4x0cR9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-COUnG2EZ.js";import"./TagList-Cfi0XIt5.js";import"./StatusDot-a8NYo4z9.js";import"./VerificationResults-D9fD1wc6.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-Da12leBW.js";import"./LogViewer-C7quY9zq.js";import"./AnsiHtml-Dt_CWBoi.js";import"./MarkIcons-C6oAybEZ.js";import"./context-wWds-GDC.js";import"./TestRunner-Ckx01rTJ.js";import"./SplitPane-DJ3MhDOw.js";import"./use-container-width-DeUORlNR.js";import"./TestTree-CpaqaLmK.js";import"./TestTreeNode-BwHP0-u1.js";import"./TestDetailPanel-BnIM1Uiw.js";import"./SplitButton-jryXdT3G.js";import"./clipboard-IZxkOcMV.js";import"./TabButton-CywAph2D.js";import"./TestRunSummary-Bb3nEe3h.js";import"./ProgressBar-CK0at_0C.js";import"./TestFilterBar-C3OCtFcE.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

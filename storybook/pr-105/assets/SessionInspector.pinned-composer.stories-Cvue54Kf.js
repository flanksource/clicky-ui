import{j as s,r as d}from"./iframe-bSdY4VSM.js";import{E as B}from"./SessionInspector.remote-BpPb-LyW.js";import{S as P}from"./SessionChatComposer-DBA1T5IC.js";import{S as u}from"./SessionInspector-C9cV7CUI.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BBRSUrHX.js";import"./event-source-KNPqUipF.js";import"./PromptInput-DQaXGsyo.js";import"./utils-DW-IJACk.js";import"./button-Cxa_VEHI.js";import"./index-CPURVhFy.js";import"./loading-DatIFuv1.js";import"./Icon-a8_JJTRy.js";import"./Attachment-C6ILBMzX.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CIQmBIm5.js";import"./agent-action-icons-ksTMhOD6.js";import"./effort-icons-C7XwxCl_.js";import"./select-BSuI-P7O.js";import"./CodeBlock-D39N8RJm.js";import"./CodeDiff-UlAbHhaJ.js";import"./SegmentedControl-DCXKfMBz.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-DuEWhsUM.js";import"./JsonView-8YTA5m7Q.js";import"./AccordionList-DWjw4rR4.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-Bxewb1oq.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-BNw9cNXh.js";import"./SessionViewer-BR_fQPOF.js";import"./index-qiGgzLbL.js";import"./index-C1RppemT.js";import"./SessionViewer.model-ESmcxlHx.js";import"./session-categories-CO61pI8S.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-C-TIXzSA.js";import"./DropdownMenu-B1tJ_OJ0.js";import"./floating-ui.react-BVimmY-p.js";import"./DropdownMenuSubmenu-CPJ_qk78.js";import"./modalStack-BcOP8sXO.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BrkW7QpM.js";import"./IconButton-DzjrNdJS.js";import"./format-2niohfpq.js";import"./HoverCard-ByHwbgrO.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-j0TiIO3T.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-B2s9FN2-.js";import"./FilterPill-BcIZlN36.js";import"./DateField-CSploxIO.js";import"./DatePicker-BRYrz4Uc.js";import"./DateTimePicker-BbaRDASk.js";import"./TreePickerField-CaIopeuH.js";import"./Tree-SrirDnjM.js";import"./TreeNode-PFT8yUDM.js";import"./InputField-DGx0f7Bn.js";import"./use-hotkey-CzYsqqlw.js";import"./ListMenu-TwVzKvdO.js";import"./Markdown-Dz87PD38.js";import"./Callout-CqyXcc2g.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-Bcrsn2wV.js";import"./ContextMeter-DTD2GIjJ.js";import"./runtime-mode-C_39iyIZ.js";import"./SessionInspector.approvals-Bpyb6D8X.js";import"./ToolCall-BqzRrFbT.js";import"./DataTable-C1YJlkfc.js";import"./SortableHeader-BFkzc-7v.js";import"./router-CGvwFh1S.js";import"./FilterBar-CLDtmKI0.js";import"./filter-bar-multi-uGRcbfGS.js";import"./MultiSelect-BjbqR_PC.js";import"./RangeSlider-B6Z_Mmj_.js";import"./TimeRange-DSRiiLnj.js";import"./WorkloadPicker-Dt88fymP.js";import"./NamespacePicker-CZPwmVmx.js";import"./index-B028GE4s.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DwcVt-iJ.js";import"./TagList-DDDo_p5T.js";import"./StatusDot-MR_Ldq0C.js";import"./VerificationResults-CXS53DwV.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-HQCt9WFU.js";import"./LogViewer-C96032O6.js";import"./AnsiHtml-9CEzl31Q.js";import"./MarkIcons-HAGIKvRA.js";import"./context-RogROtiC.js";import"./TestRunner-Bk1lsHJx.js";import"./SplitPane-CxpM7Epm.js";import"./use-container-width-Hla1YRHI.js";import"./TestTree-CSh1Ipt-.js";import"./TestTreeNode-C2NKoYLZ.js";import"./TestDetailPanel-zvKKlBpg.js";import"./SplitButton-D0UM3Epn.js";import"./clipboard-CI8bid4t.js";import"./TabButton-DsdoleWj.js";import"./TestRunSummary-CxOkrKPI.js";import"./ProgressBar-Bl29dxwh.js";import"./TestFilterBar-DtPIdzGr.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

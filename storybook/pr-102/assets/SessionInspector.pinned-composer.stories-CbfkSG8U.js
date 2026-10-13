import{j as s,r as d}from"./iframe-BItsxAjD.js";import{E as B}from"./SessionInspector.remote-CXD_Q7YK.js";import{S as P}from"./SessionChatComposer-BOkYDE12.js";import{S as u}from"./SessionInspector-COFpoABJ.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BZq7nIkI.js";import"./event-source-vlO2BSVi.js";import"./PromptInput-Dm-gRk5M.js";import"./utils-DW-IJACk.js";import"./button-25dF40vQ.js";import"./index-CPURVhFy.js";import"./loading-BOeFbzh-.js";import"./Icon-Dq8eEpLP.js";import"./Attachment-DanVUdhV.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-BJj6ommd.js";import"./agent-action-icons-DwXdPL2K.js";import"./effort-icons-CVrDJX6O.js";import"./select-BNBwrLsc.js";import"./CodeBlock-BiU00fp_.js";import"./CodeDiff-DMKkLlC0.js";import"./SegmentedControl-B1BHyTOC.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-kfpOc-CU.js";import"./JsonView-CWGyot2w.js";import"./AccordionList-B60ONwgr.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-B4WuduE9.js";import"./KeyValueList-Bw38efhz.js";import"./SessionViewer-6A3adt-2.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./SessionViewer.model-CPFkHLkY.js";import"./session-categories-BEa9_J-i.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-Cwr3SdCP.js";import"./DropdownMenu-D3oVIRg_.js";import"./floating-ui.react-CNVnZXsN.js";import"./DropdownMenuSubmenu-C4lOloCs.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CqKyb_jW.js";import"./IconButton-DN_Y5FZs.js";import"./format-2niohfpq.js";import"./HoverCard-BRPRrgTD.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D259elha.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-D5npeKNx.js";import"./FilterPill-DOPLjimn.js";import"./DateField-DdYJXrf6.js";import"./DatePicker-Ad9nckK8.js";import"./DateTimePicker-DCNe0ZvV.js";import"./TreePickerField-D0W1wXQJ.js";import"./Tree-Cfrvkts8.js";import"./TreeNode-DRwHEDi3.js";import"./InputField-DxvVJi1V.js";import"./use-hotkey-D5NVnhcw.js";import"./ListMenu-BvBoDFKm.js";import"./Markdown-DLCNs_K4.js";import"./Callout-CV_TgMao.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-CWXPg5US.js";import"./ContextMeter-CueSsCZX.js";import"./runtime-mode-BRmodi5Q.js";import"./SessionInspector.approvals-DXAc_uFd.js";import"./ToolCall-B6guEyg6.js";import"./DataTable-D5Q05Upm.js";import"./SortableHeader-Cs9TmWHa.js";import"./router-D5_cI9zc.js";import"./FilterBar-B8SLkawx.js";import"./filter-bar-multi-DKn2MepO.js";import"./MultiSelect-23Lsfwm4.js";import"./RangeSlider-CUZZBmKD.js";import"./TimeRange-xAnMQgDf.js";import"./WorkloadPicker-C-TBIGI3.js";import"./NamespacePicker-D5-oB4gu.js";import"./index-JQhHWXK7.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BhS81XUm.js";import"./TagList-XvJfuJPO.js";import"./StatusDot-q2qArgZj.js";import"./VerificationResults-QftBXqnK.js";import"./TestFailureDetail-CIAGwvn2.js";import"./LogViewer-BorJZ9Zd.js";import"./AnsiHtml-Bh59o8S2.js";import"./status-kHMr9duR.js";import"./MarkIcons-DB3c2xp5.js";import"./context-D1Dc57ze.js";import"./TestRunner-CMxtbfGv.js";import"./SplitPane-CJcE__0_.js";import"./use-container-width-1_6ydqQ8.js";import"./TestTree-DjLVRZcF.js";import"./TestTreeNode-YC_DlUKb.js";import"./TestDetailPanel-CVsyAdKC.js";import"./SplitButton-BrVmgGZc.js";import"./clipboard-CvmOL5Gm.js";import"./TabButton-L-L03UjT.js";import"./TestRunSummary-BX6Ao_d8.js";import"./ProgressBar-CA6Y3ar0.js";import"./TestFilterBar-D0SLaPRW.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

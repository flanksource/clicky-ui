import{j as s,r as d}from"./iframe-Dxfrw1Ky.js";import{E as B}from"./SessionInspector.remote-CVCKYa-k.js";import{S as P}from"./SessionChatComposer-uoUVbGyp.js";import{S as u}from"./SessionInspector-Bpwq4Fvi.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BBRSUrHX.js";import"./event-source-D8oZEeiP.js";import"./PromptInput-BJzFu9XI.js";import"./utils-DW-IJACk.js";import"./button-Cd-gFBA2.js";import"./index-CPURVhFy.js";import"./loading-DdWtU95m.js";import"./Icon-uVU5xHJk.js";import"./Attachment-BIE71-18.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-xggB4W0Y.js";import"./agent-action-icons-Be1cg7T7.js";import"./effort-icons-DSwgv5BY.js";import"./select-C8OQW2cZ.js";import"./CodeBlock-CQnknqX7.js";import"./CodeDiff-BA7bdpa9.js";import"./SegmentedControl-CYXceJe4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-B3JYBooh.js";import"./JsonView-C0lt5M6a.js";import"./AccordionList-BTYKiV83.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-aB9oNZTO.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-CpftMAJ_.js";import"./SessionViewer-CwlSW-Ak.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./SessionViewer.model-rUKjhM0Q.js";import"./session-categories-BOWKTI6A.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-YYY8XkSl.js";import"./DropdownMenu-BrgsovJR.js";import"./floating-ui.react-CnFTnPO5.js";import"./DropdownMenuSubmenu-ngeQOpm6.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./Properties-D97LrD4y.js";import"./IconButton-XTWE7kYN.js";import"./format-2niohfpq.js";import"./HoverCard-BpuwyYbr.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D6Y2Y0Td.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CkPoK2Rk.js";import"./FilterPill-DPJ4_JlW.js";import"./DateField-KAcJR11t.js";import"./DatePicker-DGUoI6us.js";import"./DateTimePicker-Do5gRvQn.js";import"./TreePickerField-D4UScmyb.js";import"./Tree-D-3f6UEm.js";import"./TreeNode-4m2l8kkX.js";import"./InputField-BNaI9pYq.js";import"./use-hotkey-CzAz-0Js.js";import"./ListMenu-Cm6jw3GG.js";import"./Markdown-CKxNRpEU.js";import"./Callout-hw3R6Lvm.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-Dn3lAQa2.js";import"./ContextMeter-BpR_03TT.js";import"./runtime-mode-CuLRvUmM.js";import"./SessionInspector.approvals-As8Q5-uQ.js";import"./ToolCall-D3skPrsN.js";import"./DataTable-BIhpbnpq.js";import"./SortableHeader-Bfd9tbsl.js";import"./router-BkznFUli.js";import"./FilterBar-CRB8Fu3i.js";import"./filter-bar-multi-B5teDMbU.js";import"./MultiSelect-UaYFpP5m.js";import"./RangeSlider-DswKR2c-.js";import"./TimeRange-DViFc0-X.js";import"./WorkloadPicker-BMOl_vHV.js";import"./NamespacePicker-Bacf9vZs.js";import"./index-BUwwOD0W.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BdeaaCOh.js";import"./TagList-BlEnFNAp.js";import"./StatusDot-uL2bc0oE.js";import"./VerificationResults-B30KET7f.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-DbZgWAIt.js";import"./LogViewer-CIkt05t-.js";import"./AnsiHtml-C2CmY0im.js";import"./MarkIcons-ChoVWQdr.js";import"./context-BOBg-0K3.js";import"./TestRunner-DoYS3Tim.js";import"./SplitPane-DIbRMCTN.js";import"./use-container-width-DJEi4pg0.js";import"./TestTree-C609UcNC.js";import"./TestTreeNode-DzT0xen-.js";import"./TestDetailPanel-g7pIvMOC.js";import"./SplitButton-PtMh1FDA.js";import"./clipboard-C31elYxF.js";import"./TabButton-ASicmSPv.js";import"./TestRunSummary-JqaRqHXM.js";import"./ProgressBar-DGq7uTiv.js";import"./TestFilterBar-CxlKgaaC.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

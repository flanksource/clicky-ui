import{j as s,r as d}from"./iframe-DgmZMBKH.js";import{E as B}from"./SessionInspector.remote-CmCDJdqC.js";import{S as P}from"./SessionChatComposer-B4spGTf5.js";import{S as u}from"./SessionInspector-CmtLZug-.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BBRSUrHX.js";import"./event-source-CidCcwOb.js";import"./PromptInput-Df7fhIva.js";import"./utils-DW-IJACk.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./Icon-COMQMXZj.js";import"./Attachment-C-AG9-sM.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-9hBeaXbh.js";import"./agent-action-icons-BO91KJbH.js";import"./effort-icons-BIuF64X0.js";import"./select-Dxhm9jtK.js";import"./CodeBlock-C3Pf8vEa.js";import"./CodeDiff-BTioSQ_u.js";import"./SegmentedControl-5L49tJPa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-C-qCgi-g.js";import"./JsonView-PTiSkJw0.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-CmmP9cMI.js";import"./SessionViewer-CE2KQbau.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./SessionViewer.model-C1SlZjKj.js";import"./session-categories-Bn_KhuEM.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-r_Xg6gvB.js";import"./DropdownMenu-gsWLznB7.js";import"./floating-ui.react-C3ET48Mi.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./Properties-Bdq0MR4F.js";import"./IconButton-DuZ8w2HQ.js";import"./format-2niohfpq.js";import"./HoverCard-D9JAxC3e.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-CHXTJS63.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BPdyRRYK.js";import"./FilterPill-BT8q1R31.js";import"./DateField-D2_uPHGt.js";import"./DatePicker-S7XTKat3.js";import"./DateTimePicker-O9lN17EE.js";import"./TreePickerField-CeQEAyFI.js";import"./Tree-C9PPpVHY.js";import"./TreeNode-D7--K_Ib.js";import"./InputField-BJbuDc6j.js";import"./use-hotkey-CpXOlTbi.js";import"./ListMenu-BmJbElel.js";import"./Markdown-wrI770uP.js";import"./Callout-ohERSZFi.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-06lHhRvl.js";import"./ContextMeter-DM1KG_7m.js";import"./runtime-mode-BtbzGa5Y.js";import"./SessionInspector.approvals-BKs6q-hz.js";import"./ToolCall-CyghsYl-.js";import"./DataTable-DLM3RoiO.js";import"./SortableHeader-CvK-UD5r.js";import"./router-ewoeQE3l.js";import"./FilterBar-CiW2zgXq.js";import"./filter-bar-multi-Bq0a6khQ.js";import"./MultiSelect-D80CYoeK.js";import"./RangeSlider-Dxbvtwh2.js";import"./TimeRange-D56Kt8WY.js";import"./WorkloadPicker-p6PpGnQi.js";import"./NamespacePicker-DrrQVfeY.js";import"./index-BU-kuIbr.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFKKOWaG.js";import"./TagList-BR07zvWf.js";import"./StatusDot-zGBvK3uz.js";import"./VerificationResults-Db1L1rtU.js";import"./status-kHMr9duR.js";import"./TestFailureDetail-IRvL7bFe.js";import"./LogViewer-KzzXdTrm.js";import"./AnsiHtml-vARQWsYL.js";import"./MarkIcons-B6IitOfn.js";import"./context-Cs-p0-Dc.js";import"./TestRunner-C79OezMI.js";import"./SplitPane-ZlBj8IQ3.js";import"./use-container-width-Bo5eZfbn.js";import"./TestTree-hqSf_zgE.js";import"./TestTreeNode-DFNoaEJu.js";import"./TestDetailPanel-BJsMQ0mO.js";import"./SplitButton-BA4vifeF.js";import"./clipboard-A05mO3vL.js";import"./TabButton-1FqKlgPf.js";import"./TestRunSummary-CmRtq7Gz.js";import"./ProgressBar-X8W-vQis.js";import"./TestFilterBar-BtDu18V6.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

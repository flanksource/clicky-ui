import{j as s,r as d}from"./iframe-4S_rqkhx.js";import{E as B}from"./SessionInspector.remote-GXFc4Sb0.js";import{S as P}from"./SessionChatComposer-Cm1OP-kc.js";import{S as u}from"./SessionInspector-HtsVXIHT.js";import{I}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-BZq7nIkI.js";import"./event-source-CQfGW5eJ.js";import"./PromptInput-D40aeERk.js";import"./utils-DW-IJACk.js";import"./button-BpUyE0O_.js";import"./index-CPURVhFy.js";import"./loading-1HgYxxJ4.js";import"./Icon-D5QCb7Dz.js";import"./Attachment-CUpQDCAR.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CP87AavP.js";import"./agent-action-icons-DjGnKtUQ.js";import"./effort-icons-yUY6dvur.js";import"./select-D1G4I_RS.js";import"./CodeBlock-BpNlfi-N.js";import"./CodeDiff-DNi4VGZD.js";import"./SegmentedControl-DocL_txn.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BkGLTY6_.js";import"./JsonView-DSVWInHq.js";import"./AccordionList-DmoCt6PE.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-D9TRIDLv.js";import"./KeyValueList-CK26N2OH.js";import"./SessionViewer-AlTAaidt.js";import"./index-Cvd_Abow.js";import"./index-BMI4_Cei.js";import"./SessionViewer.model-2dWoqJb_.js";import"./session-categories-D3sZFy-M.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-DmdeUQ_o.js";import"./DropdownMenu-uwjLYJFW.js";import"./floating-ui.react-OaSgb022.js";import"./DropdownMenuSubmenu-1Z9V4LyC.js";import"./modalStack-C75NiPFe.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CYkb1cQz.js";import"./IconButton-4hlHCpTR.js";import"./format-2niohfpq.js";import"./HoverCard-CZLnR6uk.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D6s3gqO4.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-B0ZmjhD8.js";import"./FilterPill-DIfiwld4.js";import"./DateField-BvNkqxlq.js";import"./DatePicker-BbAa6mCn.js";import"./DateTimePicker-DN47MwkR.js";import"./TreePickerField-Zm--n607.js";import"./Tree-6e4PruJA.js";import"./TreeNode-CQh0qeFF.js";import"./InputField-BLPzKh9o.js";import"./use-hotkey-BIPwMSF7.js";import"./ListMenu-BUyM01vE.js";import"./Markdown-CvI16UAM.js";import"./Callout-CFBCbpqP.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-CBllkj8G.js";import"./ContextMeter-jMQ6ntCk.js";import"./runtime-mode-x_8OBwhN.js";import"./SessionInspector.approvals-BgU9eMrw.js";import"./ToolCall-BzIAOzl9.js";import"./DataTable-5ziinbLW.js";import"./SortableHeader-DcKCVZpp.js";import"./router-COrMSiXX.js";import"./FilterBar-Dp77h1kI.js";import"./filter-bar-multi-5qNdCbbr.js";import"./MultiSelect-49R8ZV-3.js";import"./RangeSlider-DlTQImZt.js";import"./TimeRange-m0Eg84ef.js";import"./WorkloadPicker-BLB9-4rF.js";import"./NamespacePicker-DxTH5Z-F.js";import"./index-CbBMnxt9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DlSYHCht.js";import"./TagList-36ZLgV9Y.js";import"./StatusDot-BLfk0qn0.js";import"./VerificationResults-BYEKQgaq.js";import"./TestFailureDetail-DsTu_hGI.js";import"./LogViewer-BFOc1I66.js";import"./AnsiHtml-ChFDXKC1.js";import"./status-kHMr9duR.js";import"./MarkIcons-BMCfNfK0.js";import"./context-BRRNPPdb.js";import"./TestRunner-C74czbmh.js";import"./SplitPane-Bl08F44l.js";import"./use-container-width-0sY8WlGn.js";import"./TestTree-CuMhmuAj.js";import"./TestTreeNode-BMqryz--.js";import"./TestDetailPanel-BA_QQRFU.js";import"./SplitButton-DwNZJkvc.js";import"./clipboard-DevWvNft.js";import"./TabButton-SpQohb_U.js";import"./TestRunSummary-CWIVg5LM.js";import"./ProgressBar-Csyk5skT.js";import"./TestFilterBar-BrSXHFSF.js";const{expect:r,fn:_,waitFor:D,within:l}=__STORYBOOK_MODULE_TEST__,N={interrupt:!0,steer:!1,followUp:!0,resume:!0},R={...I,messages:Array.from({length:40},(o,t)=>({id:`message-${t}`,role:t%2?"user":"assistant",parts:[{type:"text",text:`Transcript message ${t+1}

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

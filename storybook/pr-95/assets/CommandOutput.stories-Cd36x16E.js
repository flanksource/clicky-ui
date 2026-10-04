import{j as r}from"./iframe-DknlViNB.js";import{C as e}from"./CommandOutput-CFHtTHR2.js";import{S as R}from"./rpc-story.fixtures-CtBdrkbK.js";import"./preload-helper-DxStcPpW.js";import"./DataTable-BThdWaIM.js";import"./SortableHeader-DQYKvo-_.js";import"./utils-DW-IJACk.js";import"./loading-PcIlwrbj.js";import"./router-CFd004yJ.js";import"./Modal-B1uWUfxp.js";import"./index-BUJq7VBZ.js";import"./index-CIJgeimQ.js";import"./Icon-BHRmh9yr.js";import"./button-hM0oAGY1.js";import"./index-CPURVhFy.js";import"./modalStack-BaR_AbUd.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CyIfnKZQ.js";import"./floating-ui.react-CPGroB7w.js";import"./FilterPill-g39yZIfN.js";import"./Combobox-CPIWCZ0V.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-0Xoja836.js";import"./MultiSelect-5_dLzdfE.js";import"./RangeSlider-DSxwZrCQ.js";import"./TimeRange-De7RIHvg.js";import"./select-BLhKUfXD.js";import"./WorkloadPicker-Bg59eYpY.js";import"./NamespacePicker-DjiqICAs.js";import"./index-D84zPWEV.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C7lJAFIW.js";import"./TagList-CTMpl2ld.js";import"./Badge-D5az-60y.js";import"./HoverCard-YLwe9yTe.js";import"./Properties-Ca7T3aE-.js";import"./IconButton-BpNQQRny.js";import"./DropdownMenu-BcAr2u9p.js";import"./DropdownMenuSubmenu-R1W4qY9F.js";import"./StatusDot-Dnm2B4ou.js";import"./Clicky-De7ETdDr.js";import"./queryClient-D5xIrDde.js";import"./suspense-CYaLyhBq.js";import"./useQuery-D2JfShNX.js";import"./FilterForm-SPv5fGNV.js";import"./formMetadata-QKnrUsCv.js";import"./ErrorDetails-Dyn2k6tg.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-a521gYsD.js";import"./TreeNode-CZhztgZf.js";import"./ObjectGraph-dBPFXf_a.js";import"./ExecutionTree-D5xv-ExU.js";import"./CodeBlock-CP33aCHU.js";import"./CodeDiff-CV_7POg6.js";import"./SegmentedControl-BxAx_Iqi.js";import"./HighlightedTokens-nzdgZDVi.js";import"./JsonView-C7Dguwa1.js";import"./RenderedStackTrace-IqkBJd5M.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Cj9hriwv.js";import"./FrameSourceWindow-B9vdFSdu.js";import"./useDebugAction-BtbwSfUu.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=t.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};

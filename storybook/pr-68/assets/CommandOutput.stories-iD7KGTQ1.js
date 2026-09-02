import{j as r}from"./iframe-BC1SeayG.js";import{C as e}from"./CommandOutput-Bi-pYsDA.js";import{S as R}from"./rpc-story.fixtures-BEHSLxaN.js";import"./preload-helper-95TtevsV.js";import"./DataTable-D2c_Lr6Z.js";import"./SortableHeader-C7JsZNsM.js";import"./utils-DW-IJACk.js";import"./loading-CFMNfL_k.js";import"./router-DOUxZqSb.js";import"./Modal-wXbu7MXG.js";import"./index-CPwGNz_W.js";import"./index-9O5VV7bp.js";import"./Icon-CYz8IPcf.js";import"./button-BJ4iY5h1.js";import"./index-CPURVhFy.js";import"./modalStack-DoTdEIQR.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BufdYk35.js";import"./floating-ui.react-BZ8r-J5t.js";import"./FilterPill-CCg47i6K.js";import"./Combobox-DtdUjmAB.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Diw3tly_.js";import"./MultiSelect-Cmn38Ozv.js";import"./RangeSlider-C5DqVIbQ.js";import"./TimeRange-BsSJj2T6.js";import"./select-DHfmXRwq.js";import"./WorkloadPicker-BFyyo34l.js";import"./NamespacePicker-DqNbZtf4.js";import"./index-B2Xe8pVy.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DkUKqexp.js";import"./TagList-DCviFU6g.js";import"./Badge-CPW7D6FZ.js";import"./HoverCard-CRKSXpyj.js";import"./Properties-DJly99Jb.js";import"./IconButton-KFx4INbY.js";import"./DropdownMenu-LCC2WzLv.js";import"./DropdownMenuSubmenu-DRDiToUZ.js";import"./StatusDot-CAHxwEt6.js";import"./Clicky-DYYuB-t7.js";import"./queryClient-ClwnbC12.js";import"./suspense-DT5oo41w.js";import"./useQuery-CO-hwqdQ.js";import"./FilterForm-CY_aWZtM.js";import"./formMetadata-D-oVZ4GR.js";import"./ErrorDetails-ChqxA1aM.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-D_IzkHRB.js";import"./TreeNode-CIX7Kwup.js";import"./ObjectGraph-BUH6Ho5w.js";import"./ExecutionTree-DvbhpPq4.js";import"./CodeBlock-Dw7-8pVs.js";import"./CodeDiff-BIoEbiik.js";import"./SegmentedControl-COr7Flgc.js";import"./HighlightedTokens-Dbxb1eWS.js";import"./JsonView-DNWtmV0m.js";import"./RenderedStackTrace-DIcAIPLe.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DD-YM1Aw.js";import"./FrameSourceWindow-xFPwuV5w.js";import"./useDebugAction-Bvd2axIl.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Lr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Mr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Mr as __namedExportsOrder,Lr as default};

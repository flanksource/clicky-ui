import{j as r}from"./iframe-Os6uNPQC.js";import{C as t}from"./CommandOutput-xoWtj1hp.js";import{S as R}from"./rpc-story.fixtures-B3RHEqxJ.js";import"./preload-helper-BdQ0w_Fr.js";import"./DataTable-f_oyMGHh.js";import"./SortableHeader-Bco_TlpA.js";import"./utils-CR52uffu.js";import"./Modal-4koDLjEl.js";import"./index-DVWt2iB4.js";import"./index-BtvTaee3.js";import"./Icon-BfCTzQnw.js";import"./button-x6drXcnT.js";import"./index-0zBpNI7D.js";import"./loading-Bqgzd3q4.js";import"./modalStack--4BGdmKr.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-CsQ5Ahs9.js";import"./UiClose-CZ0WrT1Q.js";import"./FilterBar-BhsxZSHH.js";import"./floating-ui.react-BARPZRj3.js";import"./FilterPill-DtJ-IcC7.js";import"./UiAdd-Bz3CW-7D.js";import"./UiRemove-cp6jsv4u.js";import"./UiCheck-CTFp6-nW.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-D-hywf6v.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-GtYCoqnB.js";import"./DateTimePicker-B3Q3MqYw.js";import"./UiCalendar-DGpA9sz-.js";import"./MultiSelect-vniFEhEx.js";import"./UiChevronUp-DbHl2ILc.js";import"./RangeSlider-CzLHYSRo.js";import"./TimeRange-CzTyyb1x.js";import"./select-CtnOlx8l.js";import"./UiWatch-Bx_NRfaE.js";import"./UiArrowRight-Bg2YUWPb.js";import"./UiSearch-DJ-cHcc7.js";import"./UiFilter-AZRVYcue.js";import"./UiChevronRight-CLwnYpoB.js";import"./Timestamp-DxgniPxc.js";import"./TagList-nSFKmlTm.js";import"./Badge-BmSeyNU3.js";import"./HoverCard-BWIDBXgb.js";import"./Properties-DUfedci_.js";import"./UiZoomOut-CxBXu6UD.js";import"./UiCopy-Dj8AJxsR.js";import"./StatusDot-BSRyoLu2.js";import"./UiEllipsis-BVODcGFT.js";import"./UiArrowLeft-gTtARJqS.js";import"./UiResizeVertical-l10jPmGx.js";import"./UiRows-MC8OwuIE.js";import"./UiListFlat-CKDie9eS.js";import"./UiSun-BRUTqfom.js";import"./Clicky-tyWPLAS8.js";import"./suspense-CDthqhwk.js";import"./useQuery-DvjX0GW-.js";import"./FilterForm-DrAKpW_C.js";import"./types-BHfRQr8X.js";import"./Tree-DEftzX32.js";import"./TreeNode-BxbBMimb.js";import"./UiExpandAll-O0MTcn3Y.js";import"./ObjectGraph-D2kX0pLo.js";import"./ExecutionTree-D1Qmb-1Y.js";import"./CodeBlock-isDmvjKL.js";import"./JsonView-BGpfwDDe.js";import"./code-highlight-cPmm7-8Z.js";import"./RenderedStackTrace-B3EDkc-3.js";import"./UiError-DkXphMOe.js";import"./UiStackFrameDot-DRCXJ4S_.js";import"./UiChip-DuwJTk7D.js";import"./UiDebugStepOver-Cx1SKtds.js";import"./UiMethod-BHJ3k6Ge.js";import"./UiCloudDownload-C3J5kfGd.js";import"./UiComment-BiarAR0Q.js";import"./UiTable-AWT_Sydo.js";import"./UiFileCode-eZz9oiKC.js";import"./UiFileSpreadsheet-UnJeJi4H.js";import"./UiMarkdown-ZTxD-rij.js";import"./UiFileText-YP3mQBh9.js";import"./UiJson-F_7-ehDY.js";import"./UiEye-CqEQQ90W.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Wr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(a=e.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Yr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Yr as __namedExportsOrder,Wr as default};

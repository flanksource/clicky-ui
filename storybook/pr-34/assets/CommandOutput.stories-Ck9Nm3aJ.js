import{j as r}from"./iframe-Ch1BYoLl.js";import{C as t}from"./CommandOutput-CcWYupXP.js";import{S as R}from"./rpc-story.fixtures-DHdbXDn5.js";import"./preload-helper-B4w--iqy.js";import"./DataTable-BFVgHYCG.js";import"./SortableHeader-B2OPkx-X.js";import"./utils-BLSKlp9E.js";import"./Icon-CajlMFHd.js";import"./use-theme-C_HdjKZq.js";import"./Modal-BVXjZwCi.js";import"./index-DWuQH2px.js";import"./index-D4kBRSRx.js";import"./button-C_7HN6uA.js";import"./index-1evVQkiP.js";import"./loading-D4VpgK2W.js";import"./modalStack-CXz3gd3A.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-BsRjY68n.js";import"./UiClose-B7EVqjbt.js";import"./FilterBar-BqtzGTdr.js";import"./floating-ui.react-rRvTefo0.js";import"./FilterPill-BGPZ3wsp.js";import"./UiAdd-CvQNATwt.js";import"./UiRemove-DUUyKYfT.js";import"./UiCheck-D5P45Pjn.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-dPV2UIiO.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-Cr-fH5xI.js";import"./DateTimePicker-DP2AVQxA.js";import"./UiCalendar-CC_TAq6h.js";import"./MultiSelect-CObzCLE5.js";import"./UiChevronUp-MTxrdBB9.js";import"./RangeSlider-KMoHkVju.js";import"./TimeRange-XtS2MF_9.js";import"./select-Dw5uhEZ_.js";import"./UiWatch-Dk5qcItP.js";import"./UiArrowRight-7fndfbAh.js";import"./UiSearch-B-mqYh-g.js";import"./UiFilter-BYfbi1Ux.js";import"./UiChevronRight-DDEEDNlq.js";import"./Timestamp-DkrplRhZ.js";import"./TagList-DVPnFGnB.js";import"./Badge-QUh22FK_.js";import"./HoverCard-DbBpdw4N.js";import"./Properties-CuMUPFXl.js";import"./UiZoomOut-CjmdqBqD.js";import"./UiCopy-BwK3a7DB.js";import"./StatusDot-M-X3fbvS.js";import"./UiEllipsis-D5TsLJuC.js";import"./UiArrowLeft-CCz0T5CZ.js";import"./UiRows-CHP9RRof.js";import"./UiListFlat-0-9cTPyO.js";import"./UiSun-DekIXeeQ.js";import"./Clicky-BHrXCELu.js";import"./suspense-DoJFb82X.js";import"./useQuery-COCbxg8M.js";import"./FilterForm-CzISyNLH.js";import"./types-BHfRQr8X.js";import"./Tree-Dkta5sye.js";import"./TreeNode-1nXzFjZC.js";import"./UiExpandAll-BKn05MU9.js";import"./ObjectGraph-jWUGyhIZ.js";import"./ExecutionTree-z7q_zmnY.js";import"./CodeBlock-B7i8gWgP.js";import"./JsonView-X-8xFHxN.js";import"./code-highlight-Bt3LUeeQ.js";import"./RenderedStackTrace-ByU4PXOZ.js";import"./UiError-Bw4crEx4.js";import"./UiStackFrameDot-Bcs2AQ5x.js";import"./UiChip-BAJTcDpi.js";import"./UiDebugStepOver-iL7okTkN.js";import"./UiMethod-CpCifJgT.js";import"./UiCloudDownload-BC3FHQxR.js";import"./UiComment-CG-ricRh.js";import"./UiTable-C9UfPAmo.js";import"./UiFileCode-DKJhHugt.js";import"./UiFileSpreadsheet-0jTyUi9f.js";import"./UiMarkdown-BHAmt1tT.js";import"./UiFileText-Cvosmy0s.js";import"./UiJson-BdreGvum.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Vr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Wr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Wr as __namedExportsOrder,Vr as default};

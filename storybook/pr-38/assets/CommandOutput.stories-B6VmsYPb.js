import{j as r}from"./iframe-C9yFQwwi.js";import{C as t}from"./CommandOutput-BQ6a63Uo.js";import{S as R}from"./rpc-story.fixtures-DwGUTV2X.js";import"./preload-helper-C4wV90-x.js";import"./DataTable-BGKH4dWK.js";import"./SortableHeader-hpyCWWrn.js";import"./utils-CR52uffu.js";import"./Modal-DfeEiwDA.js";import"./index-DV4EKk1L.js";import"./index-DNnTLrC-.js";import"./Icon-CPfok5dB.js";import"./button-BUPOCWxe.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";import"./modalStack-CeDZWai7.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-C2nfMBhc.js";import"./UiClose-CrCIES2T.js";import"./FilterBar-L13y0tak.js";import"./floating-ui.react-BGqIqlo6.js";import"./FilterPill-bw9VTMAd.js";import"./UiAdd-Du5cVtP3.js";import"./UiRemove-BR0TLFR1.js";import"./UiCheck-CqtlcYfS.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BdnwO1WO.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-BF9Z2jpX.js";import"./DateTimePicker-DbqJKZbX.js";import"./UiCalendar-x82bgAoW.js";import"./MultiSelect-DrvVIRCm.js";import"./UiChevronUp-CKXfYYR9.js";import"./RangeSlider-CtikB2aa.js";import"./TimeRange-dgC2phYz.js";import"./select-B6QXAJpt.js";import"./UiWatch-DHO8Pxse.js";import"./UiArrowRight-0ZbwMPQH.js";import"./UiSearch-BSiNs2_f.js";import"./UiFilter-BPgxvqo8.js";import"./UiChevronRight-BZHTO6pU.js";import"./Timestamp-DyuJaXLV.js";import"./TagList-ClDRy0xC.js";import"./Badge-DTkM_ah4.js";import"./HoverCard-DY5hSNgU.js";import"./Properties-Dvj7kkxO.js";import"./UiZoomOut-Djkb2g9w.js";import"./UiCopy-CT3ZdT7z.js";import"./StatusDot-CQzvNqcW.js";import"./UiEllipsis-B35g97sm.js";import"./UiArrowLeft-Bj5sISwe.js";import"./UiResizeVertical-BbZ3F_S8.js";import"./UiRows-CrJEpJZ0.js";import"./UiListFlat--nbq_Y8E.js";import"./UiSun-RI5fXfqU.js";import"./Clicky-BuBpBTGa.js";import"./suspense-C9ubH6Ad.js";import"./useQuery-DFno0r9y.js";import"./FilterForm-CsQDZzsP.js";import"./types-BHfRQr8X.js";import"./Tree-sIa6W8sF.js";import"./TreeNode-C1E08kKE.js";import"./UiExpandAll-v2KnkldH.js";import"./ObjectGraph-Bx3BXRNw.js";import"./ExecutionTree-CRvDKTCf.js";import"./CodeBlock-Ln6x9UKe.js";import"./JsonView-BXR92lx8.js";import"./code-highlight-CpKg2tYe.js";import"./RenderedStackTrace-ktp3xgqB.js";import"./UiError-BlHv7aLe.js";import"./UiStackFrameDot-CiY4d8R8.js";import"./UiChip-4GLDlwg6.js";import"./UiDebugStepOver-qE_87-4x.js";import"./UiMethod-DMTX63_j.js";import"./UiCloudDownload-CniU-kV8.js";import"./UiComment-CJf5Miez.js";import"./UiTable-De99E5b6.js";import"./UiFileCode-sfHZ2wVr.js";import"./UiFileSpreadsheet-DKfKzE-O.js";import"./UiMarkdown-3yPXUB4g.js";import"./UiFileText-CMJ2KgJl.js";import"./UiJson-BHQVJ5p_.js";import"./UiEye-12VAZ5J9.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

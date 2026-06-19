import{j as r}from"./iframe-CmW1bXIL.js";import{C as t}from"./CommandOutput-CFsbsTJ5.js";import{S as R}from"./rpc-story.fixtures-C_Jwbi38.js";import"./preload-helper-ByUaG9M2.js";import"./DataTable-DEb7A5Ne.js";import"./SortableHeader-CBw982xb.js";import"./utils-BLSKlp9E.js";import"./Icon-DgKWNfUH.js";import"./use-theme-CPxN17ZC.js";import"./Modal-DxeyfFt4.js";import"./index-CvvFywp4.js";import"./index-CwG-8UeD.js";import"./button-Cbf2D1Lj.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./modalStack-CihdweRn.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-C6Iis6jt.js";import"./UiClose-BWsNrAoC.js";import"./FilterBar-hAzNCHdh.js";import"./floating-ui.react-mTFBW1Ma.js";import"./FilterPill-D3c4bT_8.js";import"./UiAdd-cDftFtFQ.js";import"./UiRemove-DdJaLPEm.js";import"./UiCheck-D6M7xpTV.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-C3OZP1cH.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-DNI0luU1.js";import"./DateTimePicker-D-3L2yei.js";import"./UiCalendar-CMRdMOnT.js";import"./MultiSelect-B0RWA2PX.js";import"./UiChevronUp-CCcfE8it.js";import"./RangeSlider-BnNQXcQt.js";import"./TimeRange-B1rlhEFO.js";import"./select-pkm1YVYK.js";import"./UiWatch-BJsevy8H.js";import"./UiArrowRight-Ce2uwFX5.js";import"./UiSearch-L2vxKGO0.js";import"./UiFilter-CJt0Wq0T.js";import"./UiChevronRight-DL1RnjKc.js";import"./Timestamp-D3g5SIOf.js";import"./TagList-BppJWMaN.js";import"./Badge-DAfksLSj.js";import"./HoverCard-BNjkbk4T.js";import"./Properties-BnV2zwZu.js";import"./UiZoomOut-lCnXr7gA.js";import"./UiCopy-52ldaFhT.js";import"./StatusDot-BEKTAprD.js";import"./UiEllipsis-FwH_tpoh.js";import"./UiArrowLeft-Sn9jsF52.js";import"./UiRows-uyVZ3NI1.js";import"./UiListFlat-BZENYys2.js";import"./UiSun-C_GzQ9UI.js";import"./Clicky-Dkg5Qi1r.js";import"./suspense-BvtEJzrj.js";import"./useQuery-CdU0hvij.js";import"./FilterForm-DyjC5NvY.js";import"./types-BHfRQr8X.js";import"./Tree-DGflsuJB.js";import"./TreeNode-OAJurtQt.js";import"./UiExpandAll-B5hzOJMv.js";import"./CodeBlock-BfTp8hI-.js";import"./JsonView-1BfW0HLV.js";import"./code-highlight-vj-DXbl2.js";import"./RenderedStackTrace-DtbTcUq7.js";import"./UiError-a_6rCuL3.js";import"./UiStackFrameDot-ByQe6xuP.js";import"./UiChip-CZyKjtXS.js";import"./UiDebugStepOver-DrhOrNFa.js";import"./UiMethod-DPZQQljn.js";import"./UiCloudDownload-BqCuG-r2.js";import"./UiComment-BLjmyrV5.js";import"./UiTable-33vuYdx5.js";import"./UiFileCode-DP7iuZ6q.js";import"./UiFileSpreadsheet-BZ1nbJP4.js";import"./UiMarkdown-DNhoy9ad.js";import"./UiFileText-C1nzfTxV.js";import"./UiJson-DEgueWZR.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Qr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Ur=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Ur as __namedExportsOrder,Qr as default};

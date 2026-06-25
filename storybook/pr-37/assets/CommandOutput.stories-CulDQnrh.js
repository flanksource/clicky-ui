import{j as r}from"./iframe-BO3XiECZ.js";import{C as t}from"./CommandOutput-Biu-CtO9.js";import{S as R}from"./rpc-story.fixtures-Brrwwq-n.js";import"./preload-helper-B2wK-Kjy.js";import"./DataTable-CYdruLKH.js";import"./SortableHeader-CWXkSBmo.js";import"./utils-BLSKlp9E.js";import"./Modal-Cw1CJA-_.js";import"./index-D_v1HQsH.js";import"./index-OHfE5VLg.js";import"./Icon-GruNqjyl.js";import"./button-D09c44qg.js";import"./index-1evVQkiP.js";import"./loading-DKpQqMGf.js";import"./modalStack-yDe9UqJq.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-BjP1kzRt.js";import"./UiClose-C-MNSUX4.js";import"./FilterBar-d-7O9108.js";import"./floating-ui.react-B_2LfBkg.js";import"./FilterPill-ClqC8BxQ.js";import"./UiAdd-B6Pi1ncb.js";import"./UiRemove-CckMB7tU.js";import"./UiCheck-ODqHhldT.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BqRY8y8h.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CmLEZyD7.js";import"./DateTimePicker-CRm_dufg.js";import"./UiCalendar-CiRLNUOg.js";import"./MultiSelect-CNHs76XG.js";import"./UiChevronUp-CVno9QiD.js";import"./RangeSlider-D5mBDIlD.js";import"./TimeRange-DENuH19V.js";import"./select-Dfxavir1.js";import"./UiWatch-Cuvk_LS8.js";import"./UiArrowRight-BC0BWGcL.js";import"./UiSearch-Mab2UGhK.js";import"./UiFilter-vYGcSCbk.js";import"./UiChevronRight-DCM5aOuD.js";import"./Timestamp-CU1-eFqQ.js";import"./TagList-CWYYzHTG.js";import"./Badge-3P21JFl2.js";import"./HoverCard-Dy6uWYdg.js";import"./Properties-CVP20Vxt.js";import"./UiZoomOut-Be8sQgFR.js";import"./UiCopy-CbLhyTSt.js";import"./StatusDot-BXozSc91.js";import"./UiEllipsis-4_Llcdjs.js";import"./UiArrowLeft--nnuc1-F.js";import"./UiResizeVertical-DcnPy14G.js";import"./UiRows-Cbw6GDI-.js";import"./UiListFlat-DGZ5cHbe.js";import"./UiSun-CEFsdt3K.js";import"./Clicky-21JJGu-f.js";import"./suspense-Dn-LogDN.js";import"./useQuery-DOAS6o2e.js";import"./FilterForm-X-PRklif.js";import"./types-BHfRQr8X.js";import"./Tree-BsWXFbZJ.js";import"./TreeNode-zYYXN2yX.js";import"./UiExpandAll-DnkJtjD6.js";import"./ObjectGraph-DmvVZ_bb.js";import"./ExecutionTree-CmEIX_8P.js";import"./CodeBlock-BHEAp_Sy.js";import"./JsonView-BjBUOmIJ.js";import"./code-highlight-BWXEN8UU.js";import"./RenderedStackTrace-BFP_WvgV.js";import"./UiError-taEvpE4A.js";import"./UiStackFrameDot-D5EjQLh9.js";import"./UiChip-COxii54Z.js";import"./UiDebugStepOver-BO-Ds-C8.js";import"./UiMethod-1fla2cfZ.js";import"./UiCloudDownload-e7H8SfvT.js";import"./UiComment-Cf2QGSb5.js";import"./UiTable-BqZFwDZD.js";import"./UiFileCode-DwL7pW5t.js";import"./UiFileSpreadsheet-gq0vOBPX.js";import"./UiMarkdown-Bwjud3vL.js";import"./UiFileText-DapHAPTC.js";import"./UiJson-BKXuVOXk.js";import"./UiEye-Dc1KaF_j.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

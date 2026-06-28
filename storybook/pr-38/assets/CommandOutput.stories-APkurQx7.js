import{j as r}from"./iframe-BxLPOr6M.js";import{C as t}from"./CommandOutput-CGMnNKqd.js";import{S as R}from"./rpc-story.fixtures-DRBelces.js";import"./preload-helper-C4wV90-x.js";import"./DataTable-Bued9z_Z.js";import"./SortableHeader-CBy02R17.js";import"./utils-CR52uffu.js";import"./Modal-DKhra3sX.js";import"./index-DOlc9q0f.js";import"./index-CXpH9Yf8.js";import"./Icon-DGql8Ler.js";import"./button-CcdgmEp6.js";import"./index-0zBpNI7D.js";import"./loading-C28S_Ccf.js";import"./modalStack-BJc3ZvRY.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-Dp4xHc-2.js";import"./UiClose-BkgTCVec.js";import"./FilterBar-BXyFSHB-.js";import"./floating-ui.react-DuikDt8B.js";import"./FilterPill-CCjDi8CW.js";import"./UiAdd-JiDWhMD_.js";import"./UiRemove-BjxrPqZR.js";import"./UiCheck-DcO0ZANr.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DHpckKjG.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-BxzZdAmx.js";import"./DateTimePicker-D0PLqDS8.js";import"./UiCalendar-BZYLhFp1.js";import"./MultiSelect-CQq681md.js";import"./UiChevronUp-BbTc8SOD.js";import"./RangeSlider-D6DAkUEn.js";import"./TimeRange-B20I7o7D.js";import"./select-BQiAzG3l.js";import"./UiWatch-DyAJyBtK.js";import"./UiArrowRight-W2CLP-s8.js";import"./UiSearch-CjFq2-8_.js";import"./UiFilter-CZttyVSp.js";import"./UiChevronRight-DKNjap7a.js";import"./Timestamp-EO1n7K79.js";import"./TagList-DDPKs0Wa.js";import"./Badge-CMVsmLhG.js";import"./HoverCard-BHwQ2VLC.js";import"./Properties-B54xSl2a.js";import"./UiZoomOut-MZmISAyX.js";import"./UiCopy-DlhnPK4p.js";import"./StatusDot-XVxLnzSb.js";import"./UiEllipsis-D3NVjTyT.js";import"./UiArrowLeft-BxM2ilgb.js";import"./UiResizeVertical-DAWuJyey.js";import"./UiRows-DC-kDGIE.js";import"./UiListFlat-DE0w-QRe.js";import"./UiSun-5K9IaXLh.js";import"./Clicky-BoKmdSjF.js";import"./suspense-DJ3MBEGN.js";import"./useQuery-D3BLezaY.js";import"./FilterForm-WjV9K1hI.js";import"./types-BHfRQr8X.js";import"./Tree-B8NLzSEo.js";import"./TreeNode-Cc5f5pT6.js";import"./UiExpandAll-Qls7xI8d.js";import"./ObjectGraph-DqCGPmR2.js";import"./ExecutionTree-DzLEsONY.js";import"./CodeBlock-DuyIK4wF.js";import"./JsonView-DFRIAMDC.js";import"./code-highlight-CpKg2tYe.js";import"./RenderedStackTrace-C4f1QCCh.js";import"./UiError-DdzXw9FK.js";import"./UiStackFrameDot-C3ReuY6z.js";import"./UiChip-CxcHv84l.js";import"./UiDebugStepOver-BXkCMRG4.js";import"./UiMethod-BHKzDsSy.js";import"./UiCloudDownload-Bbd7mdYg.js";import"./UiComment-B1SlljlC.js";import"./UiTable-B0o1yzlZ.js";import"./UiFileCode-C7wqLh0j.js";import"./UiFileSpreadsheet-BP0gOU_p.js";import"./UiMarkdown-DTiitjEG.js";import"./UiFileText-Dt_sDwZs.js";import"./UiJson-CZG7s0pm.js";import"./UiEye-CEdW9Gp5.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

import{j as r}from"./iframe-BUI_RHnX.js";import{C as t}from"./CommandOutput-B-L5LjNg.js";import{S as R}from"./rpc-story.fixtures-B2s29hzQ.js";import"./preload-helper-DweeuSg3.js";import"./DataTable-D2GmXt0K.js";import"./SortableHeader-CB04bQpR.js";import"./utils-CR52uffu.js";import"./Modal-UtoJSdsx.js";import"./index-BpOIPT8A.js";import"./index-oRNCBTNd.js";import"./Icon-B3tLlLKZ.js";import"./button-COWLJ6pg.js";import"./index-0zBpNI7D.js";import"./loading-Do60Rp8m.js";import"./modalStack-CnH0yp5t.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-BmBeKdsk.js";import"./UiClose-DUkoab9r.js";import"./FilterBar-HMDB7Tt-.js";import"./floating-ui.react-jckvp_6U.js";import"./FilterPill-DZUwr_Oy.js";import"./UiAdd-B8Q38pu8.js";import"./UiRemove-BLz0yr4p.js";import"./UiCheck-DhYKpnrE.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-D0M6Dsqs.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-BOFx2Z4i.js";import"./DateTimePicker-DO9_LcMK.js";import"./UiCalendar-CwwgVQQq.js";import"./MultiSelect-ZrAOo2Ih.js";import"./UiChevronUp-C1wF0V66.js";import"./RangeSlider-B2ER6jjc.js";import"./TimeRange-CoGb07gS.js";import"./select-BHvfh1_R.js";import"./UiWatch-DRJXrPu_.js";import"./UiArrowRight-Bgrs0HuJ.js";import"./UiSearch-Boj2CrdH.js";import"./UiFilter-Bo4XJEXi.js";import"./UiChevronRight-DdLlN4zX.js";import"./Timestamp-B4-PEz_z.js";import"./TagList-T07hHnlo.js";import"./Badge-BNmIFR_P.js";import"./HoverCard-dMfQoMwj.js";import"./Properties-DBvGhdGC.js";import"./UiZoomOut-C6-K6ZD8.js";import"./UiCopy-eq0JaBN3.js";import"./StatusDot-BMliHxIu.js";import"./UiEllipsis-BTdeu44g.js";import"./UiArrowLeft-BdasPYLC.js";import"./UiResizeVertical-8z7pjaLW.js";import"./UiRows-BbcDCWDL.js";import"./UiListFlat-BZ349C7H.js";import"./UiSun-DuMk8qZ-.js";import"./Clicky-DA7rqhq_.js";import"./suspense-BlWXgBGS.js";import"./useQuery-DkPqc4Ed.js";import"./FilterForm-DiNwlKmY.js";import"./types-BHfRQr8X.js";import"./Tree-CY6p-n4b.js";import"./TreeNode-RzQAe9Bz.js";import"./UiExpandAll-DlhUq-QE.js";import"./ObjectGraph-DgBO_OAs.js";import"./ExecutionTree-CXEeDt0X.js";import"./CodeBlock-W1JQCshF.js";import"./JsonView-CO3Gb0aC.js";import"./code-highlight-Cpz0cZcy.js";import"./RenderedStackTrace-BjG4ZXZM.js";import"./UiError-DPWyEpQu.js";import"./UiStackFrameDot-2DfrbDTr.js";import"./UiChip-4cceovwD.js";import"./UiDebugStepOver-MESADRXx.js";import"./UiMethod-BcHi_i8p.js";import"./UiCloudDownload-sgQgeTWt.js";import"./UiComment-CTQTaXOW.js";import"./UiTable-DjOkPyaD.js";import"./UiFileCode-BNd_NqzR.js";import"./UiFileSpreadsheet-CUeNqFxG.js";import"./UiMarkdown-ajGCeYxO.js";import"./UiFileText-CcO2lyAF.js";import"./UiJson-Cf48KD2z.js";import"./UiEye-CKhnrkc8.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

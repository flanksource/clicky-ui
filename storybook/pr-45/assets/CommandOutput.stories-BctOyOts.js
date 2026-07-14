import{j as r}from"./iframe-0bc176G1.js";import{C as t}from"./CommandOutput-CcLGbCB6.js";import{S as R}from"./rpc-story.fixtures-B4zXYyva.js";import"./preload-helper-D-2WW-AN.js";import"./DataTable-BRI6482v.js";import"./SortableHeader-Co06pdzF.js";import"./utils-CR52uffu.js";import"./Modal-cVEgSouU.js";import"./index-C5YvwvsX.js";import"./index-Ms4dS0uC.js";import"./Icon-LDnLk-Ec.js";import"./button-CYgJK2Rk.js";import"./index-0zBpNI7D.js";import"./loading-CJdteYdy.js";import"./modalStack-Cr8uIIEn.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-D-0oWftq.js";import"./UiClose--pfy67_V.js";import"./FilterBar-B7nfr428.js";import"./floating-ui.react-DUyav7Mf.js";import"./FilterPill-CL-GOm8e.js";import"./UiAdd-CSeQ7lzk.js";import"./UiRemove-B_03WPkl.js";import"./UiCheck-B-D4Byul.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CsSd798u.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-BuIn1m3V.js";import"./DateTimePicker-CS_YdARA.js";import"./UiCalendar-B8qIr9vT.js";import"./MultiSelect-GBceu0oG.js";import"./UiChevronUp-CM5klE9u.js";import"./RangeSlider-DPNKekT-.js";import"./TimeRange-CGnGAm1F.js";import"./select-DCHykvLz.js";import"./UiWatch-urs8z-tG.js";import"./UiArrowRight-CnNCchvd.js";import"./UiSearch-BugLSLsD.js";import"./UiFilter-E3yIdZHO.js";import"./UiChevronRight-BKM7hJC4.js";import"./Timestamp-yhCybBt4.js";import"./TagList-x-xXpMyH.js";import"./Badge-Dhw-Uqqx.js";import"./HoverCard-BwI7dmSE.js";import"./Properties-L-YOtGLV.js";import"./UiZoomOut-31OpL0xA.js";import"./UiCopy-bzWB7UWA.js";import"./StatusDot-zmrjxzWG.js";import"./UiEllipsis-pKj6fuqC.js";import"./UiArrowLeft-Cfb0qzqs.js";import"./UiResizeVertical-QgLlwnET.js";import"./UiRows-BD_hwdEV.js";import"./UiListFlat-CwifC_Mr.js";import"./UiSun-DnQgeyZk.js";import"./Clicky-COwkzBbG.js";import"./suspense-EeFNUonn.js";import"./useQuery-B4MKR6M7.js";import"./FilterForm-C6KlbBOg.js";import"./types-BHfRQr8X.js";import"./Tree-Cf6jKxdj.js";import"./TreeNode-RABQJ3eR.js";import"./UiExpandAll-CdlIxFHQ.js";import"./ObjectGraph-C5R0vwbS.js";import"./ExecutionTree-BAd_UuFq.js";import"./CodeBlock-CQO-eBku.js";import"./JsonView-aDtMPjPr.js";import"./code-highlight-xUBeaIqO.js";import"./RenderedStackTrace-CeU-p1OL.js";import"./UiError-B5Z-Ewca.js";import"./UiStackFrameDot-CsWVgVkY.js";import"./UiChip-IoxjNnUE.js";import"./UiDebugStepOver-DCVMGfrq.js";import"./UiMethod-CLVHlXLn.js";import"./UiCloudDownload-8VyeZhR8.js";import"./UiComment-BDneyrYJ.js";import"./UiTable-BZJLvdOX.js";import"./UiFileCode-BNH1U7Ul.js";import"./UiFileSpreadsheet-eSYEihEi.js";import"./UiMarkdown-BxB2glqt.js";import"./UiFileText-CsFcUXS5.js";import"./UiJson-DKbmqaP1.js";import"./UiEye-CzcklzJ5.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

import{j as r}from"./iframe-BZbOQtFx.js";import{C as t}from"./CommandOutput-VPeQQ8us.js";import{S as R}from"./rpc-story.fixtures-MfGocfRi.js";import"./preload-helper-B2wK-Kjy.js";import"./DataTable-BVH2cjRT.js";import"./SortableHeader-ipszecbO.js";import"./utils-BLSKlp9E.js";import"./Modal-DQGbUUH1.js";import"./index-DqaOm_H7.js";import"./index-C9I8SpvD.js";import"./Icon-rviauDIl.js";import"./button-w4wxkRvZ.js";import"./index-1evVQkiP.js";import"./loading-CHO2ZS0P.js";import"./modalStack-DmLqMJfC.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-DJfWjxJ6.js";import"./UiClose-LtPFrzPQ.js";import"./FilterBar-CivY_I-H.js";import"./floating-ui.react-o04l4swZ.js";import"./FilterPill-9auBVspy.js";import"./UiAdd-TnC9JzlR.js";import"./UiRemove-QYF9JrB2.js";import"./UiCheck-C1P9WR7d.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CGnQCLYC.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-H5W8lwGu.js";import"./DateTimePicker-CS-4U5cO.js";import"./UiCalendar-CstoJPkC.js";import"./MultiSelect-GknjJXEE.js";import"./UiChevronUp-DIiRnO-K.js";import"./RangeSlider-CTlFonBr.js";import"./TimeRange-mOFal-Qb.js";import"./select-BnxjSEer.js";import"./UiWatch-BA-WoygE.js";import"./UiArrowRight-B20j05dv.js";import"./UiSearch-Y4qZ2L2s.js";import"./UiFilter-VtZat-xX.js";import"./UiChevronRight-DdY5IcAB.js";import"./Timestamp-4BbMQxbz.js";import"./TagList-1I-QlhUT.js";import"./Badge-DfotIX-n.js";import"./HoverCard-BWu1QYLQ.js";import"./Properties-obBPpcYy.js";import"./UiZoomOut-BLSioKSe.js";import"./UiCopy-Dl6ysnkn.js";import"./StatusDot-dgJZWW5J.js";import"./UiEllipsis-EEwzslPi.js";import"./UiArrowLeft-ttcZP72U.js";import"./UiResizeVertical-C-hn0aix.js";import"./UiRows-CXjrhXIt.js";import"./UiListFlat-Bi5YXPGZ.js";import"./UiSun-CFzuvLZm.js";import"./Clicky-Bm1-nfbr.js";import"./suspense-D9cWIg8n.js";import"./useQuery-DWK1wCF2.js";import"./FilterForm-ATf07m7O.js";import"./types-BHfRQr8X.js";import"./Tree-Cyowz0sg.js";import"./TreeNode-CGPWxhp6.js";import"./UiExpandAll-DUAt5Qfw.js";import"./ObjectGraph-CGmRkIYC.js";import"./ExecutionTree-Cnh4yiC8.js";import"./CodeBlock-BYlaqWcv.js";import"./JsonView-DArinz3q.js";import"./code-highlight-BWXEN8UU.js";import"./RenderedStackTrace-CKnnnHzf.js";import"./UiError-Bht-_luW.js";import"./UiStackFrameDot-CSvmhROB.js";import"./UiChip-CEDFaWpx.js";import"./UiDebugStepOver-CmvEJyvN.js";import"./UiMethod-Cg6Obgcx.js";import"./UiCloudDownload-cym5ohiY.js";import"./UiComment-DD7zQPXn.js";import"./UiTable-Dvsq766I.js";import"./UiFileCode-CycGHRsO.js";import"./UiFileSpreadsheet-Cif18_Hf.js";import"./UiMarkdown-5OdgNIs2.js";import"./UiFileText-eqeEpvC6.js";import"./UiJson-CMdFkvIc.js";import"./UiEye-D8VE1PDW.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

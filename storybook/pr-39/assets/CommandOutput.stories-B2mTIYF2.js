import{j as r}from"./iframe-C96xZIdp.js";import{C as t}from"./CommandOutput-CYOifnLS.js";import{S as R}from"./rpc-story.fixtures-S62gZnA8.js";import"./preload-helper-Bg6xcDEu.js";import"./DataTable-lrGeHBOy.js";import"./SortableHeader-CdC4dvjm.js";import"./utils-CR52uffu.js";import"./Modal-zDTRg6Jm.js";import"./index-Dpw8D6A4.js";import"./index-DiVyEuZt.js";import"./Icon-DVJMtl2F.js";import"./button-CQ2Ni0n1.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./modalStack-DCQR24ar.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-Dw4GSQtd.js";import"./UiClose-BGwIaMb7.js";import"./FilterBar-CG2VCxI0.js";import"./floating-ui.react-CKpawvp6.js";import"./FilterPill-DIeK5K75.js";import"./UiAdd-C83DU42e.js";import"./UiRemove-BuRvyt0f.js";import"./UiCheck-CIVB-pM_.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BSllX8Ss.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-C4iQdycK.js";import"./DateTimePicker-DbXjKBmn.js";import"./UiCalendar-CIg23P-h.js";import"./MultiSelect-BDD0jP-w.js";import"./UiChevronUp-BsAu1rdW.js";import"./RangeSlider-hsjlRCms.js";import"./TimeRange-DrLpWg9p.js";import"./select-CTCjKWyJ.js";import"./UiWatch-fRmiXjE0.js";import"./UiArrowRight-B7VvmpXD.js";import"./UiSearch-BZaaHyu5.js";import"./UiFilter-CVbfyhzU.js";import"./UiChevronRight-BjK0IdOK.js";import"./Timestamp-BkpMkfYC.js";import"./TagList-BViTIfbl.js";import"./Badge-xx5knzsP.js";import"./HoverCard-BSvuiu55.js";import"./Properties-NBZWqWXw.js";import"./UiZoomOut-D0Nh6Gz3.js";import"./UiCopy-BkUycqZA.js";import"./StatusDot-DY_hkGXO.js";import"./UiEllipsis-CFVWm2pf.js";import"./UiArrowLeft-Dhh7ZMUF.js";import"./UiResizeVertical-RWiiQ2LE.js";import"./UiRows-DUZDGFax.js";import"./UiListFlat-Bf-DmHmq.js";import"./UiSun-BWBnXmVP.js";import"./Clicky-Dd9GfEL_.js";import"./suspense-B-vOHugz.js";import"./useQuery-Cq4XkiUA.js";import"./FilterForm-I4CDQyTt.js";import"./types-BHfRQr8X.js";import"./Tree-BjrrXmvY.js";import"./TreeNode-VujP75aE.js";import"./UiExpandAll-BNCPCMt1.js";import"./ObjectGraph-Bzp_L0Lt.js";import"./ExecutionTree-BpqPZoWX.js";import"./CodeBlock-2bG6zm5g.js";import"./JsonView-BsucjRFS.js";import"./code-highlight-CQkTewJY.js";import"./RenderedStackTrace-Daoa9oVv.js";import"./UiError-8kZ-YABM.js";import"./UiStackFrameDot-Z93aHnXF.js";import"./UiChip-C0lJU1Qr.js";import"./UiDebugStepOver-QOmAMPb6.js";import"./UiMethod-Bpn9ziEA.js";import"./UiCloudDownload-DajxFcBG.js";import"./UiComment-CE6CX5G8.js";import"./UiTable-C9l-GNfj.js";import"./UiFileCode-DiZKqSHp.js";import"./UiFileSpreadsheet-CEFTf36U.js";import"./UiMarkdown-CJyeVCvx.js";import"./UiFileText-C-8OwBMz.js";import"./UiJson-CbpYlFAx.js";import"./UiEye-D55XriX4.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

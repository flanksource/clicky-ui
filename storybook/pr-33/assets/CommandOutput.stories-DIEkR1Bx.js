import{j as r}from"./iframe-BiJjU2HO.js";import{C as t}from"./CommandOutput-TtIoz3pK.js";import{S as R}from"./rpc-story.fixtures-BMUwWB5E.js";import"./preload-helper-2oGg8WnX.js";import"./DataTable-DuwqXEFp.js";import"./SortableHeader-CrTWcrvn.js";import"./utils-BLSKlp9E.js";import"./Icon-DO6qyvlM.js";import"./use-theme-BBgKh4lJ.js";import"./Modal-BhRuVo6a.js";import"./index-Ct7BkFIG.js";import"./index-oISezv9l.js";import"./button-Bq6OtZ5-.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";import"./modalStack-CpXAXQz5.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-B-tYCWX0.js";import"./UiClose-D1zGB7Oa.js";import"./FilterBar-BvKHoZKr.js";import"./floating-ui.react-BtBEW8Wo.js";import"./FilterPill-DqddeDOo.js";import"./UiAdd-CJElNuxK.js";import"./UiRemove-mJbaqQH_.js";import"./UiCheck-r0P984Kc.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-DT8eBMld.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-e2uFe16b.js";import"./DateTimePicker-DszBGVO8.js";import"./UiCalendar-B-73cpUU.js";import"./MultiSelect-DCUMcpmc.js";import"./UiChevronUp-DV520mvX.js";import"./RangeSlider-E85wjFIU.js";import"./TimeRange-BTjpaOrP.js";import"./select-CURuYAt0.js";import"./UiWatch-CUJ8td2M.js";import"./UiArrowRight-B1Ks5-q1.js";import"./UiSearch-B6pKN-d6.js";import"./UiFilter-DtuRZhHC.js";import"./UiChevronRight-BceXzGzL.js";import"./Timestamp-PR-vLMZZ.js";import"./TagList-CikprBYd.js";import"./Badge-C5DOLWBy.js";import"./HoverCard-D-RsjCoE.js";import"./Properties-BpezNhDw.js";import"./UiZoomOut-DSISmxth.js";import"./UiCopy-Bvb4O-IS.js";import"./StatusDot-DSKq0U0o.js";import"./UiEllipsis-BDbo0zqq.js";import"./UiArrowLeft-DLcgw-6o.js";import"./UiRows-fwqRCD5_.js";import"./UiListFlat-yGYulon3.js";import"./UiSun-Ddyi75Mf.js";import"./Clicky-CxATA9xQ.js";import"./suspense-CE1kbSpp.js";import"./useQuery-CWOEtHNe.js";import"./FilterForm-Dkli9Q6H.js";import"./types-BHfRQr8X.js";import"./Tree-DLpZnTwz.js";import"./TreeNode-E6dQ7Mis.js";import"./UiExpandAll-DJU1fC9B.js";import"./CodeBlock-C392u-qc.js";import"./JsonView-DTE5YJH_.js";import"./code-highlight-CJaZvzKy.js";import"./RenderedStackTrace-uYBb4cH4.js";import"./UiError-Beql1L6O.js";import"./UiStackFrameDot-wSNayZ4C.js";import"./UiChip-Bhulc-ol.js";import"./UiDebugStepOver-CGMQG1RY.js";import"./UiMethod-GhA2KqrQ.js";import"./UiCloudDownload-DNSve1uH.js";import"./UiComment-nqCepTSi.js";import"./UiTable-DC0grity.js";import"./UiFileCode-DecQr7JE.js";import"./UiFileSpreadsheet-eeC3ICgT.js";import"./UiMarkdown-B-tspGyq.js";import"./UiFileText-DhA7wxIr.js";import"./UiJson-zNRlqYFX.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

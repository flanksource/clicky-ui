import{j as r}from"./iframe-DLWo_D3a.js";import{C as t}from"./CommandOutput-BdjlK1VJ.js";import{S as R}from"./rpc-story.fixtures-DIrlEf69.js";import"./preload-helper-D5l2DbWZ.js";import"./DataTable-C5Fbe07i.js";import"./SortableHeader-BAzYSnPc.js";import"./utils-BLSKlp9E.js";import"./Icon-DgfT7ULk.js";import"./use-theme-BlBYgeTA.js";import"./Modal-DpAM32W9.js";import"./index-Cj_FqOis.js";import"./index-BkMjoCpf.js";import"./button-lAmiuTiA.js";import"./index-1evVQkiP.js";import"./loading-Cddz8UD2.js";import"./UiFullscreen-BtydxLmv.js";import"./UiClose-DQzbchdf.js";import"./FilterBar-C2JjwXVr.js";import"./FilterPill-Dk9Gq-nH.js";import"./UiAdd-Bg5MOAnN.js";import"./UiRemove-BRQ6qbkc.js";import"./UiCheck-BqyrKFDU.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-Ci4qJ4JG.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-DxkvxAMd.js";import"./DateTimePicker-DMCJmEIz.js";import"./UiCalendar-fyNbCr8M.js";import"./MultiSelect-Q_SJQ5WL.js";import"./UiChevronUp-4-Z0vTqG.js";import"./RangeSlider-BTzfJBd7.js";import"./TimeRange-CpLJNDPD.js";import"./select-8XYtVfoA.js";import"./UiWatch-705Eq8y5.js";import"./UiArrowRight-DOyMKZJg.js";import"./UiSearch-QJF-wWR0.js";import"./UiFilter-CBX4dzu3.js";import"./UiChevronRight-BVc9CeVr.js";import"./Timestamp-ERDuYgg6.js";import"./TagList-RAes7tZm.js";import"./Badge-BmM-0e7Z.js";import"./HoverCard-DF0WemAp.js";import"./Properties-cC2CK6ON.js";import"./UiZoomOut-Bjn9hm52.js";import"./UiCopy-DWsnM1bJ.js";import"./StatusDot-BCJOb26q.js";import"./UiEllipsis-qoEKHAnN.js";import"./UiArrowLeft-B4c3Xe_I.js";import"./UiRows-BLa67nBi.js";import"./UiListFlat-D6RU4qLz.js";import"./UiSun-DACTCA4D.js";import"./Clicky-BbB9Upju.js";import"./suspense-BoRYuynD.js";import"./useQuery-zNws-MJP.js";import"./FilterForm-Ds3hgCNz.js";import"./types-BHfRQr8X.js";import"./Tree-B38rmncJ.js";import"./TreeNode-BciTDr4I.js";import"./UiExpandAll-BmJvu9pQ.js";import"./CodeBlock-18ws4pr5.js";import"./JsonView-C6cEe_kH.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-DR0xfEG6.js";import"./UiError-CppIQx9b.js";import"./UiStackFrameDot-9lz04P7r.js";import"./UiChip-GSVoJzwT.js";import"./UiDebugStepOver-BOPf2PvM.js";import"./UiMethod-GpxY8oMl.js";import"./UiCloudDownload-Bv8QYoWq.js";import"./UiComment-viIdPRRA.js";import"./UiTable-UfotpU5g.js";import"./UiFileCode-BhKBTlP8.js";import"./UiFileSpreadsheet-D5A2NVum.js";import"./UiMarkdown-Buq5dWao.js";import"./UiFileText-BM7LWYYw.js";import"./UiJson-DjPMk6de.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Fr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=e.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Gr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Gr as __namedExportsOrder,Fr as default};

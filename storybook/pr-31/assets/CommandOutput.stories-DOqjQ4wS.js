import{j as r}from"./iframe-CCq80owj.js";import{C as t}from"./CommandOutput-CPXVpjNr.js";import{S as R}from"./rpc-story.fixtures-BccuCruS.js";import"./preload-helper-ByUaG9M2.js";import"./DataTable-6pGqbOUO.js";import"./SortableHeader-B2-DxFbm.js";import"./utils-BLSKlp9E.js";import"./Icon-Cl3hQAjl.js";import"./use-theme-Cn5alX8L.js";import"./Modal-C_-ASMEm.js";import"./index-nIbAMNhx.js";import"./index-DW2b6Sux.js";import"./button-CRz4am1-.js";import"./index-1evVQkiP.js";import"./loading-NPQ1cFHI.js";import"./modalStack-BctA1mPW.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-DqU0aMCD.js";import"./UiClose-CEfh_13W.js";import"./FilterBar-CkDsUH0m.js";import"./floating-ui.react-B-mN0D-Z.js";import"./FilterPill-DbTcVJys.js";import"./UiAdd-CYeJCNQ2.js";import"./UiRemove-DnGwV74F.js";import"./UiCheck-CzE9SQC0.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-BwQ1mibW.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-_xEbLx9w.js";import"./DateTimePicker-Bsmoc2NN.js";import"./UiCalendar-DVXW9hia.js";import"./MultiSelect-ulbIKnFo.js";import"./UiChevronUp-DBUAKAfB.js";import"./RangeSlider-B4mBtToO.js";import"./TimeRange-T1kTRCiz.js";import"./select-535YrmmH.js";import"./UiWatch-C6MxFZfU.js";import"./UiArrowRight-BHIOcfZr.js";import"./UiSearch-iKyCJb1U.js";import"./UiFilter-BVVoQZWY.js";import"./UiChevronRight-DGoy-0Ov.js";import"./Timestamp-CHeWdHIs.js";import"./TagList-DKgK4Pyy.js";import"./Badge-CSV_Us7w.js";import"./HoverCard-CVXa1xCy.js";import"./Properties-CGMOc39t.js";import"./UiZoomOut-CYlEDnQj.js";import"./UiCopy-Cb-77AEs.js";import"./StatusDot-CSTe02ay.js";import"./UiEllipsis-Bbq2IPhn.js";import"./UiArrowLeft-CKXa1OC-.js";import"./UiRows-BVRSK_8n.js";import"./UiListFlat-DA80u5A5.js";import"./UiSun-D6t4Yxj1.js";import"./Clicky-CbCyiaK4.js";import"./suspense-BFxanCl4.js";import"./useQuery-Dm_Yl0h3.js";import"./FilterForm-BTUledj3.js";import"./types-BHfRQr8X.js";import"./Tree-CssqagsV.js";import"./TreeNode-9BApLtU6.js";import"./UiExpandAll-Cnto4_1f.js";import"./CodeBlock-BlXP2N0j.js";import"./JsonView-DYud3Ld4.js";import"./code-highlight-vj-DXbl2.js";import"./RenderedStackTrace-BItXARbR.js";import"./UiError-BXHLO891.js";import"./UiStackFrameDot-Cqds04OI.js";import"./UiChip-D241RSPt.js";import"./UiDebugStepOver-DzlHryXf.js";import"./UiMethod-DSqm0BiG.js";import"./UiCloudDownload-CPuFlZS5.js";import"./UiComment-DLQljwP_.js";import"./UiTable-B0-Uz3Og.js";import"./UiFileCode-CjSoDrLb.js";import"./UiFileSpreadsheet-D0o2zO4E.js";import"./UiMarkdown-lnpxYYEN.js";import"./UiFileText-BkE_TpwB.js";import"./UiJson-B9YbBYCp.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

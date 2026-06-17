import{j as r}from"./iframe-ChhGfndY.js";import{C as t}from"./CommandOutput-wxBNZtc2.js";import{S as R}from"./rpc-story.fixtures-DstQcblI.js";import"./preload-helper-D5l2DbWZ.js";import"./DataTable-CbptW96P.js";import"./SortableHeader-DyYNVPlu.js";import"./utils-BLSKlp9E.js";import"./Icon-CYeB20F_.js";import"./use-theme-Dlq9daPI.js";import"./Modal-DdpFV-bX.js";import"./index-DIRkFHAF.js";import"./index-C4HJUOxc.js";import"./button-B_Z8s8vs.js";import"./index-1evVQkiP.js";import"./loading-TLYQvG27.js";import"./UiFullscreen-C9wG_8Y-.js";import"./UiClose-DcGXWzrE.js";import"./FilterBar-BwPgayUV.js";import"./FilterPill-bgJNW4vl.js";import"./UiAdd-h1IuClyL.js";import"./UiRemove-1ki0-NK9.js";import"./UiCheck-NmGBycic.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-C0jGKp3c.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CUiVFXzA.js";import"./DateTimePicker-CsSXnIK9.js";import"./UiCalendar-CPvlgWhM.js";import"./MultiSelect-BfDlepii.js";import"./UiChevronUp-zRG4p9CL.js";import"./RangeSlider-BWkiL0FG.js";import"./TimeRange-LSxJrMLJ.js";import"./select-CAqDlAGE.js";import"./UiWatch-MrCgZBYb.js";import"./UiArrowRight-CFSaZxfG.js";import"./UiSearch-CHBRbBmR.js";import"./UiFilter-DXxmIRYq.js";import"./UiChevronRight-BnkLT8LU.js";import"./Timestamp-ChBTR5YC.js";import"./TagList-BVAtdLFX.js";import"./Badge-6893KHoo.js";import"./HoverCard-B7_P5PWB.js";import"./Properties-D_TNG4k3.js";import"./UiZoomOut-2U38Xp2I.js";import"./UiCopy-BajsyPmw.js";import"./StatusDot-CHK0R5Dk.js";import"./UiEllipsis-O5v8tcGn.js";import"./UiArrowLeft-uYj0HzhT.js";import"./UiRows-C6sOfJ_L.js";import"./UiListFlat-DiEMNcCL.js";import"./UiSun-BgGhsien.js";import"./Clicky-Cm1OJiCj.js";import"./suspense-DVStHZID.js";import"./useQuery-BLpIaRIj.js";import"./FilterForm-kMa5p6AN.js";import"./types-BHfRQr8X.js";import"./Tree-yiaNQwql.js";import"./TreeNode-CVQH1Uw-.js";import"./UiExpandAll-ClvcpyZm.js";import"./CodeBlock-BSXogfzU.js";import"./JsonView-ZSnrc377.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-Crs21faP.js";import"./UiError-N-BdXqTl.js";import"./UiStackFrameDot-CXLqIfJg.js";import"./UiChip-DaoiB19j.js";import"./UiDebugStepOver-CYYzUK1Z.js";import"./UiMethod-ve3m4zxk.js";import"./UiCloudDownload-De6JitJl.js";import"./UiComment-BXVq6rx7.js";import"./UiTable--T2LD365.js";import"./UiFileCode-DOxFhyka.js";import"./UiFileSpreadsheet-DVLikLHh.js";import"./UiMarkdown-cjxZpefk.js";import"./UiFileText-CkL29K5G.js";import"./UiJson-DDmX0iZ1.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

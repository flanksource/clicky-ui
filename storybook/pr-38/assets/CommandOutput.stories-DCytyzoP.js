import{j as r}from"./iframe-Ck5OBNy_.js";import{C as t}from"./CommandOutput-CuXFwbOx.js";import{S as R}from"./rpc-story.fixtures-iO4jkB3S.js";import"./preload-helper-C4wV90-x.js";import"./DataTable-Da_GEaII.js";import"./SortableHeader-wlB8tSfY.js";import"./utils-CR52uffu.js";import"./Modal-DBs0n7Za.js";import"./index-Dkbn_kvr.js";import"./index-BAA7PKOe.js";import"./Icon-BzT4mhZP.js";import"./button-xP_Jm0t5.js";import"./index-0zBpNI7D.js";import"./loading-D5ySMDtv.js";import"./modalStack-CJY7IwIQ.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-D2hBhWaD.js";import"./UiClose-DqLdg852.js";import"./FilterBar-5NremGFL.js";import"./floating-ui.react--Dqofk4r.js";import"./FilterPill-BG9DeJk_.js";import"./UiAdd-DbOX821o.js";import"./UiRemove-BXKLlTRF.js";import"./UiCheck-Dr2gRPmf.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-DaOCm6bo.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CirG0okf.js";import"./DateTimePicker-lewaP_7b.js";import"./UiCalendar-BCkjjOtj.js";import"./MultiSelect-Cm2n9PU0.js";import"./UiChevronUp-BpyWqZML.js";import"./RangeSlider-B57I_20v.js";import"./TimeRange-BVwitJ4w.js";import"./select-CF7B8oGv.js";import"./UiWatch-DXk9y4g8.js";import"./UiArrowRight-CnCneouz.js";import"./UiSearch-7CnN3vu1.js";import"./UiFilter-DWIYiNEJ.js";import"./UiChevronRight-U6yM_Bbw.js";import"./Timestamp-Dj99yJGE.js";import"./TagList-C8UThMqL.js";import"./Badge-D3j3jk-m.js";import"./HoverCard-CuRTg0Wr.js";import"./Properties-C8d5UQik.js";import"./UiZoomOut-bzEmMKBh.js";import"./UiCopy-BJfpAmAI.js";import"./StatusDot-BIZrqRXZ.js";import"./UiEllipsis-yzJaFUyZ.js";import"./UiArrowLeft-CMSDhpzv.js";import"./UiResizeVertical-C09zSTFC.js";import"./UiRows-BGS4FFPw.js";import"./UiListFlat-CwcpyEGE.js";import"./UiSun-C65Lu0sp.js";import"./Clicky-DOfSGq8a.js";import"./suspense-Cpimcb2Z.js";import"./useQuery-CBZtXchz.js";import"./FilterForm-2l7R8G-t.js";import"./types-BHfRQr8X.js";import"./Tree-BT2aQkQc.js";import"./TreeNode-fpLZ7HFB.js";import"./UiExpandAll-CRjq0eQ3.js";import"./ObjectGraph-D5pm4T28.js";import"./ExecutionTree-C5zQFn3W.js";import"./CodeBlock-B9RVAECS.js";import"./JsonView-DZJum6Nw.js";import"./code-highlight-CpKg2tYe.js";import"./RenderedStackTrace-cZozL1zg.js";import"./UiError-KResbSiR.js";import"./UiStackFrameDot-D3-wAQ6m.js";import"./UiChip-DiY_Jx_y.js";import"./UiDebugStepOver-2WdFZkxO.js";import"./UiMethod-BAdnhnMd.js";import"./UiCloudDownload-VMa6Ouv-.js";import"./UiComment-zloz8lS5.js";import"./UiTable-Blv6fRQN.js";import"./UiFileCode-DbMumeUL.js";import"./UiFileSpreadsheet-CgIXJMmK.js";import"./UiMarkdown-DcHSyn2I.js";import"./UiFileText-DsQ2dIeB.js";import"./UiJson-BAQr8t8B.js";import"./UiEye-DyS5Fq6T.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

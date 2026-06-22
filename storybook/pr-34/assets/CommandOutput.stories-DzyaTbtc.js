import{j as r}from"./iframe-C0Aur-Df.js";import{C as t}from"./CommandOutput-D6cEii-z.js";import{S as R}from"./rpc-story.fixtures-DTp4PaZo.js";import"./preload-helper-B4w--iqy.js";import"./DataTable-MqZqpRwB.js";import"./SortableHeader-Dy34DsRw.js";import"./utils-BLSKlp9E.js";import"./Icon-bcMubS04.js";import"./use-theme-Ck1X3j6Z.js";import"./Modal-NzWDpv-o.js";import"./index-ga98dKrt.js";import"./index-BZn3QKoH.js";import"./button-Csc3egge.js";import"./index-1evVQkiP.js";import"./loading-DvDd1lzh.js";import"./modalStack-XoAQ75vk.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-BdxvGfSP.js";import"./UiClose-ooRL-WfY.js";import"./FilterBar-DiZUP0Tk.js";import"./floating-ui.react-BfCuA5NM.js";import"./FilterPill-CLhAA8AS.js";import"./UiAdd-CXb6242w.js";import"./UiRemove-DEOaGSaO.js";import"./UiCheck-DxBSpKg0.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-Xd66bpPx.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CebnzLpn.js";import"./DateTimePicker-BVVMLmzV.js";import"./UiCalendar-r07DcjlO.js";import"./MultiSelect-DSdTnnoy.js";import"./UiChevronUp-C_aNYUjc.js";import"./RangeSlider-BKwEEVTk.js";import"./TimeRange-B27k3mZV.js";import"./select-Kna1qtZk.js";import"./UiWatch-Dh6PigGg.js";import"./UiArrowRight-BJ5tOgBB.js";import"./UiSearch-xNyNeqRZ.js";import"./UiFilter-D5ojanqO.js";import"./UiChevronRight-aprQ3K9G.js";import"./Timestamp-D9RuHVQZ.js";import"./TagList-Yk6BjZ3J.js";import"./Badge-C4gdMzkR.js";import"./HoverCard-CyrYKmq7.js";import"./Properties-C4g0l7ov.js";import"./UiZoomOut-BWSlxbQZ.js";import"./UiCopy-B5goT4eX.js";import"./StatusDot-G0N43rxA.js";import"./UiEllipsis-DeLugcuR.js";import"./UiArrowLeft-YfjE-PdR.js";import"./UiRows-Ci-r_mbZ.js";import"./UiListFlat-8Zu1ZN9m.js";import"./UiSun-DG1ARzGm.js";import"./Clicky-DcT3YEEL.js";import"./suspense-h3tQTFBA.js";import"./useQuery-CQbpNEZw.js";import"./FilterForm-v1fatQn1.js";import"./types-BHfRQr8X.js";import"./Tree-BxhKnJIs.js";import"./TreeNode-Crgj23i0.js";import"./UiExpandAll-CBrwD4oL.js";import"./ObjectGraph-BuJQXxOq.js";import"./ExecutionTree-2WrbuIsH.js";import"./CodeBlock-DyxsHuia.js";import"./JsonView-VSXCfJiC.js";import"./code-highlight-Bt3LUeeQ.js";import"./RenderedStackTrace-DOI2_g_l.js";import"./UiError-DUZExCiz.js";import"./UiStackFrameDot-D9EwScnU.js";import"./UiChip-l7GOQVuZ.js";import"./UiDebugStepOver-yLBdsOk3.js";import"./UiMethod-CE57GmHq.js";import"./UiCloudDownload-CjGUQEXj.js";import"./UiComment-lfJgP8kc.js";import"./UiTable-CYKcie0Q.js";import"./UiFileCode-JEx5VeyN.js";import"./UiFileSpreadsheet-YGBietuO.js";import"./UiMarkdown-CGV2HOht.js";import"./UiFileText-kiK2Noh6.js";import"./UiJson-CVsVB6gs.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Vr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Wr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Wr as __namedExportsOrder,Vr as default};

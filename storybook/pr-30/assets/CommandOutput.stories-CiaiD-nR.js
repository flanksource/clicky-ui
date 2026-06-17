import{j as r}from"./iframe-DIPFVygJ.js";import{C as t}from"./CommandOutput-OofNJdOW.js";import{S as R}from"./rpc-story.fixtures-Bh-7uhmQ.js";import"./preload-helper-D5l2DbWZ.js";import"./DataTable-DdYZJIDD.js";import"./SortableHeader-NGm5fQGm.js";import"./utils-BLSKlp9E.js";import"./Icon-GGxX1w_8.js";import"./use-theme-DNsJp1KI.js";import"./Modal-DBuDJXQm.js";import"./index-DlBsQ62t.js";import"./index-B6v9c5M5.js";import"./button-CQO1VsE8.js";import"./index-1evVQkiP.js";import"./loading-CYQBqqDz.js";import"./UiFullscreen-CyJySjBg.js";import"./UiClose-yIapmBvP.js";import"./FilterBar-Ckp9n0ig.js";import"./FilterPill-XrT7Ydbt.js";import"./UiAdd-D18obnW5.js";import"./UiRemove-D53CleaQ.js";import"./UiCheck-b4szA2d9.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-wy6XvADC.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-DNTWC3NQ.js";import"./DateTimePicker-CZGgb8RP.js";import"./UiCalendar-DcjHnRWA.js";import"./MultiSelect-C25BwEsv.js";import"./UiChevronUp-CUqpZEwD.js";import"./RangeSlider-CfVHl833.js";import"./TimeRange-nAOpuAQr.js";import"./select-DiUcr-h_.js";import"./UiWatch-HDuuS_ia.js";import"./UiArrowRight-D7MpGI-k.js";import"./UiSearch-BpaOP-yN.js";import"./UiFilter-DfFTl5Pp.js";import"./UiChevronRight-Dm_we9z5.js";import"./Timestamp-CLYRetyA.js";import"./TagList-DBDA5k4c.js";import"./Badge-DCBzBU8l.js";import"./HoverCard-DCscfgEz.js";import"./Properties-YKCVp_2B.js";import"./UiZoomOut-yHswpIcs.js";import"./UiCopy-DoJr9st_.js";import"./StatusDot-Bm2C1mT1.js";import"./UiEllipsis-DVboIDtr.js";import"./UiArrowLeft-Bos4tlxo.js";import"./UiRows-DN1iA5wE.js";import"./UiListFlat-BrcgwQEO.js";import"./UiSun-BpWhLYHj.js";import"./Clicky-CIjz7ze3.js";import"./suspense-CAsMkeYs.js";import"./useQuery-Bboh0Hbj.js";import"./FilterForm-C2EjpMRL.js";import"./types-BHfRQr8X.js";import"./Tree-C1b9C-MI.js";import"./TreeNode-BrUm2NJZ.js";import"./UiExpandAll-BfWALQl6.js";import"./CodeBlock-C1TiZVDe.js";import"./JsonView-D-9fHP5w.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-CFmefOOJ.js";import"./UiError-Cim_tLAs.js";import"./UiStackFrameDot-C2Q5V0KY.js";import"./UiChip-CRFRxB7-.js";import"./UiDebugStepOver-DuYhsV8D.js";import"./UiMethod-D8m9rLeE.js";import"./UiCloudDownload-DvXz59Hj.js";import"./UiComment-CoWuHGIZ.js";import"./UiTable-Ba8ZBXeN.js";import"./UiFileCode-YkU1mHeC.js";import"./UiFileSpreadsheet-D6EN6zlJ.js";import"./UiMarkdown-Dl8qPHKJ.js";import"./UiFileText-DmMB0Q0-.js";import"./UiJson-CJilLuQC.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

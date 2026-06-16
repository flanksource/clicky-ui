import{j as r}from"./iframe-C5-Xigqm.js";import{C as t}from"./CommandOutput-BOIoJIs-.js";import{S as R}from"./rpc-story.fixtures-DXsiGo_H.js";import"./preload-helper-BZuLNX-z.js";import"./DataTable-Du6h85uB.js";import"./SortableHeader-CqbOAM8e.js";import"./utils-BLSKlp9E.js";import"./Icon-B_F1F--U.js";import"./use-theme-DDsB6yS8.js";import"./Modal-BLOjTCH7.js";import"./index-CcHfWVh5.js";import"./index-BdO2_bcU.js";import"./button-E1Q476uu.js";import"./index-1evVQkiP.js";import"./loading-DE8-iriR.js";import"./UiFullscreen-BaVINs0G.js";import"./UiClose-BxxNesIi.js";import"./FilterBar-CVJb_HCy.js";import"./FilterPill-y6PoMq9d.js";import"./UiAdd-luDfhyP3.js";import"./UiRemove-oZyyniA3.js";import"./UiCheck-DqxKPHJi.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-BX_qCWa-.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-Ds2LfhvZ.js";import"./DateTimePicker-yT2zCSSO.js";import"./UiCalendar-CnY9UrFY.js";import"./MultiSelect-C-0BEwtu.js";import"./UiChevronUp-BZTDvboZ.js";import"./RangeSlider-W-pu_Bwt.js";import"./TimeRange-Cb-8ClC6.js";import"./select-CNpLwBna.js";import"./UiWatch-rsWFlTWt.js";import"./UiArrowRight-BsMKA5Fe.js";import"./UiSearch-BIfbRKbv.js";import"./UiFilter-C229r0bi.js";import"./UiChevronRight-D7fiPc35.js";import"./Timestamp-nUAB5aAG.js";import"./TagList-FtIvtcA_.js";import"./Badge-761Fm_Oj.js";import"./HoverCard-DeEXiSer.js";import"./Properties-BSiaU-dZ.js";import"./UiZoomOut-C8wsTCaS.js";import"./UiCopy-FQ47u4mQ.js";import"./StatusDot-D4yoBlMS.js";import"./UiEllipsis-B4E-aEqc.js";import"./UiArrowLeft-BQHnJZqL.js";import"./UiRows--NkBT_gx.js";import"./UiListFlat-CT_WealW.js";import"./UiSun-BfEzJFlL.js";import"./Clicky-CNmfV8Du.js";import"./suspense-CqBZhri8.js";import"./useQuery-CaeK979X.js";import"./FilterForm-phbePHyI.js";import"./types-BHfRQr8X.js";import"./Tree-dYJPSDJK.js";import"./TreeNode-BITr8b6e.js";import"./UiExpandAll-BUkSi5Yk.js";import"./CodeBlock-Cd9LD3As.js";import"./JsonView-DtztX9Wh.js";import"./code-highlight-COaL06cM.js";import"./RenderedStackTrace-DjDtLjpO.js";import"./UiError-DS1ssSvn.js";import"./UiStackFrameDot-ChIep_Cu.js";import"./UiChip-BxQZcoUU.js";import"./UiDebugStepOver-C1bT7z2U.js";import"./UiMethod-B6Rj4WFr.js";import"./UiCloudDownload-eYnu4wRE.js";import"./UiComment-BeIWRwN7.js";import"./UiTable-COwPPgcA.js";import"./UiFileCode-DSX6cUVZ.js";import"./UiFileSpreadsheet-DIgRW4-f.js";import"./UiMarkdown-BKx5OWso.js";import"./UiFileText-L1blXOi2.js";import"./UiJson-CHwhigNS.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

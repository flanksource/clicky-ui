import{j as r}from"./iframe-D5a9zzxb.js";import{C as t}from"./CommandOutput-DDel48HE.js";import{S as R}from"./rpc-story.fixtures-DOrLyibe.js";import"./preload-helper-D5l2DbWZ.js";import"./DataTable-2uu7D_zC.js";import"./SortableHeader-CUuoCTEs.js";import"./utils-BLSKlp9E.js";import"./Icon-BWpUElqS.js";import"./use-theme-CgDVYkyr.js";import"./Modal-Bjxk5zpr.js";import"./index-CuNFHwG9.js";import"./index-BSK9IxpD.js";import"./button-Bu96Zmyu.js";import"./index-1evVQkiP.js";import"./loading-C4NUXH3t.js";import"./UiFullscreen-Cwm1lkZ8.js";import"./UiClose-BjYk5SS2.js";import"./FilterBar-B2httv9u.js";import"./FilterPill-XBHUhtGj.js";import"./UiAdd-DQ1mHvnk.js";import"./UiRemove-CmufC4hZ.js";import"./UiCheck-DiisalZF.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-UOrCz26k.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-Bo5FXyFP.js";import"./DateTimePicker-DWakSSlD.js";import"./UiCalendar-ZUKx4ER7.js";import"./MultiSelect-sVtAwTmT.js";import"./UiChevronUp-BE4d1KAH.js";import"./RangeSlider-uG0eY5Rd.js";import"./TimeRange-CHh7neYJ.js";import"./select-DJRGWmtU.js";import"./UiWatch-Dp0jKIBI.js";import"./UiArrowRight-3USG3V0z.js";import"./UiSearch-DU-9aO1U.js";import"./UiFilter-DeNHrqLq.js";import"./UiChevronRight-CJIX56_E.js";import"./Timestamp-CfZvYSAN.js";import"./TagList-CVRqW6N3.js";import"./Badge-BmIv6kEm.js";import"./HoverCard-B6V_ziiO.js";import"./Properties-DDz8M0aY.js";import"./UiZoomOut-B96RrT0K.js";import"./UiCopy-Cc1SFRqt.js";import"./StatusDot-TwFgU_Z3.js";import"./UiEllipsis-CFie6Cq_.js";import"./UiArrowLeft-Cd0OTHgB.js";import"./UiRows-Bu-w09Rg.js";import"./UiListFlat-BJAn8xGW.js";import"./UiSun-C8iOi53t.js";import"./Clicky-DhBS5DbO.js";import"./suspense-DyCJ2X31.js";import"./useQuery-CUd-82WN.js";import"./FilterForm-B0tC6_Du.js";import"./types-BHfRQr8X.js";import"./Tree-DWKMlE08.js";import"./TreeNode-B2aiVGtY.js";import"./UiExpandAll-COAkGfgy.js";import"./CodeBlock-DnoU1zci.js";import"./JsonView-DdbNt3SD.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-C3CqwcAW.js";import"./UiError-B9gFtd75.js";import"./UiStackFrameDot-VlAhcWou.js";import"./UiChip-DEC7WQis.js";import"./UiDebugStepOver-vJeoM7pd.js";import"./UiMethod-Dmu6gV1d.js";import"./UiCloudDownload-Bco-yEDZ.js";import"./UiComment-w1nC5bO9.js";import"./UiTable-BB7RA_Mp.js";import"./UiFileCode-DR2_jfx4.js";import"./UiFileSpreadsheet-z5xKyiRo.js";import"./UiMarkdown-CKZEwn0F.js";import"./UiFileText-DK_Xy6td.js";import"./UiJson-CYb_yu09.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

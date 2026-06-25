import{j as r}from"./iframe-DQ9XXhpn.js";import{C as t}from"./CommandOutput-BTiJEVXF.js";import{S as R}from"./rpc-story.fixtures-BWD85c2W.js";import"./preload-helper-B2wK-Kjy.js";import"./DataTable-CSLbaPXc.js";import"./SortableHeader-BwXuUsOo.js";import"./utils-BLSKlp9E.js";import"./Modal-BFn-lGk6.js";import"./index-BDYInp2-.js";import"./index-C6GOQB4V.js";import"./Icon-OSD6-FvK.js";import"./button-CE3xxuNF.js";import"./index-1evVQkiP.js";import"./loading-ORxmrxml.js";import"./modalStack-BT1YNoec.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-Jviq6Ujl.js";import"./UiClose-D-7AUFZ5.js";import"./FilterBar-BYLw_WLS.js";import"./floating-ui.react-DaZkj6wF.js";import"./FilterPill-5nce_K9Q.js";import"./UiAdd-lGhx2fYA.js";import"./UiRemove-posUC4Fy.js";import"./UiCheck-BSaE0h4R.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CzMrWpzE.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-B2K9Ka4v.js";import"./DateTimePicker-D5R49evu.js";import"./UiCalendar-DYAYcylm.js";import"./MultiSelect-4u_h0JWg.js";import"./UiChevronUp-DlsUTLeP.js";import"./RangeSlider-DzDADHMq.js";import"./TimeRange-MD_93kyM.js";import"./select-6I3Clfwh.js";import"./UiWatch-D6tN40P_.js";import"./UiArrowRight-0x6Am8yU.js";import"./UiSearch-CUaTG5b7.js";import"./UiFilter-EDUPl7N8.js";import"./UiChevronRight-UPI-_QX2.js";import"./Timestamp-CIkN3FZw.js";import"./TagList-DfFcZru1.js";import"./Badge--_EEummt.js";import"./HoverCard-nZZP1fzj.js";import"./Properties-BQ8nE7M0.js";import"./UiZoomOut-DMnkF2NH.js";import"./UiCopy-DNYlkBko.js";import"./StatusDot-10r_aKG3.js";import"./UiEllipsis-IBzewRS5.js";import"./UiArrowLeft-CD7PUnRJ.js";import"./UiResizeVertical-BFXK344D.js";import"./UiRows-CtXYl2B1.js";import"./UiListFlat-Cefi8VX_.js";import"./UiSun-CAirZ9NI.js";import"./Clicky-Df9ViJfr.js";import"./suspense-B8NYwupZ.js";import"./useQuery-BVlkhY8p.js";import"./FilterForm-BvUWcu1F.js";import"./types-BHfRQr8X.js";import"./Tree-YOWXsJGZ.js";import"./TreeNode-MHFnUfGW.js";import"./UiExpandAll-vgziawKN.js";import"./ObjectGraph-Byn-ZFOa.js";import"./ExecutionTree-DrNgKuwP.js";import"./CodeBlock-utK5i05N.js";import"./JsonView-gXGKI-RA.js";import"./code-highlight-BWXEN8UU.js";import"./RenderedStackTrace-BBtgU_VR.js";import"./UiError-CCTPDLYu.js";import"./UiStackFrameDot-oNxmXSpb.js";import"./UiChip-B9TXRa-x.js";import"./UiDebugStepOver-cT1cE2d8.js";import"./UiMethod-ChTPSSVl.js";import"./UiCloudDownload-CrAQNQxs.js";import"./UiComment-BuYdFl1G.js";import"./UiTable-kvo-t3Ki.js";import"./UiFileCode-C7-1XAPA.js";import"./UiFileSpreadsheet-B-uaax8H.js";import"./UiMarkdown-DAziBVy9.js";import"./UiFileText-D4GUyHBu.js";import"./UiJson-pakIXXal.js";import"./UiEye-DDsMXbYU.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

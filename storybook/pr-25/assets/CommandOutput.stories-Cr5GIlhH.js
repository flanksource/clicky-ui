import{j as r}from"./iframe-Cbvd77G_.js";import{C as t}from"./CommandOutput-DaITwdwR.js";import{S as R}from"./rpc-story.fixtures-CzjKBR3K.js";import"./preload-helper-BqxgWdQg.js";import"./DataTable-MHqvf6sQ.js";import"./SortableHeader-DDoSAywH.js";import"./utils-BLSKlp9E.js";import"./Icon-BFW8T_Wy.js";import"./use-theme-DMilY4Ln.js";import"./Modal-My1cqL9J.js";import"./index-C6enXB_W.js";import"./index-vpyyAfU2.js";import"./button-BynkVuMx.js";import"./index-1evVQkiP.js";import"./loading-DWhMudIi.js";import"./UiFullscreen-ChSQaUVh.js";import"./UiClose-hgToXACD.js";import"./FilterBar-sKUr4Nql.js";import"./FilterPill-BBbrxqQM.js";import"./UiAdd-CfrVGt2D.js";import"./UiRemove-B3WDfGYf.js";import"./UiCheck-SgeGLdYC.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-AGeChSSh.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-biMgqLPN.js";import"./DateTimePicker-DD1NVngo.js";import"./UiCalendar-DP04w7c1.js";import"./MultiSelect-Bh_Y_1Wi.js";import"./UiChevronUp-7JcroIJA.js";import"./RangeSlider-Ce737iA5.js";import"./TimeRange-BADxMJcu.js";import"./select-BAZaFYj5.js";import"./UiWatch-D4pEjziG.js";import"./UiArrowRight-CLmWy8Aq.js";import"./UiSearch-L-mYgxRs.js";import"./UiFilter-CQQWIjd4.js";import"./UiChevronRight-D5OxU2R1.js";import"./Timestamp-Cg05n4aM.js";import"./TagList-DMhCgOao.js";import"./Badge-CA5p6X5V.js";import"./HoverCard-CtwQsYJQ.js";import"./Properties-C2yT1fFz.js";import"./UiZoomOut-DEwEoCV4.js";import"./UiCopy-DnIsSnWN.js";import"./StatusDot-D39Obz9g.js";import"./UiEllipsis-DM0ku58l.js";import"./UiArrowLeft-DluN9RHn.js";import"./UiRows-B0LSUfLv.js";import"./UiListFlat-DNe0Sqym.js";import"./UiSun-DRT83cEQ.js";import"./Clicky-D4IUdO0K.js";import"./suspense-CJhYjLOp.js";import"./useQuery-BxIKbuSk.js";import"./FilterForm-C1yM4od8.js";import"./types-BHfRQr8X.js";import"./Tree-nzpc5Qz0.js";import"./TreeNode-GrG4BYa3.js";import"./UiExpandAll-CmUZvg__.js";import"./CodeBlock-BY1UFq8C.js";import"./JsonView-Be8vvopU.js";import"./code-highlight-Bv7t3kgs.js";import"./RenderedStackTrace-DLaM3-HZ.js";import"./UiError-C9kXs9WN.js";import"./UiStackFrameDot-Cg9bhrSm.js";import"./UiChip-AuMEryCk.js";import"./UiDebugStepOver-QJX4wbI9.js";import"./UiMethod-D7MfyX2g.js";import"./UiCloudDownload-CBd3AO0r.js";import"./UiComment-BPQiN0qb.js";import"./UiTable-DcXv2ArX.js";import"./UiFileCode-J9rKydII.js";import"./UiFileSpreadsheet-Cc8a7CU-.js";import"./UiMarkdown-DS3hRr3o.js";import"./UiFileText-C32eQ2iG.js";import"./UiJson-BwSGoS1w.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

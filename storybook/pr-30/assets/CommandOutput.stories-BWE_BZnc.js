import{j as r}from"./iframe-arejdGqO.js";import{C as t}from"./CommandOutput-DjIn6Sg5.js";import{S as R}from"./rpc-story.fixtures-B_eNSNUE.js";import"./preload-helper-D5l2DbWZ.js";import"./DataTable-C03fDxY-.js";import"./SortableHeader-TLGmnDsd.js";import"./utils-BLSKlp9E.js";import"./Icon-C86pXtXX.js";import"./use-theme-Djf8kZQm.js";import"./Modal-BlKZi_P3.js";import"./index-D9gUFbsG.js";import"./index-Ct3z3rjV.js";import"./button-DXx6_iX5.js";import"./index-1evVQkiP.js";import"./loading-mRDMzzrx.js";import"./UiFullscreen-BRMZ-6R6.js";import"./UiClose-Bhea-P7b.js";import"./FilterBar-D8SsUxBR.js";import"./FilterPill-BF59rV-S.js";import"./UiAdd-De5NLLr5.js";import"./UiRemove-D6OtOOe_.js";import"./UiCheck-DP4n0Dhh.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-BeNV9fRC.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-BB4_FLML.js";import"./DateTimePicker-C2QsXBfw.js";import"./UiCalendar-XH-8JV2N.js";import"./MultiSelect-D65YjxjW.js";import"./UiChevronUp-8RNswt4k.js";import"./RangeSlider-B62H--WF.js";import"./TimeRange-RjEyRz2D.js";import"./select-CeQ0HxEC.js";import"./UiWatch-B8LCSRkT.js";import"./UiArrowRight-Ax2vyeH4.js";import"./UiSearch-B76p9nxi.js";import"./UiFilter-oIPOIBce.js";import"./UiChevronRight-BX96g-ES.js";import"./Timestamp-DGaXQs9p.js";import"./TagList-BSANcEov.js";import"./Badge-cBxPYW-0.js";import"./HoverCard-noaQNl07.js";import"./Properties-DOEjGBXE.js";import"./UiZoomOut-cSfd-X0b.js";import"./UiCopy-Duwy_KpN.js";import"./StatusDot-CxKtR4Ia.js";import"./UiEllipsis-BFq-8_9p.js";import"./UiArrowLeft-B9Wx-1wO.js";import"./UiRows-JiCja1Np.js";import"./UiListFlat-B_LUNfmv.js";import"./UiSun-RlFdTHD7.js";import"./Clicky-Ct8M4H5g.js";import"./suspense-B_Cq-Djq.js";import"./useQuery-CD8MMPuu.js";import"./FilterForm-Cf20lCzI.js";import"./types-BHfRQr8X.js";import"./Tree-CwRWit9o.js";import"./TreeNode-CB5A0X76.js";import"./UiExpandAll-BzrCeSla.js";import"./CodeBlock-BeCs6kre.js";import"./JsonView-Bh8s5VUw.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-DB41a0Q1.js";import"./UiError-eq_G-vIY.js";import"./UiStackFrameDot-LpXj24UA.js";import"./UiChip-CrwhQpxc.js";import"./UiDebugStepOver-B2-YUohg.js";import"./UiMethod-AfeGjUqh.js";import"./UiCloudDownload-Cz_ZFHNd.js";import"./UiComment-D-o03IYF.js";import"./UiTable-BmWV6C8-.js";import"./UiFileCode-BynDN0CE.js";import"./UiFileSpreadsheet-Y3ZNOtQv.js";import"./UiMarkdown-DBxyTkJx.js";import"./UiFileText-rbFfOenr.js";import"./UiJson-DBSq80f_.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

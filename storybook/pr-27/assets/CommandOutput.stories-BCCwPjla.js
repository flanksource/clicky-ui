import{j as r}from"./iframe-CgiBotGO.js";import{C as t}from"./CommandOutput-l2T5L4jg.js";import{S as R}from"./rpc-story.fixtures-5F2DK17S.js";import"./preload-helper-BZuLNX-z.js";import"./DataTable-CFTDVbby.js";import"./SortableHeader-C501BhNn.js";import"./utils-BLSKlp9E.js";import"./Icon-rg52Hzgd.js";import"./use-theme-D6zZPqGQ.js";import"./Modal-BTB76xdW.js";import"./index-B7O3my6h.js";import"./index-C7Hbj0B5.js";import"./button-rIJ5OB24.js";import"./index-1evVQkiP.js";import"./loading-BR3T_nuk.js";import"./UiFullscreen-Cbaflywc.js";import"./UiClose-DvAKF63o.js";import"./FilterBar-CK4z6kHP.js";import"./FilterPill-BIQ7n3ie.js";import"./UiAdd-esXMW-YU.js";import"./UiRemove-Dc79S_lX.js";import"./UiCheck-BcPqyTZE.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-DlIlFW8H.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-DJekZ8Au.js";import"./DateTimePicker-Diad1bAs.js";import"./UiCalendar-8Icz-oxm.js";import"./MultiSelect-Ce6qpGBy.js";import"./UiChevronUp-DP8lBV0R.js";import"./RangeSlider-D-Wgf_3G.js";import"./TimeRange-XR3G3pmL.js";import"./select-DrGf-CJB.js";import"./UiWatch-DI1gX6jm.js";import"./UiArrowRight-CD_NQck7.js";import"./UiSearch-Cp2B0hwu.js";import"./UiFilter-C_wz51TD.js";import"./UiChevronRight-Dxyp12VE.js";import"./Timestamp-BtSW8C5k.js";import"./TagList-WGfCu7Yw.js";import"./Badge-C3OiLKVv.js";import"./HoverCard-CP8uanH7.js";import"./Properties-D_n3fOSI.js";import"./UiZoomOut-Ba4-wMS0.js";import"./UiCopy-DSDLrxfQ.js";import"./StatusDot-BPBHcT_z.js";import"./UiEllipsis-YPGt6roP.js";import"./UiArrowLeft-B5P1qB4Q.js";import"./UiRows-BJLfqgMU.js";import"./UiListFlat-DVdEEjhF.js";import"./UiSun-BhqFerQ6.js";import"./Clicky-fLaDlEhg.js";import"./suspense-BGsmxbs2.js";import"./useQuery-25WMY6Ou.js";import"./FilterForm-BRQiEdJv.js";import"./types-BHfRQr8X.js";import"./Tree-CdwzR_gH.js";import"./TreeNode-C_ecePck.js";import"./UiExpandAll-Bm_N8Q-6.js";import"./CodeBlock-Dv7R77F9.js";import"./JsonView-C6ld4qEF.js";import"./code-highlight-COaL06cM.js";import"./RenderedStackTrace-Ctsqi5Wn.js";import"./UiError-BWAMKjwZ.js";import"./UiStackFrameDot-Bz_f2Lfl.js";import"./UiChip-Ckx3M430.js";import"./UiDebugStepOver-DyXCE1OJ.js";import"./UiMethod-BLhS6G2R.js";import"./UiCloudDownload-CjOR65fU.js";import"./UiComment-j3e5Er5g.js";import"./UiTable-nRNtZZ-3.js";import"./UiFileCode-DuFGg5tC.js";import"./UiFileSpreadsheet-IPUDpjIr.js";import"./UiMarkdown-DnP5Zxgc.js";import"./UiFileText-SSENjhdc.js";import"./UiJson-C_B4v4hn.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

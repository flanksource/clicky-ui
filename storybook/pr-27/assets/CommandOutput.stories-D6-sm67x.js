import{j as r}from"./iframe-BpjD9CLN.js";import{C as t}from"./CommandOutput-DyQrG0CW.js";import{S as R}from"./rpc-story.fixtures-CnrkuU6_.js";import"./preload-helper-BZuLNX-z.js";import"./DataTable-aJCvDKXc.js";import"./SortableHeader-CHJoKncB.js";import"./utils-BLSKlp9E.js";import"./Icon-CNN2zWKh.js";import"./use-theme-Dt8rn6t3.js";import"./Modal-6qvW4oi0.js";import"./index-BxQNeFIv.js";import"./index-CrCBJNmZ.js";import"./button-CIXvgs_R.js";import"./index-1evVQkiP.js";import"./loading-BFNT0xXo.js";import"./UiFullscreen-BTTBFG7I.js";import"./UiClose-BwLRY-vt.js";import"./FilterBar-xi3_DyId.js";import"./FilterPill-iA_aPjBV.js";import"./UiAdd-CtjghQ6A.js";import"./UiRemove-BT_GYdBE.js";import"./UiCheck-CGh5Toro.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-W0lG8xAJ.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-CXwzuEer.js";import"./DateTimePicker-BpTlx7mL.js";import"./UiCalendar-Dbxy1A6K.js";import"./MultiSelect-BjzO3xih.js";import"./UiChevronUp-DckjZZci.js";import"./RangeSlider-B-RePQ39.js";import"./TimeRange-CUoI0PUB.js";import"./select-DPbPAmN8.js";import"./UiWatch-Cv_9wcSC.js";import"./UiArrowRight-CWU2qTHI.js";import"./UiSearch-Ch5shdTH.js";import"./UiFilter-DYNsd5s4.js";import"./UiChevronRight-C3A2w5Ki.js";import"./Timestamp-DfPsMmbC.js";import"./TagList-BXaZpgx-.js";import"./Badge-CVvhPATZ.js";import"./HoverCard-Cm_Eya8j.js";import"./Properties-7vw0xloI.js";import"./UiZoomOut-Cgt1Bz2f.js";import"./UiCopy-wcnG9Pa-.js";import"./StatusDot-C4_8Dqch.js";import"./UiEllipsis-C1u9biOa.js";import"./UiArrowLeft-DePkLXBh.js";import"./UiRows-wu9l_eFA.js";import"./UiListFlat-Bjxa8g3J.js";import"./UiSun-Bst4-zhk.js";import"./Clicky-CslaiHpJ.js";import"./suspense-BcF_e3BQ.js";import"./useQuery-DTOfGRsp.js";import"./FilterForm-C0Tel0t2.js";import"./types-BHfRQr8X.js";import"./Tree-Dc47lyLJ.js";import"./TreeNode-8CUy_GHf.js";import"./UiExpandAll-CrlZT3ot.js";import"./CodeBlock-D5iugc7o.js";import"./JsonView-Bj0stOed.js";import"./code-highlight-COaL06cM.js";import"./RenderedStackTrace-G85NM2pQ.js";import"./UiError-WVe1cNx-.js";import"./UiStackFrameDot-DNaQM4l0.js";import"./UiChip-CFOndxoO.js";import"./UiDebugStepOver-4Jg7pecV.js";import"./UiMethod-uvsb3cK1.js";import"./UiCloudDownload-rTch25vg.js";import"./UiComment-Bs7P05ln.js";import"./UiTable-DhcPm90R.js";import"./UiFileCode-Cx-Lvd2B.js";import"./UiFileSpreadsheet-BEVkoPiT.js";import"./UiMarkdown-D8OFDBIN.js";import"./UiFileText-DgJnC5aE.js";import"./UiJson-C-YgvSkI.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

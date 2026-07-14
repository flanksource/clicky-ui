import{j as r}from"./iframe-eDlYjoH5.js";import{C as o}from"./CommandOutput-vDFUDTNY.js";import{S as R}from"./rpc-story.fixtures-CqpDJb_Y.js";import"./preload-helper-CLp6iKya.js";import"./DataTable-CmD421NL.js";import"./SortableHeader-y_FDOYYP.js";import"./utils-CR52uffu.js";import"./loading-D50h1WC6.js";import"./router-D2rjODDU.js";import"./Modal-C7_T2hSV.js";import"./index-OymLTcEH.js";import"./index-DByclPvL.js";import"./Icon-BHMfoUD6.js";import"./button-TkF7cYFQ.js";import"./index-0zBpNI7D.js";import"./modalStack-XGqVo3yi.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BGQaRVE1.js";import"./floating-ui.react-B6g9v0n-.js";import"./FilterPill-BUeMmy_c.js";import"./Combobox-95MPZkxJ.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CBRVsMuf.js";import"./MultiSelect-BbwKyMc5.js";import"./RangeSlider-ZbGTaZhQ.js";import"./TimeRange-D8yGc_jl.js";import"./select-B_TZkcmm.js";import"./Timestamp-C_d1Xnoa.js";import"./TagList-DxY9gb9L.js";import"./Badge-CfUkefEX.js";import"./HoverCard-DhkzU_5g.js";import"./Properties-N_dNnOpV.js";import"./IconButton-BrbW5ptJ.js";import"./DropdownMenu-B_V_iUpj.js";import"./DropdownMenuSubmenu-CNeXOTcm.js";import"./StatusDot-CTLJuC1-.js";import"./Clicky-Cp9xzbOQ.js";import"./suspense-Cf4ZH86R.js";import"./useQuery-tgYnNjFI.js";import"./FilterForm-DpJVMpYN.js";import"./types-BHfRQr8X.js";import"./Tree-DSjLbUrT.js";import"./TreeNode-DK_NfVsW.js";import"./ObjectGraph-NV5p49bu.js";import"./ExecutionTree-Cj7Zofrd.js";import"./CodeBlock-BkWjGt69.js";import"./CodeDiff-dhIRU4w9.js";import"./SegmentedControl-QQ5h10-L.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-CFHjkB2F.js";import"./RenderedStackTrace-CscZ5Wcu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},vr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(i=t.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Nr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,Nr as __namedExportsOrder,vr as default};

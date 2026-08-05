import{j as r}from"./iframe-CE2JtCgn.js";import{C as o}from"./CommandOutput-B6ooGAMK.js";import{S as R}from"./rpc-story.fixtures-uNONtVo1.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-DQ4PMj40.js";import"./SortableHeader-C8pZ0Vo6.js";import"./utils-CR52uffu.js";import"./loading-DaW8GI3d.js";import"./Modal-CJiOxX6Q.js";import"./index-CnTEniBU.js";import"./index-srCuUkvt.js";import"./Icon-DjK-Ul0P.js";import"./button-BEhds32p.js";import"./index-0zBpNI7D.js";import"./modalStack-BL3nM1Er.js";import"./zIndex-CigQ76av.js";import"./FilterBar-CAooZ0SJ.js";import"./floating-ui.react-ELsBZOw-.js";import"./FilterPill-DiI-02-u.js";import"./Combobox-CaLzLYqA.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BHjZd-OU.js";import"./MultiSelect-CVJ_Jxdl.js";import"./RangeSlider-B7gA4X4U.js";import"./TimeRange-Clbh5IDG.js";import"./select-BZVoamS3.js";import"./Timestamp-BPFyRG9V.js";import"./TagList-B3vTTNhF.js";import"./Badge-B8O05GgR.js";import"./HoverCard-CbfDAnuQ.js";import"./Properties-DMRl3bQ3.js";import"./IconButton-Ah1g94v2.js";import"./DropdownMenu--w6T23IX.js";import"./DropdownMenuSubmenu-BK-eDIsx.js";import"./StatusDot-z-KLAj4n.js";import"./Clicky-Bf1TEqYV.js";import"./queryClient-DqZqDbYV.js";import"./suspense-CSCGZmYT.js";import"./mutation-CKHmOOtE.js";import"./useQuery-UrK3VKKx.js";import"./FilterForm-CNDlh9ro.js";import"./types-BHfRQr8X.js";import"./Tree-D6pXoGN1.js";import"./TreeNode-LZON3DBi.js";import"./ObjectGraph-DaJB82Jk.js";import"./ExecutionTree-TeSohCj4.js";import"./CodeBlock-CThbLAkF.js";import"./CodeDiff-Ln_4tNVx.js";import"./SegmentedControl-DjW1Xg5k.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BCvz4_-8.js";import"./RenderedStackTrace-BO3UmP3M.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Nr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Tr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,Tr as __namedExportsOrder,Nr as default};

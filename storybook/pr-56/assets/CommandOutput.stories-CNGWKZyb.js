import{j as r}from"./iframe-DbCl_ZTc.js";import{C as o}from"./CommandOutput-feKBR5Wj.js";import{S as R}from"./rpc-story.fixtures-_FMOG3sB.js";import"./preload-helper-DArPGhL4.js";import"./DataTable-DQIymBl3.js";import"./SortableHeader-eMlYHJ5N.js";import"./utils-CR52uffu.js";import"./loading-BASxxKF3.js";import"./Modal-3wB0or_4.js";import"./index-urVF_qKJ.js";import"./index-Bq5CuWor.js";import"./Icon-BLEFF23r.js";import"./button-BvGBn064.js";import"./index-0zBpNI7D.js";import"./modalStack-B2V66lx-.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BYhRnWJj.js";import"./floating-ui.react-313NX-TC.js";import"./FilterPill-CVVFT24Z.js";import"./Combobox-C2rzPzXv.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BvFsbWGJ.js";import"./MultiSelect-BNwAQUJd.js";import"./RangeSlider-yU88yNcV.js";import"./TimeRange-Bcw8QHXU.js";import"./select-UO943AEq.js";import"./Timestamp-C9WxEPW0.js";import"./TagList-jaf31Uiz.js";import"./Badge-nvGMoKaP.js";import"./HoverCard-BpHpCleG.js";import"./Properties-CbOzvvi9.js";import"./IconButton-MJ3VTsFV.js";import"./DropdownMenu-Bxittvr2.js";import"./DropdownMenuSubmenu-Btp3LiIs.js";import"./StatusDot-D2q892cL.js";import"./Clicky-D9kxTkRm.js";import"./queryClient-tJ5FoUpn.js";import"./suspense-D8TNy2Tz.js";import"./useQuery-D9Fx9ad_.js";import"./FilterForm-CQ32GOGE.js";import"./types-BHfRQr8X.js";import"./Tree-BRCvi3ph.js";import"./TreeNode-BvmJGGz3.js";import"./ObjectGraph-BnMbDX89.js";import"./ExecutionTree-oTPwvF-S.js";import"./CodeBlock-CYIm8dzw.js";import"./CodeDiff-CZDvhF2I.js";import"./SegmentedControl-BGoHx-bY.js";import"./code-highlight-eGaMz-TS.js";import"./JsonView-BxNHEBzp.js";import"./RenderedStackTrace-C0NbV1lQ.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

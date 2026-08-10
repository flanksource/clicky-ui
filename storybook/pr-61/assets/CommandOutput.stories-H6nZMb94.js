import{j as r}from"./iframe-B4Jlte7j.js";import{C as o}from"./CommandOutput-CpaVUoxA.js";import{S as R}from"./rpc-story.fixtures-CXl3QDvv.js";import"./preload-helper-DEXbRKRX.js";import"./DataTable-DHtOPi1X.js";import"./SortableHeader-DK25xte0.js";import"./utils-CR52uffu.js";import"./loading-DeD_1Din.js";import"./Modal-DmjECvH_.js";import"./index-pMrG7UvS.js";import"./index-DVtcdygO.js";import"./Icon-CmsFmOUo.js";import"./button-Cz-uT3Xg.js";import"./index-0zBpNI7D.js";import"./modalStack-rtvhmXFS.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CvtXpTid.js";import"./floating-ui.react-C3GZwCXD.js";import"./FilterPill-xBbW0bsO.js";import"./Combobox-s1oGg2-B.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-KbMxgN18.js";import"./MultiSelect-C-DTaW6u.js";import"./RangeSlider-Ck23kCpB.js";import"./TimeRange-BQLekFm7.js";import"./select-BsZV6TxH.js";import"./Timestamp-B6AsSf9u.js";import"./TagList-CGntswbT.js";import"./Badge-BOuo3IQR.js";import"./HoverCard-zOCC4a_e.js";import"./Properties-CNxCP6uX.js";import"./IconButton-MSIQ6k2l.js";import"./DropdownMenu-Bq1HhKbq.js";import"./DropdownMenuSubmenu-B3adKdY1.js";import"./StatusDot-BWFmgJm9.js";import"./Clicky-g8WFZZ9P.js";import"./queryClient-61RepQW5.js";import"./suspense-CdWG8kwC.js";import"./useQuery-m0Vo8_9Z.js";import"./FilterForm-0GnJXkRl.js";import"./types-BHfRQr8X.js";import"./Tree-DvMZ21in.js";import"./TreeNode-CYiP4Jtc.js";import"./ObjectGraph-CS7SNEgR.js";import"./ExecutionTree-XjcvTCPP.js";import"./CodeBlock-DckRFgZF.js";import"./CodeDiff-BMTxEEVV.js";import"./SegmentedControl-DJgeaIPA.js";import"./code-highlight--PIzQ-Ck.js";import"./JsonView-ClRMHfyU.js";import"./RenderedStackTrace-DBHp8fGZ.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

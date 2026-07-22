import{j as r}from"./iframe-BNCeWgcu.js";import{C as o}from"./CommandOutput-rUYu6hgp.js";import{S as R}from"./rpc-story.fixtures-CbpUZc4-.js";import"./preload-helper-bXXPlA_x.js";import"./DataTable-C41GWpiJ.js";import"./SortableHeader-D8a35-1X.js";import"./utils-CR52uffu.js";import"./loading-rjHsK5dJ.js";import"./router-BiTWENk2.js";import"./Modal-DatlSjiR.js";import"./index-BXGXqK8-.js";import"./index-CNjQCV-Z.js";import"./Icon-BG-3MSKK.js";import"./button-D5bd58An.js";import"./index-0zBpNI7D.js";import"./modalStack-ShjS88M0.js";import"./zIndex-CigQ76av.js";import"./FilterBar-DMuatUUL.js";import"./floating-ui.react-DhK2BpkP.js";import"./FilterPill-BobDGnvZ.js";import"./Combobox-CSVSwpKH.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BCceJw50.js";import"./MultiSelect-CQ0eXqC8.js";import"./RangeSlider-DcX3s6Pl.js";import"./TimeRange-QyDMv2Jo.js";import"./select-CKaG3zFO.js";import"./Timestamp-C6rq3BDG.js";import"./TagList-CGt4QCE9.js";import"./Badge-BH3_53o-.js";import"./HoverCard-BWeK8Dks.js";import"./Properties-52GTxLC9.js";import"./IconButton-iaw4ibV7.js";import"./DropdownMenu-75zLwNH9.js";import"./DropdownMenuSubmenu-CsmY2uw_.js";import"./StatusDot-JpriBq6V.js";import"./Clicky-D03FGBgw.js";import"./suspense-CZD6_7fV.js";import"./useQuery-D00oQroC.js";import"./FilterForm-GcntckrV.js";import"./types-BHfRQr8X.js";import"./Tree-DHaotNnM.js";import"./TreeNode-DldMhs3r.js";import"./ObjectGraph-DqzOchK7.js";import"./ExecutionTree-B3xU_RL1.js";import"./CodeBlock-DqUnA8Xg.js";import"./CodeDiff-CfCsFqZz.js";import"./SegmentedControl-CtpPh8Tw.js";import"./code-highlight-CMJcRcOY.js";import"./JsonView-B1OjRm7w.js";import"./RenderedStackTrace-DpHx93sO.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

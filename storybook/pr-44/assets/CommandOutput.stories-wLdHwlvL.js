import{j as r}from"./iframe-BK7fwFVO.js";import{C as o}from"./CommandOutput-DgXVsvwE.js";import{S as R}from"./rpc-story.fixtures-Ssz-0bZV.js";import"./preload-helper-CLp6iKya.js";import"./DataTable-LMknVRp3.js";import"./SortableHeader-DA-U7gZG.js";import"./utils-CR52uffu.js";import"./loading-BztHiUUa.js";import"./router-uBAxT-6M.js";import"./Modal-L0nIPibr.js";import"./index-V9FlwRvu.js";import"./index-DVBV8i_H.js";import"./Icon-Cpi1U54P.js";import"./button-DS4U28PS.js";import"./index-0zBpNI7D.js";import"./modalStack-CjOkifgI.js";import"./zIndex-CigQ76av.js";import"./FilterBar-DV6caApW.js";import"./floating-ui.react-BL5nOemE.js";import"./FilterPill-B5hPcLLg.js";import"./Combobox-DCYTyLTI.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DBzV17pY.js";import"./MultiSelect-zI3Y2P5q.js";import"./RangeSlider-DBFppoNm.js";import"./TimeRange-DYJJaAnO.js";import"./select-D-m8DqrR.js";import"./Timestamp-DelhVuZM.js";import"./TagList-C0Ci8sg4.js";import"./Badge-XzN9bViS.js";import"./HoverCard-CDlOtfM7.js";import"./Properties-Bt7pawV3.js";import"./IconButton-ChMresRY.js";import"./DropdownMenu-DdTklBUI.js";import"./DropdownMenuSubmenu-cYb_KbbW.js";import"./StatusDot-D0V8uoBU.js";import"./Clicky-COPmvnnA.js";import"./suspense-DXYiKKoj.js";import"./useQuery-BgG-ytUO.js";import"./FilterForm-DdjQ7OdZ.js";import"./types-BHfRQr8X.js";import"./Tree-Bc__1QSo.js";import"./TreeNode-BnV1ej7P.js";import"./ObjectGraph-BCsjxhAj.js";import"./ExecutionTree-DBL-AsDp.js";import"./CodeBlock-uBm2JK41.js";import"./CodeDiff-CVe5jhFr.js";import"./SegmentedControl-B4nMRczM.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-D2jKV3Rg.js";import"./RenderedStackTrace-BVW8i3Ur.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

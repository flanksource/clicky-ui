import{j as r}from"./iframe-CO2OWIcl.js";import{C as o}from"./CommandOutput-CWdzhmug.js";import{S as R}from"./rpc-story.fixtures-D2w_4_4-.js";import"./preload-helper-DArPGhL4.js";import"./DataTable-BrunOdUo.js";import"./SortableHeader-NKlwzOpW.js";import"./utils-CR52uffu.js";import"./loading-DwsLYBnU.js";import"./Modal--FwZ0JK0.js";import"./index-AY2VqcVr.js";import"./index-C_7VCUmk.js";import"./Icon-Ca6C5XSP.js";import"./button-Bu_B8JVi.js";import"./index-0zBpNI7D.js";import"./modalStack-95CCirY1.js";import"./zIndex-CigQ76av.js";import"./FilterBar-DcWg-25O.js";import"./floating-ui.react-ur1ggk9d.js";import"./FilterPill-DzFH1rjp.js";import"./Combobox-Cr1q8vF4.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Dp9pfzk5.js";import"./MultiSelect-Dv3t1vnK.js";import"./RangeSlider-Dy841O8G.js";import"./TimeRange-Cl-gcDPs.js";import"./select-Dbmz5xyR.js";import"./Timestamp-ZNzfkKGT.js";import"./TagList-CFSf4mOC.js";import"./Badge-D-psD5oA.js";import"./HoverCard-QcliMvWD.js";import"./Properties-_5vvA_L7.js";import"./IconButton-DjVQfPc4.js";import"./DropdownMenu-QnXTd0FN.js";import"./DropdownMenuSubmenu-DK7w7Yyk.js";import"./StatusDot-DHs18AaV.js";import"./Clicky-CCfKVesb.js";import"./queryClient-Cy1qTPzc.js";import"./suspense-DVgqdN32.js";import"./useQuery-CCDeEIXf.js";import"./FilterForm-CPxyBzyo.js";import"./types-BHfRQr8X.js";import"./Tree-BBPf-Zpr.js";import"./TreeNode-B5bD_jCA.js";import"./ObjectGraph-D1YkdxLG.js";import"./ExecutionTree-CdxlOodA.js";import"./CodeBlock-B-QcEeJq.js";import"./CodeDiff-CMuLnFy2.js";import"./SegmentedControl-D2_CFqN5.js";import"./code-highlight-eGaMz-TS.js";import"./JsonView-BdIcH9Xw.js";import"./RenderedStackTrace-b4QqQsCu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

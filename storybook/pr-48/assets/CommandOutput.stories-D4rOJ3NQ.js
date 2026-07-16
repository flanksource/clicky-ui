import{j as r}from"./iframe-DZjrDtfA.js";import{C as o}from"./CommandOutput-BLjIUx1S.js";import{S as R}from"./rpc-story.fixtures-Co9HJwrj.js";import"./preload-helper-Oo3FbLQe.js";import"./DataTable-D2n48LDW.js";import"./SortableHeader-5EXrAdh1.js";import"./utils-CR52uffu.js";import"./loading-a5_GCoqM.js";import"./router-lezXlkrA.js";import"./Modal-99_ihVru.js";import"./index-coyF4k5V.js";import"./index-CsAlP4At.js";import"./Icon-Bsqx4eJf.js";import"./button-DQWpMsGM.js";import"./index-0zBpNI7D.js";import"./modalStack-Bn-Y8SXM.js";import"./zIndex-CigQ76av.js";import"./FilterBar-CW1eOzLt.js";import"./floating-ui.react-BnZ_f669.js";import"./FilterPill-Cwi1F3kv.js";import"./Combobox-DdjBj_WF.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CKw4GH3i.js";import"./MultiSelect-c93OBklZ.js";import"./RangeSlider-Cg0UE0PC.js";import"./TimeRange-CCp0VoXg.js";import"./select-BaHHSCJq.js";import"./Timestamp-8CghDxJx.js";import"./TagList-CjilgoBT.js";import"./Badge-BZTuCV2v.js";import"./HoverCard-CE96ocNo.js";import"./Properties-T41OCTrb.js";import"./IconButton-0d3C3Af8.js";import"./DropdownMenu-_sTyO-3c.js";import"./DropdownMenuSubmenu-CMc0MKxS.js";import"./StatusDot-38LlF-Bh.js";import"./Clicky-EMCQz2us.js";import"./suspense-BbvZCI6B.js";import"./useQuery-BUvHNDFT.js";import"./FilterForm-BaHuv9ub.js";import"./types-BHfRQr8X.js";import"./Tree-Dm3_7lzl.js";import"./TreeNode-BI-hoPnH.js";import"./ObjectGraph-BFWcK7U0.js";import"./ExecutionTree-B91GcR-u.js";import"./CodeBlock-DhO3O6GM.js";import"./CodeDiff-KiY1tsQP.js";import"./SegmentedControl-BPu017dM.js";import"./code-highlight-_bSslaKA.js";import"./JsonView-2jImuBaZ.js";import"./RenderedStackTrace-DBxJfc7q.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

import{j as r}from"./iframe-Bgk3VXOW.js";import{C as o}from"./CommandOutput-f0M_39yf.js";import{S as R}from"./rpc-story.fixtures-DDJGDmWj.js";import"./preload-helper-Bf5WtrwG.js";import"./DataTable-ahMqYU47.js";import"./SortableHeader-DbXAePPj.js";import"./utils-CR52uffu.js";import"./loading-Ca_u5eab.js";import"./router-C0ckaxEg.js";import"./Modal-CoGbf5Ro.js";import"./index-BxsRBbWg.js";import"./index-qy9C2YxN.js";import"./Icon-CrjeG2Lq.js";import"./button-Do2TfxzH.js";import"./index-0zBpNI7D.js";import"./modalStack-CjxOIcWR.js";import"./zIndex-CigQ76av.js";import"./FilterBar-DiStQ1ks.js";import"./floating-ui.react-DuiyIls4.js";import"./FilterPill-BZfBvW5k.js";import"./Combobox-DFPXmVRc.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DvXUrLTH.js";import"./MultiSelect-HtOBhetT.js";import"./RangeSlider-D_0C5O-K.js";import"./TimeRange-Cyonp-uX.js";import"./select-D_4Q_siO.js";import"./Timestamp-DYj4LWyI.js";import"./TagList-BqCrUWL9.js";import"./Badge-Ctc5Mj1W.js";import"./HoverCard-DBS3lUNc.js";import"./Properties-J4eJPdBN.js";import"./IconButton-HBJAiqlL.js";import"./DropdownMenu-Bwtv-ieK.js";import"./DropdownMenuSubmenu-CYU1UHng.js";import"./StatusDot-5Yyuz_Ba.js";import"./Clicky-gkKihpcv.js";import"./suspense-c_sQ3_nk.js";import"./useQuery-BDwnRTWq.js";import"./FilterForm-Cv0aX1Hk.js";import"./types-BHfRQr8X.js";import"./Tree-RqTU-oxb.js";import"./TreeNode-D94eUgqt.js";import"./ObjectGraph-4y_-Yqv_.js";import"./ExecutionTree-u96EPg_h.js";import"./CodeBlock-SUrPfG3E.js";import"./CodeDiff-C-sUsV8G.js";import"./SegmentedControl-DeKftUCP.js";import"./code-highlight-CeGq7v9V.js";import"./JsonView-DyE7XmzB.js";import"./RenderedStackTrace-zrPDTwz9.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

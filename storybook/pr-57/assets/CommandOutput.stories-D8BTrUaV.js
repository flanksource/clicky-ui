import{j as r}from"./iframe-DuxeFE6n.js";import{C as o}from"./CommandOutput-C-Uj_2Fv.js";import{S as R}from"./rpc-story.fixtures-DqTnjmZn.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-BkIvI7hy.js";import"./SortableHeader-BhsK1IKi.js";import"./utils-CR52uffu.js";import"./loading-DDRbwKIs.js";import"./Modal-sB55LhdE.js";import"./index-B9gwVplk.js";import"./index-D3frbI1a.js";import"./Icon-xkfjMf_e.js";import"./button-DFfwSoCK.js";import"./index-0zBpNI7D.js";import"./modalStack-CIISi3gp.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CQ-m2fhr.js";import"./floating-ui.react-Ci4YBj6F.js";import"./FilterPill-CG8H2m7X.js";import"./Combobox-9g_A6MkL.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DxXwFRzS.js";import"./MultiSelect-CkZbioWA.js";import"./RangeSlider-CFl0p9I5.js";import"./TimeRange-s1i7R8mc.js";import"./select-DTEylNDD.js";import"./Timestamp-NpNHq9Lp.js";import"./TagList-BsrG1RlY.js";import"./Badge-TRQq4Kin.js";import"./HoverCard-De6_pK-Q.js";import"./Properties-gm_XsF1U.js";import"./IconButton-_OyxH9XU.js";import"./DropdownMenu-C_LZD4ok.js";import"./DropdownMenuSubmenu-xv77J2eN.js";import"./StatusDot-CA2lF7iJ.js";import"./Clicky-BGEXQeRS.js";import"./queryClient-BLtQkcaw.js";import"./suspense-DoVcXfUW.js";import"./useQuery-BCcvofrx.js";import"./FilterForm-BGrqhfWI.js";import"./types-BHfRQr8X.js";import"./Tree-BPq_dYhr.js";import"./TreeNode-Dtkc0Vqw.js";import"./ObjectGraph-DHkGjzdM.js";import"./ExecutionTree-BLMLRFr7.js";import"./CodeBlock-CozmWCQs.js";import"./CodeDiff-Bz4ANvib.js";import"./SegmentedControl-Cc5KEiB0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-DddqulwK.js";import"./RenderedStackTrace-BXKmcE41.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

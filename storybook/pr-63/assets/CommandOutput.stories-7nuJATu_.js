import{j as r}from"./iframe-Cr-FkDEs.js";import{C as o}from"./CommandOutput-BtAXTDTG.js";import{S as R}from"./rpc-story.fixtures-wzdlwWAk.js";import"./preload-helper-Bz0j3TbD.js";import"./DataTable-Coqas7Cp.js";import"./SortableHeader-ByDB-Fck.js";import"./utils-CR52uffu.js";import"./loading-CKGAX9p1.js";import"./Modal-DAxtETs9.js";import"./index-CZGmL05H.js";import"./index-DE_cDvZT.js";import"./Icon-D4-4O73G.js";import"./button-BIMW_edl.js";import"./index-0zBpNI7D.js";import"./modalStack-CxrbjVR6.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CHwCqwBI.js";import"./floating-ui.react-D2O3t5CC.js";import"./FilterPill-mf-mv3ck.js";import"./Combobox-CHlccKiM.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-C6_EFGUM.js";import"./MultiSelect-CVk_HtHp.js";import"./RangeSlider-QpHMxvzT.js";import"./TimeRange-4864UDs-.js";import"./select-D6Nf1EHd.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-DJfGAyrQ.js";import"./TagList-k2BN3yd3.js";import"./Badge-Zm2scJNv.js";import"./HoverCard-CAScCkav.js";import"./Properties-2H-YgSMb.js";import"./IconButton-DnG7YAiT.js";import"./DropdownMenu-J3cpbvJi.js";import"./DropdownMenuSubmenu-FzQnMbXI.js";import"./StatusDot-_mX0yOq3.js";import"./Clicky-Ds6yK2Yk.js";import"./queryClient-CO3Sniy5.js";import"./suspense-oavUJO1E.js";import"./useQuery-D0Kp4SmY.js";import"./FilterForm-D-bbAVCY.js";import"./formMetadata-BxuziiM3.js";import"./types-BHfRQr8X.js";import"./Tree-CdW_JhYF.js";import"./TreeNode-DfgtrsAC.js";import"./ObjectGraph-ql1nVlUh.js";import"./ExecutionTree-B3QlfY8t.js";import"./CodeBlock-DG47LY8m.js";import"./CodeDiff-C-sZi4pl.js";import"./SegmentedControl-6bGXsPAd.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-BzbndhAs.js";import"./RenderedStackTrace-C5d5l4tS.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Tr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const yr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,yr as __namedExportsOrder,Tr as default};

import{j as r}from"./iframe-BOqGPkjA.js";import{C as o}from"./CommandOutput-CHFr8n1E.js";import{S as R}from"./rpc-story.fixtures-DJtxED-v.js";import"./preload-helper-BHaa9cja.js";import"./DataTable-wM0sVjW5.js";import"./SortableHeader-xn-Qu8dX.js";import"./utils-CR52uffu.js";import"./loading-CuZVbQUO.js";import"./Modal-Zny1UyQh.js";import"./index-4azl-_NY.js";import"./index-B9J3eB3Z.js";import"./Icon-DmMP-gqZ.js";import"./button-o3q0Bgz-.js";import"./index-0zBpNI7D.js";import"./modalStack-Cy5N7MXo.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Bob4q9Oe.js";import"./floating-ui.react-D9PnPcwb.js";import"./FilterPill-BSzTJgOd.js";import"./Combobox-Y357Wu3y.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CCYJVd9b.js";import"./MultiSelect-EhuEcndF.js";import"./RangeSlider-BvOybwIk.js";import"./TimeRange-DXbk3lMx.js";import"./select-DB_eefDo.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-MJoZSODF.js";import"./TagList-N6ebrBYM.js";import"./Badge-BL3PsgIi.js";import"./HoverCard-BUGj1vWM.js";import"./Properties-BF8PQ8nO.js";import"./IconButton-5qvDvOGg.js";import"./DropdownMenu-C-0fap_8.js";import"./DropdownMenuSubmenu-ByYdjx3z.js";import"./StatusDot-sZA9BY2q.js";import"./Clicky-CRZG_8HI.js";import"./queryClient-B1MiNYUL.js";import"./suspense-CinY47uC.js";import"./useQuery-_geVgqFs.js";import"./FilterForm-JeoR5Lql.js";import"./formMetadata-GFKmkflX.js";import"./types-BHfRQr8X.js";import"./Tree-Up1YzKId.js";import"./TreeNode-DVdXANWm.js";import"./ObjectGraph-D1hbKZtU.js";import"./ExecutionTree-Do2s3aLC.js";import"./CodeBlock-cDQjXAbc.js";import"./CodeDiff-Dr2JPWcF.js";import"./SegmentedControl-ScLmdy_r.js";import"./code-highlight-D4J1xWXq.js";import"./JsonView-CJ3P6BgG.js";import"./RenderedStackTrace-Bfv0ner4.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

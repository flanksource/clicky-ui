import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./CommandOutput-CQulD3Vk.js";import{n as i,o as a}from"./rpc-story.fixtures-Cm67zRhY.js";var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),a(),o=t(),s={success:!0,exit_code:0,contentType:`text/plain`,stdout:`rollout restarted: deployment/payments-api
3 pods updated`},c={success:!1,exit_code:1,contentType:`text/plain`,stdout:``,stderr:`Error: forbidden — token lacks scope deployments:write`},l={title:`Clicky-RPC/CommandOutput`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:`boolean`}},args:{response:i}},u={render:e=>(0,o.jsx)(`div`,{className:`max-w-3xl`,children:(0,o.jsx)(r,{...e})})},d={args:{response:s},render:e=>(0,o.jsx)(`div`,{className:`max-w-3xl`,children:(0,o.jsx)(r,{...e})})},f={args:{response:c},render:e=>(0,o.jsx)(`div`,{className:`max-w-3xl`,children:(0,o.jsx)(r,{...e})})},p={args:{response:null,loading:!0,loadingMessage:`Running command…`},render:e=>(0,o.jsx)(`div`,{className:`max-w-3xl`,children:(0,o.jsx)(r,{...e})})},m=[`Table`,`Text`,`ErrorOutput`,`Loading`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as ErrorOutput,p as Loading,u as Table,d as Text,m as __namedExportsOrder,l as default};
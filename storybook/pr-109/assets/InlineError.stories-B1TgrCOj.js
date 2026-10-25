import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./InlineError-Bjc9Qj2f.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),a=Object.assign(Error(`request failed: 500 Internal Server Error`),{method:`POST`,url:`/api/v1/widgets`,status:500,responseBody:`{"error":"database connection refused","trace":"a1b2c3"}`}),o={title:`Clicky-RPC/InlineError`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:`Inline error card for a failed operation: a title + message, and an expandable 'More details' section that surfaces the request method/url/status and response body when the error object carries them (as the rpc api client's errors do).`}}},argTypes:{error:{control:!1}},args:{title:`Failed to load widgets`,error:a}},s={render:e=>(0,i.jsx)(`div`,{className:`max-w-lg`,children:(0,i.jsx)(r,{...e})})},c={args:{title:`Something went wrong`,error:Error(`network timeout after 30s`)},render:e=>(0,i.jsx)(`div`,{className:`max-w-lg`,children:(0,i.jsx)(r,{...e})})},l={args:{title:`Could not preview this clone`,error:Error(`The target is missing required stored procedures.`),runNow:{onClick:()=>{}}},render:e=>(0,i.jsx)(`div`,{className:`max-w-lg`,children:(0,i.jsx)(r,{...e})})},u=[`WithRequestDetails`,`MessageOnly`,`WithRecoveryAction`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Something went wrong",
    error: new Error("network timeout after 30s")
  },
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Could not preview this clone",
    error: new Error("The target is missing required stored procedures."),
    runNow: {
      onClick: () => {}
    }
  },
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as MessageOnly,l as WithRecoveryAction,s as WithRequestDetails,u as __namedExportsOrder,o as default};
import{j as r}from"./iframe-DiVtfPK2.js";import{I as a}from"./InlineError-CvAjYJHy.js";import"./preload-helper-BHaa9cja.js";import"./button-DQujlY7L.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DDAQP9UA.js";import"./Icon-NtM811xi.js";const w=Object.assign(new Error("request failed: 500 Internal Server Error"),{method:"POST",url:"/api/v1/widgets",status:500,responseBody:'{"error":"database connection refused","trace":"a1b2c3"}'}),N={title:"Clicky-RPC/InlineError",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"Inline error card for a failed operation: a title + message, and an expandable 'More details' section that surfaces the request method/url/status and response body when the error object carries them (as the rpc api client's errors do)."}}},argTypes:{error:{control:!1}},args:{title:"Failed to load widgets",error:w}},s={render:e=>r.jsx("div",{className:"max-w-lg",children:r.jsx(a,{...e})})},o={args:{title:"Something went wrong",error:new Error("network timeout after 30s")},render:e=>r.jsx("div",{className:"max-w-lg",children:r.jsx(a,{...e})})},t={args:{title:"Could not preview this clone",error:new Error("The target is missing required stored procedures."),runNow:{onClick:()=>{}}},render:e=>r.jsx("div",{className:"max-w-lg",children:r.jsx(a,{...e})})};var n,i,c;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...(c=(i=s.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var d,l,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    title: "Something went wrong",
    error: new Error("network timeout after 30s")
  },
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...(m=(l=o.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var p,g,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const S=["WithRequestDetails","MessageOnly","WithRecoveryAction"];export{o as MessageOnly,t as WithRecoveryAction,s as WithRequestDetails,S as __namedExportsOrder,N as default};

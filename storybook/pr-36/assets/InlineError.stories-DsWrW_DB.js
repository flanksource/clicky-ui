import{j as s}from"./iframe-tozGD2Qm.js";import{I as a}from"./InlineError-AeoKgBed.js";import"./preload-helper-DMBmwiZ1.js";import"./Icon-DV6apHHG.js";import"./utils-BLSKlp9E.js";import"./UiChevronRight-C7XWtqzN.js";const m=Object.assign(new Error("request failed: 500 Internal Server Error"),{method:"POST",url:"/api/v1/widgets",status:500,responseBody:'{"error":"database connection refused","trace":"a1b2c3"}'}),f={title:"Clicky-RPC/InlineError",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"Inline error card for a failed operation: a title + message, and an expandable 'More details' section that surfaces the request method/url/status and response body when the error object carries them (as the rpc api client's errors do)."}}},argTypes:{error:{control:!1}},args:{title:"Failed to load widgets",error:m}},r={render:t=>s.jsx("div",{className:"max-w-lg",children:s.jsx(a,{...t})})},e={args:{title:"Something went wrong",error:new Error("network timeout after 30s")},render:t=>s.jsx("div",{className:"max-w-lg",children:s.jsx(a,{...t})})};var o,n,i;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...(i=(n=r.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var c,d,l;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    title: "Something went wrong",
    error: new Error("network timeout after 30s")
  },
  render: args => <div className="max-w-lg">
      <InlineError {...args} />
    </div>
}`,...(l=(d=e.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};const E=["WithRequestDetails","MessageOnly"];export{e as MessageOnly,r as WithRequestDetails,E as __namedExportsOrder,f as default};

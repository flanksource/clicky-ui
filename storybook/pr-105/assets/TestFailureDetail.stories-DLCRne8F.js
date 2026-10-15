import{j as a}from"./iframe-DgmZMBKH.js";import{T as r}from"./TestFailureDetail-IRvL7bFe.js";import"./preload-helper-BBRSUrHX.js";import"./LogViewer-KzzXdTrm.js";import"./utils-DW-IJACk.js";import"./AnsiHtml-vARQWsYL.js";import"./JsonView-PTiSkJw0.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./Icon-COMQMXZj.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./status-kHMr9duR.js";const d={kind:"go_test",summary:"login should reject an incorrect password",expected:"status 401 Unauthorized",actual:"status 200 OK",location:"auth/login_test.go:88",stack:`auth/login_test.go:88 +0x1a4
auth/login_test.go:71 +0x90
testing.tRunner +0xff`},C={title:"Data/TestRunner/TestFailureDetail",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`)."}}},argTypes:{failure:{control:!1}},args:{failure:d}},e={render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(r,{...o})})},t={args:{failure:{kind:"gomega",summary:"Expected the response to contain a session cookie",expected:"Set-Cookie: session=…",actual:"<no Set-Cookie header>",location:"billing/checkout_test.go:142"}},render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(r,{...o})})};var s,i,n;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...(n=(i=e.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};var c,l,m;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    failure: {
      kind: "gomega",
      summary: "Expected the response to contain a session cookie",
      expected: "Set-Cookie: session=…",
      actual: "<no Set-Cookie header>",
      location: "billing/checkout_test.go:142"
    }
  },
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const N=["Default","Gomega"];export{e as Default,t as Gomega,N as __namedExportsOrder,C as default};

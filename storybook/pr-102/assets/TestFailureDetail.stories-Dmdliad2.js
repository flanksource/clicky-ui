import{j as a}from"./iframe-DP177qYv.js";import{T as r}from"./TestFailureDetail-Cw9CcJ2q.js";import"./preload-helper-BZq7nIkI.js";import"./LogViewer-N33AkwdI.js";import"./utils-DW-IJACk.js";import"./AnsiHtml-DWrTy8GG.js";import"./JsonView-euY554sO.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./Icon-CVZO3WAG.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./status-kHMr9duR.js";const d={kind:"go_test",summary:"login should reject an incorrect password",expected:"status 401 Unauthorized",actual:"status 200 OK",location:"auth/login_test.go:88",stack:`auth/login_test.go:88 +0x1a4
auth/login_test.go:71 +0x90
testing.tRunner +0xff`},E={title:"Data/TestRunner/TestFailureDetail",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`)."}}},argTypes:{failure:{control:!1}},args:{failure:d}},e={render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(r,{...o})})},t={args:{failure:{kind:"gomega",summary:"Expected the response to contain a session cookie",expected:"Set-Cookie: session=…",actual:"<no Set-Cookie header>",location:"billing/checkout_test.go:142"}},render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(r,{...o})})};var s,i,n;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const C=["Default","Gomega"];export{e as Default,t as Gomega,C as __namedExportsOrder,E as default};

import{j as a}from"./iframe-DQ9XXhpn.js";import{T as s}from"./TestFailureDetail-TqHpOVgo.js";import"./preload-helper-B2wK-Kjy.js";import"./LogViewer-O6FUwPmQ.js";import"./utils-BLSKlp9E.js";import"./status-BRw0QZUG.js";import"./UiHourglass-w97Csv77.js";import"./UiLoader-DAxOKnd5.js";import"./UiPause-FWupXOXA.js";import"./UiError-CCTPDLYu.js";import"./UiWarningTriangle-D2fuE8IQ.js";import"./UiPass-BFTYw9dD.js";import"./UiClass-DcfTF5Yw.js";const d={kind:"go_test",summary:"login should reject an incorrect password",expected:"status 401 Unauthorized",actual:"status 200 OK",location:"auth/login_test.go:88",stack:`auth/login_test.go:88 +0x1a4
auth/login_test.go:71 +0x90
testing.tRunner +0xff`},w={title:"Data/TestRunner/TestFailureDetail",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`)."}}},argTypes:{failure:{control:!1}},args:{failure:d}},e={render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(s,{...o})})},t={args:{failure:{kind:"gomega",summary:"Expected the response to contain a session cookie",expected:"Set-Cookie: session=…",actual:"<no Set-Cookie header>",location:"billing/checkout_test.go:142"}},render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(s,{...o})})};var r,i,n;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
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
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const y=["Default","Gomega"];export{e as Default,t as Gomega,y as __namedExportsOrder,w as default};

import{j as a}from"./iframe-C96xZIdp.js";import{T as s}from"./TestFailureDetail-D4QdB_BV.js";import"./preload-helper-Bg6xcDEu.js";import"./LogViewer-C63FSAWt.js";import"./utils-CR52uffu.js";import"./status-CZrSarLV.js";import"./UiHourglass-Wr2wdqlg.js";import"./UiLoader-CCDQzEm5.js";import"./UiPause-KAUy5YqK.js";import"./UiError-8kZ-YABM.js";import"./UiWarningTriangle-B7-MvUhr.js";import"./UiPass-BCN7b7n4.js";import"./UiClass-Di432KJo.js";const d={kind:"go_test",summary:"login should reject an incorrect password",expected:"status 401 Unauthorized",actual:"status 200 OK",location:"auth/login_test.go:88",stack:`auth/login_test.go:88 +0x1a4
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

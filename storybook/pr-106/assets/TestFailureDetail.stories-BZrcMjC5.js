import{j as e}from"./iframe-BUpmsD4_.js";import{T as n}from"./TestFailureDetail-BrvB66d8.js";import"./preload-helper-PGaPgbNH.js";import"./LogViewer-CEwue8JF.js";import"./utils-DW-IJACk.js";import"./AnsiHtml-D5usPwhf.js";import"./StackDumpView-Bt2PqYit.js";import"./Icon-DTAROQQs.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-B8te7UN1.js";import"./StackFrameRow-C5aLaa6B.js";import"./FrameSourceWindow-CS1fR05x.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./JsonView-B4Nw9Fl0.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./loading-BVCwDMQn.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";const j={kind:"go_test",summary:"login should reject an incorrect password",expected:"status 401 Unauthorized",actual:"status 200 OK",location:"auth/login_test.go:88",stack:`auth/login_test.go:88 +0x1a4
auth/login_test.go:71 +0x90
testing.tRunner +0xff`},J={title:"Data/TestRunner/TestFailureDetail",component:n,tags:["autodocs"],parameters:{docs:{description:{component:"Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`)."}}},argTypes:{failure:{control:!1}},args:{failure:j}},s={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(n,{...a})})},o={args:{failure:{kind:"gomega",summary:"Expected the response to contain a session cookie",expected:"Set-Cookie: session=…",actual:"<no Set-Cookie header>",location:"billing/checkout_test.go:142"}},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(n,{...a})})},S=`goroutine 18 [running]:
testing.tRunner.func1.2({0x1, 0x2})
	/usr/local/go1.22/src/testing/testing.go:1631 +0x24a
billing.TestCharge(0xc000)
	/app/billing/charge_test.go:44 +0x1a
created by testing.(*T).Run
	/usr/local/go1.22/src/testing/testing.go:1742 +0x390
`,r={args:{failure:{kind:"panic",summary:"panic: runtime error: invalid memory address or nil pointer dereference",location:"billing/charge_test.go:44",stack:S}},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(n,{...a})})},t={args:{failure:{kind:"panic",summary:"panic: send on closed channel",stack:`${S}
goroutine 1 [chan receive]:
main.main()
	/app/main.go:9 +0x20
`}},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(n,{...a})})};var i,c,m;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var l,d,p;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(p=(d=o.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,g,x,h,f;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    failure: {
      kind: "panic",
      summary: "panic: runtime error: invalid memory address or nil pointer dereference",
      location: "billing/charge_test.go:44",
      stack: PANIC_STACK
    }
  },
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...(x=(g=r.parameters)==null?void 0:g.docs)==null?void 0:x.source},description:{story:"A panic stack is a Go goroutine dump, shown as a goroutine card instead of a log.",...(f=(h=r.parameters)==null?void 0:h.docs)==null?void 0:f.description}}};var k,v,y,_,T;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    failure: {
      kind: "panic",
      summary: "panic: send on closed channel",
      stack: \`\${PANIC_STACK}
goroutine 1 [chan receive]:
main.main()
\\t/app/main.go:9 +0x20
\`
    }
  },
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...(y=(v=t.parameters)==null?void 0:v.docs)==null?void 0:y.source},description:{story:"Several goroutines keep the search, state chips and hide-runtime filter.",...(T=(_=t.parameters)==null?void 0:_.docs)==null?void 0:T.description}}};const Q=["Default","Gomega","GoPanic","GoPanicWithManyGoroutines"];export{s as Default,r as GoPanic,t as GoPanicWithManyGoroutines,o as Gomega,Q as __namedExportsOrder,J as default};

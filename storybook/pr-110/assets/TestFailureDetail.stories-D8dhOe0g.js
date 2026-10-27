import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{r as n,t as r}from"./TestFailureDetail-CvaXc461.js";var i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),i=t(),a={title:`Data/TestRunner/TestFailureDetail`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`)."}}},argTypes:{failure:{control:!1}},args:{failure:{kind:`go_test`,summary:`login should reject an incorrect password`,expected:`status 401 Unauthorized`,actual:`status 200 OK`,location:`auth/login_test.go:88`,stack:`auth/login_test.go:88 +0x1a4
auth/login_test.go:71 +0x90
testing.tRunner +0xff`}}},o={render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},s={args:{failure:{kind:`gomega`,summary:`Expected the response to contain a session cookie`,expected:`Set-Cookie: session=…`,actual:`<no Set-Cookie header>`,location:`billing/checkout_test.go:142`}},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},c=`goroutine 18 [running]:
testing.tRunner.func1.2({0x1, 0x2})
	/usr/local/go1.22/src/testing/testing.go:1631 +0x24a
billing.TestCharge(0xc000)
	/app/billing/charge_test.go:44 +0x1a
created by testing.(*T).Run
	/usr/local/go1.22/src/testing/testing.go:1742 +0x390
`,l={args:{failure:{kind:`panic`,summary:`panic: runtime error: invalid memory address or nil pointer dereference`,location:`billing/charge_test.go:44`,stack:c}},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},u={args:{failure:{kind:`panic`,summary:`panic: send on closed channel`,stack:`${c}
goroutine 1 [chan receive]:
main.main()
\t/app/main.go:9 +0x20
`}},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},d=[`Default`,`Gomega`,`GoPanic`,`GoPanicWithManyGoroutines`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source},description:{story:`A panic stack is a Go goroutine dump, shown as a goroutine card instead of a log.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:`Several goroutines keep the search, state chips and hide-runtime filter.`,...u.parameters?.docs?.description}}}})))()}f();export{o as Default,l as GoPanic,u as GoPanicWithManyGoroutines,s as Gomega,d as __namedExportsOrder,a as default};
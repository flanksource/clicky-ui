import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./ErrorDetails-b_cXyhuL.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{r(),i=t(),a={message:`charge declined: insufficient funds`,trace:`a1b2c3d4e5f6`,time:`2026-06-02T09:30:00Z`,context:[[`customer`,`cust_8842`],[`amount`,`4200`],[`currency`,`USD`],[`request`,`{"id":"req_991","retries":2}`]],stacktrace:`com.acme.payments.PaymentException: charge declined
  at com.acme.payments.ChargeService.charge(ChargeService.java:142)
  at com.acme.payments.ChargeController.post(ChargeController.java:58)
  at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1067)
  at java.base/java.lang.Thread.run(Thread.java:840)`},o={title:`Data/Diagnostics/ErrorDetails`,component:n,tags:[`autodocs`],parameters:{docs:{description:{component:"Collapsible error panel for normalized `ErrorDiagnostics` (use `normalizeErrorDiagnostics` to build it from ad-hoc payloads): message summary, copyable trace/time, scalar + JSON context badges, and a parsed stack trace that highlights application frames. `renderJsonContext` lets a host swap in a richer JSON view."}}},argTypes:{diagnostics:{control:!1},renderJsonContext:{control:!1}},args:{diagnostics:a}},s={render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(n,{...e})})},c={args:{diagnostics:{message:`connection reset by peer`,context:[]}},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(n,{...e})})},l=[`Default`,`MessageOnly`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    diagnostics: {
      message: "connection reset by peer",
      context: []
    }
  },
  render: args => <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
}`,...c.parameters?.docs?.source}}}})))()}u();export{s as Default,c as MessageOnly,l as __namedExportsOrder,o as default};
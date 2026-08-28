import{j as r}from"./iframe-CmyXO54k.js";import{E as t}from"./ErrorDetails-Cf1Hf7OK.js";import"./preload-helper-CrzHa85r.js";import"./Icon-Cn5Qjct9.js";import"./utils-DW-IJACk.js";const d=["com.acme.payments.ChargeService.charge(ChargeService.java:142)","com.acme.payments.ChargeController.post(ChargeController.java:58)","org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1067)","java.base/java.lang.Thread.run(Thread.java:840)"].join(`
  at `),p={message:"charge declined: insufficient funds",trace:"a1b2c3d4e5f6",time:"2026-06-02T09:30:00Z",context:[["customer","cust_8842"],["amount","4200"],["currency","USD"],["request",'{"id":"req_991","retries":2}']],stacktrace:`com.acme.payments.PaymentException: charge declined
  at ${d}`},f={title:"Data/Diagnostics/ErrorDetails",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Collapsible error panel for normalized `ErrorDiagnostics` (use `normalizeErrorDiagnostics` to build it from ad-hoc payloads): message summary, copyable trace/time, scalar + JSON context badges, and a parsed stack trace that highlights application frames. `renderJsonContext` lets a host swap in a richer JSON view."}}},argTypes:{diagnostics:{control:!1},renderJsonContext:{control:!1}},args:{diagnostics:p}},e={render:s=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(t,{...s})})},a={args:{diagnostics:{message:"connection reset by peer",context:[]}},render:s=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(t,{...s})})};var o,n,c;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
}`,...(c=(n=e.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var i,m,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    diagnostics: {
      message: "connection reset by peer",
      context: []
    }
  },
  render: args => <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
}`,...(l=(m=a.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};const D=["Default","MessageOnly"];export{e as Default,a as MessageOnly,D as __namedExportsOrder,f as default};

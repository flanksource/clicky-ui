import{F as i}from"./FrameSourceWindow-D9O5f2XJ.js";import"./iframe-C5-Xigqm.js";import"./preload-helper-BZuLNX-z.js";const l={title:"Data/Diagnostics/FrameSourceWindow",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"Renders a resolved source window beneath a stack frame: a gutter of absolute line numbers with the frame's focal `line` highlighted. The plain (non-Shiki) renderer shared by JVM thread-dump and exception stack-trace frames. Use `frameHasSource(frame)` to decide whether to render it."}}},argTypes:{frame:{control:!1}},args:{frame:{sourceStartLine:138,line:142,sourceLines:["  public Receipt charge(Money amount) {","    var account = accounts.lookup(amount.customer());","    if (account.balance().lessThan(amount)) {",'      throw new PaymentException("charge declined");',"    }","    return ledger.debit(account, amount);","  }"]}}},e={},r={args:{frame:{sourceLineNumbers:[40,41,42,43],line:42,sourceLines:["func (s *Service) Charge(amount int) error {","  if s.balance < amount {","    return ErrInsufficientFunds","  }"]}}};var a,n,t;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:"{}",...(t=(n=e.parameters)==null?void 0:n.docs)==null?void 0:t.source}}};var o,s,c;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    frame: {
      sourceLineNumbers: [40, 41, 42, 43],
      line: 42,
      sourceLines: ["func (s *Service) Charge(amount int) error {", "  if s.balance < amount {", "    return ErrInsufficientFunds", "  }"]
    }
  }
}`,...(c=(s=r.parameters)==null?void 0:s.docs)==null?void 0:c.source}}};const p=["Default","ExplicitLineNumbers"];export{e as Default,r as ExplicitLineNumbers,p as __namedExportsOrder,l as default};

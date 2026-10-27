import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./FrameSourceWindow-DUDF0QtU.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{n(),i=t(),a={title:`Data/Diagnostics/FrameSourceWindow`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Renders a resolved source window beneath a stack frame: a gutter of absolute line numbers with the frame's focal `line` highlighted. The plain (non-Shiki) renderer shared by JVM thread-dump and exception stack-trace frames. Use `frameHasSource(frame)` to decide whether to render it."}}},argTypes:{frame:{control:!1}},args:{frame:{sourceStartLine:138,line:142,sourceLines:[`  public Receipt charge(Money amount) {`,`    var account = accounts.lookup(amount.customer());`,`    if (account.balance().lessThan(amount)) {`,`      throw new PaymentException("charge declined");`,`    }`,`    return ledger.debit(account, amount);`,`  }`]}}},o={},s={args:{frame:{sourceLineNumbers:[40,41,42,43],line:42,sourceLines:[`func (s *Service) Charge(amount int) error {`,`  if s.balance < amount {`,`    return ErrInsufficientFunds`,`  }`]}}},c={args:{frame:{sourceStartLine:86,sourceLanguage:`xml`,sourceLines:[`<MathIF IF="MemberCountMV > 0">`,`  <MathVariable VARIABLENAME="ValidMV" TYPE="CALLRULE">ValidateExpressions</MathVariable>`,`</MathIF>`,`<MathVariable VARIABLENAME="PacketMV" TYPE="CALLRULE">TransactionBusinessRulePacket</MathVariable>`]},markers:[{line:87,content:(0,i.jsx)(`span`,{className:`rounded bg-red-500/10 px-1 text-red-700`,children:`calls ValidateExpressions · removed`})},{line:89,content:(0,i.jsx)(`span`,{className:`rounded bg-muted px-1`,children:`calls TransactionBusinessRulePacket`})}]}},l=[`Default`,`ExplicitLineNumbers`,`Markers`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    frame: {
      sourceLineNumbers: [40, 41, 42, 43],
      line: 42,
      sourceLines: ["func (s *Service) Charge(amount int) error {", "  if s.balance < amount {", "    return ErrInsufficientFunds", "  }"]
    }
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    frame: {
      sourceStartLine: 86,
      sourceLanguage: "xml",
      sourceLines: ['<MathIF IF="MemberCountMV > 0">', '  <MathVariable VARIABLENAME="ValidMV" TYPE="CALLRULE">ValidateExpressions</MathVariable>', "</MathIF>", '<MathVariable VARIABLENAME="PacketMV" TYPE="CALLRULE">TransactionBusinessRulePacket</MathVariable>']
    },
    markers: [{
      line: 87,
      content: <span className="rounded bg-red-500/10 px-1 text-red-700">calls ValidateExpressions · removed</span>
    }, {
      line: 89,
      content: <span className="rounded bg-muted px-1">calls TransactionBusinessRulePacket</span>
    }]
  }
}`,...c.parameters?.docs?.source},description:{story:`The calls a caller's source makes, each line marked and annotated, with no failing focal line.`,...c.parameters?.docs?.description}}}})))()}u();export{o as Default,s as ExplicitLineNumbers,c as Markers,l as __namedExportsOrder,a as default};
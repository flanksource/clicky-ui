import{A as b}from"./AnsiHtml-B2MtZ9JP.js";import"./iframe-ChhGfndY.js";import"./preload-helper-D5l2DbWZ.js";const B={title:"Data/AnsiHtml",component:b,args:{text:"\\u001b[32mPASS\\u001b[0m service ready",as:"pre"},parameters:{docs:{description:{component:"Small ANSI SGR renderer for colored terminal output in logs, command results, and inline table cells."}}}},e={args:{text:"\x1B[31mred\x1B[0m \x1B[32mgreen\x1B[0m \x1B[34mblue\x1B[0m \x1B[1mbold\x1B[0m"}},r={args:{text:`\x1B[32m  ✓ passes\x1B[0m
\x1B[31m  ✗ fails\x1B[0m
\x1B[33m  ! skipped\x1B[0m`}},s={args:{as:"span",text:'level=\x1B[31merror\x1B[0m msg="boom"'}};var m,a,t;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    text: "\\x1b[31mred\\x1b[0m \\x1b[32mgreen\\x1b[0m \\x1b[34mblue\\x1b[0m \\x1b[1mbold\\x1b[0m"
  }
}`,...(t=(a=e.parameters)==null?void 0:a.docs)==null?void 0:t.source}}};var o,n,x;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    text: \`\\x1b[32m  \\u2713 passes\\x1b[0m\\n\\x1b[31m  \\u2717 fails\\x1b[0m\\n\\x1b[33m  ! skipped\\x1b[0m\`
  }
}`,...(x=(n=r.parameters)==null?void 0:n.docs)==null?void 0:x.source}}};var p,c,l;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    as: "span",
    text: 'level=\\x1b[31merror\\x1b[0m msg="boom"'
  }
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const g=["Colors","TestOutput","InlineSpan"];export{e as Colors,s as InlineSpan,r as TestOutput,g as __namedExportsOrder,B as default};

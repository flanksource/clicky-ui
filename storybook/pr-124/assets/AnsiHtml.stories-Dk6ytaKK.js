import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./AnsiHtml-BHYjhdWS.js";var r,i,a,o,s;function c(){return(c=e((()=>{t(),r={title:`Data/AnsiHtml`,component:n,args:{text:`\\u001b[32mPASS\\u001b[0m service ready`,as:`pre`},parameters:{docs:{description:{component:`Small ANSI SGR renderer for colored terminal output in logs, command results, and inline table cells.`}}}},i={args:{text:`\x1B[31mred\x1B[0m \x1B[32mgreen\x1B[0m \x1B[34mblue\x1B[0m \x1B[1mbold\x1B[0m`}},a={args:{text:`\x1B[32m  ✓ passes\x1B[0m
\x1B[31m  ✗ fails\x1B[0m
\x1B[33m  ! skipped\x1B[0m`}},o={args:{as:`span`,text:`level=\x1B[31merror\x1B[0m msg="boom"`}},s=[`Colors`,`TestOutput`,`InlineSpan`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    text: "\\x1b[31mred\\x1b[0m \\x1b[32mgreen\\x1b[0m \\x1b[34mblue\\x1b[0m \\x1b[1mbold\\x1b[0m"
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    text: \`\\x1b[32m  \\u2713 passes\\x1b[0m\\n\\x1b[31m  \\u2717 fails\\x1b[0m\\n\\x1b[33m  ! skipped\\x1b[0m\`
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    as: "span",
    text: 'level=\\x1b[31merror\\x1b[0m msg="boom"'
  }
}`,...o.parameters?.docs?.source}}}})))()}c();export{i as Colors,o as InlineSpan,a as TestOutput,s as __namedExportsOrder,r as default};
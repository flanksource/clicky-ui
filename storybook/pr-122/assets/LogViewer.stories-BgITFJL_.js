import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./LogViewer-bJUMMggf.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),r={title:`Data/LogViewer`,component:n,args:{logs:`INFO service ready\\nWARN retry queue above threshold\\nINFO recovered`,collapsedLines:2,maxExpandedVh:70},parameters:{docs:{description:{component:`Expandable plain-text log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap.`}}}},i=Array.from({length:40},(e,t)=>`[line ${t+1}] processing item...`).join(`
`),a={args:{logs:i}},o={args:{logs:`line 1
line 2
line 3`}},s={args:{variant:`terminal`,maxHeight:`none`,logs:`Run ./build.sh
::group::Install dependencies
resolved 214 packages
::group::Native modules
compiled sharp
::endgroup::
::endgroup::
::group::Compile
tsc --build
built 38 files
::endgroup::
::group::Test
running 12 suites…`}},c=[`Default`,`Short`,`Groups`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    logs: sample
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    logs: "line 1\\nline 2\\nline 3"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "terminal",
    maxHeight: "none",
    logs: ["Run ./build.sh", "::group::Install dependencies", "resolved 214 packages", "::group::Native modules", "compiled sharp", "::endgroup::", "::endgroup::", "::group::Compile", "tsc --build", "built 38 files", "::endgroup::", "::group::Test", "running 12 suites…"].join("\\n")
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{a as Default,s as Groups,o as Short,c as __namedExportsOrder,r as default};
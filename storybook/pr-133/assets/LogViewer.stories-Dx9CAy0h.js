import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{n as t,t as n}from"./LogViewer-CqVfUVf8.js";var r,i,a,o,s,c,l;function u(){return(u=e((()=>{t(),r={title:`Data/LogViewer`,component:n,args:{logs:`INFO service ready\\nWARN retry queue above threshold\\nINFO recovered`,collapsedLines:2,maxExpandedVh:70},parameters:{docs:{description:{component:`Expandable log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap. Workflow commands in the log are read: groups become collapsible sections, statuses become lines, and the latest description, status and progress sit below the log. Raw shows the text as it was printed.`}}}},i=Array.from({length:40},(e,t)=>`[line ${t+1}] processing item...`).join(`
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
running 12 suites…`}},c={args:{variant:`terminal`,maxHeight:`none`,logs:`::description::Purging 500 staged activities
Warning: The join order has been enforced because a local join hint is used.
::group::Cycle tables
::status::Truncating AsCycle
::status::Truncating AsCycle
::progress::1/2
::endgroup::
::group::Table reload
::status::AsFundValue: copying kept rows, truncating, reloading
::progress::1/6
::status::AsFundValue: reloaded 1204 rows
::progress::2/6`}},l=[`Default`,`Short`,`Groups`,`StatusAndProgress`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "terminal",
    maxHeight: "none",
    logs: ["::description::Purging 500 staged activities", "Warning: The join order has been enforced because a local join hint is used.", "::group::Cycle tables", "::status::Truncating AsCycle", "::status::Truncating AsCycle", "::progress::1/2", "::endgroup::", "::group::Table reload", "::status::AsFundValue: copying kept rows, truncating, reloading", "::progress::1/6", "::status::AsFundValue: reloaded 1204 rows", "::progress::2/6"].join("\\n")
  }
}`,...c.parameters?.docs?.source},description:{story:`A running procedure that reports only through workflow commands.`,...c.parameters?.docs?.description}}}})))()}u();export{a as Default,s as Groups,o as Short,c as StatusAndProgress,l as __namedExportsOrder,r as default};
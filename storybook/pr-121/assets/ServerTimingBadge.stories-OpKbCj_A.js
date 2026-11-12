import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./ServerTimingBadge-BEg63He3.js";var r,i,a,o,s,c,l,u;function d(){return(d=e((()=>{t(),{expect:r,userEvent:i,within:a}=__STORYBOOK_MODULE_TEST__,o={title:`Data/ServerTimingBadge`,component:n,tags:[`autodocs`],args:{metrics:[{name:`total`,duration:120.5,counters:{}},{name:`command`,duration:95.2,counters:{}},{name:`format`,duration:4.1,counters:{}},{name:`sql`,duration:18.6,description:`queries=2 rows_returned=501`,counters:{queries:2,rows_returned:501}},{name:`redis`,duration:1.2,description:`ops=3 hits=2 misses=1 errors=0`,counters:{ops:3,hits:2,misses:1,errors:0}}]},parameters:{docs:{description:{component:`Compact Server-Timing badge with a hover and focus breakdown of request phases and diagnostic counters.`}}}},s={play:async({canvasElement:e})=>{let t=a(e).getByRole(`button`,{name:`Show server timing`});await i.hover(t),await r(a(document.body).getByText(/501 rows returned/)).toBeVisible()}},c={args:{metrics:[{name:`total`,duration:8.2,counters:{}},{name:`sql`,duration:0,description:`queries=0 rows_returned=0`,counters:{queries:0,rows_returned:0}},{name:`redis`,duration:0,description:`ops=0 hits=0 misses=0 errors=0`,counters:{ops:0,hits:0,misses:0,errors:0}}]}},l={args:{metrics:[{name:`total`,duration:12035.3,counters:{}},{name:`command`,duration:12020.1,counters:{}},{name:`format`,duration:15.2,counters:{}}]}},u=[`Default`,`NoBackendActivity`,`MultiSecond`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show server timing"
    });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText(/501 rows returned/)).toBeVisible();
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: [{
      name: "total",
      duration: 8.2,
      counters: {}
    }, {
      name: "sql",
      duration: 0,
      description: "queries=0 rows_returned=0",
      counters: {
        queries: 0,
        rows_returned: 0
      }
    }, {
      name: "redis",
      duration: 0,
      description: "ops=0 hits=0 misses=0 errors=0",
      counters: {
        ops: 0,
        hits: 0,
        misses: 0,
        errors: 0
      }
    }]
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: [{
      name: "total",
      duration: 12035.3,
      counters: {}
    }, {
      name: "command",
      duration: 12020.1,
      counters: {}
    }, {
      name: "format",
      duration: 15.2,
      counters: {}
    }]
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{s as Default,l as MultiSecond,c as NoBackendActivity,u as __namedExportsOrder,o as default};
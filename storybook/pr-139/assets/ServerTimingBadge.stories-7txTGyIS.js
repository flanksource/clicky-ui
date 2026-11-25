import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{n,t as r}from"./ServerTimingBadge-q9HJhGG1.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),i=t(),{expect:a,userEvent:o,within:s}=__STORYBOOK_MODULE_TEST__,c={title:`Data/ServerTimingBadge`,component:r,tags:[`autodocs`],args:{metrics:[{name:`total`,duration:120.5,counters:{}},{name:`command`,duration:95.2,counters:{}},{name:`format`,duration:4.1,counters:{}},{name:`sql`,duration:18.6,description:`queries=2 rows_returned=501`,counters:{queries:2,rows_returned:501}},{name:`redis`,duration:1.2,description:`ops=3 hits=2 misses=1 errors=0`,counters:{ops:3,hits:2,misses:1,errors:0}}]},parameters:{docs:{description:{component:`Compact Server-Timing badge with a hover and focus breakdown of request phases and diagnostic counters.`}}}},l={play:async({canvasElement:e})=>{let t=s(e).getByRole(`button`,{name:`Show server timing`});await o.hover(t),await a(s(document.body).getByText(/501 rows returned/)).toBeVisible()}},u={args:{metrics:[{name:`total`,duration:8.2,counters:{}},{name:`sql`,duration:0,description:`queries=0 rows_returned=0`,counters:{queries:0,rows_returned:0}},{name:`redis`,duration:0,description:`ops=0 hits=0 misses=0 errors=0`,counters:{ops:0,hits:0,misses:0,errors:0}}]}},d={args:{title:`Page load`,metrics:[{name:`total`,duration:963,counters:{}},{name:`fetch`,duration:412.6,counters:{requests:5}},{name:`integrity`,duration:3.1,counters:{files:5}},{name:`compile`,duration:295.4,counters:{modules:4}},{name:`rewrite`,duration:61.8,counters:{modules:9}},{name:`tailwind`,duration:48.2,counters:{builds:1}}]},play:async({canvasElement:e})=>{let t=s(e).getByRole(`button`,{name:`Show page load`});await o.hover(t),await a(s(document.body).getByText(`4 modules`)).toBeVisible()}},f={args:{title:`Page load`,metrics:[{name:`total`,duration:963,counters:{}},{name:`compile`,duration:295.4,counters:{modules:4}}],footer:(0,i.jsx)(`button`,{type:`button`,className:`text-xs text-primary underline`,children:`Build log…`})},play:async({canvasElement:e})=>{await o.hover(s(e).getByRole(`button`,{name:`Show page load`})),await a(s(document.body).getByRole(`button`,{name:`Build log…`})).toBeVisible()}},p={args:{metrics:[{name:`total`,duration:12035.3,counters:{}},{name:`command`,duration:12020.1,counters:{}},{name:`format`,duration:15.2,counters:{}}]}},m=[`Default`,`NoBackendActivity`,`PageLoad`,`WithFooter`,`MultiSecond`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show server timing"
    });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText(/501 rows returned/)).toBeVisible();
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Page load",
    metrics: [{
      name: "total",
      duration: 963,
      counters: {}
    }, {
      name: "fetch",
      duration: 412.6,
      counters: {
        requests: 5
      }
    }, {
      name: "integrity",
      duration: 3.1,
      counters: {
        files: 5
      }
    }, {
      name: "compile",
      duration: 295.4,
      counters: {
        modules: 4
      }
    }, {
      name: "rewrite",
      duration: 61.8,
      counters: {
        modules: 9
      }
    }, {
      name: "tailwind",
      duration: 48.2,
      counters: {
        builds: 1
      }
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Show page load"
    });
    await userEvent.hover(trigger);
    await expect(within(document.body).getByText("4 modules")).toBeVisible();
  }
}`,...d.parameters?.docs?.source},description:{story:"A client-side load reported in the same shape: `title` renames the card, and phases are work summed over requests.",...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Page load",
    metrics: [{
      name: "total",
      duration: 963,
      counters: {}
    }, {
      name: "compile",
      duration: 295.4,
      counters: {
        modules: 4
      }
    }],
    footer: <button type="button" className="text-xs text-primary underline">Build log…</button>
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", {
      name: "Show page load"
    }));
    await expect(within(document.body).getByRole("button", {
      name: "Build log…"
    })).toBeVisible();
  }
}`,...f.parameters?.docs?.source},description:{story:"`footer` adds content under the breakdown, such as a link to the full build log.",...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}}})))()}h();export{l as Default,p as MultiSecond,u as NoBackendActivity,d as PageLoad,f as WithFooter,m as __namedExportsOrder,c as default};
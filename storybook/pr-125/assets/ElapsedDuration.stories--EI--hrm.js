import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{n,t as r}from"./ElapsedDuration-Cbob5VbD.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{n(),i=t(),a={title:`Charts/ElapsedDuration`,component:r,argTypes:{startedAt:{control:`text`},finishedAt:{control:`text`},format:{table:{disable:!0}},fallback:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"A run's duration derived from its `startedAt` / `finishedAt` timestamps, since the task stream carries no duration. Ticks once a second while the run is unfinished and holds the span between the timestamps once it ends. Renders `fallback` (nothing by default) before the run has started."}}}},o={args:{startedAt:`2026-10-15T07:00:00Z`,finishedAt:`2026-10-15T07:01:30Z`}},s={args:{startedAt:new Date(Date.now()-42e3).toISOString(),finishedAt:void 0}},c={args:{startedAt:void 0,finishedAt:void 0,fallback:(0,i.jsx)(`span`,{className:`text-muted-foreground`,children:`—`})}},l=[`Finished`,`Running`,`NotStarted`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    startedAt: "2026-10-15T07:00:00Z",
    finishedAt: "2026-10-15T07:01:30Z"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    startedAt: new Date(Date.now() - 42_000).toISOString(),
    finishedAt: undefined
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    startedAt: undefined,
    finishedAt: undefined,
    fallback: <span className="text-muted-foreground">—</span>
  }
}`,...c.parameters?.docs?.source}}}})))()}u();export{o as Finished,c as NotStarted,s as Running,l as __namedExportsOrder,a as default};
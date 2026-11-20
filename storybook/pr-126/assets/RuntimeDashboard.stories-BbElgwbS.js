import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{o as t,u as n}from"./classes-BFK0cEJ7.js";import{n as r,t as i}from"./RuntimeDashboard-ez5zpt59.js";var a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`JVM/RuntimeDashboard`,component:i,parameters:{layout:`padded`},args:{metrics:t,onRefresh:()=>{}}},c={play:async({canvasElement:e})=>{let t=o(e);await a(t.getByText(`Process CPU`)).toBeInTheDocument(),await a(t.getByText(`G1 Old Gen`)).toBeInTheDocument(),await a(t.getByRole(`region`,{name:`Data sources`})).toBeInTheDocument()}},l={args:{metrics:{...t,processCpuPercent:94.2,runtime:{...t.runtime,systemLoadAverage:7.9}}}},u={args:{metrics:{...t,processCpuPercent:null,runtime:{...t.runtime,systemLoadAverage:-1}}},play:async({canvasElement:e})=>{await a(o(e).getAllByText(`Unavailable`).length).toBeGreaterThanOrEqual(2)}},d={args:{metrics:{...t,connectors:[],dataSources:[]}}},f=[`Snapshot`,`Busy`,`CpuAndLoadUnavailable`,`NoPoolTables`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Process CPU")).toBeInTheDocument();
    await expect(canvas.getByText("G1 Old Gen")).toBeInTheDocument();
    await expect(canvas.getByRole("region", {
      name: "Data sources"
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: {
      ...METRICS,
      processCpuPercent: 94.2,
      runtime: {
        ...METRICS.runtime,
        systemLoadAverage: 7.9
      }
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: {
      ...METRICS,
      processCpuPercent: null,
      runtime: {
        ...METRICS.runtime,
        systemLoadAverage: -1
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getAllByText("Unavailable").length).toBeGreaterThanOrEqual(2);
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    metrics: {
      ...METRICS,
      connectors: [],
      dataSources: []
    }
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{l as Busy,u as CpuAndLoadUnavailable,d as NoPoolTables,c as Snapshot,f as __namedExportsOrder,s as default};
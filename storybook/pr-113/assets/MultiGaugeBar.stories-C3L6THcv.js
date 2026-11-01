import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{a as n,t as r}from"./format-FR4vn-Lv.js";import{n as i,t as a}from"./MultiGaugeBar-_s6Zbvkq.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),n(),o=t(),s={title:`Charts/MultiGaugeBar`,component:a,args:{label:`CPU`,average:1.24,max:4,unit:`cores`,formatValue:e=>String(Number(e.toFixed(2))),markers:[{label:`Request`,value:2,shape:`pointer`,tone:`info`},{label:`P90`,value:2,tone:`warning`},{label:`P95`,value:2.4,tone:`danger`},{label:`Limit`,value:4,shape:`pointer`}]},parameters:{layout:`padded`,docs:{description:{component:`A single shared scale with usage inside the green fill and the numeric maximum beside the track. Small downward pointers show requests, percentiles and limits; semantic tones distinguish each measure. Use icon for a header icon, unit for the maximum caption and formatValue for numeric formatting. Observations above max expand the scale; coincident pointers stack without shifting their values. The "cell" variant omits the card, scale ticks and legend, retaining exact marker values in its tooltip and accessible name.`}}}},c={},l={},u={args:{variant:`cell`},decorators:[e=>(0,o.jsx)(`div`,{className:`w-80 max-w-full`,children:(0,o.jsx)(e,{})})]},d={args:{label:`Memory`,unit:``,formatValue:r,average:1382*1024**2,max:4*1024**3,markers:[{label:`Request`,value:2*1024**3,shape:`pointer`,tone:`info`},{label:`P90`,value:2662*1024**2,tone:`warning`},{label:`P95`,value:3174*1024**2,tone:`danger`},{label:`Limit`,value:4*1024**3,shape:`pointer`}]}},f={args:{markers:[{label:`Request`,value:2,shape:`pointer`,tone:`info`},{label:`P90`,value:2,tone:`warning`},{label:`P95`,value:2,tone:`danger`},{label:`Limit`,value:4,shape:`pointer`}]}},p={args:{max:4,markers:[{label:`Request`,value:2,shape:`pointer`,tone:`info`},{label:`P90`,value:3.8,tone:`warning`},{label:`P95`,value:5,tone:`danger`},{label:`Limit`,value:4,shape:`pointer`}]}},m={args:{average:0,max:0,markers:[{label:`Max`,value:0}]}},h=[`Default`,`KubernetesCPU`,`TableCell`,`KubernetesMemory`,`Coincident`,`AboveLimit`,`Zero`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "cell"
  },
  decorators: [Story => <div className="w-80 max-w-full">
        <Story />
      </div>]
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Memory",
    unit: "",
    formatValue: formatBytes,
    average: 1382 * 1024 ** 2,
    max: 4 * 1024 ** 3,
    markers: [{
      label: "Request",
      value: 2 * 1024 ** 3,
      shape: "pointer",
      tone: "info"
    }, {
      label: "P90",
      value: 2662 * 1024 ** 2,
      tone: "warning"
    }, {
      label: "P95",
      value: 3174 * 1024 ** 2,
      tone: "danger"
    }, {
      label: "Limit",
      value: 4 * 1024 ** 3,
      shape: "pointer"
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    markers: [{
      label: "Request",
      value: 2,
      shape: "pointer",
      tone: "info"
    }, {
      label: "P90",
      value: 2,
      tone: "warning"
    }, {
      label: "P95",
      value: 2,
      tone: "danger"
    }, {
      label: "Limit",
      value: 4,
      shape: "pointer"
    }]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    max: 4,
    markers: [{
      label: "Request",
      value: 2,
      shape: "pointer",
      tone: "info"
    }, {
      label: "P90",
      value: 3.8,
      tone: "warning"
    }, {
      label: "P95",
      value: 5,
      tone: "danger"
    }, {
      label: "Limit",
      value: 4,
      shape: "pointer"
    }]
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    average: 0,
    max: 0,
    markers: [{
      label: "Max",
      value: 0
    }]
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as AboveLimit,f as Coincident,c as Default,l as KubernetesCPU,d as KubernetesMemory,u as TableCell,m as Zero,h as __namedExportsOrder,s as default};
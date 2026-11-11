import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopView, type TopViewState } from "./TopView";

const meta = { title:"Data/Traces/TopView", component:TopView, tags:["autodocs"] } satisfies Meta<typeof TopView>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example({memory=false}:{memory?:boolean}) {
  const [state,setState]=useState<TopViewState>({frame:"",source:"",metric:"",view:"",search:"",zoom:"",paused:false});
  const frame={id:"checkpoint-1",source:memory?"example-worker/heap":"example-worker/cpu",startedAt:"2026-11-11T10:00:00Z",completedAt:"2026-11-11T10:00:01Z",observed:2,retained:2,limit:0};
  const metric={key:memory?"inuse_space":"cpu",label:memory?"In-use bytes":"CPU time",unit:memory?"bytes":"ns",view:memory?"treemap":"flamegraph"};
  return <div className="h-[32rem]"><TopView frames={[frame]} frame={frame} metrics={[metric]} state={state} onChange={next=>setState(previous=>({...previous,...next}))} onRefresh={()=>setState(previous=>({...previous,frame:frame.id}))}
    hierarchy={{metric:metric.key,unit:metric.unit,root:{id:"root",label:"All stacks",self:0,total:100,children:[{id:"worker",label:"worker.Run",self:70,total:70,children:[]},{id:"cache",label:"cache.Load",self:30,total:30,children:[]}]}}}
    table={{version:1,node:{kind:"table",columns:[{name:"seq",defaultHidden:true},{name:"function",label:"Function"},{name:"value",label:metric.label}],rows:[{cells:{seq:{kind:"text",filterValue:1},function:{kind:"text",text:"worker.Run"},value:{kind:"text",text:"70",filterValue:70}},detail:{kind:"code",language:"go",source:"func Run() { /* recorded stack */ }"}},{cells:{seq:{kind:"text",filterValue:2},function:{kind:"text",text:"cache.Load"},value:{kind:"text",text:"30",filterValue:30}}}]}}} /></div>;
}
export const CPU:Story={render:()=> <Example />};
export const Memory:Story={render:()=> <Example memory />};

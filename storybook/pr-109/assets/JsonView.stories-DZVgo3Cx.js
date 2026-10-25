import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./JsonView-C6SETu6b.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{i=100,a=100,o=JSON.stringify({totalRecords:1e4,batches:Object.fromEntries(Array.from({length:a},(e,t)=>[`batch-${String(t).padStart(3,`0`)}`,{recordCount:i,records:Array.from({length:i},(e,n)=>{let r=t*i+n;return{id:`record-${String(r).padStart(5,`0`)}`,service:r%2==0?`api`:`worker`,enabled:r%5!=0,durationMs:r*13%900,tags:[`example`,`batch-${t}`],description:`Record ${r} completed its scheduled work and reported its current health. `.repeat(4)}})}]))}),s=`{
  "requestId": "run-0042",
  "service": {
    "name": "api",
    "metrics": { "ready": true, "requests": 128, "latencyMs":`,c=`{
  "service": "api",
  "ports": [8080, 9090, { "name": "metrics", "port":`,l=`{
  "service": "worker",
  "enabled": true,
  "message": "The worker was processing a record when`,u=`{"timestamp":"2026-01-01T09:00:00Z","service":"api","status":"healthy","requests":128}
{"timestamp":"2026-01-01T09:00:01Z","service":"worker","status":"healthy","jobs":42}
{"timestamp":"2026-01-01T09:00:02Z","service":"scheduler","status":"running","message":"Job started but the connection`})))()}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{n(),d(),f=t(),p={title:`Data/JsonView`,component:r,args:{defaultOpenDepth:2,format:`yaml`},argTypes:{data:{description:`Parsed value to display. Mutually exclusive with source; strings remain literal values.`},source:{control:`text`,description:`Raw JSON or NDJSON text. Mutually exclusive with data; interrupted input retains completed values.`,table:{type:{summary:`string`}}},inputFormat:{description:`Encoding of source: one JSON document or one JSON value per nonempty NDJSON line. Defaults to json.`,control:`inline-radio`,options:[`json`,`ndjson`],table:{type:{summary:`"json" | "ndjson"`},defaultValue:{summary:`json`}}},format:{description:`Display syntax, independent of inputFormat. Defaults to YAML; JSON uses braces and quoted strings.`,control:`inline-radio`,options:[`yaml`,`json`],table:{type:{summary:`"yaml" | "json"`},defaultValue:{summary:`yaml`}}},density:{description:`Override the inherited application density with compact, comfortable, or spacious rows.`,control:`select`,options:[`compact`,`comfortable`,`spacious`],table:{type:{summary:`"compact" | "comfortable" | "spacious"`},defaultValue:{summary:`Inherited`}}}},parameters:{docs:{description:{component:`Collapsible structured-data viewer with YAML as the default format. Pass a parsed value with data, or raw text with source and inputFormat="json" or "ndjson". Cut-off input shows completed values with an incomplete warning; malformed syntax shows a diagnostic. NDJSON keeps complete records in order, ignores blank lines, and labels an incomplete final record separately. Original source stays inspectable. Set format="json" for braces and quoted strings. Density follows the application or Storybook toolbar; the density prop overrides it for one viewer.`}}}},m={args:{name:`config`,data:{name:`scraper`,enabled:!0,retries:3,tags:[`alpha`,`beta`],owner:null,metadata:{created:`2026-01-01`,stats:{runs:42,failures:2}}}}},h={args:{data:{a:{b:{c:{d:{e:`deep`}}}}},defaultOpenDepth:3}},g={args:{data:{obj:{},arr:[]}}},_={args:{...m.args,format:`json`}},v={args:{...m.args,density:`compact`}},y={args:{...m.args,density:`comfortable`}},b={args:{...m.args,density:`spacious`}},x={args:{defaultOpenDepth:4,data:{strings:[`true`,`null`,`42`,``,`a: b`,`first
second`],"special: key":`safely quoted`,services:[{name:`api`,ports:[8080,9090]},{name:`worker`,ports:[]}]}}},S={args:{source:o,defaultOpenDepth:1},argTypes:{source:{control:!1}},decorators:[e=>(0,f.jsx)(`div`,{className:`h-[32rem] overflow-auto`,children:(0,f.jsx)(e,{})})],parameters:{docs:{description:{story:`10,000 deterministic records in 100 batches, ${(o.length/1024/1024).toFixed(1)} MiB of raw JSON. Expand batches, then a batch and its records. All records are retained; only expanded branches mount their children.`},source:{code:`<JsonView source={largeJsonSource} defaultOpenDepth={1} />`}}}},C={args:{source:s,defaultOpenDepth:4},parameters:{docs:{description:{story:`The document ends inside a nested object. Completed metrics remain visible; the pending latency value is omitted. Open Original source to inspect the exact cut-off text.`}}}},w={args:{source:c,defaultOpenDepth:4},parameters:{docs:{description:{story:`The document ends inside an array item. Completed ports and the final item's completed name remain inspectable.`}}}},T={args:{source:l},parameters:{docs:{description:{story:`The document ends inside a string. The unfinished message is omitted rather than presented as a completed value.`}}}},E={name:`NDJSON`,args:{source:u,inputFormat:`ndjson`,defaultOpenDepth:3},parameters:{docs:{description:{story:`Two complete log records followed by an interrupted third record. Completed records retain their order; recovered fields from line 3 are shown separately with an incomplete label.`}}}},D=[`MixedTypes`,`DeepNested`,`EmptyContainers`,`Json`,`Compact`,`Comfortable`,`Spacious`,`YamlStringsAndSequences`,`VeryLargeJson`,`TruncatedJson`,`TruncatedArray`,`TruncatedString`,`Ndjson`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    name: "config",
    data: {
      name: "scraper",
      enabled: true,
      retries: 3,
      tags: ["alpha", "beta"],
      owner: null,
      metadata: {
        created: "2026-01-01",
        stats: {
          runs: 42,
          failures: 2
        }
      }
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      a: {
        b: {
          c: {
            d: {
              e: "deep"
            }
          }
        }
      }
    },
    defaultOpenDepth: 3
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      obj: {},
      arr: []
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    format: "json"
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "compact"
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "comfortable"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "spacious"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpenDepth: 4,
    data: {
      strings: ["true", "null", "42", "", "a: b", "first\\nsecond"],
      "special: key": "safely quoted",
      services: [{
        name: "api",
        ports: [8080, 9090]
      }, {
        name: "worker",
        ports: []
      }]
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    source: largeJsonSource,
    defaultOpenDepth: 1
  },
  argTypes: {
    source: {
      control: false
    }
  },
  decorators: [Story => <div className="h-[32rem] overflow-auto">
        <Story />
      </div>],
  parameters: {
    docs: {
      description: {
        story: \`10,000 deterministic records in 100 batches, \${(largeJsonSource.length / 1024 / 1024).toFixed(1)} MiB of raw JSON. Expand batches, then a batch and its records. All records are retained; only expanded branches mount their children.\`
      },
      source: {
        code: "<JsonView source={largeJsonSource} defaultOpenDepth={1} />"
      }
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    source: truncatedObjectSource,
    defaultOpenDepth: 4
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside a nested object. Completed metrics remain visible; the pending latency value is omitted. Open Original source to inspect the exact cut-off text."
      }
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    source: truncatedArraySource,
    defaultOpenDepth: 4
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside an array item. Completed ports and the final item's completed name remain inspectable."
      }
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    source: truncatedStringSource
  },
  parameters: {
    docs: {
      description: {
        story: "The document ends inside a string. The unfinished message is omitted rather than presented as a completed value."
      }
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "NDJSON",
  args: {
    source: ndjsonSource,
    inputFormat: "ndjson",
    defaultOpenDepth: 3
  },
  parameters: {
    docs: {
      description: {
        story: "Two complete log records followed by an interrupted third record. Completed records retain their order; recovered fields from line 3 are shown separately with an incomplete label."
      }
    }
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{y as Comfortable,v as Compact,h as DeepNested,g as EmptyContainers,_ as Json,m as MixedTypes,E as Ndjson,b as Spacious,w as TruncatedArray,C as TruncatedJson,T as TruncatedString,S as VeryLargeJson,x as YamlStringsAndSequences,D as __namedExportsOrder,p as default};
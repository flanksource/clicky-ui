import{j as o}from"./iframe-BK7fwFVO.js";import{a as b}from"./Clicky-COPmvnnA.js";import{b as v}from"./Clicky.fixtures-DVhrZ9FN.js";import"./preload-helper-CLp6iKya.js";import"./suspense-DXYiKKoj.js";import"./useQuery-BgG-ytUO.js";import"./FilterForm-DdjQ7OdZ.js";import"./button-DS4U28PS.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BztHiUUa.js";import"./TimeRange-DYJJaAnO.js";import"./floating-ui.react-BL5nOemE.js";import"./index-V9FlwRvu.js";import"./index-DVBV8i_H.js";import"./Icon-Cpi1U54P.js";import"./modalStack-CjOkifgI.js";import"./zIndex-CigQ76av.js";import"./select-D-m8DqrR.js";import"./FilterPill-B5hPcLLg.js";import"./types-BHfRQr8X.js";import"./DataTable-LMknVRp3.js";import"./SortableHeader-DA-U7gZG.js";import"./router-uBAxT-6M.js";import"./Modal-L0nIPibr.js";import"./FilterBar-DV6caApW.js";import"./Combobox-DCYTyLTI.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DBzV17pY.js";import"./MultiSelect-zI3Y2P5q.js";import"./RangeSlider-DBFppoNm.js";import"./Timestamp-DelhVuZM.js";import"./TagList-C0Ci8sg4.js";import"./Badge-XzN9bViS.js";import"./HoverCard-CDlOtfM7.js";import"./Properties-Bt7pawV3.js";import"./IconButton-ChMresRY.js";import"./DropdownMenu-DdTklBUI.js";import"./DropdownMenuSubmenu-cYb_KbbW.js";import"./StatusDot-D0V8uoBU.js";import"./Tree-Bc__1QSo.js";import"./TreeNode-BnV1ej7P.js";import"./ObjectGraph-BCsjxhAj.js";import"./ExecutionTree-DBL-AsDp.js";import"./CodeBlock-uBm2JK41.js";import"./CodeDiff-CVe5jhFr.js";import"./SegmentedControl-B4nMRczM.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-D2jKV3Rg.js";import"./RenderedStackTrace-BVW8i3Ur.js";const f={kind:"text",children:[{kind:"badge",badgeLabel:"region",badgeValue:"us-east",badgeColor:"#0f766e"},{kind:"text",text:" "},{kind:"text",text:"cluster is accepting traffic"}]},ye={title:"Data/Clicky/NodeView",component:b,args:{node:f},parameters:{docs:{description:{component:"Lower-level Clicky renderer for a single node. Use it when the host already owns the surrounding document chrome and only needs to render one Clicky AST node."}}}},e={render:y=>o.jsx("div",{className:"rounded-md border border-border bg-background p-density-3",children:o.jsx(b,{...y})})},t={args:{node:{kind:"code",language:"json",source:JSON.stringify({requests:12492,errors:3},null,2)}}},n={args:{node:v}},r={args:{node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}}};var i,a,d;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="rounded-md border border-border bg-background p-density-3">
      <ClickyNodeView {...args} />
    </div>
}`,...(d=(a=e.parameters)==null?void 0:a.docs)==null?void 0:d.source}}};var s,m,p;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    node: {
      kind: "code",
      language: "json",
      source: JSON.stringify({
        requests: 12492,
        errors: 3
      }, null, 2)
    }
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var c,l,k;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    node: clickyMarkdownBlocksNode
  }
}`,...(k=(l=n.parameters)==null?void 0:l.docs)==null?void 0:k.source}}};var x,u,g;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    node: {
      kind: "list",
      unstyled: true,
      items: [{
        kind: "admonition",
        severity: "note",
        label: {
          kind: "text",
          text: "Note"
        },
        content: {
          kind: "text",
          text: "Board approval is tracked separately."
        }
      }, {
        kind: "admonition",
        severity: "info",
        label: {
          kind: "text",
          text: "Information"
        },
        content: {
          kind: "text",
          text: "Comparatives use the prior reporting pack."
        }
      }, {
        kind: "admonition",
        severity: "tip",
        label: {
          kind: "text",
          text: "Tip"
        },
        content: {
          kind: "text",
          text: "Attach the signed trial balance before export."
        }
      }, {
        kind: "admonition",
        severity: "warning",
        label: {
          kind: "text",
          text: "Warning"
        },
        content: {
          kind: "text",
          text: "Manual review is required for this note."
        }
      }, {
        kind: "admonition",
        severity: "danger",
        label: {
          kind: "text",
          text: "Danger"
        },
        content: {
          kind: "text",
          text: "Publication is blocked until cash reconciles."
        }
      }]
    }
  }
}`,...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const ve=["Default","CodeNode","MarkdownBlocks","AdmonitionSeverities"];export{r as AdmonitionSeverities,t as CodeNode,e as Default,n as MarkdownBlocks,ve as __namedExportsOrder,ye as default};

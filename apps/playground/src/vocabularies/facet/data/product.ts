const item = (id: string, description: string) => ({
  catalog: "facet",
  type: "product",
  id: `product/${id}`,
  label: `product/${id}`,
  description,
  references: ["apps/playground/src/vocabularies/facet/specimens/vocabulary/products.tsx#ProductStyles"],
  section: "product-styles",
});

export default [
  item("box", "A product that is one component: logo, name and role in a white box with the brand accent stripe"),
  item("box-filled", "The figure's subject product: brand-colour fill with a white logo and label"),
  item("tile", "A well-known product shown as its logo tile with the name below"),
  item("logo", "Logo only, in its own colours, for legends and dense rows"),
  item("container", "A product that owns the components inside it: brand-colour edge with a filled edge badge and white logo"),
  item("container-outline", "A lighter product container: brand-colour edge with an outlined edge badge and the logo in its own colours"),
  item("container-tinted", "The one subject product of a figure as a container: brand tint, logo and name as its title"),
  item("badge", "Tags a group, note or step with the product that supplies it: brand-colour fill, white logo"),
  item("badge-outline", "A lighter product tag for lists: brand-colour outline with the logo in its own colours"),
  item("badge-corner", "A filled product badge on a component's corner: built on or supplied by this product"),
];

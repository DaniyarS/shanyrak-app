export class WasteCategory {
  constructor({
    id,
    slug,
    name,
    nameKz,
    nameEn,
    icon,
    children = null,
    parent = null
  }) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.nameKz = nameKz;
    this.nameEn = nameEn;
    this.icon = icon;
    this.children = children;
    this.parent = parent;

    Object.freeze(this);
  }

  isLeaf() {
    return !this.children || this.children.length === 0;
  }

  getLocalizedName(language) {
    switch (language) {
      case 'kk':
        return this.nameKz || this.name;
      case 'en':
        return this.nameEn || this.name;
      default:
        return this.name;
    }
  }
}

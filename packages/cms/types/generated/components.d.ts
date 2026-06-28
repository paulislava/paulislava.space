import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_items';
  info: {
    description: '';
    displayName: 'FaqItem';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_sections';
  info: {
    description: '';
    displayName: 'FaqSection';
    icon: 'question';
  };
  attributes: {
    items: Schema.Attribute.Component<'sections.faq-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsMdxSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_mdx_sections';
  info: {
    description: '';
    displayName: 'MdxSection';
    icon: 'code';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.faq-item': SectionsFaqItem;
      'sections.faq-section': SectionsFaqSection;
      'sections.mdx-section': SectionsMdxSection;
    }
  }
}

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
    displayName: 'ComponentMdx';
    icon: 'code';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    Content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
  };
}

export interface VodomerFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_faq_item';
  info: {
    displayName: '\u0412\u043E\u043F\u0440\u043E\u0441 \u0438 \u043E\u0442\u0432\u0435\u0442';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VodomerFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_faq_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u0427\u0430\u0441\u0442\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    entries: Schema.Attribute.Component<'vodomer.faq-item', true>;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    title: Schema.Attribute.String;
  };
}

export interface VodomerFormField extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_form_fields';
  info: {
    displayName: '\u041F\u043E\u043B\u0435 \u0444\u043E\u0440\u043C\u044B';
    icon: 'pencil';
  };
  attributes: {
    autocomplete: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    helpText: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.JSON;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    type: Schema.Attribute.Enumeration<
      [
        'text',
        'tel',
        'email',
        'select',
        'textarea',
        'date',
        'time',
        'datetime',
        'checkbox',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface VodomerFormSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_form_sections';
  info: {
    displayName: '\u0424\u043E\u0440\u043C\u0430 \u0441 \u0442\u0435\u043A\u0441\u0442\u043E\u043C';
    icon: 'envelop';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    form: Schema.Attribute.Relation<
      'manyToOne',
      'api::vodomer-form.vodomer-form'
    >;
    leftMdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    phonePrimary: Schema.Attribute.String;
    phoneSecondary: Schema.Attribute.String;
  };
}

export interface VodomerHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_hero_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    eyebrow: Schema.Attribute.String;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    note: Schema.Attribute.String;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface VodomerProcessSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_process_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u041F\u043E\u0440\u044F\u0434\u043E\u043A \u0440\u0430\u0431\u043E\u0442\u044B';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    entries: Schema.Attribute.Component<'vodomer.process-step', true>;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    title: Schema.Attribute.String;
  };
}

export interface VodomerProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_process_step';
  info: {
    displayName: '\u0428\u0430\u0433 \u0440\u0430\u0431\u043E\u0442\u044B';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VodomerPromotionSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_promotion_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u0410\u043A\u0446\u0438\u044F';
    icon: 'layer-group';
  };
  attributes: {
    anchorAt: Schema.Attribute.DateTime;
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    discountRub: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    endsAt: Schema.Attribute.DateTime;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    resetDays: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    text: Schema.Attribute.Text;
    timingMode: Schema.Attribute.Enumeration<['rolling', 'fixed']> &
      Schema.Attribute.DefaultTo<'rolling'>;
    title: Schema.Attribute.String;
  };
}

export interface VodomerReassurancePoint extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_reassurance_point';
  info: {
    displayName: '\u041F\u0443\u043D\u043A\u0442 \u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0435';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VodomerReassuranceSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_reassurance_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u041E \u043F\u043E\u0434\u0445\u043E\u0434\u0435';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    entries: Schema.Attribute.Component<'vodomer.reassurance-point', true>;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface VodomerSectionConfig extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_section_config';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: 'Config';
    icon: 'layer-group';
  };
  attributes: {
    hideSection: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface VodomerServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_service_item';
  info: {
    displayName: '\u0423\u0441\u043B\u0443\u0433\u0430';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<['check', 'refresh', 'plus', 'gauge']> &
      Schema.Attribute.DefaultTo<'gauge'>;
    note: Schema.Attribute.String;
    price: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VodomerServicesSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_services_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u0423\u0441\u043B\u0443\u0433\u0438';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    entries: Schema.Attribute.Component<'vodomer.service-item', true>;
    intro: Schema.Attribute.Text;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
    title: Schema.Attribute.String;
  };
}

export interface VodomerTrustItem extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_trust_item';
  info: {
    displayName: '\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VodomerTrustStripSection extends Struct.ComponentSchema {
  collectionName: 'components_vodomer_trust_strip_section';
  info: {
    description: '\u0421\u0435\u043A\u0446\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0412\u043E\u0434\u043E\u043C\u0435\u0440 \u0423\u0440\u0430\u043B';
    displayName: '\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430 \u0432 \u0441\u0442\u0440\u043E\u043A\u0435';
    icon: 'layer-group';
  };
  attributes: {
    config: Schema.Attribute.Component<'vodomer.section-config', false>;
    entries: Schema.Attribute.Component<'vodomer.trust-item', true>;
    mdx: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<'plugin::mdx.mdx'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.faq-item': SectionsFaqItem;
      'sections.faq-section': SectionsFaqSection;
      'sections.mdx-section': SectionsMdxSection;
      'vodomer.faq-item': VodomerFaqItem;
      'vodomer.faq-section': VodomerFaqSection;
      'vodomer.form-field': VodomerFormField;
      'vodomer.form-section': VodomerFormSection;
      'vodomer.hero-section': VodomerHeroSection;
      'vodomer.process-section': VodomerProcessSection;
      'vodomer.process-step': VodomerProcessStep;
      'vodomer.promotion-section': VodomerPromotionSection;
      'vodomer.reassurance-point': VodomerReassurancePoint;
      'vodomer.reassurance-section': VodomerReassuranceSection;
      'vodomer.section-config': VodomerSectionConfig;
      'vodomer.service-item': VodomerServiceItem;
      'vodomer.services-section': VodomerServicesSection;
      'vodomer.trust-item': VodomerTrustItem;
      'vodomer.trust-strip-section': VodomerTrustStripSection;
    }
  }
}

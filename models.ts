export interface Gmaps {
    lat: number;
    lng: number;
    zoom: number;
    title: string;
    content: string;
};

export interface news {
    type: 'conseil'|'actu',
    uid: string;
    date: string;
    title: string;
    subtitle: string;
    
}

export interface Image {
    src: string;
    alt: string;
}

export interface Link {
    text: string;
    href: string;
    title: string;
}

export interface Button {
    text: string;
    title: string;
}

export interface Expertise {
    linked: string;
    sticker: string;
    title: string;
    img: Image;
    content: string;
    button: Button;
}

export interface Hero {
    title: string;
    subtitle: string;
}


export interface Certification {
    title: string;
    content: string;
    logos: Array<Image>;
}

export interface Partner {
    title: string;
    content: string;
    logos: Array<Image>;
}

export interface Map {
    title: string;
    content: string;
    map: Gmaps;
}

export interface Presentation {
    title: string;
    content: string;
}

export interface Menu {
    link: Link;
    categories: Array<Category>;
}

export interface Homepage {
    breadcrumb: string;
    seo: Seo;
    hero: Hero;
    expertises: Array<Expertise>;
    certification: Certification;
    partner: Partner;
    map: Map;
    presentation: Presentation;
}

export interface Intro {
    image: Image;
    text: string;
}

export interface Teaser {
    title: string;
    text: string;
    link: Link;
}

export interface IndexPage {
    breadcrumb: string;
    seo: Seo;
    hero: Hero;
    intro: Intro;
    teasers: Array<Teaser>;
}

export interface Content {
    title: string;
    text: string;
}

export interface Related {
    title: string;
    links: Array<Link>;
}

export interface Seo {
    title: string;
    description: string;
    opengraph: {
        site_name: string;
        type: string;
        locale: string;
        title: string;
        description: string;
        image: Image;
    }
}

export interface ContentPage {
    breadcrumb: string;
    seo: Seo;
    hero: Hero;
    intro: Intro;
    related: Related|null;
}

export interface News {
    breadcrumb: string;
    seo: Seo;
    url: Link;
    type: "conseils" | "actualités";
    date: Date;
    image: Image;
    title: Text;
    chapo: string;
    paragraphs: [ { title:string, text: string} ] 
}

export interface ActuIntro {
    breadcrumb: string;
    seo: Seo;
    title: string;
    subtitle: string;
    content: string;
    news: Array<News>
}

export interface ActuPage {
    breadcrumb: string;
    seo: Seo;
    title: string;
    chapo: string;
    intro: string;
    image: Image;
    paragraphs: [{
        title: string;
        text: string;
    }]
}

export interface Brand {
    name: string;
    description: string;
    map_url: string;
    website_url: string;
    phone: string;
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
    geo: {
        lat: number;
        lng: number;
    };
    favicon: string;
    logo: string;
    image: string;
    avis_verifies: string;
    piwik_token: string;
    opening_hours: Array<string>;
    footer_links: Array<Link>;
    socials: Array<Link>;
    sameAs: Array<string>;
}

export interface Category {
    title: string;
    link: Link|null;
    subLinks: Array<Link>;
}
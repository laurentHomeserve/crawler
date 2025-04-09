import * as cheerio from 'cheerio';
import {Menu, Link, Homepage, Expertise, Hero, Gmaps, Brand, Category} from './models';
import { get } from 'http';
import { getSeo } from './getSEO';

export function getBrand(html: string): Brand {
    const $ = cheerio.load(html);
    const meta = $('script[type=application/ld+json]').text();

    const ico = $('link[rel="icon"][sizes="32x32"]').attr('href') ?? '';

    let piwik = '';
    $('script').toArray().map((el) => {
        const text = $(el).text() ?? '';

        if (text.includes('piwikCookie')) {
            const match = text.match(/"([a-f0-9\-]{36})"/i);
            piwik = match ? match[1] : '';
        }
    });

    const skeeper = $('#AV_widget_iframe').attr('src') ?? '';
    const match = skeeper.match(/([a-f0-9\-]{36})/i);
    const avisVerifiesID = match ? match[1] : '';

    const json = JSON.parse(meta);

    return {
        name: json.name,
        description: json.description,
        map_url: json.hasMap,
        website_url: json['@id'],
        phone: json.telephone,
        streetAddress: json.address.streetAddress,
        addressLocality: json.address.addressLocality,
        postalCode: json.address.postalCode,
        addressCountry: json.address.addressCountry,
        geo: {
            lat: json.geo.latitude,
            lng: json.geo.longitude
        },
        favicon: ico,
        logo: json.logo,
        image: json.image,
        avis_verifies: avisVerifiesID,
        piwik_token: piwik,
        opening_hours: json.openingHours,
        footer_links: [],
        socials: [],
        sameAs: json.sameAs
    }
}

export function getMenu(html: string): Array<Menu> {

    const $ = cheerio.load(html);

    let mainMenu: Array<Menu> = [];

    $('#navbar-collapse ul.navbar-nav li.dropdown').not('#dropdown-right').each((i, el) => {
        let link: Link = {
            text: $(el).children('a').text()?.trim(),
            href: $(el).children('a').attr('href') ?? '',
            title: $(el).children('a').attr('title') ?? ''            
        } 
    
        let subLinks: Array<Link> = []
        let categories: Array<Category> = [];
        let currentCategory = null;

        $(el).find('ul li').toArray().forEach((el) => {
            if ($(el).find('img').length > 0) {
                if (currentCategory !== null) {
                    categories.push(currentCategory);
                    currentCategory = null;
                }
                
                currentCategory = { title: $(el).text().trim() };

                if ($(el).find('a').length > 0) {
                    const a = $(el).find('a').first();
                    const link: Link = {
                        text: a.text()?.trim(),
                        href: a.attr('href') ?? '',
                        title: a.attr('title') ?? ''
                    }
                    const categoryWithLink = { ...currentCategory, link}
                    currentCategory = categoryWithLink;
                }
                subLinks = [];
            } else {
                const a = $(el).find('a').first();

                subLinks.push({
                    text: a.text()?.trim(),
                    href: a.attr('href') ?? '',
                    title: a.attr('title') ?? ''  
                })

                const categoryWithSubMenu = { ...currentCategory, subLinks}
                currentCategory = categoryWithSubMenu;
            }
        });

        if (null !== currentCategory) {
            categories.push(currentCategory);
        }
        

        if (!!link.href) {
            mainMenu.push({
                link: link,
                categories: categories
            });
        }
    })

    return mainMenu;
}

export function parseHomePage(html: string): Homepage {

    const $ = cheerio.load(html);

    const scripts  = $('script').filter((index:number, el) => {
        return $(el).text().search(/myLatLng/) > 0;
      });

    var scriptContent :string = scripts.first().text();


    let expertises: Array<Expertise> = [];
    $('figure.expertise').each((index:number, el: Element) => {
        expertises.push(getExpertise(el, $));
    });

    let hero: Hero = {
        title: $('div.hero h1.title').text(),
        subtitle: $('div.hero h2.subtitle').text()
    };

    let sections: Element = $('div.expertises').nextAll();
    
    let section: Element = sections.first();

    let title = $(section).find('h2').text();
    let content = $(section).find('p').html()?.trim();

    var imgs: Array<image> = [];
    $(section).find('img').each(function(index, el) {
        imgs.push({
            src: $(el).attr('src') ?? '',
            alt: $(el).attr('alt') ?? ''
        });
    });

    let cert: Certification = {
        title: title,
        content: content ?? '',
        logos: imgs
    }

    let sectionHtmlPartner: string = $('div.row').eq(2).html() ?? '';

    let partner = cheerio.load(sectionHtmlPartner);

    imgs = []
    partner('img').each(function (i, el) {
        imgs.push({
            src: $(el).attr('src'),
            alt: $(el).attr('alt')
        });
    })

    let partnerInfo: Partner = {
        title: partner('h2').text(),
        content: partner('p').html()?.trim() ?? '',
        logos: imgs
    };

    let map: Map = {
        title: $('div.row.maps').find('h2').text(),
        content: $('div.row.maps').find('div:first').html()?.trim() ?? '',
        map: getGmap(scriptContent)
    };

    let presentation = {
        title: $('div.row').eq(4).find('h2').text(),
        content: $('div.row').eq(4).find('div').html()?.trim() ?? '',
    }

    return {
        breadcrumb: $('ul.breadcrumb li.active').text().trim() ?? '',
        seo: getSeo($('head').html()??''),
        hero: hero,
        expertises: expertises,
        certification: cert,
        partner: partnerInfo,
        map: map,
        presentation: presentation
    };
}

function getExpertise(el: Element, $: cheerio.CheerioAPI): Expertise {
    let link = $(el).find('.icn-link > a').attr('href') ?? '';

    try {
        link = URL.parse(link)?.pathname ?? '';
    } catch (error) {
        console.log(error)
    }

    let sticker = $(el).find('picture div.div span.span').text() ?? '';
    let title = $(el).find('figcaption h3').text();
    let img = {
        src: $(el).find('picture source[type="image/jpeg"]').attr('srcset') ?? '',
        alt: $(el).find('picture > img').attr('alt') ?? ''
    };
    let content = $(el).find('figcaption h3').nextUntil('div').html() ?? '';
    let button = {
        text: $(el).find('a.btn').text(),
        title:  $(el).find('a.btn').attr('title') ?? ''
    };
    return {
        linked: link,
        sticker: sticker,
        title: title,
        img: img,
        content: content,
        button: button
    }
}

function getGmap(scriptContent: string): Gmaps {

    let coords: {lat:number, lng: number} = function() {
        var coords = scriptContent.match(/var myLatLng = (.*);/)?.pop() ?? '';
    
        let jsonString = coords.replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"');
  
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          return {lat: null, lng:null};
        } 
  }();

  let zoom = parseInt(scriptContent.match(/zoom: ([0-9]*),/)?.pop() ?? '');
  let title = scriptContent.match(/title:\s*'(.*?)'/)?.pop() ?? '';
  let content = scriptContent.match(/content:\s*'(.*?)'/)?.pop() ?? '';
  
  return { 
      lat: coords.lat,
      lng: coords.lng,
      zoom: zoom,
      title: title,
      content: content
  };
};
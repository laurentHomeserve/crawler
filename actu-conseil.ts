import * as cheerio from 'cheerio';
import { ActuIntro, News, ActuPage, Image } from './models';
import { getSeo } from './getSEO';

export function getMenuActu(content: string): ActuIntro {
    const $ = cheerio.load(content);

    const title: string = $('h1.title').text();
    const subtitle: string = $('h2.subtitle').text();

    const text: string = $('div.col-xs-10 p').toArray().map((el) => {
        return $.html(el);
    }).join(' ') ?? '';

    const news: Array<News> = $('figure.page').toArray().map((el): News => {
        const [day, month, year] = $(el).find('.info span.pull-left').text().split("/").map(Number);
        return {
            url: {
                href: $(el).find('.info a').attr('href') ?? '',
                title: $(el).find('.info a').attr('title') ?? '',
                text: 'no text'
            },
            type: $(el).find(".tag_actualite, .tag_conseil").text() ?? '',
            date: new Date(year, month - 1, day),
            image: {
                src: $(el).find('img').attr('src') ?? '',
                alt: $(el).find('img').attr('alt') ?? '', 
            },
            title:  $(el).find('h3').text() ?? '',
            text: $(el).find('.info p').text() ?? '',
        }
    });

    return {
        breadcrumb: $('ul.breadcrumb li.active').text().trim() ?? '',
        title,
        subtitle,
        content: text,
        news
    }
}

export function getActuPage(content: string): ActuPage {
    const $ = cheerio.load(content);

    let intro = $('div.pull-left.image').next('section').first().find('p').toArray().map((el) => {
        return $.html(el);
    }).join(' ');


    if (intro === "") {
        intro = $('div.pull-left.image').nextUntil('h2').toArray().map((el) => {
            if (el.tagName == 'section') {
                return $(el).children().toArray().map((_el) => {
                    return $.html(_el);
                });
            }
            return $.html(el);
        }).join(' ');
    }

    

    const hasSection = $('div.pull-left.image').parent().find('section').length > 0;

    let paragraphs = [];

    if (hasSection) {
        paragraphs = $('div.pull-left.image').parent().find('section:has(h2)').toArray().map((el) => {
            
            return {
                title: $(el).find('h2').text(),
                text: $(el).find(':not(h2)').toArray().map((el) => {
                    return $.html(el)
                }).join(' ')
            };
        });
    } else {
        paragraphs = $('div.pull-left.image').parent().find('h2').toArray().map((el) => {
            return {
                title: $(el).text(),
                text: $(el).nextUntil('h2').toArray().map((_el) => {
                    return $.html(_el)
                }).join(' ')
            };
        })
    }

    return {
        breadcrumb: $('ul.breadcrumb li.active').text().trim() ?? '',
        seo: getSeo($('head').html()??''),
        title: $('h1.title').text().replace(/\s+/g, " "),
        chapo: $('h2.subtitle').text(),
        image: {
            src: $('div.image img').attr('src') ?? '',
            alt: $('div.image img').attr('alt') ?? ''
        },
        intro,
        paragraphs
    }
}
import * as cheerio from 'cheerio';
import { ActuIntro, News, ActuPage, Image } from './models';
import { getSeo } from './getSEO';
import { getTextIntro, getContents, getHero, getBreadcrumb } from './pageParser';

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
            type: $(el).find(".tag_actualite, .tag_conseil").text() as "conseils" | "actualités" ?? 'actualités',
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
        breadcrumb: getBreadcrumb($),
        seo: getSeo($('head').html() ?? ''),
        title,
        subtitle,
        content: text,
        news
    }
}

export function getActuPage(content: string): ActuPage {
    const $ = cheerio.load(content);
    const textIntro = getTextIntro($);
    const contents = getContents($);

    return {
        breadcrumb: getBreadcrumb($),
        seo: getSeo($('head').html()??''),
        title: $('h1.title').text().replace(/\s+/g, " "),
        chapo: $('h2.subtitle').text(),
        image: {
            src: $('div.image img').attr('src') ?? '',
            alt: $('div.image img').attr('alt') ?? ''
        },
        intro: textIntro,
        paragraphs: contents as [{ title: string; text: string }]
    }
}
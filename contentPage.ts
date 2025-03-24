import * as cheerio from 'cheerio';
import { Hero, Intro, Content, Related, Link } from './models';
import { get } from 'node:http';
import { getSeo } from './getSEO';

export function getContentPage(html: string, url: string) {
    const $ = cheerio.load(html);

    const hero: Hero = {
        title: $('header h1.title').text(),
        subtitle: $('header h2.subtitle').text()
    };


    let textIntro = $('div.pull-left.image').next('section').first().find('p').toArray().map((el) => {
        return $.html(el);
    }).join();


    if (textIntro === "") {
        textIntro = $('div.pull-left.image').nextUntil('h2').toArray().map((el) => {
            if (el.tagName == 'section') {
                return $(el).children().toArray().map((_el) => {
                    return $.html(_el);
                });
            }
            return $.html(el);
        }).join(' ');
    }

    let intro: Intro = {
        image: {
            src: $('#article-image img').attr('src') ?? '',
            alt: $('#article-image img').attr('alt') ?? ''
        },
        text: textIntro ?? ''
    }

    const hasSection = $('div.pull-left.image').parent().find('section').length > 0;

    let contents: Array<Content> = [];
    if (hasSection) {
        $('div.pull-left.image').parent().find('section:has(h2)').toArray().map((el) => {
            if ($(el).find('h2').toArray().length === 1) {
                contents.push({
                    title: $(el).find('h2').text(),
                    text: $(el).find(':not(h2)').toArray().map((el) => {
                        return $.html(el)
                    }).join(' ')
                });
            } else {
                $(el).find('h2').toArray().map((el) => {
                    contents.push({
                        title: $(el).text(),
                        text: $(el).nextUntil('h2').toArray().map((_el) => {
                            return $.html(_el)
                        }).join(' ')
                    });
                });
            }
        });
    } else {
        contents = $('div.pull-left.image').parent().find('h2').toArray().map((el) => {
            return {
                title: $(el).text(),
                text: $(el).nextUntil('h2').toArray().map((_el) => {
                    return $.html(_el)
                }).join(' ')
            };
        })
    }


    const last = contents.pop();
    let related: Related = {};

    if (last?.text.includes('<i></i>')) {
        const title = last.title;
        const links = $(last.text).find('a').toArray().map((el): Link => {
            return {
                text: $(el).text(),
                href: $(el).attr('href') ?? '',
                title: $(el).attr('title') ?? ''
            }
        });

        related = { title, links };
    } else {
        contents = [...contents, last];
    }


    return {
        breadcrumb: $('ul.breadcrumb li.active').text().trim() ?? '',
        seo: getSeo($('head').html() ?? ''),
        hero,
        intro,
        contents,
        related,
        url
    }
}
import { image } from '@prismicio/helpers/dist/isFilled';
import * as cheerio from 'cheerio';

export function getCityTown(content: string) {

    const $ = cheerio.load(content);

    const hero = {
        title:  $('h1').text(),
        subtitle: ''
    };


    let textIntro = $('div.pull-left.image').next('section').first().find('p').toArray().map((el) => {
        return $.html(el);
    }).join(' ');


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

    const intro = {
        image: {
            src: $('.pull-left.image .img-responsive').attr('src') ?? '',
            alt: $('.pull-left.image  .img-responsive').attr('alt') ?? ''
        },
        text: textIntro ?? ''
    };

    const hasSection = $('div.pull-left.image').parent().find('section').length > 0;
        let contents: Array<Content> = [];
        if (hasSection) {
            contents = $('div.pull-left.image').parent().find('section:has(h2)').toArray().map((el) => {
                return {
                    title: $(el).find('h2').text(),
                    text: $(el).find(':not(h2)').toArray().map((el) => {
                        return $.html(el)
                    }).join(' ')
                };
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

    if ($(last?.text).find('li').has('a').toArray().length) {
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
        hero,
        intro,
        contents,
        related
    }
}
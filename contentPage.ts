import * as cheerio from 'cheerio';
import { Hero, Intro, Content, Related, Link } from './models';
import { getSeo } from './getSEO';
import { getTextIntro, getContents, getHero, getBreadcrumb } from './pageParser';

export function getContentPage(html: string, url: string) {
    const $ = cheerio.load(html);

    const hero = getHero($);
    const textIntro = getTextIntro($);
    const contents = getContents($);

    let intro: Intro = {
        image: {
            src: $('#article-image img').attr('src') ?? '',
            alt: $('#article-image img').attr('alt') ?? ''
        },
        text: textIntro ?? ''
    }

    const last = contents.pop();
    let related: Related = { title: '', links: [] };

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
    } else if (last) {
        contents.push(last);
    }

    return {
        breadcrumb: getBreadcrumb($),
        seo: getSeo($('head').html() ?? ''),
        hero,
        intro,
        contents,
        related,
        url
    }
}
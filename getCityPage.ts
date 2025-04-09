import * as cheerio from 'cheerio';
import { getTextIntro, getContents, getHero, getBreadcrumb } from './pageParser';
import { Link } from './models';

export function getCityTown(content: string) {
    const $ = cheerio.load(content);

    const hero = getHero($, '');
    const textIntro = getTextIntro($);
    const contents = getContents($);

    const intro = {
        image: {
            src: $('.pull-left.image .img-responsive').attr('src') ?? '',
            alt: $('.pull-left.image  .img-responsive').attr('alt') ?? ''
        },
        text: textIntro ?? ''
    };

    const last = contents.pop();
    let related = { title: '', links: [] as Link[] };

    if (last && $(last.text).find('li').has('a').toArray().length) {
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
        hero,
        intro,
        contents,
        related
    }
}
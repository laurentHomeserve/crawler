import * as cheerio from 'cheerio';
import { Hero, IndexPage, Intro, Link, Teaser } from './models';
import { get } from 'node:http';
import { getSeo } from './getSEO';

export function getIndexPage(content: string): IndexPage {
    const $ = cheerio.load(content);

    const hero: Hero = {
        title: $('header h1.title').text(),
        subtitle: $('header h2.subtitle').text()
    };
    
    const intro: Intro = {
        image: {
            src: $('#article-image img').attr('src') ?? '',
            alt: $('#article-image img').attr('alt') ?? ''
        },
        text: $('#section1').html() ?? ''
    }

    let teasers : Array<Teaser> = [];

    const hasSection = $('#article-text section').length > 0;

    if (hasSection) {
    $('#article-text section').each((i, elem) => {
            if (0 === i) return;
            
            const title = $(elem).find('h2').text();
            const link : Link = {
                href: $(elem).find('p').has('i').find('a').attr('href') ?? '',
                text: $(elem).find('p').has('i').find('a').text(),
                title: $(elem).find('p').has('i').find('a').attr('title') ?? ''
            };

            $(elem).find('h2').remove();
            $(elem).find('p:last').remove();

            teasers.push({
                title: title,
                text: $(elem).html() ?? '',
                link: link
            });
        });
    } else {
        $('#article-text h2').each((i, elem) => {
            let linkParagraph ;

            const text = $(elem).nextUntil('h2').toArray().map((_el) => {
                const result = $.html(_el);
                if (result.includes('<i></i>')||result.includes(`<i class="fa fa-angle-double-right" style="color: #337ab7;"></i>`)) {
                    linkParagraph = _el
                    return '';
                }
                return result;
            }).join(' ');

            const link : Link = {
                href: $(linkParagraph).find('a').attr('href') ?? '',
                text: $(linkParagraph).find('a').text(),
                title: $(linkParagraph).find('a').attr('title') ?? ''
            };

            if (!text.includes('skeepers_carousel_container')) {
                teasers.push({
                    title: $(elem).text(),
                    text: text,
                    link: link
                });
            }


        })
    }


    return {
        breadcrumb: $('ul.breadcrumb li.active').text().trim() ?? '',
        seo: getSeo($('head').html() ?? ''),
        hero,
        intro: intro,
        teasers : teasers
    };
}
import * as cheerio from 'cheerio';
import { Content, Hero, Intro, Link } from './models';
import { title } from 'process';
import { getSeo } from './getSEO';

export function getAboutUsMenu(content: string): Array<Link>  {
    const $ = cheerio.load(content);

    let links: Array<Link> = [];
    
    $('ul.nav li#dropdown-right').toArray().map((el) => {
        if ($(el).find('p').first().text() === 'Qui sommes-nous ?') {
            
            $(el).find('li a').toArray().map((elem) => {
                links.push({
                    text: $(elem).text(),
                    href: $(elem).attr('href') ?? '',
                    title: $(elem).attr('title') ?? ''
                });
            })
        }
    });


    return links;

}

export function getAboutUsPage(content: string) {
    const $ = cheerio.load(content);

    const seo = getSeo($('head').html()??'');

    const hero: Hero = {
        title: $('h1.title').text() ?? '',
        subtitle: $('h2.subtitle').text() ?? ''
    };

        let textIntro = $('.pull-right.image').next('section').first().find('p').toArray().map((el) => {
            return $.html(el);
        }).join(' ');
    
    
        if (textIntro === "") {
            textIntro = $('.pull-right.image').nextUntil('h2').toArray().map((el) => {
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
                src: $('.pull-right.image img').attr('src') ?? '',
                alt: $('.pull-right.image img').attr('alt') ?? ''
            },
            text: textIntro ?? ''
        }
    
        const hasSection = $('.pull-right.image').parent().find('section').length > 0;
    
        let contents: Array<Content> = [];
        if (hasSection) {
            $('.pull-right.image').parent().find('section:has(h2)').toArray().map((el) => {
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
            contents = $('.pull-right.image').parent().find('h2').toArray().map((el) => {
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
            seo,
            hero,
            intro,
            contents
        };
}
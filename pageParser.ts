import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

export interface BasePage {
    breadcrumb: string;
    hero: {
        title: string;
        subtitle: string;
    };
    intro: {
        image: {
            src: string;
            alt: string;
        };
        text: string;
    };
    contents: Array<{
        title: string;
        text: string;
    }>;
}

export function getTextIntro($: CheerioAPI): string {
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

    return textIntro;
}

export function getContents($: CheerioAPI): Array<{ title: string; text: string }> {
    const hasSection = $('div.pull-left.image').parent().find('section').length > 0;
    let contents: Array<{ title: string; text: string }> = [];

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
        });
    }

    return contents;
}

export function getHero($: CheerioAPI, headerSelector: string = 'header'): { title: string; subtitle: string } {
    return {
        title: $(`${headerSelector} h1.title`).text(),
        subtitle: $(`${headerSelector} h2.subtitle`).text()
    };
}

export function getBreadcrumb($: CheerioAPI): string {
    return $('ul.breadcrumb li.active').text().trim() ?? '';
} 
import { Seo } from './models';
import * as cheerio from 'cheerio';

export function getSeo(header: string): Seo {
    const $ = cheerio.load(header);

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content') ?? '',
        opengraph: {
            site_name: $('meta[property="og:site_name"]').attr('content') ?? '',
            type: $('meta[property="og:type"]').attr('content') ?? '',
            locale: $('meta[property="og:locale"]').attr('content') ?? '',
            title: $('meta[property="og:title"]').attr('content') ?? '',
            description: $('meta[property="og:description"]').attr('content') ?? '',
            image: {
                src: $('meta[property="og:image"]').attr('content') ?? '',
                alt: $('meta[property="og:image:alt"]').attr('content') ?? ''
            }
        }
    };
}
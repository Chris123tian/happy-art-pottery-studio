import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        <title>Happy Art Pottery Studio | Wheel Throwing & Pottery Classes in Accra, Ghana</title>
        <meta name="description" content="Learn pottery at Happy Art Pottery Studio in Shiashie, Accra. We offer wheel throwing, pot painting, and free hand modeling classes for individuals, groups, parties, schools, and organizations. Open Monday-Saturday 1-5:30 PM." />
        <meta name="keywords" content="pottery classes Accra, pottery studio Ghana, wheel throwing Accra, pottery workshop Shiashie, ceramic classes Ghana, pot painting Accra, pottery lessons Ghana, art classes Accra, Happy Art Pottery, pottery classes near me, pottery wheel classes, ceramic art Ghana" />
        <meta name="author" content="Happy Art Pottery Studio" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Happy Art Pottery Studio | Wheel Throwing & Pottery Classes in Accra, Ghana" />
        <meta property="og:description" content="Learn pottery at Happy Art Pottery Studio in Shiashie, Accra. We offer wheel throwing, pot painting, and free hand modeling classes for individuals, groups, parties, schools, and organizations." />
        <meta property="og:site_name" content="Happy Art Pottery Studio" />
        <meta property="og:locale" content="en_GH" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Happy Art Pottery Studio | Pottery Classes in Accra" />
        <meta name="twitter:description" content="Learn pottery at Happy Art Pottery Studio in Shiashie, Accra. Wheel throwing, pot painting & more!" />
        
        <meta name="geo.region" content="GH-AA" />
        <meta name="geo.placename" content="Shiashie, Accra" />
        <meta name="geo.position" content="5.6037;-0.1870" />
        <meta name="ICBM" content="5.6037, -0.1870" />
        
        <meta name="google-site-verification" content="QW__FI-iR1f7ic44TzHrEQA-BtGiWnPXOkikftDsUwo" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        <link rel="canonical" href="https://happyartpottery.com" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': 'https://happyartpottery.com',
            name: 'Happy Art Pottery Studio',
            description: 'Learn pottery at Happy Art Pottery Studio in Shiashie, Accra. We offer wheel throwing, pot painting, and free hand modeling classes.',
            image: 'https://happyartpottery.com/og-image.jpg',
            telephone: '0244311110',
            email: 'happyart@gmail.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Shiashie',
              addressLocality: 'Accra',
              addressRegion: 'Greater Accra',
              addressCountry: 'GH',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 5.6037,
              longitude: -0.1870,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday'],
                opens: '13:00',
                closes: '17:30',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Thursday', 'Friday', 'Saturday'],
                opens: '13:00',
                closes: '17:30',
              },
            ],
            priceRange: '$$',
            url: 'https://happyartpottery.com',
            sameAs: [
              'https://www.facebook.com/happyartpottery',
              'https://www.instagram.com/happyartpottery',
            ],
          })}
        </script>
        
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #fff;
  }
}`;

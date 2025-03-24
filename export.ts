import * as prismic from "@prismicio/client";
import { htmlAsRichText } from "@prismicio/migrate";

// Remplacez par l'URL de votre repository
const repoName = "digital-acquisition"; // Ex: mywebsite
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6ImRpZ2l0YWwtYWNxdWlzaXRpb24tNGMxMjQzOTQtYjJjZC00M2M2LTk5NTItNTc4MGYyYWU0NGJkXzUiLCJkYXRlIjoxNzM4MTQ0NTgxLCJkb21haW4iOiJkaWdpdGFsLWFjcXVpc2l0aW9uIiwiYXBwTmFtZSI6Im1pZ3JhdGlvbiIsImlhdCI6MTczODE0NDU4MX0.RRLEpcdAKXTzXgVmtOUIOwn4QwL7dxxyoKqGs-Bdxm4"; // Token d'API généré


// Prismic setup
const writeClient = prismic.createWriteClient(
  repoName,
  {
    writeToken: accessToken,
  },
);

const migration = prismic.createMigration();


// (async () => {
//   migration.createDocument({
//     type: 'installations',
//     uid: 'climatisation',
//     lang: 'fr-fr',
//     data : {
//       slices: [{
//         slice_type: "title",
//         variation: "default",
//         primary: {
//           title: htmlAsRichText("<h2>JCM Confort : votre installateur de climatisation à Angers et ses alentours</h2>").result,
//           intro: htmlAsRichText("<p>Une installation de climatisation dans le Maine-et-Loire réalisée par une entreprise agréée.</p>").result,
//         }
//       }]
//     }
//   }, 'first upload');
// })();
// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { KeyboardControl } from "dokui-menu";
import { openMenu } from "dokui-menu"
import { MenuItemModel } from "dokui-menu/dist/menu/model/MenuItemModel";
import { NpcModel } from "open-ai-npc";

const angelSrc = "https://i.etsystatic.com/32486242/r/il/ddd05d/5025111975/il_570xN.5025111975_du3d.jpg";

// const sampleSrc = "https://cdn.britannica.com/59/182359-050-C6F38CA3/Scarlett-Johansson-Natasha-Romanoff-Avengers-Age-of.jpg";
// const pikaSrc = "https://media.tenor.com/rbx3ph5SLRUAAAAi/pikachu-pokemon.gif";
// const byeSrc = "https://images.vexels.com/media/users/3/272491/isolated/preview/d6d58dbb207e59b46ab9e797b32ae014-bye-word-glossy-sign.png";
// const landscapeSrc = "https://www.adorama.com/alc/wp-content/uploads/2018/11/landscape-photography-tips-yosemite-valley-feature.jpg";

// export function showMenu() {
//   const { popupControl } = openMenu({
//     editor: true,
//     dialog: {
//       messages: [
//         {
//           text: "hello",
//           pictures: [{
//             layout: {
//               position: [350,100],
//               size: [200, 200],
//               positionFromRight: true,
//             },
//             images: [{
//               src: landscapeSrc,
//               size: "cover",
//             }, { src: pikaSrc }],
//           }],    
//         },
//         "there!",
//         {
//           text: "bye",
//           pictures: [{
//             layout: {
//               position: [350,100],
//               size: [200, 200],
//               positionFromRight: true,
//             },
//             images: [{ src:  byeSrc }],
//           }],    
//         },
//       ],
//     },
//     menu: {
//       disableBack: true,
//       layout: {
//         name: "main",
//       },
//       items: [
//         "first",
//         {
//           icon: pikaSrc,
//           label: "second",
//           onHover: {
//             pictures: [{
//               layout: {
//                 position: [350,100],
//                 size: [200, 200],
//                 positionFromRight: true,
//               },
//               images: [{ src: pikaSrc }],
//             }],
//             dialog: {
//               layout: {
//                 position: [350,315],
//                 size: [200, 50],
//                 positionFromRight: true,
//               },
//               messages: ["Pika!"],
//             },
//           },
//         },
//         {
//           emoji: "3️⃣",
//           label: "third",
//           submenu: {
//             pictures: [{
//               layout: {
//                 position: [350,350],
//                 size: [300, 300],
//                 positionFromBottom: true,
//                 positionFromRight: true,
//               },
//               images: [
//                 {
//                   src: sampleSrc,
//                 },
//               ],
//             }],
        
//             layout: {
//               position: [150, 100],
//               size: [200, 150],
//             },
//             items: [
//               "3.1",
//               "3.2",
//               "3.3",
//               "3.4",
//               "------",
//               {
//                 label: "exit",
//                 back: true,
//               },
//             ],
//           },
//         },
//         {
//           label: "fourth",
//           submenu: {
//             layout: {
//               name: "main",
//               position: [150, 100],
//               size: [200, 200],
//             },
//             items: [
//               "a",
//               "b",
//               "c",
//               {
//                 label: "exit",
//                 back: true,
//               },
//             ],
//           },
//         },
//         {
//           label: "dialog",
//           dialog: {
//             pictures: [{
//               layout: {
//                 position: [350,350],
//                 size: [300, 300],
//                 positionFromBottom: true,
//                 positionFromRight: true,
//               },
//               images: [{ src: sampleSrc }],
//             }],      
//             layout: {
//               name: "main",
//               position: [150, 100],
//               size: [400, 180],
//             },
//             messages: [
//               "Hello",
//               {
//                 text: "How are you?",
//                 menu: {
//                   layout: {
//                     position: [150, 300],
//                     size: [300, 200],
//                   },
//                   items: [
//                     { label: "I don't know",
//                       dialog: {
//                         layout: {
//                           position: [250, 200],
//                           size: [300, 100],      
//                         },
//                         messages: ["you should know"],
//                       } 
//                     },
//                     { label: "good", back: true,
//                       dialog: {
//                         layout: {
//                           position: [250, 200],
//                           size: [300, 100],      
//                         },
//                         messages: ["That's good to know."],
//                       } 
//                     },
//                     { label: "bad", back: true },
//                   ],
//                 },
//               },
//               "Bye",
//             ],
//           },
//         },
//         {
//           label: "dialog without closing menu",
//           dialog: {
//             layout: {
//               position: [150, 100],
//               size: [200, 200],
//             },
//             messages: [
//               "test dialog",
//             ],
//           },
//         },
//         {
//           label: "hidden on select",
//           hideOnSelect: true,
//           dialog: {
//             layout: {
//               position: [150, 100],
//               size: [300, 200],
//             },
//             messages: [
//               "parent popup hidden",
//             ],
//           },
//         },
//         {
//           label: "prompt",
//           prompt: {
//             layout: {
//               position: [150, 100],
//               size: [600, 300],
//             },
//             label: "What is your name?",
//             defaultText: "Name",
//             randomText: [
//               "Alis",
//               "Bryan",
//               "Carlos",
//               "David",
//               "Emily",
//             ],
//             languages: ["english", "korean"],
//           },
//         },
//         {
//           label: "simpler prompt",
//           prompt: {
//           },
//         },
//         {
//           label: "show triangle without submenu",
//           showTriangle: true,
//         },
//       ],
//     },
//   });
//   return { keyboard: new KeyboardControl(popupControl) };
// }
let mute = false;
async function showMenu(model: NpcModel): Promise<string> {
  return new Promise(resolve => {
    if (!mute) {
      let utterance = new SpeechSynthesisUtterance(model.creature);
      speechSynthesis.speak(utterance);  
    }

    const {popupControl} = openMenu<MenuItemModel & {choice?: string}>({
      dialog: {
        pictures: [
          {
            layout: {
              position: [300, 50],
              size: [150, 140],
              positionFromRight: true,
            },
            images: [
              {
                src: angelSrc,
              }
            ]
          }
        ],
        layout: {
          position: [100, 200],
          size: [800, 200],
        },
        messages: [
          {
            text: model.creature,
            menu: {
              layout: {
                position: [150, 420],
                size: [700, 300],
              },
              items: [
                {
                  choice: "A",
                  label: model.player.A,
                  back: true,
                },
                {
                  choice: "B",
                  label: model.player.B,
                  back: true,
                },
                {
                  choice: "C",
                  label: model.player.C,
                  back: true,
                },
                {
                  choice: "D",
                  label: model.player.D,
                  back: true,
                },
                {
                  label: "Talk about...",
                  prompt: {
                    label: "Choose a new topic of discussion",
                    layout: {
                      position: [100, 270],
                      size: [600, 250],
                    },
                    languages: ["english", "korean"],   
                  },
                  back: true,
                },
              ],
            },      
          },
        ],        
      },
      onSelect(item) {
        if (item.choice) {
          resolve(item.choice);
        }
      },
      onPrompt(text) {
        resolve(text);
      }
    });  
    const keyboard = new KeyboardControl(popupControl);
  });
}


async function callApi(choice: string = "", creature?: string, model?: string) {
  const response = await fetch(`/api?${new URLSearchParams({
    ...choice ? {choice} : {},
    ...creature ? {creature} : {},
    ...model ? {model} : {},
  })}`);  
  const models = await response.json() as NpcModel[];
  return models;
}

const choices: string[] = [];
async function startConversation() {
  while (true) {
    const models = await callApi(choices.join("|"));
    const choice = await showMenu(models[0]);
    choices.push(choice);  
  }
}

export function start() {
  const div = document.body.appendChild(document.createElement("div"));
  div.innerText = "Press a key to start. M to mute";
  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyM") {
      mute = true;
    }
    document.body.removeChild(div);
    startConversation();
  }, { once: true });
}

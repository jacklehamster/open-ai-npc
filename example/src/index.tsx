// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { KeyboardControl, PopupControl } from "dokui-menu";
import { openMenu } from "dokui-menu"
import { MenuItemModel } from "dokui-menu/dist/menu/model/MenuItemModel";
import { NpcModel } from "open-ai-npc";

const angelSrc = "angel.png";
const gremlinsSrc = "gremlins.png";
const robotSrc = "robot.png"

const popupControl = new PopupControl();
const keyboard = new KeyboardControl(popupControl);
let mute = false;
async function showMenu(model: NpcModel, image?: string, interactions?: number): Promise<string> {
  return new Promise(resolve => {
    const emojis: string[] = [];
    for (let i = 0; i < model.attributes.anger; i++) {
      emojis.push('😡');
    }
    for (let i = 0; i < model.attributes.fear; i++) {
      emojis.push('😨');
    }
    for (let i = 0; i < model.attributes.seduced; i++) {
      emojis.push('🥰');
    }
    for (let i = 0; i < model.attributes.trust; i++) {
      emojis.push('🤝');
    }
    if (model.actions.fight) {
      emojis.push('⚔️');
    }
    if (model.actions.trade) {
      emojis.push('💰');
    }
    if (model.actions["run away"]) {
      emojis.push('🏃');
    }
    if (model.actions["join party"]) {
      emojis.push('👭');
    }
  
    if (!mute) {
      speechSynthesis.cancel();
      let utterance = new SpeechSynthesisUtterance(model.creature);
      speechSynthesis.speak(utterance);
      window.addEventListener("beforeunload", () => {
        speechSynthesis.cancel();
      }) 
    }

    openMenu<MenuItemModel & {choice?: string}>({
      popupControl,
      dialog: {
        pictures: [
          {
            layout: {
              position: [300, 10],
              size: [150, 140],
              positionFromRight: true,
            },
            images: [
              {
                src: image ?? angelSrc,
              }
            ],
            dialog: {
              layout: {
                position: [325, 165],
                size: [200, 50],
                positionFromRight: true,
              },
              messages: [
                model.info?.name ?? "???"
              ],
            },
          }
        ],
        layout: {
          position: [100, 240],
          size: [800, 150],
        },
        messages: [
          {
            subdialog: {
              layout: {
                position: [50, 50],
                size: [250, 50],
              },
              messages: [
                emojis.join(""),
              ],
            },            
            text: model.creature,
            menu: {
              layout: {
                position: [100, 420],
                size: [800, 260],
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
                  hidden: !!interactions,
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
        if (text) {
          resolve(text);
        }
      }
    });  
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

async function promptCreature(): Promise<{ creature?: string; image?: string } | undefined> {
  return new Promise(resolve => {
    openMenu<MenuItemModel & { creature?: string; image?: string }>({
      popupControl,
      menu: {
        items: [
          {
            back: true,
            label: "angel",
            image: angelSrc,
            onHover: {
              pictures: [
                {
                  layout: {
                    position: [300, 10],
                    size: [150, 140],
                    positionFromRight: true,
                  },
                  images: [
                    {
                      size: "cover",
                      src: angelSrc,
                    }
                  ],
                }
              ],
            },
          },
          {
            back: true,
            label: "gremlins",
            image: gremlinsSrc,
            creature: "a green ugly gremlins",
            onHover: {
              pictures: [
                {
                  layout: {
                    position: [300, 10],
                    size: [150, 140],
                    positionFromRight: true,
                  },
                  images: [
                    {
                      size: "cover",
                      src: gremlinsSrc,
                    }
                  ],
                }
              ],
            },            
          },
          {
            back: true,
            label: "robot",
            image: robotSrc,
            creature: "a very intelligent robot",
            onHover: {
              pictures: [
                {
                  layout: {
                    position: [300, 10],
                    size: [150, 140],
                    positionFromRight: true,
                  },
                  images: [
                    {
                      size: "cover",
                      src: robotSrc,
                    }
                  ],
                }
              ],
            },            
          },
        ],
      },
      onSelect(item) {
        resolve(item);
      }
    });
  });
}


const choices: string[] = [];
async function startConversation() {
  const {creature, image} = await promptCreature() ?? {};

  let interactions = 0;
  while (true) {
    const models = await callApi(choices.join("|"), creature);
    const choice = await showMenu(models[0], image, interactions);
    choices.push(choice);  
    interactions++;
    console.log("Interactions:", interactions);
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

// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { KeyboardControl, PopupControl } from "dokui-menu";
import { openMenu } from "dokui-menu"
import { MenuItemModel } from "dokui-menu/dist/menu/model/MenuItemModel";
import { NpcModel } from "open-ai-npc";

const angelSrc = "https://i.etsystatic.com/32486242/r/il/ddd05d/5025111975/il_570xN.5025111975_du3d.jpg";

const popupControl = new PopupControl();
const keyboard = new KeyboardControl(popupControl);
let mute = false;
async function showMenu(model: NpcModel): Promise<string> {
  return new Promise(resolve => {
    console.log(model.actions);
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
      let utterance = new SpeechSynthesisUtterance(model.creature);
      speechSynthesis.speak(utterance);
      window.addEventListener("close", () => {
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
                src: angelSrc,
              }
            ],
            dialog: {
              layout: {
                position: [325, 165],
                size: [200, 50],
                positionFromRight: true,
              },
              messages: [
                model.info.name ?? "???"
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

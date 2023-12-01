import React, { useEffect } from 'react';
import * as Phaser from 'phaser'; 
import Main from './Scenes/Main';
export default function PhaserGame() {
  useEffect(() => {
    let game;

    const loadPhaser = async () => {
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#4f303c",
        physics: {
          default: 'arcade',
          arcade: {
            debug: false
          }
        },
        scene: [Main],
      };

      game = new Phaser.Game(config);
      game.canvas.style.cursor = 'url("/crosshair.png"), auto';
    };

    const unloadPhaser = () => {
      if (game) {
        game.destroy(true); // true indicates a "hard" destruction, clearing all resources
      }
    };

    if (typeof window !== 'undefined') {
      loadPhaser();

      return () => {
        unloadPhaser();
      };
    }
  }, []);

  return <div id="phaser-container"></div>;
}

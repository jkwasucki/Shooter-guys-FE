import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import Phaser from 'phaser'; // Add this line to import Phaser
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
            debug: true
          }
        },
        scene: [Main],
      };

      game = new Phaser.Game(config);
      game.canvas.style.cursor = 'url("/crosshair.png"), auto';

      return () => {
        if (game) {
          game.destroy();
        }
      };
    };

    if (typeof window !== 'undefined') {
      loadPhaser();
    }
  }, []);

  return <div id="phaser-container"></div>;
}

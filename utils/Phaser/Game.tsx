'use client'
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import * as Phaser from 'phaser';
import Main from './Scenes/Main';

export default function PhaserGame(){

  

  useEffect(() => {
    let game:Phaser.Game;
    
    const loadPhaser = async () => {
      const phaserModule = await import('phaser');
      const { default: Phaser } = phaserModule;

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

      const game = new Phaser.Game(config);
      game.canvas.style.cursor = 'url("/crosshair.png"), auto';
    };

    if (typeof window !== 'undefined') {
      loadPhaser();
    }
  }, []);

  return <div id="phaser-container"></div>;
};



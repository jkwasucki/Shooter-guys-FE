'use client'
import React, { useEffect } from 'react';
import Phaser from 'phaser';
import Main from './Scenes/Main';

const PhaserGame = () => {

  useEffect(() => {
    let game:Phaser.Game
  
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor:"#4f303c",
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
            game.destroy(true);
        }
    };
  }, []);

  return <div id="phaser-container"></div>;
};

export default PhaserGame;

type Spawn = {
    gid: number;
    height: number;
    id: number;
    name: string;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

type Track =  {
    "height":number,
    "id":number,
    "name":string,
    "holding":Phaser.GameObjects.Image[],
    "occupied":string,
    "slots":{
        slot1:{
            taken:boolean,
            x:number,
            y:number
        },
        slot2:{
            taken:boolean,
            x:number,
            y:number
        },
        slot3:{
            taken:boolean,
            x:number,
            y:number
        },
        slot4:{
            taken:boolean,
            x:number,
            y:number
        }
    },
    "rotation":number,
    "type":string,
    "visible":boolean,
    "width":number,
    "x":number,
    "y":number
}


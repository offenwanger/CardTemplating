import { IdUtil } from "./utils/id_util.js";

function Text() {
    this.id = IdUtil.getUniqueId(Text);
    this.font = "DefaultFont";
    this.size = 16
    this.angle = 0;
    this.x = 0;
    this.y = 0;
}

function Img() {
    this.id = IdUtil.getUniqueId(Img);
    this.width = width;
    this.height = height;
    this.imgData = ""
    this.angle = 0;
    this.x = 0;
    this.y = 0;
}

function Config() {
    this.id = IdUtil.getUniqueId(Config);
    this.cardWidth = 180;
    this.cardHeight = 252;
}

function DataCell() {
    this.id = IdUtil.getUniqueId(DataCell);
    this.text = "Text";
    this.row = 0;
    this.col = "";
}

export const Data = {
    Text,
    Img,
    Config,
    DataCell,
}
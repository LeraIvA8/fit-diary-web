// Настройки сборщика Metro. Кэш хранится в папке проекта (.metro-cache), а не во временной папке Windows на диске C
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");

const config = getDefaultConfig(__dirname);
config.cacheStores = [new FileStore({ root: path.join(__dirname, ".metro-cache") })];

module.exports = config;

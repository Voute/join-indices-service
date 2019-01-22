"use strict";

const yaml = require('js-yaml');
const path = require('path');
const joi = require('joi');
const fs = require('fs');
const l = require('lodash');

function getConfigParams(filepath) {
    let config = readConfigFile(filepath);
    let
}

function readConfigFile(filepath) {
    if (!filepath) {
        return null;
    }
    let configFile = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));

}

module.exports = getConfigParams;
import local from "./config.local";
import local1 from "./config.local1";
import local2 from "./config.local2";
import local3 from "./config.local3";
import sit from "./config.sit";
import uat from "./config.uat";
import prod from "./config.prod";
import gameguide from "./config.gameguide"

export const configs = {
    local: { ...local },
    local1: { ...local1 },
    local2: { ...local2 },
    local3: { ...local3 },
    sit: { ...sit },
    uat: { ...uat },
    prod: { ...prod },
    gameguide: { ...gameguide },
};

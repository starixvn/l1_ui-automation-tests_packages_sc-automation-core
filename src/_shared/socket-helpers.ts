import type { WebSocket as PlaywrightWs } from "playwright-core";
import { decode } from "notepack.io";
import { decodeJson } from "./socket-parser";

export async function waitForMessage(socket: PlaywrightWs, key: string, gameName: string, msgpack: boolean = false): Promise<any> {
    let resolve: (payload: any) => any;
    let timeoutId: NodeJS.Timeout;

    const promise = new Promise<any>((_resolve) => {
        resolve = _resolve;
    });

    socket.on("framereceived", async (msg: any) => {
        const { payload } = msg ?? "";
        const jsonMsg = parseSocketPayload(payload, msgpack);

        if (payload.includes(key) && jsonMsg.eventName?.toLocaleLowerCase() === gameName?.toLocaleLowerCase()) {
            clearTimeout(timeoutId);
            resolve(jsonMsg.message);
        }
    });

    timeoutId = setTimeout(() => {
        console.log(`Timeout reached, can not find event ${key} in ${gameName}`);
        resolve(undefined);
    }, 80 * 1000);

    socket.on("socketerror", (error) => {
        console.error("Socket error:", error);
        clearTimeout(timeoutId);
        resolve(undefined);
    });
    return promise;
}

export async function waitForSpecificMessage(
    socket: PlaywrightWs,
    checkMsg: Function,
    gameName: string,
    msgpack: boolean = false,
): Promise<any> {
    let resolve: (payload: any) => any;
    let timeoutId: NodeJS.Timeout;

    const promise = new Promise<any>((_resolve) => {
        resolve = _resolve;
    });

    socket.on("framereceived", async (msg: any) => {
        const { payload } = msg ?? "";
        const jsonMsg = parseSocketPayload(payload, msgpack);

        if (checkMsg(jsonMsg.message) && jsonMsg.eventName?.toLocaleLowerCase() === gameName?.toLocaleLowerCase()) {
            clearTimeout(timeoutId);
            resolve(jsonMsg.message);
        }
    });

    timeoutId = setTimeout(() => {
        resolve(undefined);
    }, 80 * 1000);
    return promise;
}

export function parseSocketPayload(payload: string, msgpack: boolean = false): SocketPayload {
    const packet = msgpack ? decode(payload) : decodeJson(payload);
    const { data } = packet;

    if (!data) {
        return { eventName: "", message: "" };
    }

    if (data.length < 2) {
        return {
            eventName: data[0],
            message: "",
        };
    }

    return {
        eventName: data[0],
        message: data[1],
    };
}

export function parseMsgpack(payload: string): SocketPayload {
    const { data } = decode(payload);

    return {
        eventName: data[0],
        message: data[1],
    };
}

export type SocketPayload = {
    eventName: string;
    message: any;
};

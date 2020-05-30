import canIUseNodes from "./CanIUseProvider";
import mdnNodes from "./MdnProvider";
import type { Node } from "../types";

// eslint-disable-next-line import/prefer-default-export
export const nodes: Array<Node> = [...canIUseNodes, ...mdnNodes];

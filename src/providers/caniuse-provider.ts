import canIUseRecords from "caniuse-db/fulldata-json/data-2.0.json";
import { STANDARD_TARGET_NAME_MAPPING, AST_NODE_TYPES } from "../constants";
import { AstMetadataApiWithUnsupportedTargets, Target } from "../types";

type CanIUseRecords = {
  data: CanIUseData;
};

type CanIUseData = {
  [api: string]: {
    stats: CanIUseStats;
  };
};

type CanIUseStats = {
  [browser: string]: {
    [version: string]: string;
  };
};

/**
 * Take a target's id and return it's full name by using `targetNameMappings`
 * ex. {target: and_ff, version: 40} => 'Android FireFox 40'
 */
function formatTargetNames(target: Target): string {
  const name = STANDARD_TARGET_NAME_MAPPING[target.target] || target.target;
  return `${name} ${target.version}`;
}

/**
 * Check if a browser version is in the range format
 * ex. 10.0-10.2
 */
function versionIsRange(version: string): boolean {
  return version.includes("-");
}

/**
 * Parse version from caniuse and compare with parsed version from browserslist.
 */
function areVersionsEqual(
  targetVersion: number,
  statsVersion: string
): boolean {
  return targetVersion === parseFloat(statsVersion);
}

/*
 * Check the CanIUse database to see if targets are supported
 *
 * If no record could be found, return true. Rules might not
 * be found because they could belong to another provider
 */
function isSupportedByCanIUse(
  node: AstMetadataApiWithUnsupportedTargets,
  { version, target, parsedVersion }: Target
): boolean {
  const data = (canIUseRecords as CanIUseRecords).data[node.caniuseId];

  if (!data) return true;
  const { stats } = data;
  if (!(target in stats)) return true;

  const targetStats = stats[target];

  if (typeof version === "string" && versionIsRange(version)) {
    return Object.keys(targetStats).some((statsVersion: string): boolean =>
      versionIsRange(statsVersion) &&
      areVersionsEqual(parsedVersion, statsVersion)
        ? !targetStats[statsVersion].includes("y")
        : true
    );
  }

  // @TODO: This assumes that all versions are included in the cainuse db. If this is incorrect,
  //        this will return false negatives. To properly do this, we have to to range comparisons.
  //        Ex. given query for 50 and only version 40 exists in db records, return true
  if (!(version in targetStats)) return true;
  if (!targetStats[version]) return true;

  return targetStats[version].includes("y");
}

/**
 * Return an array of all unsupported targets
 */
export function getUnsupportedTargets(
  node: AstMetadataApiWithUnsupportedTargets,
  targets: Target[]
): string[] {
  return targets
    .filter((target) => !isSupportedByCanIUse(node, target))
    .map(formatTargetNames);
}

const CanIUseProvider: Array<AstMetadataApiWithUnsupportedTargets> = [
  // new ServiceWorker()
  {
    caniuseId: "serviceworkers",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "ServiceWorker",
  },
  {
    caniuseId: "serviceworkers",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "navigator",
    property: "serviceWorker",
  },
  // document.querySelector()
  {
    caniuseId: "queryselector",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "document",
    property: "querySelector",
  },
  // IntersectionObserver
  {
    caniuseId: "intersectionobserver",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "IntersectionObserver",
  },
  // ResizeObserver
  {
    caniuseId: "resizeobserver",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "ResizeObserver",
  },
  // PaymentRequest
  {
    caniuseId: "payment-request",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "PaymentRequest",
  },
  // Promises
  {
    caniuseId: "promises",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Promise",
  },
  {
    caniuseId: "promises",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "Promise",
    property: "resolve",
  },
  {
    caniuseId: "promises",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "Promise",
    property: "all",
  },
  {
    caniuseId: "promises",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "Promise",
    property: "race",
  },
  {
    caniuseId: "promises",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "Promise",
    property: "reject",
  },
  // fetch
  {
    caniuseId: "fetch",
    astNodeType: AST_NODE_TYPES.call_expression,
    object: "fetch",
  },
  // document.currentScript()
  {
    caniuseId: "document-currentscript",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "document",
    property: "currentScript",
  },
  // URL
  {
    caniuseId: "url",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "URL",
  },
  // URLSearchParams
  {
    caniuseId: "urlsearchparams",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "URLSearchParams",
  },
  // performance.now()
  {
    caniuseId: "high-resolution-time",
    astNodeType: AST_NODE_TYPES.member_expression,
    object: "performance",
    property: "now",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "TypedArray",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Int8Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Uint8Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Uint8ClampedArray",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Int16Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Uint16Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Int32Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Uint32Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Float32Array",
  },
  {
    caniuseId: "typedarrays",
    astNodeType: AST_NODE_TYPES.new_expression,
    object: "Float64Array",
  },
].map((rule) => ({
  ...rule,
  getUnsupportedTargets,
  id: rule.property ? `${rule.object}.${rule.property}` : rule.object,
  protoChainId: rule.property ? `${rule.object}.${rule.property}` : rule.object,
  protoChain: rule.property ? [rule.object, rule.property] : [rule.object],
}));

export default CanIUseProvider;

/*
// ========= code from discord: https://discord.com/channels/841794018173648916/859895506271600670/904538079283515403

const { Spectral } = require("@stoplight/spectral-core");
const { migrateRuleset } = require("@stoplight/spectral-ruleset-migrator");
const fs = require("fs");
const path = require("path");

const myOpenApiDocument = `
openapi: 3.0.0
# here goes the rest of document
`;

const rulesetSource = path.join(__dirname, ".spectral.yaml");

migrateRuleset(rulesetSource, {format: "commonjs", fs })
    .then(load)
    .then((ruleset) => {
        const spectral = new Spectral();
        spectral.setRuleset(ruleset);
        return spectral.run(myOpenApiDocument)
    })
    .then(results => {
        console.log("here are the results", results);
    });

function load(source) {
    const m = {};
    const paths = [path.dirname(rulesetSource), __dirname];
    Function('module, require', source)(m, (id) => require(require.resolve(id, { paths })));
    return m.exports;
}

// ============== code from spectral github action:
// https://github.com/stoplightio/spectral-action/blob/a1a5b82b44dd62223b98a133385dabeb12a274ef/src/getRuleset.ts

import { Optional } from '@stoplight/types';
import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
import { info, error } from '@actions/core';

// eslint-disable-next-line @typescript-eslint/require-await
const AsyncFunction = (async (): Promise<void> => void 0).constructor as FunctionConstructor;

async function getDefaultRulesetFile(): Promise<Optional<string>> {
    const cwd = process.cwd();
    for (const filename of await fs.promises.readdir(cwd)) {
        if (Ruleset.isDefaultRulesetFile(filename)) {
            return path.join(cwd, filename);
        }
    }

    return;
}

export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
    if (!rulesetFile) {
        rulesetFile = await getDefaultRulesetFile();
    } else if (!path.isAbsolute(rulesetFile)) {
        rulesetFile = path.join(process.cwd(), rulesetFile);
    }

    if (!rulesetFile) {
        throw new Error(
            'No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)'
        );
    }

    info(`Loading ruleset '${rulesetFile}'...`);

    let ruleset;

    try {
        if (/(json|ya?ml)$/.test(path.extname(rulesetFile))) {
            const m: { exports?: RulesetDefinition } = {};
            const paths = [path.dirname(rulesetFile), __dirname];

            await AsyncFunction(
                'module, require',
                await migrateRuleset(rulesetFile, {
                    format: 'commonjs',
                    fs,
                })
                // eslint-disable-next-line @typescript-eslint/no-var-requires
            )(m, (id: string) => require(require.resolve(id, { paths })) as unknown);

            ruleset = m.exports;
        } else {
            const imported = (await import(rulesetFile)) as { default: unknown } | unknown;
            ruleset =
                typeof imported === 'object' && imported !== null && 'default' in imported
                    ? (imported as Record<'default', unknown>).default
                    : imported;
        }
    } catch (e) {
        error(`Failed to load ruleset '${rulesetFile}'... Error: ${e.message}`);
        throw e;
    }

    return new Ruleset(ruleset, {
        severity: 'recommended',
    });

// code from spectral migrator:
// on readme: https://github.com/stoplightio/spectral/blob/756176f9c21cd0d7256172f6a83e71dda783ebdd/packages/ruleset-migrator/README.md

    const { migrateRuleset } = require("@stoplight/spectral-ruleset-migrator");
    const fs = require("fs");
    const path = require("path");

    migrateRuleset(path.join(__dirname, "spectral.json"), {
        fs,
        format: "commonjs", // esm available too, but not recommended for now
    }).then(fs.promises.writeFile.bind(fs.promises, path.join(__dirname, ".spectral.js")));

// code from spectral cli:
// https://github.com/stoplightio/spectral/blob/26284c7004d3b1d7c3ec2bd59910b66bfb3bd414/packages/cli/src/services/linter/utils/getRuleset.ts

    import { Optional } from '@stoplight/types';
    import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';
    import * as fs from 'fs';
    import * as path from '@stoplight/path';
    import * as process from 'process';
    import { createRequire } from 'module';
    import { fetch } from '@stoplight/spectral-runtime';
    import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
    import { bundleRuleset } from '@stoplight/spectral-ruleset-bundler';
    import { node } from '@stoplight/spectral-ruleset-bundler/presets/node';
    import { stdin } from '@stoplight/spectral-ruleset-bundler/plugins/stdin';
    import { builtins } from '@stoplight/spectral-ruleset-bundler/plugins/builtins';
    import { isError, isObject } from 'lodash';
    import * as commonjs from '@rollup/plugin-commonjs';
    import { ErrorWithCause } from 'pony-cause';

    async function getDefaultRulesetFile(): Promise<Optional<string>> {
        const cwd = process.cwd();
        for (const filename of await fs.promises.readdir(cwd)) {
            if (Ruleset.isDefaultRulesetFile(filename)) {
                return path.join(cwd, filename);
            }
        }

        return;
    }

    function isBasicRuleset(filepath: string): boolean {
        return /\.(json|ya?ml)$/.test(path.extname(filepath));
    }

    function isErrorWithCode(error: Error | (Error & { code: unknown })): error is Error & { code: string } {
        return 'code' in error && typeof error.code === 'string';
    }

    export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
        if (rulesetFile === void 0) {
            rulesetFile = await getDefaultRulesetFile();
        } else if (!path.isAbsolute(rulesetFile)) {
            rulesetFile = path.join(process.cwd(), rulesetFile);
        }

        if (rulesetFile === void 0) {
            throw new Error(
                'No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)',
            );
        }

        let ruleset: string;

        try {
            if (isBasicRuleset(rulesetFile)) {
                const migratedRuleset = await migrateRuleset(rulesetFile, {
                    format: 'esm',
                    fs,
                });

                rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');

                ruleset = await bundleRuleset(rulesetFile, {
                    target: 'node',
                    format: 'commonjs',
                    plugins: [
                        stdin(migratedRuleset, rulesetFile),
                        builtins(),
                        // sigh, 2021 and we still do not use ESM
                        (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
                        ...node({ fs, fetch }),
                    ],
                });
            } else {
                ruleset = await bundleRuleset(rulesetFile, {
                    target: 'node',
                    format: 'commonjs',
                    plugins: [
                        builtins(),
                        (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
                        ...node({ fs, fetch }),
                    ],
                });
            }
        } catch (e) {
            if (!isError(e) || !isErrorWithCode(e) || e.code !== 'UNRESOLVED_ENTRY') {
                throw e;
            }

            throw new ErrorWithCause(`Could not read ruleset at ${rulesetFile}.`, { cause: e });
        }

        return new Ruleset(load(ruleset, rulesetFile), {
            severity: 'recommended',
            source: rulesetFile,
        });
    }

    function load(source: string, uri: string): RulesetDefinition {
        const actualUri = path.isURL(uri) ? uri.replace(/^https?:\//, '') : uri;
        // we could use plain `require`, but this approach has a number of benefits:
        // - it is bundler-friendly
        // - ESM compliant
        // - and we have no warning raised by pkg.
        const req = createRequire(actualUri);
        const m: { exports?: RulesetDefinition } = {};
        const paths = [path.dirname(uri), __dirname];

        const _require = (id: string): unknown => req(req.resolve(id, { paths }));

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        Function('module, require', source)(m, _require);

        if (!isObject(m.exports)) {
            throw Error('No valid export found');
        }

        return m.exports;
    }




// github issue: https://github.com/stoplightio/spectral/issues/1956
*/


import {RulesetDefinition} from '@stoplight/spectral-core';
import {migrateRuleset} from '@stoplight/spectral-ruleset-migrator';
import * as fs from 'fs';
import * as path from 'path';

// get a ruleset from a configuration file that is yaml or json in the filesystem.
// needed this special workaround since the tool doesn't have a proper api to just say
// "load this conf file". It appears in a soon to be released version the api will be available.
// adapted/idea from:
//  - spectral-cli: https://github.com/stoplightio/spectral/blob/26284c7004d3b1d7c3ec2bd59910b66bfb3bd414/packages/cli/src/services/linter/utils/getRuleset.ts
//  - spectral-migrator: https://github.com/stoplightio/spectral/blob/756176f9c21cd0d7256172f6a83e71dda783ebdd/packages/ruleset-migrator/README.md
//  - spectral-action: https://github.com/stoplightio/spectral-action/blob/a1a5b82b44dd62223b98a133385dabeb12a274ef/src/getRuleset.ts
//  - on discord: https://discord.com/channels/841794018173648916/859895506271600670/904538079283515403
//  - on github issue: https://github.com/stoplightio/spectral/issues/1956
export async function getRulesetFromFile(configurationFile: string): Promise<RulesetDefinition | undefined> {
    // input is expected to be an already found configuration file and the string an absolute path to it.
    console.debug(`configuration file: ${configurationFile}`)

    // the json and yaml file have a different "handling"/"conversion" than a plain js file.
    // For now we are just supporting the json and yaml versions.
    if (/(json|ya?ml)$/.test(path.extname(configurationFile))) {
        console.debug("conf file is one of json | yml | yaml. trying to apply migrateRuleset...")

        return migrateRuleset(configurationFile, {format: "commonjs", fs})
            .then(source => {
                const m: { exports?: RulesetDefinition } = {}
                const paths = [path.dirname(configurationFile), __dirname]
                console.debug(`paths: ${paths}`)

                const _require = (id: string): unknown => require(require.resolve(id, {paths}))

                Function('module, require', source)(m, _require)

                return m.exports
            })
    } else {
        console.debug(`could not process configuration file.`)

        return undefined
    }
}

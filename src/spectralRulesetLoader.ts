import {RulesetDefinition} from '@stoplight/spectral-core';
import {migrateRuleset} from '@stoplight/spectral-ruleset-migrator';
import * as fs from 'fs';
import * as path from 'path';

import {debug} from "./logging";

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
    debug(`configuration file: ${configurationFile}`)

    // the json and yaml file have a different "handling"/"conversion" than a plain js file.
    // For now we are just supporting the json and yaml versions.
    if (/(json|ya?ml)$/.test(path.extname(configurationFile))) {
        debug("conf file is one of json | yml | yaml. trying to apply migrateRuleset...")

        return migrateRuleset(configurationFile, {format: "commonjs", fs})
            .then(source => {
                const m: { exports?: RulesetDefinition } = {}
                const paths = [path.dirname(configurationFile), __dirname]
                debug(`paths: ${paths}`)

                const _require = (id: string): unknown => require(require.resolve(id, {paths}))

                Function('module, require', source)(m, _require)

                return m.exports
            })
    } else {
        debug(`could not process configuration file.`)

        return undefined
    }
}

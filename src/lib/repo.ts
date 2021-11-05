import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

import * as FS from 'fs-extra';
import * as Yaml from 'js-yaml';
import * as Glob from 'glob-promise';

import * as Zod from 'zod';

import { exec } from './exec';

export const RepoSchema = Zod.object({
    name: Zod.string(),
    path: Zod.string(),
    remotes: Zod.object({
        name: Zod.string(),
        url: Zod.string()
    }).array()
});

export async function loadRepos(...patterns: string[]) {
    const repos = await Bluebird
        .map(patterns, pattern => Glob(pattern))
        .then(_.flatten)
        .map(path => FS.readFile(path, 'utf8'))
        .map(content => Yaml.loadAll(content))
        .map(hashes => hashes.map(hash => RepoSchema.parse(hash)))
        .then(_.flatten);

    return repos;
}
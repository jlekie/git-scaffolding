import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

import * as Chalk from 'chalk';

import * as Path from 'path';
import * as FS from 'fs-extra';

import * as Stream from 'stream';

import { loadRepos } from './repo';
import { exec } from './exec';

export interface BaseParams {
    stdout?: Stream.Writable;
}
export interface InitParams extends BaseParams {
    repoBasePath?: string;
    repoPatterns: string[];
    createGitmodulesConfig: boolean;
}
export async function init({ repoBasePath, repoPatterns, createGitmodulesConfig, stdout }: InitParams) {
    const repos = await loadRepos(...repoPatterns);

    await Bluebird.map(repos, async repo => {
        const repoPath = Path.resolve(repoBasePath ?? '.', repo.path);

        if (await FS.pathExists(repoPath)) {
            await exec(`git fetch --all --prune`, { cwd: repoPath, stdout })
        }
        else {
            const originRemote = repo.remotes.find(r => r.name == 'origin');
            if (!originRemote)
                throw new Error(`No origin remote specified for repo ${repo.name}`);
            
            await exec(`git clone ${repo.remotes[0].url}`, { stdout })
        }
    }, { concurrency: 1 });

    if (createGitmodulesConfig) {
        stdout?.write(Chalk.cyan('Writing .gitmodules config...'));

        const gitmodulesStream = FS.createWriteStream('.gitmodules');
        for (const repo of repos) {
            const resolvedPath = Path.posix.join(repo.path);

            gitmodulesStream.write(`[submodule "${repo.name}"]\n`);
            gitmodulesStream.write(`    path = ${resolvedPath}\n`);
            gitmodulesStream.write(`    url = ""\n`);
        }
        gitmodulesStream.close();
    }
}
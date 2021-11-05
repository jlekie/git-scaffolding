#!/usr/bin/env node
import 'source-map-support/register';

import { Builtins, Cli, Command, Option } from 'clipanion';

import { init } from './lib/actions';

abstract class BaseCommand extends Command {
    abstract execute(): Promise<number | void>;
}

class InitCommand extends BaseCommand {
    static paths = [['init']];

    repos = Option.Array('--repos', ['.repos/**/*.yml']);
    reposBasePath = Option.String('--repo-base-path')

    static usage = Command.Usage({
        description: 'Initialize repo',
        details: 'This will initialize the repo'
    });

    public async execute() {
        await init({
            repoBasePath: this.reposBasePath,
            repoPatterns: this.repos,
            stdout: this.context.stdout,
            createGitmodulesConfig: true
        });
    }
}

class TestCommand extends BaseCommand {
    static paths = [
        [ 'something' ]
    ];

    static usage = Command.Usage({
        description: 'Test command',
        details: 'This is a test command'
    });

    abc = Option.String({ required: false });

    async execute() {
        this.context.stdout.write('Testing');
    }
}

const [ node, app, ...args ] = process.argv;
const cli = new Cli({
    binaryName: 'git-scaffolding',
    binaryLabel: 'Git Scaffolding',
    binaryVersion: '1.0.0'
});

cli.register(TestCommand);
cli.register(InitCommand);

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(args);
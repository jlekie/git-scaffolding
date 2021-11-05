import * as Chalk from 'chalk';
import * as ChildProcess from 'child_process';
import * as Stream from 'stream';

interface ExecOptions {
    cwd?: string;
    stdout?: Stream.Writable;
}

export async function exec(cmd: string, { cwd, stdout }: ExecOptions = {}) {
    if (cwd)
        stdout?.write(Chalk.cyan(`Executing "${cmd}" [${cwd}]...\n`));
    else
        stdout?.write(Chalk.cyan(`Executing "${cmd}"...\n`));

    const proc = ChildProcess.spawn(cmd, { shell: true, cwd });

    return new Promise<void>((resolve, reject) => {
        proc.stdout.on('data', d => stdout?.write(Chalk.gray(d)));
        proc.stderr.on('data', d => stdout?.write(Chalk.gray(d)));

        proc.on('close', (code) => code !== 0 ? reject(new Error(`Exited with code ${code}`)) : resolve());
        proc.on('error', (err) => reject(err));
    });
}
export async function execCmd(cmd: string, { cwd, stdout }: ExecOptions = {}) {
    if (cwd)
        stdout?.write(Chalk.cyan(`Executing "${cmd}" [${cwd}]...\n`));
    else
        stdout?.write(Chalk.cyan(`Executing "${cmd}"...\n`));

    return new Promise<string>((resolve, reject) => {
        ChildProcess.exec(cmd, { cwd }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(stdout.trim());
        });
    });
}
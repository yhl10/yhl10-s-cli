#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const download = require('download-git-repo');
const shell = require('shelljs');

let globalAppName;
let globalOpts;

program.version('0.1.0');
program
    .command('init <app-name>')
    .description('create a new app')
    .option('-f, --force', 'overwrite target directory if it exist')
    .action((name, options) => {
        globalAppName = name;
        globalOpts = options;
    })

program.parse(process.argv);

const [, appName] = program.args;

if(!appName) {
    console.log(chalk.hex('#f90404')('app-name can not be undefined!'));
    process.exit(1);
}

const question = [
    {
        name: 'name',
        type: 'input',
        message: '来者何人：',
        validate(val) {
            if(val === '') {
                return '不说？';
            }
            return true;
        }
    },
    {
        name: 'password',
        type: 'input',
        message: '窗前明月光：',
        validate(val) {
            if(val === '') return '下一句？';
            return true;
        }
    },
    {
        name: 'choice',
        type: 'list',
        message: 'PHP是世界上最好的语言？',
        choices: [
            {
                name: '是的',
                value: '是的'
            },
            {
                name: '没错',
                value: '没错'
            }
        ]
    }
];

inquirer.prompt(question).then(answers => {
    const {name, password, choice} = answers;
    console.log(
        chalk.hex('#a6e22e')(
            `其实上面那些玩意并没什么用( •̀ ω •́ )✧\n`
        )
    );

    /* 接下来做以下的事 */
    operationDirIfForce(globalAppName, globalOpts.force, downloadProject);
})

function operationDirIfForce(appname, force, callback) {
    const cwd = process.cwd(); // 当前命令行所在目录
    const targetDir = path.join(cwd, appname) // 创建的项目目录
    if(fs.existsSync(targetDir)) {
        if(force === true) {
            callback && callback(targetDir);
        }else {
            console.log(chalk.hex('#f90404')('该目录已经存在，无法创建！'));
            process.exit(1);
        }
    }else {
        callback && callback(targetDir);
    }
}

function downloadProject(targetDir) {

    const spinner = ora(
        chalk.hex('#fb8901')('正在准备下载项目，稍安勿躁...\n')
    );
    
    spinner.start();
    
    // the third param: {clone: true}
    const url = 'yhl10/test-cli';
    download(url, appName, err => {
        if(err) {
            spinner.fail();
            console.log(chalk.hex('#f90404')(`坏了，出错了：${err}\n`));
            process.exit(1);
        }else {
            spinner.succeed();
            console.log(chalk.hex('#01fb07')('好了，下完了！\n'));
            console.log(chalk.hex('#a6e22e')('这句话看似没什么用，实际上真的没什么用。\n'));

            // 修改package.json里面的name字段
            const filename = `${targetDir}/package.json`;
            const contentString = fs.readFileSync(filename, 'utf-8');
            const contentObj = JSON.parse(contentString);
            contentObj.name = appName;
            fs.writeFileSync(filename, JSON.stringify(contentObj, null, 4));

            // 安装依赖
            console.log(
                chalk.hex('#fb8901')('正在下依赖，不要乱来...\n')
            );
            if(!shell.which('npm')) {
                shell.echo(chalk.hex('#f90404')('没npm、安不了、告辞！'));
                shell.exit(1);
            }else {
                shell.cd(targetDir);
                if(shell.exec('npm install').code !== 0) {
                    shell.echo(
                        chalk.hex('#f90404')('依赖安装失败，自己动手安算了！')
                    );
                    shell.exit(1);
                }else {
                    shell.echo(
                        chalk.hex('#01fb07')('依赖安装成功，自己玩吧！')
                    );
                    shell.exit(0);
                }
            }
        }
    });
}


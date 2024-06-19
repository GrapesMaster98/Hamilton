import {execSync} from 'child_process';
import { confirm, password } from '@inquirer/prompts';
import chalk from 'chalk';

const RunCommand = async command => {
    try {
        execSync(`${command}`, {stdio: 'inherit'});
    } catch (e) {
        console.error(`There was an error running the command: ${command}`, e);
        return false;
    }
    return true;
}

export const CreateProject = async (name, hasTS) => {

    const git = `git clone --depth 1 https://github.com/GrapesMaster98/Hamilton-Templates/tree/main/Regular ${name}`;
    const npminstall = `cd ${name} && npm install`;
    
    if(hasTS) {
        console.log('Creating project with Typescript...');
    } else {
        console.log(chalk.yellow('Cloning repository, this may take a while...'));
        let ch = RunCommand(git);
        if(!ch) {
            console.log(chalk.red('Failed to clone repository.'));
            process.exit(-1);
        }

        console.log(chalk.yellow('Cloned repository successfully. Installing dependencies...'));
        let deps = RunCommand(npminstall);
        if(!deps) {
            console.log(chalk.red('Failed to install dependencies.'));
            process.exit(-1);
        }

        console.log(chalk.green('Project created successfully!'));
        console.log(`To start the project, run: ${chalk.blue('cd ' + name + ' && npm run start')} \n\n ${chalk.green('Happy coding!')}`);
    }

}

export const Questions = async () => {
    
    const botoptions = {
        botName: await password({message: 'Please input your bot token:'}),
        useTS: await confirm({message: 'Would you like to use Typescript?', default: false}),
    }

    if(botoptions.useTS) {
        CreateProject(botoptions.botName, true);
    } else {
        CreateProject(botoptions.botName, false);
    }
}

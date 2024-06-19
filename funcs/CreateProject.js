import {execSync} from 'child_process';
import { confirm, input, password, select } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const RunCommand = async (command, cwd = '.') => {
    try {
        execSync(`${command}`, {stdio: 'inherit', cwd});
    } catch (e) {
        console.error(`There was an error running the command: ${command}`, e);
        return false;
    }
    return true;
}

const moveFiles = (sourceDir, targetDir) => {
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        fs.renameSync(sourcePath, targetPath);
    });
    fs.rmdirSync(sourceDir);
};

const createEnvFile = (dir, token, cid) => {
    const envContent = `TOKEN=${token}\nAPP_ID=${cid}\n`;
    const envPath = path.join(dir, '.env');
    fs.writeFileSync(envPath, envContent);
};

export const CreateProject = async (name, appId, useTS, useNoLint, botToken) => {
    const repo = 'https://github.com/GrapesMaster98/Hamilton-Templates.git';
    const folderMap = {
        Regular: 'Regular',
        TS: 'TS',
        NoLint: 'NoLint'
    };
    const selectedFolder = useTS ? folderMap.TS : (useNoLint ? folderMap.NoLint : folderMap.Regular);

    if (!selectedFolder) {
        console.log(chalk.red('Invalid template selected.'));
        process.exit(-1);
    }
    
    console.log(chalk.yellow(`Creating project with ${useTS ? 'TypeScript' : (useNoLint ? 'NoLint' : 'Regular')} template...`));

    try {
        console.log(chalk.yellow('Cloning repository. This may take a while...'));
        if (!RunCommand(`git init ${name}`)) throw new Error('Failed to initialize git repository');
        const projectDir = path.join(process.cwd(), name);
        if (!RunCommand(`git remote add origin ${repo}`, projectDir)) throw new Error('Failed to add remote repository');
        if (!RunCommand(`git config core.sparseCheckout true`, projectDir)) throw new Error('Failed to configure sparse-checkout');
        const sparseCheckoutConfig = path.join(projectDir, '.git', 'info', 'sparse-checkout');
        fs.writeFileSync(sparseCheckoutConfig, `${selectedFolder}/*`);
        if (!RunCommand(`git pull origin main`, projectDir)) throw new Error('Failed to pull from remote repository');

        const sourceDir = path.join(projectDir, selectedFolder);
        if (!fs.existsSync(sourceDir)) {
            throw new Error(`The specified folder '${selectedFolder}' does not exist in the repository`);
        }
        
        console.log(chalk.yellow('Repository cloned. Moving files...'));        
        moveFiles(sourceDir, name);

        console.log(chalk.yellow('Files moved sucesfully. Installing dependencies...'));
        if (!RunCommand(`npm install`, projectDir)) throw new Error('Failed to install dependencies');
        createEnvFile(projectDir, botToken, appId);

        console.log();
        console.log(chalk.green('Project created successfully!'));
        console.log();
        console.log(`To start the project, run: ${chalk.blueBright('cd ' + name + ' && npm run dev')}, this will deploy your project with a placeholder command.`);
        console.log();
        console.log(`Or you can start coding now by using ${chalk.green('cd ' + name)}!`)
        console.log();
        console.log(chalk.green('Thanks for using Hamilton! Happy coding! :D'));
        
    } catch (e) {
        console.log(chalk.red('Failed to create project.'));
        console.error(`There was an error while creating the project:`, e);
        process.exit(-1);
    }

}

export const Questions = async (projectName) => {
    const botoptions = {
        botToken: await password({ message: 'Please input your bot token:' }),
        appId: await input({ message: 'Please input your APP ID:' }),
        template: await select({
            message: 'Which template would you like to use?',
            choices: [
                { name: 'Regular', value: 'Regular' },
                { name: 'TypeScript', value: 'TS' },
                { name: 'No Eslint', value: 'NoLint' }
            ]
        })
    };

    const useTS = botoptions.template === 'TS';
    const useNoLint = botoptions.template === 'NoLint';
    CreateProject(projectName, botoptions.appId, useTS, useNoLint, botoptions.botToken);
}
